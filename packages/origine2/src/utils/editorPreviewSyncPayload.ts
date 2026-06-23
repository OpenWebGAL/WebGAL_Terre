import type { DebugVariable, SyncScenePayload } from '@webgal/editor-preview-protocol';

export type LegacySyncMessage = 'Sync' | 'exp';

export type SyncScenePayloadWithLegacyMessage = SyncScenePayload & {
  legacySyncMessage: LegacySyncMessage;
};

interface CreateSyncScenePayloadInput {
  sceneName: string;
  sentenceId: number;
  isUseExpFastSync: boolean;
  debugVariables?: DebugVariable[];
  transformBaselineRevision?: string;
  settleMode?: SyncScenePayload['settleMode'];
}

export function createSyncScenePayload({
  sceneName,
  sentenceId,
  isUseExpFastSync,
  debugVariables,
  transformBaselineRevision,
  settleMode,
}: CreateSyncScenePayloadInput): SyncScenePayloadWithLegacyMessage {
  const payload: SyncScenePayloadWithLegacyMessage = {
    sceneName,
    sentenceId,
    legacySyncMessage: isUseExpFastSync ? 'exp' : 'Sync',
  };

  if (settleMode !== undefined) {
    payload.settleMode = settleMode;
  }

  if (transformBaselineRevision !== undefined) {
    payload.transformBaselineRevision = transformBaselineRevision;
  }

  if (debugVariables !== undefined) {
    payload.debugVariables = debugVariables;
  }

  return payload;
}
