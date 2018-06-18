
import nameLine from './components/nameLine.pug'
import boardTemplate from './components/board.pug'
import winnerModal from './components/winnerModal.pug'

import isEqual from 'lodash/isEqual'
import ReactiveStore from '../../reactivestore.js'

localStorage.debug = ''

$( document ).ready(function() {
  
  const socket = io()
  const local = JSON.parse(sessionStorage.getItem('local')) || {}
  console.log("Local loaded:", { ...local })
  const currentId = location.href.split('/').reverse()[0]

  const store = new ReactiveStore({
    socket,
    updateHandler: (store, dataName) => console.log(`${dataName} updated.`)
  })

  store.bind(
    {
      totos: {
        event: 'updateTotos',
        value: []
      }
    }
  )

  store.connect(['totos'], '#totos', ({ selector, data }) => {
    $(selector).html(data.totos)
  })

  
  const updateCardClickability = () => {
    if (local.turn === local.user.team) {
      if (!local.user.isCaptain) {
        $('.game-card').css('cursor', 'pointer')
      }
      $('#endTurn > button').prop('disabled', false)
      $('#endTurn > button').click(() => {
        console.log('==> userEndTurn')
        socket.emit('userEndTurn')
      })
    } else {
      $('.game-card').css('cursor', 'default')    
      $('#endTurn > button').prop('disabled', true)
    }
  }
  
  const updateEndTurnVisibility = () => {
    if (local.user.isCaptain) {
      $('#endTurn').show()
    } else {
      $('#endTurn').hide()
    }
  }
  
  const findCard = (cardName) => {
    const cards = local.cards
    let card
    cards.map(col => {
      col.map(row => {
        if(row.word.fr === cardName)
          card = row
      })
    })
    return card
  }
  
  socket.on('turnUpdate', ({turn, delay}) => {
    console.log('<== turnUpdate', {turn, delay})
    const updateTurn = (turn) => () => {
      $(`.${turn}Turn`).show()
      $(`.${nextTeam(turn)}Turn`).hide()
      storeInfos({ turn })
      updateCardClickability()
    }
    setTimeout(updateTurn(turn), delay)
  })
  
  socket.on('winnerUpdate', winner => {
    console.log('<== winnerUpdate', winner)
    $('#winnerModal').append(winnerModal({team: local.user.team, isWinner: winner === local.user.team }))  
    $('#winnerModal > .modal').modal('show')
  })
  
  socket.on('cardsUpdate', cards => {
    console.log('<== cardsUpdate', cards)
    $('#board').empty().append(boardTemplate({ cards, isCaptain: local.user && local.user.isCaptain }))
    if (!local.user.isCaptain) {
      $('.game-card').click(function(){
        console.log('==> userChooseCard', $(this).children().html())
        socket.emit('userChooseCard', $(this).children().html())
      })
    }
  
    updateCardClickability()
    updateEndTurnVisibility()
  
    if (local.cards) {
      cards.map((row, i) => {
        row.map((card, j) => {
          if (!local.cards[i][j].isRevealed && card.isRevealed) {
            $(`#word-${card.word.fr}`).animate({'opacity': '0'}, 500, () => {
              $(`#word-${card.word.fr}`).addClass('revealed')
              $(`#word-${card.word.fr}`).css({'background-color': '', 'color': ''})
              $(`#word-${card.word.fr}`).animate({'opacity': '1'}, 500)
            })
          } else if(cards[i][j].isRevealed) {
            $(`#word-${card.word.fr}`).addClass('revealed')
          }
        })
      })
    } else {
      cards.map((row, i) => {
        row.map((card, j) => {
          if(cards[i][j].isRevealed) {
            $(`#word-${card.word.fr}`).addClass('revealed')
          }
        })
      })
    }
  
    storeInfos({ cards })
  })
  
  socket.on('connect', () => {
    console.log('<== connect')
    storeInfos({ user: { ...local.user, socketId: socket.id } })
  })
  
  socket.on('usersUpdate', users => {
    console.log('<== usersUpdate', users)
    $(`#blueTeam`).empty()
    $(`#orangeTeam`).empty()
  
    users.map((user, i) => {
      if (user.socketId === local.user.socketId) {
        const localChoosedCard = local.user.choosedCard || {}
        if (!isEqual(localChoosedCard, user.choosedCard)) {
          const prevWord = localChoosedCard.word || {}
          const newWord = user.choosedCard.word || {}
          $(`#word-${prevWord.fr}`).css({'background-color': '', 'color': ''})
          $(`#word-${newWord.fr}`).css({'background-color': '#55efc4', 'color': 'white'})
        }
        storeInfos({ user })
      }
      const element = nameLine({
        name: user.name,
        me: user.socketId === local.user.socketId,
        isOnline: user.isOnline,
        isCaptain: user.isCaptain
      })
      $(`#${user.team}Team`).append(element)
    })

    if(!local.user.isOnline) {
      $('.nameInputWrapper').show()
    }
  
    updateEndTurnVisibility()
    updateCardClickability()
  })
  
  const storeInfos = infos => {
    Object.keys(infos).map(key => local[key] = infos[key])
    sessionStorage.setItem('local', JSON.stringify(local))
  }
  
  const nextTeam = (team) => {
    return team === 'blue' ? 'orange' : 'blue'
  }
  
  const getJoinHandler = prefix => () => {
    const name = $(`#${prefix}NameInput`).val()
    const team = prefix === 'blue' ? 'blue' : 'orange'
    $('.nameInputWrapper').hide()
    const user = { name, socketId: socket.id, team }
    console.log('==> userConnect', user)
    socket.emit('userConnect', user)
  }
  
  const validOnEnterPressed = prefix => key => {
    if(key.which === 13)
      $(`#${prefix}Join`).click()
  }
  
  $('#blueJoin').click(getJoinHandler('blue'))
  $('#blueNameInput').keypress(validOnEnterPressed('blue'))
  $('#orangeJoin').click(getJoinHandler('orange'))
  $('#orangeNameInput').keypress(validOnEnterPressed('orange'))
  
  
  if (local.id !== currentId) {
    storeInfos({id: currentId, user: {}})  
  } else {
    if (local.user.team) {
      $('.nameInputWrapper').hide()
      console.log('==> userReconnect', local.user.socketId)
      socket.emit('userReconnect', local.user.socketId)
      storeInfos({ turn: undefined })
    }
  }
});


