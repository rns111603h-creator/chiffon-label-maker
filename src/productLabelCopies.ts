import { PDFDocument } from 'pdf-lib';

export const MIN_PRODUCT_LABEL_COPIES = 1;
export const MAX_PRODUCT_LABEL_COPIES = 50;

export function normalizeProductLabelCopies(value: number): number {
  if (!Number.isFinite(value)) return MIN_PRODUCT_LABEL_COPIES;

  const copies = Math.floor(value);
  return Math.min(MAX_PRODUCT_LABEL_COPIES, Math.max(MIN_PRODUCT_LABEL_COPIES, copies));
}

export async function buildRepeatedProductLabelPdf(
  sourceBytes: Uint8Array | ArrayBuffer,
  copies: number,
): Promise<Uint8Array> {
  const normalizedCopies = normalizeProductLabelCopies(copies);
  const sourcePdf = await PDFDocument.load(sourceBytes);
  const outputPdf = await PDFDocument.create();

  for (let copyIndex = 0; copyIndex < normalizedCopies; copyIndex += 1) {
    const sourcePageIndices = sourcePdf.getPageIndices();
    const pages = await outputPdf.copyPages(sourcePdf, sourcePageIndices);
    for (const page of pages) {
      outputPdf.addPage(page);
    }
  }

  return outputPdf.save();
}
