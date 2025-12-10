// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
    integrations: [
        starlight({
            title: 'Nix CN',
            defaultLocale: 'root',
            logo: {
                light: './src/assets/nix-cn.svg',
                dark: './src/assets/nix-cn-dark.svg',
                replacesTitle: true,
            },
            locales: {
                root: {
                    label: '简体中文',
                    lang: 'zh-CN',
                },
                en: {
                    label: 'English',
                },
            },
            social: [
                {
                    icon: 'seti:git',
                    label: 'Source',
                    href: 'https://git.sne.moe/sugar/nixcn-web',
                },
            ],
            sidebar: ['meetup-2-guide'],
            plugins: [],
        }),
        mdx(),
    ],
});
