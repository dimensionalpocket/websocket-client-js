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

  // Upon connection, server will send a message with the connection UUID.
  // We then set the client's UUID to match.
  context.client.once('message', (/** @type {any} */ message, /** @type {boolean} */ _isBinary, /** @type {WebsocketClient} */ client, /** @type {MessageEvent} */ _event) => {
    const json = JSON.parse(message)
    if (json[0] === 'connection-uuid') {
      const oldUuid = client.uuid
      client.uuid = json[1]
      console.log('Client UUID changed from', oldUuid, 'to', client.uuid)
    }
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
