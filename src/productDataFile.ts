import type { ProductTemplate } from './types';

export const PRODUCT_DATA_EXTENSION = 'chiffon';
export const PRODUCT_DATA_ACCEPT = '.chiffon';
export const PRODUCT_DATA_MIME_TYPE = 'application/x-associa-chiffon+json';

const PRODUCT_DATA_TYPE = 'associa-chiffon-label-products';
const PRODUCT_DATA_VERSION = 1;

type ProductDataFile = {
  type: typeof PRODUCT_DATA_TYPE;
  version: typeof PRODUCT_DATA_VERSION;
  exportedAt: string;
  products: ProductTemplate[];
};

export function createProductDataFile(products: ProductTemplate[], date = new Date()): string {
  const payload: ProductDataFile = {
    type: PRODUCT_DATA_TYPE,
    version: PRODUCT_DATA_VERSION,
    exportedAt: date.toISOString(),
    products,
  };

  return JSON.stringify(payload, null, 2);
}

export function createProductDataFileName(date = new Date()): string {
  return `シフォン商品データ_${date.toISOString().slice(0, 10)}.${PRODUCT_DATA_EXTENSION}`;
}

export function parseProductDataFile(raw: string): ProductTemplate[] {
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new Error('シフォン商品データファイルを読み込めません。');
  }

  if (!isProductDataFile(payload)) {
    throw new Error('シフォン商品データファイルではありません。');
  }

  return structuredClone(payload.products);
}

function isProductDataFile(value: unknown): value is ProductDataFile {
  if (!isRecord(value)) return false;
  if (value.type !== PRODUCT_DATA_TYPE || value.version !== PRODUCT_DATA_VERSION) return false;
  if (typeof value.exportedAt !== 'string') return false;
  if (!Array.isArray(value.products) || value.products.length === 0) return false;
  if (value.products.length > 20) return false;

  return value.products.every(isProductTemplate);
}

function isProductTemplate(value: unknown): value is ProductTemplate {
  if (!isRecord(value)) return false;

  return (
    stringField(value, 'id') &&
    stringField(value, 'name') &&
    stringField(value, 'displayName') &&
    stringArrayField(value, 'ingredients') &&
    stringField(value, 'allergenLine') &&
    stringField(value, 'amount') &&
    stringField(value, 'storageMethod') &&
    stringField(value, 'seller') &&
    stringField(value, 'sellerAddressLine') &&
    stringField(value, 'nutritionTitle') &&
    stringArrayField(value, 'nutritionLines') &&
    stringArrayField(value, 'noteLines')
  );
}

function stringField(value: Record<string, unknown>, key: string): boolean {
  return typeof value[key] === 'string';
}

function stringArrayField(value: Record<string, unknown>, key: string): boolean {
  const field = value[key];
  return Array.isArray(field) && field.every((item) => typeof item === 'string');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
