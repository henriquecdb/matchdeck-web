import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL || 'https://henriquecdb.github.io',
  base: process.env.BASE_PATH || '/matchdeck-web',
  output: 'static',
  trailingSlash: 'always',
});
