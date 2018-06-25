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

  const updateUsers = (game, socketId) => {
    console.log('==> usersUpdate', game.users)
    if (socketId) {
      io.to(socketId).emit('usersUpdate', game.users)
    } else {
      io.to(game.id).emit('usersUpdate', game.users)
    }
  }

  const updateUser = (game, socketId) => {
    const user = game.users.find(user => user.socketId === socketId)
    console.log('==> userUpdate', user)
    io.to(socketId).emit('userUpdate', user)
  }

  const updateReady = (game, socketId) => {
    console.log('==> readyUpdate', game.ready)
    if (socketId) {
      io.to(socketId).emit('readyUpdate', game.ready)
    } else {
      io.to(game.id).emit('readyUpdate', game.ready)
    }
  }

  const updateCards = (game, socketId) => {
    console.log('socket id:', socketId)
    let cards
    const sendCardsTo = (socketId, user) => {
      cards = (user && user.isCaptain) ? game.cards : game.shareableCards
      io.to(socketId).emit('cardsUpdate', cards)
    }
    if (socketId) {
      const user = game.users.find(user => user.socketId === socketId)
      sendCardsTo(socketId, user)
    } else {
      game.users.map(user => {
        sendCardsTo(user.socketId, user)
      })
    }
    console.log('==> cardsUpdate', cards.length)
  }

  const updateTurn = (game, socketId, delay) => {
    // Handle [socketId] parameter
    const newDelay = delay ? delay : socketId
    const newSocketId = socketId && delay ? socketId : undefined
    const turnUpdate = {turn: game.turn, delay: newDelay}
    console.log('==> turnUpdate', turnUpdate)
    if(newSocketId) {
      io.to(newSocketId).emit('turnUpdate', turnUpdate)
    } else {
      io.to(game.id).emit('turnUpdate', turnUpdate)
    }
  }

  const updatePlaying = (game, socketId) => {
    console.log('==> playingUpdate', game.playing)
    if(socketId) {
      io.to(socketId).emit('playingUpdate', game.playing)
    } else {
      io.to(game.id).emit('playingUpdate', game.playing)
    }
  }

  const updateWinner = (game, socketId) => {
    console.log('==> winnerUpdate', game.winner, game.playing)
    if(socketId) {
      io.to(socketId).emit('winnerUpdate', game.winner)
    } else {
      io.to(game.id).emit('winnerUpdate', game.winner)
    }
  }

  const initialUpdate = (game, user) => {
    // Order is important
    updateUser(game, user.socketId)
    updateUsers(game, user.socketId)
    updateWinner(game, user.socketId)
    updateReady(game, user.socketId)
    updatePlaying(game, user.socketId)
    if(teamsAreReady(game)) {
      updateCards(game, user.socketId)
      updateTurn(game, user.socketId, 0)
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
      playing: false,
      turn: firstTeam,
      users: [],
      ready: [],
      teams: ['orange','blue'],
      winner: undefined,
      cards,
      shareableCards: shareableCards
    }
  }

  const restartedGame = game => {
    const _game = newGame(game.id)
    _game.users = game.users
    return _game
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
    updateUsers(game, socket.id)

    socket.on('userConnect', function(userInfos){
      console.log('<== userConnect:', userInfos)
      user = createUser(game, userInfos)
      game.users.push(user)
      updateUsers(game)
      initialUpdate(game, user)
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
        initialUpdate(game, user)
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
          updateCards(game)
          game.winner = checkWinner(choosedCard, game)
          if(game.winner) {
            updateWinner(game)
            resetUserChoosedCard(game)
            games[gameId] = restartedGame(game)
            Object.assign(game, games[gameId])
            game.users.map(user => initialUpdate(game, user))
          } else if (choosedCard.team !== game.turn) {
            game.turn = nextTeam(game)
            updateTurn(game, 1000)
          }
        }
        updateUser(game, user.socketId)
        updateUsers(game)
      }
    })

    socket.on('userReady', function() {
      console.log('<== userReady')
      if(!game.ready.includes(user.team)){
        game.ready.push(user.team)
        updateReady(game)
        if(teamsAreReady(game)){
          console.log('==? Start game')
          game.playing = true
          updatePlaying(game)
          updateCards(game)
          updateTurn(game)
        }
      }
    })


    socket.on('userEndTurn', function(){
      console.log('<== userEndTurn')
      if (user.team === game.turn && user.isCaptain) {
        game.turn = nextTeam(game)
        resetUserChoosedCard(game)
        updateTurn(game)
        updateUsers(game)
      }
    })
  })
}