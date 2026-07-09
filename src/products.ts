import type { ProductTemplate } from './types';

const COMMON_SELLER = '株式会社アソシア';
const COMMON_ADDRESS = '北谷町北前1-10-8    098-923-0291';
const COMMON_NOTE = [
  '※原材料由来の黒い点（植物片）が見られることがありますが、',
  '品質には問題ありません。',
];
const COMMON_NUTRITION_TITLE_45G = '◆栄養成分表示（1個当たり：45g）';
const COMMON_NUTRITION_45G = [
  'エネルギー：159Kcal、たんぱく質4.0g、脂質：5.2g',
  '炭水化物 24.2g　食塩相当量0.1g　サンプル品分析による推定値',
];
const EGG_WHEAT_SOY_MILK = '（一部に卵・小麦・大豆・乳成分を含む）';
const EGG_WHEAT_SOY = '（一部に卵・小麦・大豆を含む）';
const EGG_WHEAT = '（一部に卵・小麦を含む）';
const EGG_WHEAT_MILK = '（一部に卵・小麦・乳成分を含む）';

type ProductOverrides = Partial<
  Pick<
    ProductTemplate,
    'allergenLine' | 'amount' | 'storageMethod' | 'nutritionTitle' | 'nutritionLines' | 'noteLines'
  >
>;

export const DEFAULT_PRODUCTS: ProductTemplate[] = [
  makeProduct(
    'apple-cinnamon',
    'アップルシナモン',
    ['卵（沖縄県産）・砂糖・薄力粉・りんご・豆乳・オイル・シナモンパウダー'],
    {
      nutritionLines: [
        'エネルギー：159Kcal、たんぱく質4.0g、脂質：5.2g、炭水化物 24.2g',
        '食塩相当量0.1g　サンプル品分析による推定値',
      ],
    },
  ),
  makeProduct('plain', 'プレーン', ['卵（沖縄県産）・砂糖・薄力粉・豆乳・オイル'], {
    nutritionLines: [
      'エネルギー：133Kcal、たんぱく質4.0g、脂質：5.2g、炭水化物 17.2g',
      '食塩相当量0.1g　サンプル品分析による推定値',
    ],
  }),
  makeProduct(
    'earl-grey',
    'アールグレイ',
    ['卵（沖縄県産）・砂糖・薄力粉・豆乳・紅茶・オイル・オレンジピール'],
    {
      nutritionTitle: '◆栄養成分表示（1個当たり：40g）',
      nutritionLines: [
        'エネルギー：138Kcal、たんぱく質4.2g、脂質：5.2g、炭水化物 18.3g',
        '食塩相当量0.1g　サンプル品分析による推定値',
      ],
    },
  ),
  makeProduct(
    'banana',
    'バナナ',
    [
      '卵（沖縄県産）・砂糖・薄力粉・バナナ・オイル・果実ミックスジュース（果実四季柑・シークァーサー）',
    ],
    {
      allergenLine: EGG_WHEAT,
      nutritionLines: [
        'エネルギー：140Kcal、たんぱく質4.0g、脂質：5.2g、炭水化物 18.3g',
        '食塩相当量0.1g　サンプル品分析による推定値',
      ],
    },
  ),
  makeProduct(
    'chocolate',
    'チョコ',
    [
      '卵（沖縄県産）・砂糖・薄力粉・チョコレート（砂糖・カカオマス・ココアパウダー）・豆乳・オイル・果実ミックスジュース（四季柑）・ココアパウダー／乳化剤・香料',
    ],
    {
      allergenLine: EGG_WHEAT_SOY,
      nutritionLines: [
        'エネルギー：170Kcal、たんぱく質4.5g、脂質：7.4g、炭水化物 20.8g',
        '食塩相当量0.1g　サンプル品分析による推定値',
      ],
    },
  ),
  makeProduct('matcha', '抹茶', ['卵（沖縄県産）・砂糖・薄力粉・豆乳・オイル・抹茶'], {
    nutritionLines: [
      'エネルギー：137Kcal、たんぱく質4.3g、脂質：5.2g、炭水化物 17.6g',
      '食塩相当量0.1g　サンプル品分析による推定値',
    ],
  }),
  makeProduct('coffee', 'コーヒー', ['卵（沖縄県産）・砂糖・薄力粉・コーヒー・豆乳・オイル'], {
    allergenLine: EGG_WHEAT_SOY,
    nutritionLines: [
      'エネルギー：136Kcal、たんぱく質4.1g、脂質：5.3g、炭水化物 17.9g',
      '食塩相当量0.1g　サンプル品分析による推定値',
    ],
  }),
  makeProduct('orange', 'オレンジ', ['卵（沖縄県産）・砂糖・薄力粉・オレンジ', '豆乳・オイル']),
  makeProduct('lemon', 'レモン', ['卵（沖縄県産）・砂糖・薄力粉・レモンピール・豆乳・オイル'], {
    nutritionLines: [
      'エネルギー：136Kcal、たんぱく質4.0g、脂質：5.2g、炭水化物 17.9g',
      '食塩相当量0.1g　サンプル品分析による推定値',
    ],
  }),
  makeProduct('pineapple', 'パイナップル', ['卵（沖縄県産）・砂糖・薄力粉・オイル・パイナップル'], {
    allergenLine: EGG_WHEAT,
    nutritionLines: [
      'エネルギー：139Kcal、たんぱく質4.1g、脂質：5.2g、炭水化物 18.9g',
      '食塩相当量0.1g　サンプル品分析による推定値',
    ],
  }),
  makeProduct(
    'raspberry',
    'ラズベリー',
    [
      '卵（沖縄県産）・砂糖・薄力粉・ラズベリー・豆乳・オイル・果実ミックスジュース（果実四季柑・シークァーサー）',
    ],
    {
      allergenLine: EGG_WHEAT_SOY,
      nutritionLines: [
        'エネルギー：140Kcal、たんぱく質4.1g、脂質：5.2g、炭水化物 19.0g',
        '食塩相当量0.1g　サンプル品分析による推定値',
      ],
    },
  ),
  makeProduct(
    'orange-yogurt',
    'オレンジヨーグルト',
    ['卵（沖縄県産）・砂糖・薄力粉・オレンジ果実・ヨーグルト・オイル／香料'],
    {
      allergenLine: EGG_WHEAT_MILK,
      nutritionLines: [
        'エネルギー：152Kcal、たんぱく質4.2g、脂質：5.3g、炭水化物 20.8g',
        '食塩相当量0.1g　サンプル品分析による推定値',
      ],
    },
  ),
  makeProduct('sweet-potato', 'さつまいも', ['卵（沖縄県産）・砂糖・薄力粉・さつまいも・豆乳・オイル'], {
    nutritionLines: [
      'エネルギー：141.6Kcal、たんぱく質4.2g',
      '脂質：5.3g、炭水化物 19.7g',
      '食塩相当量0.1g　サンプル品分析による推定値',
    ],
  }),
  makeProduct('cocoa-marble', 'ココアマーブル', ['卵（沖縄県産）・砂糖・薄力粉', '豆乳・オイル・ココア']),
];

export function createProductDraft(product: ProductTemplate): ProductTemplate {
  return structuredClone(product);
}

export function findProduct(products: ProductTemplate[], id: string): ProductTemplate {
  return products.find((product) => product.id === id) ?? products[0];
}

function makeProduct(
  id: string,
  flavorName: string,
  ingredients: string[],
  overrides: ProductOverrides = {},
): ProductTemplate {
  return {
    id,
    name: flavorName,
    displayName: `シフォンケーキ（${flavorName}）`,
    ingredients,
    allergenLine: EGG_WHEAT_SOY_MILK,
    amount: '1個',
    storageMethod: '要冷蔵（10℃以下）',
    seller: COMMON_SELLER,
    sellerAddressLine: COMMON_ADDRESS,
    nutritionTitle: COMMON_NUTRITION_TITLE_45G,
    nutritionLines: COMMON_NUTRITION_45G,
    noteLines: COMMON_NOTE,
    ...overrides,
  };
}
