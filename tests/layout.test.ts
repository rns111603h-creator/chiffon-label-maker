import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PAPER_LAYOUT,
  createEffectivePaperLayout,
  getLabelRects,
  mmToPt,
  ptToMm,
} from '../src/layout';
import { DEFAULT_PRODUCTS } from '../src/products';

describe('paper layout', () => {
  it('converts millimeters to PDF points and back', () => {
    expect(mmToPt(25.4)).toBeCloseTo(72, 4);
    expect(ptToMm(72)).toBeCloseTo(25.4, 4);
  });

  it('generates the current 5 by 4 label sheet geometry', () => {
    const rects = getLabelRects(DEFAULT_PAPER_LAYOUT);

    expect(rects).toHaveLength(20);
    expect(rects[0]).toMatchObject({
      row: 0,
      col: 0,
      xMm: 22.2,
      yMm: 20.1,
      widthMm: 48.8,
      heightMm: 21.4,
    });
    expect(rects[4].xMm).toBeCloseTo(225.4, 1);
    expect(rects[19].yMm).toBeCloseTo(149.7, 1);
  });

  it('matches the rotated source PDF label size and pitch', () => {
    expect(DEFAULT_PAPER_LAYOUT).toMatchObject({
      marginLeftMm: 22.2,
      marginTopMm: 20.1,
      labelWidthMm: 48.8,
      labelHeightMm: 21.4,
      horizontalPitchMm: 50.8,
      verticalPitchMm: 43.2,
      columns: 5,
      rows: 4,
    });
  });

  it('keeps the fixed label sheet when auto fit is disabled', () => {
    const layout = createEffectivePaperLayout(DEFAULT_PAPER_LAYOUT, {
      ...DEFAULT_PRODUCTS[0],
      nutritionLines: [
        'エネルギー：159Kcal、たんぱく質4.0g、脂質：5.2g、炭水化物 24.2g',
        '食塩相当量0.1g　サンプル品分析による推定値',
      ],
    });

    expect(layout.rows).toBe(4);
    expect(layout.verticalPitchMm).toBe(DEFAULT_PAPER_LAYOUT.verticalPitchMm);
  });

  it('does not enlarge labels beyond the current physical sheet size', () => {
    const layout = createEffectivePaperLayout(
      {
        ...DEFAULT_PAPER_LAYOUT,
        autoFitLongText: true,
      },
      {
        ...DEFAULT_PRODUCTS[0],
        nutritionLines: [
          'エネルギー：159Kcal、たんぱく質4.0g、脂質：5.2g、炭水化物 24.2g、糖質 22.0g',
          '食塩相当量0.1g　サンプル品分析による推定値　製造条件により数値が前後する場合があります',
        ],
      },
    );

    expect(layout.verticalPitchMm).toBe(DEFAULT_PAPER_LAYOUT.verticalPitchMm);
    expect(layout.labelHeightMm).toBe(DEFAULT_PAPER_LAYOUT.labelHeightMm);
    expect(layout.rows).toBe(DEFAULT_PAPER_LAYOUT.rows);
    expect(getLabelRects(layout).length).toBe(layout.columns * layout.rows);
  });
});
