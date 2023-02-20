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
      expect(this.client.port).to.eq(null)
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
      this.secure = _.sample([true, false])
      this.client = new WebsocketClient({
        host: '0.0.0.0',
        port: 8080,
        websocketPath: '/serverz',
        httpPath: '/healthz',
        secure: this.secure
      })
    })

    it('initializes host', function () {
      expect(this.client.host).to.eq('0.0.0.0')
    })

    it('initializes port', function () {
      expect(this.client.port).to.eq(8080)
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

  describe('#getWebsocketUrl', function () {
    context('secure false + present port', function () {
      it('returns a URL with ws:// and port', function () {
        const client = new WebsocketClient({ port: 8080, secure: false })
        expect(client.getWebsocketUrl()).to.eq('ws://localhost:8080/server')
      })
    })

    context('secure false + no port', function () {
      it('returns a URL with ws:// without port', function () {
        const client = new WebsocketClient({ secure: false })
        expect(client.getWebsocketUrl()).to.eq('ws://localhost/server')
      })
    })

    context('secure true + present port', function () {
      it('returns a URL with wss:// and port', function () {
        const client = new WebsocketClient({ port: 8080, secure: true })
        expect(client.getWebsocketUrl()).to.eq('wss://localhost:8080/server')
      })
    })

    context('secure true + no port', function () {
      it('returns a URL with wss:// and port', function () {
        const client = new WebsocketClient({ secure: true })
        expect(client.getWebsocketUrl()).to.eq('wss://localhost/server')
      })
    })
  })

  describe('#getHttpUrl', function () {
    context('secure false + present port', function () {
      it('returns a URL with http:// and port', function () {
        const client = new WebsocketClient({ port: 8080, secure: false })
        expect(client.getHttpUrl()).to.eq('http://localhost:8080/')
      })
    })

    context('secure false + no port', function () {
      it('returns a URL with http:// without port', function () {
        const client = new WebsocketClient({ secure: false })
        expect(client.getHttpUrl()).to.eq('http://localhost/')
      })
    })

    context('secure true + present port', function () {
      it('returns a URL with https:// and port', function () {
        const client = new WebsocketClient({ port: 8080, secure: true })
        expect(client.getHttpUrl()).to.eq('https://localhost:8080/')
      })
    })

    context('secure true + no port', function () {
      it('returns a URL with https:// and port', function () {
        const client = new WebsocketClient({ secure: true })
        expect(client.getHttpUrl()).to.eq('https://localhost/')
      })
    })
  })
})
