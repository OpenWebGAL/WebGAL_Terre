export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.4.10',
  buildTime: '2023-12-30T03:22:49.651Z', // 编译时会通过 version-sync.js 自动更新
};
