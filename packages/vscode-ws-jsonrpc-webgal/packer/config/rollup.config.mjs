import typescript from 'rollup-plugin-typescript2';
import resolve from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: `./packer/index.ts`,
  output: [
    {
      file: './packer/node/index.js',
      exports: 'named',
      format: 'cjs',
    },
  ],
  plugins: [resolve(),commonjs(),typescript({
    useTsconfigDeclarationDir: true,
    tsconfigOverride: {
      compilerOptions: {
        declaration: false,
      }, include: ['src'],
    }
  }),],
};
