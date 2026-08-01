/**
 * 上一次扫描文档时收集到的变量名 -> 定义所在行号。
 *
 * 语义高亮遍历语句时写入，补全据此建议已经定义过的变量。
 * 单独成模块，是为了让两侧都只依赖这一份状态，而不必牵扯 LSP 服务器的启动逻辑。
 */
export const lastVariables = new Map<string, number>();
