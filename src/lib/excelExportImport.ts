import * as XLSX from 'xlsx';
import { Account, FlowItem, MonthlyValues, YearData } from '@/types';
import { calculateFlowSummary, calculateAssetSummary } from './calculations';

export function exportToExcel(
  year: number,
  accounts: Account[],
  flowItems: FlowItem[],
  monthlyFlows: { [flowItemId: string]: MonthlyValues },
  monthlyAssets: { [accountId: string]: { [year: number]: MonthlyValues } }
) {
  const wb = XLSX.utils.book_new();

  const flowSummary = calculateFlowSummary(flowItems, monthlyFlows, year);
  const assetSummary = calculateAssetSummary(accounts, monthlyAssets, year);

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  // Sheet 1: 支援物資
  const supportItems = flowItems.filter((i) => i.year === year && i.category_type === 'support');
  const supportData: (string | number)[][] = [
    ['支援物資'],
    [],
    [`${year}年`, ...months, '総計'],
  ];
  for (const item of supportItems) {
    const row: (string | number)[] = [item.name];
    let sum = 0;
    for (let m = 1; m <= 12; m++) {
      const v = monthlyFlows[item.id]?.[m] || 0;
      row.push(v);
      sum += v;
    }
    row.push(sum);
    supportData.push(row);
  }
  // 合計行
  const supportTotalRow: (string | number)[] = ['合計'];
  for (let m = 1; m <= 12; m++) {
    supportTotalRow.push(flowSummary.supportTotal[m]);
  }
  supportTotalRow.push(flowSummary.annualSupport);
  supportData.push(supportTotalRow);
  const wsSupport = XLSX.utils.aoa_to_sheet(supportData);
  XLSX.utils.book_append_sheet(wb, wsSupport, '支援');

  // Sheet 2: 仕事収入
  const incomeItems = flowItems.filter((i) => i.year === year && i.category_type === 'income');
  const incomeData: (string | number)[][] = [
    ['仕事収入'],
    [],
    [`${year}年`, ...months, '給与日', '総計'],
  ];
  for (const item of incomeItems) {
    const row: (string | number)[] = [item.name];
    let sum = 0;
    for (let m = 1; m <= 12; m++) {
      const v = monthlyFlows[item.id]?.[m] || 0;
      row.push(v);
      sum += v;
    }
    row.push(item.payment_day || '');
    row.push(sum);
    incomeData.push(row);
  }
  const incomeTotalRow: (string | number)[] = ['合計'];
  for (let m = 1; m <= 12; m++) {
    incomeTotalRow.push(flowSummary.incomeTotal[m]);
  }
  incomeTotalRow.push('');
  incomeTotalRow.push(flowSummary.annualIncome);
  incomeData.push(incomeTotalRow);
  const wsIncome = XLSX.utils.aoa_to_sheet(incomeData);
  XLSX.utils.book_append_sheet(wb, wsIncome, '収入');

  // Sheet 3: カード類支出 (支出 & 投資・積立)
  const expenseItems = flowItems.filter((i) => i.year === year && (i.category_type === 'expense' || i.category_type === 'investment'));
  const expenseData: (string | number)[][] = [
    ['カード類支出'],
    [],
    [`${year}年`, ...months, '引落し日', '引落口座', '備考', '総計'],
  ];
  for (const item of expenseItems) {
    const row: (string | number)[] = [item.name];
    let sum = 0;
    for (let m = 1; m <= 12; m++) {
      const v = monthlyFlows[item.id]?.[m] || 0;
      row.push(v);
      sum += v;
    }
    row.push(item.payment_day || '');
    row.push(item.debit_account_text || '');
    row.push(item.note || '');
    row.push(sum);
    expenseData.push(row);
  }
  // 支出合計（純支出のみ）
  const expenseTotalRow: (string | number)[] = ['支出合計（純支出）'];
  for (let m = 1; m <= 12; m++) {
    expenseTotalRow.push(flowSummary.pureExpenseTotal[m]);
  }
  expenseTotalRow.push('', '', '←支出総計', flowSummary.annualPureExpense);
  expenseData.push(expenseTotalRow);

  // 収入合計
  const totalIncRow: (string | number)[] = ['収入合計'];
  for (let m = 1; m <= 12; m++) {
    totalIncRow.push(flowSummary.totalIncome[m]);
  }
  totalIncRow.push('', '', '←収入総計', flowSummary.annualTotalIncome);
  expenseData.push(totalIncRow);

  // 差額
  const netRow: (string | number)[] = ['差額'];
  for (let m = 1; m <= 12; m++) {
    netRow.push(flowSummary.netBalance[m]);
  }
  netRow.push('', '', '←年間差額', flowSummary.annualNetBalance);
  expenseData.push(netRow);

  const wsExpense = XLSX.utils.aoa_to_sheet(expenseData);
  XLSX.utils.book_append_sheet(wb, wsExpense, '支出');

  // Sheet 4: 銀行預金・証券
  const bankAccounts = accounts.filter((a) => a.type === 'bank');
  const secAccounts = accounts.filter((a) => a.type === 'securities');
  const assetData: (string | number)[][] = [
    ['銀行預金・証券', ...Array(11).fill(''), '【29日時点】'],
    [],
    [`${year}年`, ...months],
  ];

  for (const acc of bankAccounts) {
    const row: (string | number)[] = [acc.name];
    for (let m = 1; m <= 12; m++) {
      row.push(monthlyAssets[acc.id]?.[year]?.[m] || 0);
    }
    assetData.push(row);
  }
  for (const acc of secAccounts) {
    const row: (string | number)[] = [acc.name];
    for (let m = 1; m <= 12; m++) {
      row.push(monthlyAssets[acc.id]?.[year]?.[m] || 0);
    }
    assetData.push(row);
  }

  // 証券合計
  const secTotalRow: (string | number)[] = ['証券合計'];
  for (let m = 1; m <= 12; m++) {
    secTotalRow.push(assetSummary.securitiesTotal[m]);
  }
  assetData.push(secTotalRow);

  // 銀行合計
  const bankTotalRow: (string | number)[] = ['銀行合計'];
  for (let m = 1; m <= 12; m++) {
    bankTotalRow.push(assetSummary.bankTotal[m]);
  }
  assetData.push(bankTotalRow);

  // 総計
  const totalRow: (string | number)[] = ['総計'];
  for (let m = 1; m <= 12; m++) {
    totalRow.push(assetSummary.totalAssets[m]);
  }
  assetData.push(totalRow);

  // 先月比
  assetData.push([]);
  const secMomRow: (string | number)[] = ['証券先月比'];
  for (let m = 1; m <= 12; m++) {
    secMomRow.push(assetSummary.securitiesMom[m] ?? 0);
  }
  assetData.push(secMomRow);

  const bankMomRow: (string | number)[] = ['銀行先月比'];
  for (let m = 1; m <= 12; m++) {
    bankMomRow.push(assetSummary.bankMom[m] ?? 0);
  }
  assetData.push(bankMomRow);

  const totalMomRow: (string | number)[] = ['総計比'];
  for (let m = 1; m <= 12; m++) {
    totalMomRow.push(assetSummary.totalMom[m] ?? 0);
  }
  assetData.push(totalMomRow);

  // バンク説明
  assetData.push([]);
  assetData.push(['バンク説明']);
  for (const acc of [...bankAccounts, ...secAccounts]) {
    if (acc.description) {
      assetData.push([`${acc.name}：${acc.description}`]);
    }
  }

  const wsAsset = XLSX.utils.aoa_to_sheet(assetData);
  XLSX.utils.book_append_sheet(wb, wsAsset, '資産');

  // Sheet 5: 電子マネー類
  const emAccounts = accounts.filter((a) => a.type === 'e_money');
  const emData: (string | number)[][] = [
    ['電子マネー類', ...Array(3).fill(''), '月末時点'],
    [],
    [`${year}年`, ...months, '変動（平均）'],
  ];

  for (const acc of emAccounts) {
    const row: (string | number)[] = [acc.name];
    let sum = 0;
    let cnt = 0;
    for (let m = 1; m <= 12; m++) {
      const v = monthlyAssets[acc.id]?.[year]?.[m] || 0;
      row.push(v);
      if (v > 0) {
        sum += v;
        cnt++;
      }
    }
    const avg = cnt > 0 ? Math.round(sum / cnt) : 0;
    row.push(avg);
    emData.push(row);
  }

  // 電子マネー合計
  const emTotalRow: (string | number)[] = ['合計'];
  for (let m = 1; m <= 12; m++) {
    emTotalRow.push(assetSummary.eMoneyTotal[m]);
  }
  emTotalRow.push(assetSummary.eMoneyAverage);
  emData.push(emTotalRow);

  const wsEm = XLSX.utils.aoa_to_sheet(emData);
  XLSX.utils.book_append_sheet(wb, wsEm, '電子');

  // ファイルダウンロード
  XLSX.writeFile(wb, `SKH_${year}_マネーフロー.xlsx`);
}

export function parseExcelFile(
  fileData: ArrayBuffer,
  currentYear: number,
  existingAccounts: Account[],
  existingFlowItems: FlowItem[]
): {
  accounts: Account[];
  flowItems: FlowItem[];
  monthlyFlows: { [flowItemId: string]: MonthlyValues };
  monthlyAssets: { [accountId: string]: { [year: number]: MonthlyValues } };
  detectedYear: number;
} {
  const wb = XLSX.read(fileData, { type: 'array' });
  let detectedYear = currentYear;

  const accounts = [...existingAccounts];
  const flowItems = [...existingFlowItems.filter((i) => i.year !== detectedYear)];
  const monthlyFlows: { [flowItemId: string]: MonthlyValues } = {};
  const monthlyAssets: { [accountId: string]: { [year: number]: MonthlyValues } } = {};

  const getAccount = (name: string, type: 'bank' | 'securities' | 'e_money', desc?: string): Account => {
    let cleanName = name.replace(/（.*）|\(.*\)/g, '').trim();
    if (!cleanName) cleanName = name.trim();
    let acc = accounts.find((a) => a.name.toLowerCase() === cleanName.toLowerCase() || a.name.includes(cleanName) || cleanName.includes(a.name));
    if (!acc) {
      acc = {
        id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: cleanName,
        type,
        description: desc || '',
        is_active: true,
        sort_order: accounts.length + 1,
      };
      accounts.push(acc);
    } else if (desc && !acc.description) {
      acc.description = desc;
    }
    return acc;
  };

  // 各シートを走査
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

    let headerRowIdx = -1;
    let sectionType: 'support' | 'income' | 'expense' | 'bank_sec' | 'e_money' | 'unknown' = 'unknown';

    if (sheetName.includes('支援')) sectionType = 'support';
    else if (sheetName.includes('収入')) sectionType = 'income';
    else if (sheetName.includes('支出')) sectionType = 'expense';
    else if (sheetName.includes('資産')) sectionType = 'bank_sec';
    else if (sheetName.includes('電子')) sectionType = 'e_money';

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      const firstCell = String(row[0] || '').trim();

      // 年判定
      const yearMatch = firstCell.match(/(\d{4})年/);
      if (yearMatch) {
        detectedYear = parseInt(yearMatch[1], 10);
        headerRowIdx = r;
        continue;
      }

      if (firstCell.includes('バンク説明')) {
        // 次の行から口座説明メモを解析
        for (let descIdx = r + 1; descIdx < rows.length; descIdx++) {
          const descRow = rows[descIdx];
          if (!descRow || !descRow[0]) continue;
          const text = String(descRow[0]).trim();
          const colonIdx = text.indexOf('：') !== -1 ? text.indexOf('：') : text.indexOf(':');
          if (colonIdx !== -1) {
            const accName = text.substring(0, colonIdx).trim();
            const desc = text.substring(colonIdx + 1).trim();
            const clean = accName.replace('銀行', '').trim();
            const matched = accounts.find((a) => a.name.includes(clean) || clean.includes(a.name));
            if (matched) {
              matched.description = desc;
            }
          }
        }
        break;
      }

      if (headerRowIdx !== -1 && r > headerRowIdx) {
        if (!firstCell || firstCell.includes('合計') || firstCell.includes('総計') || firstCell.includes('先月比') || firstCell.includes('差額')) {
          continue;
        }

        const values: MonthlyValues = {};
        for (let m = 1; m <= 12; m++) {
          const val = Number(row[m]);
          values[m] = isNaN(val) ? 0 : val;
        }

        if (sectionType === 'support' || sectionType === 'income' || sectionType === 'expense') {
          let category: 'support' | 'income' | 'expense' | 'investment' = 'expense';
          let isPureExpense = true;

          if (sectionType === 'support') {
            category = 'support';
            isPureExpense = false;
          } else if (sectionType === 'income') {
            category = 'income';
            isPureExpense = false;
          } else {
            // expense or investment
            const isInv = ['welthnavi', 'wealthnavi', 'fx', '仮想通貨', 'gmo株', '積立'].some((inv) =>
              firstCell.toLowerCase().includes(inv)
            );
            if (isInv) {
              category = 'investment';
              isPureExpense = false;
            } else {
              category = 'expense';
              isPureExpense = true;
            }
          }

          const flowItemId = `flow-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          const paymentDay = row[13] ? String(row[13]).trim() : undefined;
          const debitAccountText = row[14] ? String(row[14]).trim() : undefined;
          const note = row[15] ? String(row[15]).trim() : undefined;

          flowItems.push({
            id: flowItemId,
            year: detectedYear,
            category_type: category,
            name: firstCell,
            payment_day: paymentDay,
            debit_account_text: debitAccountText,
            note: note,
            is_pure_expense: isPureExpense,
            sort_order: flowItems.length + 1,
          });

          monthlyFlows[flowItemId] = values;
        } else if (sectionType === 'bank_sec' || sectionType === 'e_money') {
          const accType = sectionType === 'e_money' ? 'e_money' : (
            ['sbi', 'gmo', 'bitflyer', 'welthnavi', 'wealthnavi', '投資信託'].some((k) => firstCell.toLowerCase().includes(k))
              ? 'securities'
              : 'bank'
          );
          const acc = getAccount(firstCell, accType);
          if (!monthlyAssets[acc.id]) {
            monthlyAssets[acc.id] = {};
          }
          monthlyAssets[acc.id][detectedYear] = values;
        }
      }
    }
  }

  return {
    accounts,
    flowItems,
    monthlyFlows,
    monthlyAssets,
    detectedYear,
  };
}
