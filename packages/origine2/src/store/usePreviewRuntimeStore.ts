import { IPreviewRuntimeAction, IPreviewRuntimeState } from '@/types/previewRuntime';
import createSelectors from '@/utils/createSelectors';
import { create } from 'zustand';

const initState: IPreviewRuntimeState = {
  version: null,
  template: null,
  gameInfo: null,
};

const usePreviewRuntimeStoreBase = create<IPreviewRuntimeState & IPreviewRuntimeAction>()((set) => ({
  ...initState,
  updateVersion: (version) => set({ version }),
  updateTemplate: (template) => set({ template }),
  updateGameInfo: (gameInfo) => set({ gameInfo }),
  resetPreviewRuntime: () => set(initState),
}));

const usePreviewRuntimeStore = createSelectors(usePreviewRuntimeStoreBase);

export default usePreviewRuntimeStore;
