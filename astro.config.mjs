// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
    site: 'https://meetup.nixos-cn.org',
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
                    href: 'https://github.com/NixOS-CN/nixcn-web',
                },
            ],
            sidebar: ['meetup-2-guide', 'badge-customization'],
            plugins: [],
        }),
        mdx(),
    ],
});
