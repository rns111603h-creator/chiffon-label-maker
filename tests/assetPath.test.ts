import { describe, expect, it } from 'vitest';
import { publicAssetPath } from '../src/assetPath';

describe('publicAssetPath', () => {
  it('joins Vite base URL and public asset path', () => {
    const baseUrl = import.meta.env.BASE_URL;

    expect(publicAssetPath('chiffon.png')).toBe(`${baseUrl}chiffon.png`);
    expect(publicAssetPath('/chiffon.png')).toBe(`${baseUrl}chiffon.png`);
    expect(publicAssetPath('product-labels/plain.pdf')).toBe(
      `${baseUrl}product-labels/plain.pdf`,
    );
  });
});
