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

  const updateRoomList = (socketId) => {
    const roomList = Object.keys(games).map(gameId => ({
      roomId: gameId,
      userCounter: games[gameId].users.length,
      isPublic: games[gameId].isPublic
    }))
    console.log('==> roomListUpdate', roomList)
    if(socketId) {
      io.to(socketId).emit('roomListUpdate', roomList)
    } else {
      io.emit('roomListUpdate', roomList)
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

  const updateMessages = (game, socketId) => {
    console.log('==> messagesUpdate', game.messages)
    if(socketId) {
      io.to(socketId).emit('messagesUpdate', game.messages)
    } else {
      io.to(game.id).emit('messagesUpdate', game.messages)
    }
  }

  const initialUpdate = (game, user) => {
    // Order is important
    updateUser(game, user.socketId)
    updateUsers(game, user.socketId)
    updateWinner(game, user.socketId)
    updateReady(game, user.socketId)
    updatePlaying(game, user.socketId)
    updateMessages(game, user.socketId)
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

  const newGame = (gameId, isPublic, password) => {
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
      isPublic,
      password,
      playing: false,
      turn: firstTeam,
      users: [],
      guests: [],
      ready: [],
      teams: ['orange','blue'],
      winner: undefined,
      cards,
      messages: [],
      shareableCards: shareableCards
    }
  }

  const restartedGame = game => {
    const _game = newGame(game.id, game.isPublic)
    _game.users = game.users
    _game.guests = game.guests
    return _game
  }

  /**
   *  Sockets events
   */

  io.on('connection', function(socket){
    const gameId = socket.handshake.headers.referer.split('/').reverse()[0]
    console.log('Socket query:', socket.handshake.query)
    const status = socket.handshake.query.status
    const password = socket.handshake.query.password

    if(gameId.length > 0) {
      // In game

      if (!games[gameId]) {
        games[gameId] = newGame(gameId, status === 'public', password)
        updateRoomList()
      }

      let game = games[gameId]
      let user = game.users.find(user => user.socketId === socket.id) || {}
      let guest = game.guests.find(guest => guest.socketId === socket.id) || {}

      console.log('\n\nNew user in channel: ', gameId)
      socket.join(gameId)

      if(!guest.socketId && !user.socketId){
        guest = {
          socketId: socket.id,
          granted: false
        }
        game.guests.push(guest)
      }

      if(game.isPublic) {
        updateUsers(game, socket.id)
      // The room is private and the user is not connected yet (guest)

      } else if(guest.socketId) {
        socket.emit('accessUpdate', guest.isGranted ? 'granted' : 'pending')
      }

      socket.on('userLogin', function(password){
        if (password === game.password) {
          const guest = game.guests.find(guest => guest.socketId === socket.id)
          guest.isGranted = true
          socket.emit('accessUpdate', 'granted')
          updateUsers(game, socket.id)
        } else {
          socket.emit('accessUpdate', 'denied')
        }
      })

      socket.on('userConnect', function(userInfos){
        console.log('<== userConnect:', userInfos)
        const guest = game.guests.find(guest => guest.socketId === socket.id)

        if(!game.isPublic && !guest.isGranted) {
          return
        }

        user = createUser(game, userInfos)
        const guestIndex = game.guests.findIndex(socketId => {
          socketId === user.socketId
        })

        game.users.push(user)
        game.guests.splice(guestIndex, 1)
        updateUsers(game)
        updateRoomList()
        initialUpdate(game, user)
      })


      socket.on('disconnect', (reason) => {
        console.log('<== disconnect:', reason, socket.id)
        const userIndex = game.users.findIndex(user => user.socketId === socket.id)
        if (userIndex >= 0) {
          if(game.users[userIndex].isOnline) {
            game.users[userIndex].isOnline = false
            io.to(gameId).emit('usersUpdate', game.users)
          }
        } else {
          const guestIndex = game.guests.findIndex(socketId => {
            socketId === user.socketId
          })
          game.guests.splice(guestIndex, 1)
        }
        // All Users and Guests disconnected
        if(game.users.findIndex(user => user.isOnline) < 0
          && game.guests.length === 0) {
          delete games[game.id]
          updateRoomList()
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

      socket.on('userMessage', function(content){
        console.log('<== userMessage', content)
        if(user.isOnline) {
          console.log('Game messages:', game.messages)
          game.messages.push({
            username: user.name,
            content,
            socketId: user.socketId
          })
          console.log('Game messages:', game.messages)
          updateMessages(game)
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

    } else {
      // In lobby
      updateRoomList(socket.id)
    }
  })
}