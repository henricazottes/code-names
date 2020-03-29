
import nameLine from './components/nameLine.pug'
import boardTemplate from './components/board.pug'
import winnerModal from './components/winnerModal.pug'
import otherMessage from './components/message.pug'
import myMessage from './components/myMessage.pug'


import isEqual from 'lodash/isEqual'
import ReactiveStore from '../../reactivestore.js'


$( document ).ready(function() {

  localStorage.debug = ''

  let storage = sessionStorage
  let local = JSON.parse(storage.getItem('local')) || {}

  const storeInfos = infos => {
    Object.keys(infos).map(key => local[key] = infos[key])
    storage.setItem('local', JSON.stringify(local))
  }

  const clearInfos = () => {
    local = {}
    storage.setItem('local', {})
  }

  const status = $('#infos').attr('status')
  const password = $('#infos').attr('password')
  const socket = io({ query: { status, password } })
  const currentId = location.href.split('/').reverse()[0]

  if (local.id !== currentId || !local.store.user ) {
    console.log('Diffrent ID')
    clearInfos()
    storeInfos({ store: {}, id: currentId })
  } else {
    console.log('Same ID')
    if (local.store.user.socketId) {
      console.log('==> userReconnect', local.store.user.socketId)
      socket.emit('userReconnect', local.store.user.socketId)
    }
  }

  const store = new ReactiveStore({
    socket,
    store: local.store,
    updateHandler: (store, dataName) => {
      console.log(`<== ${dataName} updated: `, store[dataName])
      storeInfos({ store })
    }
  })

  store.bind({
    users: {
      event: 'usersUpdate',
      default: []
    },
    user: {
      event: 'userUpdate',
      default: {}
    },
    cards: {
      event: 'cardsUpdate',
      default: []
    },
    ready: {
      event: 'readyUpdate',
      default: []
    },
    turn: {
      event: 'turnUpdate',
      default: {}
    },
    winner: {
      event: 'winnerUpdate',
      default: ''
    },
    teams: {
      event: 'teamsUpdate',
      default: []
    },
    playing: {
      event: 'playingUpdate',
      default: false
    },
    access: {
      event: 'accessUpdate',
      default: undefined
    },
    messages: {
      event: 'messagesUpdate',
      default: []
    }
  })

  storeInfos({ store: store.getStore() })
  console.log('Stored store', store.getStore())

  const nextTeam = (team) => {
    return team === 'blue' ? 'orange' : 'blue'
  }

  function validName(name, limit) {
    return  name.length > 0 && name.length <= limit
  }

  const getJoinHandler = prefix => () => {
    const input = $(`#${prefix}NameInput`)
    const name = input.val()
    const limit = input.attr('maxlength')

    if (validName(name, limit)){
      const team = prefix === 'blue' ? 'blue' : 'orange'
      $('.nameInputWrapper').hide()
      const user = { name, socketId: socket.id, team }
      console.log('==> userConnect', user)
      socket.emit('userConnect', user)
    }
  }

  const execOnEnterPressed = ({ cb }) => key => {
    console.log('key touched')
    if(key.which === 13 && !key.shiftKey) {
      console.log('Enter pressed: ', name)
      // $(buttonSelector).click()
      key.preventDefault()
      cb()
    }
  }

  store.connect(['access'], ({ store }) => {
    switch (store.access) {
      case 'pending':
        // Display password prompt
        $('#passwordModal').modal({closable: false}).modal('show')
        break
      case 'denied':
        // Display denied message
        $('#errorMessage').show()
        break
      case 'granted':
        $('#passwordModal').modal('hide')
        break
    }
  })

  store.connect(['playing'], ({ store }) => {
    $('#actionButton').off('click')
    if(store.playing) {
      $('.team-ready').hide()
      $('#actionButton').html('End turn')
      $('#actionButton').click(() => {
        console.log('==> userEndTurn')
        socket.emit('userEndTurn')
      })
    } else {
      $('#actionButton').html('Ready')
      $('#actionButton').click(() => {
        console.log('==> userReady')
        socket.emit('userReady')
      })
    }
  })

  store.connect(['messages'], ({ store }) => {
    $('#messages').empty()
    store.messages.map((message, i) => {
      const differentUser = i === 0
        || store.messages[i-1].socketId !== message.socketId

      if(differentUser) {
        $('#messages').append('<br/>')
      }

      if(message.socketId === store.user.socketId){
        $('#messages').append(myMessage({ content: message.content }))
      } else {
        let username
        if(differentUser){
          username = message.username
        }
        $('#messages').append(otherMessage({
          content: message.content,
          username
        }))
      }
    })
  })

  store.connect(['ready'], ({ store }) => {
    if(store.playing) {
      return
    }
    $('.team-ready').hide()
    store.ready.map(team => {
      $(`#${team}Ready`).show()
    })
    if (!store.ready.includes(store.user.team)) {
      $('#action > button').prop('disabled', false)
    } else {
      $('#action > button').prop('disabled', true)
    }
  })

  store.connect(['turn'], ({ store }) => {
    if(!store.playing) {
      return
    }
    const updateTurn = (turn) => () => {
      $(`.${turn}Turn`).show()
      $(`.${nextTeam(turn)}Turn`).hide()
    }
    setTimeout(updateTurn(store.turn.turn), store.turn.delay)
    if (store.turn.turn === store.user.team) {
      $('#action > button').prop('disabled', false)
      if (!store.user.isCaptain) {
        $('.game-card').css('cursor', 'pointer')
      }
    } else {
      $('#action > button').prop('disabled', true)
      $('.game-card').css('cursor', 'default')
    }
  })

  store.connect(['winner'], ({ store }) => {
    if(store.winner) {
      $('#winnerModal').append(winnerModal({
        team: store.user.team,
        isWinner: store.winner === store.user.team
      }))
      setTimeout(() => {
        $('#winnerModal > .modal').modal('show')
        $('.turnSelector').hide()
      }, 1000)
    }
  })

  store.connect(['cards'], ({ store, prev }) => {
    $('#board').empty().append(boardTemplate({
      cards: store.cards,
      isCaptain: store.user.isCaptain
    }))
    if(store.cards.length > 0) {
      $('#waitingMessage').hide()
    }
    if (!prev.cards[0]
      || prev.cards[0][0].word.fr !== store.cards[0][0].word.fr) {
      $('.game-card').css('opacity', '0')
      $('.game-card').animate({'opacity': '1'}, 1000)
      // Progressive animation
      // store.cards.map((row, i) => {
      //   row.map((card, j) => {
      //     setTimeout(() => {
      //       $(`#word-${card.word.fr.replace(/ /g, '')}`)
      //         .animate({'opacity': '1'}, 600)
      //     }, i*100 + j*(100/store.cards[0].length))
      //   })
      // })
    }
    $('#board').show()

    if (!store.user.isCaptain) {
      $('.game-card').click(function(){
        console.log('==> userChooseCard', $(this).children().html())
        socket.emit('userChooseCard', $(this).children().html())
      })
    }

    if (prev.cards.length > 0) {
      prev.cards.map((row, i) => {
        row.map((card, j) => {
          if (!card.isRevealed && store.cards[i][j].isRevealed) {
            $(`#word-${card.word.fr.replace(/ /g, '')}`)
              .animate({'opacity': '0'}, 500, () => {
                $(`#word-${card.word.fr.replace(/ /g, '')}`)
                  .addClass('revealed')
                $(`#word-${card.word.fr.replace(/ /g, '')}`)
                  .css({'background-color': '', 'color': ''})
                $(`#word-${card.word.fr.replace(/ /g, '')}`)
                  .animate({'opacity': '1'}, 500)
              })
          } else if(store.cards[i][j].isRevealed) {
            $(`#word-${card.word.fr.replace(/ /g, '')}`).addClass('revealed')
          }
        })
      })
    } else {
      store.cards.map((row, i) => {
        row.map((card, j) => {
          if(store.cards[i][j].isRevealed) {
            $(`#word-${card.word.fr.replace(/ /g, '')}`).addClass('revealed')
          }
        })
      })
    }

    if (store.turn.turn === store.user.team) {
      $('#action > button').prop('disabled', false)
      if (!store.user.isCaptain) {
        $('.game-card').css('cursor', 'pointer')
      }
    } else {
      $('#action > button').prop('disabled', true)
      $('.game-card').css('cursor', 'default')
    }
  })


  // Update user list
  store.connect(['users'], ({ store }) => {
    $('#blueTeam').empty()
    $('#orangeTeam').empty()
    const currentUser = store.user
    store.users.map(user => {
      const userLine = nameLine({
        name: user.name,
        me: user.socketId === store.user && store.socketId,
        isOnline: user.isOnline,
        isCaptain: user.isCaptain,
        socketId: user.socketId,
        showActions: currentUser
          ? (
            currentUser.isCaptain
          && currentUser.team == user.team
          && currentUser.socketId !== user.socketId
          )
          : false,
      })
      $(`#${user.team}Team`).append(userLine)
    })
    $('.item > .actions > button').click(function() {
      console.log('Button:', this)
      const action = $(this).attr('class')
      const socketId = $(this).parent().data('socketid')
      console.log(`==> ${action}`, socketId)
      socket.emit(action, socketId)
    })
  })

  // Update selected card color
  store.connect(['user'], ({ prev, store }) => {
    if (!store.user) {
      const kickMessage = document.createElement('p')
      kickMessage.textContent = 'You\'ve been kicked.'
      $('#genericModal').empty()
      $('#genericModal').append(kickMessage)
      $('#genericModal').modal({closable: true}).modal('show')
      return
    }

    if(store.user.isOnline){
      $('#messageInput').prop('disabled', false)
    }
    if(store.user.isCaptain) {
      $('#action').show()
    } else {
      $('#action').hide()
    }
    if(!store.user.name) {
      $('.nameInputWrapper').show()
    } else {
      $('.nameInputWrapper').hide()
    }

    const prevChoosedCard = prev.user.choosedCard || {}
    const choosedCard = store.user.choosedCard || {}
    if (!isEqual(prevChoosedCard, choosedCard)) {
      const prevWord = prevChoosedCard.word || {}
      const newWord = choosedCard.word || {}
      $(`#word-${prevWord.fr}`).css({'background-color': '', 'color': ''})
      $(`#word-${newWord.fr}`).css({'background-color': '#55efc4', 'color': 'white'})
    }
  })

  // Display inputs to join teams
  $('#blueJoin').click(getJoinHandler('blue'))
  $('#blueNameInput').keypress(execOnEnterPressed({
    inputSelector: '#blueNameInput',
    cb: () => { $('#blueJoin').click() }
  }))

  $('#orangeJoin').click(getJoinHandler('orange'))
  $('#orangeNameInput').keypress(execOnEnterPressed({
    inputSelector: '#orangeNameInput',
    cb: () => { $('#orangeJoin').click() }
  }))

  $('#passwordModal > div > button').on('click', function(){
    $('#errorMessage').hide()
    socket.emit('userLogin', $('#passwordModal > div > input').val())
  })

  $('#passwordModal > div > input').keypress(execOnEnterPressed({
    inputSelector: '#passwordModal > div > input',
    cb: () => { $('#passwordModal > div > button').click() }
  }))

  $('#messageInput').keypress(execOnEnterPressed({
    inputSelector: '#messageInput',
    limit: 2000,
    cb: () => {
      socket.emit('userMessage', $('#messageInput').val())
      $('#messageInput').val('')
    }
  }))
})


