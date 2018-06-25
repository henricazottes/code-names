const shuffle = require('lodash/shuffle')
const range   = require('lodash/range')
const times   = require('lodash/times')
const isEqual   = require('lodash/isEqual')
const words   = require('./words')

const games = {}

module.exports = (io) => {

  /**
   *  Utils
   */

  const pickFirstTeam = () => (Math.floor(Math.random() * 2) === 0) ? 'blue' : 'orange'


  const generateCards = ({ team, col = 5, row = 5 }) => {
    const teams = shuffle(['looser'].concat(times(8, ()=> 'blue'), times(8, () => 'orange'), times(7, () => 'witness'), team))
    const shuffledWords = shuffle(words)
    return range(row).map((r, i) => {
      return range(col).map((c, j) => {
        const index = row*i + j
        return {
          team: teams[index],
          word: shuffledWords[index],
          isRevealed: false
        }
      })
    })
  }


  const findCard = (cardName, game) => {
    const cards = game.cards
    let card
    cards.map(col => {
      col.map(row => {
        if(row.word.fr === cardName)
          card = row
      })
    })
    return card
  }


  const isTurnOver = (game) => {
    let isOver = true
    let choosedCard
    game.users.map(user => {
      if(user.team === game.turn && !user.isCaptain) {
        if (!choosedCard) {
          choosedCard = user.choosedCard
        }
        if (choosedCard !== user.choosedCard) {
          isOver = false
        }
      }
    })
    return isOver
  }


  const resetUserChoosedCard = (game) => {
    const users = game.users
    users.map(user => {
      if(user.team === game.turn) {
        user.choosedCard = {}
      }
    })
  }


  const nextTeam = (game) => {
    return game.turn === 'blue' ? 'orange' : 'blue'
  }


  const checkWinner = (choosedCard, game) => {
    let winner = undefined

    if (choosedCard.team === 'looser')
      return winner = nextTeam(game)

    const remainingCards = {
      blue: 0,
      orange: 0
    }
    game.cards.map(col => {
      col.map(card => {
        if (!card.isRevealed)
          remainingCards[card.team]++
      })
    })
    console.log('remaining cards:', remainingCards)
    if (!remainingCards.blue) {
      winner = 'blue'
    } else if (!remainingCards.orange) {
      winner = 'orange'
    }
    return winner
  }

  const updateShareableCards = (choosedCard, game) => {
    game.shareableCards.map(col => {
      col.map(card => {
        if(card.word.fr === choosedCard.word.fr) {
          card.team = choosedCard.team
          card.isRevealed = true
          choosedCard.isRevealed = true
        }
      })
    })
  }

  const teamsAreReady = (game) => {
    return (isEqual(game.ready.sort(), game.teams.sort()))
  }

  const checkTeamsReady = (cb, game) => {
    if(isEqual(game.ready.sort(), game.teams.sort())) {
      cb()
    } else {
      console.log('==! teams not ready')
    }
  }

  const updateCards = (game, user) => {
    checkTeamsReady(() => {
      let cards
      game.users.map(user => {
        cards = user.isCaptain ? game.cards : game.shareableCards
        io.to(user.socketId).emit('cardsUpdate', cards)
      })
      console.log('==> cardsUpdate', cards)
    }, game, user)
  }

  const updateTurn = (game, user, delay) => {
    checkTeamsReady(() => {
      const turnUpdate = {turn: game.turn, delay}
      console.log('==> turnUpdate', turnUpdate)
      io.to(game.id).emit('turnUpdate', turnUpdate)
    }, game, user)
  }

  const updateStarted = (game, user) => {
    console.log('==> startedUpdate', game.started)
    if(user) {
      io.to(user.socketId).emit('startedUpdate', game.started)
    } else {
      io.to(game.id).emit('startedUpdate', game.started)
    }
  }

  const createUser = (game, userInfos) => {
    const newUser = userInfos
    newUser.isCaptain = game.users
      .filter(user => user.team === newUser.team )
      .length === 0
    newUser.choosedCard = {}
    newUser.isOnline  = true
    return newUser
  }

  const newGame = (gameId) => {
    const firstTeam = pickFirstTeam()
    const cards = generateCards({ team: firstTeam })
    const shareableCards = cards.map(col => {
      return col.map(card => {
        return {
          word: card.word,
          team: undefined,
          isRevealed: false
        }
      })
    })

    return {
      id: gameId,
      started: false,
      turn: firstTeam,
      users: [],
      ready: [],
      teams: ['orange','blue'],
      winner: undefined,
      cards,
      shareableCards: shareableCards
    }
  }

  /**
   *  Sockets events
   */

  io.on('connection', function(socket){
    const gameId = socket.handshake.headers.referer.split('/').reverse()[0]

    if (!games[gameId]) {
      games[gameId] = newGame(gameId)
    }

    let game = games[gameId]
    let user = {}

    console.log('\n\nNew user in channel: ', gameId)
    socket.join(gameId)
    console.log('usersUpdate', game.users)
    socket.emit('usersUpdate', game.users)

    socket.on('userConnect', function(userInfos){
      console.log('<== userConnect:', userInfos)
      user = createUser(game, userInfos)
      game.users.push(user)

      console.log('==> userUpdate', user)
      socket.emit('userUpdate', user)

      console.log('==> usersUpdate', game.users)
      io.to(gameId).emit('usersUpdate', game.users)

      console.log('==> readyUpdate', game.ready)
      socket.emit('readyUpdate', game.ready)

      updateStarted(game, user)
      updateCards(game)
      updateTurn(game, user, 0)
    })


    socket.on('disconnect', (reason) => {
      console.log('<== disconnect:', reason, socket.id)
      const userIndex = game.users.findIndex(user => user.socketId === socket.id)
      if (userIndex >= 0 && game.users[userIndex].isOnline) {
        game.users[userIndex].isOnline = false
        io.to(gameId).emit('usersUpdate', game.users)
      }
    })


    socket.on('userReconnect', function(oldSocketId){
      console.log('<== userReconnect:', oldSocketId)
      const userIndex = game.users.findIndex(user => user.socketId === oldSocketId)
      console.log('User index:', userIndex)
      if (userIndex >= 0 && !game.users[userIndex].isOnline) {
        user = game.users[userIndex]
        game.users[userIndex].isOnline = true
        game.users[userIndex].socketId = socket.id

        console.log('==> userUpdate', user)
        socket.emit('userUpdate', user)

        console.log('==> usersUpdate', game.users)
        io.to(gameId).emit('usersUpdate', game.users)

        console.log('==> startedUpdate', game.started)
        socket.emit('startedUpdate', game.started)

        updateStarted(game, user)
        updateCards(game, user)
        updateTurn(game, user, 0)
      }
    })


    socket.on('userChooseCard', function(cardName){
      console.log('<== userChooseCard', cardName)
      if (user.isCaptain){
        return
      }

      const choosedCard = findCard(cardName, game)

      if (user.team === game.turn && !choosedCard.isRevealed) {
        user.choosedCard = choosedCard
        if (isTurnOver(game)) { // all players choosed one card
          updateShareableCards(choosedCard, game)
          updateCards(game, user)

          game.winner = checkWinner(choosedCard, game)
          if(game.winner) {
            console.log('==> winnerUpdate', game.winner)
            io.to(gameId).emit('winnerUpdate', game.winner)
          } else if (choosedCard.team !== game.turn) {
            game.turn = nextTeam(game)
            updateTurn(game, user, 1000)
          }
        }
        console.log('==> userUpdate', user)
        socket.emit('userUpdate', user)
        console.log('==> usersUpdate', game.users)
        io.to(gameId).emit('usersUpdate', game.users)
      }
    })

    socket.on('userReady', function() {
      console.log('<== userReady')
      if(!game.ready.includes(user.team)){
        game.ready.push(user.team)
        console.log('==> readyUpdate', game.ready)
        io.to(gameId).emit('readyUpdate', game.ready)
        if(teamsAreReady(game)){
          console.log('==? Start game')
          game.started = true
          updateCards(game, user)
          const turnUpdate = {turn: game.turn, delay: 0}
          console.log('==> turnUpdate', turnUpdate)
          io.to(gameId).emit('turnUpdate', turnUpdate)
          updateStarted(game)
        }
      }
    })


    socket.on('userEndTurn', function(){
      console.log('<== userEndTurn')
      if (user.team === game.turn && user.isCaptain) {
        game.turn = nextTeam(game)
        resetUserChoosedCard(game)
        const turnUpdate = {turn: game.turn, delay: 0}
        console.log('==> turnUpdate', turnUpdate)
        io.to(gameId).emit('turnUpdate', turnUpdate)
        console.log('==> usersUpdate', game.users)
        io.to(gameId).emit('usersUpdate', game.users)
      }
    })
  })
}