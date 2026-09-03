import { ITemplateEditorAction, ITemplateEditorState } from '@/types/templateEditor';
import { createContext, useContext } from 'react';
import { StoreApi, create, useStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const initState: ITemplateEditorState = {
  tabs: [],
  currentTab: null,
  expandNode: [],
  isCodeMode: false,
  isShowDebugger: false,
};

export const createTemplateEditorStore = (templateName: string) =>
  create<ITemplateEditorState & ITemplateEditorAction>()(
    persist(
      (set) => ({
        ...initState,
        updateTabs: (tabs) => set({ tabs }),
        updateCurrentTab: (currentTab) => set({ currentTab }),
        updateExpandNode: (expandNode) => set({ expandNode }),
        updateIsCodeMode: (isCodeMode) => set({ isCodeMode }),
        updateIsShowDebugger: (isShowDebugger) => set({ isShowDebugger }),
      }),
      {
        name: `template-editor-storage-${templateName}`,
        storage: createJSONStorage(() => localStorage),
        // 只持久化仍然需要的字段，避免旧数据里已移除的尺寸字段残留
        partialize: (state) => ({
          tabs: state.tabs,
          currentTab: state.currentTab,
          expandNode: state.expandNode,
          isCodeMode: state.isCodeMode,
          isShowDebugger: state.isShowDebugger,
        }),
      },
    ),
  );

export const TemplateEditorContext = createContext<StoreApi<ITemplateEditorState & ITemplateEditorAction> | null>(null);

export const useTemplateEditorContext = <T>(
  selector: (state: ITemplateEditorState & ITemplateEditorAction) => T,
): T => {
  const store = useContext(TemplateEditorContext);
  if (!store) throw new Error('Missing TemplateEditorContext.Provider in the tree');
  return useStore(store, selector);
};

/**
 * 模板侧栏两个固定段高度的持久化 key 前缀（MultiSplitPane 的 persistKey）。
 */
export const TEMPLATE_SIDEBAR_HEIGHTS_KEY_PREFIX = 'template-sidebar-heights-';

const DEFAULT_SIDEBAR_HEIGHTS: [number, number] = [148, 400];

export function readTemplateSidebarHeights(templateDir: string): [number, number] {
  try {
    const newKey = `${TEMPLATE_SIDEBAR_HEIGHTS_KEY_PREFIX}${templateDir}`;
    const newRaw = localStorage.getItem(newKey);
    if (newRaw !== null) {
      const parsed = JSON.parse(newRaw) as unknown;
      if (
        Array.isArray(parsed) &&
        parsed.length === 2 &&
        parsed.every((n) => typeof n === 'number' && !Number.isNaN(n))
      ) {
        return [parsed[0], parsed[1]];
      }
    }

    const oldRaw = localStorage.getItem(`template-editor-storage-${templateDir}`);
    if (oldRaw !== null) {
      const parsed = JSON.parse(oldRaw) as { state?: Record<string, unknown> };
      const actionsHeight = parsed.state?.templateActionsHeight;
      const treeHeight = parsed.state?.componentTreeHeight;
      if (typeof actionsHeight === 'number' && typeof treeHeight === 'number') {
        localStorage.setItem(newKey, JSON.stringify([actionsHeight, treeHeight]));
        return [actionsHeight, treeHeight];
      }
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_SIDEBAR_HEIGHTS;
}
