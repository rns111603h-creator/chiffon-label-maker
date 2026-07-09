import { publicAssetPath } from './assetPath';

const STATUS_ICON_SRC = publicAssetPath('chiffon.png');

export function createStatusPopupHtml(message: string): string {
  return `
    <aside class="status-popup" role="status" aria-live="polite">
      <img class="status-popup-icon" src="${STATUS_ICON_SRC}" alt="" />
      <span class="status-popup-message">${escapeHtml(message)}</span>
      <button id="statusPopupCloseButton" class="status-popup-close" type="button" aria-label="メッセージを閉じる">×</button>
    </aside>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
