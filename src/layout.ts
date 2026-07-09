import type { LabelRect, PaperLayout } from './types';
import type { ProductTemplate } from './types';

const PT_PER_MM = 72 / 25.4;

export const A4_LANDSCAPE_WIDTH_PT = 841.89;
export const A4_LANDSCAPE_HEIGHT_PT = 595.276;

export const DEFAULT_PAPER_LAYOUT: PaperLayout = {
  id: 'current-chiffon-a4-20',
  name: '現行シフォン裏シール A4 20面',
  pageWidthMm: 297,
  pageHeightMm: 210,
  marginLeftMm: 22.2,
  marginTopMm: 20.1,
  labelWidthMm: 48.8,
  labelHeightMm: 21.4,
  horizontalPitchMm: 50.8,
  verticalPitchMm: 43.2,
  columns: 5,
  rows: 4,
  autoFitLongText: false,
};

export function mmToPt(mm: number): number {
  return mm * PT_PER_MM;
}

export function ptToMm(pt: number): number {
  return pt / PT_PER_MM;
}

export function getLabelRects(layout: PaperLayout): LabelRect[] {
  const rects: LabelRect[] = [];

  for (let row = 0; row < layout.rows; row += 1) {
    for (let col = 0; col < layout.columns; col += 1) {
      rects.push({
        index: rects.length,
        row,
        col,
        xMm: roundMm(layout.marginLeftMm + col * layout.horizontalPitchMm),
        yMm: roundMm(layout.marginTopMm + row * layout.verticalPitchMm),
        widthMm: layout.labelWidthMm,
        heightMm: layout.labelHeightMm,
      });
    }
  }

  return rects;
}

export function sheetCapacity(layout: PaperLayout): number {
  return layout.columns * layout.rows;
}

export function createEffectivePaperLayout(
  layout: PaperLayout,
  product: ProductTemplate,
): PaperLayout {
  const sanitized = sanitizePaperLayout(layout);
  void product;
  return sanitized;
}

export function sanitizePaperLayout(layout: PaperLayout): PaperLayout {
  return {
    ...layout,
    pageWidthMm: clamp(layout.pageWidthMm, 1, 1000),
    pageHeightMm: clamp(layout.pageHeightMm, 1, 1000),
    marginLeftMm: clamp(layout.marginLeftMm, 0, layout.pageWidthMm),
    marginTopMm: clamp(layout.marginTopMm, 0, layout.pageHeightMm),
    labelWidthMm: clamp(layout.labelWidthMm, 1, layout.pageWidthMm),
    labelHeightMm: clamp(layout.labelHeightMm, 1, layout.pageHeightMm),
    horizontalPitchMm: clamp(layout.horizontalPitchMm, 1, layout.pageWidthMm),
    verticalPitchMm: clamp(layout.verticalPitchMm, 1, layout.pageHeightMm),
    columns: Math.max(1, Math.floor(layout.columns)),
    rows: Math.max(1, Math.floor(layout.rows)),
  };
}

function roundMm(value: number): number {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
