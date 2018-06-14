
import nameLine from './components/nameLine.pug'
import boardTemplate from './components/board.pug'
import winnerModal from './components/winnerModal.pug'

localStorage.debug = ''

const socket = io()
const local = JSON.parse(sessionStorage.getItem('local')) || {}
console.log("Local loaded:", {...local})
const currentId = location.href.split('/').reverse()[0]

const updateCardClickability = () => {
  if (local.turn === local.user.team) {
    if (!local.user.isCaptain) {
      $('.game-card').css('cursor', 'pointer')
      $('.game-card').click(function(){
        console.log('==> userChooseCard', this.innerHTML)
        socket.emit('userChooseCard', this.innerHTML)
      })
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


socket.on('turnUpdate', turn => {
  console.log('<== turnUpdate', turn)
  $(`.${turn}Turn`).show()
  $(`.${nextTeam(turn)}Turn`).hide()
  storeInfos({ turn })
  updateCardClickability()
})

socket.on('winnerUpdate', winner => {
  console.log('<== winnerUpdate', winner)
  $('#winnerModal').append(winnerModal({team: local.user.team, isWinner: winner === local.user.team }))  
  $('#winnerModal > .modal').modal('show')
})

socket.on('cardsUpdate', cards => {
  console.log('<== cardsUpdate', cards)
  $('#board').empty().append(boardTemplate({ cards, isCaptain: local.user && local.user.isCaptain }))
  updateCardClickability()
  updateEndTurnVisibility()
  $('.orange-card').css('color', '#ff7675')
  $('.orange-card.revealed').css({'background-color': '#ff7675', 'color': 'white'})

  $('.blue-card').css('color', '#74b9ff')
  $('.blue-card.revealed').css({'background-color': '#74b9ff', 'color': 'white'})

  $('.witness-card').css('color', '#fdcb6e')
  $('.witness-card.revealed').css({'background-color': '#fdcb6e', 'color': 'white'})

  $('.looser-card').css('color', '2d3436')
  $('.looser-card.revealed').css({'background-color': '#2d3436', 'color': 'white'})
})

socket.on('connect', () => {
  console.log('<== connect')
  storeInfos({ user: { ...local.user, socketId: socket.id } })
})

socket.on('usersUpdate', users => {
  console.log('<== usersUpdate', users)
  users.sort((a, b) => a.name > b.name)
  $(`#blueTeam`).empty()
  $(`#orangeTeam`).empty()

  users.map((user, i) => {
    if (user.socketId === local.user.socketId) {
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

$('#blueJoin').click(getJoinHandler('blue'))
$('#orangeJoin').click(getJoinHandler('orange'))

if (local.id !== currentId) {
  storeInfos({id: currentId, user: {}})  
} else {
  if (local.user.team) {
    $('.nameInputWrapper').hide()
    console.log('==> userReconnect, local.user.socketId')
    socket.emit('userReconnect', local.user.socketId)
  }
}


