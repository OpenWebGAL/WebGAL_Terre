export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.5.8',
  buildTime: '2024-11-03T16:28:55.197Z', // 编译时会通过 version-sync.js 自动更新
};
