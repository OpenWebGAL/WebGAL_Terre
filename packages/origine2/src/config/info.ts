export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.5.3',
  buildTime: '2024-06-30T04:04:15.899Z', // 编译时会通过 version-sync.js 自动更新
};
