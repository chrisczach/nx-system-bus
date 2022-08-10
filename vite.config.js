// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

console.log(process.argv + 'logged')

const libConfig = {
    server: { https: true },
    plugins: [mkcert()],
    build: {
        lib: {
            entry: resolve(__dirname, 'lib/main.ts'),
            name: 'NxSystemBus',
            fileName: 'nx-system-bus'
        }
    }
}

export default defineConfig(process.env.MODE === 'deploy' ? {} : libConfig)