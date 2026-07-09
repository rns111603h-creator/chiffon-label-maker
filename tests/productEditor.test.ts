import { describe, expect, it } from 'vitest';
import { applyProductTemplateEdits, deleteProductTemplate } from '../src/productEditor';
import { DEFAULT_PRODUCTS } from '../src/products';

describe('applyProductTemplateEdits', () => {
  it('saves normally unchanged label details when the user edits them', () => {
    const product = applyProductTemplateEdits(DEFAULT_PRODUCTS[0], {
      name: 'アップルシナモン',
      displayName: 'シフォンケーキ（アップルシナモン）',
      ingredientsText: '卵・砂糖・薄力粉',
      allergenLine: '（一部に卵・小麦を含む）',
      amount: '2個',
      storageMethod: '直射日光を避けて保存',
      seller: 'テスト販売者',
      sellerAddressLine: '沖縄県テスト市1-2-3 098-000-0000',
      nutritionLinesText: 'エネルギー：100Kcal',
    });

    expect(product.amount).toBe('2個');
    expect(product.storageMethod).toBe('直射日光を避けて保存');
    expect(product.seller).toBe('テスト販売者');
    expect(product.sellerAddressLine).toBe('沖縄県テスト市1-2-3 098-000-0000');
  });

  it('keeps existing normally unchanged label details when inputs are blank', () => {
    const product = applyProductTemplateEdits(DEFAULT_PRODUCTS[0], {
      name: '',
      displayName: '',
      ingredientsText: '',
      allergenLine: '',
      amount: '',
      storageMethod: '',
      seller: '',
      sellerAddressLine: '',
      nutritionLinesText: '',
    });

    expect(product.amount).toBe(DEFAULT_PRODUCTS[0].amount);
    expect(product.storageMethod).toBe(DEFAULT_PRODUCTS[0].storageMethod);
    expect(product.seller).toBe(DEFAULT_PRODUCTS[0].seller);
    expect(product.sellerAddressLine).toBe(DEFAULT_PRODUCTS[0].sellerAddressLine);
  });
});

describe('deleteProductTemplate', () => {
  it('removes the selected product and selects a neighboring template', () => {
    const result = deleteProductTemplate(DEFAULT_PRODUCTS, DEFAULT_PRODUCTS[1].id);

    expect(result.products).toHaveLength(DEFAULT_PRODUCTS.length - 1);
    expect(result.products.some((product) => product.id === DEFAULT_PRODUCTS[1].id)).toBe(false);
    expect(result.selectedProductId).toBe(DEFAULT_PRODUCTS[2].id);
  });

  it('keeps the final product so the app always has an editable template', () => {
    const result = deleteProductTemplate([DEFAULT_PRODUCTS[0]], DEFAULT_PRODUCTS[0].id);

    expect(result.products).toHaveLength(1);
    expect(result.selectedProductId).toBe(DEFAULT_PRODUCTS[0].id);
    expect(result.deleted).toBe(false);
  });
});
