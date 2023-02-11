import styles from "./editArea.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import TextEditor from "../TextEditor/TextEditor";
import ResourceDisplay, { ResourceType } from "../ResourceDisplay/ResourceDisplay";

export default function EditArea() {
  const selectedTagTarget = useSelector((state: RootState) => state.status.editor.selectedTagTarget);
  const tags = useSelector((state: RootState) => state.status.editor.tags);

  // 生成每个 Tag 对应的编辑器主体
  const tagPages = tags.map(tag => {
    if (tag.tagType === "scene")
      return <TextEditor isHide={tag.tagTarget !== selectedTagTarget} key={tag.tagTarget} targetPath={tag.tagTarget} />;
    else{
      const fileType = getFileType(tag.tagTarget);
      if(!fileType){
        return <div>文件类型不支持</div>;
      }
      return <ResourceDisplay
        isHidden={tag.tagTarget !== selectedTagTarget}
        resourceType={fileType}
        resourceUrl={tag.tagTarget}
      />;
    }
  });

  return <div className={styles.editArea_main}>
    {selectedTagTarget === "" && <div className={styles.none_text}>目前没有打开任何文件</div>}
    {selectedTagTarget !== "" && tagPages}
  </div>;
}

const imageTypes = ["png", "jpg", "jpeg", "gif"];
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
