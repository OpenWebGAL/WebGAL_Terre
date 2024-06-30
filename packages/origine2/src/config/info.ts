export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.5.3',
  buildTime: '2024-06-14T15:46:25.585Z', // 编译时会通过 version-sync.js 自动更新
};
