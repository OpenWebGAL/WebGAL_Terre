import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { env } from 'process';
import { lingui } from "@lingui/vite-plugin";
import Info from 'unplugin-info/vite';
import viteCompression from 'vite-plugin-compression';

let WEBGAL_PORT = 3000; // default port
if (env.WEBGAL_PORT) {
  WEBGAL_PORT = Number.parseInt(env.WEBGAL_PORT, 10);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["macros"],
      },
    }),
    lingui(),
    Info(),
    viteCompression({
      filter: /\.(js|css|ttf|wasm)$/,
      threshold: 10240,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve('src'),
    },
  },
  optimizeDeps: {
    include: ['buffer'],
    exclude: ['img2ico'],
  },
  server: {
    port: WEBGAL_PORT,
    proxy: {
      // 接口地址代理
      '/api': {
        target: `http://127.0.0.1:${WEBGAL_PORT + 1}`, // 接口的域名
        secure: true, // 如果是https接口，需要配置这个参数
        changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
        ws:true,
      },
      '/games': {
        target: `http://127.0.0.1:${WEBGAL_PORT + 1}`, // 接口的域名
        secure: true, // 如果是https接口，需要配置这个参数
        changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
      },
      '/templates': {
        target: `http://127.0.0.1:${WEBGAL_PORT + 1}`, // 接口的域名
        secure: true, // 如果是https接口，需要配置这个参数
        changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
      },
      '/template-preview': {
        target: `http://127.0.0.1:${WEBGAL_PORT + 1}`, // 接口的域名
        secure: true, // 如果是https接口，需要配置这个参数
        changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
      },
    },
  },
});
