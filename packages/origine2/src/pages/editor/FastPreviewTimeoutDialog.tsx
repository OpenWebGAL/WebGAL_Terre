import { t } from "@lingui/macro";
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
} from "@fluentui/react-components";
import { useEffect, useState } from "react";
import { DebugCommand, IDebugMessage, IFastPreviewTimeoutPayload } from "@/types/debugProtocol";
import { eventBus } from "@/utils/eventBus";

function parseFastPreviewTimeoutMessage(message: string): IFastPreviewTimeoutPayload | null {
  try {
    const debugMessage = JSON.parse(message) as IDebugMessage;
    if (debugMessage.data.command !== DebugCommand.FAST_PREVIEW_TIMEOUT) {
      return null;
    }
    return JSON.parse(debugMessage.data.message) as IFastPreviewTimeoutPayload;
  } catch {
    return null;
  }
}

export default function FastPreviewTimeoutDialog() {
  const [payload, setPayload] = useState<IFastPreviewTimeoutPayload | null>(null);

  useEffect(() => {
    const handleMessage = ({ message }: { message: string }) => {
      const timeoutPayload = parseFastPreviewTimeoutMessage(message);
      if (timeoutPayload) {
        setPayload(timeoutPayload);
      }
    };

    eventBus.on("web-socket:on-message", handleMessage);

    return () => {
      eventBus.off("web-socket:on-message", handleMessage);
    };
  }, []);

  return (
    <Dialog open={payload !== null} onOpenChange={(_, data) => !data.open && setPayload(null)}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{t`实时预览已停止`}</DialogTitle>
          <DialogContent>
            <p>{t`实时预览快进超过了超时时间限制，已停止继续演算。`}</p>
            <p>{t`可能原因是脚本中存在循环跳转，或者目标行之前需要快进的行数过多。`}</p>
            {payload && (
              <p>
                {t`当前场景`}：{payload.scene}
                <br />
                {t`目标行`}：{payload.targetSentence}
                <br />
                {t`停止位置`}：{payload.sentence}
                <br />
                {t`已快进行数`}：{payload.forwardedLineCount}
                <br />
                {t`耗时`}：{payload.elapsedMs}ms / {payload.maxDurationMs}ms
              </p>
            )}
          </DialogContent>
          <DialogActions>
            <Button appearance="primary" onClick={() => setPayload(null)}>{t`确定`}</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
