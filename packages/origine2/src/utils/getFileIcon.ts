import imageIcon from "material-icon-theme/icons/image.svg";
import audioIcon from "material-icon-theme/icons/audio.svg";
import videoIcon from "material-icon-theme/icons/video.svg";
import jsonIcon from "material-icon-theme/icons/json.svg";
import textIcon from "material-icon-theme/icons/document.svg";

type FileType = "image" | "video" | "text" | "audio" | "json" | "unknown";

export function extractExtension(filename: string): FileType {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "unknown";

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];
  const videoExtensions = ["mp4", "webm", "ogg"];
  const audioExtensions = ["wav", "mp3", "ogg"];

  if (imageExtensions.includes(extension)) {
    return "image";
  } else if (videoExtensions.includes(extension)) {
    return "video";
  } else if (audioExtensions.includes(extension)) {
    return "audio";
  } else if (extension === "txt") {
    return "text";
  } else if (extension === "json") {
    return "json";
  } else {
    return "unknown";
  }
}

export function getFileIcon(filename: string) {
  const filetype = extractExtension(filename);
  switch (filetype) {
  case "image":
    return imageIcon;
  case "audio":
    return audioIcon;
  case "video":
    return videoIcon;
  case "json" :
    return jsonIcon;
  case "text":
    return textIcon;
  default:
    return textIcon;
  }
}

export function getDirIcon(dirName:string){
  const filetype = extractExtension(dirName);
  switch (filetype) {
  case "image":
    return imageIcon;
  case "audio":
    return audioIcon;
  case "video":
    return videoIcon;
  case "json" :
    return jsonIcon;
  case "text":
    return textIcon;
  default:
    return textIcon;
  }
}
