export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.4.5.3',
  buildTime: '2023-10-02T14:22:19.999Z', // 编译时会通过 version-sync.js 自动更新
};
