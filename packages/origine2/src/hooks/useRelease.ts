import { __INFO } from "@/config/info";
import { useState, useEffect } from "react";

export interface latestRelease {
  version: string,
  releaseTime: string,
}

export function useRelease() {

  const webgalTerreLatestApiUrl = 'https://api.github.com/repos/MakinoharaShoko/WebGAL_Terre/releases/latest';

  const [latestRelease, setLatestRelease] = useState<latestRelease | null>(null);

  const getRelease = async () => {
    const response = await fetch(webgalTerreLatestApiUrl);
    const releasedata = await response.json();
    return releasedata;
  };

  useEffect(() => {
    try {
      getRelease().then(
        releasedata => setLatestRelease(
          {
            version: releasedata.tag_name,
            releaseTime: releasedata.published_at,
          }
        )
      );
    } catch (error) {
      console.error(error);
    }
  }, []);

  return latestRelease;
};