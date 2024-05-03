import {IWebgalCssProp} from "@/pages/templateEditor/TemplateGraphicalEditor/utils/extractCss";
import React, {useState} from "react";
import {t} from "@lingui/macro";
import {
  Button,
  Dialog, DialogActions, DialogBody, DialogContent,
  DialogSurface, DialogTitle,
  DialogTrigger,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow
} from "@fluentui/react-components";
import s from './propertyEditor.module.scss';
import AddProperty from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/AddProperty";
import {getEditorTable} from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/editorTable";
import {IconButton} from "@fluentui/react";
import WGCustomProperty
  from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/propertyEditor/WGCustomProperty";
import {getMdnLink} from "@/pages/templateEditor/TemplateGraphicalEditor/utils/getMdnLink";


export default function WebgalClassEditor(props: { props: IWebgalCssProp[], onSubmit: () => void }) {
  const editors = props.props.map(property => {
    const item = getEditorTable().find(e => e.propName === property.propName);
    if (!item) return {
      label: property.propName,
      editor: <WGCustomProperty prop={property} onSubmit={props.onSubmit}/>,
      propertyName: property.propName
    };
    const PropEditor = item.editor;
    return {
      label: item.propLable,
      editor: <PropEditor prop={property} onSubmit={props.onSubmit}/>,
      propertyName: property.propName
    };
  });

  const columns = [
    {columnKey: "property", label: t`属性`},
    {columnKey: "value", label: t`值`},
  ];

  const editorsAvailable = editors.filter(e => e !== null);
  const [addPropertyDialogOpen, setAddPropertyDialogOpen] = useState(false);

  const handleAddProperty = (propName: string, propValue: string) => {
    if (!props.props.find(e => e.propName === propName))
      props.props.push({propName, propValue});
    props.onSubmit();
  };

  const handleDeleteProperty = (propertyName: string) => {
    const index = props.props.findIndex(prop => prop.propName === propertyName);
    if (index !== -1) {
      props.props.splice(index, 1);
    }
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
              <div className={s.propertyNameCell}>
                <span className={s.propertyEditorText}>
                  {item!.label}
                </span>
                <Dialog>
                  <DialogTrigger disableButtonEnhancement>
                    <IconButton
                      iconProps={{iconName: 'Delete'}}
                      title={t`删除属性`}
                      ariaLabel={t`删除属性`}
                    />
                  </DialogTrigger>
                  <DialogSurface>
                    <DialogBody>
                      <DialogTitle>{t`删除属性`}</DialogTitle>
                      <DialogContent>
                        {t`要删除属性${item?.label}吗？`}
                      </DialogContent>
                      <DialogActions>
                        <DialogTrigger disableButtonEnhancement>
                          <Button appearance="secondary">{t`返回`}</Button>
                        </DialogTrigger>
                        <DialogTrigger disableButtonEnhancement>
                          <Button appearance="primary"
                            onClick={() => handleDeleteProperty(item!.propertyName)}>{t`删除`}</Button>
                        </DialogTrigger>
                      </DialogActions>
                    </DialogBody>
                  </DialogSurface>
                </Dialog>
                <span>
                  <Link href={getMdnLink(item!.propertyName)} target="_blank">
                    {t`帮助文档`}
                  </Link>
                </span>
              </div>
            </TableCell>
            <TableCell>
              {item!.editor}
            </TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell>
            <Link onClick={() => {
              setAddPropertyDialogOpen(true);
            }}>
              {t`添加属性`}
            </Link>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <AddProperty dialogOpen={addPropertyDialogOpen} onOpenChange={(state) => {
      setAddPropertyDialogOpen(state);
    }} onAddProperty={handleAddProperty}/>
  </div>;
};
