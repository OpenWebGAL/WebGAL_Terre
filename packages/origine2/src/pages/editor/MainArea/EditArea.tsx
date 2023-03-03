import styles from "./editArea.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import TextEditor from "../TextEditor/TextEditor";
import ResourceDisplay, { ResourceType } from "../ResourceDisplay/ResourceDisplay";
import { ITag } from "../../../store/statusReducer";
import GraphicalEditor from "../GraphicalEditor/GraphicalEditor";

export default function EditArea() {
  const selectedTagTarget = useSelector((state: RootState) => state.status.editor.selectedTagTarget);
  const tags = useSelector((state: RootState) => state.status.editor.tags);
  const isCodeMode = useSelector((state:RootState)=>state.status.editor.isCodeMode);

  // 生成每个 Tag 对应的编辑器主体

  const tag = tags.find(tag => tag.tagTarget === selectedTagTarget);

  const getTagPage = (tag: ITag) => {
    if (tag.tagType === "scene"){
      if(isCodeMode)
        return <TextEditor isHide={tag.tagTarget !== selectedTagTarget} key={tag.tagTarget} targetPath={tag.tagTarget} />;
      else return <GraphicalEditor key={tag.tagTarget} targetPath={tag.tagTarget} targetName={tag.tagName}/>;
    }

    else {
      const fileType = getFileType(tag.tagTarget);
      if (!fileType) {
        return <div>该文件类型不支持预览</div>;
      }
      return <ResourceDisplay
        isHidden={tag.tagTarget !== selectedTagTarget}
        resourceType={fileType}
        resourceUrl={tag.tagTarget}
      />;
    }
  };

  const tagPage = tag ? getTagPage(tag) : "";

  return <div className={styles.editArea_main}>
    {selectedTagTarget === "" && <div className={styles.none_text}>目前没有打开任何文件</div>}
    {selectedTagTarget !== "" && tagPage}
  </div>;
}

const imageTypes = ["png", "jpg", "jpeg", "gif","webp"];
const videoTypes = ["mp4", "webm", "ogg"];
const audioTypes = ["mp3", "wav", "aac"];

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
  } else {
    return null;
  }
}
