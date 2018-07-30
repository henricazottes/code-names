import roomRow from './components/roomRow.pug'

$( document ).ready(function() {

  const socket = io()

  socket.on('roomListUpdate', roomList => {
    console.log('roomList update:', roomList)
    $('#roomList').html('')
    roomList.map(room => {
      $('#roomList').append(roomRow({ ...room }))
    })
  })

  $('.dropdown').dropdown()

  $('.item').click(function() {
    $('.item').removeClass('active')
    $('.tab').removeClass('active')
    const className = $(this).attr('class').split(/\s+/).find(className => {
      return className.includes('-item')
    })
    console.log('classname:', className)
    $(`.${className}`).addClass('active')
  })

  const roomId = Math.random().toString(36).substr(2,10)
  $('#roomId').val(roomId)
  $('#roomForm').attr('action', `/game/${roomId}`)

  $('#roomId').on('input', function(){
    console.log('roomid:')
    const roomId = $(this).val()
    $('#roomForm').attr('action', `/game/${roomId}`)
  })
})