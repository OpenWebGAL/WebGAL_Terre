import React, {ReactNode} from "react";
import { Button, DrawerBody, DrawerHeader, DrawerHeaderTitle, OverlayDrawer } from "@fluentui/react-components";
import { Dismiss24Filled, Dismiss24Regular, bundleIcon } from "@fluentui/react-icons";
import useEditorStore from "@/store/useEditorStore";

export function TerrePanel(props: {
  children: ReactNode,
  width?: number,
  title: string,
  sentenceIndex: number,
}) {
  const {width = 750} = props;
  const expand = useEditorStore.use.expand();
  const updateExpand = useEditorStore.use.updateExpand();
  const isExpand = expand === props.sentenceIndex;
  const DismissIcon = bundleIcon(Dismiss24Filled, Dismiss24Regular);
  return (
    <OverlayDrawer
      open={isExpand}
      onOpenChange={() => updateExpand(0)}
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
              onClick={() => updateExpand(0)}
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
