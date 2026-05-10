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
import type { FastPreviewTimeoutPayload } from "@webgal/editor-preview-protocol";
import { eventBus } from "@/utils/eventBus";

export default function FastPreviewTimeoutDialog() {
  const [payload, setPayload] = useState<FastPreviewTimeoutPayload | null>(null);

  useEffect(() => {
    const handleV1Timeout = ({
      payload: timeoutPayload,
    }: {
      payload: FastPreviewTimeoutPayload;
    }) => {
      setPayload(timeoutPayload);
    };

    eventBus.on("editor-preview:fast-preview-timeout", handleV1Timeout);

    return () => {
      eventBus.off("editor-preview:fast-preview-timeout", handleV1Timeout);
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
                {t`当前场景`}：{payload.sceneName}
                <br />
                {t`目标行`}：{payload.targetSentenceId}
                <br />
                {t`停止位置`}：{payload.sentenceId}
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
