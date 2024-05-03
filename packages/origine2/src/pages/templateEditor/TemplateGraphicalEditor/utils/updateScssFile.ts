import axios from "axios";
import {WebgalParser} from "@/pages/editor/GraphicalEditor/parser";
import {api} from "@/api";

export async function updateScssFile(filePath:string, className:string, classCss:string){
  const orgCssFileResp = await axios.get(filePath);
  const orgCssText = orgCssFileResp.data;

  const parsed = WebgalParser.parseScssToWebgalStyleObj(orgCssText);

  parsed.classNameStyles[className] = classCss;

  const newStr = formScssFromWebGALStyleObj(parsed);

  await api.assetsControllerEditTextFile({path:filePath,textFile:newStr});
}

function formScssFromWebGALStyleObj(styleObj:ReturnType<typeof WebgalParser.parseScssToWebgalStyleObj>){
  let styleSheet = '';

  const keys = Object.keys(styleObj.classNameStyles);

  for(const key of keys){
    const classStyleText = styleObj.classNameStyles[key];
    styleSheet = styleSheet + `.${key} {\n${classStyleText}}\n\n`;
  }

  styleSheet = styleSheet + styleObj.others +'\n';

  return styleSheet;
}
