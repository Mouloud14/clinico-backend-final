import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Propriété 'base' pour la gestion des chemins en production/développement
  base: process.env.NODE_ENV === 'production'
    ? '/' // En production, l'application est à la racine du domaine Vercel
    : '/', // En développement, l'application est à la racine du localhost

  build: {
    outDir: 'dist', // Le dossier de sortie de votre build (standard pour Vite)
  }
}); // <<< TRÈS IMPORTANT : Assurez-vous que cette accolade fermante et le point-virgule sont présents !