export {};

declare global {
  interface Window {
    electronFuncs?: {
      steam?: {
        initialize: (appId?: string | number) => boolean | Promise<boolean>;
        unlockAchievement: (achievementId: string) => boolean | Promise<boolean>;
      };
      dialog?: {
        selectDirectory: (defaultPath?: string) => Promise<string | null>;
      };
    };
  }
}
