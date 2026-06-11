# Agenda Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a standalone `/agenda` page showing the two-day NixCN Conference 2605 program as a vertical timeline with day tabs, registered as a 5th navbar item.

**Architecture:** Content lives in `translations.json` under an `agenda` key (same pattern as `cmsGuide.steps`). A new `AgendaPage.astro` component renders hero + day tabs + timeline list. Two route files (`en/agenda.astro`, `zh-CN/agenda.astro`) and a navbar update complete the wiring.

**Tech Stack:** Astro 5, Tailwind CSS v4, TypeScript — no new dependencies.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/i18n/config.ts` | Modify | Register `agenda` page slug |
| `src/i18n/translations.json` | Modify | Add full agenda content for both locales |
| `src/components/AgendaPage.astro` | Create | Hero + day tabs + timeline rendering |
| `src/pages/en/agenda.astro` | Create | Route for English locale |
| `src/pages/zh-CN/agenda.astro` | Create | Route for Chinese locale |
| `src/components/Navbar.astro` | Modify | Add 5th nav item (desktop + mobile) |
| `.gitignore` | Modify | Ignore `.superpowers/` brainstorm artefacts |

---

## Task 1: Register the agenda page slug

**Files:**
- Modify: `src/i18n/config.ts`

- [ ] **Step 1.1: Add `agenda` to PAGE_SLUGS**

  Open `src/i18n/config.ts`. The current `PAGE_SLUGS` object ends with `souvenir`. Add the agenda entry:

  ```ts
  export const PAGE_SLUGS = {
      home: '',
      eventGuide: 'event-guide',
      cmsGuide: 'cms-guide',
      souvenir: 'souvenir',
      agenda: 'agenda',
  } as const;
  ```

  `PageSlug` (derived as `keyof typeof PAGE_SLUGS`) automatically gains `'agenda'` — no other change needed.

- [ ] **Step 1.2: Verify type-check passes**

  ```bash
  pnpm check
  ```

  Expected: no errors. (The Navbar still references only the old slugs, so no breakage yet.)

- [ ] **Step 1.3: Commit**

  ```bash
  git add src/i18n/config.ts
  git commit -m "feat: register agenda page slug"
  ```

---

## Task 2: Add agenda translations to both locales

**Files:**
- Modify: `src/i18n/translations.json`

The agenda entry follows the exact same JSON structure for both locales. The talk content is in Chinese regardless of locale; only `meta` and `hero` differ.

Break entries use `"type": "break"` and have no `speaker` or `description`. Lunch breaks are included even though they were not in the raw spec — add them at 12:00–14:00 for both days. Multi-line descriptions (Yinfeng's lambda talk) use `<br>` tags since descriptions are rendered via `Fragment set:html`.

- [ ] **Step 2.1: Add zh-CN agenda entry**

  In `translations.json`, inside the `"zh-CN"` object, add after the `"souvenir"` key:

  ```json
  "agenda": {
    "meta": {
      "htmlLang": "zh-CN",
      "title": "议程 · NixCN Conference 2605",
      "description": "NixCN Conference 2605 议程 — 完整的两日会议日程，包含分享议题、演讲者与时间安排。"
    },
    "hero": {
      "title": "议程",
      "sub": "NixCN Conference 2605 完整日程。"
    },
    "days": [
      {
        "label": "Day 1 · 06/13 (Sat.)",
        "talks": [
          {
            "timeStart": "10:00",
            "timeEnd": "11:45",
            "title": "Nix / NixOS 入门",
            "speaker": "Prince213",
            "description": "TBA"
          },
          {
            "timeStart": "11:45",
            "timeEnd": "12:00",
            "title": "PGP签名派对",
            "speaker": "Cryolitia",
            "description": "一年一度的签名派对环节，来和大家交换PGP签名吧！介绍什么是OpenPGP，以及怎么和你身边的人互相签名。"
          },
          {
            "type": "break",
            "timeStart": "12:00",
            "timeEnd": "14:00",
            "title": "🍜 午休"
          },
          {
            "timeStart": "14:00",
            "timeEnd": "14:40",
            "title": "Flakes 稳定化的漫漫长路",
            "speaker": "pluie",
            "description": "作为 Nix 生态当中最有名的「预览功能」（experimental feature），Flakes 已经被大量的 Nix 用户以及一些第三方软件（如 Determinate Nix 安装器）视为 Nix 使用体验中不可或缺的一环。那么，它究竟是为什么到现在仍然没有成为原版 Nix 开箱即用的部分呢？在轻松管理第三方库版本、组织系统配置和软件包定义等种种优势背后，都有哪些技术问题使其迟迟不能够摆脱「不稳定性」？"
          },
          {
            "timeStart": "14:50",
            "timeEnd": "15:20",
            "title": "Why NixOS is the Best Distro to Grow a New OS Kernel",
            "speaker": "姜剑峰",
            "description": "Linux has been the most successful open-source OS kernel for the last 30 years. So why build a brand-new, general-purpose OS kernel in 2020s — and why raise it on NixOS?<br>This talk tells the story of Asterinas, a Linux-compatible OS kernel written from scratch in Rust, and Asterinas NixOS, its first distribution. It answers two questions. First, why a new kernel at all? Everyone now agrees the kernel's future is Rust — the real question is how. Linux takes the incremental path (Rust for Linux); Asterinas takes the clean-slate path, using a novel framekernel architecture that confines unsafe Rust to a tiny, auditable core while keeping the rest of the kernel in safe Rust. The result is the speed of a monolithic kernel and the security of a microkernel. Second, why grow it on NixOS? Because nearly every hard problem a half-finished kernel creates has a one-paragraph answer in Nix: declarative overlays patch around an incomplete ABI without forking nixpkgs; a ~20-line Nix expression bakes our kernel into a stock NixOS installer; nixpkgs itself becomes the largest real-world conformance suite we could ask for.<br>You'll leave knowing what a framekernel is, how Asterinas differs from Linux, and why NixOS may be the best incubator for any new Linux-compatible kernel. No kernel background required."
          },
          {
            "type": "break",
            "timeStart": "15:30",
            "timeEnd": "16:00",
            "title": "☕ 茶歇"
          },
          {
            "timeStart": "16:00",
            "timeEnd": "17:10",
            "title": "给 Nix 用户的 lambda 演算基础",
            "speaker": "Yinfeng",
            "description": "Nix 与 lambda 演算的关系<br>Lambda 演算是啥<br>Lambda 演算的语法<br>Lambda 演算的语义<br>语法糖（derived form）<br>柯里化<br>抽象，church encoding<br>扩展<br>Evaluation order<br>Call by value/name, normal form<br>Call by need, weak head normal form<br>不动点<br>let &amp; rec &amp; lib.fix<br>Overlay &amp; NixOS modules<br>不动点组合子<br>实现方法"
          },
          {
            "timeStart": "17:20",
            "timeEnd": "17:55",
            "title": "Nix 下搭建 Machine Learning 环境",
            "speaker": "MoeLeak",
            "description": "在 NixOS 上无法常规使用 miniconda 等管理器，只用 nix 管理的话很难复现旧论文中的 py 包，介绍一下我是如何在NixOS 或非 NixOS 系统上使用 Nix 搭建 ML 环境的。"
          }
        ]
      },
      {
        "label": "Day 2 · 06/14 (Sun.)",
        "talks": [
          {
            "timeStart": "10:00",
            "timeEnd": "12:00",
            "title": "Flake展示 & NixOS设备展示交流",
            "speaker": "Noa Virellia",
            "description": "分享自己的Flake结构和设备配置"
          },
          {
            "type": "break",
            "timeStart": "12:00",
            "timeEnd": "14:00",
            "title": "🍜 午休"
          },
          {
            "timeStart": "14:00",
            "timeEnd": "14:30",
            "title": "小内存机器的自动更新",
            "speaker": "Xinyang Li",
            "description": "system.autoUpgrade 需要在本机Eval和Build，在内存有限的机器上往往无法正常更新。colmena、deploy-rs等常用的deploy工具通常需要本地Eval后，把结果拷贝到远端机器上。这种Push模式很难与CI结合，大多数情况下需要人工参与，部署速度也受制于单台机器的网络质量。Comin可以看作autoUpgrade的升级版，它采用 GitOps 思路，让每台机器主动轮询配置仓库，按主机名匹配到对应的 NixOS 配置后自主完成部署。更关键的是，它可以把 Eval 和 Build 解耦，让机器复用 CI 的 Eval 和 Build 结果，仅拉取system closure即可完成更新。"
          },
          {
            "timeStart": "14:40",
            "timeEnd": "15:20",
            "title": "RISC-V+NixOS=电子胸牌？",
            "speaker": "Cryolitia",
            "description": "从Milk-V Duo Module 01开始做一个电子胸牌？我们Nix的会议一定要有自己做的powered by NixOS的谷子！"
          },
          {
            "type": "break",
            "timeStart": "15:30",
            "timeEnd": "16:00",
            "title": "☕ 茶歇"
          },
          {
            "timeStart": "16:00",
            "timeEnd": "16:40",
            "title": "使用NixOS的路由器、NAS与Kubernetes集群",
            "speaker": "ChaosAttractor",
            "description": "使用NixOS配置路由器、NAS与Kubernetes集群的优势，能力与问题以及如何在大批量部署中利用Nix的优势"
          },
          {
            "timeStart": "16:50",
            "timeEnd": "17:30",
            "title": "土制 Nix S3 Binary Cache",
            "speaker": "Yinfeng",
            "description": "分享一下之前我的一篇博客的内容：https://blog.linyinfeng.com/posts/homemade-nix-s3-cache/"
          }
        ]
      }
    ]
  }
  ```

- [ ] **Step 2.2: Add en agenda entry**

  In `translations.json`, inside the `"en"` object, add after the `"souvenir"` key. The `days` array is identical to zh-CN (talks are in Chinese). Only `meta` and `hero` differ:

  ```json
  "agenda": {
    "meta": {
      "htmlLang": "en",
      "title": "Agenda · NixCN Conference 2605",
      "description": "NixCN Conference 2605 Agenda — the full two-day program with talks, speakers, and times."
    },
    "hero": {
      "title": "Agenda",
      "sub": "Full program for NixCN Conference 2605."
    },
    "days": [
      {
        "label": "Day 1 · 06/13 (Sat.)",
        "talks": [
          {
            "timeStart": "10:00",
            "timeEnd": "11:45",
            "title": "Nix / NixOS 入门",
            "speaker": "Prince213",
            "description": "TBA"
          },
          {
            "timeStart": "11:45",
            "timeEnd": "12:00",
            "title": "PGP签名派对",
            "speaker": "Cryolitia",
            "description": "一年一度的签名派对环节，来和大家交换PGP签名吧！介绍什么是OpenPGP，以及怎么和你身边的人互相签名。"
          },
          {
            "type": "break",
            "timeStart": "12:00",
            "timeEnd": "14:00",
            "title": "🍜 Lunch Break"
          },
          {
            "timeStart": "14:00",
            "timeEnd": "14:40",
            "title": "Flakes 稳定化的漫漫长路",
            "speaker": "pluie",
            "description": "作为 Nix 生态当中最有名的「预览功能」（experimental feature），Flakes 已经被大量的 Nix 用户以及一些第三方软件（如 Determinate Nix 安装器）视为 Nix 使用体验中不可或缺的一环。那么，它究竟是为什么到现在仍然没有成为原版 Nix 开箱即用的部分呢？在轻松管理第三方库版本、组织系统配置和软件包定义等种种优势背后，都有哪些技术问题使其迟迟不能够摆脱「不稳定性」？"
          },
          {
            "timeStart": "14:50",
            "timeEnd": "15:20",
            "title": "Why NixOS is the Best Distro to Grow a New OS Kernel",
            "speaker": "姜剑峰",
            "description": "Linux has been the most successful open-source OS kernel for the last 30 years. So why build a brand-new, general-purpose OS kernel in 2020s — and why raise it on NixOS?<br>This talk tells the story of Asterinas, a Linux-compatible OS kernel written from scratch in Rust, and Asterinas NixOS, its first distribution. It answers two questions. First, why a new kernel at all? Everyone now agrees the kernel's future is Rust — the real question is how. Linux takes the incremental path (Rust for Linux); Asterinas takes the clean-slate path, using a novel framekernel architecture that confines unsafe Rust to a tiny, auditable core while keeping the rest of the kernel in safe Rust. The result is the speed of a monolithic kernel and the security of a microkernel. Second, why grow it on NixOS? Because nearly every hard problem a half-finished kernel creates has a one-paragraph answer in Nix: declarative overlays patch around an incomplete ABI without forking nixpkgs; a ~20-line Nix expression bakes our kernel into a stock NixOS installer; nixpkgs itself becomes the largest real-world conformance suite we could ask for.<br>You'll leave knowing what a framekernel is, how Asterinas differs from Linux, and why NixOS may be the best incubator for any new Linux-compatible kernel. No kernel background required."
          },
          {
            "type": "break",
            "timeStart": "15:30",
            "timeEnd": "16:00",
            "title": "☕ Tea Break"
          },
          {
            "timeStart": "16:00",
            "timeEnd": "17:10",
            "title": "给 Nix 用户的 lambda 演算基础",
            "speaker": "Yinfeng",
            "description": "Nix 与 lambda 演算的关系<br>Lambda 演算是啥<br>Lambda 演算的语法<br>Lambda 演算的语义<br>语法糖（derived form）<br>柯里化<br>抽象，church encoding<br>扩展<br>Evaluation order<br>Call by value/name, normal form<br>Call by need, weak head normal form<br>不动点<br>let &amp; rec &amp; lib.fix<br>Overlay &amp; NixOS modules<br>不动点组合子<br>实现方法"
          },
          {
            "timeStart": "17:20",
            "timeEnd": "17:55",
            "title": "Nix 下搭建 Machine Learning 环境",
            "speaker": "MoeLeak",
            "description": "在 NixOS 上无法常规使用 miniconda 等管理器，只用 nix 管理的话很难复现旧论文中的 py 包，介绍一下我是如何在NixOS 或非 NixOS 系统上使用 Nix 搭建 ML 环境的。"
          }
        ]
      },
      {
        "label": "Day 2 · 06/14 (Sun.)",
        "talks": [
          {
            "timeStart": "10:00",
            "timeEnd": "12:00",
            "title": "Flake展示 & NixOS设备展示交流",
            "speaker": "Noa Virellia",
            "description": "分享自己的Flake结构和设备配置"
          },
          {
            "type": "break",
            "timeStart": "12:00",
            "timeEnd": "14:00",
            "title": "🍜 Lunch Break"
          },
          {
            "timeStart": "14:00",
            "timeEnd": "14:30",
            "title": "小内存机器的自动更新",
            "speaker": "Xinyang Li",
            "description": "system.autoUpgrade 需要在本机Eval和Build，在内存有限的机器上往往无法正常更新。colmena、deploy-rs等常用的deploy工具通常需要本地Eval后，把结果拷贝到远端机器上。这种Push模式很难与CI结合，大多数情况下需要人工参与，部署速度也受制于单台机器的网络质量。Comin可以看作autoUpgrade的升级版，它采用 GitOps 思路，让每台机器主动轮询配置仓库，按主机名匹配到对应的 NixOS 配置后自主完成部署。更关键的是，它可以把 Eval 和 Build 解耦，让机器复用 CI 的 Eval 和 Build 结果，仅拉取system closure即可完成更新。"
          },
          {
            "timeStart": "14:40",
            "timeEnd": "15:20",
            "title": "RISC-V+NixOS=电子胸牌？",
            "speaker": "Cryolitia",
            "description": "从Milk-V Duo Module 01开始做一个电子胸牌？我们Nix的会议一定要有自己做的powered by NixOS的谷子！"
          },
          {
            "type": "break",
            "timeStart": "15:30",
            "timeEnd": "16:00",
            "title": "☕ Tea Break"
          },
          {
            "timeStart": "16:00",
            "timeEnd": "16:40",
            "title": "使用NixOS的路由器、NAS与Kubernetes集群",
            "speaker": "ChaosAttractor",
            "description": "使用NixOS配置路由器、NAS与Kubernetes集群的优势，能力与问题以及如何在大批量部署中利用Nix的优势"
          },
          {
            "timeStart": "16:50",
            "timeEnd": "17:30",
            "title": "土制 Nix S3 Binary Cache",
            "speaker": "Yinfeng",
            "description": "分享一下之前我的一篇博客的内容：https://blog.linyinfeng.com/posts/homemade-nix-s3-cache/"
          }
        ]
      }
    ]
  }
  ```

- [ ] **Step 2.3: Verify JSON is valid and types pass**

  ```bash
  pnpm check
  ```

  Expected: no errors. If the JSON is malformed you'll get a parse error — check for missing commas or brackets.

- [ ] **Step 2.4: Commit**

  ```bash
  git add src/i18n/translations.json
  git commit -m "feat: add agenda translations with full conference program"
  ```

---

## Task 3: Create the AgendaPage component

**Files:**
- Create: `src/components/AgendaPage.astro`

The component mirrors the structure of `SouvenirPage.astro` (hero banner pattern) and `EventGuidePage.astro` (bento tile aesthetic). Tab switching uses a small inline `<script>` — the active/inactive Tailwind classes are all present in the static template so Tailwind's JIT includes them.

- [ ] **Step 3.1: Create `src/components/AgendaPage.astro`**

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
  const tp = t.agenda;
  ---

  <BaseLayout title={tp.meta.title} description={tp.meta.description} lang={tp.meta.htmlLang}>
      <Navbar locale={locale} activePage='agenda' />

      <!-- ======= Hero Banner ======= -->
      <section
          class='relative pt-[38px] pb-12 px-6 text-center isolate overflow-hidden min-h-[215px] max-lg:pt-8 max-lg:pb-10 max-lg:px-5 max-sm:pt-6 max-sm:pb-8 max-sm:px-4'
          aria-labelledby='agenda-title'
      >
          <div class='absolute inset-0 z-0 pointer-events-none overflow-hidden' aria-hidden='true'>
              <img
                  class='absolute inset-0 w-full h-full object-cover object-top block animate-hero-fade-in motion-reduce:animate-none motion-reduce:opacity-100'
                  src='/images/shared/hero-bg.png'
                  alt=''
              />
          </div>
          <div class='relative z-[1] max-w-[720px] mx-auto'>
              <h1
                  id='agenda-title'
                  class='text-[clamp(2.5rem,5.5vw,4.5rem)] font-semibold text-brand-dark m-0 mb-4 tracking-[-0.05em] leading-[1.1] [text-shadow:0_4px_14px_rgba(3,15,32,0.08)] animate-hero-fade-up [animation-delay:0.1s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none max-sm:mb-3'
              >
                  {tp.hero.title}
              </h1>
              <p
                  class='text-[clamp(0.875rem,1vw,1rem)] text-[#1a2332] m-0 leading-[1.7] tracking-[-0.02em] max-w-[640px] mx-auto animate-hero-fade-up [animation-delay:0.18s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none max-sm:text-[13px] max-sm:leading-[1.65]'
              >
                  {tp.hero.sub}
              </p>
          </div>
      </section>

      <!-- ======= Agenda Content ======= -->
      <main
          class='relative z-[2] w-full max-w-[1152px] mx-auto px-10 pt-4 pb-[120px] max-lg:px-7 max-lg:pt-3 max-lg:pb-[100px] max-sm:px-[18px] max-sm:pt-2 max-sm:pb-20'
      >
          <!-- Day Tabs -->
          <div
              class='flex gap-2 mb-5 animate-hero-fade-up [animation-delay:0.22s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none'
              role='tablist'
          >
              {
                  tp.days.map((day, i) => (
                      <button
                          type='button'
                          role='tab'
                          aria-selected={i === 0 ? 'true' : 'false'}
                          aria-controls={`day-panel-${i}`}
                          id={`day-tab-${i}`}
                          class:list={[
                              'day-tab px-5 py-2 rounded-[20px] text-sm font-semibold tracking-[-0.03em] border-2 cursor-pointer font-[inherit] transition-colors duration-200 whitespace-nowrap',
                              i === 0
                                  ? 'bg-brand-blue text-white border-brand-blue'
                                  : 'bg-white text-[#a7b8d0] border-border hover:border-brand-light hover:text-brand-blue',
                          ]}
                      >
                          {day.label}
                      </button>
                  ))
              }
          </div>

          <!-- Day Panels -->
          {
              tp.days.map((day, dayIndex) => (
                  <div
                      id={`day-panel-${dayIndex}`}
                      role='tabpanel'
                      aria-labelledby={`day-tab-${dayIndex}`}
                      class:list={[
                          'day-panel rounded-3xl border-2 border-border overflow-hidden bg-surface backdrop-blur-sm [-webkit-backdrop-filter:blur(4px)] shadow-[0_4px_16px_rgba(82,119,195,0.06)] animate-hero-fade-up [animation-delay:0.28s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none',
                          dayIndex !== 0 && 'hidden',
                      ]}
                  >
                      <ul class='list-none m-0 p-0 divide-y divide-[rgba(155,206,241,0.3)]'>
                          {day.talks.map((talk) =>
                              'type' in talk && talk.type === 'break' ? (
                                  <li class='flex gap-4 px-6 py-3 bg-[rgba(82,119,195,0.04)] max-sm:px-4 max-sm:py-2.5'>
                                      <div class='w-[52px] flex-shrink-0 text-right'>
                                          <div class='text-xs font-medium text-[#a7b8d0] leading-snug'>
                                              {talk.timeStart}
                                          </div>
                                          <div class='text-xs text-[#a7b8d0] leading-snug'>–{talk.timeEnd}</div>
                                      </div>
                                      <div
                                          class='w-px flex-shrink-0 self-stretch bg-[rgba(155,206,241,0.4)]'
                                          aria-hidden='true'
                                      />
                                      <div class='text-sm italic text-[#a7b8d0] self-center'>{talk.title}</div>
                                  </li>
                              ) : (
                                  <li class='flex gap-4 px-6 py-5 max-sm:px-4 max-sm:py-4'>
                                      <div class='w-[52px] flex-shrink-0 text-right pt-px'>
                                          <div class='text-sm font-bold text-brand-blue leading-snug'>
                                              {talk.timeStart}
                                          </div>
                                          <div class='text-xs text-[#a7b8d0] leading-snug mt-0.5'>–{talk.timeEnd}</div>
                                      </div>
                                      <div
                                          class='w-px flex-shrink-0 self-stretch bg-[rgba(155,206,241,0.5)]'
                                          aria-hidden='true'
                                      />
                                      <div class='flex-1 min-w-0'>
                                          <div class='font-semibold text-brand-dark leading-snug tracking-[-0.03em]'>
                                              {talk.title}
                                          </div>
                                          <div class='text-sm text-brand-blue mt-1 tracking-[-0.02em]'>
                                              {talk.speaker}
                                          </div>
                                          <div class='text-sm text-[#4a5a75] mt-2 leading-[1.65] tracking-[-0.01em]'>
                                              <Fragment set:html={talk.description} />
                                          </div>
                                      </div>
                                  </li>
                              )
                          )}
                      </ul>
                  </div>
              ))
          }
      </main>

      <script>
          const tabs = document.querySelectorAll<HTMLButtonElement>('.day-tab');
          const panels = document.querySelectorAll<HTMLElement>('.day-panel');

          tabs.forEach((tab, i) => {
              tab.addEventListener('click', () => {
                  tabs.forEach((t) => {
                      t.classList.remove('bg-brand-blue', 'text-white', 'border-brand-blue');
                      t.classList.add('bg-white', 'text-[#a7b8d0]', 'border-border');
                      t.setAttribute('aria-selected', 'false');
                  });
                  tab.classList.remove('bg-white', 'text-[#a7b8d0]', 'border-border');
                  tab.classList.add('bg-brand-blue', 'text-white', 'border-brand-blue');
                  tab.setAttribute('aria-selected', 'true');
                  panels.forEach((p, j) => {
                      p.classList.toggle('hidden', j !== i);
                  });
              });
          });
      </script>
  </BaseLayout>
  ```

  > **TypeScript note:** `'type' in talk && talk.type === 'break'` discriminates between break and talk entries. In the `else` branch, `talk.speaker` and `talk.description` are safe to access. If `pnpm check` reports a type error here, add `as any` casts on `talk.speaker` and `talk.description` — TypeScript's inference from large JSON files can sometimes fail to narrow cleanly.

- [ ] **Step 3.2: Type-check**

  ```bash
  pnpm check
  ```

  Expected: no errors.

- [ ] **Step 3.3: Commit**

  ```bash
  git add src/components/AgendaPage.astro
  git commit -m "feat: add AgendaPage component with timeline and day tabs"
  ```

---

## Task 4: Create page routes

**Files:**
- Create: `src/pages/en/agenda.astro`
- Create: `src/pages/zh-CN/agenda.astro`

These are minimal — identical to how every other page route is structured.

- [ ] **Step 4.1: Create `src/pages/en/agenda.astro`**

  ```astro
  ---
  import AgendaPage from '../../components/AgendaPage.astro';
  ---

  <AgendaPage locale='en' />
  ```

- [ ] **Step 4.2: Create `src/pages/zh-CN/agenda.astro`**

  ```astro
  ---
  import AgendaPage from '../../components/AgendaPage.astro';
  ---

  <AgendaPage locale='zh-CN' />
  ```

- [ ] **Step 4.3: Verify routes render**

  Start the dev server:

  ```bash
  pnpm dev
  ```

  Open both:
  - `http://localhost:4321/zh-CN/agenda` — should show "议程" hero, Day 1 tab active, full timeline
  - `http://localhost:4321/en/agenda` — should show "Agenda" hero, same timeline

  Click the Day 2 tab — should switch panels. Stop the dev server when done (`Ctrl+C`).

- [ ] **Step 4.4: Commit**

  ```bash
  git add src/pages/en/agenda.astro src/pages/zh-CN/agenda.astro
  git commit -m "feat: add agenda page routes for en and zh-CN"
  ```

---

## Task 5: Update Navbar

**Files:**
- Modify: `src/components/Navbar.astro`
- Modify: `src/i18n/translations.json`

Add the agenda nav label to translations, then add the `<a>` to the desktop nav and the mobile nav. Position: after `eventGuide`, before `cmsGuide`.

- [ ] **Step 5.1: Add nav label to translations**

  In `translations.json`, inside `"zh-CN".nav`, add after `"eventGuide"`:

  ```json
  "agenda": "议程",
  ```

  Inside `"en".nav`, add after `"eventGuide"`:

  ```json
  "agenda": "Agenda",
  ```

- [ ] **Step 5.2: Add desktop nav link**

  In `src/components/Navbar.astro`, the desktop `<nav>` currently has four `<a>` elements: `home`, `eventGuide`, `cmsGuide`, `souvenir`. Insert a new `<a>` between the `eventGuide` block and the `cmsGuide` block:

  ```astro
  <a
      href={url(locale, 'agenda')}
      class:list={[
          'nav-link text-sm font-medium text-[#a7b8d0] no-underline tracking-[-0.05em] whitespace-nowrap transition-colors duration-200 relative pb-0.5 hover:text-brand-blue',
          activePage === 'agenda' && 'active text-brand-blue',
      ]}
      aria-current={activePage === 'agenda' ? 'page' : undefined}
  >
      {t.nav.agenda}
  </a>
  ```

- [ ] **Step 5.3: Add mobile nav link**

  In the same file, the mobile `<details>` nav has four `<a>` elements in the same order. Insert between the `eventGuide` and `cmsGuide` mobile links:

  ```astro
  <a
      href={url(locale, 'agenda')}
      aria-current={activePage === 'agenda' ? 'page' : undefined}
      class='text-[15px] font-medium text-brand-blue no-underline py-2.5 border-b border-[rgba(155,206,241,0.3)] transition-opacity duration-150 hover:opacity-70 last:border-b-0'
  >
      {t.nav.agenda}
  </a>
  ```

- [ ] **Step 5.4: Verify navbar on all pages**

  ```bash
  pnpm dev
  ```

  Check these five pages — navbar should show 5 items, with the correct one active:
  - `http://localhost:4321/zh-CN/` — Home active
  - `http://localhost:4321/zh-CN/event-guide` — 活动指南 active
  - `http://localhost:4321/zh-CN/agenda` — 议程 active
  - `http://localhost:4321/zh-CN/cms-guide` — CMS 系统指引 active
  - `http://localhost:4321/zh-CN/souvenir` — 纪念品信息 active

  Also verify the lang-switch link on the agenda page takes you to `/en/agenda` (not 404).

  Stop dev server.

- [ ] **Step 5.5: Commit**

  ```bash
  git add src/components/Navbar.astro src/i18n/translations.json
  git commit -m "feat: add agenda nav item to desktop and mobile navbar"
  ```

---

## Task 6: Gitignore and final build verification

**Files:**
- Modify: `.gitignore`

- [ ] **Step 6.1: Add `.superpowers/` to `.gitignore`**

  Check if a `.gitignore` exists:

  ```bash
  cat .gitignore
  ```

  If the file exists, add `.superpowers/` as a new line. If it doesn't exist, create it with that single line.

- [ ] **Step 6.2: Production build**

  ```bash
  pnpm build
  ```

  Expected: build completes with no errors. You should see `dist/zh-CN/agenda/index.html` and `dist/en/agenda/index.html` in the output.

- [ ] **Step 6.3: Commit**

  ```bash
  git add .gitignore
  git commit -m "chore: ignore .superpowers brainstorm artefacts"
  ```
