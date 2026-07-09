import { describe, expect, it } from 'vitest';
import { publicAssetPath } from '../src/assetPath';

describe('publicAssetPath', () => {
  it('joins Vite base URL and public asset path', () => {
    expect(publicAssetPath('chiffon.png')).toBe('/chiffon.png');
    expect(publicAssetPath('/chiffon.png')).toBe('/chiffon.png');
    expect(publicAssetPath('product-labels/plain.pdf')).toBe('/product-labels/plain.pdf');
  });
});
