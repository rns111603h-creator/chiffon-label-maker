import type { LabelRenderInput, ProductTemplate } from './types';
import { createLabelTextPlan, estimateLabelUsageHeightMm } from './labelTextPlan';
import { LABEL_FRAME_HEIGHT_MM, LABEL_FRAME_ROW_LINES_MM } from './labelFrame';

const PX_PER_MM = 10;
const MIN_USAGE_HEIGHT_MM = 38.7;
const CURRENT_MAX_USAGE_HEIGHT_MM = 42.2;
const FONT_STACK =
  '"KozGoPr6N-Regular", "Kozuka Gothic Pr6N", "Yu Gothic", "Hiragino Sans", "Meiryo", sans-serif';

export async function renderLabelToPng(input: LabelRenderInput): Promise<Uint8Array> {
  const usageHeightMm = getUsageHeightMm(input.product, input.rect.heightMm);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(input.rect.widthMm * PX_PER_MM);
  canvas.height = Math.round(usageHeightMm * PX_PER_MM);

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('ラベル描画の準備に失敗しました。');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#111111';
  context.fillStyle = '#111111';
  context.lineWidth = Math.max(1, 0.17 * PX_PER_MM);
  context.textBaseline = 'top';

  drawFrame(context, input.rect.widthMm, input.rect.heightMm);
  drawProductText(context, input.product, input.expiryDate);

  return canvasToPngBytes(canvas);
}

export function makePreviewDataUrl(
  product: ProductTemplate,
  expiryDate: string,
  labelWidthMm = 48.8,
  labelHeightMm = 23.4,
): string {
  const usageHeightMm = getUsageHeightMm(product, labelHeightMm);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(labelWidthMm * PX_PER_MM * 2);
  canvas.height = Math.round(usageHeightMm * PX_PER_MM * 2);
  const context = canvas.getContext('2d');
  if (!context) return '';

  context.scale(2, 2);
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, labelWidthMm * PX_PER_MM, usageHeightMm * PX_PER_MM);
  context.strokeStyle = '#111111';
  context.fillStyle = '#111111';
  context.lineWidth = Math.max(1, 0.17 * PX_PER_MM);
  context.textBaseline = 'top';
  drawFrame(context, labelWidthMm, labelHeightMm);
  drawProductText(context, product, expiryDate);

  return canvas.toDataURL('image/png');
}

function drawFrame(context: CanvasRenderingContext2D, widthMm: number, heightMm: number): void {
  context.strokeRect(0, 0, mm(widthMm), mm(Math.max(LABEL_FRAME_HEIGHT_MM, heightMm)));

  for (const yMm of LABEL_FRAME_ROW_LINES_MM) {
    line(context, 0, yMm, widthMm, yMm);
  }

  line(context, 14.6, 11.7, 14.6, 14.7);
}

function drawProductText(
  context: CanvasRenderingContext2D,
  product: ProductTemplate,
  expiryDate: string,
): void {
  createLabelTextPlan(product, expiryDate).forEach((item) => {
    drawText(context, item.text, item.xMm, item.yMm, item.pt, item.align, item.horizontalScale ?? 1);
  });
}

function drawText(
  context: CanvasRenderingContext2D,
  text: string,
  xMm: number,
  yMm: number,
  pt: number,
  align: CanvasTextAlign = 'left',
  horizontalScale = 1,
): void {
  context.font = `${ptToCanvasPx(pt)}px ${FONT_STACK}`;
  context.textAlign = align;
  if (horizontalScale === 1) {
    context.fillText(text, mm(xMm), mm(yMm));
    return;
  }

  context.save();
  context.translate(mm(xMm), 0);
  context.scale(horizontalScale, 1);
  context.fillText(text, 0, mm(yMm));
  context.restore();
}

function line(
  context: CanvasRenderingContext2D,
  x1Mm: number,
  y1Mm: number,
  x2Mm: number,
  y2Mm: number,
): void {
  context.beginPath();
  context.moveTo(mm(x1Mm), mm(y1Mm));
  context.lineTo(mm(x2Mm), mm(y2Mm));
  context.stroke();
}

function mm(value: number): number {
  return value * PX_PER_MM;
}

function ptToCanvasPx(pt: number): number {
  return pt * 0.3527777778 * PX_PER_MM;
}

function getUsageHeightMm(product: ProductTemplate, labelHeightMm: number): number {
  return Math.min(
    CURRENT_MAX_USAGE_HEIGHT_MM,
    Math.max(MIN_USAGE_HEIGHT_MM, labelHeightMm, estimateLabelUsageHeightMm(product)),
  );
}

function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('ラベル画像の作成に失敗しました。'));
        return;
      }

      blob
        .arrayBuffer()
        .then((buffer) => resolve(new Uint8Array(buffer)))
        .catch(reject);
    }, 'image/png');
  });
}
