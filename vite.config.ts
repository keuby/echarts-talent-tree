import { defineConfig } from 'vite';
import vueJsx from '@vitejs/plugin-vue-jsx';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  base: './',
  plugins: [vueJsx(), legacy()],
  build: {
    target: 'es2015',
    chunkSizeWarningLimit: 1000,
  },
});
