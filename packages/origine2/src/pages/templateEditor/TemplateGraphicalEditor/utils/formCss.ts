import {ICssExtractResult} from "@/pages/templateEditor/TemplateGraphicalEditor/utils/extractCss";

export function formCss(extractedCss: ICssExtractResult): string {
  let commonPropsStr = '';
  let propsWithStateStr = '';

  for (const prop of extractedCss.commonProps) {
    commonPropsStr = commonPropsStr + `${prop.propName}: ${prop.propValue};\n`;
  }

  for (const state of extractedCss.propsWithState) {
    let currentStateStr = '';
    currentStateStr = currentStateStr + `&:${state.state} {\n`;

    for (const prop of state.props) {
      currentStateStr = currentStateStr + `${prop.propName}: ${prop.propValue};\n`;
    }

    currentStateStr = currentStateStr + `}\n`;

    propsWithStateStr = propsWithStateStr + currentStateStr;
  }


  return `${commonPropsStr}\n${propsWithStateStr}`;
}
