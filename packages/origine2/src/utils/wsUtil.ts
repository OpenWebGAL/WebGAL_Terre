import {logger} from "./logger";
import {DebugCommand, IComponentVisibilityCommand, IDebugMessage} from "@/types/debugProtocol";
import useEditorStore from "@/store/useEditorStore";
import {eventBus} from "@/utils/eventBus";

const wsState = {
  isInit: false
};

export class WsUtil {

  public static async init(){
    return new Promise((resolve,reject) => {
      if(wsState.isInit){
        resolve(true);
        return;
      }
      try {
        const loc: string = window.location.hostname;
        const protocol: string = window.location.protocol;
        const port: string = window.location.port; // 获取端口号

        // 默认情况下，不需要在URL中明确指定标准HTTP(80)和HTTPS(443)端口
        let defaultPort = '';
        if (port && port !== '80' && port !== '443') {
          // 如果存在非标准端口号，将其包含在URL中
          defaultPort = `:${port}`;
        }

        if (protocol !== 'http:' && protocol !== 'https:') {
          return;
        }

        // 根据当前协议构建WebSocket URL，并包括端口号（如果有）
        let wsUrl = `ws://${loc}${defaultPort}/api/webgalsync`;
        if (protocol === 'https:') {
          wsUrl = `wss://${loc}${defaultPort}/api/webgalsync`;
        }

        console.log('正在启动socket连接位于：' + wsUrl);
        const socket = new WebSocket(wsUrl);
        socket.onopen = () => {
          console.log('socket已连接');
          socket.send('WebGAL Origine 已和 Terre 建立连接');
          wsState.isInit = true;
          resolve(true);
        };
        socket.onmessage = (e) => {
          eventBus.emit('web-socket:on-message', { message: e.data });
        };
        // @ts-ignore
        window['currentWs'] = socket;
      } catch (e) {
        console.warn('ws连接失败');
        reject(e);
      }
    });
  }

  public static async sendMessageToCurrentWs(data: IDebugMessage['data'], event?: IDebugMessage['event']){
    await this.init();
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

  public static setComponentVisibility(message: IComponentVisibilityCommand[]) {
    const sendMessage = JSON.stringify(message);
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

  public static runTempScene(command: string) {
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

  public static sendFontOptimizationCommand(command: boolean) {
    this.sendMessageToCurrentWs({
      command: DebugCommand.FONT_OPTIMIZATION,
      sceneMsg: {
        scene: "",
        sentence: 0
      },// @ts-ignore
      stageSyncMsg: {},
      message: command.toString(),
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
