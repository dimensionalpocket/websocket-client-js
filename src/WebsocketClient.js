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
     * @type {?WebSocket}
     */
    this.socket = null
  }

  /**
   * @async
   * Connects to the websocket.
   *
   * @returns {boolean|Promise<boolean>}
   */
  connect () {
    if (this.socket) {
      console.error('WebsocketClient#connect: already connected')
      return false
    }

    // const socket = new WebSocket(this.getUrl())

    return true
  }

  getUrl () {
    const protocol = this.secure ? 'wss' : 'ws'
    const port = this.port !== 80 ? `:${this.port}` : ''
    return `${protocol}://${this.host}${port}`
  }
}
