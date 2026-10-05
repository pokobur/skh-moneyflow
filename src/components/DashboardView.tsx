'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { calculateFlowSummary, calculateAssetSummary } from '@/lib/calculations';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  PiggyBank,
  Landmark,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = [
  '#0284c7', // sky
  '#6366f1', // indigo
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#64748b', // slate
];

export const DashboardView: React.FC = () => {
  const { currentYear, accounts, flowItems, monthlyFlows, monthlyAssets } = useStore();

  const flowSummary = calculateFlowSummary(flowItems, monthlyFlows, currentYear);
  const assetSummary = calculateAssetSummary(accounts, monthlyAssets, currentYear);

  // 最新月の総資産
  const latestMonth = assetSummary.latestActiveMonth;
  const currentTotalAssets = assetSummary.totalAssets[latestMonth] || 0;
  const currentBankAssets = assetSummary.bankTotal[latestMonth] || 0;
  const currentSecAssets = assetSummary.securitiesTotal[latestMonth] || 0;
  const currentEMoneyAssets = assetSummary.eMoneyTotal[latestMonth] || 0;

  // 月平均支出
  let activeExpenseMonths = 0;
  for (let m = 1; m <= 12; m++) {
    if (flowSummary.pureExpenseTotal[m] > 0) activeExpenseMonths++;
  }
  const monthlyAvgExpense = activeExpenseMonths > 0
    ? Math.round(flowSummary.annualPureExpense / activeExpenseMonths)
    : 0;

  // 1. 月次収支バランスチャート用データ
  const flowChartData = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    return {
      month: `${m}月`,
      income: flowSummary.totalIncome[m],
      expense: flowSummary.pureExpenseTotal[m],
      net: flowSummary.netBalance[m],
      investment: flowSummary.investmentTotal[m],
    };
  });

  // 2. 総資産推移チャート用データ
  const assetChartData = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    return {
      month: `${m}月`,
      bank: assetSummary.bankTotal[m],
      securities: assetSummary.securitiesTotal[m],
      total: assetSummary.totalAssets[m],
      eMoney: assetSummary.eMoneyTotal[m],
    };
  });

  // 3. 支出内訳（純支出）
  const expenseItems = flowItems.filter(
    (item) => item.year === currentYear && item.category_type === 'expense' && item.is_pure_expense
  );
  const expenseBreakdownData = expenseItems
    .map((item) => {
      const vals = monthlyFlows[item.id] || {};
      const sum = Object.values(vals).reduce((a, b) => a + b, 0);
      return {
        name: item.name,
        value: sum,
      };
    })
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  // 4. 資産構成比（最新月）
  const assetDistributionData = [
    { name: '銀行預金', value: currentBankAssets, color: '#0284c7' },
    { name: '証券・投資', value: currentSecAssets, color: '#6366f1' },
    { name: '電子マネー', value: currentEMoneyAssets, color: '#10b981' },
  ].filter((d) => d.value > 0);

  const formatCurrency = (val: number) => `¥${val.toLocaleString()}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20">
      {/* KPIサマリーカード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 年間総差額（純貯蓄） */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">年間純差額（貯蓄額）</span>
            <PiggyBank className="w-4 h-4 text-sky-500" />
          </div>
          <div>
            <div
              className={`text-xl font-extrabold ${
                flowSummary.annualNetBalance >= 0 ? 'text-sky-600' : 'text-rose-600'
              }`}
            >
              {formatCurrency(flowSummary.annualNetBalance)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              総合収入 - 純支出総計
            </div>
          </div>
        </div>

        {/* 現在ストック総資産 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">最新月総資産（{latestMonth}月）</span>
            <Landmark className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-indigo-900">
              {formatCurrency(currentTotalAssets)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              銀行 + 証券（29日時点）
            </div>
          </div>
        </div>

        {/* 年間総合収入 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">年間総合収入</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-emerald-600">
              {formatCurrency(flowSummary.annualTotalIncome)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              仕事 ¥{flowSummary.annualIncome.toLocaleString()} + 支援 ¥{flowSummary.annualSupport.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 年間純支出 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">年間純支出総計</span>
            <CreditCard className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-rose-600">
              {formatCurrency(flowSummary.annualPureExpense)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              月平均: {formatCurrency(monthlyAvgExpense)}
            </div>
          </div>
        </div>

        {/* 年間投資・積立枠 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">年間投資・積立枠</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-amber-600">
              {formatCurrency(flowSummary.annualInvestment)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              WealthNavi・投信・積立等
            </div>
          </div>
        </div>
      </div>

      {/* グラフエリア 1: 月次収支バランス & 総資産推移 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* チャート1: 月次収支バランス */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-800">
                月次キャッシュフロー推移（収入 vs 支出 vs 差額）
              </h3>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={flowChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`}
                />
                <Tooltip
                  formatter={(val: number) => `¥${val.toLocaleString()}`}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="income" name="総合収入" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expense" name="純支出" fill="#f43f5e" radius={[3, 3, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="net"
                  name="月次差額"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* チャート2: 総資産推移 (Stacked Area Chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">
                総資産推移（預金＋証券 積み上げ）
              </h3>
            </div>
            <span className="text-xs text-slate-400">毎月29日時点</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={assetChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBank" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorSec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`}
                />
                <Tooltip
                  formatter={(val: number) => `¥${val.toLocaleString()}`}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Area
                  type="monotone"
                  dataKey="bank"
                  name="銀行預金"
                  stackId="1"
                  stroke="#0284c7"
                  fill="url(#colorBank)"
                />
                <Area
                  type="monotone"
                  dataKey="securities"
                  name="証券・投資"
                  stackId="1"
                  stroke="#6366f1"
                  fill="url(#colorSec)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* グラフエリア 2: 支出内訳 & 資産構成比 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* チャート3: 支出内訳 (Donut Chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-800">
                年間支出内訳（純消費費目シェア）
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              総支出: ¥{flowSummary.annualPureExpense.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => `¥${val.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 内訳リスト */}
            <div className="space-y-1.5 text-xs max-h-56 overflow-y-auto pr-2">
              {expenseBreakdownData.map((item, idx) => {
                const percentage = ((item.value / flowSummary.annualPureExpense) * 100).toFixed(1);
                return (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="text-slate-700 truncate">{item.name}</span>
                    </div>
                    <div className="text-right shrink-0 tabular-nums font-medium text-slate-900">
                      ¥{item.value.toLocaleString()} <span className="text-slate-400 text-[10px]">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* チャート4: 最新資産ポートフォリオ構成比 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-800">
                最新ポートフォリオ構成（{latestMonth}月時点）
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              総計: ¥{(currentTotalAssets + currentEMoneyAssets).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {assetDistributionData.map((entry, index) => (
                      <Cell key={`cell-asset-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => `¥${val.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* ポートフォリオ詳細 */}
            <div className="space-y-3 text-xs">
              {assetDistributionData.map((item) => {
                const totalAll = currentTotalAssets + currentEMoneyAssets;
                const percentage = totalAll > 0 ? ((item.value / totalAll) * 100).toFixed(1) : '0';
                return (
                  <div key={item.name} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </span>
                      <span className="font-bold text-slate-700">{percentage}%</span>
                    </div>
                    <div className="text-right text-sm font-extrabold text-slate-900 tabular-nums">
                      ¥{item.value.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
