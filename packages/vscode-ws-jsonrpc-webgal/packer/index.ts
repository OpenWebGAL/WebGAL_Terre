import * as fsp from 'fs/promises';
import * as process from 'process';
import * as path from 'path';

/**
 * For external edit this
 */
const externals: Array<string> = [];

async function pack() {
  const currentDir = process.cwd();
  const libRoot = path.join(currentDir, 'src', 'libs');
  const libs = await fsp.readdir(libRoot);
  const libDesc: Array<{ name: string; dir: string }> = [];
  for (const dirName of libs) {
    const libDir = path.join(libRoot, dirName);
    const stat = await fsp.stat(libDir);
    if (stat.isDirectory()) {
      libDesc.push({ name: dirName, dir: libDir });
    }
  }
  const configSet: Array<string> = [];
  for (const lib of libDesc) {
    const inputConfig = `
    {
      input: './src/libs/${lib.name}/index.ts',
      output: [
        {
          file: './build/${lib.name}/es/index.js',
          format: 'es',
          sourcemap: !isProd,
        }
      ],
      plugins: [
        resolve(),
        commonjs(),
        typescript({
          useTsconfigDeclarationDir: true,
          tsconfigOverride: {
            compilerOptions: {
              sourceMap: !isProd,
              declarationDir: 'build/${lib.name}/es',
            },
            include: ['src/libs/${lib.name}'],
          },
        }),
      ],
      external: [${externals.join(',')}],
    }
    `;
    const inputConfigCjs = `
    {
      input: './src/libs/${lib.name}/index.ts',
      output: [
        {
          file: './build/${lib.name}/cjs/index.js',
          exports: 'named',
          format: 'cjs',
          sourcemap: !isProd,
        }
      ],
      plugins: [
        resolve(),
        commonjs(),
        typescript({
          useTsconfigDeclarationDir: true,
          tsconfigOverride: {
            compilerOptions: {
              sourceMap: !isProd,
              declarationDir: 'build/${lib.name}/cjs',
            },
            include: ['src/libs/${lib.name}'],
          },
        }),
      ],
      external: [${externals.join(',')}],
    }
    `;
    const inputConfigUmd = `
    {
      input: './src/libs/${lib.name}/index.ts',
      output: [
        {
          file: 'build/${lib.name}/umd/index.global.js',
          name: '${lib.name}',
          format: 'iife',
          sourcemap: !isProd,
        },
      ],
      plugins: [
        resolve(),
        commonjs(),
        typescript({
          useTsconfigDeclarationDir: true,
          tsconfigOverride: {
            compilerOptions: {
              sourceMap: !isProd,
              declarationDir: 'build/${lib.name}/types',
            },
            include: ['src/libs/${lib.name}'],
          },
        }),
      ],
      external: [${externals.join(',')}],
    }
    `;
    configSet.push(inputConfig, inputConfigCjs, inputConfigUmd);
  }
  const configStr = `import typescript from 'rollup-plugin-typescript2';
import resolve from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs';

const mode = process.env.MODE ?? 'prod';
const isProd = mode === 'prod';
export default [${configSet.join(',')}]
  `;
  await fsp.writeFile('rollup.config.gen.mjs', configStr);
}

pack().then(() => console.log('Pack configure generate complete!'));
