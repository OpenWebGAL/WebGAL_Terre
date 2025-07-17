import { useMemo } from "react";
import { t } from "@lingui/macro";

export const useEaseTypeOptions = () => {
  return useMemo(() => new Map<string, string>([
    [ "", t`默认` ],
    [ "linear", t`线性` ],
    [ "easeIn", t`缓入` ],
    [ "easeOut", t`缓出` ],
    [ "easeInOut", t`缓入缓出` ],
    [ "circIn", t`圆形缓入` ],
    [ "circOut", t`圆形缓出` ],
    [ "circInOut", t`圆形缓入缓出` ],
    [ "backIn", t`起点回弹` ],
    [ "backOut", t`终点回弹` ],
    [ "backInOut", t`起止回弹` ],
    [ "bounceIn", t`起点弹跳` ],
    [ "bounceOut", t`终点弹跳` ],
    [ "bounceInOut", t`起止弹跳` ],
    [ "anticipate", t`预先反向` ],
  ]), []);
};