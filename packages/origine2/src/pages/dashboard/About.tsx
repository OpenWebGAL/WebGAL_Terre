import * as React from 'react';
import { __INFO } from "@/config/info";
import { useRelease } from "../../hooks/useRelease";
import { Button, Link, Popover, PopoverSurface, PopoverTrigger, Text, Title1, ToolbarButton } from '@fluentui/react-components';
import { InfoFilled, InfoRegular, bundleIcon } from '@fluentui/react-icons';
import { useState } from 'react';
import { t } from '@lingui/macro';
import { dateTimeOptions } from './DashBoard';

const InfoIcon = bundleIcon(InfoFilled, InfoRegular);

const About: React.FunctionComponent = () => {
  const [open, setOpen] = useState(false);

  const latestRelease = useRelease();

  return (
    <Popover
      withArrow
      trapFocus
      open={open}
      onOpenChange={() => setOpen(!open)}
    >
      <PopoverTrigger disableButtonEnhancement>
        <ToolbarButton aria-label={t`关于`} icon={<InfoIcon />}>
          {t`关于`}
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
              {t`当前版本`}: {`${__INFO.version} (${__INFO.buildTime.toLocaleString('zh-CN', dateTimeOptions).replaceAll('/', '-')})`}<br />
              {
                latestRelease &&
                <span>
                  {t`最新版本`}: {`${latestRelease.version} (${new Date(latestRelease.releaseTime).toLocaleString('zh-CN', dateTimeOptions).replaceAll('/', '-')})`}
                </span>
              }
              <p>
                {
                  latestRelease?.hasNewVersion &&
                  <Button appearance="primary" size="small" as="a" href="https://openwebgal.com/download/" target="_blank">
                    {t`获取最新版本`}
                  </Button>
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
