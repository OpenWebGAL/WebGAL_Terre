enum commandType {
  say
}

export interface IConfigInterface {
  scriptString: string;
  scriptType: commandType;
}

export const SCRIPT_CONFIG: IConfigInterface[] = [
  { scriptString: 'say', scriptType: commandType.say },
];
export const ADD_NEXT_ARG_LIST = [];
