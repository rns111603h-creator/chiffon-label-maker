import { publicAssetPath } from './assetPath';
import type { ProductTemplate } from './types';

export type ProductLabelPdfRegistry = Readonly<Partial<Record<string, string>>>;
export type ProductLabelPrintOption = Readonly<{
  id: string;
  name: string;
  displayName: string;
  hasPdf: boolean;
}>;

export const PRODUCT_LABEL_PDFS: ProductLabelPdfRegistry = {
  'earl-grey': 'product-labels/earl-grey.pdf',
  'orange-yogurt': 'product-labels/orange-yogurt.pdf',
  kinako: 'product-labels/kinako.pdf',
  coffee: 'product-labels/coffee.pdf',
  chocolate: 'product-labels/chocolate.pdf',
  banana: 'product-labels/banana.pdf',
  plain: 'product-labels/plain.pdf',
  'miso-chestnut': 'product-labels/miso-chestnut.pdf',
  raspberry: 'product-labels/raspberry.pdf',
  lemon: 'product-labels/lemon.pdf',
  'brown-sugar-kinako': 'product-labels/brown-sugar-kinako.pdf',
  matcha: 'product-labels/matcha.pdf',
};

export function productLabelPdfUrl(
  productId: string,
  registry: ProductLabelPdfRegistry = PRODUCT_LABEL_PDFS,
): string | null {
  const path = registry[productId];
  if (!path) return null;
  return publicAssetPath(path);
}

export function productLabelOptionsForProducts(
  products: readonly ProductTemplate[],
  registry: ProductLabelPdfRegistry = PRODUCT_LABEL_PDFS,
): ProductLabelPrintOption[] {
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    displayName: product.displayName,
    hasPdf: Boolean(registry[product.id]),
  }));
}
