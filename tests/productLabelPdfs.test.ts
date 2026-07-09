import { describe, expect, it } from 'vitest';
import { productLabelPdfUrl } from '../src/productLabelPdfs';

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
});
