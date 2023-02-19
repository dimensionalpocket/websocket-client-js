import { expect } from '@dimensionalpocket/development'
import { WebsocketClient as WebsocketClientFromSrc } from '../src/WebsocketClient.js'
import { WebsocketClient } from '../index.js'

describe('main require', function () {
  it('exports WebsocketClient from src', function () {
    expect(WebsocketClient).to.equal(WebsocketClientFromSrc)
  })
})
