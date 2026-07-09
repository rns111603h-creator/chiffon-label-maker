import { describe, expect, it } from 'vitest';
import {
  PRODUCT_DATA_EXTENSION,
  createProductDataFile,
  createProductDataFileName,
  parseProductDataFile,
} from '../src/productDataFile';
import { DEFAULT_PRODUCTS } from '../src/products';

describe('product data files', () => {
  it('exports product templates as a .chiffon JSON envelope', () => {
    const exported = createProductDataFile(
      [DEFAULT_PRODUCTS[0]],
      new Date('2026-07-08T12:00:00.000Z'),
    );

    const payload = JSON.parse(exported);

    expect(PRODUCT_DATA_EXTENSION).toBe('chiffon');
    expect(payload).toMatchObject({
      type: 'associa-chiffon-label-products',
      version: 1,
      exportedAt: '2026-07-08T12:00:00.000Z',
    });
    expect(payload.products).toEqual([DEFAULT_PRODUCTS[0]]);
  });

  it('uses the custom .chiffon extension for exported file names', () => {
    expect(createProductDataFileName(new Date('2026-07-08T00:00:00.000Z'))).toBe(
      'シフォン商品データ_2026-07-08.chiffon',
    );
  });

  it('parses valid .chiffon product data', () => {
    const exported = createProductDataFile([DEFAULT_PRODUCTS[0]]);

    expect(parseProductDataFile(exported)).toEqual([DEFAULT_PRODUCTS[0]]);
  });

  it('rejects files that are not product data files', () => {
    expect(() => parseProductDataFile('{"hello":"world"}')).toThrow(
      'シフォン商品データファイルではありません。',
    );
  });
});
