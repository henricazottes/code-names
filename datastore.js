/**
 * DataStore is used to bind an html element to a websocket event.
 * 
 * The html element must have a 'render-[event name]' attribute
 * with a function name as a value. This function is passed both
 * the jquery element corresponding to the html node and the
 * data from the websocket event.
 */

module.exports = class DataStore {
  __update(name, data){
    $(`[render-${name}]`).each(function(idx){
      const renderName = $(this).attr(`render-${name}`)
      let renderedData
      if(typeof window[renderName] === 'function'){
        renderedData = window[renderName]({ item: this, data })
      } else if (renderName === '') {
        renderedData = data
      }
    })
  }

  constructor(socket) {
    this.__socket = socket
  }

  connect(name, defaultValue){
    this.__update(name, defaultValue)
    this.__socket.on(`${name}`, (data) => {
      this.__update(name, data)
    })
  }
}