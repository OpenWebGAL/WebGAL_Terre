import styles from './templateGraphicalEditor.module.scss';
import useSWR from "swr";
import {api} from "@/api";
import {extractCss} from "@/pages/templateEditor/TemplateGraphicalEditor/utils/extractCss";
import {formCss} from "@/pages/templateEditor/TemplateGraphicalEditor/utils/formCss";
import {updateScssFile} from "@/pages/templateEditor/TemplateGraphicalEditor/utils/updateScssFile";
import PropertyEditor from "@/pages/templateEditor/TemplateGraphicalEditor/propertyEditor";
import {WsUtil} from "@/utils/wsUtil";
import WithStateEditor from "@/pages/templateEditor/TemplateGraphicalEditor/withStateEditor";
import {t} from "@lingui/macro";
import s from './templateGraphicalEditor.module.scss';
import React from "react";
import {Button, Link} from "@fluentui/react-components";
import {AddFilled} from "@fluentui/react-icons";
import {getStateNameMap} from "@/pages/templateEditor/TemplateGraphicalEditor/withStateEditor/SingleStateEditor";

interface ITemplateGraphicalEditorProps {
  path: string,
  className: string
}

export default function TemplateGraphicalEditor(props: ITemplateGraphicalEditorProps) {

  const {path, className} = props;

  const classDataResp = useSWR(`template-edit-${path}-${className}`, async () => {
    const resp = await api.manageTemplateControllerGetStyleByClassName({filePath: path, className});
    return resp.data;
  });

  const data = classDataResp.data;
  const extracted = extractCss(data ?? '');

  const handleSubmit = async () => {
    await updateScssFile(path, className, formCss(extracted));
    await classDataResp.mutate();
    WsUtil.sendTemplateRefetchCommand();
  };

  function addStateToCss(state:string){
    extracted.propsWithState.push({state,props:[]});
    handleSubmit();
  }

  const addStateViews = Object.keys(getStateNameMap()).map(key => {
    const stateNameMap = getStateNameMap() as any;

    // 忽略已经添加的状态
    if(extracted.propsWithState.find(e=>e.state === key)) return null;

    return <Link key={key} style={{display: "flex", alignItems: "center", marginBottom: 3}} onClick={()=>addStateToCss(key)}>
      <AddFilled/>{'\u00a0'}
      {stateNameMap[key]}
    </Link>;
  });

  return (
    <div className={s.templateGraphicalEditor}>
      <div className={s.title}>
        {t`主要样式`}
      </div>
      <PropertyEditor props={extracted.commonProps} onSubmit={handleSubmit}/>
      <WithStateEditor propWithState={extracted.propsWithState} onSubmit={handleSubmit}/>
      <div className={s.addStateWrapper}>
        {addStateViews}
      </div>

    </div>
  );
}
