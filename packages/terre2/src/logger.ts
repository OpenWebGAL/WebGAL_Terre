import * as fs from 'fs';
import * as path from 'path';

const logDir = path.join(process.cwd(), 'logs');
const logFile = path.join(logDir, 'log.txt');
const logFileMaxSize = 1024 * 1024;

// 确保日志目录存在
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const checkLogFileSize = (filePath: string, maxSize: number) => {
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.size > maxSize) {
      const oldLogFile = filePath.replace('log.txt', 'log.old.txt');
      fs.rename(filePath, oldLogFile, (renameErr) => {
        if (renameErr) {
          console.error('Error renaming log file:', renameErr);
        }
      });
    }
  });
};

// 在启动时检查日志文件大小
checkLogFileSize(logFile, logFileMaxSize);

const logStream = fs.createWriteStream(logFile, { flags: 'a' });

const originalStdoutWrite = process.stdout.write;
const originalStderrWrite = process.stderr.write;

process.stdout.write = function (...args: any[]) {
  try {
    logStream.write(`${new Date().toISOString()} [LOG]: ${args[0]}`);
  } catch (_) {}
  return originalStdoutWrite.apply(process.stdout, args);
};

process.stderr.write = function (...args: any[]) {
  try {
    logStream.write(`${new Date().toISOString()} [ERROR]: ${args[0]}`);
  } catch (_) {}
  return originalStderrWrite.apply(process.stderr, args);
};
