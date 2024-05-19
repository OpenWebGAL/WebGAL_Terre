export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.5.1',
  buildTime: '2024-05-10T02:34:46.185Z', // 编译时会通过 version-sync.js 自动更新
};
