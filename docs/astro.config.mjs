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
      label: 'Gebruikershandleiding',
      items: [
        { label: 'Welkom bij Studie4SU', slug: 'handleiding' },
      ],
    },
      {
        label: 'Voor Developers',
        items: [
          { label: 'Project Overview', link: '/' }, // Dit linkt de index.mdx
          { label: 'Setup & Installation', slug: 'setup' },
          { label: 'API Documentatie', slug: 'api' },
          { label: 'QA Testing', slug: 'qa-testing' },
        ],
      },
    ],
    }),
  ],
});