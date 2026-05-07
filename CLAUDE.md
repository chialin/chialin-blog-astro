# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概觀

chialin 的個人部落格。Astro 6 + Tailwind 4 + MDX，fork 自 Bookworm Light Astro 主題。內容由 [Pages CMS](.pages.yml) 管理，部署目標為 Cloudflare Workers（`wrangler.jsonc`）；Netlify 設定保留為次要選項。

## 常用指令

```bash
yarn dev                  # 本機開發 (astro dev)
yarn build                # 產生靜態站
yarn preview              # 預覽 build 結果
yarn check                # astro check（型別 + content schema）
yarn format               # prettier -w .
yarn deploy:cf-workers    # build + wrangler deploy
```

## 內容架構

### 目錄

- `src/content/posts/` — 文章主集合
- `src/content/authors/`、`src/content/about/`、`src/content/pages/` — 其他集合
- `public/images/` — 所有圖片（封面、內文插圖）；CMS 路徑寫入為 `/images/...`
- Schema：[src/content.config.ts](src/content.config.ts)
- CMS 設定：[.pages.yml](.pages.yml)

### 文章檔名

`{year}-{month}-{day}-{slug}.md`，例：`2026-05-07-electric-piano-new-home.md`。
slug 規則 `^[a-z0-9-]+$`（小寫英文／數字／連字號）。

### 文章 frontmatter

```yaml
---
title: 中文標題
slug: english-slug
description: 摘要（選填）
date: 2026-05-07
image: /images/封面檔名.png
tags:
  - daily
categories:
  - life          # thoughts | life | learning | japan | climbing
draft: false
---
```

`categories` 可選值：`thoughts`（隨筆思考）、`life`（生活）、`learning`（學習筆記）、`japan`、`climbing`（攀岩）。預設 `[thoughts]`。

文章內嵌圖片用 `![](/images/檔名.ext)`。

## 封面圖規格

| 項目 | 規格 |
|---|---|
| 比例 | **16:9** |
| 推薦解析度 | **2400 × 1350**（設計／高品質）或 1600 × 900（輕量） |
| 預設 fallback 尺寸 | 1376 × 768（`public/images/defaults/cover-*.jpg`） |
| 格式 | 設計排版用 PNG；攝影為主用 JPEG |
| 存放位置 | `public/images/` |
| 命名 | 對應文章 slug，例：`electric-piano-cover.png` |
| frontmatter 欄位 | `image: /images/檔名.ext` |

## Gemini 封面圖 Prompt 模板

整體氣氛：**生活感、緩慢、溫暖、有呼吸感**。避免高飽和、戲劇打光、誇張視角這類 AI 痕跡明顯的風格。優先像「午後手沖咖啡」「散步路上隨手拍」「窗邊靜物」的氛圍。

### 共用前綴（每張都帶）

```
A 16:9 horizontal blog cover photograph. Soft natural daylight, gentle film
grain, muted warm palette (cream, soft beige, warm grey, dusty rose), shallow
depth of field, lived-in everyday atmosphere, slow-life aesthetic. Composition
with generous negative space. Editorial photography style — calm, quiet,
intimate. No text, no watermarks, no faces of people.
```

### 共用後綴（鎖定質感）

```
shot on 35mm film, Kodak Portra 400, slight light leak, organic imperfect
texture, magazine-cover quality, masterful composition. Aspect ratio 16:9.
```

### 分類範例 prompt

依文章 `categories` 套對應主體描述，前後夾上述前後綴。

**life · 生活**
```
A wooden dining table by a window in late afternoon light, a single ceramic
bowl with steam curling slowly, linen napkin loosely folded, soft long shadows
across the grain of the table.
```

**thoughts · 隨筆思考**
```
An open notebook on a worn writing desk, fountain pen resting on a half-written
page, a cup of tea cooling beside it, side light from a window, afternoon
stillness, dust motes drifting in the air.
```

**learning · 學習筆記**
```
A warmly lit study corner: stack of well-worn books, a glass of water, a small
plant in a clay pot, hand-drawn flashcards partially visible, sunlight
filtering through sheer curtains.
```

**japan**
```
A quiet Tokyo backstreet at dusk, narrow alley with hand-painted shop signs,
warm yellow lantern glow, faint reflection on wet pavement after light rain,
no people, contemplative mood.
```

**climbing · 攀岩**
```
A weathered chalk bag, well-used climbing shoes, and a coiled rope on a
sun-warmed granite slab, late golden hour, soft long shadows, rock texture,
no people, peaceful post-climb stillness.
```

**daily · 隨手記錄（晨間／日常）**
```
A simple morning scene: half-finished cup of pour-over coffee, scattered
breakfast crumbs on a wooden board, a worn paperback book, sunlight cutting
diagonally across the table.
```

### 寫 prompt 的原則

1. **主體單一**：一個小場景或一兩件物件，不要堆滿元素。
2. **永遠寫光線**：`soft natural light` / `late afternoon` / `golden hour` / `overcast diffused light`。
3. **質感詞重要**：`linen`、`ceramic`、`wood grain`、`paper`、`worn`、`hand-thrown` — 用來壓掉塑膠感。
4. **避免**：人臉、文字、商標、過度飽和、過度對稱、`fantasy/dramatic/cinematic` 這類大詞。
5. **負面提示**（Gemini 若支援，附上）：`no text, no faces, no logos, no plastic look, no over-saturation, no HDR`。
6. **想呼應文章氣氛**：在主體描述裡塞進 1–2 個和文章內容相關的物件當「線索」（如鋼琴文章可加 `a sheet of music quietly resting`），不要直白翻譯標題。

## 開發備註

- Markdown lint 已關掉 `MD013`（行長）與 `MD033`（inline HTML）。
- Pages CMS 上傳的 commit message 會帶 `(via Pages CMS)` 後綴；勿與本機 commit 混用同一封面檔名。
- 大寫副檔名（`.JPG`/`.JPEG`）與小寫共存時，frontmatter 的副檔名要與實際檔案完全一致。
