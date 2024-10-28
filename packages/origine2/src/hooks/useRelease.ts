import { __INFO } from "@/config/info";
import { logger } from "@/utils/logger";
import useSWRImmutable from "swr/immutable";

export interface LatestRelease {
  version: string,
  releaseTime: string,
  hasNewVersion: boolean;
}

export function useRelease() {

  const webgalTerreLatestApiUrl = 'https://api.github.com/repos/OpenWebGAL/WebGAL_Terre/releases/latest';

  const latestReleaseFetcher = async (): Promise<LatestRelease | null> => {
    try {
      const response = await fetch(webgalTerreLatestApiUrl);
      switch (response.status) {
      case 200: {
        const response = await fetch(webgalTerreLatestApiUrl);
        const releasedata = await response.json();
        if (releasedata?.tag_name && releasedata?.published_at) {
          return {
            version: releasedata.tag_name,
            releaseTime: releasedata.published_at,
            hasNewVersion: compareVersion(releasedata.tag_name, __INFO.version) === 1,
          };
        } else {
          logger.error("发布版本解析失败");
          return null;
        };
      }
      case 403: {
        logger.error("GitHub API 访问限制");
        return null;
      }
      };
      logger.error("无法访问 GitHub API，请检查网络连接");
      return null;
    } catch (_) {
      logger.error("无法访问 GitHub API，请检查网络连接");
      return null;
    };
  };

  const { data, error, isLoading } = useSWRImmutable('latest-release', latestReleaseFetcher);

  const latestRelease = (data && !error && !isLoading) ? data : null;;

  /**
   * 比较版本号
   * @param latestVersion 最新版本
   * @param currentVersion 当前版本
   * @returns 1: 最新版本比当前版本高, -1: 最新版本比当前版本低，0: 版本相同
   */
  const compareVersion = (latestVersion: string, currentVersion: string) => {
    const versionToArray = (version: string) => version?.split('.')?.map(v => Number(v))??[0];

    const latestVersionArray = versionToArray(latestVersion);
    const currentVersionArray = versionToArray(currentVersion);
    const length = Math.max(latestVersionArray.length, currentVersionArray.length);

    for (let i = 0; i < length; i++) {
      if (!latestVersionArray[i]){
        latestVersionArray[i] = 0;
      }
      if (!currentVersionArray[i]){
        currentVersionArray[i] = 0;
      }
      if (latestVersionArray[i] > currentVersionArray[i]) {
        return 1;
      } else if (latestVersionArray[i] < currentVersionArray[i]) {
        return -1;
      }
    }
    return 0;
  };

  return latestRelease;
};
