import {logger} from "./logger";
import {DebugCommand, IDebugMessage} from "@/types/debugProtocol";
import useEditorStore from "@/store/useEditorStore";
import {isArray} from "lodash";

export interface componentsVisibility {
  showStarter: boolean; // 是否显示初始界面（用于使得bgm可以播放)
  showTitle: boolean; // 是否显示标题界面
  showMenuPanel: boolean; // 是否显示Menu界面
  showTextBox: boolean;
  showControls: boolean;
  controlsVisibility: boolean;
  showBacklog: boolean;
  showExtra: boolean;
  showGlobalDialog: boolean;
  showPanicOverlay: boolean;
  isEnterGame: boolean;
  isShowLogo: boolean;
}

interface componentVisibilityCommandInterface {
  component: keyof componentsVisibility;
  visibility: boolean;
}

export class WsUtil {

  public static sendMessageToCurrentWs(data: IDebugMessage['data'], event?: IDebugMessage['event']){
    // @ts-ignore
    if (window["currentWs"]) {
      logger.debug("编辑器开始发送同步数据");
      const sendMessage: IDebugMessage = {
        event: event ?? "message",
        data: data
      };
      // @ts-ignore
      window["currentWs"].send(JSON.stringify(sendMessage));
    }
  }

  public static setComponentVisibility(message: componentVisibilityCommandInterface | componentVisibilityCommandInterface[]) {
    const compose = (message: componentVisibilityCommandInterface[]) => {
      return message.map((item) => {
        return `${item.component}:${item.visibility}`;
      }).join('\n');
    };
    const sendMessage = !isArray(message) ? `${message.component}:${message.visibility}` : compose(message);
    this.sendMessageToCurrentWs({
      command: DebugCommand.SET_COMPONENT_VISIBILITY,
      sceneMsg: {
        scene: "",
        sentence: 0
      },// @ts-ignore
      stageSyncMsg: {},
      message: sendMessage,
    });
  }

  public static createTempScene(command: string) {
    this.sendMessageToCurrentWs({
      command: DebugCommand.TEMP_SCENE,
      sceneMsg: {
        scene: "",
        sentence: 0
      },// @ts-ignore
      stageSyncMsg: {},
      message: command,
    });
  }

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
    if (this.getIsCurrentLineJump(lineCommandString)) {
      this.sendMessageToCurrentWs({
        command: DebugCommand.JUMP,
        sceneMsg: {
          scene: sceneName,
          sentence: lineNumber
        },// @ts-ignore
        stageSyncMsg: {},
        message: useEditorStore.getState().isUseExpFastSync? 'exp':'Sync',
      });
    }
  }

  public static sendExeCommand(command: string) {
    this.sendMessageToCurrentWs({
      command: DebugCommand.EXE_COMMAND,
      sceneMsg: {
        scene: 'temp',
        sentence: 0
      },// @ts-ignore
      stageSyncMsg: {},
      message: command
    });
  }

  public static sendTemplateRefetchCommand(){
    this.sendMessageToCurrentWs({
      command: DebugCommand.REFETCH_TEMPLATE_FILES,
      sceneMsg: {
        scene: 'temp',
        sentence: 0
      },// @ts-ignore
      stageSyncMsg: {},
      message: ''
    });
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
