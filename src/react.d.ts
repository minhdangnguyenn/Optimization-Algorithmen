declare namespace React {
  export interface ReactElement<P = any, T extends string | React.JSXElementConstructor<any> = string | React.JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: string | number | null;
  }

  export type ReactNode = ReactElement | string | number | boolean | null | undefined | ReactNode[];

  export interface FunctionComponent<P = {}> {
    (props: P): ReactElement<any, any> | null;
  }

  export type FC<P = {}> = FunctionComponent<P>;

  export function useState<S>(initialState: S | (() => S)): [S, (value: S | ((prev: S) => S)) => void];

  export interface ChangeEvent<T = Element> {
    target: T & {
      value: string;
    };
  }

  export interface FormEvent<T = Element> {
    preventDefault(): void;
    stopPropagation(): void;
    target: T;
    currentTarget: T;
  }

  export interface MouseEvent<T = Element> {
    preventDefault(): void;
    stopPropagation(): void;
    target: T;
    currentTarget: T;
    button: number;
    clientX: number;
    clientY: number;
  }

  export interface KeyboardEvent<T = Element> {
    preventDefault(): void;
    stopPropagation(): void;
    target: T;
    currentTarget: T;
    key: string;
    keyCode: number;
    altKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
  }

  export namespace JSX {
    interface IntrinsicElements {
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
      h1: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h3: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h4: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
      input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
      button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
      ul: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
      li: React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
      label: React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
      form: React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
      [elemName: string]: any;
    }

    interface Element extends ReactElement<any, any> {}
  }

  export interface HTMLAttributes<T> {
    className?: string;
    style?: any;
    onClick?: (event: React.MouseEvent<T>) => void;
    onChange?: (event: React.ChangeEvent<T>) => void;
    onSubmit?: (event: React.FormEvent<T>) => void;
    onKeyDown?: (event: React.KeyboardEvent<T>) => void;
    onKeyUp?: (event: React.KeyboardEvent<T>) => void;
    [key: string]: any;
  }

  export interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: string;
    value?: string | number;
    min?: string | number;
    max?: string | number;
    placeholder?: string;
    disabled?: boolean;
  }

  export interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
  }

  export interface LabelHTMLAttributes<T> extends HTMLAttributes<T> {}
  export interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
    onSubmit?: (event: React.FormEvent<T>) => void;
  }
  export interface LiHTMLAttributes<T> extends HTMLAttributes<T> {}

  export interface DetailedHTMLProps<E extends HTMLAttributes<T>, T> extends E {
    ref?: any;
  }

  export interface JSXElementConstructor<P> {
    (props: P): ReactElement<any, any> | null;
  }
}

declare module 'react' {
  export = React;
  export as namespace React;
}

declare module 'react-dom' {
  export interface Root {
    render(children: React.ReactNode): void;
  }
  
  export function createRoot(container: Element | DocumentFragment): Root;
}

declare module 'react/jsx-runtime' {
  export function jsx(type: any, props: any, key?: any): React.ReactElement;
  export function jsxs(type: any, props: any, key?: any): React.ReactElement;
}