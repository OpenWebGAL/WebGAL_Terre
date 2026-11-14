import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@fluentui/react-components';
import { AddRegular, DeleteRegular, EyeOffRegular, EyeRegular } from '@fluentui/react-icons';
import { t } from '@lingui/macro';
import ChooseFile from '@/pages/editor/ChooseFile/ChooseFile';
import { extNameMap } from '@/pages/editor/ChooseFile/chooseFileConfig';
import { buildFigureAssetUrl, ICharacterLayer } from '../model/characterDocument';
import styles from './characterPanels.module.scss';

interface ILayerListPanelProps {
  charDirPath: string;
  layers: ICharacterLayer[];
  visibleKeys: Set<string>;
  selectedLayerKey: string | null;
  onSelectLayer: (key: string) => void;
  onAddLayer: (src: string) => void;
  onRemoveLayer: (key: string) => void;
  onReorderLayers: (fromIndex: number, toIndex: number) => void;
  onToggleVisible: (key: string) => void;
  onToggleAllVisible: () => void;
}

/**
 * 右中扁平 PS 风格图层列表：从顶到底对应画布从前到后，支持拖拽排序与显隐切换
 */
export function LayerListPanel(props: ILayerListPanelProps) {
  const {
    charDirPath,
    layers,
    visibleKeys,
    selectedLayerKey,
    onSelectLayer,
    onAddLayer,
    onRemoveLayer,
    onReorderLayers,
    onToggleVisible,
    onToggleAllVisible,
  } = props;

  const allVisible = layers.length > 0 && layers.every((layer) => visibleKeys.has(layer.key));

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    onReorderLayers(result.source.index, result.destination.index);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <ChooseFile
          rootPath={charDirPath.split('/')}
          extNames={extNameMap.get('image')}
          button={<Button size="small" appearance="subtle" icon={<AddRegular />}>{t`添加图层`}</Button>}
          onChange={(file) => {
            if (file) onAddLayer(file.name);
          }}
        />
        <Button
          className={styles.toolbarRight}
          size="small"
          appearance="subtle"
          icon={allVisible ? <EyeRegular /> : <EyeOffRegular />}
          title={allVisible ? t`全部隐藏` : t`全部显示`}
          onClick={onToggleAllVisible}
        />
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="character-layer-list">
          {(droppableProvided) => (
            <div ref={droppableProvided.innerRef} className={styles.scrollList} {...droppableProvided.droppableProps}>
              {layers.map((layer, index) => {
                const isVisible = visibleKeys.has(layer.key);
                const isSelected = layer.key === selectedLayerKey;
                return (
                  <Draggable key={layer.key} draggableId={layer.key} index={index}>
                    {(draggableProvided) => (
                      <div
                        ref={draggableProvided.innerRef}
                        className={`${styles.listRow} ${isSelected ? styles.selected : ''} ${!isVisible ? styles.layerHidden : ''}`}
                        onClick={() => onSelectLayer(layer.key)}
                        {...draggableProvided.draggableProps}
                        {...draggableProvided.dragHandleProps}
                      >
                        <Button
                          className={styles.eyeButton}
                          size="small"
                          appearance="transparent"
                          icon={isVisible ? <EyeRegular /> : <EyeOffRegular />}
                          title={isVisible ? t`隐藏图层` : t`显示图层`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleVisible(layer.key);
                          }}
                        />
                        {layer.component.src && (
                          <img
                            className={styles.thumb20}
                            src={buildFigureAssetUrl(charDirPath, layer.component.src)}
                            alt={layer.key}
                            draggable={false}
                          />
                        )}
                        <span className={styles.ellipsis} title={layer.key}>{layer.key}</span>
                        <Button
                          className={styles.hoverAction}
                          size="small"
                          appearance="transparent"
                          icon={<DeleteRegular />}
                          title={t`删除图层`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveLayer(layer.key);
                          }}
                        />
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
