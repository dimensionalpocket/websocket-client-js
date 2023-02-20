import { expect } from '@dimensionalpocket/development'
import { detectSecure } from '../../src/utils/detect-secure.js'

describe('detectSecure()', function () {
  context('when window object is not available', function () {
    it('returns false', function () {
      expect(detectSecure()).to.eq(false)
    })
  })

  context('when window object is available', function () {
    after(function () {
      // @ts-ignore
      delete globalThis.window
    })

    context('and location protocol is http', function () {
      before(function () {
        // @ts-ignore
        globalThis.window = { location: { protocol: 'http:' } }
      })

      it('returns false', function () {
        expect(detectSecure()).to.eq(false)
      })
    })

    context('and location protocol is https', function () {
      before(function () {
        // @ts-ignore
        globalThis.window = { location: { protocol: 'https:' } }
      })

      it('returns true', function () {
        expect(detectSecure()).to.eq(true)
      })
    })
  })
})
