import WebSocket from 'isomorphic-ws'

// @ts-ignore - This is used in Node only
// but jsconfig is using "dom" lib which causes TS to choke on itself
globalThis.WebSocket = WebSocket
