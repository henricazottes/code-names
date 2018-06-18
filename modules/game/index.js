
import nameLine from './components/nameLine.pug'
import boardTemplate from './components/board.pug'
import winnerModal from './components/winnerModal.pug'

import isEqual from 'lodash/isEqual'

localStorage.debug = ''

let storage = sessionStorage

$( document ).ready(function() {

  const socket = io()
  const local = JSON.parse(storage.getItem('local')) || {}
  console.log('Local loaded:', {...local})
  const currentId = location.href.split('/').reverse()[0]

  const updateClickability = () => {
    console.log('On update clickability')
    if (local.turn === local.user.team) {
      if (!local.user.isCaptain) {
        $('.game-card').css('cursor', 'pointer')
      }
      $('#action > button').prop('disabled', false)
    } else {
      $('.game-card').css('cursor', 'default')
      $('#action > button').prop('disabled', true)
    }
    const localReady = local.ready || []
    const localTeam = local.user && local.user.team
    const localCards = local.cards || []
    console.log('Locals:', localReady, localTeam, localCards)
    if(localCards.length === 0 && !localReady.includes(localTeam)) {
      console.log('On enable !')
      $('#action > button').prop('disabled', false)
    }
  }

  const updateReadyVisibility = () => {
    $('.team-ready').hide()
    console.log('local ready:', local.ready)
    local.ready && local.ready.map(team => {
      console.log('showing ', team)
      $(`#${team}Ready`).show()
      $(`#${team}Ready`).addClass('titi')
    })
  }

  const updateActionButton = () => {
    if(local.user && local.user.isCaptain) {
      if(local.ready && local.ready.includes(local.user.team) && local.cards && local.cards.length > 0) {
        $('#actionButton').html('End turn')
        $('#actionButton').click(() => {
          console.log('==> userEndTurn')
          socket.emit('userEndTurn')
        })
      } else {
        $('#actionButton').html('Ready')
        $('#actionButton').click(() => {
          console.log('==> userReady')
          socket.emit('userReady', local.user.team)
        })
      }
      $('#action').show()
    } else {
      $('#action').hide()
    }
  }

  socket.on('updateReady', ready => {
    console.log('<== updateReady', ready)
    storeInfos({ ready })
    updateReadyVisibility()
    updateActionButton()
    updateClickability()

    const localTeam = local.user && local.user.team
    console.log('localTeam:', localTeam)
    if (local.ready && !local.ready.includes(localTeam)) {
      console.log('action enable 3')
      $('#action > button').prop('disabled', false)
    }
  })

  socket.on('turnUpdate', ({turn, delay}) => {
    console.log('<== turnUpdate', {turn, delay})
    const updateTurn = (turn) => () => {
      $(`.${turn}Turn`).show()
      $(`.${nextTeam(turn)}Turn`).hide()
      storeInfos({ turn })
      updateClickability()
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
    $('#board').empty().append(boardTemplate({ cards, isCaptain: local.user && local.user.isCaptain })).show()
    if (!local.user.isCaptain) {
      $('.game-card').click(function(){
        console.log('==> userChooseCard', $(this).children().html())
        socket.emit('userChooseCard', $(this).children().html())
      })
    }

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

    updateClickability()
    updateActionButton()
  })

  socket.on('connect', () => {
    console.log('<== connect')
    storeInfos({ user: { ...local.user, socketId: socket.id } })
    updateReadyVisibility()
    updateActionButton()
    updateClickability()
  })

  socket.on('usersUpdate', users => {
    console.log('<== usersUpdate', users)
    $('#blueTeam').empty()
    $('#orangeTeam').empty()

    users.map(user => {
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

    updateActionButton()
    updateClickability()
  })

  const storeInfos = infos => {
    Object.keys(infos).map(key => local[key] = infos[key])
    storage.setItem('local', JSON.stringify(local))
  }

  const clearInfos = () => {
    storage.setItem('local', {})
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
    console.log('Diffrent ID')
    clearInfos()
    storeInfos({id: currentId, user: {}})
  } else {
    console.log('Same ID')
    if (local.user.team) {
      $('.nameInputWrapper').hide()
      console.log('==> userReconnect', local.user.socketId)
      socket.emit('userReconnect', local.user.socketId)
      storeInfos({ turn: undefined })
    }
  }
})


