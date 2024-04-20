import {IWebgalCssProp} from "@/pages/templateEditor/TemplateGraphicalEditor/utils/extractCss";
import React, {useState} from "react";
import {t} from "@lingui/macro";
import {Link, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow} from "@fluentui/react-components";
import s from './propertyEditor.module.scss';
import AddProperty from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/AddProperty";
import {getEditorTable} from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/editorTable";



export default function WebgalClassEditor(props: { props: IWebgalCssProp[], onSubmit: () => void }) {
  const editors = props.props.map(property => {
    const item = getEditorTable().find(e => e.propName === property.propName);
    if (!item) return null;
    const PropEditor = item.editor;
    return {label: item.propLable, editor: <PropEditor prop={property} onSubmit={props.onSubmit}/>};
  });

  const columns = [
    {columnKey: "property", label: t`属性`},
    {columnKey: "value", label: t`值`},
  ];

  const editorsAvailable = editors.filter(e => e !== null);
  const [addPropertyDialogOpen,setAddPropertyDialogOpen] = useState(false);

  const handleAddProperty = (propName:string,propValue:string)=>{
    props.props.push({propName,propValue});
    props.onSubmit();
  };

  return <div className={s.propertyEditorMain}>
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHeaderCell key={column.columnKey}>
              <span className={s.tableHeadText}>
                {column.label}
              </span>
            </TableHeaderCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {editorsAvailable.map((item) => (
          <TableRow key={item!.label}>
            <TableCell>
              <span className={s.propertyEditorText}>
                {item!.label}
              </span>
            </TableCell>
            <TableCell>
              {item!.editor}
            </TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell>
            <Link onClick={()=>{
              setAddPropertyDialogOpen(true);
            }}>
              {t`添加属性`}
            </Link>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <AddProperty dialogOpen={addPropertyDialogOpen} onOpenChange={(state)=>{setAddPropertyDialogOpen(state);}} onAddProperty={handleAddProperty}/>
  </div>;
};
