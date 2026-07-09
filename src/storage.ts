import { DEFAULT_PAPER_LAYOUT } from './layout';
import { DEFAULT_PRODUCTS } from './products';
import type { PaperLayout, ProductTemplate } from './types';

const PRODUCTS_KEY = 'expiry-label-maker.products';
const PAPER_LAYOUT_KEY = 'expiry-label-maker.paper-layout';
const RETIRED_BUILT_IN_PRODUCT_IDS = new Set(['maple', 'seasonal']);
const SWEET_POTATO_PRODUCT_ID = 'sweet-potato';

export function loadProducts(): ProductTemplate[] {
  return migrateProducts(loadJson(PRODUCTS_KEY, DEFAULT_PRODUCTS));
}

export function saveProducts(products: ProductTemplate[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function loadPaperLayout(): PaperLayout {
  return migratePaperLayout(loadJson(PAPER_LAYOUT_KEY, DEFAULT_PAPER_LAYOUT));
}

export function savePaperLayout(layout: PaperLayout): void {
  localStorage.setItem(PAPER_LAYOUT_KEY, JSON.stringify(layout));
}

export function resetAllSettings(): void {
  localStorage.removeItem(PRODUCTS_KEY);
  localStorage.removeItem(PAPER_LAYOUT_KEY);
}

function loadJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return structuredClone(fallback);

  try {
    return JSON.parse(raw) as T;
  } catch {
    return structuredClone(fallback);
  }
}

function migratePaperLayout(layout: PaperLayout): PaperLayout {
  if (!isPreviousDefaultPaperLayout(layout)) return layout;

  return {
    ...layout,
    labelHeightMm: DEFAULT_PAPER_LAYOUT.labelHeightMm,
    horizontalPitchMm: DEFAULT_PAPER_LAYOUT.horizontalPitchMm,
  };
}

function isPreviousDefaultPaperLayout(layout: PaperLayout): boolean {
  return (
    layout.id === DEFAULT_PAPER_LAYOUT.id &&
    layout.columns === DEFAULT_PAPER_LAYOUT.columns &&
    layout.rows === DEFAULT_PAPER_LAYOUT.rows &&
    layout.marginLeftMm === DEFAULT_PAPER_LAYOUT.marginLeftMm &&
    layout.marginTopMm === DEFAULT_PAPER_LAYOUT.marginTopMm &&
    layout.labelWidthMm === DEFAULT_PAPER_LAYOUT.labelWidthMm &&
    layout.labelHeightMm === 23.4 &&
    layout.horizontalPitchMm === 51 &&
    layout.verticalPitchMm === DEFAULT_PAPER_LAYOUT.verticalPitchMm
  );
}

function migrateProducts(products: ProductTemplate[]): ProductTemplate[] {
  const activeProducts = products
    .filter((product) => !RETIRED_BUILT_IN_PRODUCT_IDS.has(product.id))
    .map(migrateProduct);
  if (activeProducts.some((product) => product.id === SWEET_POTATO_PRODUCT_ID)) {
    return activeProducts;
  }

  const sweetPotato = DEFAULT_PRODUCTS.find((product) => product.id === SWEET_POTATO_PRODUCT_ID);
  if (!sweetPotato) return activeProducts;

  return [...activeProducts, structuredClone(sweetPotato)];
}

function migrateProduct(product: ProductTemplate): ProductTemplate {
  if (product.id !== SWEET_POTATO_PRODUCT_ID) return product;

  const sweetPotato = DEFAULT_PRODUCTS.find((item) => item.id === SWEET_POTATO_PRODUCT_ID);
  if (!sweetPotato) return product;

  return {
    ...product,
    nutritionLines: structuredClone(sweetPotato.nutritionLines),
  };
}
