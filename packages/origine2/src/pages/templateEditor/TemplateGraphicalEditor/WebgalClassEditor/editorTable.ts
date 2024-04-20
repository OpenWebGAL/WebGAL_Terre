import React from "react";
import {t} from "@lingui/macro";
import WGFontWeight from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/propertyEditor/WGFontWeight";
import {IWebgalCssProp} from "@/pages/templateEditor/TemplateGraphicalEditor/utils/extractCss";
import WGPosition from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/propertyEditor/WGPosition";
import WGColor from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/propertyEditor/WGColor";
import WGCommonLengthEditor
  from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/propertyEditor/WGCommonLengthEditor";

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
    {propName: 'width', propLable: t`宽度`, editor: WGCommonLengthEditor, initialValue: '100px'},
    {propName: 'height', propLable: t`高度`, editor: WGCommonLengthEditor, initialValue: '50px'},
    {propName: 'left', propLable: t`（定位用）偏移左侧距离`, editor: WGCommonLengthEditor, initialValue: '5px'},
    {propName: 'right', propLable: t`（定位用）偏移右侧距离`, editor: WGCommonLengthEditor, initialValue: '5px'},
    {propName: 'top', propLable: t`（定位用）偏移顶部距离`, editor: WGCommonLengthEditor, initialValue: '5px'},
    {propName: 'bottom', propLable: t`（定位用）偏移底部距离`, editor: WGCommonLengthEditor, initialValue: '5px'},
    {propName: 'color', propLable: t`颜色`, editor: WGColor, initialValue: '#000000FF'},
  ];
}
