import { useCallback, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import useSWR, { useSWRConfig } from 'swr';
import type {
  UiPartDescriptor,
  UiPreviewMode,
  UiPseudoState,
  UiScreenId,
  UiScreenUpdatedPayload,
} from '@webgal/editor-preview-protocol';
import { api } from '@/api';
import { useTemplateEditorContext } from '@/store/useTemplateEditorStore';
import { EditorPreviewClient } from '@/utils/editorPreviewClient';
import { eventBus } from '@/utils/eventBus';
import {
  DEFAULT_SCREEN_VARIANTS,
  isCustomUiTemplate,
  type TemplateScreenId,
  type TemplateScreensInfo,
} from '../screenCatalog';
import { ensureEditableScss } from '../styleModel';

export function useTemplateScreenSession(templateDir: string) {
  const { mutate } = useSWRConfig();

  const activeScreenId = useTemplateEditorContext((s) => s.activeScreenId);
  const previewMode = useTemplateEditorContext((s) => s.previewMode);
  const useMockData = useTemplateEditorContext((s) => s.useMockData);
  const isPreviewReady = useTemplateEditorContext((s) => s.isPreviewReady);
  const screenPayload = useTemplateEditorContext((s) => s.screenPayload);
  const draftScssText = useTemplateEditorContext((s) => s.draftScssText);
  const selectedPartId = useTemplateEditorContext((s) => s.selectedPartId);
  const lockedState = useTemplateEditorContext((s) => s.lockedState);
  const applyStyleIgnored = useTemplateEditorContext((s) => s.applyStyleIgnored);

  const updateActiveScreenId = useTemplateEditorContext((s) => s.updateActiveScreenId);
  const updatePreviewMode = useTemplateEditorContext((s) => s.updatePreviewMode);
  const updateUseMockData = useTemplateEditorContext((s) => s.updateUseMockData);
  const updateIsPreviewReady = useTemplateEditorContext((s) => s.updateIsPreviewReady);
  const updateScreenPayload = useTemplateEditorContext((s) => s.updateScreenPayload);
  const updateDraftScssText = useTemplateEditorContext((s) => s.updateDraftScssText);
  const updateSelectedPartId = useTemplateEditorContext((s) => s.updateSelectedPartId);
  const updateLockedState = useTemplateEditorContext((s) => s.updateLockedState);
  const updateApplyStyleIgnored = useTemplateEditorContext((s) => s.updateApplyStyleIgnored);

  const { data: templateConfig, mutate: mutateTemplateConfig } = useSWR(
    templateDir ? `/templateConfig/${templateDir}` : null,
    async () => (await api.manageTemplateControllerGetTemplateConfig(templateDir)).data,
  );

  const { data: screensInfo, mutate: mutateScreensInfo } = useSWR(
    templateDir ? `/templateScreens/${templateDir}` : null,
    async () => (await api.manageTemplateControllerGetTemplateScreens(templateDir)).data as TemplateScreensInfo,
  );

  const isLoadingConfig = Boolean(
    templateDir && templateConfig === undefined && screensInfo === undefined,
  );

  const isCustomUi = useMemo(() => {
    if (screensInfo) {
      return screensInfo.uiMode === 'custom' && !screensInfo.isLegacy;
    }
    return isCustomUiTemplate(
      templateConfig as { 'webgal-version'?: string; uiMode?: string; screens?: Record<string, string> } | undefined,
    );
  }, [screensInfo, templateConfig]);

  const activeVariantMeta = useMemo(() => {
    if (!activeScreenId) {
      return { variantId: '', scssPath: null as string | null };
    }
    const entry = screensInfo?.screens.find((item) => item.screen === activeScreenId);
    const variantId = entry?.activeVariant ?? DEFAULT_SCREEN_VARIANTS[activeScreenId as TemplateScreenId];
    const variant = entry?.variants.find((item) => item.variantId === variantId);
    const scssPath = variant?.scssPath ?? `screens/${activeScreenId}/${variantId}/style.scss`;
    return { variantId, scssPath };
  }, [screensInfo, activeScreenId]);

  const activeFilePath = useMemo(
    () => (templateDir && activeVariantMeta.scssPath ? `templates/${templateDir}/${activeVariantMeta.scssPath}` : null),
    [templateDir, activeVariantMeta.scssPath],
  );

  const parts: UiPartDescriptor[] = useMemo(() => {
    if (!activeScreenId || !screenPayload || screenPayload.screen !== activeScreenId) return [];
    return screenPayload.parts;
  }, [screenPayload, activeScreenId]);

  const selectedPart = useMemo(
    () => parts.find((part) => part.id === selectedPartId) ?? null,
    [parts, selectedPartId],
  );

  const selectedPseudoLockSelector = selectedPart
    ? (selectedPart.stateHostSelector ?? selectedPart.selector)
    : null;

  const stateRef = useRef({
    activeScreenId,
    screenPayload,
    previewMode,
    useMockData,
    lockedState,
    selectedPartId,
    selectedSelector: selectedPseudoLockSelector,
    variantId: activeVariantMeta.variantId,
    draftScssText,
    isCustomUi,
  });
  stateRef.current = {
    activeScreenId,
    screenPayload,
    previewMode,
    useMockData,
    lockedState,
    selectedPartId,
    selectedSelector: selectedPseudoLockSelector,
    variantId: activeVariantMeta.variantId,
    draftScssText,
    isCustomUi,
  };

  const loadedFileRef = useRef<string | null>(null);
  const ensuredSignatureRef = useRef<string | null>(null);
  const pendingScreenRef = useRef<UiScreenId | null>(null);
  const reopenVerifyScreenRef = useRef<UiScreenId | null>(null);
  const pendingVariantRef = useRef<{ screen: UiScreenId; variantId: string; expiresAt: number } | null>(null);

  useEffect(() => {
    if (!isCustomUi || !activeFilePath) {
      loadedFileRef.current = null;
      ensuredSignatureRef.current = null;
      return;
    }
    let cancelled = false;
    loadedFileRef.current = null;
    ensuredSignatureRef.current = null;

    axios
      .get(activeFilePath, { responseType: 'text', transformResponse: [(data) => data] })
      .then((res) => {
        if (cancelled) return;
        const text = typeof res.data === 'string' ? res.data : '';
        loadedFileRef.current = activeFilePath;
        updateDraftScssText(text);
      })
      .catch(() => {
        if (cancelled) return;
        loadedFileRef.current = activeFilePath;
        updateDraftScssText('');
      });

    return () => {
      cancelled = true;
    };
  }, [isCustomUi, activeFilePath, updateDraftScssText]);

  useEffect(() => {
    if (!isCustomUi || !activeFilePath || loadedFileRef.current !== activeFilePath) return;
    if (!screenPayload || screenPayload.screen !== activeScreenId) return;
    if (screenPayload.variantId !== activeVariantMeta.variantId) return;

    const signature = `${activeFilePath}::${screenPayload.variantId}::${screenPayload.defaultCssText.length}`;
    if (ensuredSignatureRef.current === signature) return;
    ensuredSignatureRef.current = signature;

    const nextScss = ensureEditableScss(screenPayload.defaultCssText, stateRef.current.draftScssText);
    if (nextScss !== stateRef.current.draftScssText) {
      updateDraftScssText(nextScss);
    }
  }, [isCustomUi, activeFilePath, activeScreenId, activeVariantMeta.variantId, screenPayload, updateDraftScssText]);

  useEffect(() => {
    const applyScreenPayload = (payload: UiScreenUpdatedPayload) => {
      const wasPending = pendingScreenRef.current !== null;
      if (pendingScreenRef.current !== null) {
        if (payload.screen !== pendingScreenRef.current) {
          return;
        }
        pendingScreenRef.current = null;
      }
      const pendingVariant = pendingVariantRef.current;
      if (pendingVariant !== null) {
        if (
          payload.screen === pendingVariant.screen
          && payload.variantId !== pendingVariant.variantId
          && Date.now() < pendingVariant.expiresAt
        ) {
          return;
        }
        pendingVariantRef.current = null;
      }
      if (reopenVerifyScreenRef.current !== null && payload.screen === reopenVerifyScreenRef.current) {
        reopenVerifyScreenRef.current = null;
        if (payload.parts.length > 0 && payload.parts.every((p) => p.box === null)) {
          pendingScreenRef.current = payload.screen;
          EditorPreviewClient.setActiveUiScreen({ screen: payload.screen });
          return;
        }
      }
      updateScreenPayload(payload);
      if (!wasPending && stateRef.current.activeScreenId === null) {
        return;
      }
      if (payload.screen && payload.screen !== stateRef.current.activeScreenId) {
        updateActiveScreenId(payload.screen);
      }
      const nextPartExists = payload.parts.some((p) => p.id === stateRef.current.selectedPartId);
      if (!nextPartExists) {
        updateSelectedPartId(payload.parts[0]?.id ?? null);
      }
    };

    const syncInitialSession = () => {
      const current = stateRef.current;
      reopenVerifyScreenRef.current = null;
      EditorPreviewClient.setUiEditMode({ mode: current.previewMode });
      EditorPreviewClient.setUiMockData({ enabled: current.useMockData });
      if (!current.activeScreenId) {
        pendingScreenRef.current = null;
        return;
      }
      pendingScreenRef.current = current.activeScreenId;
      EditorPreviewClient.setActiveUiScreen({ screen: current.activeScreenId });
      if (current.lockedState !== 'default') {
        EditorPreviewClient.setUiPseudoState({
          screen: current.activeScreenId,
          selector: current.selectedSelector,
          pseudoState: current.lockedState,
        });
      }
    };

    const cached = EditorPreviewClient.getLastUiScreenPayload();
    if (cached) {
      applyScreenPayload(cached);
    }

    const handleReady = (payload: { ready: boolean }) => {
      updateIsPreviewReady(payload.ready);
      if (payload.ready) {
        syncInitialSession();
      }
    };

    eventBus.on('editor-preview:ready', handleReady);
    const unsubscribeUi = EditorPreviewClient.subscribeUiEvents({
      onScreenUpdated: applyScreenPayload,
      onPartSelected: (payload) => {
        if (pendingScreenRef.current !== null && payload.screen !== pendingScreenRef.current) {
          return;
        }
        if (pendingScreenRef.current === null && stateRef.current.activeScreenId === null) {
          return;
        }
        if (payload.screen !== stateRef.current.activeScreenId) {
          updateActiveScreenId(payload.screen);
        }
        updateSelectedPartId(payload.partId);
      },
      onApplyStyleIgnored: (payload) => {
        updateApplyStyleIgnored(payload);
      },
    });

    return () => {
      eventBus.off('editor-preview:ready', handleReady);
      unsubscribeUi();
    };
  }, [
    updateActiveScreenId,
    updateApplyStyleIgnored,
    updateIsPreviewReady,
    updateScreenPayload,
    updateSelectedPartId,
  ]);

  const activateScreen = useCallback(
    (screen: UiScreenId) => {
      pendingVariantRef.current = null;
      if (stateRef.current.activeScreenId === screen) {
        pendingScreenRef.current = null;
        reopenVerifyScreenRef.current = null;
        updateActiveScreenId(null);
        updateSelectedPartId(null);
        updateApplyStyleIgnored(null);
        EditorPreviewClient.selectUiPart({ screen, partId: null });
        return;
      }

      const cachedPayload = EditorPreviewClient.getLastUiScreenPayload() ?? stateRef.current.screenPayload;
      if (
        cachedPayload
        && cachedPayload.screen === screen
        && (cachedPayload.parts.length === 0 || cachedPayload.parts.some((p) => p.box !== null))
      ) {
        pendingScreenRef.current = null;
        reopenVerifyScreenRef.current = screen;
        if (cachedPayload !== stateRef.current.screenPayload) {
          updateScreenPayload(cachedPayload);
        }
        updateActiveScreenId(screen);
        const nextPart = cachedPayload.parts[0] ?? null;
        updateSelectedPartId(nextPart?.id ?? null);
        updateApplyStyleIgnored(null);
        EditorPreviewClient.selectUiPart({ screen, partId: nextPart?.id ?? null });
        if (stateRef.current.lockedState !== 'default') {
          EditorPreviewClient.setUiPseudoState({
            screen,
            selector: nextPart ? (nextPart.stateHostSelector ?? nextPart.selector) : null,
            pseudoState: stateRef.current.lockedState,
          });
        }
        return;
      }

      pendingScreenRef.current = screen;
      reopenVerifyScreenRef.current = null;
      updateActiveScreenId(screen);
      updateSelectedPartId(null);
      updateApplyStyleIgnored(null);
      EditorPreviewClient.setActiveUiScreen({ screen });
    },
    [updateActiveScreenId, updateApplyStyleIgnored, updateScreenPayload, updateSelectedPartId],
  );

  const selectPart = useCallback(
    (partId: string | null) => {
      if (!activeScreenId) {
        updateSelectedPartId(null);
        return;
      }
      updateSelectedPartId(partId);
      EditorPreviewClient.selectUiPart({ screen: activeScreenId, partId });
      if (lockedState !== 'default') {
        const nextPart = parts.find((part) => part.id === partId);
        EditorPreviewClient.setUiPseudoState({
          screen: activeScreenId,
          selector: nextPart ? (nextPart.stateHostSelector ?? nextPart.selector) : null,
          pseudoState: lockedState,
        });
      }
    },
    [activeScreenId, lockedState, parts, updateSelectedPartId],
  );

  const setPreviewMode = useCallback(
    (mode: UiPreviewMode) => {
      updatePreviewMode(mode);
      EditorPreviewClient.setUiEditMode({ mode });
    },
    [updatePreviewMode],
  );

  const setMockData = useCallback(
    (enabled: boolean) => {
      updateUseMockData(enabled);
      EditorPreviewClient.setUiMockData({ enabled });
    },
    [updateUseMockData],
  );

  const setLockedState = useCallback(
    (pseudoState: UiPseudoState) => {
      updateLockedState(pseudoState);
      if (!activeScreenId) return;
      EditorPreviewClient.setUiPseudoState({
        screen: activeScreenId,
        selector: selectedPseudoLockSelector,
        pseudoState,
      });
    },
    [activeScreenId, selectedPseudoLockSelector, updateLockedState],
  );

  const previewScss = useCallback(
    (nextScss: string) => {
      if (!activeScreenId) return;
      updateDraftScssText(nextScss);
      updateApplyStyleIgnored(null);
      EditorPreviewClient.setUiPartStyle({
        screen: activeScreenId,
        variantId: activeVariantMeta.variantId,
        scssText: nextScss,
        phase: 'preview',
      });
    },
    [activeScreenId, activeVariantMeta.variantId, updateApplyStyleIgnored, updateDraftScssText],
  );

  const commitScss = useCallback(
    async (nextScss: string) => {
      if (!activeScreenId) return;
      updateDraftScssText(nextScss);
      updateApplyStyleIgnored(null);
      EditorPreviewClient.setUiPartStyle({
        screen: activeScreenId,
        variantId: activeVariantMeta.variantId,
        scssText: nextScss,
        phase: 'commit',
      });
      if (activeFilePath) {
        await api.assetsControllerEditTextFile({ path: activeFilePath, textFile: nextScss });
        await mutate(activeFilePath, nextScss, false);
      }
    },
    [activeFilePath, activeScreenId, activeVariantMeta.variantId, mutate, updateApplyStyleIgnored, updateDraftScssText],
  );

  const commitScssFromCode = useCallback(
    (nextScss: string) => {
      if (!activeScreenId) return;
      updateDraftScssText(nextScss);
      updateApplyStyleIgnored(null);
      EditorPreviewClient.setUiPartStyle({
        screen: activeScreenId,
        variantId: activeVariantMeta.variantId,
        scssText: nextScss,
        phase: 'commit',
      });
    },
    [activeScreenId, activeVariantMeta.variantId, updateApplyStyleIgnored, updateDraftScssText],
  );

  const switchVariant = useCallback(
    async (screen: UiScreenId, variantId: string) => {
      reopenVerifyScreenRef.current = null;
      pendingScreenRef.current = screen;
      pendingVariantRef.current = { screen, variantId, expiresAt: Date.now() + 1500 };
      try {
        await api.manageTemplateControllerSwitchScreenVariant({
          templateDir,
          screen,
          variantId,
        });
        await Promise.all([mutateScreensInfo(), mutateTemplateConfig()]);
        pendingVariantRef.current = { screen, variantId, expiresAt: Date.now() + 1500 };
        updateActiveScreenId(screen);
        EditorPreviewClient.reloadTemplates();
        EditorPreviewClient.setActiveUiScreen({ screen });
      } catch (error) {
        pendingScreenRef.current = null;
        pendingVariantRef.current = null;
        throw error;
      }
    },
    [mutateScreensInfo, mutateTemplateConfig, templateDir, updateActiveScreenId],
  );

  const importVariant = useCallback(
    async (screen: UiScreenId, file: File) => {
      reopenVerifyScreenRef.current = null;
      pendingScreenRef.current = screen;
      pendingVariantRef.current = null;
      try {
        const resp = await api.manageTemplateControllerImportScreenVariant({
          file,
          templateDir,
          screen,
        });
        if (resp.data?.variantId) {
          pendingVariantRef.current = {
            screen,
            variantId: resp.data.variantId,
            expiresAt: Date.now() + 1500,
          };
        }
        await Promise.all([mutateScreensInfo(), mutateTemplateConfig()]);
        updateActiveScreenId(screen);
        EditorPreviewClient.reloadTemplates();
        EditorPreviewClient.setActiveUiScreen({ screen });
      } catch (error) {
        pendingScreenRef.current = null;
        pendingVariantRef.current = null;
        throw error;
      }
    },
    [mutateScreensInfo, mutateTemplateConfig, templateDir, updateActiveScreenId],
  );

  const upgradeCurrentTemplate = useCallback(async () => {
    if (!templateDir) return;
    await api.manageTemplateControllerUpgradeTemplate({ templateDir });
    await Promise.all([
      mutateTemplateConfig(),
      mutateScreensInfo(),
      mutate('template-list'),
      mutate('template-list-selector'),
    ]);
    EditorPreviewClient.reloadTemplates();
  }, [mutate, mutateScreensInfo, mutateTemplateConfig, templateDir]);

  return {
    templateConfig,
    screensInfo: screensInfo ?? null,
    isLoadingConfig,
    isCustomUi,
    isPreviewReady,
    activeScreenId,
    activeVariantId: activeVariantMeta.variantId,
    activeScssPath: activeVariantMeta.scssPath,
    previewMode,
    useMockData,
    draftScssText,
    parts,
    selectedPartId,
    selectedPart,
    lockedState,
    applyStyleIgnored,
    activateScreen,
    selectPart,
    setPreviewMode,
    setMockData,
    setLockedState,
    previewScss,
    commitScss,
    commitScssFromCode,
    switchVariant,
    importVariant,
    upgradeCurrentTemplate,
  };
}
