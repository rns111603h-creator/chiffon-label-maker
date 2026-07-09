# Product Label PDF Printing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a GitHub Pages-friendly mode that previews and prints prebuilt A4 portrait product-label PDFs bundled with the app.

**Architecture:** Keep the existing expiry-label PDF generator intact and add a second app mode for product-label PDF printing. Product-label PDFs live under `public/product-labels/`, while `src/productLabelPdfs.ts` maps product IDs to bundled PDF URLs using Vite's `BASE_URL` so the app works both locally and at `https://rns111603h.github.io/chiffon-label-maker/`.

**Tech Stack:** Vite, TypeScript, browser iframe PDF preview/print, Vitest, GitHub Pages via GitHub Actions.

---

## File Structure

- Create `src/assetPath.ts`
  - One helper for public asset URLs that respects Vite `import.meta.env.BASE_URL`.
- Create `src/productLabelPdfs.ts`
  - Product ID to bundled PDF registry and lookup helpers.
- Create `tests/assetPath.test.ts`
  - Verifies public asset path normalization.
- Create `tests/productLabelPdfs.test.ts`
  - Verifies registered and unregistered product-label PDF lookup behavior.
- Modify `src/statusPopup.ts`
  - Replace hard-coded `/chiffon.png` with `publicAssetPath('chiffon.png')`.
- Modify `src/main.ts`
  - Add mode state and render either the existing expiry-label workflow or the new product-label workflow.
- Modify `src/styles.css`
  - Add segmented mode tabs and product-label PDF preview styles.
- Create `public/product-labels/.gitkeep`
  - Keeps the product-label PDF directory in Git before real PDFs are added.
- Modify `vite.config.ts`
  - Set GitHub Pages base path from repository name in GitHub Actions.
- Create `.github/workflows/deploy-pages.yml`
  - Build and deploy the Vite app to GitHub Pages.
- Modify `README.md`
  - Add GitHub Pages trial operation and PDF registration instructions.

## Publishing Boundary

The local Git repository root is `/Users/kouyayonaha/Apps_Service develop`, but the app should be published as its own GitHub repository. Use `git subtree split --prefix Projects/expiry-label-maker` when pushing to `rns111603h/chiffon-label-maker`; do not push the whole workspace repository.

---

### Task 1: Public Asset Path Helper

**Files:**
- Create: `Projects/expiry-label-maker/src/assetPath.ts`
- Create: `Projects/expiry-label-maker/tests/assetPath.test.ts`
- Modify: `Projects/expiry-label-maker/src/statusPopup.ts`

- [ ] **Step 1: Write the failing asset path test**

Create `tests/assetPath.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { publicAssetPath } from '../src/assetPath';

describe('publicAssetPath', () => {
  it('joins Vite base URL and public asset path', () => {
    expect(publicAssetPath('chiffon.png')).toBe('/chiffon.png');
    expect(publicAssetPath('/chiffon.png')).toBe('/chiffon.png');
    expect(publicAssetPath('product-labels/plain.pdf')).toBe('/product-labels/plain.pdf');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd "/Users/kouyayonaha/Apps_Service develop/Projects/expiry-label-maker"
npm test -- tests/assetPath.test.ts
```

Expected: FAIL because `../src/assetPath` does not exist.

- [ ] **Step 3: Add the asset helper**

Create `src/assetPath.ts`:

```ts
export function publicAssetPath(path: string): string {
  const normalizedPath = path.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
}
```

- [ ] **Step 4: Update status popup icon path**

Modify `src/statusPopup.ts`:

```ts
import { publicAssetPath } from './assetPath';

const STATUS_ICON_SRC = publicAssetPath('chiffon.png');
```

Leave the rest of `createStatusPopupHtml` unchanged.

- [ ] **Step 5: Run test to verify it passes**

Run:

```bash
npm test -- tests/assetPath.test.ts tests/statusPopup.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add Projects/expiry-label-maker/src/assetPath.ts Projects/expiry-label-maker/src/statusPopup.ts Projects/expiry-label-maker/tests/assetPath.test.ts
git commit -m "feat: resolve public asset paths for pages"
```

---

### Task 2: Product Label PDF Registry

**Files:**
- Create: `Projects/expiry-label-maker/src/productLabelPdfs.ts`
- Create: `Projects/expiry-label-maker/tests/productLabelPdfs.test.ts`
- Create: `Projects/expiry-label-maker/public/product-labels/.gitkeep`

- [ ] **Step 1: Write failing registry tests**

Create `tests/productLabelPdfs.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { productLabelPdfUrl } from '../src/productLabelPdfs';

describe('productLabelPdfUrl', () => {
  it('returns a public PDF URL for registered products', () => {
    expect(productLabelPdfUrl('plain', { plain: 'product-labels/plain.pdf' })).toBe(
      '/product-labels/plain.pdf',
    );
  });

  it('returns null for products without bundled label PDFs', () => {
    expect(productLabelPdfUrl('sweet-potato', { plain: 'product-labels/plain.pdf' })).toBeNull();
  });

  it('normalizes leading slashes in configured PDF paths', () => {
    expect(productLabelPdfUrl('plain', { plain: '/product-labels/plain.pdf' })).toBe(
      '/product-labels/plain.pdf',
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/productLabelPdfs.test.ts
```

Expected: FAIL because `../src/productLabelPdfs` does not exist.

- [ ] **Step 3: Add the registry module**

Create `src/productLabelPdfs.ts`:

```ts
import { publicAssetPath } from './assetPath';

export type ProductLabelPdfRegistry = Readonly<Record<string, string>>;

export const PRODUCT_LABEL_PDFS: ProductLabelPdfRegistry = {};

export function productLabelPdfUrl(
  productId: string,
  registry: ProductLabelPdfRegistry = PRODUCT_LABEL_PDFS,
): string | null {
  const path = registry[productId];
  if (!path) return null;
  return publicAssetPath(path);
}
```

- [ ] **Step 4: Keep the PDF directory in Git**

Create `public/product-labels/.gitkeep` as an empty file.

Run:

```bash
touch public/product-labels/.gitkeep
```

- [ ] **Step 5: Run test to verify it passes**

Run:

```bash
npm test -- tests/productLabelPdfs.test.ts tests/assetPath.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add Projects/expiry-label-maker/src/productLabelPdfs.ts Projects/expiry-label-maker/tests/productLabelPdfs.test.ts Projects/expiry-label-maker/public/product-labels/.gitkeep
git commit -m "feat: add product label pdf registry"
```

---

### Task 3: Product Label Printing Mode UI

**Files:**
- Modify: `Projects/expiry-label-maker/src/main.ts`
- Modify: `Projects/expiry-label-maker/src/styles.css`

- [ ] **Step 1: Add mode state types in `main.ts`**

Modify the top of `src/main.ts`:

```ts
import { productLabelPdfUrl } from './productLabelPdfs';
```

Add mode type and state field:

```ts
type AppMode = 'expiry-labels' | 'product-labels';

type AppState = {
  mode: AppMode;
  products: ProductTemplate[];
  selectedProductId: string;
  expiryDate: string;
  labelCount: number;
  paperLayout: PaperLayout;
  pdfUrl: string;
  busy: boolean;
  status: string;
  settingsOpen: boolean;
};
```

Initialize:

```ts
let state: AppState = {
  mode: 'expiry-labels',
  products: loadProducts(),
  selectedProductId: loadProducts()[0]?.id ?? '',
  expiryDate: todayIso(),
  labelCount: 20,
  paperLayout: loadPaperLayout(),
  pdfUrl: '',
  busy: false,
  status: '',
  settingsOpen: false,
};
```

- [ ] **Step 2: Extract mode tabs markup**

Add below `paperInput` or near other render helpers:

```ts
function modeTabs(): string {
  return `
    <div class="mode-tabs" role="tablist" aria-label="印刷モード">
      <button id="expiryModeButton" class="mode-tab ${state.mode === 'expiry-labels' ? 'active' : ''}" type="button" role="tab" aria-selected="${state.mode === 'expiry-labels'}">
        消費期限シール
      </button>
      <button id="productLabelModeButton" class="mode-tab ${state.mode === 'product-labels' ? 'active' : ''}" type="button" role="tab" aria-selected="${state.mode === 'product-labels'}">
        商品ラベル印刷
      </button>
    </div>
  `;
}
```

Insert `${modeTabs()}` below the header and status popup in `render()`.

- [ ] **Step 3: Extract existing expiry workflow markup**

Move the current `<section class="workbench" ...>`, `<section class="pdf-area" ...>`, and `<details id="settingsPanel" ...>` markup into a helper:

```ts
function expiryLabelWorkflow(
  product: ProductTemplate,
  effectiveLayout: PaperLayout,
  validation: ReturnType<typeof validateJob>,
  previewUrl: string,
  capacity: number,
): string {
  return `
    <section class="workbench" aria-label="シール作成">
      ...
    </section>
    ...
  `;
}
```

Use the existing markup unchanged inside the helper.

- [ ] **Step 4: Add product label workflow markup**

Add:

```ts
function productLabelWorkflow(product: ProductTemplate): string {
  const pdfUrl = productLabelPdfUrl(product.id);

  return `
    <section class="product-label-layout" aria-label="商品ラベル印刷">
      <section class="panel product-label-control">
        <div class="step-number">1</div>
        <label class="field-label" for="productSelect">商品</label>
        <select id="productSelect" class="select">
          ${state.products
            .map(
              (item) =>
                `<option value="${escapeHtml(item.id)}" ${item.id === product.id ? 'selected' : ''}>${escapeHtml(item.name)}</option>`,
            )
            .join('')}
        </select>
        <div class="product-summary">
          <strong>${escapeHtml(product.displayName)}</strong>
          <span>${pdfUrl ? '商品ラベルPDFを印刷できます。' : 'この商品の商品ラベルPDFは未登録です。'}</span>
        </div>
        <div class="action-row left">
          <button id="printProductLabelButton" class="primary-button" type="button" ${pdfUrl ? '' : 'disabled'}>印刷</button>
        </div>
      </section>

      <section class="pdf-area product-label-pdf-area ${pdfUrl ? '' : 'empty'}">
        ${
          pdfUrl
            ? `<iframe id="productLabelPdfPreview" title="商品ラベルPDFプレビュー" src="${pdfUrl}"></iframe>`
            : '<div class="empty-preview">この商品の商品ラベルPDFは未登録です。</div>'
        }
      </section>
    </section>
  `;
}
```

- [ ] **Step 5: Switch render body by mode**

Inside `render()`, replace the existing body after mode tabs with:

```ts
${state.mode === 'expiry-labels'
  ? expiryLabelWorkflow(product, effectiveLayout, validation, previewUrl, capacity)
  : productLabelWorkflow(product)}
```

- [ ] **Step 6: Bind mode and product-label print events**

In `bindEvents()` add:

```ts
byId<HTMLButtonElement>('expiryModeButton')?.addEventListener('click', () => {
  state.mode = 'expiry-labels';
  state.status = '';
  render();
});

byId<HTMLButtonElement>('productLabelModeButton')?.addEventListener('click', () => {
  state.mode = 'product-labels';
  state.status = '';
  render();
});

byId<HTMLButtonElement>('printProductLabelButton')?.addEventListener('click', printProductLabelPdf);
```

Add print function:

```ts
function printProductLabelPdf(): void {
  const iframe = byId<HTMLIFrameElement>('productLabelPdfPreview');
  iframe?.contentWindow?.focus();
  iframe?.contentWindow?.print();
}
```

- [ ] **Step 7: Add CSS**

Add to `src/styles.css`:

```css
.mode-tabs {
  display: inline-flex;
  gap: 4px;
  margin: 0 0 18px;
  padding: 4px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--paper);
  box-shadow: 0 8px 22px var(--shadow);
}

.mode-tab {
  min-height: 38px;
  padding: 7px 14px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--caramel-dark);
  font-weight: 900;
}

.mode-tab.active {
  border-color: var(--caramel-dark);
  background: linear-gradient(180deg, var(--caramel), var(--caramel-dark));
  color: #fffdf8;
}

.product-label-layout {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 16px;
  align-items: stretch;
}

.product-label-control {
  padding: 22px;
}

.product-label-pdf-area {
  height: 720px;
}
```

Inside the existing mobile media query, add:

```css
.product-label-layout {
  grid-template-columns: 1fr;
}

.product-label-pdf-area {
  height: 520px;
}
```

- [ ] **Step 8: Manual smoke check**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Open the local URL and verify:

- Default mode is still `消費期限シール`.
- Existing PDF creation still previews and prints.
- `商品ラベル印刷` mode appears.
- Product selector works in both modes.
- With no PDFs registered, product-label print button is disabled and the unregistered message appears.

- [ ] **Step 9: Run verification**

Run:

```bash
npm test
npm run check
npm run build
```

Expected: all pass.

- [ ] **Step 10: Commit**

```bash
git add Projects/expiry-label-maker/src/main.ts Projects/expiry-label-maker/src/styles.css
git commit -m "feat: add product label printing mode"
```

---

### Task 4: GitHub Pages Build Configuration

**Files:**
- Modify: `Projects/expiry-label-maker/vite.config.ts`
- Create: `Projects/expiry-label-maker/.github/workflows/deploy-pages.yml`

- [ ] **Step 1: Inspect current Vite config**

Run:

```bash
sed -n '1,160p' vite.config.ts
```

Expected current config is small and can be extended with a `base` option.

- [ ] **Step 2: Update Vite base path**

Modify `vite.config.ts` to:

```ts
import { defineConfig } from 'vite';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'chiffon-label-maker';
const base = process.env.GITHUB_ACTIONS ? `/${repositoryName}/` : '/';

export default defineConfig({
  base,
});
```

- [ ] **Step 3: Add GitHub Pages workflow**

Create `.github/workflows/deploy-pages.yml`:

```yaml
name: Deploy GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install
        run: npm ci

      - name: Test
        run: npm test

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 4: Verify build locally**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add Projects/expiry-label-maker/vite.config.ts Projects/expiry-label-maker/.github/workflows/deploy-pages.yml
git commit -m "chore: configure github pages deployment"
```

---

### Task 5: README Deployment Instructions

**Files:**
- Modify: `Projects/expiry-label-maker/README.md`

- [ ] **Step 1: Add operation notes**

Append this section to `README.md`:

```md
## GitHub Pages 試験運用

当面は個人アカウント `rns111603h` のリポジトリ `chiffon-label-maker` で試験運用します。
法人用GitHub Organizationを作成した後、法人側へ移行して正式運用します。

想定URL:

```text
https://rns111603h.github.io/chiffon-label-maker/
```

このプロジェクトは親ワークスペースの一部として管理されています。
GitHubへ公開する際は、`Projects/expiry-label-maker` だけを単独リポジトリとして送ります。

```bash
git subtree split --prefix Projects/expiry-label-maker -b publish/chiffon-label-maker
git remote add chiffon-label-maker git@github.com:rns111603h/chiffon-label-maker.git
git push chiffon-label-maker publish/chiffon-label-maker:main
```

商品ラベルPDFは `public/product-labels/` に置き、`src/productLabelPdfs.ts` で商品IDとPDFファイルを対応づけます。
GitHub Pagesは静的サイトなので、現場ユーザーが画面からPDFをサーバーへ保存する運用にはしません。
```

- [ ] **Step 2: Verify Markdown formatting**

Run:

```bash
sed -n '1,260p' README.md
```

Expected: code fences are balanced and the new section is readable.

- [ ] **Step 3: Commit**

```bash
git add Projects/expiry-label-maker/README.md
git commit -m "docs: add github pages trial operation"
```

---

### Task 6: Final Verification

**Files:**
- No new files.

- [ ] **Step 1: Run full local verification**

Run:

```bash
cd "/Users/kouyayonaha/Apps_Service develop/Projects/expiry-label-maker"
npm test
npm run check
npm run build
```

Expected:

- Vitest passes.
- TypeScript check passes.
- Vite production build passes.

- [ ] **Step 2: Confirm app-only diff**

Run:

```bash
cd "/Users/kouyayonaha/Apps_Service develop"
git status --short
git log --oneline --decorate -5
```

Expected:

- New commits are on `codex/product-label-pdf-printing`.
- App changes are under `Projects/expiry-label-maker`.
- Existing unrelated workspace changes remain unstaged.

- [ ] **Step 3: Prepare personal GitHub publish command**

After the user confirms the GitHub repository exists at `rns111603h/chiffon-label-maker`, run:

```bash
git subtree split --prefix Projects/expiry-label-maker -b publish/chiffon-label-maker
git remote add chiffon-label-maker git@github.com:rns111603h/chiffon-label-maker.git
git push chiffon-label-maker publish/chiffon-label-maker:main
```

Expected:

- GitHub repository receives only the app files.
- GitHub Actions deploys the Pages site.
- Trial URL becomes `https://rns111603h.github.io/chiffon-label-maker/`.

- [ ] **Step 4: Record checkpoint**

Run:

```bash
git tag checkpoint/product-label-pdf-printing-20260709
```

Expected: a local tag marks the post-feature implementation point.

---

## Self-Review

- Spec coverage: The plan covers bundled PDFs, product-to-PDF mapping, A4 portrait preview/print, GitHub Pages static hosting, personal GitHub trial operation, and future corporate migration.
- Placeholder scan: No incomplete implementation steps are intentionally left open. Real product PDFs are not fabricated; `public/product-labels/.gitkeep` keeps the directory until PDFs are supplied and mapped.
- Type consistency: `productLabelPdfUrl`, `ProductLabelPdfRegistry`, `publicAssetPath`, and `AppMode` are introduced before use and have consistent names across tasks.
