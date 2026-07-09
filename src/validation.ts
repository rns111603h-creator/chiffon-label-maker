import { sheetCapacity } from './layout';
import { estimateLabelUsageHeightMm } from './labelTextPlan';
import type { LabelJob, PaperLayout, ProductTemplate, ValidationResult } from './types';

export function validateJob(job: LabelJob): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!job.product.name.trim()) {
    errors.push('商品を選択してください。');
  }

  if (!job.expiryDate) {
    errors.push('消費期限を選択してください。');
  }

  if (!Number.isFinite(job.labelCount) || job.labelCount < 1) {
    errors.push('印刷するシール数は1枚以上にしてください。');
  }

  if (job.labelCount > sheetCapacity(job.paperLayout) * 10) {
    warnings.push('10シートを超えます。印刷前に枚数を確認してください。');
  }

  const productResult = validateProduct(job.product);
  errors.push(...productResult.errors);
  warnings.push(...productResult.warnings);

  const layoutResult = validatePaperLayout(job.paperLayout);
  errors.push(...layoutResult.errors);
  warnings.push(...layoutResult.warnings);

  if (estimateLabelUsageHeightMm(job.product) > getMaxCurrentUsageHeightMm(job.paperLayout)) {
    errors.push(
      '文字数が多すぎます。現行ラベルの最大サイズに収まらないため、原材料名・栄養成分・注記を短くしてください。',
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}

function getMaxCurrentUsageHeightMm(layout: PaperLayout): number {
  return layout.verticalPitchMm - 1.0;
}

export function validateProduct(product: ProductTemplate): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!product.displayName.trim()) {
    errors.push('商品名を入力してください。');
  }

  if (product.ingredients.every((line) => !line.trim())) {
    errors.push('原材料名を入力してください。');
  }

  if (!product.seller.trim()) {
    errors.push('販売者を入力してください。');
  }

  if (product.ingredients.join('').length > 80) {
    warnings.push('原材料名が長めです。プレビューで文字の収まりを確認してください。');
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validatePaperLayout(layout: PaperLayout): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  addMinError(errors, layout.marginLeftMm, 0, '左余白');
  addMinError(errors, layout.marginTopMm, 0, '上余白');
  addMinError(errors, layout.labelWidthMm, 1, 'ラベル幅');
  addMinError(errors, layout.labelHeightMm, 1, 'ラベル高さ');
  addMinError(errors, layout.horizontalPitchMm, 1, '横間隔');
  addMinError(errors, layout.verticalPitchMm, 1, '縦間隔');

  if (layout.columns < 1 || !Number.isInteger(layout.columns)) {
    errors.push('列数は1以上の整数で入力してください。');
  }

  if (layout.rows < 1 || !Number.isInteger(layout.rows)) {
    errors.push('行数は1以上の整数で入力してください。');
  }

  const rightEdge =
    layout.marginLeftMm + (layout.columns - 1) * layout.horizontalPitchMm + layout.labelWidthMm;
  const bottomEdge =
    layout.marginTopMm + (layout.rows - 1) * layout.verticalPitchMm + layout.labelHeightMm;

  if (rightEdge > layout.pageWidthMm) {
    warnings.push('ラベルが用紙の右端を超える可能性があります。');
  }

  if (bottomEdge > layout.pageHeightMm) {
    warnings.push('ラベルが用紙の下端を超える可能性があります。');
  }

  return { valid: errors.length === 0, errors, warnings };
}

function addMinError(errors: string[], value: number, min: number, label: string): void {
  if (!Number.isFinite(value) || value < min) {
    errors.push(`${label}は${min}mm以上で入力してください。`);
  }
}
