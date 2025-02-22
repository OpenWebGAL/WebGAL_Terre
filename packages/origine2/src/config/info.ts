export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.5.11',
  buildTime: '2025-02-22T09:47:56.762Z', // 编译时会通过 version-sync.js 自动更新
};
