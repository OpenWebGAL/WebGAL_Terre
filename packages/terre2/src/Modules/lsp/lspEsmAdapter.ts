// import {
//   IWebSocket,
//   type WebSocketMessageReader,
//   type WebSocketMessageWriter,
// } from 'vscode-ws-jsonrpc';

let WebSocketMessageReader;
let WebSocketMessageWriter;
eval(`import('vscode-ws-jsonrpc')`).then((module) => {
  WebSocketMessageReader = module.WebSocketMessageReader;
  WebSocketMessageWriter = module.WebSocketMessageWriter;
});

export { WebSocketMessageReader, WebSocketMessageWriter };
