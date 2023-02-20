# @dimensionalpocket/websocket-client

An opinionated WebSocket client that internally uses the browser's `WebSocket` global.

It is tailored to connect to servers running [@dimensionalpocket/websocket-server-js](https://github.com/dimensionalpocket/websocket-server-js), having the following expectations:

- The websocket server is running at the `/server` endpoint.
- There is an HTTP endpoint at the root `/` endpoint with a simple status page.

The client will default to the above values, but they can be customized during initialization.

## Features

- Can be initialized without trying to connect to the server.
- Same instance can be reused after disconnects, without losing listeners.
- Uses `ArrayBuffer` for binary messages.

## Usage

```javascript
import { WebsocketClient } from '@dimensionalpocket/websocket-client'

// Initializes a client, without connecting yet.
// All arguments are optional and have the defaults below.
const websocketClient = new WebsocketClient({
  host: "localhost",
  port: 80,
  websocketPath: "/server",
  httpPath: "/",
  secure: false // if not given, will try to auto-detect based on window.location.protocol
})

// Called whenever a connection is established, even after reconnects.
websocketClient.on('connect', (client, event) => {
  // In this example, whenever the socket is connected,
  // send some authentication request
  console.log('Connected; authenticating...')
  client.json(['authenticate', 'username', 'token'])
})

// Called when a message is received from the server.
// If isBinary is true, message will be an ArrayBuffer, otherwise a string.
websocketClient.on('message', (message, isBinary, client, event) => {
  console.log('Received message from server', isBinary, message)
})

// Called when the client disconnects.
// Disconnection codes: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code
websocketClient.on('disconnect', (code, reason, client, event) => {
  console.log('Disconnected', code, reason)
  // you can call client.connect() here to reconnect based on code, etc
})

// Called when the client fails to connect.
websocketClient.on('error', (client, event) => {
  console.error('An error happened', event)
})

// Connects to the server.
// This method is async, returning true if connection is successful.
// Will return false if already connected, or throw an error if connection fails.
await websocketClient.connect()

// Sends a string to the server.
websocketClient.send('some string')

// Sends an object as a JSON string to the server.
websocketClient.json({my: "object"})

// Disconnects from the websocket server with a (optional) code and reason.
// Does not trigger reconnects.
// The client can be reused afterwards.
websocketClient.disconnect(3000, 'Closed manually')
```

## The HTTP endpoint

WebSocket servers running [@dimensionalpocket/websocket-server-js](https://github.com/dimensionalpocket/websocket-server-js) provide an HTTP endpoint for keep-alive/health checks.

To keep this library small, it does not provide such ping mechanisms (which would require bundling a HTTP client), but the client instance has a `getHttpUrl()` method which an external HTTP client can use to hit the server.

## Usage in Node

This library expects a `WebSocket` global variable to exist. If the code is running in a browser, the native implementation will be used.

In Node environments, that global doesn't exist, so it must be injected manually.

This can be done with a package like [`isomorphic-ws`](https://github.com/heineiuo/isomorphic-ws). First install it alongside `ws`:

```
> npm i isomorphic-ws ws
```

_(If running in development/test only, add `-D` to the command above to install them as development dependencies.)_

Then create a file to inject `WebSocket` in the global scope:

```javascript
import WebSocket from 'isomorphic-ws'

globalThis.WebSocket = WebSocket
```

Finally, require the above file once, before running Node scripts/tests that use this library.

## License

MIT
