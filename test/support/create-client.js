import { WebsocketClient } from '../../src/WebsocketClient.js'

/**
* Creates a client and sets it in the context.
*
* @param {WebsocketServer} server - Server the client will connect to
* @param {any} context
*/
export function createClient (server, context) {
  context.client = new WebsocketClient({ host: server.host, port: server.port })

  context.client.on('connect', (/** @type {WebsocketClient} */ client, /** @type {Event} */ _event) => {
    console.log('Client', client.uuid, 'connected')
  })

  context.client.on('message', (/** @type {any} */ message, /** @type {boolean} */ isBinary, /** @type {WebsocketClient} */ client, /** @type {MessageEvent} */ _event) => {
    console.log('Client', client.uuid, 'message', message, isBinary)
  })

  context.client.on('disconnect', (/** @type {number} */ code, /** @type {?string} */ reason, /** @type {WebsocketClient} */ client, /** @type {CloseEvent} */ _event) => {
    console.log('Client', client.uuid, 'disconnected', code, reason)
  })

  context.client.on('error', (/** @type {WebsocketClient} */ client, /** @type {Event} */ _event) => {
    console.log('Client', client.uuid, 'error')
  })
}
