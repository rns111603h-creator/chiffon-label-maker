import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPdfPreviewUrl } from '../src/download';

describe('PDF object URLs', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a preview URL without clicking a download link', () => {
    const createObjectUrl = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:preview-url');

    const url = createPdfPreviewUrl(new Uint8Array([1, 2, 3]));

    expect(url).toBe('blob:preview-url');
    expect(createObjectUrl).toHaveBeenCalledOnce();
  });
});
