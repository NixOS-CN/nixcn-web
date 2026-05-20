// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
    site: 'https://meetup.nixos-cn.org',
    vite: {
        plugins: [tailwindcss()],
    },
    server: {
        host: true,
    },
    i18n: {
        locales: ['zh-CN', 'en'],
        defaultLocale: 'zh-CN',
    },
});
