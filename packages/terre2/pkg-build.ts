import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const distDir = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distDir)) {
  console.error('dist folder not found. Run build first.');
  process.exit(1);
}

const platformMap: Partial<Record<NodeJS.Platform, string>> = {
  aix: 'linux',
  android: 'linux',
  darwin: 'macos',
  freebsd: 'linux',
  linux: 'linux',
  openbsd: 'linux',
  sunos: 'linux',
  win32: 'win',
};

const archMap: Record<string, string> = {
  x64: 'x64',
  arm64: 'arm64',
};

const nodeVersion = process.env.PKG_NODE_VERSION ?? 'node22';
const mappedPlatform = platformMap[process.platform];
const mappedArch = archMap[process.arch];

if (!mappedPlatform || !mappedArch) {
  console.error(
    `Unsupported platform/arch for pkg: ${process.platform}/${process.arch}`,
  );
  process.exit(1);
}

const target =
  process.env.PKG_TARGET ?? `${nodeVersion}-${mappedPlatform}-${mappedArch}`;

const pkgBin = process.platform === 'win32' ? 'pkg.cmd' : 'pkg';
const pkgArgs = ['src/main.js', '-o', 'WebGAL_Terre', '-t', target];
const extraArgs = process.argv.slice(2);

const result = spawnSync(pkgBin, [...pkgArgs, ...extraArgs], {
  stdio: 'inherit',
  cwd: distDir,
  shell: process.platform === 'win32',
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
