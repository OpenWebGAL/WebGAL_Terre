import { goTo } from "@/router";
import { templateListFetcher } from "@/pages/dashboard/DashBoard";
import useEditorStore from "@/store/useEditorStore";
import { TemplateEditorContext, createTemplateEditorStore } from "@/store/useTemplateEditorStore";
import { Spinner } from "@fluentui/react-components";
import { ReactNode, useRef } from "react";
import useSWR from "swr";

const TemplateEditorProvider = ({ children }: { children: ReactNode }) => {
  const page = useEditorStore.use.page();
  const templateDir = useEditorStore.use.subPage();

  if (page !== 'template' || !templateDir) {
    goTo('dashboard', 'template');
  }

  const {data: templateList, isLoading: templateListLoading} = useSWR("template-list", templateListFetcher);
  const fristLoading = templateListLoading && !templateList;
  const inTemplateList = templateList && templateList.length > 0 && templateList.some((template) => template.dir === templateDir);

  if (!fristLoading && !inTemplateList) {
    goTo('dashboard', 'template');
  }

  return (
    <>
      {
        fristLoading &&
       <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
         <Spinner labelPosition="below" label={templateDir} />
       </div>
      }
      {inTemplateList && !fristLoading && <TemplateEditorContextProvider>{children}</TemplateEditorContextProvider>}
    </>
  );
};

const TemplateEditorContextProvider = ({ children }: { children: ReactNode}) => {
  const page = useEditorStore.use.page();
  const subPage = useEditorStore.use.subPage();
  if (page !== 'template' || !subPage) goTo('dashboard');
  const templateEditorStore = useRef(createTemplateEditorStore(subPage)).current;
  return(
    <TemplateEditorContext.Provider value={templateEditorStore}>
      {children}
    </TemplateEditorContext.Provider>
  );
};

export default TemplateEditorProvider;
