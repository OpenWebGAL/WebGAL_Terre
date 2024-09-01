export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.5.7',
  buildTime: '2024-08-17T14:10:41.796Z', // 编译时会通过 version-sync.js 自动更新
};
