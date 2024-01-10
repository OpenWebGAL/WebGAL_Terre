import {Panel, PanelType} from "@fluentui/react";
import React, {ReactNode} from "react";
import {useExpand} from "@/hooks/useExpand";

export function TerrePanel(props: {
  children: ReactNode,
  width?: number,
  title: string,
  sentenceIndex: number,
}) {
  const {width = 750} = props;
  const {expandIndex, updateExpandIndex} = useExpand();
  const isExpand = expandIndex === props.sentenceIndex;
  return <Panel
    styles={{overlay: {background: 'none'}, main: {animation: 'none'}}}
    headerText={props.title}
    isOpen={isExpand}
    isLightDismiss
    type={PanelType.custom}
    onDismiss={() => updateExpandIndex(0)}
    customWidth={`${width}px`}
    // You MUST provide this prop! Otherwise, screen readers will just say "button" with no label.
    closeButtonAriaLabel="Close"
  >{props.children}</Panel>;
}
