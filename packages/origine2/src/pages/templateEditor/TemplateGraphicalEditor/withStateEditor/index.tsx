import {IWebgalPropsWithState} from "@/pages/templateEditor/TemplateGraphicalEditor/utils/extractCss";
import SingleStateEditor from "@/pages/templateEditor/TemplateGraphicalEditor/withStateEditor/SingleStateEditor";

export interface IPropWithStateProps {
  propWithState: IWebgalPropsWithState[],
  onSubmit: () => void;
}

export default function WithStateEditor(props: IPropWithStateProps) {
  const editors = props.propWithState.map(e => <SingleStateEditor
    stateName={e.state}
    props={e.props}
    onSubmit={props.onSubmit}
    key={e.state}/>);
  return <>
    {editors}
  </>;

}
