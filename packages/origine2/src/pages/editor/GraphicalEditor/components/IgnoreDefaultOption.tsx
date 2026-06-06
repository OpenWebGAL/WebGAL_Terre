import { t } from "@lingui/macro";
import TerreToggle from "@/components/terreToggle/TerreToggle";
import CommonOptions from "./CommonOption";

export function IgnoreDefaultOption({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return <CommonOptions title={t`未声明的默认变换和效果`}>
    <TerreToggle title="" onChange={onChange} onText={t`忽略`} offText={t`补充`} isChecked={value} />
  </CommonOptions>;
}
