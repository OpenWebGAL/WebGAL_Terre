import {t} from "@lingui/macro";
import {IComponentNode} from "@/pages/templateEditor/TemplateEditorSidebar/ComponentTree/ComponentTree";
import {title} from "@/pages/templateEditor/TemplateEditorSidebar/ComponentTree/componentNodes/title";
import {textbox} from "@/pages/templateEditor/TemplateEditorSidebar/ComponentTree/componentNodes/textbox";
import {choose} from "@/pages/templateEditor/TemplateEditorSidebar/ComponentTree/componentNodes/choose";

export const componentTree: IComponentNode[] = [
  title,
  textbox,
  choose
];
