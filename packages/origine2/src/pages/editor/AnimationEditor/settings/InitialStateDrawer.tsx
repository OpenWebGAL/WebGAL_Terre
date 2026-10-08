import { Button, DrawerBody, DrawerHeader, DrawerHeaderTitle, OverlayDrawer } from '@fluentui/react-components';
import { bundleIcon, Dismiss24Filled, Dismiss24Regular } from '@fluentui/react-icons';
import { t } from '@lingui/macro';
import { EffectEditor } from '@/pages/editor/GraphicalEditor/components/EffectEditor';

const DismissIcon = bundleIcon(Dismiss24Filled, Dismiss24Regular);

interface IInitialStateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 预览对象的初始变换，格式同 -transform 参数的 JSON */
  json: string;
  onChange: (json: string) => void;
}

/**
 * 编辑预览对象在动画开始前的状态。样式与图形编辑器的 TerrePanel 一致：右侧抽屉，不遮挡预览
 */
export function InitialStateDrawer({ open, onOpenChange, json, onChange }: IInitialStateDrawerProps) {
  return (
    <OverlayDrawer
      open={open}
      onOpenChange={(_, data) => onOpenChange(data.open)}
      position="end"
      style={{ width: '750px' }}
      backdrop={null}
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button appearance="subtle" aria-label={t`关闭`} icon={<DismissIcon />} onClick={() => onOpenChange(false)} />
          }
        >
          {t`预览初始状态`}
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody>
        <EffectEditor json={json} onChange={onChange} />
      </DrawerBody>
    </OverlayDrawer>
  );
}
