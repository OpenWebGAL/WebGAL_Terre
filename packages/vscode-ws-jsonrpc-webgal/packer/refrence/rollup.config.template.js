import typescript from 'rollup-plugin-typescript2';
import resolve from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs';

const mode = process.env.MODE;
const isProd = mode === 'prod';

export default {
  input: `./src/index.ts`,
  output: [
    {
      file: './build/cjs/index.js',
      exports: 'named',
      format: 'cjs',
      sourcemap: !isProd
    },
    {
      file: './build/index.js',
      format: 'es',
      sourcemap: !isProd
    },
    {
      file: 'build/index.global.js',
      name: '__umd_name_edit_this',
      format: 'iife',
      sourcemap: !isProd
    },
  ],
  plugins: [resolve(),commonjs(),typescript({
    useTsconfigDeclarationDir: true,
    tsconfigOverride: {
      compilerOptions: {
        sourceMap: !isProd,
        declarationDir: 'build',
      }, include: ['src'],
    }
  }),],
  external:['react']
};
