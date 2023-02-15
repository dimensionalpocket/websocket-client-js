# @dimensionalpocket/websocket-client

An opinionated WebSocket client that internally uses the browser's `WebSocket` global.

## Features

- Can be initialized without trying to connect to the server.
- Same instance can be reused after disconnects, without losing listeners.

## Usage

```javascript
import { WebsocketClient } from '@dimensionalpocket/websocket-client'

// Initializes a client, without connecting yet
const websocketClient = new WebsocketClient({
  // A full url can be provided.
  url: "ws://localhost:8080/server",
  
  // When a url is not provided,
  // connection data can be provided separately.
  host: "localhost",
  port: 8080,
  path: "/server",
  
  // to use wss:// instead of ws://
  // if `null`, will try to auto-detect based on window.location
  secure: false
})

// Called when a connection is established, even after reconnects
websocketClient.on('connect', (client) => {
  // In this example, whenever the socket is connected,
  // send some authentication request
  console.log('Connected; authenticating...')
  client.sendObject(['authenticate', 'username', 'token'])
})

// Called when a message is received from the server
websocketClient.on('message', (message, isBinary, client) => {
  // If isBinary is true, message will be an ArrayBuffer
  // Otherwise a string
  console.log('Received message from server', isBinary, message)
})

// Called when the client disconnects.
// Disconnection codes: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code
websocketClient.on('disconnect', (event, client) => {
  console.log('Disconnected', event.code, event.reason)
})

// Called when the client disconnects due to an error.
websocketClient.on('error', (event, client) => {
  console.error('An error happened', event)
})

// Connects to the server.
// This method is async, returning self after it connects successfully.
await websocketClient.connect()

// Sends a string to the server.
websocketClient.send('string')

// Sends an object to the server.
// It will be transformed into a JSON string.
websocketClient.sendObject({my: "object"})

// Disconnects from the server. Does not trigger reconnects.
// The client can be reused afterwards.
websocketClient.disconnect()
```

## Usage in Node

This package reads from a `WebSocket` global variable. If the code is running in a browser, the native implementation will be used. 

In Node environments, the global doesn't exist, so it must be created manually. This can be done with a package like [`isomorphic-ws`](https://github.com/heineiuo/isomorphic-ws):

```
> npm i -D isomorphic-ws ws
```

Then create a file to inject the `Websocket` variable in the global scope:

```javascript
import WebSocket from 'isomorphic-ws'

globalThis.WebSocket = WebSocket
```

Then require it once, before running Node scripts that use this library.

## License

MIT
