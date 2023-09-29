import { __INFO } from "@/config/info";
import { logger } from "@/utils/logger";
import { useState, useEffect } from "react";

export interface LatestRelease {
  version: string,
  releaseTime: string,
}

export function useRelease() {

  const webgalTerreLatestApiUrl = 'https://api.github.com/repos/MakinoharaShoko/WebGAL_Terre/releases/latest';

  const [latestRelease, setLatestRelease] = useState<LatestRelease | null>(null);

  const getRelease = async (): Promise<LatestRelease | null> => {
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

  useEffect(() => {
    getRelease().then(
      releasedata => setLatestRelease(
        (releasedata?.version && releasedata?.releaseTime) ? releasedata : null
      )
    );
  }, []);

  return latestRelease;
};
