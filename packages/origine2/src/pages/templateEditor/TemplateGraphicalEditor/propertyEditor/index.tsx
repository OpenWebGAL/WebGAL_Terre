import {IWebgalCssProp} from "@/pages/templateEditor/TemplateGraphicalEditor/utils/extractCss";
import React from "react";
import WGFontWeight from "@/pages/templateEditor/TemplateGraphicalEditor/propertyEditor/WGFontWeight";
import {t} from "@lingui/macro";
import {Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow} from "@fluentui/react-components";
import s from './propertyEditor.module.scss';

export interface IPropertyEditorProps {
  prop: IWebgalCssProp,
  onSubmit: () => void;
}

type IWebGALStylePropertyEditor = React.FC<IPropertyEditorProps>

export function  geteditorTable(): { propName: string, propLable: string, editor: IWebGALStylePropertyEditor }[] {
  return [
    {propName: 'font-weight', propLable: t`字重`, editor: WGFontWeight},
  ];
}

export default function PropertyEditor(props: { props: IWebgalCssProp[], onSubmit: () => void }) {
  const editors = props.props.map(property => {
    const item = geteditorTable().find(e => e.propName === property.propName);
    if (!item) return null;
    const PropEditor = item.editor;
    return {label: item.propLable, editor: <PropEditor prop={property} onSubmit={props.onSubmit}/>};
  });

  const columns = [
    {columnKey: "property", label: t`属性`},
    {columnKey: "value", label: t`值`},
  ];

  const editorsAvailable = editors.filter(e=>e!==null);

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
      </TableBody>
    </Table>
  </div>;
};
