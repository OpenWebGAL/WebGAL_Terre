export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.4.7',
  buildTime: '2023-12-23T13:07:56.047Z', // 编译时会通过 version-sync.js 自动更新
};
