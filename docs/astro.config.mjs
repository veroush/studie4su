// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  integrations: [
   starlight({
  title: 'Studie4SU Documentatie',
  customCss: [
    './src/styles/custom.css',
  ],
  sidebar: [
        {
         label: 'Welkom bij Studie4SU', slug: 'gebruikers/welkom'
        },
      ],
    }),
  ],
});