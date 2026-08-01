import { Toast, ToastBody, Toaster, ToastTitle, useToastController } from '@fluentui/react-components';
import { t } from '@lingui/macro';

const trashToasterId = 'trash-toaster';

/** 挂载在应用根部，供各处的删除操作复用 */
export const TrashToaster = () => <Toaster toasterId={trashToasterId} />;

/** 移动到回收站失败时的提示，引导用户关闭回收站功能后重试 */
export default function useTrashFailedToast() {
  const { dispatchToast } = useToastController(trashToasterId);

  return () =>
    dispatchToast(
      <Toast>
        <ToastTitle>{t`移动到回收站失败`}</ToastTitle>
        <ToastBody>{t`可在设置中关闭回收站功能后重试，此时删除将不可恢复`}</ToastBody>
      </Toast>,
      { intent: 'error' },
    );
}
