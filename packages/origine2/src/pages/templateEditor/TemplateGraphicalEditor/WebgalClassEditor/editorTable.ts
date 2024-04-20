import React from "react";
import {t} from "@lingui/macro";
import WGFontWeight from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/propertyEditor/WGFontWeight";
import {IWebgalCssProp} from "@/pages/templateEditor/TemplateGraphicalEditor/utils/extractCss";

export interface IPropertyEditorProps {
  prop: IWebgalCssProp,
  onSubmit: () => void;
}

type IWebGALStylePropertyEditor = React.FC<IPropertyEditorProps>

interface IWebGALStylePropertyEditItem {
  propName: string,
  propLable: string,
  editor: IWebGALStylePropertyEditor,
  initialValue: string
}

export function getEditorTable(): IWebGALStylePropertyEditItem[] {
  return [
    {propName: 'font-weight', propLable: t`字重`, editor: WGFontWeight, initialValue: 'normal'},
  ];
}
