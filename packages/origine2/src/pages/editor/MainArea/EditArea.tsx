import styles from "./editArea.module.scss";
import TextEditor from "../TextEditor/TextEditor";
import ResourceDisplay, {ResourceType} from "../ResourceDisplay/ResourceDisplay";
import GraphicalEditor from "../GraphicalEditor/GraphicalEditor";
import useTrans from "@/hooks/useTrans";
import EditorToolbar from "@/pages/editor/MainArea/EditorToolbar";
import EditorDebugger from "@/pages/editor/MainArea/EditorDebugger/EditorDebugger";
import { FileTab, useGameEditorContext } from "@/store/useGameEditorStore";

export default function EditArea() {
  const t = useTrans('editor.mainArea.');
  const currentFileTab = useGameEditorContext((state) => state.currentFileTab);
  const fileTabs = useGameEditorContext((state) => state.fileTabs);
  const isCodeMode = useGameEditorContext((state) => state.isCodeMode);
  const isShowDebugger = useGameEditorContext((state) => state.isShowDebugger);

  // 生成每个 Tab 对应的编辑器主体

  const tab = fileTabs.find(tab => tab.tabPath === currentFileTab?.tabPath);
  const isScene = tab?.tabType === "scene";

  const getTagPage = (tab: FileTab) => {
    if (tab.tabType === "scene") {
      if (isCodeMode)
        return <TextEditor isHide={tab.tabPath !== currentFileTab?.tabPath} key={tab.tabPath}
          targetPath={tab.tabPath}/>;
      else return <GraphicalEditor key={tab.tabPath} targetPath={tab.tabPath} targetName={tab.tabName}/>;
    } else {
      const fileType = getFileType(tab.tabName);
      if (!fileType) {
        return <div>{t('canNotPreview')}</div>;
      }
      return <ResourceDisplay
        isHidden={tab.tabPath !== currentFileTab?.tabPath}
        resourceType={fileType}
        resourceUrl={tab.tabPath}
      />;
    }
  };

  const tabPage = tab ? getTagPage(tab) : "";

  return <>
    <div className={styles.editArea_main}>
      {tab?.tabPath === "" && <div className={styles.none_text}>{t('noFileOpened')}</div>}
      {tab?.tabPath !== "" && tabPage}
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
