import EventEmitter from 'eventemitter3'
import { detectSecure } from './utils/detect-secure.js'

export class WebsocketClient extends EventEmitter {
  /**
   * @param {object} [options]
   * @param {string} [options.host] - Defaults to "localhost"
   * @param {number} [options.port] - Defaults to 80
   * @param {string} [options.websocketPath] - Defaults to "/server"
   * @param {string} [options.httpPath] - Defaults to "/"
   * @param {boolean} [options.secure] - When not provided, will try to auto-detect based on window.location
   */
  constructor (options = undefined) {
    super()

    /**
     * @type {string}
     */
    this.host = options?.host || 'localhost'

    /**
     * @type {number}
     */
    this.port = options?.port || 80

    /**
     * @type {string}
     */
    this.websocketPath = options?.websocketPath || '/server'

    /**
     * @type {string}
     */
    this.httpPath = options?.httpPath || '/'

    /**
     * @type {boolean}
     */
    this.secure = options?.secure ?? detectSecure()

    /**
     * Current WebSocket.
     * Will only be set for non-closed websocket states.
     *
     * @type {?WebSocket}
     */
    this.socket = null

    // Bound callbacks for easier reassignment/cleanup on WebSocket instances
    this._onWebsocketOpen = this.onWebsocketOpen.bind(this)
    this._onWebsocketMessage = this.onWebsocketMessage.bind(this)
    this._onWebsocketClose = this.onWebsocketClose.bind(this)
    this._onWebsocketError = this.onWebsocketError.bind(this)
  }

  /**
   * @async
   * Connects to the websocket.
   *
   * @returns {boolean|Promise<boolean>} -  `true` if connection is successful.
   */
  connect () {
    if (this.socket) {
      console.error('WebsocketClient#connect: already connected')
      return false
    }

    return new Promise((resolve, reject) => {
      const successFn = () => {
        this.removeListener('error', failureFn, this, true)
        resolve(true)
      }

      const failureFn = (/** @type {Event} */ event) => {
        this.removeListener('connect', successFn, this, true)
        reject(event)
      }

      this.once('connect', successFn, this)
      this.once('error', failureFn, this)

      this.socket = this.createSocket()
    })
  }

  createSocket () {
    const socket = new WebSocket(this.getWebsocketUrl())

    socket.addEventListener('open', this._onWebsocketOpen)
    socket.addEventListener('message', this._onWebsocketMessage)
    socket.addEventListener('close', this._onWebsocketClose)
    socket.addEventListener('error', this._onWebsocketError)

    return socket
  }

  /**
   * Destroys current closed socket.
   * Automatically called when socket is closed or fails to connect.
   *
   * @returns {boolean} `true` if the existing socket was destroyed.
   */
  destroySocket () {
    const socket = this.socket

    if (!socket) {
      console.warn('WebsocketClient#destroySocket: no socket to destroy')
      return false
    }

    if (socket.readyState !== WebSocket.CLOSED) {
      console.warn('WebsocketClient#destroySocket: socket is still open')
      return false
    }

    socket.removeEventListener('open', this._onWebsocketOpen)
    socket.removeEventListener('message', this._onWebsocketMessage)
    socket.removeEventListener('close', this._onWebsocketClose)
    socket.removeEventListener('error', this._onWebsocketError)

    this.socket = null

    return true
  }

  getWebsocketUrl () {
    const protocol = this.secure ? 'wss' : 'ws'
    const port = this.port !== 80 ? `:${this.port}` : ''
    return `${protocol}://${this.host}${port}${this.websocketPath}`
  }

  getHttpUrl () {
    const protocol = this.secure ? 'https' : 'http'
    const port = this.port !== 80 ? `:${this.port}` : ''
    return `${protocol}://${this.host}${port}${this.httpPath}`
  }

  /**
   * @param {Event} event
   */
  onWebsocketOpen (event) {
    this.emit('connect', event, this)
  }

  /**
   * @param {MessageEvent} event
   */
  onWebsocketMessage (event) {
    this.emit('message', event.data, event, this)
  }

  /**
   * @param {Event} event
   */
  onWebsocketClose (event) {
    this.destroySocket()
    this.emit('disconnect', event, this)
  }

  /**
   * @param {Event} event
   */
  onWebsocketError (event) {
    this.destroySocket()
    this.emit('error', event, this)
  }
}
