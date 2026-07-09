import { publicAssetPath } from './assetPath';

export type ProductLabelPdfRegistry = Readonly<Partial<Record<string, string>>>;
export type ProductLabelPdfOption = Readonly<{
  id: string;
  name: string;
}>;

export const PRODUCT_LABEL_PDF_OPTIONS: readonly ProductLabelPdfOption[] = [
  { id: 'earl-grey', name: 'アールグレイ' },
  { id: 'orange-yogurt', name: 'オレンジヨーグルト' },
  { id: 'kinako', name: 'きなこ' },
  { id: 'coffee', name: 'コーヒー' },
  { id: 'chocolate', name: 'チョコ' },
  { id: 'banana', name: 'バナナ' },
  { id: 'plain', name: 'プレーン' },
  { id: 'miso-chestnut', name: 'みそくり' },
  { id: 'raspberry', name: 'ラズベリー' },
  { id: 'lemon', name: 'レモン' },
  { id: 'brown-sugar-kinako', name: '黒糖きなこ' },
  { id: 'matcha', name: '抹茶' },
];

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
