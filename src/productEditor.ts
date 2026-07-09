import { normalizeIngredientText } from './labelTextPlan';
import { createProductDraft } from './products';
import type { ProductTemplate } from './types';

export type ProductTemplateEdits = {
  name: string;
  displayName: string;
  ingredientsText: string;
  allergenLine: string;
  amount: string;
  storageMethod: string;
  seller: string;
  sellerAddressLine: string;
  nutritionLinesText: string;
};

export function applyProductTemplateEdits(
  current: ProductTemplate,
  edits: ProductTemplateEdits,
): ProductTemplate {
  const product = createProductDraft(current);
  product.name = textOrCurrent(edits.name, product.name);
  product.displayName = textOrCurrent(edits.displayName, product.displayName);
  product.allergenLine = textOrCurrent(edits.allergenLine, product.allergenLine);
  product.amount = textOrCurrent(edits.amount, product.amount);
  product.storageMethod = textOrCurrent(edits.storageMethod, product.storageMethod);
  product.seller = textOrCurrent(edits.seller, product.seller);
  product.sellerAddressLine = textOrCurrent(edits.sellerAddressLine, product.sellerAddressLine);

  const ingredients = normalizeIngredientText(linesFromText(edits.ingredientsText));
  if (ingredients) {
    product.ingredients = [ingredients];
  }

  const nutritionLines = linesFromText(edits.nutritionLinesText);
  if (nutritionLines.length > 0) {
    product.nutritionLines = nutritionLines;
  }

  return product;
}

export function deleteProductTemplate(
  products: ProductTemplate[],
  selectedProductId: string,
): { products: ProductTemplate[]; selectedProductId: string; deleted: boolean } {
  if (products.length <= 1) {
    return {
      products,
      selectedProductId: products[0]?.id ?? '',
      deleted: false,
    };
  }

  const selectedIndex = products.findIndex((product) => product.id === selectedProductId);
  if (selectedIndex < 0) {
    return {
      products,
      selectedProductId: products[0]?.id ?? '',
      deleted: false,
    };
  }

  const nextProducts = products.filter((product) => product.id !== selectedProductId);
  const nextIndex = Math.min(selectedIndex, nextProducts.length - 1);

  return {
    products: nextProducts,
    selectedProductId: nextProducts[nextIndex]?.id ?? '',
    deleted: true,
  };
}

function textOrCurrent(value: string, current: string): string {
  return value.trim() || current;
}

function linesFromText(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
