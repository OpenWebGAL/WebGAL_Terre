export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.4.8',
  buildTime: '2023-12-29T15:07:42.592Z', // 编译时会通过 version-sync.js 自动更新
};
