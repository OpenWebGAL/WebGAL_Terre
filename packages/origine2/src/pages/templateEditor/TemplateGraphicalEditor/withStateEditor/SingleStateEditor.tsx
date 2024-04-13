import {IWebgalCssProp} from "@/pages/templateEditor/TemplateGraphicalEditor/utils/extractCss";
import {t} from "@lingui/macro";
import {editorTable} from "@/pages/templateEditor/TemplateGraphicalEditor/propertyEditor";


export default function SingleStateEditor(props: { stateName: string, props: IWebgalCssProp[], onSubmit: () => void }) {
  const stateNameMap = {
    'hover': t`鼠标悬浮效果`,
    'active': t`鼠标按下效果`
  };

  // @ts-ignore
  const thisStateName: string = stateNameMap?.[props.stateName] ?? '';
  const editors = props.props.map(property => {
    const item = editorTable.find(e => e.propName === property.propName);
    if (!item) return '';
    const PropEditor = item.editor;
    return <PropEditor key={property.propName} prop={property} onSubmit={props.onSubmit}/>;
  });
  return <div>
    <div>
      {thisStateName}
    </div>
    <div>
      {editors}
    </div>
  </div>;
}
