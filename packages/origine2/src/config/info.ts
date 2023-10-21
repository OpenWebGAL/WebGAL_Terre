export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.4.5.3',
  buildTime: '2023-10-21T16:25:00.971Z', // 编译时会通过 version-sync.js 自动更新
};
