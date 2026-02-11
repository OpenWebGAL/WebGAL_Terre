/**
 * 游戏配置接口
 */
export interface IWebgalConfig {
  gameName?: string; // 游戏名称
  gameKey?: string; // 游戏Key
  gameLogo?: string; // 游戏Logo
  titleImage?: string; // 标题图片
  titleBgm?: string; // 标题背景音乐
  description?: string; // 游戏描述
  defaultLanguage?: string; // 默认语言
  packageName?: string; // 包名
  steamAppId?: string; // Steam 应用 ID
  enableExtra?: boolean; // 启用鉴赏功能
  enablePanic?: boolean; // 启用紧急回避
  enableLegacyExpressionBlendMode?: boolean; // 启用旧版 Live2D 表情混合模式
  textboxMaxLine?: number; // 文字框最大行数
  textboxLineHeight?: number; // 文字框行高
}
