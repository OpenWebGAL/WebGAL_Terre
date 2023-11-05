import styles from "./editorSideb.module.scss";
import { IIconProps } from '@fluentui/react';
import { IconButton } from '@fluentui/react/lib/Button';
import { TooltipHost } from '@fluentui/react/lib/Tooltip';
import { CSSProperties, MouseEventHandler } from "react";

interface IEditorSidebarIconProps {
    onClick?: MouseEventHandler<HTMLDivElement>;
    style?: CSSProperties;
    isActive: boolean;
    content: string;
    iconProps: IIconProps;
}

export const EditorSidebarIcon = (props: IEditorSidebarIconProps) => {
  let className = styles.editor_sidebar_control_button;
  if (props.isActive)
    className += ` ${styles.editor_sidebar_control_button_active}`;
  return (
    <div onClick={props.onClick} style={props.style}>
      <div className={className}>
        <TooltipHost content={props.content}>
          <IconButton iconProps={props.iconProps}/>
        </TooltipHost>
      </div>
    </div>
  );
};