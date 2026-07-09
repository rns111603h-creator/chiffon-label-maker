import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  PRODUCT_LABEL_PDFS,
  PRODUCT_LABEL_PDF_OPTIONS,
  productLabelPdfUrl,
} from '../src/productLabelPdfs';

describe('productLabelPdfUrl', () => {
  it('returns a public PDF URL for registered products', () => {
    const baseUrl = import.meta.env.BASE_URL;

    expect(productLabelPdfUrl('plain', { plain: 'product-labels/plain.pdf' })).toBe(
      `${baseUrl}product-labels/plain.pdf`,
    );
  });

  it('returns null for products without bundled label PDFs', () => {
    expect(productLabelPdfUrl('sweet-potato', { plain: 'product-labels/plain.pdf' })).toBeNull();
  });

  it('normalizes leading slashes in configured PDF paths', () => {
    const baseUrl = import.meta.env.BASE_URL;

    expect(productLabelPdfUrl('plain', { plain: '/product-labels/plain.pdf' })).toBe(
      `${baseUrl}product-labels/plain.pdf`,
    );
  });

  it('ships the supplied product label PDFs', () => {
    expect(PRODUCT_LABEL_PDFS).toMatchObject({
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
    });
  });

  it('points every bundled product label PDF entry at an existing public asset', () => {
    const publicDir = resolve(__dirname, '../public');

    for (const path of Object.values(PRODUCT_LABEL_PDFS).filter((value): value is string =>
      Boolean(value),
    )) {
      expect(existsSync(resolve(publicDir, path))).toBe(true);
    }
  });

  it('provides product label print options for every supplied PDF', () => {
    expect(PRODUCT_LABEL_PDF_OPTIONS).toHaveLength(12);
    expect(PRODUCT_LABEL_PDF_OPTIONS.map((option) => option.name)).toEqual([
      'アールグレイ',
      'オレンジヨーグルト',
      'きなこ',
      'コーヒー',
      'チョコ',
      'バナナ',
      'プレーン',
      'みそくり',
      'ラズベリー',
      'レモン',
      '黒糖きなこ',
      '抹茶',
    ]);
  });
});
