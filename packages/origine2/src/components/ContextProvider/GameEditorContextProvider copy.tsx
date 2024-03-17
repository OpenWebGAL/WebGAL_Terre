import useEditorStore from "@/store/useEditorStore";
import { TemplateEditorContext, createTemplateEditorStore } from "@/store/useTemplateEditorStore";
import { ReactNode, useRef } from "react";

const TemplateEditorContextProvider = ({ children }: { children: ReactNode}) => {
  const editor = useEditorStore.use.editor();
  if (editor !== 'template') return null;
  const currentEdit = useEditorStore.use.currentEdit();
  const templateEditorStore = useRef(createTemplateEditorStore(currentEdit)).current;
  return(
    <TemplateEditorContext.Provider value={templateEditorStore}>
      {children}
    </TemplateEditorContext.Provider>
  );
};

export default TemplateEditorContextProvider;