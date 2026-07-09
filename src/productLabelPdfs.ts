import { publicAssetPath } from './assetPath';

export type ProductLabelPdfRegistry = Readonly<Partial<Record<string, string>>>;

export const PRODUCT_LABEL_PDFS: ProductLabelPdfRegistry = {};

export function productLabelPdfUrl(
  productId: string,
  registry: ProductLabelPdfRegistry = PRODUCT_LABEL_PDFS,
): string | null {
  const path = registry[productId];
  if (!path) return null;
  return publicAssetPath(path);
}
