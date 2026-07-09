import { describe, expect, it } from 'vitest';
import { createLabelTextPlan, estimateLabelUsageHeightMm } from '../src/labelTextPlan';
import { DEFAULT_PRODUCTS } from '../src/products';

describe('createLabelTextPlan', () => {
  it('left-aligns ingredient and nutrition body text', () => {
    const plan = createLabelTextPlan(DEFAULT_PRODUCTS[0], '2026-07-10');

    expect(plan.find((item) => item.text.includes('砂糖・薄力粉'))).toMatchObject({
      align: 'left',
    });
    expect(plan.find((item) => item.text.includes('エネルギー'))).toMatchObject({
      align: 'left',
    });
  });

  it('keeps seller text left-aligned', () => {
    const plan = createLabelTextPlan(DEFAULT_PRODUCTS[0], '2026-07-10');

    expect(plan.find((item) => item.text === '株式会社アソシア')).toMatchObject({
      align: 'left',
    });
    expect(plan.find((item) => item.text.includes('098-923-0291'))).toMatchObject({
      align: 'left',
    });
  });

  it('keeps seller address as the second line inside the seller field', () => {
    const plan = createLabelTextPlan(DEFAULT_PRODUCTS[0], '2026-07-10');
    const sellerName = plan.find((item) => item.text === '株式会社アソシア');
    const sellerAddress = plan.find((item) => item.text.includes('098-923-0291'));

    expect(sellerName).toBeDefined();
    expect(sellerAddress).toBeDefined();
    expect(sellerAddress).toMatchObject({
      xMm: 9.6,
      pt: 5.5,
      align: 'left',
    });
    expect(sellerAddress!.xMm).toBe(sellerName!.xMm);
    expect(sellerAddress!.yMm).toBeGreaterThan(sellerName!.yMm);
    expect(sellerAddress!.horizontalScale).toBeUndefined();
    expect(textBottomMm(sellerAddress!)).toBeLessThanOrEqual(21.4);
  });

  it('keeps seller lines naturally spaced inside the seller field', () => {
    const plan = createLabelTextPlan(DEFAULT_PRODUCTS[0], '2026-07-10');
    const sellerName = plan.find((item) => item.text === '株式会社アソシア');
    const sellerAddress = plan.find((item) => item.text.includes('098-923-0291'));

    expect(sellerName).toBeDefined();
    expect(sellerAddress).toBeDefined();
    expect(sellerAddress!.yMm - sellerName!.yMm).toBeGreaterThanOrEqual(2.0);
    expect(textBottomMm(sellerAddress!)).toBeLessThanOrEqual(21.4);
  });

  it('keeps storage method value spaced like other label-value rows', () => {
    const plan = createLabelTextPlan(DEFAULT_PRODUCTS[0], '2026-07-10');
    const storageLabel = plan.find((item) => item.text === '保存方法：');
    const storageValue = plan.find((item) => item.text === DEFAULT_PRODUCTS[0].storageMethod);

    expect(storageLabel).toBeDefined();
    expect(storageValue).toBeDefined();
    expect(storageValue!.xMm - storageLabel!.xMm).toBeCloseTo(10.6, 1);
  });

  it('wraps long nutrition text instead of leaving it on one cut-off line', () => {
    const product = {
      ...DEFAULT_PRODUCTS[0],
      nutritionLines: [
        'エネルギー：159Kcal、たんぱく質4.0g、脂質：5.2g、炭水化物 24.2g',
        '食塩相当量0.1g　サンプル品分析による推定値',
      ],
    };

    const plan = createLabelTextPlan(product, '2026-07-10');
    const nutritionItems = plan.filter(
      (item) =>
        item.text.includes('エネルギー') ||
        item.text.includes('炭水化物') ||
        item.text.includes('推定値'),
    );

    expect(nutritionItems.length).toBeGreaterThanOrEqual(3);
    expect(nutritionItems.every((item) => item.text.length <= 26)).toBe(true);
  });

  it('keeps wrapped nutrition lines far enough apart to avoid overlap', () => {
    const product = {
      ...DEFAULT_PRODUCTS[0],
      nutritionLines: [
        'エネルギー：159Kcal、たんぱく質4.0g、脂質：5.2g、炭水化物 24.2g、糖質 22.0g',
        '食塩相当量0.1g　サンプル品分析による推定値　製造条件により数値が前後する場合があります',
      ],
    };

    const plan = createLabelTextPlan(product, '2026-07-10');
    const nutritionItems = plan.filter((item) => item.pt === 4.35);
    const minimumGapMm = 4.35 * 0.3527777778 + 0.8;

    for (let index = 1; index < nutritionItems.length; index += 1) {
      expect(nutritionItems[index].yMm - nutritionItems[index - 1].yMm).toBeGreaterThanOrEqual(
        minimumGapMm,
      );
    }
  });

  it('does not split the sweet potato nutrition unit onto the next line', () => {
    const sweetPotato = DEFAULT_PRODUCTS.find((product) => product.id === 'sweet-potato');
    expect(sweetPotato).toBeDefined();

    const plan = createLabelTextPlan(sweetPotato!, '2026-07-10');
    const nutritionItems = plan.filter((item) => item.pt === 4.35);

    expect(nutritionItems).toHaveLength(3);
    expect(nutritionItems.some((item) => item.text.startsWith('g'))).toBe(false);
    expect(nutritionItems.map((item) => item.text).join(' ')).toContain('たんぱく質4.2g');
  });

  it('keeps sweet potato within the current PDF label usage height', () => {
    const sweetPotato = DEFAULT_PRODUCTS.find((product) => product.id === 'sweet-potato');
    expect(sweetPotato).toBeDefined();

    expect(estimateLabelUsageHeightMm(sweetPotato!)).toBe(38.7);
  });

  it('keeps allergen text below wrapped ingredient lines for long products', () => {
    const chocolate = DEFAULT_PRODUCTS.find((product) => product.id === 'chocolate');
    expect(chocolate).toBeDefined();

    const plan = createLabelTextPlan(chocolate!, '2026-07-10');
    const ingredientLines = ingredientItems(plan);
    const allergenLine = plan.find((item) => item.text === chocolate!.allergenLine);
    const lastIngredientLine = ingredientLines.at(-1);

    expect(ingredientLines.length).toBeGreaterThan(1);
    expect(allergenLine).toBeDefined();
    expect(lastIngredientLine).toBeDefined();
    expect(allergenLine!.yMm).toBeGreaterThanOrEqual(textBottomMm(lastIngredientLine!) + 0.1);
  });

  it('condenses long ingredient lines without shrinking ingredient text', () => {
    const chocolate = DEFAULT_PRODUCTS.find((product) => product.id === 'chocolate');
    expect(chocolate).toBeDefined();

    const plan = createLabelTextPlan(chocolate!, '2026-07-10');
    const ingredientLines = ingredientItems(plan);
    const allergenLine = plan.find((item) => item.text === chocolate!.allergenLine);

    expect(ingredientLines).toHaveLength(3);
    expect(ingredientLines.every((item) => item.pt === 5.5)).toBe(true);
    expect(ingredientLines.some((item) => (item.horizontalScale ?? 1) < 1)).toBe(true);
    expect(allergenLine?.pt).toBeLessThan(5.5);
  });

  it('keeps the tail of long ingredient text visible', () => {
    const chocolate = DEFAULT_PRODUCTS.find((product) => product.id === 'chocolate');
    expect(chocolate).toBeDefined();

    const plan = createLabelTextPlan(chocolate!, '2026-07-10');
    const ingredientText = plan
      .filter((item) => item.xMm === 11.4 && item.yMm < 10)
      .map((item) => item.text)
      .join('・');

    expect(ingredientText).toContain('乳化剤');
    expect(ingredientText).toContain('香料');
  });

  it('keeps the nutrition heading far enough above the first nutrition line', () => {
    const plan = createLabelTextPlan(DEFAULT_PRODUCTS[0], '2026-07-10');
    const heading = plan.find((item) => item.text === DEFAULT_PRODUCTS[0].nutritionTitle);
    const firstNutritionLine = plan.find((item) => item.pt === 4.35);

    expect(heading).toBeDefined();
    expect(firstNutritionLine).toBeDefined();
    expect(firstNutritionLine!.yMm - heading!.yMm).toBeGreaterThanOrEqual(
      heading!.pt * 0.3527777778 + 0.45,
    );
  });

  it('estimates taller label usage when text wraps to more lines', () => {
    const shortHeight = estimateLabelUsageHeightMm({
      ...DEFAULT_PRODUCTS[0],
      nutritionLines: ['エネルギー：159Kcal', '食塩相当量0.1g'],
    });
    const longHeight = estimateLabelUsageHeightMm({
      ...DEFAULT_PRODUCTS[0],
      nutritionLines: [
        'エネルギー：159Kcal、たんぱく質4.0g、脂質：5.2g、炭水化物 24.2g、糖質 22.0g',
        '食塩相当量0.1g　サンプル品分析による推定値　製造条件により数値が前後する場合があります',
      ],
    });

    expect(longHeight).toBeGreaterThan(shortHeight);
  });
});

function textBottomMm(item: { yMm: number; pt: number }): number {
  return item.yMm + item.pt * 0.3527777778;
}

function ingredientItems(plan: ReturnType<typeof createLabelTextPlan>) {
  return plan.filter((item) => item.xMm === 11.4 && item.yMm < 10);
}
