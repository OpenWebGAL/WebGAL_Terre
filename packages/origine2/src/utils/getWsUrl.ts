export function getWsUrl(route:string):string{
  const loc: string = window.location.hostname;
  const protocol: string = window.location.protocol;
  const port: string = window.location.port; // 获取端口号

  // 默认情况下，不需要在URL中明确指定标准HTTP(80)和HTTPS(443)端口
  let defaultPort = '';
  if (port && port !== '80' && port !== '443') {
    // 如果存在非标准端口号，将其包含在URL中
    defaultPort = `:${port}`;
  }

  if (protocol !== 'http:' && protocol !== 'https:') {
    return '';
  }

  // 根据当前协议构建WebSocket URL，并包括端口号（如果有）
  let wsUrl = `ws://${loc}${defaultPort}/${route}`;
  if (protocol === 'https:') {
    wsUrl = `wss://${loc}${defaultPort}/${route}`;
  }

  return wsUrl;
}
