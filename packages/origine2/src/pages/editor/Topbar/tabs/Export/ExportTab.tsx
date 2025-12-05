import TopbarTab from '@/pages/editor/Topbar/components/TopbarTab';
import { TabItem } from '@/pages/editor/Topbar/components/TabItem';
import { IconWithTextItem } from '@/pages/editor/Topbar/components/IconWithTextItem';
import s from './export.module.scss';
import AndroidIcon from 'material-icon-theme/icons/android.svg';
import { api } from '@/api';
import { Desktop24Filled, Desktop24Regular, Globe24Filled, Globe24Regular, bundleIcon } from '@fluentui/react-icons';
import useEditorStore from '@/store/useEditorStore';
import { t, Trans } from '@lingui/macro';
import {
  Link,
  Spinner,
  Toast,
  ToastBody,
  Toaster,
  ToastIntent,
  ToastTitle,
  useId,
  useToastController,
} from '@fluentui/react-components';
import { useRef, type ReactNode } from 'react';
import useOsInfo from '@/hooks/useOsInfo';

export function ExportTab() {
  const gameDir = useEditorStore.use.subPage();
  const GlobeIcon = bundleIcon(Globe24Filled, Globe24Regular);
  const DesktopIcon = bundleIcon(Desktop24Filled, Desktop24Regular);
  const toasterId = useId('toaster');
  const { dispatchToast, dismissAllToasts } = useToastController(toasterId);
  const timeCurrent = useRef(0);
  const { data: osInfo } = useOsInfo();

  const exeShowcaseHint = (
    <div>
      <div>
        <Trans>
          发布的游戏可以在 <Link href="https://www.openwebgal.com/games/" target="_blank" rel="noreferrer">
          https://www.openwebgal.com/games/
          </Link> 展示，欢迎分享你的作品！
        </Trans>
      </div>
      <div>
        <Link href="https://docs.openwebgal.com/showcase-your-game" target="_blank" rel="noreferrer">
          {t`查看展示到 WebGAL 主页的指引`}
        </Link>
      </div>
    </div>
  );

  const startExport = () => {
    timeCurrent.current = Date.now();
    dispatchToast(
      <Toast>
        <ToastBody>
          <Spinner size="small" label={t`导出中...`} />
        </ToastBody>
      </Toast>,
      {
        intent: 'info',
      },
    );
  };

  const notify = (intent: ToastIntent = 'success', extra?: ReactNode) => {
    dismissAllToasts();
    dispatchToast(
      <Toast>
        <ToastTitle action={<Link onClick={() => dismissAllToasts()}>{t`关闭`}</Link>}>{t`提示`}</ToastTitle>
        <ToastBody subtitle={`${t`耗时`}：${Date.now() - timeCurrent.current} ms`}>
          <div>{intent === 'success' ? t`导出成功！` : t`导出失败！`}</div>
          {intent === 'success' && extra}
        </ToastBody>
      </Toast>,
      { intent },
    );
  };
  return (
    <>
      <TopbarTab>
        <TabItem title={t`导出`}>
          <IconWithTextItem
            onClick={() => {
              startExport();
              api
                .manageGameControllerEjectGameAsWeb(gameDir)
                .then(() => notify())
                .catch(() => notify('error'));
            }}
            icon={<GlobeIcon aria-label="Export Web" className={s.iconColor} />}
            text={t`导出为网页`}
          />
          {osInfo?.platform !== 'android' && (
            <IconWithTextItem
              onClick={() => {
                startExport();
                api
                  .manageGameControllerEjectGameAsExe(gameDir)
                  .then(() => notify('success', exeShowcaseHint))
                  .catch(() => notify('error'));
              }}
              icon={<DesktopIcon aria-label="Export Exe" className={s.iconColor} />}
              text={t`导出为可执行文件`}
            />
          )}
          <IconWithTextItem
            onClick={() => {
              startExport();
              api
                .manageGameControllerEjectGameAsAndroid(gameDir)
                .then(() => notify())
                .catch(() => notify('error'));
            }}
            icon={<img src={AndroidIcon} className={s.iconColor} alt="Export Android" />}
            text={t`导出为安卓项目文件`}
          />
        </TabItem>
      </TopbarTab>

      <Toaster toasterId={toasterId} />
    </>
  );
}
