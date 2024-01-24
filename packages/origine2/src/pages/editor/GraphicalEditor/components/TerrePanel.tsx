import React, {ReactNode} from "react";
import {useExpand} from "@/hooks/useExpand";
import { Button, DrawerBody, DrawerHeader, DrawerHeaderTitle, OverlayDrawer } from "@fluentui/react-components";
import { Dismiss24Filled, Dismiss24Regular, bundleIcon } from "@fluentui/react-icons";

export function TerrePanel(props: {
  children: ReactNode,
  width?: number,
  title: string,
  sentenceIndex: number,
}) {
  const {width = 750} = props;
  const {expandIndex, updateExpandIndex} = useExpand();
  const isExpand = expandIndex === props.sentenceIndex;
  const DismissIcon = bundleIcon(Dismiss24Filled, Dismiss24Regular);
  return (
    <OverlayDrawer
      open={isExpand}   
      onOpenChange={() => updateExpandIndex(0)}
      position="end"
      style={{width:`${width}px`}}
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              aria-label="Close"
              icon={<DismissIcon />}
              onClick={() => updateExpandIndex(0)}
            />
          }
        >
          {props.title}
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody>
        {props.children}
      </DrawerBody>
    </OverlayDrawer>
  );
}
