export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.4.7',
  buildTime: '2023-10-28T09:57:19.863Z', // 编译时会通过 version-sync.js 自动更新
};
