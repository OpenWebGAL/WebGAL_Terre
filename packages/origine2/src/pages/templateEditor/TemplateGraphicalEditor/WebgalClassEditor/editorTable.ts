import React from "react";
import {t} from "@lingui/macro";
import WGFontWeight from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/propertyEditor/WGFontWeight";
import {IWebgalCssProp} from "@/pages/templateEditor/TemplateGraphicalEditor/utils/extractCss";
import WGPosition from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/propertyEditor/WGPosition";
import WGColor from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/propertyEditor/WGColor";
import WGCommonLengthEditor
  from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/propertyEditor/WGCommonLengthEditor";
import WGCursor from "./propertyEditor/WGCursor";
import WGCommonNumberEditor
  from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/propertyEditor/WGCommonNumberEditor";
import WGCommonEditor from "./propertyEditor/WGCommonEditor";
import WGCommonLengthEditor4Values
  from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/propertyEditor/WGCommonLengthEditor4Values";
import WGTextAlignEditor from "./propertyEditor/WGText";
import WGTextShadowEditor from "./propertyEditor/WGTextShadow";
import WGBackgroundEditor
  from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/propertyEditor/WGBackgroundEditor";
import WGBackgroundSize
  from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/propertyEditor/WGBackgroundSize";
import WGBackgroundPosition
  from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/propertyEditor/WGBackgroundPosition";

export interface IPropertyEditorProps {
  prop: IWebgalCssProp,
  onSubmit: () => void;
}

type IWebGALStylePropertyEditor = React.FC<IPropertyEditorProps>

interface IWebGALStylePropertyEditItem {
  propName: string,
  propLable: string,
  editor: IWebGALStylePropertyEditor,
  initialValue: string,
  tipsLink?: string
}

export function getEditorTable(): IWebGALStylePropertyEditItem[] {
  return [
    {propName: 'font-size', propLable: t`字体大小`, editor: WGCommonLengthEditor, initialValue: '12px'},
    {propName: 'font-weight', propLable: t`字重`, editor: WGFontWeight, initialValue: 'normal'},
    {propName: 'letter-spacing', propLable: t`字母间距`, editor: WGCommonLengthEditor, initialValue: '2.5px'},
    {propName: 'color', propLable: t`颜色`, editor: WGColor, initialValue: '#000000FF'},
    {propName: 'width', propLable: t`宽度`, editor: WGCommonLengthEditor, initialValue: '100px'},
    {propName: 'min-width', propLable: t`最小宽度`, editor: WGCommonLengthEditor, initialValue: '100px'},
    {propName: 'max-width', propLable: t`最大宽度`, editor: WGCommonLengthEditor, initialValue: '100px'},
    {propName: 'height', propLable: t`高度`, editor: WGCommonLengthEditor, initialValue: '50px'},
    {propName: 'min-height', propLable: t`最小高度`, editor: WGCommonLengthEditor, initialValue: '50px'},
    {propName: 'max-height', propLable: t`最大高度`, editor: WGCommonLengthEditor, initialValue: '50px'},
    {propName: 'position', propLable: t`定位方式`, editor: WGPosition, initialValue: 'static'},
    {propName: 'left', propLable: t`偏移左侧距离（定位用）`, editor: WGCommonLengthEditor, initialValue: '5px'},
    {propName: 'right', propLable: t`偏移右侧距离（定位用）`, editor: WGCommonLengthEditor, initialValue: '5px'},
    {propName: 'top', propLable: t`偏移顶部距离（定位用）`, editor: WGCommonLengthEditor, initialValue: '5px'},
    {propName: 'bottom', propLable: t`偏移底部距离（定位用）`, editor: WGCommonLengthEditor, initialValue: '5px'},
    {propName: 'cursor', propLable: t`鼠标指针`, editor: WGCursor, initialValue: 'pointer'},
    {propName: 'z-index', propLable: t`层级顺序`, editor: WGCommonNumberEditor, initialValue: '1'},
    {propName: 'font-family', propLable: t`字体`, editor: WGCommonEditor, initialValue: `"思源宋体", serif`},
    {propName: 'border-radius', propLable: t`圆角`, editor: WGCommonLengthEditor4Values, initialValue: `10px 10px 10px 10px`},
    {propName: 'text-align', propLable: t`文本对齐`, editor: WGTextAlignEditor, initialValue: `left`},
    {propName: 'text-shadow', propLable: t`文本阴影`, editor: WGTextShadowEditor, initialValue: `10px 10px 10px white`},
    {propName: 'margin', propLable: t`外边距`, editor: WGCommonLengthEditor4Values, initialValue: `10px 10px 10px 10px`},
    {propName: 'padding', propLable: t`内边距`, editor: WGCommonLengthEditor4Values, initialValue: `10px 10px 10px 10px`},
    {propName: 'background', propLable: t`背景`, editor: WGBackgroundEditor, initialValue: `#FFFFFFFF`},
    {propName: 'background-size', propLable: t`背景图像大小`, editor: WGBackgroundSize, initialValue: `cover`},
    {propName: 'background-position', propLable: t`背景图像位置`, editor: WGBackgroundPosition, initialValue: `center`},
  ];
}
