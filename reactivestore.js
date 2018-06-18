/**
 * ReactiveStore is used to bind an jquery elements to a websocket event.
 *
 */

module.exports = class ReactiveStore {

  /**
   * getData() return a data object containing all datas the given  is
   * watching.
   *
   */
  __getPublicStoreCopy(store){
    const copy = {}
    const data = Object.entries(store)
      .reduce((acc, [dataName, description]) => {
        acc[dataName] = description.value
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
    this.__store[dataName].connections.map( cb => {
      cb({
        prev: this.__getPublicStoreCopy(this.__prevStore),
        store: this.__getPublicStoreCopy(this.__store)
      })
    })
  }

  constructor({socket, store = {}, updateHandler }) {
    if(!$){
      throw '[ReactiveStore Error]: JQuery not available'
    } else {
      this.__socket = socket
      this.__store = {}
      this.__prevStore = {}
      $.extend(true, this.__store, store)
      $.extend(true, this.__prevStore, store)
      if (typeof updateHandler === 'function'){
        this.__updateHandler = updateHandler
      } else {
        throw '[ReactiveStore Error]: udpateHandler is not a function'
      }
      this.getStore = () => {
        const store = {}
        $.extend(true, store, this.__store)
        return store
      }
    }
  }

  /**
   * bind() a dataName to a websocket event name
   *
   */

  bind(bonds){
    Object.entries(bonds).map(([dataName, description]) => {
      this.__store[dataName] = { connections: [] }
      this.__prevStore[dataName] = {}
      this.__store[dataName].event = description.event

      // Priority to the loaded store, not to the default value
      if(!this.__store[dataName].value) {
        this.__store[dataName].value = description.default
      }
      $.extend(true, this.__prevStore[dataName], this.__store[dataName])
      this.__socket.on(`${description.event}`, data => {
        $.extend(true, this.__prevStore[dataName].value, this.__store[dataName].value)
        this.__store[dataName].value = data
        this.__updateHandler(this.getStore(), dataName)
        this.__updateConnections(dataName)
      })
    })
  }

  /**
   * connect() updates the list of items affected by a data update.
   *
   * @param {Array<string>} dataNames data the connection is watching
   * @param {function} cb called when one of the data is updated
   */
  connect(dataNames, cb){
    dataNames.map(dataName => {
      if(this.__store[dataName]) {
        this.__store[dataName].connections.push(cb)
        cb({
          prev: this.__getPublicStoreCopy(this.__prevStore, 'prev'),
          store: this.__getPublicStoreCopy(this.__store, 'new')
        })
      } else {
        throw `[ReactiveStore Error]: trying to connect '${dataName}' data `
              + 'which is not bond yet.'
      }
    })
  }
}