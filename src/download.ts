export function createPdfPreviewUrl(bytes: Uint8Array): string {
  return createObjectUrl(bytes, 'application/pdf');
}

export function downloadBytes(bytes: Uint8Array, fileName: string, mimeType: string): string {
  const url = createObjectUrl(bytes, mimeType);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  return url;
}

export function safeFileName(value: string): string {
  return value.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_');
}

function createObjectUrl(bytes: Uint8Array, mimeType: string): string {
  const arrayBuffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(arrayBuffer).set(bytes);
  const blob = new Blob([arrayBuffer], { type: mimeType });
  return URL.createObjectURL(blob);
}
