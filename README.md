# @dimensionalpocket/websocket-client

An opinionated WebSocket client that internally uses the browser's `WebSocket` global.

It is tailored to connect to servers running [@dimensionalpocket/websocket-server-js](https://github.com/dimensionalpocket/websocket-server-js), having the following expectations:

- The websocket server is running at the `/server` endpoint.
- There is an HTTP endpoint at `/` with a simple status page.

The client will default to the above values, but they can be customized during initialization.

## Features

- Can be initialized without trying to connect to the server.
- Same instance can be reused after disconnects, without losing listeners.

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
websocketClient.on('connect', (event, client) => {
  // In this example, whenever the socket is connected,
  // send some authentication request
  console.log('Connected; authenticating...')
  client.sendObject(['authenticate', 'username', 'token'])
})

// Called when a message is received from the server.
websocketClient.on('message', (message, event, client) => {
  // If isBinary is true, message will be an ArrayBuffer
  // Otherwise a string
  console.log('Received message from server', message)
})

// Called when the client disconnects.
// Disconnection codes: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code
websocketClient.on('disconnect', (event, client) => {
  console.log('Disconnected', event.code, event.reason)
  // you can call client.connect() here to reconnect based on event.code, etc
})

// Called when the client disconnects due to an error.
websocketClient.on('error', (event, client) => {
  console.error('An error happened', event)
})

// Connects to the server.
// This method is async, returning a boolean based on connection success.
await websocketClient.connect()

// Sends a string to the server.
websocketClient.send('some string')

// Sends an object to the server.
// It will be transformed into a JSON string.
websocketClient.sendObject({my: "object"})

// Disconnects from the websocket server.
// Does not trigger reconnects.
// The client can be reused afterwards.
websocketClient.disconnect()
```

## Usage in Node

This implementation reads from a `WebSocket` global variable. If the code is running in a browser, the native implementation will be used.

In Node environments, the global doesn't exist, so it must be created manually. 

This can be done with a package like [`isomorphic-ws`](https://github.com/heineiuo/isomorphic-ws). First install it alongside `ws`:

```
> npm i -D isomorphic-ws ws
```

Then create a file to inject the `WebSocket` variable in the global scope:

```javascript
import WebSocket from 'isomorphic-ws'

globalThis.WebSocket = WebSocket
```

Finally, require the above file once, before running Node scripts/tests that use this library.

## License

MIT
