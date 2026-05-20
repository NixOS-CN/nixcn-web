# Tailwind CSS Migration Design

**Date:** 2026-05-20  
**Scope:** Replace all hand-written CSS in the project with Tailwind CSS utility classes.

---

## Goal

Eliminate all `<style>` blocks from every `.astro` file. All styling moves to Tailwind utility classes on HTML elements, with shared tokens and keyframes centralized in `src/styles/global.css`. Visual output must be identical to pre-migration.

---

## Approach

Global-first, then parallel component conversion.

1. **Phase 1 (sequential):** Finalize `global.css` and update `BaseLayout.astro`. Must complete before Phase 2 so sub-agents have a definitive token reference.
2. **Phase 2 (parallel):** All 5 component files converted simultaneously by independent sub-agents.

---

## Phase 1: global.css

`src/styles/global.css` is already created with `@import "tailwindcss"`. Extend it with:

### `@theme` block

Register all project-specific design tokens as Tailwind CSS variables:

```css
@theme {
  /* Brand colors */
  --color-brand-blue: #5277c3;
  --color-brand-dark: #030f20;
  --color-brand-light: #9bcef1;
  --color-surface: rgba(249, 251, 255, 0.9);
  --color-border: rgba(155, 206, 241, 0.8);

  /* Typography */
  --font-family-sans: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  /* Easings */
  --ease-hero: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-modal: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Named animations (name maps to @keyframes below) */
  --animate-hero-fade-up: heroFadeUp 0.55s var(--ease-hero) both;
  --animate-hero-fade-down: heroFadeDown 0.45s var(--ease-hero) both;
  --animate-hero-fade-in: heroFadeIn 0.5s var(--ease-hero) both;
  --animate-hero-fade-in-70: heroFadeInTo70 0.5s var(--ease-hero) both;
  --animate-modal-in: modalDialogIn 0.3s var(--ease-modal) both;
  --animate-modal-overlay: modalOverlayIn 0.2s ease both;
}
```

The existing `--hero-ease` / `--modal-ease` CSS variables are renamed to `--ease-hero` / `--ease-modal` to follow Tailwind v4 token conventions. References in any remaining inline styles or JS must use the new names.

### `@keyframes`

Define all kept animations here:

- `heroFadeUp` — `opacity: 0; transform: translateY(10px)` → `opacity: 1; transform: none`
- `heroFadeDown` — `opacity: 0; transform: translateY(-10px)` → `opacity: 1; transform: none`
- `heroFadeIn` — `opacity: 0` → `opacity: 1`
- `heroFadeInTo70` — `opacity: 0` → `opacity: 0.7`
- `modalDialogIn` — scale + fade in
- `modalOverlayIn` — fade in

Exact keyframe values must be read from current component source before writing.

### `@layer base`

Replaces the `<style is:global>` block in `BaseLayout.astro`:

```css
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
```

---

## Phase 1: BaseLayout.astro

- Add `import '../styles/global.css'` to the frontmatter
- Remove the `<style is:global>` block entirely

---

## Phase 2: Component files

Files: `Navbar.astro`, `HomePage.astro`, `CalendarPage.astro`, `CmsGuidePage.astro`, `SouvenirPage.astro`.

Each is converted by reading its current `<style>` block, mapping every rule to utility classes on the corresponding HTML element, then deleting the `<style>` block.

### Translation conventions

| CSS pattern | Tailwind equivalent |
|---|---|
| `@media (max-width: 1023px)` | `max-lg:` variant |
| `@media (max-width: 639px)` | `max-sm:` variant |
| `@media (prefers-reduced-motion: reduce)` | `motion-reduce:` variant |
| `animation: heroFadeUp 0.55s ...` | `animate-hero-fade-up` |
| `animation-delay: 0.28s` | `[animation-delay:0.28s]` |
| `backdrop-filter: blur(4px)` | `backdrop-blur-sm` |
| `backdrop-filter: blur(10px) saturate(1.4)` | `backdrop-blur-md backdrop-saturate-[140%]` |
| `mix-blend-mode: screen` | `mix-blend-screen` |
| Custom `clamp()` / `calc()` | `[clamp(...)]` / `[calc(...)]` arbitrary values |
| Brand color `#5277c3` | `text-brand-blue` / `bg-brand-blue` / `border-brand-blue` |
| Surface bg `rgba(249,251,255,0.9)` | `bg-surface` |
| Border color `rgba(155,206,241,0.8)` | `border-border` |

### Dropped patterns

- All `:global()` selectors (including navbar entrance animation)
- The `--gloss-x` / `--gloss-y` CSS variables (JS-driven hover effect — keep the JS, keep the inline `style` attribute if present, but don't add a CSS variable declaration)
- `decoFadeIn` keyframe (was used only by removed `.deco-line` elements)

### `prefers-reduced-motion`

Every animated element gets `motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none` added alongside its `animate-*` class. This replaces the per-component `@media (prefers-reduced-motion)` blocks.

---

## Out of scope

- Content, copy, or i18n changes
- JS behavior changes
- Adding new visual features or layout changes
- Refactoring the i18n/translation system
- Changing the dev server or build config beyond what's already done

---

## Verification checklist (per file)

- [ ] No `<style>` block remains in the file
- [ ] No `:global()` selector remains
- [ ] All breakpoint overrides use `max-lg:` / `max-sm:` variants
- [ ] All animated elements have `motion-reduce:animate-none motion-reduce:opacity-100`
- [ ] Brand colors use theme token classes, not arbitrary hex
- [ ] Visual output matches pre-migration on desktop and mobile (dev server spot-check)
