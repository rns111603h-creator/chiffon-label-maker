import { describe, expect, it } from 'vitest';
import { DEFAULT_PRODUCTS, createProductDraft } from '../src/products';

describe('product templates', () => {
  it('ships with SharePoint back-label templates and leaves room for growth', () => {
    expect(DEFAULT_PRODUCTS).toHaveLength(14);
    expect(DEFAULT_PRODUCTS.map((product) => product.name)).toEqual(
      expect.arrayContaining([
        'アップルシナモン',
        'さつまいも',
        'パイナップル',
        'ラズベリー',
        'オレンジヨーグルト',
      ]),
    );
    expect(DEFAULT_PRODUCTS.map((product) => product.name)).not.toContain('季節限定');
    expect(DEFAULT_PRODUCTS.map((product) => product.name)).not.toContain('メープル');
  });

  it('keeps product-specific nutrition and ingredient details from labels', () => {
    const earlGrey = DEFAULT_PRODUCTS.find((product) => product.id === 'earl-grey');
    const chocolate = DEFAULT_PRODUCTS.find((product) => product.id === 'chocolate');
    const sweetPotato = DEFAULT_PRODUCTS.find((product) => product.id === 'sweet-potato');

    expect(earlGrey?.name).toBe('アールグレイ');
    expect(earlGrey?.nutritionTitle).toBe('◆栄養成分表示（1個当たり：40g）');
    expect(chocolate?.ingredients.join('・')).toContain(
      'チョコレート（砂糖・カカオマス・ココアパウダー）',
    );
    expect(chocolate?.nutritionLines.join(' ')).toContain('170Kcal');
    expect(sweetPotato).toMatchObject({
      name: 'さつまいも',
      displayName: 'シフォンケーキ（さつまいも）',
    });
    expect(sweetPotato?.nutritionLines.join(' ')).toContain('エネルギー：141.6Kcal');
    expect(sweetPotato?.nutritionLines.join(' ')).toContain('たんぱく質4.2g');
    expect(sweetPotato?.nutritionLines.join(' ')).toContain('脂質：5.3g');
    expect(sweetPotato?.nutritionLines.join(' ')).toContain('炭水化物 19.7g');
    expect(sweetPotato?.nutritionLines.join(' ')).toContain('食塩相当量0.1g');
  });

  it('creates editable drafts without mutating built-in templates', () => {
    const draft = createProductDraft(DEFAULT_PRODUCTS[0]);
    draft.name = '変更後';

    expect(DEFAULT_PRODUCTS[0].name).not.toBe('変更後');
    expect(draft.id).toBe(DEFAULT_PRODUCTS[0].id);
  });
});
