import { IStageState } from "@/types/stageInterface";

export enum DebugCommand {
  JUMP,
  SYNCFC,
  SYNCFE,
  EXE_COMMAND,
  REFETCH_TEMPLATE_FILES,
  SET_COMPONENT_VISIBILITY,
  TEMP_SCENE,
  FONT_OPTIMIZATION,
  SET_EFFECT,
  FAST_PREVIEW_TIMEOUT,
}

export interface IFastPreviewTimeoutPayload {
  scene?: string;
  sceneName?: string;
  sentence?: number;
  sentenceId?: number;
  targetSentence?: number;
  targetSentenceId?: number;
  forwardedLineCount: number;
  elapsedMs: number;
  maxDurationMs: number;
}

export interface IDebugMessage {
  event: string;
  data: {
    command: DebugCommand;
    sceneMsg: {
      sentence: number;
      scene: string;
    };
    message: string;
    stageSyncMsg: IStageState;
  };
}
