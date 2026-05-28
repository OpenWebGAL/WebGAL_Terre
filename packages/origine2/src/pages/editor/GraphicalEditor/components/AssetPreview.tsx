import useEditorStore from "@/store/useEditorStore";
import { extractExtension } from "@/utils/getFileIcon";
import styles from "../SentenceEditor/sentenceEditor.module.scss";

export function AssetPreview({ basePath, file }: { basePath: "background" | "figure"; file: string }) {
  const gameDir = useEditorStore.use.subPage();
  const assetFile = file.split("?")[0];
  const assetType = extractExtension(assetFile);
  if (!assetFile || assetFile === "none" || (assetType !== "image" && assetType !== "video")) return null;
  const src = `/games/${gameDir}/game/${basePath}/${assetFile}`;
  return assetType === "image"
    ? <img className={styles.assetPreview} src={src} draggable={false} />
    : <video className={styles.assetPreview} src={src} muted />;
}
