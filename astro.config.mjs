// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightThemeGalaxy from 'starlight-theme-galaxy';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
    integrations: [
        starlight({
            title: 'NixCN',
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
                    icon: 'github',
                    label: 'GitHub',
                    href: 'https://github.com/withastro/starlight',
                },
            ],
            sidebar: [],
            plugins: [starlightThemeGalaxy()],
        }),
        mdx(),
    ],
});
