export interface IWebgalCssProp {
  propName: string;
  propValue: string;
}

export interface IWebgalPropsWithState {
  state: string;
  props: IWebgalCssProp[]
}

export interface ICssExtractResult {
  commonProps: IWebgalCssProp[];
  propsWithState: IWebgalPropsWithState[];
}


export function extractCss(css: string): ICssExtractResult {
  const lines = css.split(/\r\n|\n/g);
  const result: ICssExtractResult = {
    commonProps: [],
    propsWithState: [],
  };

  // 遍历过程状态
  let currentState = '';

  for(const line of lines){
    // 处理状态
    if(line.includes('{')){
      // 进入状态
      const state = extractState(line);
      if(state){
        currentState = state;
      }
      continue;
    }

    if(line.includes('}')){
      // 退出状态
      currentState = '';
      continue;
    }

    const [propName,propValue] = parseStyleString(line);
    if(!currentState){
      result.commonProps.push({propName,propValue});
    } else{
      // 查找状态
      const state = result.propsWithState.find(e=>e.state === currentState);
      if(state){
        state.props.push({propName,propValue});
      }else{
        result.propsWithState.push({
          state:currentState,
          props:[{propName,propValue}]
        });
      }
    }
  }

  return result;
}


function parseStyleString(styleString: string): [string,string] {
  const result: [string,string] = ['',''];

  // 去除字符串首尾空白
  // eslint-disable-next-line no-param-reassign
  styleString = styleString.trim();

  // 如果字符串为空或不包含冒号，直接返回空对象
  if (!styleString?.includes(':')) {
    return result;
  }

  // 按冒号分割字符串
  const parts = styleString.split(':');

  // 提取属性名，去除首尾空白
  const key = parts[0].trim();

  // 提取属性值，去除首尾空白及末尾的分号
  let value = parts[1].trim();
  if (value.endsWith(';')) {
    value = value.slice(0, -1);
  }

  return [key,value];
}

function extractState(styleString: string): string | null {
  // 使用正则表达式匹配 &:状态 { 的模式
  const stateRegex = /&:(\w+)\s*\{/;

  // 对字符串进行正则匹配
  const match = styleString.match(stateRegex);

  // 如果找到匹配项，返回捕获的状态，否则返回 null
  return match ? match[1] : null;
}
