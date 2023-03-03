import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { useValue } from "../../../../hooks/useValue";
import { cloneDeep } from "lodash";
import { Button, DefaultButton } from "@fluentui/react";

export default function Intro(props: ISentenceEditorProps) {
  const introTextList = useValue(props.sentence.content.split("|"));

  const submit = () => {
    props.onSubmit(`intro:${introTextList.value.join("|")};`);
  };

  const introCompList = introTextList.value.map((text, index) => {
    return <div key={index} style={{display:"flex",padding:'0 0 6px 0'}}>
      <input value={text}
        onChange={(ev) => {
          const newValue = ev.target.value;
          const newList = cloneDeep(introTextList.value);
          newList[index] = newValue;
          introTextList.set(newList);
        }}
        onBlur={submit}
        className={styles.sayInput}
        placeholder="Intro 文本"
        style={{ width: "100%" }}
      />
      <div style={{padding:'0 0 0 8px'}}/>
      <DefaultButton onClick={()=>{
        const newList = cloneDeep(introTextList.value);
        newList.splice(index,1);
        introTextList.set(newList);
        submit();
      }}>删除</DefaultButton>
    </div>;
  });

  return <div className={styles.sentenceEditorContent}>
    {introCompList}
    <DefaultButton onClick={()=>{
      const newList = cloneDeep(introTextList.value);
      newList.push('');
      introTextList.set(newList);
      submit();
    }}>添加新行</DefaultButton>
  </div>;
}
