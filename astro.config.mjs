// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';
import starlightUITweaks from 'starlight-ui-tweaks';

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
            sidebar: ['meetup-2-guide', 'souvenir-customization', 'volunteers', 'code-of-conduct', 'calendar'],
            plugins: [
                starlightUITweaks({
                    navbarLinks: [{ label: 'Nix CN 社区 ↗', href: 'https://nixos-cn.org/' }],
                    locales: {
                        en: {
                            navbarLinks: [{ label: 'Nix CN Community ↗', href: 'https://nixos-cn.org/' }],
                        },
                    },
                }),
            ],
        }),
        mdx(),
    ],
});
