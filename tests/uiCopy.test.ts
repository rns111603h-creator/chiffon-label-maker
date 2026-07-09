import { describe, expect, it } from 'vitest';
import { EDITABLE_SETTINGS_COPY } from '../src/uiCopy';

describe('editable settings copy', () => {
  it('describes product and paper settings as editable by any user', () => {
    expect(EDITABLE_SETTINGS_COPY.summary).toBe('商品データ・用紙設定');
    expect(EDITABLE_SETTINGS_COPY.productHeading).toBe('商品データの編集');
    expect(EDITABLE_SETTINGS_COPY.paperHeading).toBe('ラベル用紙の設定');
    expect(Object.values(EDITABLE_SETTINGS_COPY).join('')).not.toContain('管理者');
  });
});
