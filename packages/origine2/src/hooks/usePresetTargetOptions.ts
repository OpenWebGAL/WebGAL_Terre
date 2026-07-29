import { useMemo } from "react";
import { t } from "@lingui/macro";

/**
 * 预设的效果目标，按立绘在舞台上从左到右的顺序排列
 * @param includeStage 是否包含舞台画面
 */
export const usePresetTargetOptions = (includeStage = true) => {
  return useMemo(() => new Map<string, string>([
    [ "fig-left", t`左侧立绘` ],
    [ "fig-left14", t`左侧 1/4 立绘` ],
    [ "fig-left13", t`左侧 1/3 立绘` ],
    [ "fig-center", t`中间立绘` ],
    [ "fig-right13", t`右侧 1/3 立绘` ],
    [ "fig-right14", t`右侧 1/4 立绘` ],
    [ "fig-right", t`右侧立绘` ],
    [ "bg-main", t`背景图片` ],
    ...(includeStage ? [[ "stage-main", t`舞台画面` ] as [string, string]] : []),
  ]), [includeStage]);
};
