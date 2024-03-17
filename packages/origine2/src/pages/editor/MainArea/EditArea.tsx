import styles from "./editArea.module.scss";
import TextEditor from "../TextEditor/TextEditor";
import ResourceDisplay, {ResourceType} from "../ResourceDisplay/ResourceDisplay";
import GraphicalEditor from "../GraphicalEditor/GraphicalEditor";
import useTrans from "@/hooks/useTrans";
import EditorToolbar from "@/pages/editor/MainArea/EditorToolbar";
import EditorDebugger from "@/pages/editor/MainArea/EditorDebugger/EditorDebugger";
import { useGameEditorContext } from "@/store/useGameEditorStore";
import { IFileTab } from "@/types/gameEditor";

export default function EditArea() {
  const t = useTrans('editor.mainArea.');
  const currentFileTab = useGameEditorContext((state) => state.currentFileTab);
  const fileTabs = useGameEditorContext((state) => state.fileTabs);
  const isCodeMode = useGameEditorContext((state) => state.isCodeMode);
  const isShowDebugger = useGameEditorContext((state) => state.isShowDebugger);

  // 生成每个 Tab 对应的编辑器主体

  const tab = fileTabs.find(tab => tab.path === currentFileTab?.path);
  const isScene = tab?.type === "scene";

  const getTabPage = (tab: IFileTab) => {
    if (tab.type === "scene") {
      if (isCodeMode)
        return <TextEditor isHide={tab.path !== currentFileTab?.path} key={tab.path}
          targetPath={tab.path}/>;
      else return <GraphicalEditor key={tab.path} targetPath={tab.path} targetName={tab.name}/>;
    } else {
      const fileType = getFileType(tab.name);
      if (!fileType) {
        return <div>{t('canNotPreview')}</div>;
      }
      return <ResourceDisplay
        isHidden={tab.path !== currentFileTab?.path}
        resourceType={fileType}
        resourceUrl={tab.path}
      />;
    }
  };

  const tabPage = tab ? getTabPage(tab) : "";

  return <>
    <div className={styles.editArea_main}>
      {tab?.path === "" && <div className={styles.none_text}>{t('noFileOpened')}</div>}
      {tab?.path !== "" && tabPage}
    </div>
    {isScene && isShowDebugger && <EditorDebugger/>}
    {isScene && <EditorToolbar/>}
  </>;
}

const imageTypes = ["png", "jpg", "jpeg", "gif", "webp"];
const videoTypes = ["mp4", "webm", "ogg"];
const audioTypes = ["mp3", "wav", "aac"];
const animationTypes = ["json"];

function getFileType(path: string): ResourceType | null {
  const parts = path.split(/[/\\]/);
  const fileName = parts[parts.length - 1];
  const extension = fileName.split(".")[1].toLowerCase();

  if (imageTypes.includes(extension)) {
    return ResourceType.Image;
  } else if (videoTypes.includes(extension)) {
    return ResourceType.Video;
  } else if (audioTypes.includes(extension)) {
    return ResourceType.Audio;
  } else if (animationTypes.includes(extension)) {
    return ResourceType.Animation;
  } else {
    return null;
  }
}
