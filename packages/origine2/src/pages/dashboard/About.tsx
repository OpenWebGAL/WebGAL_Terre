import * as React from 'react';
import { Callout, Link, Text } from '@fluentui/react';
import { useBoolean, useId } from '@fluentui/react-hooks';
import { CommandBarButton } from '@fluentui/react/lib/Button';
import styles from './about.module.scss';
import { __INFO } from "@/config/info";
import { useRelease } from "../../hooks/useRelease";
import { logger } from '@/utils/logger';
import useTrans from '@/hooks/useTrans';

const About: React.FunctionComponent = () => {
  const [isCalloutVisible, { toggle: toggleIsCalloutVisible }] = useBoolean(false);
  const buttonId = useId('callout-button');
  const labelId = useId('callout-label');
  const descriptionId = useId('callout-description');

  const t = useTrans('editor.topBar.');

  const latestRelease = useRelease();
  const versionToNumber = (version: string) => Number(version.replace(/\./g, ''));
  // 是否有新版本
  const isNewRelease = versionToNumber(latestRelease.version) > versionToNumber(__INFO.version);
  isNewRelease && logger.info(`发现新版本：${latestRelease.version}`, latestRelease);

  return (
    <>
      <CommandBarButton
        className={styles.button}
        id={buttonId}
        onClick={toggleIsCalloutVisible}
        text={`${t('about.about')} ${isNewRelease ? `(${t('about.checkedForNewVersion')})` : ''}`}
        iconProps={{ iconName: 'Info' }}
      />
      {isCalloutVisible &&
        <Callout
          className={styles.callout}
          ariaLabelledBy={labelId}
          ariaDescribedBy={descriptionId}
          role="dialog"
          gapSpace={0}
          target={`#${buttonId}`}
          onDismiss={toggleIsCalloutVisible}
          setInitialFocus
        >
          <Text as="h1" block variant="xLarge" className={styles.title} id={labelId}>
            WebGAL Terre
          </Text>
          <Text block variant="medium" className={styles.info} id={descriptionId}>
            <p>{t('about.slogan')}</p>

            {t('about.currentVersion')}: {`${__INFO.version} (${new Date(__INFO.releaseTime).toLocaleString()})`}<br />
            {
              isNewRelease &&
              <span>
                {t('about.latestVersion')}: {`${latestRelease.version} (${new Date(latestRelease.releaseTime).toLocaleString()})`}
              </span>
            }
          </Text>

          <div className={styles.link_group}>
            <Link href="https://openwebgal.com/" target="_blank" className={styles.link}>
              {t('about.homePage')}
            </Link>
            <Link href="https://docs.openwebgal.com/" target="_blank" className={styles.link}>
              {t('about.document')}
            </Link>
            <Link href="https://github.com/MakinoharaShoko/WebGAL_Terre" target="_blank" className={styles.link}>
              GitHub
            </Link>
            {
              isNewRelease &&
              <Link href="https://openwebgal.com/download/" target="_blank" className={styles.link}>
                {t('about.downloadLatest')}
              </Link>
            }
          </div>
        </Callout>
      }
    </>
  );
};

export default About;
