export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.4.5',
  buildTime: '2023-09-23T05:28:26.398Z', // 编译时会通过 version-sync.js 自动更新
};
