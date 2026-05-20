import React, {ReactNode, useEffect, useState} from "react";
import { Button, DrawerBody, DrawerHeader, DrawerHeaderTitle, OverlayDrawer} from "@fluentui/react-components";
import { Dismiss24Filled, Dismiss24Regular, bundleIcon } from "@fluentui/react-icons";
import useEditorStore from "@/store/useEditorStore";
import styles from "./terrePanel.module.scss";
import { eventBus } from "@/utils/eventBus";

export function TerrePanel(props: {
  children: ReactNode,
  bottomBarChildren?: ReactNode
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
      className={styles.overlayDrawer}
      style={{width:`${width}px`}}
      backdrop={null}
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
      <div className={styles.bottomBar} style={{display: props.bottomBarChildren ? 'inherit' : 'none'}}>
        {props.bottomBarChildren}
      </div>
    </OverlayDrawer>
  );
}

export function GlobalTerrePanel() {
  const DismissIcon = bundleIcon(Dismiss24Filled, Dismiss24Regular);
  const [panel, setPanel] = useState<{
    title: string;
    children: ReactNode;
    bottomBarChildren?: ReactNode;
    width?: number;
  } | null>(null);

  useEffect(() => {
    const handleOpen = (payload: {
      title: string;
      children: ReactNode;
      bottomBarChildren?: ReactNode;
      width?: number;
    }) => setPanel(payload);
    eventBus.on('editor:open-global-terre-panel', handleOpen);
    return () => {
      eventBus.off('editor:open-global-terre-panel', handleOpen);
    };
  }, []);

  return (
    <OverlayDrawer
      open={!!panel}
      onOpenChange={(_, data) => !data.open && setPanel(null)}
      position="end"
      className={styles.overlayDrawer}
      style={{ width: `${panel?.width ?? 750}px` }}
      backdrop={null}
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              aria-label="Close"
              icon={<DismissIcon />}
              onClick={() => setPanel(null)}
            />
          }
        >
          {panel?.title}
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody>
        {panel?.children}
      </DrawerBody>
      <div className={styles.bottomBar} style={{display: panel?.bottomBarChildren ? 'inherit' : 'none'}}>
        {panel?.bottomBarChildren}
      </div>
    </OverlayDrawer>
  );
}
