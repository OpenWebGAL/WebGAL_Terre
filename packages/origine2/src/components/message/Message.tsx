import { forwardRef, ReactNode, useImperativeHandle, useRef, useState } from "react";
import { useValue } from "../../hooks/useValue";
import styles from "./message.module.scss";
import { logger } from "../../utils/logger";

// 传递的 Refs 的类型声明
export interface TestRefRef {
  showMessage: (message: string, delay: number) => void;
}

// 子组件的传入参数
interface TestRefProps {
  children?: ReactNode | null;
}

// 单个信息的接口

interface IMessage {
  content: string,
  key: string
}

// 使用 forwardRef 来进行 Ref 转发
export const Message = forwardRef<TestRefRef, TestRefProps>(
  (props, ref) => {
    const currentMessage = useValue<IMessage[]>([]);
    const unmountMessage = (key: string) => {
      currentMessage.set(currentMessage.value.filter(e => e.key !== key));
    };

    const showMessage = (message: string, delay: number) => {
      const key = Math.random().toString().slice(0, 5);
      const messageObject: IMessage = { content: message, key };
      currentMessage.set([messageObject]);
      setTimeout(() => unmountMessage(key), delay);
    };
    // useImperativeHandle 可以让你在使用 ref 时自定义暴露给父组件的实例值
    useImperativeHandle(ref, () => ({
      showMessage
    }));

    const messageList = currentMessage.value.map(e => {
      return <div key={e.key} className={styles.singleMessage}>
        {e.content}
      </div>;
    });

    return (<div className={styles.main}>
      {messageList}
    </div>);
  }
);
