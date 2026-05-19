// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    site: 'https://meetup.nixos-cn.org',
    server: {
        host: true,
    },
    redirects: {
        '/': '/zh-CN/',
    },
});
