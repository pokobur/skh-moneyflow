import { Account, FlowItem, MonthlyValues } from '@/types';

export interface MonthlyFlowSummary {
  supportTotal: { [month: number]: number };
  incomeTotal: { [month: number]: number };
  totalIncome: { [month: number]: number };
  pureExpenseTotal: { [month: number]: number };
  investmentTotal: { [month: number]: number };
  netBalance: { [month: number]: number };

  annualSupport: number;
  annualIncome: number;
  annualTotalIncome: number;
  annualPureExpense: number;
  annualInvestment: number;
  annualNetBalance: number;
}

export function calculateFlowSummary(
  flowItems: FlowItem[],
  monthlyFlows: { [flowItemId: string]: MonthlyValues },
  year: number
): MonthlyFlowSummary {
  const currentItems = flowItems.filter((i) => i.year === year);

  const supportTotal: { [month: number]: number } = {};
  const incomeTotal: { [month: number]: number } = {};
  const totalIncome: { [month: number]: number } = {};
  const pureExpenseTotal: { [month: number]: number } = {};
  const investmentTotal: { [month: number]: number } = {};
  const netBalance: { [month: number]: number } = {};

  for (let m = 1; m <= 12; m++) {
    supportTotal[m] = 0;
    incomeTotal[m] = 0;
    pureExpenseTotal[m] = 0;
    investmentTotal[m] = 0;

    for (const item of currentItems) {
      const val = monthlyFlows[item.id]?.[m] || 0;
      if (item.category_type === 'support') {
        supportTotal[m] += val;
      } else if (item.category_type === 'income') {
        incomeTotal[m] += val;
      } else if (item.category_type === 'expense' && item.is_pure_expense) {
        pureExpenseTotal[m] += val;
      } else if (item.category_type === 'investment' || !item.is_pure_expense) {
        investmentTotal[m] += val;
      }
    }

    totalIncome[m] = incomeTotal[m] + supportTotal[m];
    netBalance[m] = totalIncome[m] - pureExpenseTotal[m];
  }

  const annualSupport = Object.values(supportTotal).reduce((a, b) => a + b, 0);
  const annualIncome = Object.values(incomeTotal).reduce((a, b) => a + b, 0);
  const annualTotalIncome = annualSupport + annualIncome;
  const annualPureExpense = Object.values(pureExpenseTotal).reduce((a, b) => a + b, 0);
  const annualInvestment = Object.values(investmentTotal).reduce((a, b) => a + b, 0);
  const annualNetBalance = annualTotalIncome - annualPureExpense;

  return {
    supportTotal,
    incomeTotal,
    totalIncome,
    pureExpenseTotal,
    investmentTotal,
    netBalance,
    annualSupport,
    annualIncome,
    annualTotalIncome,
    annualPureExpense,
    annualInvestment,
    annualNetBalance,
  };
}

export interface MonthlyAssetSummary {
  bankTotal: { [month: number]: number };
  securitiesTotal: { [month: number]: number };
  totalAssets: { [month: number]: number };
  eMoneyTotal: { [month: number]: number };

  securitiesMom: { [month: number]: number | null };
  bankMom: { [month: number]: number | null };
  totalMom: { [month: number]: number | null };

  eMoneyAverage: number;
  latestActiveMonth: number;
}

export function calculateAssetSummary(
  accounts: Account[],
  monthlyAssets: { [accountId: string]: { [year: number]: MonthlyValues } },
  year: number,
  prevYearMonthlyAssets?: { [accountId: string]: { [year: number]: MonthlyValues } }
): MonthlyAssetSummary {
  const bankTotal: { [month: number]: number } = {};
  const securitiesTotal: { [month: number]: number } = {};
  const totalAssets: { [month: number]: number } = {};
  const eMoneyTotal: { [month: number]: number } = {};

  const securitiesMom: { [month: number]: number | null } = {};
  const bankMom: { [month: number]: number | null } = {};
  const totalMom: { [month: number]: number | null } = {};

  let latestActiveMonth = 1;

  for (let m = 1; m <= 12; m++) {
    bankTotal[m] = 0;
    securitiesTotal[m] = 0;
    eMoneyTotal[m] = 0;

    for (const acc of accounts) {
      const val = monthlyAssets[acc.id]?.[year]?.[m] || 0;
      if (acc.type === 'bank') {
        bankTotal[m] += val;
      } else if (acc.type === 'securities') {
        securitiesTotal[m] += val;
      } else if (acc.type === 'e_money') {
        eMoneyTotal[m] += val;
      }
    }

    totalAssets[m] = bankTotal[m] + securitiesTotal[m];

    if (totalAssets[m] > 0 || eMoneyTotal[m] > 0) {
      latestActiveMonth = m;
    }
  }

  // MoM calculations
  for (let m = 1; m <= 12; m++) {
    // If current month has 0 total assets and it's after latestActiveMonth, treat as unentered/inactive
    const isInactiveFutureMonth = m > latestActiveMonth && totalAssets[m] === 0;

    if (m === 1) {
      // Check if prevYear 12 exists
      let prevBank = 0;
      let prevSec = 0;
      let hasPrev = false;

      if (prevYearMonthlyAssets) {
        for (const acc of accounts) {
          const val = prevYearMonthlyAssets[acc.id]?.[year - 1]?.[12];
          if (val !== undefined && val !== null) {
            hasPrev = true;
            if (acc.type === 'bank') prevBank += val;
            if (acc.type === 'securities') prevSec += val;
          }
        }
      }

      if (hasPrev) {
        bankMom[1] = bankTotal[1] - prevBank;
        securitiesMom[1] = securitiesTotal[1] - prevSec;
        totalMom[1] = totalAssets[1] - (prevBank + prevSec);
      } else {
        // As defined in Excel specification, month 1 equals month 1 total if no prev year
        bankMom[1] = bankTotal[1];
        securitiesMom[1] = securitiesTotal[1];
        totalMom[1] = totalAssets[1];
      }
    } else {
      if (isInactiveFutureMonth && totalAssets[m - 1] === 0) {
        // Both current and previous are 0 in inactive future month
        bankMom[m] = 0;
        securitiesMom[m] = 0;
        totalMom[m] = 0;
      } else {
        bankMom[m] = bankTotal[m] - bankTotal[m - 1];
        securitiesMom[m] = securitiesTotal[m] - securitiesTotal[m - 1];
        totalMom[m] = totalAssets[m] - totalAssets[m - 1];
      }
    }
  }

  // e-money average for active months (or all 12 months)
  let eMoneySum = 0;
  let activeEMoneyMonths = 0;
  for (let m = 1; m <= 12; m++) {
    if (eMoneyTotal[m] > 0) {
      eMoneySum += eMoneyTotal[m];
      activeEMoneyMonths++;
    }
  }
  const eMoneyAverage = activeEMoneyMonths > 0 ? Math.round(eMoneySum / activeEMoneyMonths) : 0;

  return {
    bankTotal,
    securitiesTotal,
    totalAssets,
    eMoneyTotal,
    securitiesMom,
    bankMom,
    totalMom,
    eMoneyAverage,
    latestActiveMonth,
  };
}
