import {logger} from "./logger";
import {DebugCommand, IDebugMessage} from "@/types/debugProtocol";
import useEditorStore from "@/store/useEditorStore";

export class WsUtil {
  // eslint-disable-next-line max-params
  public static sendSyncCommand(sceneName: string, lineNumber: number, lineCommandString: string, force?: boolean) {

    const isForce = force ?? false;
    if (!useEditorStore.getState().isEnableLivePreview && !force) {
      return;
    }

    // @ts-ignore
    if (window["currentWs"] && this.getIsCurrentLineJump(lineCommandString)) { // @ts-ignore
      logger.debug("编辑器开始发送同步数据");
      const message: IDebugMessage = {
        event: 'message', data: {
          command: DebugCommand.JUMP,
          sceneMsg: {
            scene: sceneName,
            sentence: lineNumber
          },// @ts-ignore
          stageSyncMsg: {},
          message: 'Sync'
        }
      };
      // @ts-ignore
      window["currentWs"].send(JSON.stringify(message));
    }
  }

  public static sendExeCommand(command: string) {

    // @ts-ignore
    if (window["currentWs"]) { // @ts-ignore
      logger.debug("编辑器开始发送同步数据");
      const message: IDebugMessage = {
        event: 'message', data: {
          command: DebugCommand.EXE_COMMAND,
          sceneMsg: {
            scene: 'temp',
            sentence: 0
          },// @ts-ignore
          stageSyncMsg: {},
          message: command
        }
      };
      // @ts-ignore
      window["currentWs"].send(JSON.stringify(message));
    }
  }

  private static getIsCurrentLineJump(currentLineValue: string | null): boolean {
    const command = currentLineValue?.split(":")[0] ?? "";
    if (command === "unlockCg" || command === "unlockBgm") {
      if (!currentLineValue?.match(/;/g))
        return false;
    }
    return true;
  }
}
