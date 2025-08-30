import { CascaderOptionNode } from '../components/SearchableCascader';
import { escapeRegExp } from 'lodash';

// 字符串分割，分割后每段末尾保留分隔符
export const splitByDelimiters = (str: string, delimiters: string[]): string[] => {
  if (!str || delimiters.length === 0) return [str];
  const delimiterList = delimiters.filter(d => d.length > 0).sort((a, b) => b.length - a.length);
  const regex = new RegExp(`(${delimiterList.map(d => escapeRegExp(d)).join('|')})`, 'g');
  const segments = str.split(regex);
  const result: string[] = [];
  for (let i = 0; i < segments.length; i++) {
    if (i % 2 === 0) { result.push(segments[i]); }
    else { result[result.length - 1] += segments[i]; }
  }
  if (result[result.length - 1] === '') { result.pop(); }
  return result;
};

// 根据字符串数组生成级联选择器选项的方法
export const getCascaderOptions = (
  strArr: string[],
  delimiters = ['/'],
): Map<string, CascaderOptionNode> => {
  const root = new Map<string, CascaderOptionNode>();
  strArr.forEach(str => {
    // 拆分字符串为层级数组
    const segments = splitByDelimiters(str, delimiters);
    let currentLevel = root;
    for (let i=0; i<segments.length; i++) {
      const segmentRaw = segments[i];
      let segment = segmentRaw;
      if (i !== segments.length - 1) {
        segment += '*'; // 非叶子节点的标识
      }
      // 如果当前层级不存在该节点，创建新节点
      if (!currentLevel.has(segment)) {
        currentLevel.set(
          segment, // label
          {
            value: segments.slice(0, i + 1).join(''), // value
            children: new Map<string, CascaderOptionNode>()
          }
        );
      }
      // 移动到下一层级
      const nextNode = currentLevel.get(segment);
      if (nextNode?.children) {
        currentLevel = nextNode.children;
      }
    }
  });
  return root;
};

export const getCascaderLevels = (str:string, delimiters = ['/']): string[] => {
  const segments = splitByDelimiters(str, delimiters);
  return segments.map((segment,i)=>{
    let seg = segment;
    if (i !== segments.length - 1) { seg += '*'; }
    return seg;
  });
};
