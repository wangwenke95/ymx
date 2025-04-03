import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vueDevTools(),
    ],
    // build: {
    //     rollupOptions: {
    //         output:{
    //             entryFileNames:'js/[name]-[hash].js',
    //             chunkFileNames:'js/[name]-[hash].js',
    //             assetFileNames:'css/[name]-[hash].[ext]'
    //         },
    //     }
    // },
    base: './', // 设置基础路径为当前目录

    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        host: '0.0.0.0', // 允许局域网访问
        port: 3000       // 自定义端口
    }
})
