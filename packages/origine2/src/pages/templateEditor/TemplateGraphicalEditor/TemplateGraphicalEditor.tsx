import styles from './templateGraphicalEditor.module.scss';
import useSWR from "swr";
import {api} from "@/api";
import {extractCss} from "@/pages/templateEditor/TemplateGraphicalEditor/utils/extractCss";
import WGFontWeight from "@/pages/templateEditor/TemplateGraphicalEditor/propertyEditor/WGFontWeight";
import {formCss} from "@/pages/templateEditor/TemplateGraphicalEditor/utils/formCss";
import {updateScssFile} from "@/pages/templateEditor/TemplateGraphicalEditor/utils/updateScssFile";
import {editorTable} from "@/pages/templateEditor/TemplateGraphicalEditor/propertyEditor";
import {WsUtil} from "@/utils/wsUtil";
import WithStateEditor from "@/pages/templateEditor/TemplateGraphicalEditor/withStateEditor";

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
  console.log(extracted);

  const handleSubmit = async () => {
    await updateScssFile(path, className, formCss(extracted));
    await  classDataResp.mutate();
    WsUtil.sendTemplateRefetchCommand();
  };

  const propertiesEditors = extracted.commonProps.map(property => {
    const item = editorTable.find(e => e.propName === property.propName);
    if (!item) return '';
    const PropEditor = item.editor;
    return <PropEditor key={property.propName} prop={property} onSubmit={handleSubmit}/>;
  });

  return (
    <div className={styles.templateGraphicalEditor}>
      {propertiesEditors}
      <WithStateEditor propWithState={extracted.propsWithState} onSubmit={handleSubmit}/>
    </div>
  );
}
