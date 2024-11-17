export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.5.10',
  buildTime: '2024-11-17T12:04:20.507Z', // 编译时会通过 version-sync.js 自动更新
};
