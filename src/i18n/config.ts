import translations from './translations.json';

export const LOCALES = ['zh-CN', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const defaultLocale: Locale = 'zh-CN';

export function getLocalePaths() {
    return LOCALES.map((lang) => ({ params: { lang } }));
}

export function getTranslations(locale: Locale) {
    return translations[locale];
}

export const PAGE_SLUGS = {
    home: '',
    eventGuide: 'event-guide',
    cmsGuide: 'cms-guide',
    souvenir: 'souvenir',
    agenda: 'agenda',
} as const;

export type PageSlug = keyof typeof PAGE_SLUGS;

export function getPageUrl(locale: Locale, page: PageSlug): string {
    const slug = PAGE_SLUGS[page];
    return slug ? `/${locale}/${slug}` : `/${locale}/`;
}
