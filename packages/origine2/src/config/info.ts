export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.4.7',
  buildTime: '2023-12-22T14:20:20.337Z', // 编译时会通过 version-sync.js 自动更新
};
