import { useCallback, useMemo, useState } from 'react';
import { ResizableSplit } from '../AnimationEditor/components/ResizableSplit';
import { CharacterCanvas } from './canvas/CharacterCanvas';
import { INaturalSize } from './canvas/hitTestLayer';
import { resolveCanvasLayers } from './model/characterOperations';
import { useCharacterDocument } from './model/useCharacterDocument';
import { LayerInspectorPanel } from './panels/LayerInspectorPanel';
import { LayerListPanel } from './panels/LayerListPanel';
import { PresetEditorPanel } from './panels/PresetEditorPanel';

interface ICharacterEditorProps {
  url: string;
  initialText: string;
}

/**
 * 合成角色图形编辑器：左侧为可缩放平移与直接拖动的立绘舞台，右侧为属性、图层与预设面板
 */
export function CharacterEditor({ url, initialText }: ICharacterEditorProps) {
  const {
    doc,
    selectedLayerKey,
    setSelectedLayerKey,
    visibleKeys,
    selectedPresetKey,
    setCanvasSize,
    addLayer,
    updateLayer,
    renameLayer,
    removeLayer,
    reorderLayers,
    toggleLayerVisible,
    toggleAllVisible,
    selectPreset,
    createPresetFromVisible,
    renamePreset,
    togglePresetLayer,
    removePreset,
  } = useCharacterDocument(url, initialText);

  const [naturalSizes, setNaturalSizes] = useState<Record<string, INaturalSize>>({});

  const charDirPath = useMemo(() => url.replace(/^\/+/, '').replace(/\/[^/]+$/, ''), [url]);
  const selectedLayer = useMemo(
    () => doc.layers.find((layer) => layer.key === selectedLayerKey) ?? null,
    [doc.layers, selectedLayerKey],
  );
  const canvasLayers = useMemo(
    () => resolveCanvasLayers(doc, selectedPresetKey),
    [doc, selectedPresetKey],
  );

  const handleImageLoad = useCallback((assetUrl: string, size: INaturalSize) => {
    if (size.width <= 0 || size.height <= 0) return;
    setNaturalSizes((prev) => {
      const existing = prev[assetUrl];
      if (existing && existing.width === size.width && existing.height === size.height) return prev;
      return { ...prev, [assetUrl]: size };
    });
  }, []);

  const canvas = (
    <CharacterCanvas
      charDirPath={charDirPath}
      canvas={doc.canvas}
      layers={canvasLayers}
      visibleKeys={visibleKeys}
      selectedLayerKey={selectedLayerKey}
      naturalSizes={naturalSizes}
      onImageLoad={handleImageLoad}
      onCanvasChange={setCanvasSize}
      onSelectLayer={setSelectedLayerKey}
      onUpdateLayer={updateLayer}
    />
  );

  const inspectorPanel = (
    <LayerInspectorPanel
      charDirPath={charDirPath}
      layer={selectedLayer}
      naturalSizes={naturalSizes}
      onImageLoad={handleImageLoad}
      onRenameLayer={renameLayer}
      onUpdateLayer={updateLayer}
    />
  );

  const layerListPanel = (
    <LayerListPanel
      charDirPath={charDirPath}
      layers={doc.layers}
      visibleKeys={visibleKeys}
      selectedLayerKey={selectedLayerKey}
      onSelectLayer={setSelectedLayerKey}
      onAddLayer={addLayer}
      onRemoveLayer={removeLayer}
      onReorderLayers={reorderLayers}
      onToggleVisible={toggleLayerVisible}
      onToggleAllVisible={toggleAllVisible}
    />
  );

  const presetEditorPanel = (
    <PresetEditorPanel
      layers={doc.layers}
      presets={doc.presets}
      selectedPresetKey={selectedPresetKey}
      onSelectPreset={selectPreset}
      onCreatePreset={createPresetFromVisible}
      onRenamePreset={renamePreset}
      onTogglePresetLayer={togglePresetLayer}
      onRemovePreset={removePreset}
    />
  );

  const rightSide = (
    <ResizableSplit
      direction="vertical"
      storageKey="character-editor-right-top-split"
      defaultRatio={0.34}
      first={inspectorPanel}
      second={
        <ResizableSplit
          direction="vertical"
          storageKey="character-editor-right-bottom-split"
          defaultRatio={0.52}
          first={layerListPanel}
          second={presetEditorPanel}
        />
      }
    />
  );

  return (
    <ResizableSplit
      direction="horizontal"
      storageKey="character-editor-main-split"
      defaultRatio={0.64}
      first={canvas}
      second={rightSide}
    />
  );
}
