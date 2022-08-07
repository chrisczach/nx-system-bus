// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
    server: { https: true },
    plugins: [mkcert()],
    build: {
        lib: {
            entry: resolve(__dirname, 'lib/main.ts'),
            name: 'NxSystemBus',
            fileName: 'nx-system-bus'
        },
        rollupOptions: {
            // make sure to externalize deps that shouldn't be bundled
            // into your library
            external: ['rxjs'],
            output: {
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    rxjs: 'Rxjs',
                    lodash: 'lodash-es'
                }
            }
        }
    }
})