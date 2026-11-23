import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// GitHub Pages melayani situs ini dari /Rumisync-iot/, sedangkan Vercel dan
// pengembangan lokal memakai akar (/). Router memakai hash, jadi hanya aset
// statis yang bergantung pada base ini.
const base = process.env.GITHUB_ACTIONS ? '/Rumisync-iot/' : '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
  ],
})