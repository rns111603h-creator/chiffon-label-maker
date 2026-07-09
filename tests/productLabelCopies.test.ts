import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { buildRepeatedProductLabelPdf, normalizeProductLabelCopies } from '../src/productLabelCopies';

describe('normalizeProductLabelCopies', () => {
  it('keeps product label copies in a practical print range', () => {
    expect(normalizeProductLabelCopies(3)).toBe(3);
    expect(normalizeProductLabelCopies(0)).toBe(1);
    expect(normalizeProductLabelCopies(1.8)).toBe(1);
    expect(normalizeProductLabelCopies(Number.NaN)).toBe(1);
    expect(normalizeProductLabelCopies(80)).toBe(50);
  });
});

describe('buildRepeatedProductLabelPdf', () => {
  it('duplicates every source page for the selected number of copies', async () => {
    const source = await PDFDocument.create();
    source.addPage([100, 200]);
    source.addPage([120, 240]);
    const sourceBytes = await source.save();

    const repeatedBytes = await buildRepeatedProductLabelPdf(sourceBytes, 3);
    const repeated = await PDFDocument.load(repeatedBytes);

    expect(repeated.getPageCount()).toBe(6);
    expect(repeated.getPage(0).getSize()).toEqual({ width: 100, height: 200 });
    expect(repeated.getPage(1).getSize()).toEqual({ width: 120, height: 240 });
    expect(repeated.getPage(2).getSize()).toEqual({ width: 100, height: 200 });
  });
});
