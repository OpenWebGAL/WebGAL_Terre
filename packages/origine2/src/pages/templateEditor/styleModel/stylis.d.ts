declare module 'stylis' {
  export interface StylisElement {
    value: string;
    type: string;
    props: string[] | string;
    children: StylisElement[] | string;
    line: number;
    column: number;
    length: number;
    root: StylisElement | null;
    parent: StylisElement | null;
    return: string;
  }

  export function compile(value: string): StylisElement[];
}
