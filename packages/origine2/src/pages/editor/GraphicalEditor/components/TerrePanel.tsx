import {Panel, PanelType} from "@fluentui/react";
import React, {ReactNode} from "react";

export function TerrePanel(props: {
  children: ReactNode,
  onDismiss: () => void,
  isOpen: boolean,
  width?: number,
  title: string
}) {
  const {width = 750} = props;
  return <Panel
    styles={{overlay: {background: 'none'}}}
    headerText={props.title}
    isOpen={props.isOpen}
    isLightDismiss
    type={PanelType.custom}
    onDismiss={props.onDismiss}
    customWidth={`${width}px`}
    // You MUST provide this prop! Otherwise, screen readers will just say "button" with no label.
    closeButtonAriaLabel="Close"
  >{props.children}</Panel>;
}
