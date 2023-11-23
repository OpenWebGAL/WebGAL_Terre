export const WG_ORIGINE_RUNTIME = {
  textEditor:{
    isInitWasm:false
  }
};
// 当前要发给 LSP 的场景名称
export const lspSceneName = {value: ""};

class EditorLineHolder{
  private mapSceneUrlToSentence = new Map<string,number>();
  public recordSceneEdittingLine(sceneUrl:string,lineNumber:number){
    this.mapSceneUrlToSentence.set(sceneUrl,lineNumber);
    // console.log(this.mapSceneUrlToSentence);
  }
  public getSceneLine(sceneUrl:string){
    return this.mapSceneUrlToSentence.get(sceneUrl) ??0;
  }
}

export const editorLineHolder = new EditorLineHolder();
