/**
 * 节点数据 - WebGAL 核心数据
 */
export interface IFlowchartNodeData extends Record<string, unknown> {
  /** 节点显示标签 */
  label: string;
  /** 对应的scene文件名 */
  sceneName: string;
  /** 是否为根节点 */
  isRoot?: boolean;
}

/**
 * 节点类型
 */
export type FlowchartNodeType = 'root' | 'chapter' | 'branch' | 'ending' | 'event';

/**
 * React Flow 节点 - 最小必要结构
 */
export interface IFlowchartNode {
  id: string;
  position: { x: number; y: number };
  data: IFlowchartNodeData;
  type?: FlowchartNodeType | string;
}

/**
 * React Flow 边 - 最小必要结构
 */
export interface IFlowchartEdge {
  id: string;
  source: string;
  target: string;
}

/**
 * 流程图类型
 */
export type FlowchartType = 'main' | 'character';

/**
 * 单个流程图
 */
export interface IFlowchart {
  id: string;
  name: string;
  type: FlowchartType;
  nodes: IFlowchartNode[];
  edges: IFlowchartEdge[];
}

/**
 * flowchart.json 根结构
 */
export interface IFlowchartData {
  flowcharts: IFlowchart[];
}