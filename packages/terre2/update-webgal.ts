import * as path from 'path';
import * as fsExtra from 'fs-extra';

async function updateWebGALEngineFiles() {
  // 获取当前工作目录
  const cwd = process.cwd();
  // 目标模板目录
  const templateDir = path.join(cwd, 'assets', 'templates', 'WebGAL_Template');

  // 要删除的文件和目录列表
  const filesToDelete = [
    path.join(templateDir, 'assets'),
    path.join(templateDir, 'index.html'),
    path.join(templateDir, 'webgal-serviceworker.js'),
  ];

  console.log('正在删除旧的 WebGAL 引擎文件...');
  try {
    // 并行删除旧文件和目录
    await Promise.all(filesToDelete.map((file) => fsExtra.remove(file)));
    console.log('旧文件删除成功。');
  } catch (error) {
    console.error('删除旧文件时出错:', error);
    throw error;
  }

  console.log('正在从 node_modules 复制新的 WebGAL 引擎文件...');
  try {
    // 源文件路径
    const sourceAssetsDir = path.join(
      cwd,
      'node_modules',
      'webgal-engine',
      'dist',
      'assets',
    );
    const sourceIndex = path.join(
      cwd,
      'node_modules',
      'webgal-engine',
      'dist',
      'index.html',
    );
    const sourceServiceWorker = path.join(
      cwd,
      'node_modules',
      'webgal-engine',
      'dist',
      'webgal-serviceworker.js',
    );

    // 目标文件路径
    const targetAssetsDir = path.join(templateDir, 'assets');
    const targetIndex = path.join(templateDir, 'index.html');
    const targetServiceWorker = path.join(
      templateDir,
      'webgal-serviceworker.js',
    );

    // 确保目标目录存在
    await fsExtra.ensureDir(templateDir);

    // 并行复制新文件和目录
    await Promise.all([
      fsExtra.copy(sourceAssetsDir, targetAssetsDir),
      fsExtra.copy(sourceIndex, targetIndex),
      fsExtra.copy(sourceServiceWorker, targetServiceWorker),
    ]);

    console.log('新 WebGAL 引擎文件复制成功。');
  } catch (error) {
    console.error('复制新文件时出错:', error);
    throw error;
  }
}

// 执行更新并处理错误
updateWebGALEngineFiles().catch((error) => {
  console.error('更新 WebGAL 引擎文件时发生错误:', error);
  process.exit(1); // 出错时退出进程
});
