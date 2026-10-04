import { RefObject, useCallback, useEffect, useMemo, useState } from 'react';
import {
  DEDICATED_PREVIEW_LAUNCH_ID_PREFIX,
  type EventEnvelopeByType,
  type HostEventType,
  type PreviewCommandType,
  type RequestPayloadByType,
} from '@webgal/editor-preview-protocol';
import { EditorPreviewClient } from '@/utils/editorPreviewClient';
import { createPreviewBootstrapProvide, isPreviewBootstrapRequest } from '@/utils/editorPreviewBootstrap';
import { createId } from '@/utils/createId';
import { eventBus } from '@/utils/eventBus';

/**
 * 让 iframe 中的 WebGAL 注册为独占预览，只接收本组件发出的命令，不受主预览的同步影响。
 *
 * iframe 加载后会向父窗口请求 embeddedLaunchId，这里回复一个带独占前缀的 id；
 * 之后它发出的事件会带着这个 id 转发回来，用于判断是否就绪、舞台是否变化
 */
export function useDedicatedPreview(iframeRef: RefObject<HTMLIFrameElement>) {
  const launchId = useMemo(() => DEDICATED_PREVIEW_LAUNCH_ID_PREFIX + createId(), []);
  const [isReady, setIsReady] = useState(false);
  /** 每当预览的舞台状态变化时加一，用于在立绘等加载完成后重新写入动画状态 */
  const [stageRevision, setStageRevision] = useState(0);

  useEffect(() => {
    EditorPreviewClient.ensureConnected();

    const handleBootstrapRequest = (event: MessageEvent) => {
      const iframeWindow = iframeRef.current?.contentWindow;
      if (!iframeWindow || event.source !== iframeWindow || !isPreviewBootstrapRequest(event.data)) return;
      iframeWindow.postMessage(createPreviewBootstrapProvide(launchId), '*');
    };

    const handlePreviewEvent = (envelope: EventEnvelopeByType<HostEventType>) => {
      if (envelope.embeddedLaunchId !== launchId) return;
      if (envelope.type === 'preview.ready.updated') {
        setIsReady(envelope.payload.ready);
      } else if (envelope.type === 'stage.snapshot.updated') {
        setStageRevision((revision) => revision + 1);
      }
    };

    window.addEventListener('message', handleBootstrapRequest);
    eventBus.on('editor-preview:dedicated-event', handlePreviewEvent);
    return () => {
      window.removeEventListener('message', handleBootstrapRequest);
      eventBus.off('editor-preview:dedicated-event', handlePreviewEvent);
    };
  }, [iframeRef, launchId]);

  const send = useCallback(
    <TType extends PreviewCommandType>(type: TType, payload: RequestPayloadByType[TType]) =>
      EditorPreviewClient.sendToDedicatedPreview(launchId, type, payload),
    [launchId],
  );

  return { isReady, stageRevision, send };
}
