import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          // FIX: Replaced `path.resolve(__dirname, '.')` with `path.resolve('.')` as `__dirname` is not available in ES module scope. This correctly resolves to the project root.
          '@': path.resolve('.'),
        }
      }
    };
});