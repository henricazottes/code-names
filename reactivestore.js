/**
 * ReactiveStore is used to bind an jquery elements to a websocket event.
 *
 */

module.exports = class ReactiveStore {

  /**
   * getData() return a data object containing all datas the given selector is
   * watching.
   *
   * @param {string} selector
   */
  __getData(selector){
    const copy = {}
    const data = Object.entries(this.__store)
      .reduce((acc, [dataName, description]) => {
        description.connections.map(connection => {
          if(connection.selector === selector) {
            acc[dataName] = description.value
          }
        })
        return acc
      }, {})
    $.extend(true, copy, data)
    return copy
  }

  /**
   * updateConnections() call callback of each connection associated to the
   * updated data.
   *
   */

  __updateConnections(dataName) {
    this.__store[dataName].connections.map(({ selector, cb } ) => {
      cb({ selector, data: this.__getData(selector) })
    })
  }

  constructor({socket, store = {}, updateHandler }) {
    if(!$){
      throw '[ReactiveStore Error]: JQuery not available'
    } else {
      this.__socket = socket
      this.__store = store
      if (typeof updateHandler === 'function'){
        this.__updateHandler = updateHandler
      } else {
        throw '[ReactiveStore Error]: udpateHandler is not a function'
      }
      this.getStore = () => ({ ...this.__store })
    }
  }

  /**
   * bind() a dataName to a websocket event name
   *
   */

  bind(bonds){
    Object.entries(bonds).map(([dataName, description]) => {
      this.__store[dataName] = { connections: [] }
      this.__store[dataName].event = description.event
      this.__store[dataName].value = description.value
      this.__socket.on(`${description.event}`, data => {
        this.__store[dataName].value = data
        this.__updateHandler(this.getStore(), dataName)
        this.__updateConnections(dataName, data)
      })
    })
  }

  /**
   * connect() updates the list of items affected by a data update.
   *
   * @param {Array<string>} dataNames data the selector is watching
   * @param {string} selector JQuery selector
   * @param {function} cb called when one of the data is updated
   */
  connect(dataNames, selector, cb){
    dataNames.map(dataName => {
      if(this.__store[dataName]) {
        this.__store[dataName].connections.push({
          selector,
          cb
        })
        cb({this: $(selector), data: this.__getData(selector)})
      } else {
        throw `[ReactiveStore Error]: trying to connect '${dataName}' data `
              + 'which is not bond yet.'
      }
    })
  }
}