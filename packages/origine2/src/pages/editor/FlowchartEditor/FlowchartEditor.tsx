import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  MarkerType,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import styles from './FlowchartEditor.module.scss';
import { t } from '@lingui/macro';
import { Button, Input, Dropdown, Option } from '@fluentui/react-components';
import {
  AddFilled,
  AddRegular,
  SaveFilled,
  SaveRegular,
  DeleteFilled,
  DeleteRegular,
  EditFilled,
  EditRegular,
  bundleIcon
} from '@fluentui/react-icons';
import { IFlowchartNode, IFlowchartEdge, IFlowchart, IFlowchartData, IFlowchartNodeData, FlowchartType } from '@/types/flowchart';
import CustomNode from './CustomNode';
import { api } from '@/api';
import useEditorStore from '@/store/useEditorStore';

const AddIcon = bundleIcon(AddFilled, AddRegular);
const SaveIcon = bundleIcon(SaveFilled, SaveRegular);
const DeleteIcon = bundleIcon(DeleteFilled, DeleteRegular);
const EditIcon = bundleIcon(EditFilled, EditRegular);

const nodeTypes = {
  custom: CustomNode,
};

function FlowchartEditorContent() {
  const gameDir = useEditorStore.use.subPage();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<IFlowchartNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [nextNodeId, setNextNodeId] = useState(1);

  // 流程图管理状态
  const [flowcharts, setFlowcharts] = useState<IFlowchart[]>([]);
  const [currentFlowchartId, setCurrentFlowchartId] = useState<string>('main');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const reactFlowInstance = useReactFlow();

  // 当前流程图
  const currentFlowchart = flowcharts.find(f => f.id === currentFlowchartId);

  // 加载流程图
  useEffect(() => {
    loadFlowchart();
  }, [gameDir]);

  const loadFlowchart = async () => {
    try {
      const response = await api.manageGameControllerGetFlowchart(gameDir);
      const dataString = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      const data: IFlowchartData = JSON.parse(dataString);

      if (data.flowcharts && data.flowcharts.length > 0) {
        // 确保所有流程图都有正确的类型，主线流程图 id 为 'main' 的类型应该是 'main'
        const validatedFlowcharts = data.flowcharts.map(f => ({
          ...f,
          type: f.id === 'main' ? 'main' as const : (f.type || 'character' as const)
        }));
        setFlowcharts(validatedFlowcharts);

        // 加载当前流程图
        const currentFlowchart = validatedFlowcharts.find(f => f.id === currentFlowchartId) || validatedFlowcharts[0];
        if (currentFlowchart) {
          setCurrentFlowchartId(currentFlowchart.id);
          setNodes((currentFlowchart.nodes || []) as Node<IFlowchartNodeData>[]);
          setEdges((currentFlowchart.edges || []) as Edge[]);

          // 计算下一个节点ID
          const maxId = (currentFlowchart.nodes || []).reduce((max, node) => {
            const id = parseInt(node.id.replace('node-', ''), 10);
            return isNaN(id) ? max : Math.max(max, id);
          }, 0);
          setNextNodeId(maxId + 1);
        }
      } else {
        // 初始化默认主线流程图
        const defaultFlowchart: IFlowchart = {
          id: 'main',
          name: '主线剧情',
          type: 'main',
          nodes: [],
          edges: []
        };
        setFlowcharts([defaultFlowchart]);
        setCurrentFlowchartId('main');
        setNodes([]);
        setEdges([]);
      }
    } catch (error) {
      console.error('Failed to load flowchart:', error);
      // 初始化默认主线流程图
      const defaultFlowchart: IFlowchart = {
        id: 'main',
        name: '主线剧情',
        type: 'main',
        nodes: [],
        edges: []
      };
      setFlowcharts([defaultFlowchart]);
      setCurrentFlowchartId('main');
      setNodes([]);
      setEdges([]);
    }
  };

  // 保存流程图
  const saveFlowchart = async () => {
    // 更新当前流程图
    const updatedFlowcharts = flowcharts.map(f =>
      f.id === currentFlowchartId
        ? { ...f, nodes: nodes as IFlowchartNode[], edges: edges as IFlowchartEdge[] }
        : f
    );

    const data: IFlowchartData = {
      flowcharts: updatedFlowcharts
    };

    try {
      await api.manageGameControllerSetFlowchart(gameDir, {
        flowchartContent: JSON.stringify(data, null, 2)
      });
      console.log('Flowchart saved successfully');
    } catch (error) {
      console.error('Failed to save flowchart:', error);
    }
  };

  // 切换流程图
  const switchFlowchart = (flowchartId: string) => {
    // 先保存当前流程图
    const updatedFlowcharts = flowcharts.map(f =>
      f.id === currentFlowchartId
        ? { ...f, nodes: nodes as IFlowchartNode[], edges: edges as IFlowchartEdge[] }
        : f
    );
    setFlowcharts(updatedFlowcharts);

    // 切换到新流程图
    const targetFlowchart = updatedFlowcharts.find(f => f.id === flowchartId);
    if (targetFlowchart) {
      setCurrentFlowchartId(flowchartId);
      setNodes(targetFlowchart.nodes as Node<IFlowchartNodeData>[]);
      setEdges(targetFlowchart.edges as Edge[]);

      // 计算下一个节点ID
      const maxId = targetFlowchart.nodes.reduce((max, node) => {
        const id = parseInt(node.id.replace('node-', ''), 10);
        return isNaN(id) ? max : Math.max(max, id);
      }, 0);
      setNextNodeId(maxId + 1);
    }
  };

  // 创建新流程图
  const createFlowchart = (name: string, type: FlowchartType) => {
    // 先保存当前流程图
    const updatedFlowcharts = flowcharts.map(f =>
      f.id === currentFlowchartId
        ? { ...f, nodes: nodes as IFlowchartNode[], edges: edges as IFlowchartEdge[] }
        : f
    );

    const newId = `flowchart-${Date.now()}`;
    const newFlowchart: IFlowchart = {
      id: newId,
      name,
      type,
      nodes: [],
      edges: []
    };

    const newFlowchartsList = [...updatedFlowcharts, newFlowchart];
    setFlowcharts(newFlowchartsList);

    // 直接切换到新流程图
    setCurrentFlowchartId(newId);
    setNodes([]);
    setEdges([]);
    setNextNodeId(1);
  };

  // 删除流程图
  const deleteFlowchart = (flowchartId: string) => {
    // 主线流程图不可删除
    if (flowchartId === 'main') {
      return;
    }

    const updatedFlowcharts = flowcharts.filter(f => f.id !== flowchartId);
    setFlowcharts(updatedFlowcharts);

    // 如果删除的是当前流程图，切换到主线
    if (flowchartId === currentFlowchartId) {
      switchFlowchart('main');
    }
  };

  // 更新流程图名称
  const updateFlowchartName = (flowchartId: string, newName: string) => {
    const updatedFlowcharts = flowcharts.map(f =>
      f.id === flowchartId
        ? { ...f, name: newName }
        : f
    );
    setFlowcharts(updatedFlowcharts);
  };

  // 添加新节点
  const addNode = useCallback((isRoot = false) => {
    // 检查是否已有根节点
    if (isRoot) {
      const hasRoot = nodes.some(n => (n.data as any).isRoot);
      if (hasRoot) {
        return;
      }
    }

    const newNode: Node<IFlowchartNodeData> = {
      id: `node-${nextNodeId}`,
      type: 'custom',  // 使用 custom 类型以使用我们的 CustomNode 组件
      position: { x: 250, y: nodes.length * 120 },
      data: {
        label: isRoot ? t`开始` : `节点 ${nextNodeId}`,
        sceneName: '',
        isRoot: isRoot,
      },
    };

    setNodes((nds) => [...nds, newNode]);

    // 如果有前一个节点，自动连接
    if (nodes.length > 0 && !isRoot) {
      const lastNode = nodes[nodes.length - 1];
      const newEdge: Edge = {
        id: `e-${lastNode.id}-${newNode.id}`,
        source: lastNode.id,
        target: newNode.id,
      };
      setEdges((eds) => [...eds, newEdge]);
    }

    setNextNodeId(nextNodeId + 1);
  }, [nodes, nextNodeId]);

  // 检查是否会形成环
  const wouldCreateCycle = (source: string, target: string, currentEdges: Edge[]): boolean => {
    const visited = new Set<string>();
    const stack = [target];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === source) return true;
      if (visited.has(current)) continue;
      visited.add(current);

      const outgoing = currentEdges.filter(e => e.source === current);
      for (const edge of outgoing) {
        stack.push(edge.target);
      }
    }

    return false;
  };

  // 连接节点
  const onConnect = useCallback((params: Connection) => {
    if (!params.source || !params.target) return;

    // 检查是否会形成环
    if (wouldCreateCycle(params.source, params.target, edges)) {
      return;
    }

    const newEdge: Edge = {
      id: `e-${params.source}-${params.target}`,
      source: params.source,
      target: params.target,
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, [edges]);

  // 更新节点数据
  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  }, []);

  // 监听节点更新事件
  useEffect(() => {
    const handleNodeUpdate = (event: any) => {
      const { nodeId, data } = event.detail;
      updateNodeData(nodeId, data);
    };

    window.addEventListener('flowchart-node-update', handleNodeUpdate);
    return () => {
      window.removeEventListener('flowchart-node-update', handleNodeUpdate);
    };
  }, [updateNodeData]);

  return (
    <div className={styles.flowchartEditor}>
      <div className={styles.sidebar}>
        <div className={styles.section}>
          <h3>{t`流程图列表`}</h3>
          <div className={styles.flowchartList}>
            {flowcharts.map(f => (
              <div
                key={f.id}
                className={`${styles.flowchartItem} ${f.id === currentFlowchartId ? styles.active : ''}`}
              >
                <div className={styles.flowchartInfo} onClick={() => switchFlowchart(f.id)}>
                  <span className={styles.flowchartType}>
                    {f.type === 'main' ? '[主线]' : '[支线]'}
                  </span>
                  {isEditingName && f.id === currentFlowchartId ? (
                    <Input
                      size="small"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onBlur={() => {
                        if (tempName.trim()) {
                          updateFlowchartName(f.id, tempName);
                        }
                        setIsEditingName(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (tempName.trim()) {
                            updateFlowchartName(f.id, tempName);
                          }
                          setIsEditingName(false);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <span className={styles.flowchartName}>{f.name}</span>
                  )}
                </div>
                <div className={styles.flowchartActions}>
                  {f.id === currentFlowchartId && (
                    <Button
                      size="small"
                      appearance="subtle"
                      icon={<EditIcon />}
                      onClick={() => {
                        setTempName(f.name);
                        setIsEditingName(true);
                      }}
                    />
                  )}
                  {f.id !== 'main' && (
                    <Button
                      size="small"
                      appearance="subtle"
                      icon={<DeleteIcon />}
                      onClick={() => deleteFlowchart(f.id)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          <Button
            size="small"
            appearance="subtle"
            icon={<AddIcon />}
            onClick={() => {
              const characterFlowcharts = flowcharts.filter(f => f.type === 'character');
              const name = `支线${characterFlowcharts.length + 1}`;
              createFlowchart(name, 'character');
              // 创建后立即进入编辑状态
              setTimeout(() => {
                setTempName(name);
                setIsEditingName(true);
              }, 100);
            }}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {t`新建流程图`}
          </Button>
        </div>

        <div className={styles.section}>
          <h3>{t`节点操作`}</h3>
          {nodes.length === 0 && (
            <Button
              icon={<AddIcon />}
              onClick={() => addNode(true)}
              appearance="primary"
              style={{ marginBottom: '10px', width: '100%' }}
            >
              {t`添加根节点`}
            </Button>
          )}
          <Button
            icon={<AddIcon />}
            onClick={() => addNode(false)}
            appearance={nodes.length === 0 ? 'secondary' : 'primary'}
            style={{ marginBottom: '10px', width: '100%' }}
            disabled={nodes.length === 0}
          >
            {t`添加节点`}
          </Button>
          <Button
            icon={<SaveIcon />}
            onClick={saveFlowchart}
            style={{ width: '100%' }}
          >
            {t`保存流程图`}
          </Button>
        </div>

        <div className={styles.info}>
          <p>{t`提示：`}</p>
          <ul>
            <li>{t`主线流程图不可删除`}</li>
            <li>{t`每个流程图只能有一个根节点`}</li>
            <li>{t`双击节点名称可编辑`}</li>
            <li>{t`点击节点选择场景文件`}</li>
            <li>{t`不能创建循环连接`}</li>
          </ul>
        </div>
      </div>
      <div className={styles.canvas}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function FlowchartEditor() {
  return (
    <ReactFlowProvider>
      <FlowchartEditorContent />
    </ReactFlowProvider>
  );
}