# Agenda Page — Design Spec

**Date:** 2026-06-08  
**Project:** nixcn-website  
**Status:** Approved, ready for implementation

---

## Overview

Add a standalone `/agenda` page to the NixCN Conference 2605 website. The page shows the full two-day conference program as a vertical timeline, grouped by day with tab navigation. It is added as a 5th item in the main navbar. No existing pages are modified.

---

## Architecture

Six touch points, all following existing codebase patterns:

| File                              | Change                                              |
| --------------------------------- | --------------------------------------------------- |
| `src/i18n/config.ts`              | Add `agenda: 'agenda'` to `PAGE_SLUGS`              |
| `src/i18n/translations.json`      | Add `agenda` key to both `zh-CN` and `en` locales   |
| `src/components/AgendaPage.astro` | New component — hero + day tabs + timeline          |
| `src/pages/en/agenda.astro`       | New route — renders `<AgendaPage locale='en' />`    |
| `src/pages/zh-CN/agenda.astro`    | New route — renders `<AgendaPage locale='zh-CN' />` |
| `src/components/Navbar.astro`     | Add 5th nav item to desktop nav and mobile nav      |

---

## Data Shape

Agenda content lives in `translations.json` under each locale's `agenda` key, consistent with how all other page content is stored (e.g. `cmsGuide.steps`).

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
        // *** PLACEHOLDER — insert agenda items here ***
        // Each item follows the talk or break shape below.
      ]
    },
    {
      "label": "Day 2 · 06/14 (Sun.)",
      "talks": [
        // *** PLACEHOLDER — insert agenda items here ***
      ]
    }
  ]
}
```

### Talk entry shape

```json
{
    "timeStart": "11:45",
    "timeEnd": "12:00",
    "title": "PGP签名派对",
    "speaker": "Cryolitia",
    "description": "一年一度的签名派对环节，来和大家交换PGP签名吧！介绍什么是OpenPGP，以及怎么和你身边的人互相签名。"
}
```

### Break entry shape

```json
{
    "type": "break",
    "timeStart": "12:00",
    "timeEnd": "14:00",
    "title": "🍜 午休 / Lunch Break"
}
```

Breaks use `"type": "break"` and omit `speaker` and `description`. Ordering is intrinsic — breaks sit in the `talks` array at the correct position; no separate merging needed at render time.

---

## Component Design — `AgendaPage.astro`

Props: `locale: Locale` (same interface as all other page components).

### Hero banner

Identical pattern to other pages:

- Full-width `<section>` with `hero-bg.png` background image
- `<h1>` with `tp.hero.title`, same clamp font size and animation classes
- `<p>` subtitle with `tp.hero.sub`

### Day tabs

- Two pill buttons rendered from `t.agenda.days[].label`
- Active tab: `bg-brand-blue text-white`
- Inactive tab: white background, bordered ghost style (`border-2 border-border text-[#a7b8d0]`)
- A small inline `<script>` in the component handles tab switching (show/hide the corresponding day list). No separate script file.

### Timeline list

Rendered per day as a `<ul>`, hidden/shown by the tab script. Each `<li>` contains:

- **Left column** (~52px fixed width): `timeStart` in `text-brand-blue font-bold`, `timeEnd` in muted text below
- **Thin vertical divider**: 2px wide, `bg-border`, full row height
- **Right column**:
    - `title` — bold, `text-brand-dark`
    - `speaker` — `text-brand-blue`, smaller
    - `description` — muted, `leading-[1.6]`

Break entries render as a muted full-width row: time columns + italic `title` label. No speaker or description columns.

### Page wrapper

`<main>` with `max-w-[1152px] mx-auto` and the same responsive padding scale used by other pages (`px-10 max-lg:px-7 max-sm:px-[18px]`).

---

## Navbar Changes

`PageSlug` in `config.ts` gains a 5th value: `'agenda'`.

In `Navbar.astro`, a new `<a>` is added to:

1. The desktop `<nav>` — after `eventGuide`, before `cmsGuide`
2. The mobile `<details>` nav — same relative position

Nav label keys to add to translations:

- `zh-CN`: `"agenda": "议程"`
- `en`: `"agenda": "Agenda"`

English `meta` and `hero` copy:

```json
"meta": {
  "htmlLang": "en",
  "title": "Agenda · NixCN Conference 2605",
  "description": "NixCN Conference 2605 Agenda — the full two-day program with talks, speakers, and times."
},
"hero": {
  "title": "Agenda",
  "sub": "Full program for NixCN Conference 2605."
}
```

---

## Content Placeholder

6月13日 10:00 – 11:45 Nix / NixOS 入门
Prince213
TBA

11:45 – 12:00 PGP签名派对
Cryolitia
一年一度的签名派对环节，来和大家交换PGP签名吧！介绍什么是OpenPGP，以及怎么和你身边的人互相签名。

14:00 – 14:40 Flakes 稳定化的漫漫长路
pluie
作为 Nix 生态当中最有名的「预览功能」（experimental feature），Flakes 已经被大量的 Nix 用户以及一些第三方软件（如 Determinate Nix 安装器）视为 Nix 使用体验中不可或缺的一环。那么，它究竟是为什么到现在仍然没有成为原版 Nix 开箱即用的部分呢？在轻松管理第三方库版本、组织系统配置和软件包定义等种种优势背后，都有哪些技术问题使其迟迟不能够摆脱「不稳定性」？

14:50 – 15:20 Why NixOS is the Best Distro to Grow a New OS Kernel
田洪亮
Linux has been the most successful open-source OS kernel for the last 30 years. So why build a brand-new, general-purpose OS kernel in 2020s — and why raise it on NixOS?
This talk tells the story of Asterinas, a Linux-compatible OS kernel written from scratch in Rust, and Asterinas NixOS, its first distribution. It answers two questions. First, why a new kernel at all? Everyone now agrees the kernel's future is Rust — the real question is how. Linux takes the incremental path (Rust for Linux); Asterinas takes the clean-slate path, using a novel framekernel architecture that confines unsafe Rust to a tiny, auditable core while keeping the rest of the kernel in safe Rust. The result is the speed of a monolithic kernel and the security of a microkernel. Second, why grow it on NixOS? Because nearly every hard problem a half-finished kernel creates has a one-paragraph answer in Nix: declarative overlays patch around an incomplete ABI without forking nixpkgs; a ~20-line Nix expression bakes our kernel into a stock NixOS installer; nixpkgs itself becomes the largest real-world conformance suite we could ask for.
You'll leave knowing what a framekernel is, how Asterinas differs from Linux, and why NixOS may be the best incubator for any new Linux-compatible kernel. No kernel background required.

15:30 – 16:00 Day 1 茶歇
Noa Virellia
吃吃喝喝

16:00 – 17:10 给 Nix 用户的 lambda 演算基础
Yinfeng
Nix 与 lambda 演算的关系
Lambda 演算是啥
Lambda 演算的语法
Lambda 演算的语义
语法糖（derived form）
柯里化
抽象，church encoding
扩展
Evaluation order
Call by value/name, normal form
Call by need, weak head normal form
不动点
let & rec & lib.fix
Overlay & NixOS modules
不动点组合子
实现方法

17:20 – 17:55 Nix 下搭建 Machine Learning 环境
MoeLeak
在 NixOS 上无法常规使用 miniconda 等管理器，只用 nix 管理的话很难复现旧论文中的 py 包，介绍一下我是如何在NixOS 或非 NixOS 系统上使用 Nix 搭建 ML 环境的。

6月14日 10:00 – 12:00 Flake展示 & NixOS设备展示交流
Noa Virellia
分享自己的Flake结构和设备配置

14:00 – 14:30 小内存机器的自动更新
Xinyang Li
system.autoUpgrade 需要在本机Eval和Build，在内存有限的机器上往往无法正常更新。colmena、deploy-rs等常用的deploy工具通常需要本地Eval后，把结果拷贝到远端机器上。这种Push模式很难与CI结合，大多数情况下需要人工参与，部署速度也受制于单台机器的网络质量。Comin可以看作autoUpgrade的升级版，它采用 GitOps 思路，让每台机器主动轮询配置仓库，按主机名匹配到对应的 NixOS 配置后自主完成部署。更关键的是，它可以把 Eval 和 Build 解耦，让机器复用 CI 的 Eval 和 Build 结果，仅拉取system closure即可完成更新。

14:40 – 15:20 RISC-V+NixOS=电子胸牌？
Cryolitia
从Milk-V Duo Module 01开始做一个电子胸牌？我们Nix的会议一定要有自己做的powered by NixOS的谷子！

15:30 – 16:00 Day 2 茶歇
Noa Virellia
喝喝吃吃

16:00 – 16:40 使用NixOS的路由器、NAS与Kubernetes集群
ChaosAttractor
使用NixOS配置路由器、NAS与Kubernetes集群的优势，能力与问题以及如何在大批量部署中利用Nix的优势

16:50 – 17:30 土制 Nix S3 Binary Cache
Yinfeng
分享一下之前我的一篇博客的内容：https://blog.linyinfeng.com/posts/homemade-nix-s3-cache/

---

## What Is Not in Scope

- No changes to `EventGuidePage.astro` or any other existing page
- No expand/collapse interaction on individual talks
- No filtering by speaker or topic
- No print stylesheet
