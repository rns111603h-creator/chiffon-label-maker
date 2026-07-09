import { PDFDocument, rgb } from 'pdf-lib';
import {
  A4_LANDSCAPE_HEIGHT_PT,
  A4_LANDSCAPE_WIDTH_PT,
  createEffectivePaperLayout,
  getLabelRects,
  mmToPt,
  sheetCapacity,
} from './layout';
import { LABEL_FRAME_ROW_LINES_MM } from './labelFrame';
import type { LabelJob, LabelRenderInput } from './types';

type LabelImageRenderer = (input: LabelRenderInput) => Promise<Uint8Array>;

type BuildLabelPdfOptions = {
  renderLabelImage?: LabelImageRenderer;
};

export async function buildLabelPdf(
  job: LabelJob,
  options: BuildLabelPdfOptions = {},
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const paperLayout = createEffectivePaperLayout(job.paperLayout, job.product);
  const capacity = sheetCapacity(paperLayout);
  const pageCount = Math.ceil(job.labelCount / capacity);
  const rects = getLabelRects(paperLayout);

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    const page = pdf.addPage([A4_LANDSCAPE_WIDTH_PT, A4_LANDSCAPE_HEIGHT_PT]);
    const labelsOnPage = Math.min(capacity, job.labelCount - pageIndex * capacity);

    for (let labelIndex = 0; labelIndex < labelsOnPage; labelIndex += 1) {
      const rect = rects[labelIndex];

      if (options.renderLabelImage) {
        const pngBytes = await options.renderLabelImage({
          product: job.product,
          expiryDate: job.expiryDate,
          paperLayout,
          rect,
        });
        const image = await pdf.embedPng(pngBytes);
        const usageHeightMm = paperLayout.verticalPitchMm - 4.5;
        page.drawImage(image, {
          x: mmToPt(rect.xMm),
          y: A4_LANDSCAPE_HEIGHT_PT - mmToPt(rect.yMm + usageHeightMm),
          width: mmToPt(rect.widthMm),
          height: mmToPt(usageHeightMm),
        });
      } else {
        drawEmptyLabelFrame(page, rect.xMm, rect.yMm, rect.widthMm, rect.heightMm);
      }
    }
  }

  return pdf.save();
}

function drawEmptyLabelFrame(
  page: import('pdf-lib').PDFPage,
  xMm: number,
  yMm: number,
  widthMm: number,
  heightMm: number,
): void {
  const x = mmToPt(xMm);
  const y = A4_LANDSCAPE_HEIGHT_PT - mmToPt(yMm + heightMm);
  const width = mmToPt(widthMm);
  const height = mmToPt(heightMm);
  const lineColor = rgb(0, 0, 0);

  page.drawRectangle({
    x,
    y,
    width,
    height,
    borderColor: lineColor,
    borderWidth: 0.5,
  });

  for (const offsetMm of LABEL_FRAME_ROW_LINES_MM) {
    const lineY = A4_LANDSCAPE_HEIGHT_PT - mmToPt(yMm + offsetMm);
    page.drawLine({
      start: { x, y: lineY },
      end: { x: x + width, y: lineY },
      thickness: 0.5,
      color: lineColor,
    });
  }

  const splitX = x + mmToPt(14.6);
  const splitTop = A4_LANDSCAPE_HEIGHT_PT - mmToPt(yMm + 11.7);
  const splitBottom = A4_LANDSCAPE_HEIGHT_PT - mmToPt(yMm + 14.7);
  page.drawLine({
    start: { x: splitX, y: splitTop },
    end: { x: splitX, y: splitBottom },
    thickness: 0.5,
    color: lineColor,
  });
}
