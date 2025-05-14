import styles from "./editArea.module.scss";
import TextEditor from "../TextEditor/TextEditor";
import ResourceDisplay, {ResourceType} from "../ResourceDisplay/ResourceDisplay";
import GraphicalEditor from "../GraphicalEditor/GraphicalEditor";
import EditorToolbar from "@/pages/editor/MainArea/EditorToolbar";
import EditorDebugger from "@/pages/editor/MainArea/EditorDebugger/EditorDebugger";
import { useGameEditorContext } from "@/store/useGameEditorStore";
import { ITag } from "@/types/gameEditor";
import { t } from "@lingui/macro";
import useEditorStore from "@/store/useEditorStore";
import { useMemo } from "react";

export default function EditArea() {
  const gameDir = useEditorStore.use.subPage();
  const currentTag = useGameEditorContext((state) => state.currentTag);
  const tags = useGameEditorContext((state) => state.tags);
  const isCodeMode = useGameEditorContext((state) => state.isCodeMode);
  const isShowDebugger = useGameEditorContext((state) => state.isShowDebugger);

  const basePath = useMemo(() => ['games', gameDir, 'game'], [gameDir]);

  // 生成每个 Tag 对应的编辑器主体
  const tag = tags.find(tag => tag.path === currentTag?.path);
  const isScene = tag?.type === "scene";

  const getTagPage = (tag: ITag) => {
    const targetPath = [
      ...basePath,
      tag.path.startsWith(basePath.join('/'))
        ? tag.path.slice(basePath.join('/').length + 1) // 兼容旧版本路径
        : tag.path,
    ].join('/');

    if (tag.type === "scene") {
      if (isCodeMode)
        return <TextEditor isHide={tag.path !== currentTag?.path} key={tag.path}
          targetPath={targetPath}/>;
      else return <GraphicalEditor key={tag.path} targetPath={targetPath} targetName={tag.name}/>;
    } else {
      const fileType = getFileType(tag.name);
      if (!fileType) {
        return <div>{t`该文件类型不支持预览`}</div>;
      }
      return <ResourceDisplay
        isHidden={tag.path !== currentTag?.path}
        resourceType={fileType}
        resourceUrl={targetPath}
      />;
    }
  };

  const tagPage = tag ? getTagPage(tag) : "";

  return <>
    <div className={styles.editArea_main}>
      {tag?.path === "" && <div className={styles.none_text}>{t`目前没有打开任何文件`}</div>}
      {tag?.path !== "" && tagPage}
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
  const extension = fileName.split(".")[1]?.toLowerCase();

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
