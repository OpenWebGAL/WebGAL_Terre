import styles from "./editArea.module.scss";
import {useSelector} from "react-redux";
import {RootState} from "../../../store/origineStore";
import TextEditor from "../TextEditor/TextEditor";
import ResourceDisplay, {ResourceType} from "../ResourceDisplay/ResourceDisplay";
import {ITag} from "../../../store/statusReducer";
import GraphicalEditor from "../GraphicalEditor/GraphicalEditor";
import useTrans from "@/hooks/useTrans";
import EditorToolbar from "@/pages/editor/MainArea/EditorToolbar";

export default function EditArea() {
  const t = useTrans('editor.mainArea.');
  const selectedTagTarget = useSelector((state: RootState) => state.status.editor.selectedTagTarget);
  const tags = useSelector((state: RootState) => state.status.editor.tags);
  const isCodeMode = useSelector((state: RootState) => state.status.editor.isCodeMode);

  // 生成每个 Tag 对应的编辑器主体

  const tag = tags.find(tag => tag.tagTarget === selectedTagTarget);
  const isScene = tag?.tagType === "scene";

  const getTagPage = (tag: ITag) => {
    if (tag.tagType === "scene") {
      if (isCodeMode)
        return <TextEditor isHide={tag.tagTarget !== selectedTagTarget} key={tag.tagTarget}
          targetPath={tag.tagTarget}/>;
      else return <GraphicalEditor key={tag.tagTarget} targetPath={tag.tagTarget} targetName={tag.tagName}/>;
    } else {
      const fileType = getFileType(tag.tagTarget);
      if (!fileType) {
        return <div>{t('canNotPreview')}</div>;
      }
      return <ResourceDisplay
        isHidden={tag.tagTarget !== selectedTagTarget}
        resourceType={fileType}
        resourceUrl={tag.tagTarget}
      />;
    }
  };

  const tagPage = tag ? getTagPage(tag) : "";

  return<>
    <div className={styles.editArea_main}>
      {selectedTagTarget === "" && <div className={styles.none_text}>{t('noFileOpened')}</div>}
      {selectedTagTarget !== "" && tagPage}
    </div>
    {isScene &&<EditorToolbar/>}
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
