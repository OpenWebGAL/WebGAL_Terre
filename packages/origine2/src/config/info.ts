export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.5.12',
  buildTime: '2025-03-01T14:52:34.009Z', // 编译时会通过 version-sync.js 自动更新
};
