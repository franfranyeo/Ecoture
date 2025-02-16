import path from 'path';
import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      utils: path.resolve('src/utils'),
      contexts: path.resolve('src/contexts'),
      assets: path.resolve('src/assets'),
      components: path.resolve('src/components'),
      services: path.resolve('src/services'),
    },
  },
});
