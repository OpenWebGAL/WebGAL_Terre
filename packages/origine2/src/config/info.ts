export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.4.12',
  buildTime: '2024-04-21T13:58:52.414Z', // 编译时会通过 version-sync.js 自动更新
};
