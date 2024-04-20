import React from "react";
import {t} from "@lingui/macro";
import WGFontWeight from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/propertyEditor/WGFontWeight";
import {IWebgalCssProp} from "@/pages/templateEditor/TemplateGraphicalEditor/utils/extractCss";
import WGPosition from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/propertyEditor/WGPosition";
import WGWidth from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/propertyEditor/WGWidth";
import WGHeight from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/propertyEditor/WGHeight";
import WGColor from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/propertyEditor/WGColor";

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
    {propName: 'position', propLable: t`定位方式`, editor: WGPosition, initialValue: 'static'},
    {propName: 'width', propLable: t`宽度`, editor: WGWidth, initialValue: '100px'},
    {propName: 'height', propLable: t`高度`, editor: WGHeight, initialValue: '50px'},
    {propName: 'color', propLable: t`颜色`, editor: WGColor, initialValue: '#000000FF'},
  ];
}
