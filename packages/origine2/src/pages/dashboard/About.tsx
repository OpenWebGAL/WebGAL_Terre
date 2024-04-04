import * as React from 'react';
import { __INFO } from "@/config/info";
import { useRelease } from "../../hooks/useRelease";
import { logger } from '@/utils/logger';
import { Link, Popover, PopoverSurface, PopoverTrigger, Text, Title1, ToolbarButton } from '@fluentui/react-components';
import { Info24Filled, Info24Regular, bundleIcon } from '@fluentui/react-icons';
import { useState } from 'react';
import { t } from '@lingui/macro';

interface DateTimeFormatOptions {
  year: 'numeric' | '2-digit';
  month: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day: 'numeric' | '2-digit';
}

const About: React.FunctionComponent = () => {
  const [open, setOpen] = useState(false);
  const latestRelease = useRelease();

  const InfoIcon = bundleIcon(Info24Filled, Info24Regular);

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

  const isNewRelease = latestRelease && compareVersion(latestRelease.version, __INFO.version) === 1;

  isNewRelease && logger.info(`发现新版本：${latestRelease.version}`, latestRelease);

  const dateTimeOptions: DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };

  return (
    <Popover
      withArrow
      trapFocus
      open={open}
      onOpenChange={() => setOpen(!open)}
    >
      <PopoverTrigger disableButtonEnhancement>
        <ToolbarButton aria-label={t`关于`} icon={<InfoIcon />}>
          {t`关于`} {isNewRelease ? `(${t`检测到新版本`})` : ''}
        </ToolbarButton>
      </PopoverTrigger>
      <PopoverSurface>
        <div>
          <Text as='h1' block size={500}>
            WebGAL Terre
          </Text>
          <Text as='b' block>
            <p>{t`视觉小说编辑，再进化`}</p>
            <small>
              {t`当前版本`}: {`${__INFO.version} (${new Date(__INFO.buildTime).toLocaleString('zh-CN', dateTimeOptions).replaceAll('/', '-')})`}<br />
              {
                latestRelease &&
                <span>
                  {t`最新版本`}: {`${latestRelease.version} (${new Date(latestRelease.releaseTime).toLocaleString('zh-CN', dateTimeOptions).replaceAll('/', '-')})`}
                </span>
              }
              <p>
                {
                  isNewRelease &&
                  <Link href="https://openwebgal.com/download/" target="_blank">
                    {t`下载最新版本`}
                  </Link>
                }
              </p>
              <hr />
              <div >
                Powered by <Link href="https://github.com/OpenWebGAL" target="_blank" >WebGAL</Link> Framework
              </div>
              <div>
                Made with ❤ by <Link href="https://github.com/MakinoharaShoko" target="_blank" >Mahiru</Link>
              </div>
            </small>
          </Text>
          <div style={{display:'flex', gap:'0.5rem', marginTop:'1rem'}}>
            <Link href="https://openwebgal.com/" target="_blank">
              {t`项目主页`}
            </Link>
            <Link href="https://docs.openwebgal.com/" target="_blank">
              {t`文档`}
            </Link>
            <Link href="https://github.com/MakinoharaShoko/WebGAL_Terre" target="_blank">
              GitHub
            </Link>
          </div>
        </div>
      </PopoverSurface>
    </Popover>
  );
};

export default About;
