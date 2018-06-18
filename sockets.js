const shuffle = require('lodash/shuffle')
const range   = require('lodash/range')
const times   = require('lodash/times')
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

  const revealCard = (choosedCard, game) => {
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

  const updateCards = (game) => {
    game.users.map(user => {
      const cards = user.isCaptain ? game.cards : game.shareableCards
      io.to(user.socketId).emit('cardsUpdate', cards)
    })
    console.log('==> cardsUpdate', game.users.length)
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
      hasBegan: false,
      turn: firstTeam,
      users: [],
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

    socket.on('userConnect', function(newUser){
      console.log('<== userConnect:', newUser)
      newUser.isCaptain = game.users
        .filter(user => user.team === newUser.team )
        .length === 0
      newUser.choosedCard = {}
      newUser.socketId  = socket.id
      newUser.isOnline  = true
      game.users.push(newUser)
      user = newUser

      console.log('usersUpdate', game.users)
      io.to(gameId).emit('usersUpdate', game.users)
      const turnUpdate = {turn: game.turn, delay: 0}
      console.log('==> turnUpdate', turnUpdate)
      socket.emit('turnUpdate', turnUpdate)
      updateCards(game)
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
        game.users[userIndex].isOnline = true
        game.users[userIndex].socketId = socket.id
        console.log('==> userUpdate', game.users)
        io.to(gameId).emit('usersUpdate', game.users)
        const turnUpdate = {turn: game.turn, delay: 0}
        console.log('==> turnUpdate', turnUpdate)
        socket.emit('turnUpdate', turnUpdate)
        user = game.users[userIndex]
      }
      updateCards(game)
    })

    socket.on('userStartGame', function(){
      if (user.isCaptain) {
        games[gameId] = newGame(gameId)
        game = games[gameId]
        io.to(gameId).emit('usersUpdate', game.users)
        io.to(gameId).emit('cardsUpdate', game.cards)
        const turnUpdate = {turn: game.turn, delay: 0}
        io.to(gameId).emit('turnUpdate', turnUpdate)
      }
      socket.emit('startGame')
    })


    socket.on('userChooseCard', function(cardName){
      console.log('<== userChooseCard', cardName)
      if (user.isCaptain)
        return

      const choosedCard = findCard(cardName, game)

      if (user.team === game.turn && !choosedCard.isRevealed) {
        user.choosedCard = choosedCard

        if (isTurnOver(game)) { // all players choosed one card
          revealCard(choosedCard, game)
          updateCards(game, user, socket)

          game.winner = checkWinner(choosedCard, game)
          if(game.winner) {
            console.log('==> winnerUpdate', game.winner)
            io.to(gameId).emit('winnerUpdate', game.winner)
          } else if (choosedCard.team !== game.turn) {
            game.turn = nextTeam(game)
            const turnUpdate = {turn: game.turn, delay: 1000}
            console.log('==> turnUpate', turnUpdate)
            io.to(gameId).emit('turnUpdate', turnUpdate)
          }
        }
        console.log('==> usersUpdate', game.users)
        io.to(gameId).emit('usersUpdate', game.users)
      }
    })


    socket.on('userEndTurn', function(){
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