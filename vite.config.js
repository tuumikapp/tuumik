import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  meteor: {
    clientEntry: 'src/client/startup/main.js',
  },
});
