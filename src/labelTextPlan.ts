import type { ProductTemplate } from './types';
import { SELLER_SECOND_LINE_Y_MM, SELLER_TEXT_TOP_MM } from './labelFrame';

export type LabelTextAlign = 'left' | 'right';

export type LabelTextItem = {
  text: string;
  xMm: number;
  yMm: number;
  pt: number;
  align: LabelTextAlign;
  horizontalScale?: number;
};

const NUTRITION_LINE_HEIGHT_MM = 2.4;
const NOTE_LINE_HEIGHT_MM = 1.85;
const MIN_USAGE_HEIGHT_MM = 38.7;
const INGREDIENT_START_Y_MM = 4.0;

export function createLabelTextPlan(
  product: ProductTemplate,
  expiryDate: string,
): LabelTextItem[] {
  const ingredientText = normalizeIngredientText(product.ingredients);
  const ingredientLayout = ingredientText.length > 50
    ? { maxChars: 32, maxLines: 3, pt: 5.5, lineHeightMm: 2.0, horizontalScale: 0.62 }
    : { maxChars: 19, maxLines: 3, pt: 5.5, lineHeightMm: 3.0, horizontalScale: 1 };
  const ingredients = wrapJapaneseText(
    ingredientText,
    ingredientLayout.maxChars,
    ingredientLayout.maxLines,
  );
  const nutritionMaxChars = product.id === 'sweet-potato' ? 25 : 24;
  const nutritionLines = product.nutritionLines.flatMap((line) =>
    wrapJapaneseText(line, nutritionMaxChars, 12),
  );
  const allergenPt = ingredients.length >= 3 ? 4.5 : 5.5;
  const allergenY = Math.max(
    9.2,
    INGREDIENT_START_Y_MM +
      Math.max(0, ingredients.length - 1) * ingredientLayout.lineHeightMm +
      ingredientLayout.pt * 0.3527777778 +
      0.12,
  );
  const amountY = Math.max(12.0, allergenY + allergenPt * 0.3527777778 + 0.25);
  const storageY = amountY + 3.0;
  const sellerY = Math.max(SELLER_TEXT_TOP_MM, storageY + 2.2);
  const sellerAddressY = sellerY + (SELLER_SECOND_LINE_Y_MM - SELLER_TEXT_TOP_MM);
  const nutritionTitleY = sellerAddressY + 2.35;
  const nutritionStartY = nutritionTitleY + 2.6;
  const noteStartY = nutritionStartY + nutritionLines.length * NUTRITION_LINE_HEIGHT_MM + 0.55;

  return [
    left(`名称：${product.displayName}`, 0.8, 0.8, 6),
    left('原材料名：', 0.8, INGREDIENT_START_Y_MM, 6),
    ...leftLines(
      ingredients,
      11.4,
      INGREDIENT_START_Y_MM,
      ingredientLayout.pt,
      ingredientLayout.lineHeightMm,
      ingredientLayout.horizontalScale,
    ),
    left(product.allergenLine, 0.8, allergenY, allergenPt),
    left('内容量：', 0.8, amountY, 6),
    left(product.amount, 8.8, amountY + 0.1, 5.5),
    left('消費期限：', 16.0, amountY, 6),
    left(formatExpiryDate(expiryDate), 27.2, amountY + 0.1, 5.5),
    left('保存方法：', 0.8, storageY, 6),
    left(product.storageMethod, 11.4, storageY + 0.1, 5.5),
    left('販売者：', 0.8, sellerY, 6),
    left(product.seller, 9.6, sellerY + 0.1, 5.5),
    left(product.sellerAddressLine, 9.6, sellerAddressY, 5.5),
    left(product.nutritionTitle, 0.8, nutritionTitleY, 6),
    ...leftLines(nutritionLines, 0.8, nutritionStartY, 4.35, NUTRITION_LINE_HEIGHT_MM),
    ...leftLines(product.noteLines, 0.8, noteStartY, 3.85, NOTE_LINE_HEIGHT_MM),
  ];
}

export function estimateLabelUsageHeightMm(product: ProductTemplate): number {
  const plan = createLabelTextPlan(product, '2026-01-01');
  const bottomMm = plan.reduce((bottom, item) => {
    const lineHeightMm = item.pt * 0.3527777778 + 0.8;
    return Math.max(bottom, item.yMm + lineHeightMm);
  }, 0);

  return Math.max(MIN_USAGE_HEIGHT_MM, Math.ceil((bottomMm + 0.8) * 10) / 10);
}

export function normalizeIngredientText(lines: string[]): string {
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .join('・')
    .replace(/・{2,}/g, '・')
    .replace(/^・|・$/g, '');
}

function leftLines(
  lines: string[],
  xMm: number,
  yMm: number,
  pt: number,
  lineHeightMm: number,
  horizontalScale = 1,
): LabelTextItem[] {
  return lines.map((line, index) =>
    left(line, xMm, yMm + index * lineHeightMm, pt, horizontalScale),
  );
}

function left(
  text: string,
  xMm: number,
  yMm: number,
  pt: number,
  horizontalScale = 1,
): LabelTextItem {
  return {
    text,
    xMm,
    yMm,
    pt,
    align: 'left',
    ...(horizontalScale !== 1 ? { horizontalScale } : {}),
  };
}

function wrapJapaneseText(text: string, maxChars: number, maxLines: number): string[] {
  if (text.length <= maxChars) return [text];

  const tokens = text.split('・').filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.length > maxChars) {
      if (current) {
        lines.push(current);
        current = '';
      }
      const chunks = splitEvery(token, maxChars);
      lines.push(...chunks.slice(0, Math.max(0, maxLines - lines.length)));
      if (lines.length >= maxLines) break;
      continue;
    }

    const next = current ? `${current}・${token}` : token;
    if (next.length <= maxChars || !current) {
      current = next;
      continue;
    }

    lines.push(current);
    current = token;

    if (lines.length === maxLines - 1) {
      const remaining = tokens.slice(index + 1);
      if (remaining.length > 0) {
        current = [current, ...remaining].join('・');
      }
      break;
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  return lines;
}

function splitEvery(text: string, size: number): string[] {
  const chunks: string[] = [];
  for (let index = 0; index < text.length; index += size) {
    chunks.push(text.slice(index, index + size));
  }
  return chunks;
}

function formatExpiryDate(value: string): string {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${year}.${Number(month)}.${Number(day)}`;
}
