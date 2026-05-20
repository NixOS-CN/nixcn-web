// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
    site: 'https://meetup.nixos-cn.org',
    vite: {
        plugins: [tailwindcss()],
        preview: {
            allowedHosts: ['test.nix.org.cn', 'nix.org.cn'],
        },
    },
    server: {
        host: true,
    },
    redirects: {
        '/': '/zh-CN/',
    },
});
