import { t } from "@lingui/macro";
import { ISentence } from "webgal-parser/src/interface/sceneInterface";
import TerreToggle from "@/components/terreToggle/TerreToggle";
import CommonOptions from "./CommonOption";
import { getArgByKey } from "../utils/getArgByKey";

/**
 * 读取变换起点，规则与引擎的 resolveTransformArgs 一致：
 * 优先看 transformFrom，没有时兼容旧参数 writeDefault，都没有则从当前状态开始
 * @returns 是否从默认状态开始
 */
export function isTransformFromDefault(sentence: ISentence): boolean {
  const transformFrom = getArgByKey(sentence, "transformFrom");
  if (transformFrom !== "") return transformFrom === "default";
  return getArgByKey(sentence, "writeDefault") === true;
}

/**
 * 提交变换起点所需的参数。
 * 从当前状态开始是引擎默认行为，因此省略 transformFrom；
 * 旧参数 writeDefault、ignoreDefault 已被 transformFrom 取代，提交时一并清除。
 */
export function getTransformFromArgs(isFromDefault: boolean) {
  return [
    { key: "transformFrom", value: isFromDefault ? "default" : "" },
    { key: "writeDefault", value: false },
    { key: "ignoreDefault", value: false },
  ];
}

export function TransformFromOption({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return <CommonOptions title={t`变换起点`}>
    <TerreToggle title="" onChange={onChange} onText={t`从默认状态开始`} offText={t`从当前状态开始`} isChecked={value} />
  </CommonOptions>;
}
