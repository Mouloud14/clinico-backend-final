import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // AJOUTEZ OU MODIFIEZ LA PROPRIÉTÉ 'base' ICI
  base: process.env.NODE_ENV === 'production'
    ? '/' // Ou '/votre-nom-de-repo/' si déployé dans un sous-chemin GitHub Pages, mais Vercel déploie à la racine
    : '/',
  build: {
    outDir: 'dist', // Le dossier de sortie de votre build
  }
});