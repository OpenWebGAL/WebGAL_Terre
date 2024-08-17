'use strict';

var fsp = require('fs/promises');
var process = require('process');
var path = require('path');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var fsp__namespace = /*#__PURE__*/_interopNamespaceDefault(fsp);
var process__namespace = /*#__PURE__*/_interopNamespaceDefault(process);
var path__namespace = /*#__PURE__*/_interopNamespaceDefault(path);

/**
 * For external edit this
 */
const externals = [];
async function pack() {
    const currentDir = process__namespace.cwd();
    const libRoot = path__namespace.join(currentDir, 'src', 'libs');
    const libs = await fsp__namespace.readdir(libRoot);
    const libDesc = [];
    for (const dirName of libs) {
        const libDir = path__namespace.join(libRoot, dirName);
        const stat = await fsp__namespace.stat(libDir);
        if (stat.isDirectory()) {
            libDesc.push({ name: dirName, dir: libDir });
        }
    }
    const configSet = [];
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
    await fsp__namespace.writeFile('rollup.config.gen.mjs', configStr);
}
pack().then(() => console.log('Pack configure generate complete!'));
