import './styles.css';
import { makePreviewDataUrl, renderLabelToPng } from './canvasRenderer';
import { createPdfPreviewUrl, downloadBytes } from './download';
import {
  DEFAULT_PAPER_LAYOUT,
  createEffectivePaperLayout,
  sanitizePaperLayout,
  sheetCapacity,
} from './layout';
import { createProductDraft, findProduct } from './products';
import { buildLabelPdf } from './pdfBuilder';
import {
  PRODUCT_DATA_ACCEPT,
  PRODUCT_DATA_MIME_TYPE,
  createProductDataFile,
  createProductDataFileName,
  parseProductDataFile,
} from './productDataFile';
import {
  loadPaperLayout,
  loadProducts,
  resetAllSettings,
  savePaperLayout,
  saveProducts,
} from './storage';
import { createStatusPopupHtml } from './statusPopup';
import { applyProductTemplateEdits, deleteProductTemplate } from './productEditor';
import { buildRepeatedProductLabelPdf, normalizeProductLabelCopies } from './productLabelCopies';
import { PRODUCT_LABEL_PDF_OPTIONS, productLabelPdfUrl } from './productLabelPdfs';
import type { LabelJob, PaperLayout, ProductTemplate } from './types';
import { EDITABLE_SETTINGS_COPY } from './uiCopy';
import { validateJob, validatePaperLayout } from './validation';

type AppMode = 'expiry-labels' | 'product-labels';

type AppState = {
  mode: AppMode;
  products: ProductTemplate[];
  selectedProductId: string;
  selectedProductLabelId: string;
  productLabelCopies: number;
  productLabelPdfUrl: string;
  productLabelBusy: boolean;
  expiryDate: string;
  labelCount: number;
  paperLayout: PaperLayout;
  pdfUrl: string;
  busy: boolean;
  status: string;
  settingsOpen: boolean;
};

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) {
  throw new Error('アプリの表示領域が見つかりません。');
}
const app = root;
const initialProducts = loadProducts();
const initialProductId = initialProducts[0]?.id ?? '';

let state: AppState = {
  mode: 'expiry-labels',
  products: initialProducts,
  selectedProductId: initialProductId,
  selectedProductLabelId:
    PRODUCT_LABEL_PDF_OPTIONS.find((option) => option.id === initialProductId)?.id ??
    PRODUCT_LABEL_PDF_OPTIONS[0]?.id ??
    '',
  productLabelCopies: 1,
  productLabelPdfUrl: '',
  productLabelBusy: false,
  expiryDate: todayIso(),
  labelCount: 20,
  paperLayout: loadPaperLayout(),
  pdfUrl: '',
  busy: false,
  status: '',
  settingsOpen: false,
};

render();

function render(): void {
  const product = currentProduct();
  const effectiveLayout = createEffectivePaperLayout(state.paperLayout, product);
  const job = currentJob();
  const validation = validateJob(job);
  const previewUrl = makePreviewDataUrl(
    product,
    state.expiryDate,
    effectiveLayout.labelWidthMm,
    effectiveLayout.labelHeightMm,
  );
  const capacity = sheetCapacity(effectiveLayout);
  const productLabelOption = currentProductLabelOption();
  const sourceProductLabelUrl = productLabelPdfUrl(productLabelOption.id);
  const productLabelPreviewUrl = currentProductLabelPreviewUrl(sourceProductLabelUrl);
  const statusOk =
    state.mode === 'expiry-labels'
      ? validation.valid
      : Boolean(productLabelPreviewUrl) && !state.productLabelBusy;

  app.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">シフォンケーキ</p>
          <h1>消費期限シール作成</h1>
        </div>
        <div class="status ${statusOk ? 'ok' : 'warn'}">
          ${statusOk ? '印刷準備OK' : '確認が必要です'}
        </div>
      </header>
      ${state.status ? createStatusPopupHtml(state.status) : ''}
      ${modeTabs()}

      ${
        state.mode === 'expiry-labels'
          ? expiryLabelWorkflow(product, effectiveLayout, validation, previewUrl, capacity)
          : productLabelWorkflow(productLabelOption, productLabelPreviewUrl)
      }
      ${state.mode === 'expiry-labels' ? settingsPanel(product) : ''}
    </main>
  `;

  bindEvents();
}

function modeTabs(): string {
  return `
    <nav class="mode-tabs" aria-label="印刷モード">
      <button
        id="expiryModeButton"
        class="mode-tab ${state.mode === 'expiry-labels' ? 'active' : ''}"
        type="button"
        aria-pressed="${state.mode === 'expiry-labels'}"
      >
        消費期限シール
      </button>
      <button
        id="productLabelModeButton"
        class="mode-tab ${state.mode === 'product-labels' ? 'active' : ''}"
        type="button"
        aria-pressed="${state.mode === 'product-labels'}"
      >
        商品ラベル印刷
      </button>
    </nav>
  `;
}

function productSelectPanel(product: ProductTemplate, stepNumber = '1'): string {
  return `
    <section class="panel step-panel">
      <div class="step-number">${stepNumber}</div>
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
        <span>${escapeHtml(product.ingredients.join(' / '))}</span>
      </div>
    </section>
  `;
}

function productLabelSelectPanel(stepNumber = '1'): string {
  const option = currentProductLabelOption();
  return `
    <section class="panel step-panel">
      <div class="step-number">${stepNumber}</div>
      <label class="field-label" for="productLabelSelect">商品ラベル</label>
      <select id="productLabelSelect" class="select">
        ${PRODUCT_LABEL_PDF_OPTIONS.map(
          (item) =>
            `<option value="${escapeHtml(item.id)}" ${item.id === option.id ? 'selected' : ''}>${escapeHtml(item.name)}</option>`,
        ).join('')}
      </select>
      <div class="product-summary">
        <strong>${escapeHtml(`シフォンケーキ（${option.name}）`)}</strong>
        <span>登録済みPDFをA4タテで表示します。</span>
      </div>
    </section>
  `;
}

function expiryLabelWorkflow(
  product: ProductTemplate,
  effectiveLayout: PaperLayout,
  validation: ReturnType<typeof validateJob>,
  previewUrl: string,
  capacity: number,
): string {
  return `
      <section class="workbench" aria-label="シール作成">
        ${productSelectPanel(product)}

        <section class="panel step-panel">
          <div class="step-number">2</div>
          <label class="field-label" for="expiryDate">消費期限</label>
          <input id="expiryDate" class="date-input" type="date" value="${escapeHtml(state.expiryDate)}" />
          <label class="field-label small" for="labelCount">シール枚数</label>
          <input id="labelCount" class="number-input" type="number" min="1" max="200" value="${state.labelCount}" />
          <button id="fillSheetButton" class="secondary-button" type="button">1シート分にする</button>
        </section>

        <section class="panel preview-panel">
          <div class="step-number">3</div>
          <div class="preview-head">
            <div>
              <label class="field-label">1枚プレビュー</label>
              <p class="print-meta">${escapeHtml(effectiveLayout.name)} / ${effectiveLayout.columns}列×${effectiveLayout.rows}行 / 1シート${capacity}枚</p>
            </div>
          </div>
          <img class="label-preview" alt="シール1枚分のプレビュー" src="${previewUrl}" />
          <div class="message-list">
            ${validation.errors.map((message) => `<p class="error">${escapeHtml(message)}</p>`).join('')}
            ${validation.warnings.map((message) => `<p class="warning">${escapeHtml(message)}</p>`).join('')}
          </div>
          <div class="action-row">
            <button id="createPdfButton" class="primary-button" type="button" ${validation.valid && !state.busy ? '' : 'disabled'}>
              ${state.busy ? '作成中...' : 'PDF作成'}
            </button>
            <button id="printPdfButton" class="secondary-button" type="button" ${state.pdfUrl ? '' : 'disabled'}>印刷</button>
          </div>
        </section>
      </section>

      <section class="pdf-area ${state.pdfUrl ? '' : 'empty'}">
        ${
          state.pdfUrl
            ? `<iframe id="pdfPreview" title="PDFプレビュー" src="${state.pdfUrl}"></iframe>`
            : '<div class="empty-preview">PDFを作成するとA4横プレビューが表示されます。</div>'
        }
      </section>
  `;
}

function productLabelWorkflow(
  option: (typeof PRODUCT_LABEL_PDF_OPTIONS)[number],
  pdfUrl: string | null,
): string {
  return `
      <section class="product-label-layout" aria-label="商品ラベル印刷">
        <div class="product-label-control">
          ${productLabelSelectPanel()}
          <section class="panel step-panel">
            <div class="step-number">2</div>
            <label class="field-label" for="productLabelCopies">部数</label>
            <input
              id="productLabelCopies"
              class="number-input"
              type="number"
              min="1"
              max="50"
              value="${state.productLabelCopies}"
            />
            <p class="print-meta">2部以上は、同じA4 PDFを部数分のページにして印刷します。</p>
          </section>
          <div class="action-row">
            <button id="printProductLabelButton" class="primary-button" type="button" ${pdfUrl && !state.productLabelBusy ? '' : 'disabled'}>
              ${state.productLabelBusy ? '作成中...' : '印刷'}
            </button>
          </div>
        </div>
        <section class="product-label-pdf-area ${pdfUrl ? '' : 'empty'}">
          ${
            pdfUrl
              ? `<iframe id="productLabelPdfPreview" title="${escapeHtml(`${option.name}の商品ラベルPDFプレビュー`)}" src="${escapeHtml(pdfUrl)}"></iframe>`
              : `<div class="empty-preview">${state.productLabelBusy ? '部数分のPDFを作成中です。' : 'この商品ラベルPDFは未登録です。'}</div>`
          }
        </section>
      </section>
  `;
}

function settingsPanel(product: ProductTemplate): string {
  return `
      <details id="settingsPanel" class="settings-panel" ${state.settingsOpen ? 'open' : ''}>
        <summary>${EDITABLE_SETTINGS_COPY.summary}</summary>
        <div class="settings-grid">
          <section>
            <h2>${EDITABLE_SETTINGS_COPY.productHeading}</h2>
            <p class="field-help">${EDITABLE_SETTINGS_COPY.productHelp}</p>
            <label class="field-label" for="productName">商品名</label>
            <input id="productName" class="text-input" value="${escapeHtml(product.name)}" />
            <label class="field-label" for="productDisplayName">表示名</label>
            <input id="productDisplayName" class="text-input" value="${escapeHtml(product.displayName)}" />
            <label class="field-label" for="ingredients">原材料名</label>
            <p class="field-help">原材料と原材料の間には「・」を入れてください。改行せず、1行で入力してください。</p>
            <textarea id="ingredients" class="textarea">${escapeHtml(product.ingredients.join('・'))}</textarea>
            <label class="field-label" for="allergenLine">アレルゲン表示</label>
            <input id="allergenLine" class="text-input" value="${escapeHtml(product.allergenLine)}" />
            <h3 class="field-group-title">通常は変更不要</h3>
            <p class="field-help">初期状態では現行シールの内容が入力されています。必要な場合だけ編集してください。</p>
            <label class="field-label" for="amount">内容量</label>
            <input id="amount" class="text-input" value="${escapeHtml(product.amount)}" />
            <label class="field-label" for="storageMethod">保存方法</label>
            <input id="storageMethod" class="text-input" value="${escapeHtml(product.storageMethod)}" />
            <label class="field-label" for="seller">販売者</label>
            <input id="seller" class="text-input" value="${escapeHtml(product.seller)}" />
            <label class="field-label" for="sellerAddressLine">販売者住所・電話番号</label>
            <input id="sellerAddressLine" class="text-input" value="${escapeHtml(product.sellerAddressLine)}" />
            <label class="field-label" for="nutritionLines">栄養成分</label>
            <textarea id="nutritionLines" class="textarea">${escapeHtml(product.nutritionLines.join('\n'))}</textarea>
            <div class="action-row left">
              <button id="saveProductButton" class="secondary-button" type="button">商品を保存</button>
              <button id="addProductButton" class="secondary-button" type="button">商品を追加</button>
              <button id="deleteProductButton" class="danger-button" type="button" ${state.products.length <= 1 ? 'disabled' : ''}>商品を削除</button>
            </div>
            <div class="action-row left">
              <button id="exportProductDataButton" class="secondary-button" type="button">商品データを書き出し</button>
              <button id="importProductDataButton" class="secondary-button" type="button">商品データを読み込み</button>
              <input id="importProductDataInput" class="hidden-file-input" type="file" accept="${PRODUCT_DATA_ACCEPT}" />
            </div>
            <p class="field-help">商品データは .chiffon ファイルで受け渡しできます。読み込み時は現在の商品テンプレートを置き換えます。</p>
          </section>

          <section>
            <h2>${EDITABLE_SETTINGS_COPY.paperHeading}</h2>
            ${paperInput('marginLeftMm', '左余白', state.paperLayout.marginLeftMm)}
            ${paperInput('marginTopMm', '上余白', state.paperLayout.marginTopMm)}
            ${paperInput('labelWidthMm', 'ラベル幅', state.paperLayout.labelWidthMm)}
            ${paperInput('labelHeightMm', 'ラベル高さ', state.paperLayout.labelHeightMm)}
            ${paperInput('horizontalPitchMm', '横間隔', state.paperLayout.horizontalPitchMm)}
            ${paperInput('verticalPitchMm', '縦間隔', state.paperLayout.verticalPitchMm)}
            ${paperInput('columns', '列数', state.paperLayout.columns, 1)}
            ${paperInput('rows', '行数', state.paperLayout.rows, 1)}
            <p class="field-help">現行ラベルサイズが最大です。文字数が多すぎる場合は、赤字のエラーが表示されます。</p>
            <div class="message-list compact">
              ${validatePaperLayout(state.paperLayout).errors.map((message) => `<p class="error">${escapeHtml(message)}</p>`).join('')}
              ${validatePaperLayout(state.paperLayout).warnings.map((message) => `<p class="warning">${escapeHtml(message)}</p>`).join('')}
            </div>
            <div class="action-row left">
              <button id="savePaperButton" class="secondary-button" type="button">用紙設定を保存</button>
              <button id="resetButton" class="danger-button" type="button">初期設定に戻す</button>
            </div>
          </section>
        </div>
      </details>
  `;
}

function bindEvents(): void {
  byId<HTMLButtonElement>('expiryModeButton')?.addEventListener('click', () => {
    state.mode = 'expiry-labels';
    resetProductLabelPreview();
    state.status = '';
    render();
  });

  byId<HTMLButtonElement>('productLabelModeButton')?.addEventListener('click', () => {
    state.mode = 'product-labels';
    if (productLabelPdfUrl(state.selectedProductId)) {
      state.selectedProductLabelId = state.selectedProductId;
    }
    resetProductLabelPreview();
    state.status = '';
    render();
    void refreshProductLabelPreview();
  });

  byId<HTMLSelectElement>('productSelect')?.addEventListener('change', (event) => {
    state.selectedProductId = (event.target as HTMLSelectElement).value;
    state.status = '';
    render();
  });

  byId<HTMLSelectElement>('productLabelSelect')?.addEventListener('change', (event) => {
    state.selectedProductLabelId = (event.target as HTMLSelectElement).value;
    resetProductLabelPreview();
    state.status = '';
    render();
    void refreshProductLabelPreview();
  });

  byId<HTMLInputElement>('productLabelCopies')?.addEventListener('change', (event) => {
    state.productLabelCopies = normalizeProductLabelCopies(
      Number((event.target as HTMLInputElement).value),
    );
    resetProductLabelPreview();
    state.status =
      state.productLabelCopies === 1
        ? '商品ラベルを1部で印刷します。'
        : `${state.productLabelCopies}部ぶんのPDFを作成します。`;
    render();
    void refreshProductLabelPreview();
  });

  byId<HTMLInputElement>('expiryDate')?.addEventListener('change', (event) => {
    state.expiryDate = (event.target as HTMLInputElement).value;
    state.status = '全ラベルに同じ期限を反映しました。';
    render();
  });

  byId<HTMLInputElement>('labelCount')?.addEventListener('input', (event) => {
    state.labelCount = Number((event.target as HTMLInputElement).value);
    state.status = '';
    render();
  });

  byId<HTMLButtonElement>('fillSheetButton')?.addEventListener('click', () => {
    state.labelCount = sheetCapacity(currentJob().paperLayout);
    state.status = '1シート分の枚数にしました。';
    render();
  });

  byId<HTMLButtonElement>('createPdfButton')?.addEventListener('click', createPdf);
  byId<HTMLButtonElement>('printPdfButton')?.addEventListener('click', printPdf);
  byId<HTMLButtonElement>('printProductLabelButton')?.addEventListener('click', printProductLabelPdf);
  byId<HTMLButtonElement>('statusPopupCloseButton')?.addEventListener('click', () => {
    state.status = '';
    render();
  });
  byId<HTMLDetailsElement>('settingsPanel')?.addEventListener('toggle', (event) => {
    state.settingsOpen = (event.target as HTMLDetailsElement).open;
  });
  byId<HTMLButtonElement>('saveProductButton')?.addEventListener('click', saveCurrentProduct);
  byId<HTMLButtonElement>('addProductButton')?.addEventListener('click', addProduct);
  byId<HTMLButtonElement>('deleteProductButton')?.addEventListener('click', deleteCurrentProduct);
  byId<HTMLButtonElement>('exportProductDataButton')?.addEventListener('click', exportProductData);
  byId<HTMLButtonElement>('importProductDataButton')?.addEventListener('click', () => {
    byId<HTMLInputElement>('importProductDataInput')?.click();
  });
  byId<HTMLInputElement>('importProductDataInput')?.addEventListener('change', importProductData);
  byId<HTMLButtonElement>('savePaperButton')?.addEventListener('click', saveCurrentPaper);
  byId<HTMLButtonElement>('resetButton')?.addEventListener('click', resetSettings);
}

async function createPdf(): Promise<void> {
  state.busy = true;
  state.status = '';
  render();

  try {
    const bytes = await buildLabelPdf(currentJob(), { renderLabelImage: renderLabelToPng });
    if (state.pdfUrl) URL.revokeObjectURL(state.pdfUrl);
    state.pdfUrl = createPdfPreviewUrl(bytes);
    state.status = 'PDFを作成しました。印刷前にプレビューを確認してください。';
  } catch (error) {
    state.status = error instanceof Error ? error.message : 'PDF作成に失敗しました。';
  } finally {
    state.busy = false;
    render();
  }
}

function printPdf(): void {
  const iframe = byId<HTMLIFrameElement>('pdfPreview');
  iframe?.contentWindow?.focus();
  iframe?.contentWindow?.print();
}

function printProductLabelPdf(): void {
  const iframe = byId<HTMLIFrameElement>('productLabelPdfPreview');
  iframe?.contentWindow?.focus();
  iframe?.contentWindow?.print();
}

async function refreshProductLabelPreview(): Promise<void> {
  if (state.mode !== 'product-labels' || state.productLabelCopies <= 1) return;

  const sourceUrl = productLabelPdfUrl(currentProductLabelOption().id);
  if (!sourceUrl) return;

  state.productLabelBusy = true;
  render();

  try {
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error('商品ラベルPDFを読み込めませんでした。');
    }

    const sourceBytes = await response.arrayBuffer();
    const repeatedBytes = await buildRepeatedProductLabelPdf(sourceBytes, state.productLabelCopies);
    resetProductLabelPreview();
    state.productLabelPdfUrl = createPdfPreviewUrl(repeatedBytes);
    state.status = `${state.productLabelCopies}部ぶんのPDFを作成しました。`;
  } catch (error) {
    state.status =
      error instanceof Error ? error.message : '商品ラベルPDFの部数作成に失敗しました。';
  } finally {
    state.productLabelBusy = false;
    render();
  }
}

function resetProductLabelPreview(): void {
  if (state.productLabelPdfUrl) {
    URL.revokeObjectURL(state.productLabelPdfUrl);
    state.productLabelPdfUrl = '';
  }
  state.productLabelBusy = false;
}

function saveCurrentProduct(): void {
  const product = applyProductTemplateEdits(currentProduct(), {
    name: byId<HTMLInputElement>('productName')?.value ?? '',
    displayName: byId<HTMLInputElement>('productDisplayName')?.value ?? '',
    ingredientsText: byId<HTMLTextAreaElement>('ingredients')?.value ?? '',
    allergenLine: byId<HTMLInputElement>('allergenLine')?.value ?? '',
    amount: byId<HTMLInputElement>('amount')?.value ?? '',
    storageMethod: byId<HTMLInputElement>('storageMethod')?.value ?? '',
    seller: byId<HTMLInputElement>('seller')?.value ?? '',
    sellerAddressLine: byId<HTMLInputElement>('sellerAddressLine')?.value ?? '',
    nutritionLinesText: byId<HTMLTextAreaElement>('nutritionLines')?.value ?? '',
  });

  state.products = state.products.map((item) => (item.id === product.id ? product : item));
  saveProducts(state.products);
  state.status = '商品テンプレートを保存しました。';
  render();
}

function addProduct(): void {
  if (state.products.length >= 20) {
    state.status = '商品テンプレートは20件までを想定しています。';
    render();
    return;
  }

  const base = createProductDraft(currentProduct());
  base.id = `product-${Date.now()}`;
  base.name = `新商品${state.products.length + 1}`;
  base.displayName = `シフォンケーキ（${base.name}）`;
  state.products = [...state.products, base];
  state.selectedProductId = base.id;
  saveProducts(state.products);
  state.status = '新しい商品テンプレートを追加しました。';
  render();
}

function deleteCurrentProduct(): void {
  const product = currentProduct();
  const confirmed = window.confirm(
    `「${product.name}」の商品テンプレートを削除します。よろしいですか？`,
  );
  if (!confirmed) return;

  const result = deleteProductTemplate(state.products, product.id);
  if (!result.deleted) {
    state.status = '最後の1件は削除できません。';
    render();
    return;
  }

  state.products = result.products;
  state.selectedProductId = result.selectedProductId;
  if (state.pdfUrl) {
    URL.revokeObjectURL(state.pdfUrl);
    state.pdfUrl = '';
  }
  saveProducts(state.products);
  state.status = '商品テンプレートを削除しました。';
  render();
}

function exportProductData(): void {
  const bytes = new TextEncoder().encode(createProductDataFile(state.products));
  const url = downloadBytes(bytes, createProductDataFileName(), PRODUCT_DATA_MIME_TYPE);
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  state.status = '商品データを書き出しました。';
  render();
}

async function importProductData(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;

  if (!file.name.toLowerCase().endsWith('.chiffon')) {
    state.status = '拡張子が .chiffon の商品データを選択してください。';
    render();
    return;
  }

  try {
    const products = parseProductDataFile(await file.text());
    const confirmed = window.confirm(
      '現在の商品テンプレートを、読み込んだ商品データで置き換えます。よろしいですか？',
    );
    if (!confirmed) return;

    state.products = products;
    state.selectedProductId = products[0]?.id ?? '';
    clearPdfPreview();
    saveProducts(state.products);
    state.status = `${products.length}件の商品データを読み込みました。`;
    render();
  } catch (error) {
    state.status = error instanceof Error ? error.message : '商品データの読み込みに失敗しました。';
    render();
  }
}

function clearPdfPreview(): void {
  if (!state.pdfUrl) return;
  URL.revokeObjectURL(state.pdfUrl);
  state.pdfUrl = '';
}

function saveCurrentPaper(): void {
  const nextLayout = sanitizePaperLayout({
    ...state.paperLayout,
    marginLeftMm: numberFromInput('marginLeftMm'),
    marginTopMm: numberFromInput('marginTopMm'),
    labelWidthMm: numberFromInput('labelWidthMm'),
    labelHeightMm: numberFromInput('labelHeightMm'),
    horizontalPitchMm: numberFromInput('horizontalPitchMm'),
    verticalPitchMm: numberFromInput('verticalPitchMm'),
    columns: numberFromInput('columns'),
    rows: numberFromInput('rows'),
  });

  state.paperLayout = nextLayout;
  state.labelCount = sheetCapacity(createEffectivePaperLayout(nextLayout, currentProduct()));
  savePaperLayout(nextLayout);
  state.status = 'ラベル用紙設定を保存しました。';
  render();
}

function resetSettings(): void {
  resetAllSettings();
  state = {
    ...state,
    mode: state.mode,
    products: loadProducts(),
    selectedProductId: loadProducts()[0]?.id ?? '',
    paperLayout: DEFAULT_PAPER_LAYOUT,
    labelCount: DEFAULT_PAPER_LAYOUT.columns * DEFAULT_PAPER_LAYOUT.rows,
    status: '初期設定に戻しました。',
    settingsOpen: state.settingsOpen,
  };
  render();
}

function currentProduct(): ProductTemplate {
  return findProduct(state.products, state.selectedProductId);
}

function currentProductLabelOption(): (typeof PRODUCT_LABEL_PDF_OPTIONS)[number] {
  return (
    PRODUCT_LABEL_PDF_OPTIONS.find((option) => option.id === state.selectedProductLabelId) ??
    PRODUCT_LABEL_PDF_OPTIONS[0]
  );
}

function currentProductLabelPreviewUrl(sourceUrl: string | null): string | null {
  if (!sourceUrl) return null;
  if (state.productLabelCopies <= 1) return sourceUrl;
  return state.productLabelPdfUrl || null;
}

function currentJob(): LabelJob {
  const product = currentProduct();
  return {
    product,
    expiryDate: state.expiryDate,
    labelCount: state.labelCount,
    paperLayout: createEffectivePaperLayout(state.paperLayout, product),
  };
}

function paperInput(id: keyof PaperLayout, label: string, value: number, step = 0.1): string {
  return `
    <label class="field-label" for="${id}">${label}</label>
    <div class="unit-input">
      <input id="${id}" class="number-input" type="number" step="${step}" value="${value}" />
      <span>${id === 'columns' || id === 'rows' ? '' : 'mm'}</span>
    </div>
  `;
}

function numberFromInput(id: string): number {
  return Number(byId<HTMLInputElement>(id)?.value ?? 0);
}

function byId<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
