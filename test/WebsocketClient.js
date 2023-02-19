import { expect } from '@dimensionalpocket/development'
import { WebsocketClient } from '../src/WebsocketClient.js'
import _ from 'lodash/collection.js'

describe('WebsocketClient', function () {
  describe('defaults', function () {
    before(function () {
      this.client = new WebsocketClient()
    })

    it('initializes host', function () {
      expect(this.client.host).to.eq('localhost')
    })

    it('initializes port', function () {
      expect(this.client.port).to.eq(80)
    })

    it('initializes websocketPath', function () {
      expect(this.client.websocketPath).to.eq('/server')
    })

    it('initializes httpPath', function () {
      expect(this.client.httpPath).to.eq('/')
    })

    it('initializes secure', function () {
      expect(this.client.secure).to.eq(false)
    })
  })

  describe('constructor', function () {
    before(function () {
      // FIXME: using samples may affect coverage report
      this.secure = _.sample([true, false])
      this.port = _.sample([null, 8080])
      this.client = new WebsocketClient({
        host: '0.0.0.0',
        port: this.port,
        websocketPath: '/serverz',
        httpPath: '/healthz',
        secure: this.secure
      })
    })

    it('initializes host', function () {
      expect(this.client.host).to.eq('0.0.0.0')
    })

    it('initializes port', function () {
      expect(this.client.port).to.eq(this.port)
    })

    it('initializes websocketPath', function () {
      expect(this.client.websocketPath).to.eq('/serverz')
    })

    it('initializes httpPath', function () {
      expect(this.client.httpPath).to.eq('/healthz')
    })

    it('initializes secure', function () {
      expect(this.client.secure).to.eq(this.secure)
    })
  })
})
