import {IWebgalCssProp} from "@/pages/templateEditor/TemplateGraphicalEditor/utils/extractCss";
import {t} from "@lingui/macro";
import PropertyEditor from "@/pages/templateEditor/TemplateGraphicalEditor/propertyEditor";
import s from './singleStateEditor.module.scss';

export function getStateNameMap(){
  return {
    'hover': t`鼠标悬浮样式`,
    'active': t`鼠标按下样式`
  };
}

export default function SingleStateEditor(props: { stateName: string, props: IWebgalCssProp[], onSubmit: () => void }) {
  const stateNameMap = getStateNameMap();

  // @ts-ignore
  const thisStateName: string = stateNameMap?.[props.stateName] ?? '';

  return <div className={s.stateWrapper}>
    <div className={s.stateName}>
      {thisStateName}
    </div>
    <div>
      <PropertyEditor props={props.props} onSubmit={props.onSubmit}/>
    </div>
  </div>;
}
