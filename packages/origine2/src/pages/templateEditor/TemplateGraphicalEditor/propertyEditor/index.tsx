import {IWebgalCssProp} from "@/pages/templateEditor/TemplateGraphicalEditor/utils/extractCss";
import React from "react";
import WGFontWeight from "@/pages/templateEditor/TemplateGraphicalEditor/propertyEditor/WGFontWeight";

export interface IPropertyEditorProps {
  prop: IWebgalCssProp,
  onSubmit: () => void;
}

type IWebGALStylePropertyEditor = React.FC<IPropertyEditorProps>

export const editorTable: { propName: string, editor: IWebGALStylePropertyEditor }[] = [
  {propName: 'font-weight', editor: WGFontWeight},
];
