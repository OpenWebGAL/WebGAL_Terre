const runtimeTemplate = {
    editorTag: '游戏配置',
    // domain: 'http://localhost:3001',
    domain:'',
    gameList: [],
    currentEditGame: '',
    currentGameConfig: {},
    currentDir: '',
    currentDirContent: [],
    currentEditScene: '',
    currentOpendSceneEdit: [],
    currentSceneSentenceList: [],
    sceneScrollTop:{},
    isRealtimeRefreashPreview:true,
    wsConn:null,
}

const runtime = JSON.parse(JSON.stringify(runtimeTemplate));

export {runtimeTemplate};
export default runtime;
