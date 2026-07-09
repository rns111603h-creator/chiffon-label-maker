import { describe, expect, it } from 'vitest';
import { createStatusPopupHtml } from '../src/statusPopup';

describe('createStatusPopupHtml', () => {
  it('renders a popup status with the chiffon icon', () => {
    const html = createStatusPopupHtml('商品テンプレートを保存しました。');

    expect(html).toContain('class="status-popup"');
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('src="/chiffon.png"');
    expect(html).toContain('商品テンプレートを保存しました。');
    expect(html).toContain('id="statusPopupCloseButton"');
  });

  it('escapes message text', () => {
    const html = createStatusPopupHtml('保存しました。<script>');

    expect(html).toContain('保存しました。&lt;script&gt;');
    expect(html).not.toContain('保存しました。<script>');
  });
});
