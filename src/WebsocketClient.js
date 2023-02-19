import EventEmitter from 'eventemitter3'
import { detectSecure } from './utils/detect-secure.js'

export class WebsocketClient extends EventEmitter {
  /**
   * @param {object} [options]
   * @param {string} [options.host] - Defaults to "localhost"
   * @param {?number} [options.port] - Defaults to null (no port in server URL)
   * @param {string} [options.websocketPath] - Defaults to "/server"
   * @param {string} [options.httpPath] - Defaults to "/"
   * @param {boolean} [options.secure] - When not provided, will try to auto-detect based on window.location.protocol
   */
  constructor (options = undefined) {
    super()

    /**
     * @type {string}
     */
    this.host = options?.host || 'localhost'

    /**
     * Port number. When not set, will omit the port to the URL.
     *
     * @type {?number}
     */
    this.port = options?.port || null

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
     * Current websocket.
     * Will only be present for non-closed socket states.
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
   * Connects to the websocket server.
   *
   * @returns {Promise<boolean>} - `true` if connection is successful,
   *                               `false` if already connected,
   *                               Promise rejection on errors.
   */
  connect () {
    if (this.socket) {
      console.error('WebsocketClient#connect: already connected')
      return Promise.resolve(false)
    }

    return new Promise((resolve, reject) => {
      // Create two temporary one-time listeners to fulfill the Promise.
      // If any of them is called, remove the other one.
      const successFn = () => {
        this.removeListener('disconnect', failureFn, this, true)
        resolve(true)
      }

      const failureFn = (/** @type {Event} */ event) => {
        this.removeListener('connect', successFn, this, true)
        reject(event)
      }

      this.once('connect', successFn, this)
      this.once('disconnect', failureFn, this)

      this.socket = this.createSocket()
    })
  }

  createSocket () {
    const socket = new WebSocket(this.getWebsocketUrl())

    // Default is "blob", but we want an ArrayBuffer instead.
    socket.binaryType = 'arraybuffer'

    socket.addEventListener('open', this._onWebsocketOpen)
    socket.addEventListener('message', this._onWebsocketMessage)
    socket.addEventListener('close', this._onWebsocketClose)
    socket.addEventListener('error', this._onWebsocketError)

    return socket
  }

  /**
   * Destroys current closed socket.
   * Automatically called when socket is closed.
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
    const port = (this.port !== null) ? `:${this.port}` : ''
    return `${protocol}://${this.host}${port}${this.websocketPath}`
  }

  getHttpUrl () {
    const protocol = this.secure ? 'https' : 'http'
    const port = (this.port !== null) ? `:${this.port}` : ''
    return `${protocol}://${this.host}${port}${this.httpPath}`
  }

  /**
   * Called when the socket is connected successfully.
   *
   * @param {Event} event
   */
  onWebsocketOpen (event) {
    this.emit('connect', this, event)
  }

  /**
   * Called when the socket receives a message.
   *
   * @param {MessageEvent} event
   */
  onWebsocketMessage (event) {
    const data = event.data
    const isBinary = !!(data instanceof ArrayBuffer)

    this.emit('message', data, isBinary, this, event)
  }

  /**
   * Called when the socket is closed.
   *
   * @param {CloseEvent} event
   */
  onWebsocketClose (event) {
    this.destroySocket()
    this.emit('disconnect', event.code, event.reason, this, event)
  }

  /**
   * Called when an error happens in the socket.
   * It may or may not be an error that will cause a disconnect.
   *
   * @param {Event} event
   */
  onWebsocketError (event) {
    this.emit('error', this, event)
  }
}
