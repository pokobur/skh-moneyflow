import { Account, FlowItem, MonthlyValues, YearData } from '@/types';

export const initialYears: YearData[] = [
  { year: 2026, memo: '2026年度 収支・資産管理' },
];

export const initialAccounts: Account[] = [
  // 銀行
  {
    id: 'acc-kyash',
    name: 'Kyash',
    type: 'bank',
    description: 'Kyash銀行残高・決済用',
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'acc-jibun',
    name: 'じぶん',
    type: 'bank',
    description: 'メインバンク（振替用、クレカ支払い）+ 外貨積立（ランド）月／5000',
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'acc-mufg',
    name: '三菱UFJ',
    type: 'bank',
    description: '給与（メイン）＋投資信託（バランスファンド）定期／月10000／27日',
    is_active: true,
    sort_order: 3,
  },
  {
    id: 'acc-mizuho',
    name: 'みずほ',
    type: 'bank',
    description: '給与（サブ）＋臨時出費',
    is_active: true,
    sort_order: 4,
  },
  {
    id: 'acc-sony',
    name: 'ソニー',
    type: 'bank',
    description: '送金受取＋投資用（FX,仮装通貨）',
    is_active: true,
    sort_order: 5,
  },
  {
    id: 'acc-foreign',
    name: '外貨預金',
    type: 'bank',
    description: '外貨積立・外貨預金口座',
    is_active: true,
    sort_order: 6,
  },
  {
    id: 'acc-yucho',
    name: 'ゆうちょ',
    type: 'bank',
    description: '捨て口座',
    is_active: true,
    sort_order: 7,
  },
  {
    id: 'acc-smbc',
    name: '三井住友銀行',
    type: 'bank',
    description: 'ビットフライヤー口座',
    is_active: true,
    sort_order: 8,
  },

  // 証券・暗号資産
  {
    id: 'acc-sbi-trade',
    name: 'SBIトレード',
    type: 'securities',
    description: '＊現在稼働していない休止口座',
    is_active: false,
    sort_order: 9,
  },
  {
    id: 'acc-gmo-trade',
    name: 'GMOトレード',
    type: 'securities',
    description: 'FX手動運用（豪ドルなど）',
    is_active: true,
    sort_order: 10,
  },
  {
    id: 'acc-gmo-fx',
    name: 'GMO FX',
    type: 'securities',
    description: '＊現在稼働していない休止口座',
    is_active: false,
    sort_order: 11,
  },
  {
    id: 'acc-gmo-coin',
    name: 'GMOコイン',
    type: 'securities',
    description: '暗号資産保有口座',
    is_active: true,
    sort_order: 12,
  },
  {
    id: 'acc-gmo-stock',
    name: 'GMO株',
    type: 'securities',
    description: '株式手動運用（日本株）',
    is_active: true,
    sort_order: 13,
  },
  {
    id: 'acc-bitflyer',
    name: 'bitFlyer',
    type: 'securities',
    description: '仮装通貨（₿、RIP、ETH）月／4000／25日',
    is_active: true,
    sort_order: 14,
  },
  {
    id: 'acc-wealthnavi',
    name: 'WelthNavi',
    type: 'securities',
    description: '自動投資運用（ETFなど）月／10000＋お釣り運用',
    is_active: true,
    sort_order: 15,
  },
  {
    id: 'acc-toushin',
    name: '投資信託',
    type: 'securities',
    description: 'インデックス・バランスファンド投信積立',
    is_active: true,
    sort_order: 16,
  },

  // 電子マネー類
  {
    id: 'acc-em-kyash',
    name: 'Kyash (電子)',
    type: 'e_money',
    description: 'Kyash電子マネーウォレット残高',
    is_active: true,
    sort_order: 17,
  },
  {
    id: 'acc-em-prin',
    name: 'prin',
    type: 'e_money',
    description: 'pring送金アプリ残高',
    is_active: true,
    sort_order: 18,
  },
  {
    id: 'acc-em-aupay',
    name: 'au PAY',
    type: 'e_money',
    description: 'au PAY残高',
    is_active: true,
    sort_order: 19,
  },
  {
    id: 'acc-em-suica',
    name: 'Suica',
    type: 'e_money',
    description: 'モバイルSuica残高',
    is_active: true,
    sort_order: 20,
  },
  {
    id: 'acc-em-pasmo',
    name: 'PASMO',
    type: 'e_money',
    description: 'モバイルPASMO残高',
    is_active: true,
    sort_order: 21,
  },
];

export const initialFlowItems: FlowItem[] = [
  // 支援物資
  {
    id: 'flow-sup-fixed',
    year: 2026,
    category_type: 'support',
    name: '固定',
    sort_order: 1,
    is_pure_expense: false,
  },
  {
    id: 'flow-sup-temp',
    year: 2026,
    category_type: 'support',
    name: '臨時',
    sort_order: 2,
    is_pure_expense: false,
  },

  // 仕事収入
  {
    id: 'flow-inc-kbc',
    year: 2026,
    category_type: 'income',
    name: 'KBC学童',
    payment_day: '25日',
    sort_order: 3,
    is_pure_expense: false,
  },
  {
    id: 'flow-inc-main',
    year: 2026,
    category_type: 'income',
    name: '本職',
    payment_day: '25日',
    sort_order: 4,
    is_pure_expense: false,
  },
  {
    id: 'flow-inc-sub',
    year: 2026,
    category_type: 'income',
    name: '副業',
    sort_order: 5,
    is_pure_expense: false,
  },

  // 支出 (純支出)
  {
    id: 'flow-exp-utility',
    year: 2026,
    category_type: 'expense',
    name: '光熱費',
    payment_day: 'au10日',
    debit_account_id: 'acc-jibun',
    debit_account_text: 'じぶん',
    is_pure_expense: true,
    sort_order: 6,
  },
  {
    id: 'flow-exp-rent',
    year: 2026,
    category_type: 'expense',
    name: '家賃',
    payment_day: '賃貸23日',
    debit_account_id: 'acc-jibun',
    debit_account_text: 'じぶん',
    is_pure_expense: true,
    sort_order: 7,
  },
  {
    id: 'flow-exp-card-main',
    year: 2026,
    category_type: 'expense',
    name: 'メイン',
    payment_day: 'aplus27日',
    debit_account_id: 'acc-jibun',
    debit_account_text: 'じぶん',
    note: 'Kyash支払',
    is_pure_expense: true,
    sort_order: 8,
  },
  {
    id: 'flow-exp-amazon',
    year: 2026,
    category_type: 'expense',
    name: 'amazon',
    payment_day: '住友26日',
    debit_account_id: 'acc-mufg',
    debit_account_text: '三菱UFJ',
    is_pure_expense: true,
    sort_order: 9,
  },
  {
    id: 'flow-exp-sub-card',
    year: 2026,
    category_type: 'expense',
    name: 'サブ',
    payment_day: 'オリコ26日',
    debit_account_id: 'acc-sony',
    debit_account_text: 'ソニー',
    is_pure_expense: true,
    sort_order: 10,
  },
  {
    id: 'flow-exp-traffic',
    year: 2026,
    category_type: 'expense',
    name: '交通費',
    payment_day: 'VIEW4日',
    debit_account_id: 'acc-mufg',
    debit_account_text: '三菱UFJ',
    is_pure_expense: true,
    sort_order: 11,
  },
  {
    id: 'flow-exp-comm',
    year: 2026,
    category_type: 'expense',
    name: '通信費',
    payment_day: 'au10日',
    debit_account_id: 'acc-jibun',
    debit_account_text: 'じぶん',
    is_pure_expense: true,
    sort_order: 12,
  },
  {
    id: 'flow-exp-cash',
    year: 2026,
    category_type: 'expense',
    name: '現金',
    is_pure_expense: true,
    sort_order: 13,
  },
  {
    id: 'flow-exp-tax',
    year: 2026,
    category_type: 'expense',
    name: '税金',
    is_pure_expense: true,
    sort_order: 14,
  },

  // 投資・積立（資産移動枠）
  {
    id: 'flow-inv-wealthnavi',
    year: 2026,
    category_type: 'investment',
    name: 'WelthNavi',
    payment_day: 'WL12日',
    debit_account_id: 'acc-jibun',
    debit_account_text: 'じぶん',
    note: '105592',
    is_pure_expense: false,
    sort_order: 15,
  },
  {
    id: 'flow-inv-fx',
    year: 2026,
    category_type: 'investment',
    name: 'FX',
    payment_day: 'SBI合計(月)',
    debit_account_id: 'acc-sony',
    debit_account_text: 'ソニー',
    is_pure_expense: false,
    sort_order: 16,
  },
  {
    id: 'flow-inv-crypto',
    year: 2026,
    category_type: 'investment',
    name: '仮想通貨',
    debit_account_id: 'acc-sony',
    debit_account_text: 'ソニー',
    is_pure_expense: false,
    sort_order: 17,
  },
  {
    id: 'flow-inv-gmo-stock',
    year: 2026,
    category_type: 'investment',
    name: 'GMO株',
    debit_account_id: 'acc-sony',
    debit_account_text: 'ソニー',
    is_pure_expense: false,
    sort_order: 18,
  },
  {
    id: 'flow-inv-tsumitate',
    year: 2026,
    category_type: 'investment',
    name: '積立',
    debit_account_text: '三菱＋じぶん',
    is_pure_expense: false,
    sort_order: 19,
  },
];

export const initialMonthlyFlows: { [flowItemId: string]: MonthlyValues } = {
  // 固定
  'flow-sup-fixed': { 1: 5000, 2: 5000, 3: 5000, 4: 5000, 5: 5000, 6: 5000, 7: 5000, 8: 5000, 9: 5000, 10: 0, 11: 0, 12: 0 },
  // 臨時
  'flow-sup-temp': { 1: 5000, 2: 0, 3: 10000, 4: 4000, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },

  // KBC学童
  'flow-inc-kbc': { 1: 8395, 2: 0, 3: 8531, 4: 8643, 5: 8688, 6: 8733, 7: 17354, 8: 17625, 9: 20334, 10: 0, 11: 0, 12: 0 },
  // 本職
  'flow-inc-main': { 1: 209963, 2: 211523, 3: 209963, 4: 238751, 5: 238452, 6: 228652, 7: 397117, 8: 229252, 9: 239976, 10: 0, 11: 0, 12: 0 },
  // 副業
  'flow-inc-sub': { 1: 500, 2: 500, 3: 500, 4: 500, 5: 2000, 6: 2000, 7: 500, 8: 2000, 9: 1000, 10: 0, 11: 0, 12: 0 },

  // 光熱費
  'flow-exp-utility': { 1: 11808, 2: 9927, 3: 13774, 4: 9168, 5: 11218, 6: 7411, 7: 10000, 8: 6678, 9: 8697, 10: 0, 11: 0, 12: 0 },
  // 家賃
  'flow-exp-rent': { 1: 70800, 2: 70820, 3: 70820, 4: 70820, 5: 70820, 6: 70820, 7: 70820, 8: 70820, 9: 70820, 10: 0, 11: 0, 12: 0 },
  // メイン
  'flow-exp-card-main': { 1: 100000, 2: 50000, 3: 100000, 4: 100000, 5: 150000, 6: 100000, 7: 61261, 8: 154180, 9: 48520, 10: 0, 11: 0, 12: 0 },
  // amazon
  'flow-exp-amazon': { 1: 50863, 2: 24280, 3: 8898, 4: 17083, 5: 24703, 6: 22826, 7: 7656, 8: 27096, 9: 52077, 10: 0, 11: 0, 12: 0 },
  // サブ
  'flow-exp-sub-card': { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
  // 交通費
  'flow-exp-traffic': { 1: 10000, 2: 64304, 3: 10000, 4: 10000, 5: 79490, 6: 10000, 7: 10000, 8: 10000, 9: 79490, 10: 0, 11: 0, 12: 0 },
  // 通信費
  'flow-exp-comm': { 1: 4128, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
  // 現金
  'flow-exp-cash': { 1: 10000, 2: 5000, 3: 0, 4: 10000, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
  // 税金
  'flow-exp-tax': { 1: 43000, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },

  // WelthNavi
  'flow-inv-wealthnavi': { 1: 0, 2: 12507, 3: 14582, 4: 13466, 5: 12000, 6: 13357, 7: 12997, 8: 13606, 9: 13077, 10: 0, 11: 0, 12: 0 },
  // FX
  'flow-inv-fx': { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
  // 仮想通貨
  'flow-inv-crypto': { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
  // GMO株
  'flow-inv-gmo-stock': { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
  // 積立
  'flow-inv-tsumitate': { 1: 15000, 2: 15000, 3: 15000, 4: 15000, 5: 15000, 6: 15000, 7: 15000, 8: 15000, 9: 15000, 10: 0, 11: 0, 12: 0 },
};

export const initialMonthlyAssets: { [accountId: string]: { [year: number]: MonthlyValues } } = {
  // Kyash (銀行)
  'acc-kyash': {
    2026: { 1: 49986, 2: 40000, 3: 40000, 4: 40000, 5: 40000, 6: 40000, 7: 40000, 8: 40000, 9: 60000, 10: 0, 11: 0, 12: 0 },
  },
  // じぶん
  'acc-jibun': {
    2026: { 1: 406432, 2: 439367, 3: 420916, 4: 436450, 5: 383342, 6: 400000, 7: 600000, 8: 627391, 9: 543146, 10: 0, 11: 0, 12: 0 },
  },
  // 三菱UFJ
  'acc-mufg': {
    2026: { 1: 450710, 2: 393184, 3: 383492, 4: 314787, 5: 337716, 6: 400000, 7: 500000, 8: 591784, 9: 590709, 10: 0, 11: 0, 12: 0 },
  },
  // みずほ
  'acc-mizuho': {
    2026: { 1: 1081147, 2: 1097089, 3: 1110620, 4: 1119263, 5: 1127951, 6: 1130000, 7: 1140000, 8: 1155454, 9: 1193323, 10: 0, 11: 0, 12: 0 },
  },
  // ソニー
  'acc-sony': {
    2026: { 1: 176804, 2: 176804, 3: 126952, 4: 126952, 5: 128033, 6: 127000, 7: 130000, 8: 131777, 9: 131777, 10: 0, 11: 0, 12: 0 },
  },
  // 外貨預金
  'acc-foreign': {
    2026: { 1: 217588, 2: 224781, 3: 235950, 4: 235950, 5: 242956, 6: 250000, 7: 250000, 8: 258780, 9: 255591, 10: 0, 11: 0, 12: 0 },
  },
  // ゆうちょ
  'acc-yucho': {
    2026: { 1: 1000, 2: 1000, 3: 1000, 4: 1000, 5: 1000, 6: 1000, 7: 1000, 8: 1000, 9: 1000, 10: 0, 11: 0, 12: 0 },
  },
  // 三井住友銀行
  'acc-smbc': {
    2026: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
  },

  // 証券
  // SBIトレード
  'acc-sbi-trade': {
    2026: { 1: 4000, 2: 4000, 3: 4000, 4: 4000, 5: 4000, 6: 4000, 7: 4000, 8: 4000, 9: 4000, 10: 0, 11: 0, 12: 0 },
  },
  // GMOトレード
  'acc-gmo-trade': {
    2026: { 1: 200000, 2: 200000, 3: 200000, 4: 200000, 5: 200000, 6: 200000, 7: 200000, 8: 200000, 9: 200000, 10: 0, 11: 0, 12: 0 },
  },
  // GMO FX
  'acc-gmo-fx': {
    2026: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
  },
  // GMOコイン
  'acc-gmo-coin': {
    2026: { 1: 43223, 2: 43223, 3: 43223, 4: 43223, 5: 43223, 6: 43223, 7: 43223, 8: 43223, 9: 43223, 10: 0, 11: 0, 12: 0 },
  },
  // GMO株
  'acc-gmo-stock': {
    2026: { 1: 194072, 2: 196772, 3: 211460, 4: 211460, 5: 207360, 6: 207360, 7: 207360, 8: 220560, 9: 214460, 10: 0, 11: 0, 12: 0 },
  },
  // bitFlyer
  'acc-bitflyer': {
    2026: { 1: 361044, 2: 319775, 3: 389918, 4: 389918, 5: 375211, 6: 375211, 7: 375211, 8: 311856, 9: 432857, 10: 0, 11: 0, 12: 0 },
  },
  // WelthNavi
  'acc-wealthnavi': {
    2026: { 1: 1366319, 2: 1440920, 3: 1493929, 4: 1493929, 5: 1567615, 6: 1567615, 7: 1567615, 8: 1628384, 9: 1578582, 10: 0, 11: 0, 12: 0 },
  },
  // 投資信託
  'acc-toushin': {
    2026: { 1: 654968, 2: 695586, 3: 729313, 4: 729313, 5: 758512, 6: 758512, 7: 758512, 8: 802875, 9: 796412, 10: 0, 11: 0, 12: 0 },
  },

  // 電子マネー類
  'acc-em-kyash': {
    2026: { 1: 50000, 2: 40000, 3: 30000, 4: 30000, 5: 30000, 6: 30000, 7: 30000, 8: 30000, 9: 50000, 10: 30000, 11: 30000, 12: 30000 },
  },
  'acc-em-prin': {
    2026: { 1: 10900, 2: 900, 3: 14900, 4: 4900, 5: 4900, 6: 4900, 7: 4900, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
  },
  'acc-em-aupay': {
    2026: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
  },
  'acc-em-suica': {
    2026: { 1: 7000, 2: 5000, 3: 10000, 4: 10000, 5: 10000, 6: 10000, 7: 10000, 8: 10000, 9: 6000, 10: 10000, 11: 10000, 12: 10000 },
  },
  'acc-em-pasmo': {
    2026: { 1: 7000, 2: 7000, 3: 7000, 4: 7000, 7: 7000, 5: 7000, 6: 7000, 8: 7000, 9: 7000, 10: 7000, 11: 7000, 12: 7000 },
  },
};
