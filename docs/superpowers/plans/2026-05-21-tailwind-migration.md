# Tailwind CSS Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all hand-written CSS in every `.astro` file with Tailwind CSS utility classes; no `<style>` blocks remain after migration.

**Architecture:** Phase 1 sets up `global.css` (tokens, keyframes, base reset, component-layer pseudo/selector rules) and updates `BaseLayout.astro`. Phase 2 converts the five component files in parallel — each reads its current source, applies the Tailwind class mappings, and deletes its `<style>` block.

**Tech Stack:** Astro 5, Tailwind CSS v4 (`@tailwindcss/vite`), TypeScript

---

## Reference: Translation conventions

| CSS pattern | Tailwind |
|---|---|
| `@media (max-width: 1023px)` | `max-lg:` |
| `@media (max-width: 639px)` | `max-sm:` |
| `@media (prefers-reduced-motion: reduce)` | `motion-reduce:` |
| `animation: heroFadeUp …` | `animate-hero-fade-up` |
| `animation-delay: 0.3s` | `[animation-delay:0.3s]` |
| `backdrop-filter: blur(4px)` | `backdrop-blur-sm` |
| `backdrop-filter: blur(10px) saturate(1.4)` | `backdrop-blur-[10px] backdrop-saturate-[140%]` |
| `mix-blend-mode: screen` | `mix-blend-screen` |
| Brand blue `#5277c3` | `text-brand-blue` / `bg-brand-blue` / `border-brand-blue` |
| Surface bg | `bg-surface` |
| Border color | `border-border` |
| `clamp(…)` / `calc(…)` | `[clamp(…)]` / `[calc(…)]` |

Every animated element gets `motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none` (except `.bottom-circles` which preserves its translateX — use `motion-reduce:[transform:translateX(-50%)]` there).

---

## Task 1: Set up global.css

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Replace the entire file with this content**

```css
@import "tailwindcss";

@theme {
  /* Brand colors */
  --color-brand-blue: #5277c3;
  --color-brand-dark: #030f20;
  --color-brand-light: #9bcef1;
  --color-surface: rgba(249, 251, 255, 0.9);
  --color-border: rgba(155, 206, 241, 0.8);

  /* Typography */
  --font-family-sans: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    sans-serif;

  /* Easings */
  --ease-hero: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-modal: cubic-bezier(0.22, 1, 0.36, 1);

  /* Named animations */
  --animate-hero-fade-up: heroFadeUp 0.55s var(--ease-hero) both;
  --animate-hero-fade-down: heroFadeDown 0.45s var(--ease-hero) both;
  --animate-hero-fade-in: heroFadeIn 0.5s var(--ease-hero) both;
  --animate-hero-fade-in-70: heroFadeInTo70 0.5s var(--ease-hero) both;
  --animate-modal-in: modalDialogIn 0.35s var(--ease-modal) both;
  --animate-modal-overlay: modalOverlayIn 0.28s var(--ease-modal) both;
}

@keyframes heroFadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes heroFadeDown {
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes heroFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes heroFadeInTo70 {
  from { opacity: 0; }
  to   { opacity: 0.7; }
}

@keyframes modalDialogIn {
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes modalOverlayIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@layer base {
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; min-height: 100%; }
  body {
    font-family: var(--font-family-sans);
    background: #ffffff;
    color: var(--color-brand-dark);
    -webkit-font-smoothing: antialiased;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    padding: 0 16px;
  }
}

@layer components {
  /* Navbar: active-link tab underline (SVG, cannot express as utility) */
  .nav-link.active::after {
    content: '';
    position: absolute;
    bottom: -18px;
    left: 50%;
    transform: translateX(-50%);
    width: 71px;
    height: 22px;
    background: url('/images/shared/tab-line.svg') center / contain no-repeat;
    pointer-events: none;
  }

  /* Navbar: suppress <details> marker */
  .hamburger::marker,
  .hamburger::-webkit-details-marker { display: none; }

  /* Navbar: mobile nav current page */
  .mobile-nav a[aria-current='page'] { font-weight: 700; }

  /* Navbar: last mobile nav link no bottom border */
  .mobile-nav a:last-child { border-bottom: none; }

  /* Calendar: bullet dot */
  .bullet-list li::before {
    content: '';
    position: absolute;
    left: 4px;
    top: 0.7em;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #33466d;
  }

  /* Calendar: injected <strong> inside bullet */
  .bullet-list li strong {
    font-size: 24px;
    font-weight: 600;
    color: #33466d;
    margin: 0 2px;
  }

  /* Calendar: smaller strong on mobile */
  @media (max-width: 639px) {
    .bullet-list li strong { font-size: 19px; }
  }

  /* Calendar: timeline marker */
  .timeline-list li::marker { color: #030f20; font-size: 1em; }

  /* Global: injected .accent spans */
  .accent { color: #5277c3; font-weight: 500; }

  /* CmsGuide: warning capsule injected via set:html */
  .hl-warn {
    display: inline-block;
    padding: 0 8px;
    margin: 0 2px;
    color: #d94f4f;
    font-weight: 600;
    border: 1px solid rgba(217, 79, 79, 0.45);
    border-radius: 8px;
    background: rgba(217, 79, 79, 0.06);
  }

  /* CmsGuide: step list bullet color */
  .step-list li::marker { color: #5277c3; }

  /* CmsGuide: adjacent tip paragraphs */
  .tip p + p { margin-top: 4px; }

  /* HomePage: gloss pseudo with JS-driven CSS vars */
  .nix-highlight::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(
      circle at var(--gloss-x) var(--gloss-y),
      rgba(255, 255, 255, 0.55) 0%,
      rgba(255, 255, 255, 0.18) 28%,
      rgba(255, 255, 255, 0) 60%
    );
    mix-blend-mode: screen;
    pointer-events: none;
    transform: translateZ(1px);
  }

  /* HomePage: highlight border pseudo */
  .nix-highlight::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    border: 1px solid rgba(255, 255, 255, 0.45);
    pointer-events: none;
    transform: translateZ(1px);
  }

  /* HomePage: English badge inline-end spacing */
  .headline--split-mobile .nix-highlight { margin-inline-end: 0.22em; }

  /* HomePage mobile: badge second-line block */
  @media (max-width: 639px) {
    .headline--split-mobile .nix-highlight { margin-inline-end: 0; }
    .headline--split-mobile .headline-tail { display: block; margin: 0; padding: 0; }
    .nix-highlight::before,
    .nix-highlight::after { display: none; }
  }

  /* Souvenir: modal overlay state */
  .coming-soon-overlay[hidden] { display: none; }
  .coming-soon-overlay.is-open { animation: var(--animate-modal-overlay); }

  /* Souvenir: modal dialog animation (triggered when overlay opens) */
  .coming-soon-overlay.is-open .coming-soon-dialog {
    animation: var(--animate-modal-in);
    animation-delay: 0.04s;
  }
}
```

- [ ] **Step 2: Verify the file looks correct**

```bash
grep -c '@theme\|@keyframes\|@layer base\|@layer components' src/styles/global.css
```
Expected: 4

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(styles): set up Tailwind theme tokens, keyframes, and component layer"
```

---

## Task 2: Update BaseLayout.astro

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Replace the file with this content** (imports global.css, removes style block)

```astro
---
import '../styles/global.css';

interface Props {
    title: string;
    description?: string;
    lang: string;
}

const { title, description, lang } = Astro.props;
---

<!doctype html>
<html lang={lang}>
    <head>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        {description && <meta name='description' content={description} />}
        <link rel='icon' type='image/svg+xml' href='/favicon.svg' />
        <title>{title}</title>
    </head>
    <body>
        <slot />
    </body>
</html>
```

- [ ] **Step 2: Verify no style block remains**

```bash
grep -c '<style' src/layouts/BaseLayout.astro
```
Expected: 0

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "refactor(layout): import global.css, remove style block"
```

---

## Task 3: Convert Navbar.astro

**Files:**
- Modify: `src/components/Navbar.astro`

Note: Keep class names `nav-link`, `active`, `mobile-nav`, `hamburger` on elements so the `@layer components` rules in global.css continue to apply (pseudo-elements and attribute selectors target these names).

- [ ] **Step 1: Replace the file with this content**

```astro
---
import { type Locale, type PageSlug, getTranslations, getPageUrl, LOCALES } from '../i18n/config';

type Page = PageSlug;

interface Props {
    locale: Locale;
    activePage: Page;
}

const { locale, activePage } = Astro.props;
const t = getTranslations(locale);
const otherLocale = LOCALES.find((l) => l !== locale) ?? LOCALES[0];

const url = (l: Locale, p: Page) => getPageUrl(l, p);
const switchHref = url(otherLocale, activePage);
---

<header class='flex items-center px-5 h-14 flex-shrink-0 relative z-20 max-sm:px-4'>
    <a href={url(locale, 'home')} class='flex items-center flex-shrink-0 no-underline' aria-label={t.nav.ariaLogoHome}>
        <img src='/images/shared/nix-cn.svg' alt='NixCN' width='110' height='31' class='h-[31px] w-auto block' />
    </a>

    <nav class='flex items-center gap-8 absolute left-1/2 -translate-x-1/2 max-lg:hidden' aria-label={t.nav.ariaMain}>
        <a
            href={url(locale, 'home')}
            class:list={['nav-link text-sm font-medium text-[#a7b8d0] no-underline tracking-[-0.05em] whitespace-nowrap transition-colors duration-200 relative pb-0.5 hover:text-brand-blue', activePage === 'home' && 'active text-brand-blue']}
            aria-current={activePage === 'home' ? 'page' : undefined}
        >
            {t.nav.home}
        </a>
        <a
            href={url(locale, 'calendar')}
            class:list={['nav-link text-sm font-medium text-[#a7b8d0] no-underline tracking-[-0.05em] whitespace-nowrap transition-colors duration-200 relative pb-0.5 hover:text-brand-blue', activePage === 'calendar' && 'active text-brand-blue']}
            aria-current={activePage === 'calendar' ? 'page' : undefined}
        >
            {t.nav.calendar}
        </a>
        <a
            href={url(locale, 'cmsGuide')}
            class:list={['nav-link text-sm font-medium text-[#a7b8d0] no-underline tracking-[-0.05em] whitespace-nowrap transition-colors duration-200 relative pb-0.5 hover:text-brand-blue', activePage === 'cmsGuide' && 'active text-brand-blue']}
            aria-current={activePage === 'cmsGuide' ? 'page' : undefined}
        >
            {t.nav.cmsGuide}
        </a>
        <a
            href={url(locale, 'souvenir')}
            class:list={['nav-link text-sm font-medium text-[#a7b8d0] no-underline tracking-[-0.05em] whitespace-nowrap transition-colors duration-200 relative pb-0.5 hover:text-brand-blue', activePage === 'souvenir' && 'active text-brand-blue']}
            aria-current={activePage === 'souvenir' ? 'page' : undefined}
        >
            {t.nav.souvenir}
        </a>
    </nav>

    <div class='flex items-center gap-4 ml-auto max-sm:hidden'>
        <a
            href='https://t.me/nixos_cn'
            target='_blank'
            rel='noopener noreferrer'
            aria-label={t.nav.ariaTelegram}
            class='text-[#a7b8d0] flex items-center no-underline transition-colors duration-200 hover:text-brand-blue'
        >
            <svg viewBox='0 0 24 24' fill='currentColor' width='22' height='22' aria-hidden='true'>
                <path d='M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z'></path>
            </svg>
        </a>
        <a
            href='https://matrix.to/#/#nixos-cn:matrix.org'
            target='_blank'
            rel='noopener noreferrer'
            aria-label={t.nav.ariaMatrix}
            class='text-[#a7b8d0] flex items-center no-underline transition-colors duration-200 hover:text-brand-blue'
        >
            <svg viewBox='0 0 24 24' fill='currentColor' width='22' height='22' aria-hidden='true'>
                <path d='M.632.55v22.9H2.28V24H0V0h2.28v.55zm7.043 7.26v1.157h.033c.309-.443.683-.784 1.117-1.024.433-.245.936-.365 1.5-.365.54 0 1.033.107 1.481.32.448.214.785.582 1.02 1.108.254-.374.6-.706 1.034-.993.434-.287.95-.43 1.546-.43.453 0 .872.056 1.26.167.388.11.716.286.993.53.276.243.489.564.646.96.157.395.232.863.232 1.408v5.786h-2.35v-4.928c0-.27-.012-.53-.04-.785-.027-.255-.09-.48-.19-.678-.102-.197-.258-.355-.462-.48-.203-.124-.475-.185-.81-.185-.337 0-.607.068-.816.205-.21.136-.373.318-.49.54-.12.222-.197.47-.24.745-.04.274-.062.555-.062.843v4.723h-2.35v-4.835c0-.243-.008-.486-.025-.73-.017-.243-.067-.467-.15-.668-.086-.202-.225-.366-.42-.49-.196-.125-.476-.187-.838-.187-.12 0-.265.024-.433.073-.17.048-.337.135-.5.262-.164.127-.302.304-.412.534-.11.228-.167.523-.167.884v5.157H5.41V7.81zm15.693 15.64V.55H21.72V0H24v24h-2.28v-.55z'></path>
            </svg>
        </a>
        <span class='block w-px h-5 bg-[#a7b8d0] opacity-40' aria-hidden='true'></span>
        <a href={switchHref} aria-label={t.nav.ariaLangSwitch} class='text-[#a7b8d0] flex items-center no-underline transition-colors duration-200 hover:text-brand-blue'>
            <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' width='22' height='22' aria-hidden='true'>
                <circle cx='12' cy='12' r='9.5'></circle>
                <path d='M12 2.5a14.5 14.5 0 0 1 3.5 9.5 14.5 14.5 0 0 1-3.5 9.5M12 2.5a14.5 14.5 0 0 0-3.5 9.5 14.5 14.5 0 0 0 3.5 9.5M2.5 12h19'></path>
            </svg>
        </a>
    </div>

    <details class='hidden ml-2 max-lg:block'>
        <summary class='hamburger flex flex-col gap-[5px] p-[8px_4px] cursor-pointer list-none' aria-label={t.nav.ariaMenu}>
            <span class='block w-[22px] h-0.5 bg-brand-blue rounded-sm transition-all duration-200'></span>
            <span class='block w-[22px] h-0.5 bg-brand-blue rounded-sm transition-all duration-200'></span>
            <span class='block w-[22px] h-0.5 bg-brand-blue rounded-sm transition-all duration-200'></span>
        </summary>
        <nav class='mobile-nav fixed top-14 left-2 right-2 bg-[rgba(249,251,255,0.97)] backdrop-blur-[10px] [-webkit-backdrop-filter:blur(10px)] border border-[rgba(155,206,241,0.5)] rounded-2xl py-4 px-5 flex flex-col gap-1 z-[100] shadow-[0_8px_32px_rgba(82,119,195,0.12)]' aria-label={t.nav.ariaMobile}>
            <a href={url(locale, 'home')} aria-current={activePage === 'home' ? 'page' : undefined} class='text-[15px] font-medium text-brand-blue no-underline py-2.5 border-b border-[rgba(155,206,241,0.3)] transition-opacity duration-150 hover:opacity-70'>{t.nav.home}</a>
            <a href={url(locale, 'calendar')} aria-current={activePage === 'calendar' ? 'page' : undefined} class='text-[15px] font-medium text-brand-blue no-underline py-2.5 border-b border-[rgba(155,206,241,0.3)] transition-opacity duration-150 hover:opacity-70'>{t.nav.calendar}</a>
            <a href={url(locale, 'cmsGuide')} aria-current={activePage === 'cmsGuide' ? 'page' : undefined} class='text-[15px] font-medium text-brand-blue no-underline py-2.5 border-b border-[rgba(155,206,241,0.3)] transition-opacity duration-150 hover:opacity-70'>{t.nav.cmsGuide}</a>
            <a href={url(locale, 'souvenir')} aria-current={activePage === 'souvenir' ? 'page' : undefined} class='text-[15px] font-medium text-brand-blue no-underline py-2.5 border-b border-[rgba(155,206,241,0.3)] transition-opacity duration-150 hover:opacity-70'>{t.nav.souvenir}</a>
            <hr class='border-0 border-t border-[rgba(155,206,241,0.4)] my-1' />
            <a href='https://t.me/nixos_cn' target='_blank' rel='noopener noreferrer' class='text-[15px] font-medium text-brand-blue no-underline py-2.5 border-b border-[rgba(155,206,241,0.3)] transition-opacity duration-150 hover:opacity-70'>Telegram</a>
            <a href='https://matrix.to/#/#nixos-cn:matrix.org' target='_blank' rel='noopener noreferrer' class='text-[15px] font-medium text-brand-blue no-underline py-2.5 border-b border-[rgba(155,206,241,0.3)] transition-opacity duration-150 hover:opacity-70'>Matrix</a>
            <a href={switchHref} class='text-[15px] font-medium text-brand-blue no-underline py-2.5 border-b border-[rgba(155,206,241,0.3)] transition-opacity duration-150 hover:opacity-70'>{t.nav.ariaLangSwitch}</a>
        </nav>
    </details>
</header>
```

- [ ] **Step 2: Verify no style block**

```bash
grep -c '<style' src/components/Navbar.astro
```
Expected: 0

- [ ] **Step 3: Commit**

```bash
git add src/components/Navbar.astro
git commit -m "refactor(navbar): replace style block with Tailwind utility classes"
```

---

## Task 4: Convert CalendarPage.astro

**Files:**
- Modify: `src/components/CalendarPage.astro`

Note: Keep class names `bullet-list`, `timeline-list`, `info-card`, `food-map`, `food-map-img` — `@layer components` targets these. Keep `id="food-block"` for scroll-margin.

- [ ] **Step 1: Replace the file with this content**

```astro
---
import Navbar from './Navbar.astro';
import BaseLayout from '../layouts/BaseLayout.astro';
import { type Locale, getTranslations } from '../i18n/config';

interface Props {
    locale: Locale;
}

const { locale } = Astro.props;
const t = getTranslations(locale);
const tp = t.calendar;
const foodMapSrc = locale === 'en' ? '/images/calendar/food-map-en.png' : '/images/calendar/food-map.png';
---

<BaseLayout title={tp.meta.title} description={tp.meta.description} lang={tp.meta.htmlLang}>
    <Navbar locale={locale} activePage='calendar' />

    <!-- ======= Page Heading ======= -->
    <section class='pt-12 pb-6 px-4 text-center flex-shrink-0 max-lg:pt-8 max-lg:pb-5 max-sm:pt-6 max-sm:px-2 max-sm:pb-4'>
        <h1 class='text-[clamp(2.25rem,5vw,4rem)] font-semibold tracking-[-0.05em] text-brand-dark mb-4 leading-[1.1] [text-shadow:0_4px_12px_rgba(3,15,32,0.06)] animate-hero-fade-up [animation-delay:0.1s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none max-sm:mb-3'>
            {tp.heading.title}
        </h1>
        <p class='text-base text-brand-dark tracking-[-0.05em] m-0 leading-[1.4] animate-hero-fade-up [animation-delay:0.18s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none max-sm:text-sm max-sm:px-2'>
            {tp.heading.sub}
        </p>
    </section>

    <!-- ======= Bento Grid ======= -->
    <div class='mx-auto mt-4 grid grid-cols-[32rem_1fr] grid-rows-[auto_auto] gap-[10px] max-lg:grid-cols-1 max-lg:auto-rows-auto max-sm:gap-2'>

        <!-- Tile: Agenda -->
        <div class='col-start-1 row-start-1 flex flex-col gap-4 bg-surface border-2 border-border rounded-[20px] p-6 px-7 backdrop-blur-sm [-webkit-backdrop-filter:blur(4px)] shadow-[0_4px_16px_rgba(82,119,195,0.06)] animate-hero-fade-up [animation-delay:0.28s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none max-lg:col-auto max-lg:row-auto max-sm:rounded-2xl max-sm:p-5 max-sm:px-[18px]'>
            <p class='text-xl font-medium tracking-[-0.05em] text-brand-dark m-0 leading-[1.4] flex items-center max-sm:text-[17px]'>
                <span class='text-xl leading-none inline-block mr-2 align-middle'>{tp.agenda.leadEmoji}</span>
                <span><Fragment set:html={tp.agenda.leadHtml} /></span>
            </p>
            <ul class='bullet-list list-none m-0 pl-3 flex flex-col gap-3'>
                {
                    tp.agenda.bullets.map((html) => (
                        <li class='relative px-[22px] pb-1 text-xl leading-[1.6] text-[#33466d] tracking-[-0.05em] font-medium [background:linear-gradient(rgba(126,186,228,0.31),rgba(126,186,228,0.31))_no-repeat] [background-position:22px_100%] [background-size:calc(100%-44px)_8px] max-sm:text-base max-sm:[background-size:calc(100%-44px)_6px]'>
                            <Fragment set:html={html} />
                        </li>
                    ))
                }
            </ul>
        </div>

        <!-- Tile: Schedule -->
        <div class='col-start-1 row-start-2 flex flex-col gap-4 bg-surface border-2 border-border rounded-[20px] p-6 px-7 backdrop-blur-sm [-webkit-backdrop-filter:blur(4px)] shadow-[0_4px_16px_rgba(82,119,195,0.06)] animate-hero-fade-up [animation-delay:0.38s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none max-lg:col-auto max-lg:row-auto max-sm:rounded-2xl max-sm:p-5 max-sm:px-[18px]'>
            <p class='text-xl font-medium tracking-[-0.05em] text-brand-dark m-0 leading-[1.4] flex items-center max-sm:text-[17px]'>
                <span class='text-xl leading-none inline-block mr-3 align-middle'>{tp.schedule.emoji}</span>
                <span>{tp.schedule.title}</span>
            </p>
            <div class='info-card bg-white border border-brand-blue rounded-2xl p-5 px-[22px] flex flex-col gap-[22px] shadow-[0_4px_16px_rgba(82,119,195,0.08)] max-sm:p-4 max-sm:gap-4 max-sm:rounded-[14px]'>
                <div class='flex items-start gap-3 flex-wrap max-sm:flex-col max-sm:gap-1'>
                    <span class='text-base text-brand-dark tracking-[-0.05em] leading-[1.6] flex-shrink-0 pt-px max-sm:text-sm'>{tp.schedule.timeLabel}</span>
                    <span class='text-xl font-medium text-brand-dark tracking-[-0.05em] leading-[1.4] max-sm:text-base'>{tp.schedule.timeValue}</span>
                </div>
                <div class='flex items-start gap-3 flex-wrap max-sm:flex-col max-sm:gap-1'>
                    <span class='text-base text-brand-dark tracking-[-0.05em] leading-[1.6] flex-shrink-0 pt-px max-sm:text-sm'>{tp.schedule.flowLabel}</span>
                    <ul class='timeline-list m-0 pl-[22px] list-disc flex flex-col gap-2'>
                        {
                            tp.schedule.flow.map((item) => (
                                <li class='text-xl font-medium text-brand-dark tracking-[-0.05em] leading-[1.4] max-sm:text-base'>
                                    <Fragment set:html={item} />
                                </li>
                            ))
                        }
                    </ul>
                </div>
            </div>
        </div>

        <!-- Tile: Food Map (spans both rows) -->
        <div id='food-block' class='col-start-2 row-[1/span_2] flex flex-col gap-4 bg-surface border-2 border-border rounded-[20px] p-6 px-7 backdrop-blur-sm [-webkit-backdrop-filter:blur(4px)] shadow-[0_4px_16px_rgba(82,119,195,0.06)] scroll-mt-6 animate-hero-fade-up [animation-delay:0.34s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none max-lg:col-auto max-lg:row-auto max-sm:rounded-2xl max-sm:p-5 max-sm:px-[18px]'>
            <p class='text-xl font-medium tracking-[-0.05em] text-brand-dark m-0 leading-[1.4] flex items-center max-sm:text-[17px]'>
                <span class='text-xl leading-none inline-block mr-3 align-middle'>{tp.food.emoji}</span>
                <span>{tp.food.title}</span>
            </p>
            <figure class='food-map flex-1 m-0 min-h-40 rounded-[14px] overflow-hidden border border-[rgba(82,119,195,0.3)] bg-[#f6fafc] flex max-lg:block max-sm:rounded-xl'>
                <img src={foodMapSrc} alt={tp.food.mapAlt} class='food-map-img block w-full object-contain object-top max-lg:h-auto' loading='lazy' decoding='async' />
            </figure>
        </div>
    </div>
</BaseLayout>
```

- [ ] **Step 2: Verify**

```bash
grep -c '<style' src/components/CalendarPage.astro
```
Expected: 0

- [ ] **Step 3: Commit**

```bash
git add src/components/CalendarPage.astro
git commit -m "refactor(calendar): replace style block with Tailwind utility classes"
```

---

## Task 5: Convert CmsGuidePage.astro

**Files:**
- Modify: `src/components/CmsGuidePage.astro`

Notes:
- Keep class names `tip`, `step-list`, `hero-sub` — targeted by `@layer components`.
- `hero-sub:nth-of-type` animation delays: apply inline `[animation-delay:Xs]` using map index instead of CSS selectors.
- `--step-delay` stays as inline style attribute; consume it with `[animation-delay:var(--step-delay,0.56s)]`.
- `.bottom-circles` `prefers-reduced-motion` preserves `translateX(-50%)` — use `motion-reduce:[transform:translateX(-50%)]`.

- [ ] **Step 1: Replace the file with this content**

```astro
---
import Navbar from './Navbar.astro';
import BaseLayout from '../layouts/BaseLayout.astro';
import { type Locale, getTranslations } from '../i18n/config';

interface Props {
    locale: Locale;
}

const { locale } = Astro.props;
const t = getTranslations(locale);
const tp = t.cmsGuide;

const subDelays = ['0.4s', '0.48s', '0.56s'];
---

<BaseLayout title={tp.meta.title} description={tp.meta.description} lang={tp.meta.htmlLang}>
    <Navbar locale={locale} activePage='cmsGuide' />

    <!-- ======= Hero Banner ======= -->
    <section class='relative pt-[38px] pb-12 px-6 text-center isolate overflow-hidden min-h-[215px] max-lg:pt-8 max-lg:pb-10 max-lg:px-5 max-sm:pt-6 max-sm:pb-8 max-sm:px-4' aria-labelledby='cms-title'>
        <div class='absolute inset-0 z-0 pointer-events-none overflow-hidden' aria-hidden='true'>
            <img class='absolute inset-0 w-full h-full object-cover object-top block animate-hero-fade-in motion-reduce:animate-none motion-reduce:opacity-100' src='/images/cms-guide/hero-bg.png' alt='' />
        </div>
        <div class='relative z-[1] max-w-[720px] mx-auto'>
            <h1 id='cms-title' class='text-[clamp(2.5rem,5.5vw,4.5rem)] font-semibold text-brand-dark m-0 mb-5 tracking-[-0.05em] leading-[1.1] [text-shadow:0_4px_14px_rgba(3,15,32,0.08)] animate-hero-fade-up [animation-delay:0.1s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none max-sm:mb-3'>
                {tp.hero.title}
            </h1>
            {tp.hero.subs.map((s, i) => (
                <p class='hero-sub text-[clamp(0.875rem,1vw,1rem)] text-[#1a2332] m-0 leading-[1.7] tracking-[-0.02em] animate-hero-fade-up motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none max-sm:text-[13px] max-sm:leading-[1.65]'
                   style={`animation-delay:${subDelays[i] ?? '0.56s'}`}>
                    {s}
                </p>
            ))}
        </div>
    </section>

    <!-- ======= Guide content ======= -->
    <main class='relative z-[2] w-full max-w-[1120px] mx-auto px-10 pt-6 pb-[120px] flex flex-col gap-10 max-lg:px-7 max-lg:pt-4 max-lg:pb-[100px] max-lg:gap-9 max-sm:px-[18px] max-sm:pt-2 max-sm:pb-20 max-sm:gap-8'>
        {
            tp.steps.map((step, i) => (
                <article
                    class='flex flex-col gap-4 animate-hero-fade-up [animation-delay:var(--step-delay,0.56s)] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none max-sm:gap-3'
                    id={step.id}
                    style={`--step-delay: ${0.56 + i * 0.06}s`}
                >
                    <h2 class='flex items-baseline gap-0 m-0 font-semibold leading-[1.2] tracking-[-0.04em] text-brand-dark'>
                        <span class='text-[clamp(1.75rem,2.4vw,2.25rem)] font-bold text-brand-dark [font-feature-settings:"tnum"] mr-2 max-sm:text-[28px]'>{step.num}</span>
                        <span class='text-[clamp(1.5rem,2vw,1.875rem)] text-[#a7b8d0] mr-[6px] font-normal max-sm:text-[22px]'>｜</span>
                        <span class='text-[clamp(1.5rem,2vw,1.875rem)] text-brand-dark font-semibold max-sm:text-[22px]'>{step.name}</span>
                    </h2>

                    {'bodyHtml' in step && step.bodyHtml !== undefined && (
                        <p class='text-[15px] leading-[1.8] text-[#1a2332] m-0 tracking-[-0.01em] max-sm:text-sm max-sm:leading-[1.75]'>
                            <Fragment set:html={step.bodyHtml} />
                        </p>
                    )}

                    {'bodyHtmls' in step &&
                        step.bodyHtmls !== undefined &&
                        step.bodyHtmls.map((html) => (
                            <p class='text-[15px] leading-[1.8] text-[#1a2332] m-0 tracking-[-0.01em] max-sm:text-sm max-sm:leading-[1.75]'>
                                <Fragment set:html={html} />
                            </p>
                        ))}

                    {'list' in step && step.list !== undefined && (
                        <ul class='step-list m-0 pl-6 text-[15px] leading-[1.9] text-[#1a2332] max-sm:text-sm'>
                            {step.list.map((item) => (
                                <li class='pl-1'>{item}</li>
                            ))}
                        </ul>
                    )}

                    {'afterListHtml' in step && step.afterListHtml !== undefined && (
                        <p class='text-[15px] leading-[1.8] text-[#1a2332] m-0 tracking-[-0.01em] max-sm:text-sm max-sm:leading-[1.75]'>
                            <Fragment set:html={step.afterListHtml} />
                        </p>
                    )}

                    {step.tip?.text && (
                        <div class='tip text-sm leading-[1.7] text-[#c66a2a] bg-[rgba(245,166,35,0.06)] border-l-[3px] border-[rgba(245,166,35,0.5)] rounded-r-lg py-3 px-4 mt-1 max-sm:text-[13px] max-sm:py-2.5 max-sm:px-3'>
                            <p class='m-0'>
                                <span class='inline-block mr-1' aria-hidden='true'>{tp.tipBell}</span>
                                <span class='font-semibold mr-0.5'>{tp.tipLabel}</span>
                                {step.tip.text}
                            </p>
                        </div>
                    )}
                </article>
            ))
        }
    </main>

    <!-- ======= Bottom circles decoration ======= -->
    <div class='absolute bottom-0 left-1/2 -translate-x-1/2 w-[min(710px,100%)] pointer-events-none z-0 animate-hero-fade-in [animation-delay:0.92s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:[transform:translateX(-50%)] max-lg:w-[min(560px,100%)] max-sm:w-[min(380px,100%)]' aria-hidden='true'>
        <img src='/images/cms-guide/bottom-circles.png' alt='' class='block w-full h-auto' />
    </div>
</BaseLayout>
```

- [ ] **Step 2: Verify**

```bash
grep -c '<style' src/components/CmsGuidePage.astro
```
Expected: 0

- [ ] **Step 3: Commit**

```bash
git add src/components/CmsGuidePage.astro
git commit -m "refactor(cms-guide): replace style block with Tailwind utility classes"
```

---

## Task 6: Convert HomePage.astro

**Files:**
- Modify: `src/components/HomePage.astro`

Notes:
- Keep class names `nix-highlight`, `headline--split-mobile`, `headline-tail` — targeted by `@layer components`.
- The `--gloss-x`/`--gloss-y` initial values go as inline CSS vars on `.nix-highlight`; JS in `badge-tilt.ts` updates them.
- `.hero-decoration` at max-sm changes animation to `heroFadeInTo70`: use `max-sm:animate-hero-fade-in-70`.
- At `max-sm` and `prefers-reduced-motion` combined: `opacity-[0.7]` — use `motion-reduce:max-sm:opacity-70`.
- `.headline` has `perspective: 800px` (desktop) and `perspective: none` (mobile) — use `[perspective:800px] max-sm:[perspective:none]`.
- `.bg-circles` uses `will-change: transform` — use `will-change-transform`.
- CTA button nth-child delays: apply `[animation-delay:0.42s]` and `[animation-delay:0.5s]` directly on each button element.

- [ ] **Step 1: Replace the file with this content**

```astro
---
import Navbar from './Navbar.astro';
import BaseLayout from '../layouts/BaseLayout.astro';
import { type Locale, getTranslations, getPageUrl } from '../i18n/config';

interface Props {
    locale: Locale;
}

const { locale } = Astro.props;
const t = getTranslations(locale);
const tp = t.home;

const url = (p: Parameters<typeof getPageUrl>[1]) => getPageUrl(locale, p);
---

<BaseLayout title={tp.meta.title} description={tp.meta.description} lang={tp.meta.htmlLang}>
    <Navbar locale={locale} activePage='home' />

    <!-- ======= Hero Card ======= -->
    <div class='flex-1 relative flex flex-col rounded-3xl border-2 border-border bg-[#f9fbff] overflow-hidden min-h-[640px] animate-hero-fade-in motion-reduce:animate-none motion-reduce:opacity-100 max-sm:rounded-2xl max-sm:min-h-auto'>

        <!-- Layer 0: dot-grid texture -->
        <div class='absolute inset-0 z-0 [background-image:radial-gradient(ellipse_80%_70%_at_60%_48%,transparent_15%,rgba(249,251,255,0.85)_85%),radial-gradient(circle,rgba(126,186,228,0.28)_2.5px,transparent_2.5px)] [background-size:auto,20px_20px] pointer-events-none will-change-transform animate-hero-fade-in [animation-delay:0.06s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:will-change-auto' aria-hidden='true'></div>

        <!-- Layer 1a: concentric circles -->
        <div class='absolute inset-0 z-[1] pointer-events-none will-change-transform motion-reduce:will-change-auto' aria-hidden='true'>
            <div class='absolute rounded-full border-[1.5px] border-[rgba(126,186,228,0.28)] top-0 left-0 shadow-[0_2px_8px_rgba(126,186,228,0.12),0_10px_28px_rgba(126,186,228,0.2)] animate-hero-fade-in [animation-delay:0.1s] w-[502px] h-[502px] translate-x-[-269px] translate-y-[-241px] motion-reduce:animate-none motion-reduce:opacity-100 max-lg:w-[300px] max-lg:h-[300px] max-lg:translate-x-[-160px] max-lg:translate-y-[-144px] max-sm:w-[220px] max-sm:h-[220px] max-sm:translate-x-[-120px] max-sm:translate-y-[-108px]'></div>
            <div class='absolute rounded-full border-[1.5px] border-[rgba(126,186,228,0.28)] top-0 left-0 shadow-[0_2px_8px_rgba(126,186,228,0.12),0_10px_28px_rgba(126,186,228,0.2)] animate-hero-fade-in [animation-delay:0.16s] w-[459px] h-[459px] translate-x-[-248px] translate-y-[-220px] motion-reduce:animate-none motion-reduce:opacity-100 max-lg:w-[275px] max-lg:h-[275px] max-lg:translate-x-[-148px] max-lg:translate-y-[-132px] max-sm:w-[200px] max-sm:h-[200px] max-sm:translate-x-[-108px] max-sm:translate-y-[-96px]'></div>
            <div class='absolute rounded-full border-[1.5px] border-[rgba(126,186,228,0.28)] top-0 left-0 shadow-[0_2px_8px_rgba(126,186,228,0.12),0_10px_28px_rgba(126,186,228,0.2)] animate-hero-fade-in [animation-delay:0.22s] w-[408px] h-[408px] translate-x-[-222px] translate-y-[-199px] motion-reduce:animate-none motion-reduce:opacity-100 max-lg:w-[244px] max-lg:h-[244px] max-lg:translate-x-[-133px] max-lg:translate-y-[-119px] max-sm:w-[178px] max-sm:h-[178px] max-sm:translate-x-[-96px] max-sm:translate-y-[-86px]'></div>
        </div>

        <!-- Layer 1b: NixOS snowflake canvas -->
        <div class='absolute right-[-80px] bottom-[-120px] z-[2] pointer-events-none leading-none animate-hero-fade-in [animation-delay:0.18s] motion-reduce:animate-none motion-reduce:opacity-100 max-lg:right-[-120px] max-lg:bottom-[-140px] max-lg:scale-[0.7] max-lg:origin-bottom-right max-sm:block max-sm:right-[-90px] max-sm:bottom-[-100px] max-sm:scale-[0.7] max-sm:origin-bottom-right max-sm:animate-hero-fade-in-70 motion-reduce:max-sm:opacity-70 [@media(max-width:639px)_and_(max-height:683px)]:hidden' aria-hidden='true'>
            <canvas id='nixflake' class='block max-w-none pointer-events-none'></canvas>
        </div>

        <!-- Layer 2: foreground content -->
        <div class='flex-1 relative z-[3] flex items-center min-h-[640px] p-12 px-20 max-lg:p-10 max-lg:px-10 max-lg:pb-12 max-lg:min-h-[520px] max-sm:p-8 max-sm:px-6 max-sm:pb-11 max-sm:min-h-[560px]'>
            <div class='w-full max-w-[640px] will-change-transform motion-reduce:will-change-auto max-lg:max-w-full'>
                <p class='text-[clamp(1.5rem,3.33vw,3rem)] font-semibold tracking-[-0.05em] text-brand-dark m-0 mb-4 leading-[1.2] [text-shadow:0_4px_12px_rgba(3,15,32,0.1)] animate-hero-fade-up [animation-delay:0.12s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none'>
                    {tp.hero.conferenceTitle}
                    <span class='text-[#7ebae4]'>{tp.hero.year}</span>
                </p>
                <h1 class:list={['headline text-[clamp(2rem,4.44vw,4rem)] font-semibold tracking-[-0.05em] text-brand-blue m-0 mb-7 leading-[1.15] [text-shadow:0_6px_18px_rgba(82,119,195,0.18)] [perspective:800px] [perspective-origin:50%_50%] animate-hero-fade-up [animation-delay:0.22s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none max-sm:leading-[1.35] max-sm:[perspective:none]', { 'headline--split-mobile': locale === 'en' }]}>
                    {tp.hero.headlineBefore}<span class='nix-highlight relative inline-block py-0.5 px-[14px] leading-[inherit] rounded-full [background:linear-gradient(135deg,rgba(196,226,247,0.65)_0%,rgba(126,186,228,0.42)_48%,rgba(82,140,200,0.34)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-1px_2px_rgba(82,119,195,0.2),0_6px_14px_rgba(82,119,195,0.22),0_14px_30px_rgba(82,119,195,0.14)] [transform-style:preserve-3d] will-change-transform translate-z-0 transition-shadow duration-300 [--gloss-x:30%] [--gloss-y:25%] motion-reduce:will-change-auto motion-reduce:transition-none max-sm:py-0 max-sm:px-[9px] max-sm:pb-0.5 max-sm:rounded-[999px] max-sm:bg-[rgba(197,219,245,0.78)] max-sm:text-brand-blue max-sm:text-[1.22em] max-sm:leading-[1.05] max-sm:align-baseline max-sm:shadow-none max-sm:[text-shadow:3px_4px_0_#9eb8e8] max-sm:![transform:none] max-sm:[transform-style:flat] max-sm:will-change-auto max-sm:transition-none'>{tp.hero.headlineBadge}</span><span
                        class='headline-tail'
                        set:html={tp.hero.headlineAfter}
                    />
                </h1>
                <p class='text-[clamp(1rem,1.39vw,1.25rem)] text-[#1a2332] m-0 mb-10 leading-[1.65] tracking-[-0.02em] max-w-[480px] animate-hero-fade-up [animation-delay:0.32s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none max-sm:mb-8'>
                    {tp.hero.lead}
                </p>
                <div class='flex gap-3 flex-wrap max-sm:flex-col max-sm:items-start max-sm:gap-[10px]'>
                    <a class='inline-flex items-center px-5 py-3 rounded-3xl text-base font-medium tracking-[-0.05em] no-underline transition-[background,border-color,transform,box-shadow] duration-200 whitespace-nowrap cursor-pointer font-[inherit] animate-hero-fade-up [animation-delay:0.42s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none bg-brand-blue text-white border-[1.5px] border-brand-blue hover:bg-[#4269b8] hover:border-[#4269b8] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(82,119,195,0.35)] max-sm:w-full max-sm:justify-center' href='https://nix.org.cn/app/'>
                        {tp.hero.ctaPrimary}
                    </a>
                    <a class='inline-flex items-center px-5 py-3 rounded-3xl text-base font-medium tracking-[-0.05em] no-underline transition-[background,border-color,transform,box-shadow] duration-200 whitespace-nowrap cursor-pointer font-[inherit] animate-hero-fade-up [animation-delay:0.5s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none bg-[rgba(249,251,255,0.45)] text-brand-blue border-[1.5px] border-brand-blue backdrop-blur-[10px] backdrop-saturate-[140%] [-webkit-backdrop-filter:blur(10px)_saturate(1.4)] hover:bg-[rgba(82,119,195,0.12)] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(82,119,195,0.15)] max-sm:w-full max-sm:justify-center' href={url('cmsGuide')}>
                        {tp.hero.ctaSecondary}
                    </a>
                </div>
            </div>
        </div>
    </div>
</BaseLayout>

<!-- ======= Scripts ======= -->
<script>
    import { initNixflakeAnimation } from '../scripts/nixflake-animation';
    import { initBadgeTilt } from '../scripts/badge-tilt';
    import { initBgParallax } from '../scripts/bg-parallax';

    initNixflakeAnimation();
    initBadgeTilt();
    initBgParallax();
</script>
```

- [ ] **Step 2: Verify**

```bash
grep -c '<style' src/components/HomePage.astro
```
Expected: 0

- [ ] **Step 3: Commit**

```bash
git add src/components/HomePage.astro
git commit -m "refactor(home): replace style block with Tailwind utility classes"
```

---

## Task 7: Convert SouvenirPage.astro

**Files:**
- Modify: `src/components/SouvenirPage.astro`

Notes:
- Keep class names `coming-soon-overlay`, `coming-soon-dialog` — JS adds `.is-open`; `@layer components` triggers the animation.
- `.bottom-circles` `motion-reduce` preserves `translateX(-50%)` — use `motion-reduce:[transform:translateX(-50%)]`.
- The `<script>` block at the bottom is unchanged.

- [ ] **Step 1: Replace the file with this content**

```astro
---
import Navbar from './Navbar.astro';
import BaseLayout from '../layouts/BaseLayout.astro';
import { type Locale, getTranslations } from '../i18n/config';

interface Props {
    locale: Locale;
}

const { locale } = Astro.props;
const t = getTranslations(locale);
const tp = t.souvenir;
const ts = tp.comingSoon;
---

<BaseLayout title={tp.meta.title} description={tp.meta.description} lang={tp.meta.htmlLang}>
    <Navbar locale={locale} activePage='souvenir' />

    <!-- ======= Hero Banner ======= -->
    <section class='relative pt-[38px] pb-12 px-6 text-center isolate overflow-hidden min-h-[215px] max-lg:pt-8 max-lg:pb-10 max-lg:px-5 max-sm:pt-6 max-sm:pb-8 max-sm:px-4' aria-labelledby='souvenir-title'>
        <div class='absolute inset-0 z-0 pointer-events-none overflow-hidden' aria-hidden='true'>
            <img class='absolute inset-0 w-full h-full object-cover object-top block animate-hero-fade-in motion-reduce:animate-none motion-reduce:opacity-100' src='/images/souvenir/hero-bg.png' alt='' />
        </div>
        <div class='relative z-[1] max-w-[720px] mx-auto'>
            <h1 id='souvenir-title' class='text-[clamp(2.5rem,5.5vw,4.5rem)] font-semibold text-brand-dark m-0 mb-4 tracking-[-0.05em] leading-[1.1] [text-shadow:0_4px_14px_rgba(3,15,32,0.08)] animate-hero-fade-up [animation-delay:0.1s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none max-sm:mb-3'>
                {tp.hero.title}
            </h1>
            <p class='text-[clamp(0.875rem,1vw,1rem)] text-[#1a2332] m-0 leading-[1.7] tracking-[-0.02em] max-w-[640px] mx-auto animate-hero-fade-up [animation-delay:0.18s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none max-sm:text-[13px] max-sm:leading-[1.65]'>
                {tp.hero.sub}
            </p>
        </div>
    </section>

    <!-- ======= Feature Card ======= -->
    <main class='relative z-[2] w-full max-w-[1152px] mx-auto px-10 pt-4 pb-[120px] max-lg:px-7 max-lg:pt-3 max-lg:pb-[100px] max-sm:px-[18px] max-sm:pt-2 max-sm:pb-20'>
        <section class='relative min-h-[400px] rounded-3xl border-2 border-border bg-[#f9fbff] overflow-hidden flex items-stretch animate-hero-fade-in [animation-delay:0.22s] motion-reduce:animate-none motion-reduce:opacity-100 max-lg:min-h-[360px] max-sm:min-h-0' aria-labelledby='feature-title'>
            <div class='absolute inset-0 z-0 pointer-events-none overflow-hidden' aria-hidden='true'>
                <img class='absolute left-[-15%] top-[-35%] w-[130%] h-auto min-h-full object-cover object-center block' src='/images/souvenir/card-texture.png' alt='' />
            </div>
            <div class='absolute right-14 top-[155px] z-[1] pointer-events-none animate-hero-fade-in [animation-delay:0.36s] motion-reduce:animate-none motion-reduce:opacity-100 max-lg:right-6 max-lg:top-auto max-lg:bottom-4 max-sm:right-[-12px] max-sm:bottom-[-8px] max-sm:top-auto' aria-hidden='true'>
                <img src='/images/souvenir/card-snowflake.png' alt='' width='327' height='325' class='block w-[327px] h-auto max-lg:w-[min(260px,32vw)] max-sm:w-[180px]' />
            </div>
            <div class='relative z-[2] flex flex-col justify-center gap-6 p-[60px_48px] max-w-[720px] max-lg:p-[48px_36px] max-sm:p-[32px_24px_40px] max-sm:gap-5'>
                <h2 id='feature-title' class='text-[clamp(1.5rem,2.2vw,2rem)] font-semibold text-brand-dark m-0 tracking-[-0.04em] leading-[1.25] animate-hero-fade-up [animation-delay:0.32s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none max-sm:text-[22px]'>
                    {tp.card.title}
                </h2>
                <p class='text-[15px] leading-[1.8] text-[#1a2332] m-0 tracking-[-0.01em] max-w-[560px] animate-hero-fade-up [animation-delay:0.4s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none max-sm:text-sm max-sm:leading-[1.75]'>
                    {tp.card.body}
                </p>
                <button type='button' class='inline-flex items-center gap-[10px] self-start py-[18px] px-8 border-none rounded-[36px] bg-brand-blue text-white text-base font-medium font-[inherit] tracking-[-0.05em] cursor-pointer transition-[background,transform,box-shadow] duration-200 whitespace-nowrap animate-hero-fade-up [animation-delay:0.48s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none hover:bg-[#4269b8] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(82,119,195,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-[3px] max-sm:w-full max-sm:justify-center max-sm:py-4 max-sm:px-6' id='souvenir-cta-btn' aria-haspopup='dialog'>
                    {tp.card.cta}
                    <img class='block w-[35px] h-[35px] flex-shrink-0 max-sm:w-7 max-sm:h-7' src='/images/souvenir/cta-arrow.png' alt='' width='35' height='35' />
                </button>
            </div>
        </section>
    </main>

    <!-- ======= Coming Soon Modal ======= -->
    <div class='coming-soon-overlay fixed inset-0 z-[1000] grid place-items-center p-6' id='coming-soon-overlay' hidden aria-hidden='true'>
        <button
            type='button'
            class='absolute inset-0 border-none p-0 m-0 bg-[rgba(3,15,32,0.45)] backdrop-blur-sm cursor-pointer'
            id='coming-soon-backdrop'
            tabindex='-1'
            aria-label={ts.ariaClose}
        ></button>
        <div
            class='coming-soon-dialog relative z-[1] w-[min(100%,420px)] py-9 px-8 pb-7 rounded-3xl border-2 border-border bg-[#f9fbff] shadow-[0_24px_48px_rgba(3,15,32,0.14),0_0_0_1px_rgba(255,255,255,0.6)_inset] text-center'
            role='dialog'
            aria-modal='true'
            aria-labelledby='coming-soon-title'
            id='coming-soon-dialog'
        >
            <div class='flex justify-center mb-4 text-brand-blue' aria-hidden='true'>
                <svg width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <circle cx='24' cy='24' r='22' stroke='currentColor' stroke-width='2' opacity='0.25'></circle>
                    <path d='M24 14v12l8 4' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'></path>
                </svg>
            </div>
            <h3 id='coming-soon-title' class='m-0 mb-3 text-[clamp(1.25rem,2.5vw,1.5rem)] font-semibold text-brand-dark tracking-[-0.04em] leading-[1.3]'>
                {ts.title}
            </h3>
            <p class='m-0 mb-7 text-[15px] leading-[1.75] text-[#1a2332] tracking-[-0.01em]'>{ts.body}</p>
            <button type='button' class='inline-flex items-center justify-center min-w-[140px] py-3.5 px-7 border-none rounded-[36px] bg-brand-blue text-white text-[15px] font-medium font-[inherit] tracking-[-0.03em] cursor-pointer transition-[background,transform,box-shadow] duration-200 hover:bg-[#4269b8] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(82,119,195,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-[3px]' id='coming-soon-close'>
                {ts.close}
            </button>
        </div>
    </div>

    <!-- ======= Bottom circles decoration ======= -->
    <div class='absolute bottom-0 left-1/2 -translate-x-1/2 w-[min(710px,100%)] pointer-events-none z-0 animate-hero-fade-in [animation-delay:0.4s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:[transform:translateX(-50%)] max-lg:w-[min(560px,100%)] max-sm:w-[min(380px,100%)]' aria-hidden='true'>
        <img src='/images/souvenir/bottom-circles.png' alt='' class='block w-full h-auto' />
    </div>
</BaseLayout>

<script>
    function initComingSoonModal() {
        const overlay = document.getElementById('coming-soon-overlay');
        const openBtn = document.getElementById('souvenir-cta-btn');
        const closeBtn = document.getElementById('coming-soon-close');
        const backdrop = document.getElementById('coming-soon-backdrop');

        if (!overlay || !openBtn || !closeBtn || !backdrop || overlay.dataset.init === 'true') {
            return;
        }

        overlay.dataset.init = 'true';

        let lastFocused: HTMLElement | null = null;

        const openModal = () => {
            lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            overlay.hidden = false;
            overlay.setAttribute('aria-hidden', 'false');
            overlay.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            closeBtn.focus();
        };

        const closeModal = () => {
            overlay.classList.remove('is-open');
            overlay.hidden = true;
            overlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            lastFocused?.focus();
            lastFocused = null;
        };

        openBtn.addEventListener('click', openModal);
        closeBtn.addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !overlay.hidden) {
                closeModal();
            }
        });
    }

    initComingSoonModal();
    document.addEventListener('astro:page-load', initComingSoonModal);
</script>
```

- [ ] **Step 2: Verify**

```bash
grep -c '<style' src/components/SouvenirPage.astro
```
Expected: 0

- [ ] **Step 3: Commit**

```bash
git add src/components/SouvenirPage.astro
git commit -m "refactor(souvenir): replace style block with Tailwind utility classes"
```

---

## Task 8: Final verification pass

**Files:** All converted files (read-only verification)

- [ ] **Step 1: Confirm zero style blocks remain across all files**

```bash
grep -rn '<style' src/components/ src/layouts/
```
Expected: no output

- [ ] **Step 2: Confirm zero :global() selectors remain**

```bash
grep -rn ':global(' src/components/ src/layouts/
```
Expected: no output

- [ ] **Step 3: Build the project and check for errors**

```bash
npm run build 2>&1 | tail -20
```
Expected: build completes without errors

- [ ] **Step 4: Start dev server and spot-check visually**

```bash
npm run dev
```

Open in browser and verify each page at desktop (≥1024px), tablet (768px), and mobile (375px):
- `/zh-CN/` — hero card, badge gloss tilt, concentric circles, snowflake canvas, CTA buttons
- `/zh-CN/calendar` — bento grid (2-col desktop, 1-col mobile), food map tile
- `/zh-CN/cms-guide` — hero banner, step cards with staggered animation, bottom circles
- `/zh-CN/souvenir` — feature card, modal opens/closes, bottom circles
- Navbar active-link tab-line SVG visible on active page
- Mobile menu opens on hamburger tap

- [ ] **Step 5: Commit verification note**

```bash
git add -p  # stage any fixup changes found during spot-check
git commit -m "chore: Tailwind migration verification pass"
```
(Skip if no fixups needed.)
