/**
 * 测试环境下 trash 的替代实现。
 * trash@10 是纯 ESM 包，jest 的模块运行时（不实现 Node 22.12+ 的 require(ESM)）
 * 无法加载它，因此在 jest 配置里通过 moduleNameMapper 把 'trash' 指向本文件。
 * 该函数只在「删除到回收站」时被调用，测试里无需真实行为。
 */
const trash = jest.fn(async (): Promise<void> => undefined);

export default trash;
