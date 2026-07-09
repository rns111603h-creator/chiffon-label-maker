import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadPaperLayout, loadProducts } from '../src/storage';

describe('stored paper layout migration', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('migrates the previous default label size to the source PDF geometry', () => {
    const getItem = vi.fn().mockReturnValue(
      JSON.stringify({
        id: 'current-chiffon-a4-20',
        name: '現行シフォン裏シール A4 20面',
        pageWidthMm: 297,
        pageHeightMm: 210,
        marginLeftMm: 22.2,
        marginTopMm: 20.1,
        labelWidthMm: 48.8,
        labelHeightMm: 23.4,
        horizontalPitchMm: 51,
        verticalPitchMm: 43.2,
        columns: 5,
        rows: 4,
        autoFitLongText: false,
      }),
    );
    vi.stubGlobal('localStorage', {
      getItem,
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });

    expect(loadPaperLayout()).toMatchObject({
      labelHeightMm: 21.4,
      horizontalPitchMm: 50.8,
    });
  });
});

describe('stored product migration', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('adds sweet potato and removes retired built-in placeholders from saved products', () => {
    const getItem = vi.fn().mockReturnValue(
      JSON.stringify([
        staleProduct('plain', 'プレーン'),
        staleProduct('maple', 'メープル'),
        staleProduct('seasonal', '季節限定'),
      ]),
    );
    vi.stubGlobal('localStorage', {
      getItem,
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });

    const products = loadProducts();

    expect(products.map((product) => product.name)).toEqual(['プレーン', 'さつまいも']);
    expect(products.find((product) => product.id === 'sweet-potato')?.nutritionLines.join(' ')).toContain(
      '141.6Kcal',
    );
  });

  it('updates saved sweet potato nutrition line breaks', () => {
    const oldSweetPotato = staleProduct('sweet-potato', 'さつまいも');
    oldSweetPotato.nutritionLines = [
      'エネルギー：141.6Kcal、たんぱく質4.2g、脂質：5.3g',
      '炭水化物 19.7g　食塩相当量0.1g　サンプル品分析による推定値',
    ];
    const getItem = vi.fn().mockReturnValue(JSON.stringify([oldSweetPotato]));
    vi.stubGlobal('localStorage', {
      getItem,
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });

    const sweetPotato = loadProducts().find((product) => product.id === 'sweet-potato');

    expect(sweetPotato?.nutritionLines[0]).toBe('エネルギー：141.6Kcal、たんぱく質4.2g');
    expect(sweetPotato?.nutritionLines[1]).toBe('脂質：5.3g、炭水化物 19.7g');
    expect(sweetPotato?.nutritionLines[2]).toBe('食塩相当量0.1g　サンプル品分析による推定値');
  });
});

function staleProduct(id: string, name: string) {
  return {
    id,
    name,
    displayName: `シフォンケーキ（${name}）`,
    ingredients: ['卵（沖縄県産）・砂糖・薄力粉・豆乳・オイル'],
    allergenLine: '（一部に卵・小麦・大豆・乳成分を含む）',
    amount: '1個',
    storageMethod: '要冷蔵（10℃以下）',
    seller: '株式会社アソシア',
    sellerAddressLine: '北谷町北前1-10-8    098-923-0291',
    nutritionTitle: '◆栄養成分表示（1個当たり：45g）',
    nutritionLines: ['エネルギー：159Kcal'],
    noteLines: ['品質には問題ありません。'],
  };
}
