export type AccountType = 'bank' | 'securities' | 'e_money';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  description: string;
  is_active: boolean;
  sort_order: number;
}

export type CategoryType = 'support' | 'income' | 'expense' | 'investment';

export interface FlowItem {
  id: string;
  year: number;
  category_type: CategoryType;
  name: string;
  payment_day?: string;
  debit_account_id?: string;
  debit_account_text?: string;
  note?: string;
  is_pure_expense: boolean;
  sort_order: number;
}

export type MonthlyValues = {
  [month: number]: number; // 1 to 12
};

export interface FlowItemWithValues extends FlowItem {
  values: MonthlyValues;
}

export type SnapshotTiming = 'day_29' | 'month_end';

export interface AssetRecord {
  id: string;
  account_id: string;
  year: number;
  snapshot_timing: SnapshotTiming;
  values: MonthlyValues; // 1 to 12
}

export interface YearData {
  year: number;
  memo?: string;
}

export interface AppState {
  currentYear: number;
  years: YearData[];
  accounts: Account[];
  flowItems: FlowItem[];
  monthlyFlows: { [flowItemId: string]: MonthlyValues };
  monthlyAssets: { [accountId: string]: { [year: number]: MonthlyValues } };
}
