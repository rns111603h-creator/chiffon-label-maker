import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { buildLabelPdf } from '../src/pdfBuilder';
import { DEFAULT_PAPER_LAYOUT } from '../src/layout';
import { DEFAULT_PRODUCTS } from '../src/products';

describe('buildLabelPdf', () => {
  it('creates one A4 landscape page for a full sheet', async () => {
    const bytes = await buildLabelPdf({
      product: DEFAULT_PRODUCTS[0],
      expiryDate: '2026-07-10',
      labelCount: 20,
      paperLayout: DEFAULT_PAPER_LAYOUT,
    });
    const pdf = await PDFDocument.load(bytes);
    const page = pdf.getPage(0);

    expect(pdf.getPageCount()).toBe(1);
    expect(page.getWidth()).toBeCloseTo(841.89, 1);
    expect(page.getHeight()).toBeCloseTo(595.276, 1);
  });

  it('adds pages when the requested label count exceeds one sheet', async () => {
    const bytes = await buildLabelPdf({
      product: DEFAULT_PRODUCTS[0],
      expiryDate: '2026-07-10',
      labelCount: 21,
      paperLayout: DEFAULT_PAPER_LAYOUT,
    });
    const pdf = await PDFDocument.load(bytes);

    expect(pdf.getPageCount()).toBe(2);
  });
});
