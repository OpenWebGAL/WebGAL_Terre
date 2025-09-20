import React, { useState, memo, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import styles from './CustomNode.module.scss';
import ChooseFile from '@/pages/editor/ChooseFile/ChooseFile';
import { Input } from '@fluentui/react-components';
import { DocumentTextFilled, DocumentTextRegular, bundleIcon } from '@fluentui/react-icons';
import { IFlowchartNodeData } from '@/types/flowchart';
import { extNameMap } from '@/pages/editor/ChooseFile/chooseFileConfig';

const DocumentTextIcon = bundleIcon(DocumentTextFilled, DocumentTextRegular);

interface CustomNodeProps extends NodeProps {
  data: IFlowchartNodeData;
  id: string;
}

const CustomNode = memo(({ data, selected, id }: CustomNodeProps) => {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [tempLabel, setTempLabel] = useState(data.label);
  const [sceneName, setSceneName] = useState(data.sceneName || '');

  useEffect(() => {
    setSceneName(data.sceneName || '');
  }, [data.sceneName]);

  const handleLabelSave = () => {
    if (tempLabel.trim()) {
      data.label = tempLabel;
      // 触发节点更新事件
      window.dispatchEvent(new CustomEvent('flowchart-node-update', {
        detail: { nodeId: id, data: { ...data, label: tempLabel } }
      }));
    }
    setIsEditingLabel(false);
  };

  const handleSceneSelect = (file: any) => {
    const newSceneName = file?.name || '';
    setSceneName(newSceneName);
    data.sceneName = newSceneName;
    // 触发节点更新事件
    window.dispatchEvent(new CustomEvent('flowchart-node-update', {
      detail: { nodeId: id, data: { ...data, sceneName: newSceneName } }
    }));
  };

  return (
    <div className={`${styles.customNode} ${selected ? styles.selected : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        className={styles.handle}
      />

      <div className={styles.nodeContent}>
        <div className={styles.nodeHeader}>
          {isEditingLabel ? (
            <Input
              size="small"
              value={tempLabel}
              onChange={(e) => setTempLabel(e.target.value)}
              onBlur={handleLabelSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleLabelSave();
                }
                if (e.key === 'Escape') {
                  setTempLabel(data.label);
                  setIsEditingLabel(false);
                }
              }}
              autoFocus
              style={{ width: '100%' }}
            />
          ) : (
            <div
              className={styles.nodeLabel}
              onDoubleClick={() => {
                setIsEditingLabel(true);
                setTempLabel(data.label);
              }}
              title="双击编辑节点名称"
            >
              {data.label}
            </div>
          )}
        </div>

        <div className={styles.nodeScene}>
          {sceneName ? (
            <div className={styles.sceneInfo}>
              <DocumentTextIcon />
              <span>{sceneName}</span>
            </div>
          ) : (
            <div className={styles.noScene}>未选择场景</div>
          )}

          <ChooseFile
            title="选择场景文件"
            basePath={['scene']}
            selectedFilePath={sceneName}
            onChange={handleSceneSelect}
            extNames={extNameMap.get('scene')}
          />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className={styles.handle}
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;