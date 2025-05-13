import {Position} from 'monaco-editor';

export const WG_ORIGINE_RUNTIME = {
  textEditor:{
    isInitWasm:false
  }
};
// 当前要发给 LSP 的场景名称
export const lspSceneName = {value: ""};

class EditorLineHolder{
  private mapSceneUrlToSentence = new Map<string,Position>();
  
  public recordSceneEditingLine(sceneUrl: string, lineNumber: number) {
    this.mapSceneUrlToSentence.set(sceneUrl, new Position(lineNumber, 0))
    // console.log(this.mapSceneUrlToSentence);
  }

  public recordSceneEditingPosition(sceneUrl: string, position: Position) {
    this.mapSceneUrlToSentence.set(sceneUrl, position)
    // console.log(this.mapSceneUrlToSentence);
  }

  public getSceneLine(sceneUrl: string): number {
    return this.mapSceneUrlToSentence.get(sceneUrl)?.lineNumber ?? 0;
  }

  public getScenePosition(sceneUrl: string): Position {
    return this.mapSceneUrlToSentence.get(sceneUrl) ?? new Position(0, 0);
  }
}

export const editorLineHolder = new EditorLineHolder();
