import { expect, sinon } from '@dimensionalpocket/development'
import { createServer } from '@dimensionalpocket/websocket-server/test/support/create-server.js'
import { createClient } from '../support/create-client.js'

describe('e2e/connect', function () {
  before(function (done) {
    sinon.spy(console, 'log')
    createServer(this, done)
  })

  after(function () {
    this.server.stop()
    // @ts-ignore
    console.log.restore()
  })

  context('when connection is successful', function () {
    before(async function () {
      // @ts-ignore
      createClient(this.server, this)
      // @ts-ignore
      this.result = await this.client.connect()
    })

    after(function () {
      this.client.disconnect()
    })

    it('returns true', function () {
      expect(this.result).to.eq(true)
    })

    it('sends a message to server', function (done) {
      const messageFromClient = 'some-message-from-client'
      this.server.once('message', (/** @type {WebsocketConnection} */ _connection, /** @type {any} */ message, /** @type {boolean} */ isBinary) => {
        expect(message).to.eq(messageFromClient)
        expect(isBinary).to.eq(false)
        done()
      })
      this.client.send(messageFromClient)
    })

    it('sends a json to server', function (done) {
      const messageFromClient = { message: 'some-message-from-client' }
      this.server.once('message', (/** @type {WebsocketConnection} */ _connection, /** @type {any} */ message, /** @type {boolean} */ isBinary) => {
        expect(message).to.eq(JSON.stringify(messageFromClient))
        expect(isBinary).to.eq(false)
        done()
      })
      this.client.json(messageFromClient)
    })

    it('receives a message from server', function (done) {
      const messageFromServer = 'some-message-from-server'
      this.client.once('message', (/** @type {any} */ message, /** @type {boolean} */ isBinary) => {
        expect(message).to.eq(messageFromServer)
        expect(isBinary).to.eq(false)
        done()
      })
      const firstConnectionFromServer = this.server.connections.entries().next().value[1]
      firstConnectionFromServer.send(messageFromServer)
    })
  })
})
