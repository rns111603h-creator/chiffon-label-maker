import { describe, expect, it } from 'vitest';
import { DEFAULT_PAPER_LAYOUT } from '../src/layout';
import { DEFAULT_PRODUCTS } from '../src/products';
import { validateJob, validatePaperLayout } from '../src/validation';

describe('validation', () => {
  it('accepts a simple all-labels same-date job', () => {
    const result = validateJob({
      product: DEFAULT_PRODUCTS[0],
      expiryDate: '2026-07-10',
      labelCount: 20,
      paperLayout: DEFAULT_PAPER_LAYOUT,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects missing expiry dates and invalid label counts', () => {
    const result = validateJob({
      product: DEFAULT_PRODUCTS[0],
      expiryDate: '',
      labelCount: 0,
      paperLayout: DEFAULT_PAPER_LAYOUT,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('消費期限を選択してください。');
    expect(result.errors).toContain('印刷するシール数は1枚以上にしてください。');
  });

  it('validates label paper measurements from the package label', () => {
    const result = validatePaperLayout({
      ...DEFAULT_PAPER_LAYOUT,
      marginLeftMm: -1,
      labelWidthMm: 0,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('左余白は0mm以上で入力してください。');
    expect(result.errors).toContain('ラベル幅は1mm以上で入力してください。');
  });

  it('shows a red error when text would require a larger label than the current maximum', () => {
    const result = validateJob({
      product: {
        ...DEFAULT_PRODUCTS[0],
        nutritionLines: [
          'エネルギー：159Kcal、たんぱく質4.0g、脂質：5.2g、炭水化物24.2g、糖質22.0g、食物繊維2.2g',
          '食塩相当量0.1g　サンプル品分析による推定値　製造条件により数値が前後する場合があります　詳しくは別紙を確認してください',
        ],
      },
      expiryDate: '2026-07-10',
      labelCount: 20,
      paperLayout: DEFAULT_PAPER_LAYOUT,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      '文字数が多すぎます。現行ラベルの最大サイズに収まらないため、原材料名・栄養成分・注記を短くしてください。',
    );
  });
});
