import * as fs from 'fs';
import * as path from 'path';

const logsDir = path.join(process.cwd(), 'logs');
const logFile = path.join(logsDir, 'log.txt');
const logFileMaxSize = 1024 * 1024;

// 确保日志目录存在
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir);
  } catch (error) {
    console.error('Error creating logs directory:', error);
  }
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

const cleanLog = (log: string) =>
  log.replace(
    /(\x1B\[[0-9;]*m)|(-\s*\d{1,2}\/\d{1,2}\/\d{4},\s*\d{1,2}:\d{2}:\d{2}\s*[AP]M\s+(LOG|ERROR)\s+)/g,
    '',
  );

// 在启动时检查日志文件大小
checkLogFileSize(logFile, logFileMaxSize);

const logStream = fs.createWriteStream(logFile, { flags: 'a' });

const originalStdoutWrite = process.stdout.write;
const originalStderrWrite = process.stderr.write;

process.stdout.write = function (...args: any[]) {
  try {
    logStream.write(`${new Date().toISOString()} [LOG]: ${cleanLog(args[0])}`);
  } catch (_) {}
  return originalStdoutWrite.apply(process.stdout, args);
};

process.stderr.write = function (...args: any[]) {
  try {
    logStream.write(
      `${new Date().toISOString()} [ERROR]: ${cleanLog(args[0])}`,
    );
  } catch (_) {}
  return originalStderrWrite.apply(process.stderr, args);
};
