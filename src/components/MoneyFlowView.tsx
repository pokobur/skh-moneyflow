'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { FlowItem, CategoryType } from '@/types';
import { calculateFlowSummary } from '@/lib/calculations';
import { EditableCell } from './EditableCell';
import {
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Gift,
  CreditCard,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

export const MoneyFlowView: React.FC = () => {
  const {
    currentYear,
    accounts,
    flowItems,
    monthlyFlows,
    updateFlowValue,
    addFlowItem,
    updateFlowItem,
    deleteFlowItem,
  } = useStore();

  const currentItems = flowItems.filter((i) => i.year === currentYear);
  const summary = calculateFlowSummary(flowItems, monthlyFlows, currentYear);

  // モーダル管理
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [targetCategory, setTargetCategory] = useState<CategoryType>('expense');
  const [editingItem, setEditingItem] = useState<FlowItem | null>(null);

  // フォームステート
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<CategoryType>('expense');
  const [formPaymentDay, setFormPaymentDay] = useState('');
  const [formDebitAccountText, setFormDebitAccountText] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formIsPureExpense, setFormIsPureExpense] = useState(true);

  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const openAddModal = (cat: CategoryType) => {
    setModalMode('add');
    setTargetCategory(cat);
    setFormCategory(cat);
    setFormName('');
    setFormPaymentDay('');
    setFormDebitAccountText('');
    setFormNote('');
    setFormIsPureExpense(cat === 'expense');
    setEditingItem(null);
  };

  const openEditModal = (item: FlowItem) => {
    setModalMode('edit');
    setEditingItem(item);
    setFormCategory(item.category_type);
    setFormName(item.name);
    setFormPaymentDay(item.payment_day || '');
    setFormDebitAccountText(item.debit_account_text || '');
    setFormNote(item.note || '');
    setFormIsPureExpense(item.is_pure_expense);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (modalMode === 'add') {
      addFlowItem({
        category_type: formCategory,
        name: formName.trim(),
        payment_day: formPaymentDay.trim() || undefined,
        debit_account_text: formDebitAccountText.trim() || undefined,
        note: formNote.trim() || undefined,
        is_pure_expense: formCategory === 'expense' ? formIsPureExpense : false,
      });
    } else if (modalMode === 'edit' && editingItem) {
      updateFlowItem(editingItem.id, {
        category_type: formCategory,
        name: formName.trim(),
        payment_day: formPaymentDay.trim() || undefined,
        debit_account_text: formDebitAccountText.trim() || undefined,
        note: formNote.trim() || undefined,
        is_pure_expense: formCategory === 'expense' ? formIsPureExpense : false,
      });
    }
    setModalMode(null);
  };

  // 各行の年次合計
  const getItemAnnualTotal = (itemId: string) => {
    const vals = monthlyFlows[itemId] || {};
    return months.reduce((acc, m) => acc + (vals[m] || 0), 0);
  };

  // セクション描画ヘルパー
  const renderSection = (
    title: string,
    category: CategoryType,
    items: FlowItem[],
    icon: React.ReactNode,
    headerBg: string,
    subtotal: { [m: number]: number },
    subtotalAnnual: number,
    noteText?: string
  ) => {
    return (
      <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* セクションヘッダー */}
        <div className={`px-4 py-2.5 flex items-center justify-between border-b ${headerBg}`}>
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-bold text-sm text-slate-800">{title}</h3>
            {noteText && <span className="text-xs text-slate-500 font-normal">（{noteText}）</span>}
          </div>
          <button
            onClick={() => openAddModal(category)}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-white/80 hover:bg-white text-slate-700 border border-slate-300 rounded shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>費目追加</span>
          </button>
        </div>

        {/* グリッドテーブル */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 text-center font-medium">
                <th className="py-2 px-3 text-left w-36 border-r border-slate-200">項目名</th>
                {months.map((m) => (
                  <th key={m} className="py-2 px-1 w-20 border-r border-slate-200">
                    {m}月
                  </th>
                ))}
                <th className="py-2 px-2 w-24 border-r border-slate-200 bg-slate-200/60 font-semibold text-slate-800">
                  年間合計
                </th>
                <th className="py-2 px-2 w-24 border-r border-slate-200">
                  {category === 'income' ? '給与日' : '引落日'}
                </th>
                <th className="py-2 px-2 w-28 border-r border-slate-200">引落口座</th>
                <th className="py-2 px-2 w-28 border-r border-slate-200">備考</th>
                <th className="py-2 px-1 w-16">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => {
                const annualSum = getItemAnnualTotal(item.id);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* 項目名 */}
                    <td className="py-1.5 px-3 border-r border-slate-200 font-medium text-slate-800 flex items-center justify-between">
                      <span className="truncate" title={item.name}>
                        {item.name}
                      </span>
                      {category === 'investment' && (
                        <span className="ml-1 text-[10px] bg-sky-100 text-sky-700 px-1 py-0.5 rounded font-normal whitespace-nowrap">
                          資産移動
                        </span>
                      )}
                    </td>

                    {/* 1〜12月インラインセル */}
                    {months.map((m) => (
                      <td key={m} className="p-0 border-r border-slate-200">
                        <EditableCell
                          value={monthlyFlows[item.id]?.[m] || 0}
                          onChange={(val) => updateFlowValue(item.id, m, val)}
                        />
                      </td>
                    ))}

                    {/* 年間合計 */}
                    <td className="p-0 border-r border-slate-200 bg-slate-50">
                      <EditableCell value={annualSum} onChange={() => {}} readOnly className="font-semibold text-slate-900" />
                    </td>

                    {/* 給与日 / 引落日 */}
                    <td className="py-1 px-2 border-r border-slate-200 text-slate-600 truncate text-[11px]" title={item.payment_day}>
                      {item.payment_day || '-'}
                    </td>

                    {/* 引落口座 */}
                    <td className="py-1 px-2 border-r border-slate-200 text-slate-600 truncate text-[11px]" title={item.debit_account_text}>
                      {item.debit_account_text || '-'}
                    </td>

                    {/* 備考 */}
                    <td className="py-1 px-2 border-r border-slate-200 text-slate-500 truncate text-[11px]" title={item.note}>
                      {item.note || '-'}
                    </td>

                    {/* 操作 */}
                    <td className="py-1 px-1 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1 text-slate-400 hover:text-sky-600 rounded"
                          title="編集"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`「${item.name}」を削除しますか？`)) {
                              deleteFlowItem(item.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="削除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* 小計行 */}
              <tr className="bg-slate-100/80 font-bold border-t border-slate-300 text-slate-800">
                <td className="py-2 px-3 border-r border-slate-200">{title} 小計</td>
                {months.map((m) => (
                  <td key={m} className="p-0 border-r border-slate-200">
                    <EditableCell value={subtotal[m] || 0} onChange={() => {}} readOnly className="font-bold text-slate-900" />
                  </td>
                ))}
                <td className="p-0 border-r border-slate-200 bg-slate-200/70">
                  <EditableCell value={subtotalAnnual} onChange={() => {}} readOnly className="font-bold text-sky-950" />
                </td>
                <td colSpan={4} className="py-1 px-2 text-slate-400 text-[10px]">
                  合計自動計算
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const supportItems = currentItems.filter((i) => i.category_type === 'support');
  const incomeItems = currentItems.filter((i) => i.category_type === 'income');
  const expenseItems = currentItems.filter((i) => i.category_type === 'expense');
  const investmentItems = currentItems.filter((i) => i.category_type === 'investment');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28">
      {/* 画面説明バー */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-900">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            <strong>Excelマトリクス入力：</strong>セルをクリックして数値を直接入力できます。Enterで下へ、Tabで右へ移動。
          </span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span className="bg-sky-200/70 px-2 py-0.5 rounded text-sky-800">
            ※投資・積立（WealthNavi等）は純支出から分離され、資産移動として管理されます
          </span>
        </div>
      </div>

      {/* セクション1: 仕事収入 */}
      {renderSection(
        '仕事収入',
        'income',
        incomeItems,
        <DollarSign className="w-4 h-4 text-emerald-600" />,
        'bg-emerald-50/60 border-emerald-100',
        summary.incomeTotal,
        summary.annualIncome,
        '給与・本職・副業'
      )}

      {/* セクション2: 支援物資 */}
      {renderSection(
        '支援物資',
        'support',
        supportItems,
        <Gift className="w-4 h-4 text-amber-600" />,
        'bg-amber-50/60 border-amber-100',
        summary.supportTotal,
        summary.annualSupport,
        '固定・臨時支援'
      )}

      {/* セクション3: 支出（消費支出） */}
      {renderSection(
        'カード類支出（純支出）',
        'expense',
        expenseItems,
        <CreditCard className="w-4 h-4 text-rose-600" />,
        'bg-rose-50/60 border-rose-100',
        summary.pureExpenseTotal,
        summary.annualPureExpense,
        '生活費・カード・光熱費・家賃等'
      )}

      {/* セクション4: 投資・積立（資産移動枠） */}
      {renderSection(
        '投資・積立（資産移動枠）',
        'investment',
        investmentItems,
        <TrendingUp className="w-4 h-4 text-indigo-600" />,
        'bg-indigo-50/60 border-indigo-100',
        summary.investmentTotal,
        summary.annualInvestment,
        'WealthNavi・投信・FX・仮想通貨等（純支出合計から除外）'
      )}

      {/* 固定フッターサマリーバー */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 text-white border-t border-slate-700 shadow-2xl backdrop-blur-md bg-slate-900/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto">
          <div className="min-w-[900px] text-xs">
            <div className="grid grid-cols-12 gap-1 py-1 border-b border-slate-800 text-slate-300 items-center">
              <div className="col-span-2 font-bold flex items-center gap-1.5 text-emerald-400">
                <span>総合収入（仕事＋支援）</span>
              </div>
              {months.map((m) => (
                <div key={m} className="col-span-1 text-right font-medium tabular-nums text-slate-200">
                  {summary.totalIncome[m].toLocaleString()}
                </div>
              ))}
              <div className="col-span-2 text-right font-bold text-emerald-300 pl-2 border-l border-slate-800">
                ¥{summary.annualTotalIncome.toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-1 py-1 border-b border-slate-800 text-slate-300 items-center">
              <div className="col-span-2 font-bold flex items-center gap-1.5 text-rose-400">
                <span>支出総計（純支出）</span>
              </div>
              {months.map((m) => (
                <div key={m} className="col-span-1 text-right font-medium tabular-nums text-slate-200">
                  {summary.pureExpenseTotal[m].toLocaleString()}
                </div>
              ))}
              <div className="col-span-2 text-right font-bold text-rose-300 pl-2 border-l border-slate-800">
                ¥{summary.annualPureExpense.toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-1 py-1 items-center">
              <div className="col-span-2 font-bold flex items-center gap-1.5 text-sky-400">
                <span>月次差額（収入 - 支出）</span>
              </div>
              {months.map((m) => {
                const diff = summary.netBalance[m];
                return (
                  <div
                    key={m}
                    className={`col-span-1 text-right font-bold tabular-nums ${
                      diff < 0 ? 'text-rose-400' : 'text-sky-300'
                    }`}
                  >
                    {(diff > 0 ? '+' : '') + diff.toLocaleString()}
                  </div>
                );
              })}
              <div
                className={`col-span-2 text-right font-extrabold text-sm pl-2 border-l border-slate-800 ${
                  summary.annualNetBalance < 0 ? 'text-rose-400' : 'text-sky-300'
                }`}
              >
                ¥{summary.annualNetBalance.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 費目追加・編集モーダル */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {modalMode === 'add' ? '費目の新規追加' : '費目の編集'}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">費目区分</label>
                <select
                  value={formCategory}
                  onChange={(e) => {
                    const val = e.target.value as CategoryType;
                    setFormCategory(val);
                    setFormIsPureExpense(val === 'expense');
                  }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                >
                  <option value="income">仕事収入</option>
                  <option value="support">支援物資</option>
                  <option value="expense">カード類支出（純支出）</option>
                  <option value="investment">投資・積立（資産移動枠）</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  費目名 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="例: 光熱費、家賃、本職、WelthNavi"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {formCategory === 'income' ? '給与日' : '引落日'}
                  </label>
                  <input
                    type="text"
                    value={formPaymentDay}
                    onChange={(e) => setFormPaymentDay(e.target.value)}
                    placeholder="例: 25日、au10日"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">引落口座</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formDebitAccountText}
                      onChange={(e) => setFormDebitAccountText(e.target.value)}
                      placeholder="例: じぶん、三菱UFJ"
                      list="account-suggestions"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                    />
                    <datalist id="account-suggestions">
                      {accounts.map((a) => (
                        <option key={a.id} value={a.name} />
                      ))}
                      <option value="三菱＋じぶん" />
                    </datalist>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">備考</label>
                <input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="例: Kyash支払、105592"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              {formCategory === 'expense' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="pure-expense"
                    checked={formIsPureExpense}
                    onChange={(e) => setFormIsPureExpense(e.target.checked)}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <label htmlFor="pure-expense" className="text-xs text-slate-700 select-none">
                    支出合計（純支出）に含める
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
                >
                  保存する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
