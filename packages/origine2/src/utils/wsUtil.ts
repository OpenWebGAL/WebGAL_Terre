import {logger} from "./logger";
import {DebugCommand, IDebugMessage} from "@/types/debugProtocol";
import useEditorStore from "@/store/useEditorStore";

export class WsUtil {
  // eslint-disable-next-line max-params
  public static sendSyncCommand(scenePath: string, lineNumber: number, lineCommandString: string, force?: boolean) {
    function extractPathAfterScene(scenePath: string): string {
      // Normalize path separators to "/"
      const normalizedPath = scenePath.replace(/\\/g, '/');

      // Split the path into parts
      const parts = normalizedPath.split('/');

      // Find the index of the "scene" segment
      const sceneIndex = parts.indexOf('scene');

      // Extract the parts after "scene"
      const afterSceneParts = parts.slice(sceneIndex + 1);

      // Join the parts back into a string with "/"
      return afterSceneParts.join('/');
    }

    const sceneName = extractPathAfterScene(scenePath);
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

  public static sendTemplateRefetchCommand(){
    // @ts-ignore
    if (window["currentWs"]) { // @ts-ignore
      logger.debug("编辑器开始发送同步数据");
      const message: IDebugMessage = {
        event: 'message', data: {
          command: DebugCommand.REFETCH_TEMPLATE_FILES,
          sceneMsg: {
            scene: 'temp',
            sentence: 0
          },// @ts-ignore
          stageSyncMsg: {},
          message: ''
        }
      };
      // @ts-ignore
      window["currentWs"].send(JSON.stringify(message));
    }
  };

  private static getIsCurrentLineJump(currentLineValue: string | null): boolean {
    const command = currentLineValue?.split(":")[0] ?? "";
    if (command === "unlockCg" || command === "unlockBgm") {
      if (!currentLineValue?.match(/;/g))
        return false;
    }
    return true;
  }

}
