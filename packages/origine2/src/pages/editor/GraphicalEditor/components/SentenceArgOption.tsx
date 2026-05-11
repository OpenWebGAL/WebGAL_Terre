import { commandType, ISentence } from "webgal-parser/src/interface/sceneInterface";
import { useValue } from "@/hooks/useValue";
import TerreToggle from "@/components/terreToggle/TerreToggle";
import CommonOptions from "./CommonOption";
import { getArgByKey } from "../utils/getArgByKey";
import styles from "../SentenceEditor/sentenceEditor.module.scss";
import { t } from "@lingui/macro";

interface ISentenceArgOptionProps {
  sentence: ISentence;
  rawSentence: string;
  argKey: string;
  title: string;
  enabledText: string;
  disabledText: string;
  placeholder: string;
  onSubmit: (newSentence: string) => void;
}

function isEscaped(text: string, index: number) {
  let backslashCount = 0;
  for (let i = index - 1; i >= 0 && text[i] === "\\"; i--) {
    backslashCount += 1;
  }
  return backslashCount % 2 === 1;
}

function getStatementEnd(text: string) {
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ";" && !isEscaped(text, i)) {
      return i;
    }
  }
  return -1;
}

function splitArgToken(token: string) {
  const equalIndex = token.indexOf("=");
  const key = equalIndex >= 0 ? token.slice(0, equalIndex) : token;
  return key.trim();
}

function setSentenceArg(options: {
  rawSentence: string;
  sentence: ISentence;
  key: string;
  value: string;
}) {
  const { rawSentence, sentence, key, value } = options;
  const statementEnd = getStatementEnd(rawSentence);
  const statement = statementEnd >= 0 ? rawSentence.slice(0, statementEnd) : rawSentence;
  const suffix = statementEnd >= 0 ? rawSentence.slice(statementEnd) : "";

  if (statement.trim() === "") {
    return rawSentence;
  }

  const argsStart = / -/.exec(statement);
  const hasArgs = argsStart !== null;
  const head = hasArgs ? statement.slice(0, argsStart.index) : statement;
  const rawArgs = hasArgs ? statement.slice(argsStart.index) : "";
  const nextArgs = rawArgs
    .split(" -")
    .filter(Boolean)
    .map(arg => arg.trim())
    .filter(arg => splitArgToken(arg) !== key);

  const normalizedValue = value.trim();
  if (normalizedValue !== "") {
    nextArgs.push(`${key}=${normalizedValue}`);
  }

  let normalizedHead = head;
  const needsCommandColon =
    sentence.command !== commandType.say &&
    sentence.commandRaw !== "" &&
    !normalizedHead.includes(":") &&
    (nextArgs.length > 0 || normalizedValue !== "");
  if (needsCommandColon) {
    normalizedHead = `${normalizedHead}:`;
  }

  return `${normalizedHead}${nextArgs.map(arg => ` -${arg}`).join("")}${suffix}`;
}

export default function SentenceArgOption(props: ISentenceArgOptionProps) {
  const currentArg = getArgByKey(props.sentence, props.argKey);
  const initialExpression = currentArg === "" ? "" : currentArg.toString();
  const isEnabled = useValue(initialExpression !== "");
  const expression = useValue(initialExpression);

  const submit = (nextExpression = expression.value) => {
    props.onSubmit(setSentenceArg({
      rawSentence: props.rawSentence,
      sentence: props.sentence,
      key: props.argKey,
      value: nextExpression,
    }));
  };

  return <div className={styles.commonArgItem}>
    <CommonOptions title={props.title}>
      <TerreToggle
        title=""
        onChange={(newValue) => {
          isEnabled.set(newValue);
          if (!newValue) {
            submit("");
          } else if (expression.value.trim() !== "") {
            submit(expression.value);
          }
        }}
        onText={props.enabledText}
        offText={props.disabledText}
        isChecked={isEnabled.value}
      />
    </CommonOptions>
    {isEnabled.value && <CommonOptions title={t`表达式`}>
      <input
        value={expression.value}
        onChange={(ev) => expression.set(ev.target.value ?? "")}
        onBlur={() => submit()}
        className={styles.sayInput}
        placeholder={props.placeholder}
        style={{ width: "100%" }}
      />
    </CommonOptions>}
  </div>;
}
