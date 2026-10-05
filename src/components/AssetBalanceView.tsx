'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Account, AccountType } from '@/types';
import { calculateAssetSummary } from '@/lib/calculations';
import { EditableCell } from './EditableCell';
import {
  Landmark,
  TrendingUp,
  Smartphone,
  Info,
  Calendar,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  Edit3,
  Check,
  X,
} from 'lucide-react';

export const AssetBalanceView: React.FC = () => {
  const {
    currentYear,
    accounts,
    monthlyAssets,
    updateAssetValue,
    updateAccount,
  } = useStore();

  const [showInactive, setShowInactive] = useState(false);
  const [editingMemoAccountId, setEditingMemoAccountId] = useState<string | null>(null);
  const [memoEditText, setMemoEditText] = useState('');
  const [isMemoPanelOpen, setIsMemoPanelOpen] = useState(true);

  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const summary = calculateAssetSummary(accounts, monthlyAssets, currentYear);

  // フィルタリング
  const bankAccounts = accounts.filter(
    (a) => a.type === 'bank' && (showInactive || a.is_active)
  );
  const secAccounts = accounts.filter(
    (a) => a.type === 'securities' && (showInactive || a.is_active)
  );
  const emAccounts = accounts.filter(
    (a) => a.type === 'e_money' && (showInactive || a.is_active)
  );

  const handleStartEditMemo = (acc: Account) => {
    setEditingMemoAccountId(acc.id);
    setMemoEditText(acc.description);
  };

  const handleSaveMemo = (accId: string) => {
    updateAccount(accId, { description: memoEditText });
    setEditingMemoAccountId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
      {/* 画面トップ説明 ＆ コントロール */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-100 text-sky-800 font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>銀行・証券：毎月29日時点</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-semibold">
            <Smartphone className="w-3.5 h-3.5" />
            <span>電子マネー：月末時点</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium select-none">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            {showInactive ? <Eye className="w-3.5 h-3.5 text-sky-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            <span>休止口座を表示（SBIトレード、GMO FX等）</span>
          </label>
        </div>
      </div>

      {/* メインテーブル：銀行預金・証券・暗号資産 */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-6">
        <div className="px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-sm tracking-wide">
              銀行預金 & 証券・暗号資産【29日時点】
            </h3>
          </div>
          <span className="text-xs text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {currentYear}年度
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 text-center font-medium">
                <th className="py-2.5 px-3 text-left w-44 border-r border-slate-200">口座 / 銘柄名</th>
                {months.map((m) => (
                  <th key={m} className="py-2 px-1 w-20 border-r border-slate-200">
                    {m}月
                  </th>
                ))}
                <th className="py-2 px-3 text-left min-w-[200px]">用途メモ（抜粋）</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* === セクション1: 銀行預金 === */}
              <tr className="bg-sky-50/70 font-bold text-sky-900 border-t border-b border-sky-100">
                <td colSpan={14} className="py-1.5 px-3">
                  1. 銀行預金
                </td>
              </tr>
              {bankAccounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-1.5 px-3 border-r border-slate-200 font-medium text-slate-800 flex items-center justify-between">
                    <span>{acc.name}</span>
                    {!acc.is_active && (
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-1 py-0.2 rounded font-normal">
                        休止
                      </span>
                    )}
                  </td>
                  {months.map((m) => (
                    <td key={m} className="p-0 border-r border-slate-200">
                      <EditableCell
                        value={monthlyAssets[acc.id]?.[currentYear]?.[m] || 0}
                        onChange={(val) => updateAssetValue(acc.id, currentYear, m, val)}
                      />
                    </td>
                  ))}
                  <td className="py-1 px-3 text-slate-500 truncate text-[11px]" title={acc.description}>
                    {acc.description || '-'}
                  </td>
                </tr>
              ))}

              {/* 銀行合計 */}
              <tr className="bg-sky-100/50 font-bold border-t border-b border-sky-200 text-sky-950">
                <td className="py-2 px-3 border-r border-slate-200">銀行合計</td>
                {months.map((m) => (
                  <td key={m} className="p-0 border-r border-slate-200">
                    <EditableCell
                      value={summary.bankTotal[m] || 0}
                      onChange={() => {}}
                      readOnly
                      className="font-bold text-sky-950"
                    />
                  </td>
                ))}
                <td className="py-1 px-3 text-sky-700 text-[11px]">全銀行口座の集計値</td>
              </tr>

              {/* === セクション2: 証券・暗号資産 === */}
              <tr className="bg-indigo-50/70 font-bold text-indigo-900 border-t border-b border-indigo-100">
                <td colSpan={14} className="py-1.5 px-3">
                  2. 証券・暗号資産
                </td>
              </tr>
              {secAccounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-1.5 px-3 border-r border-slate-200 font-medium text-slate-800 flex items-center justify-between">
                    <span>{acc.name}</span>
                    {!acc.is_active && (
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-1 py-0.2 rounded font-normal">
                        休止
                      </span>
                    )}
                  </td>
                  {months.map((m) => (
                    <td key={m} className="p-0 border-r border-slate-200">
                      <EditableCell
                        value={monthlyAssets[acc.id]?.[currentYear]?.[m] || 0}
                        onChange={(val) => updateAssetValue(acc.id, currentYear, m, val)}
                      />
                    </td>
                  ))}
                  <td className="py-1 px-3 text-slate-500 truncate text-[11px]" title={acc.description}>
                    {acc.description || '-'}
                  </td>
                </tr>
              ))}

              {/* 証券合計 */}
              <tr className="bg-indigo-100/50 font-bold border-t border-b border-indigo-200 text-indigo-950">
                <td className="py-2 px-3 border-r border-slate-200">証券合計</td>
                {months.map((m) => (
                  <td key={m} className="p-0 border-r border-slate-200">
                    <EditableCell
                      value={summary.securitiesTotal[m] || 0}
                      onChange={() => {}}
                      readOnly
                      className="font-bold text-indigo-950"
                    />
                  </td>
                ))}
                <td className="py-1 px-3 text-indigo-700 text-[11px]">全証券・暗号資産の集計値</td>
              </tr>

              {/* === 総合計（銀行 + 証券） === */}
              <tr className="bg-slate-800 text-white font-extrabold text-sm border-t-2 border-slate-900">
                <td className="py-2.5 px-3 border-r border-slate-700 text-sky-300">
                  総計（銀行＋証券）
                </td>
                {months.map((m) => (
                  <td key={m} className="p-0 border-r border-slate-700">
                    <EditableCell
                      value={summary.totalAssets[m] || 0}
                      onChange={() => {}}
                      readOnly
                      className="font-bold text-white text-xs bg-slate-800"
                    />
                  </td>
                ))}
                <td className="py-1 px-3 text-slate-300 text-xs font-normal">
                  毎月29日時点のストック総資産
                </td>
              </tr>

              {/* === セクション3: 前月比分析 === */}
              <tr className="bg-slate-100 font-bold text-slate-700 border-t border-b border-slate-200">
                <td colSpan={14} className="py-1.5 px-3 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
                  <span>前月比分析（増減）</span>
                </td>
              </tr>

              {/* 証券先月比 */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-1.5 px-3 border-r border-slate-200 font-medium text-slate-700">
                  証券先月比
                </td>
                {months.map((m) => (
                  <td key={m} className="p-0 border-r border-slate-200">
                    <EditableCell
                      value={summary.securitiesMom[m] ?? 0}
                      onChange={() => {}}
                      readOnly
                      isDiff
                    />
                  </td>
                ))}
                <td className="py-1 px-3 text-slate-400 text-[11px]">証券ポートフォリオ月間変動</td>
              </tr>

              {/* 銀行先月比 */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-1.5 px-3 border-r border-slate-200 font-medium text-slate-700">
                  銀行先月比
                </td>
                {months.map((m) => (
                  <td key={m} className="p-0 border-r border-slate-200">
                    <EditableCell
                      value={summary.bankMom[m] ?? 0}
                      onChange={() => {}}
                      readOnly
                      isDiff
                    />
                  </td>
                ))}
                <td className="py-1 px-3 text-slate-400 text-[11px]">預金残高月間増減</td>
              </tr>

              {/* 総計比 */}
              <tr className="bg-slate-50/80 font-bold border-t border-slate-200">
                <td className="py-1.5 px-3 border-r border-slate-200 text-slate-900">
                  総計比（総資産前月比）
                </td>
                {months.map((m) => (
                  <td key={m} className="p-0 border-r border-slate-200">
                    <EditableCell
                      value={summary.totalMom[m] ?? 0}
                      onChange={() => {}}
                      readOnly
                      isDiff
                      className="font-bold"
                    />
                  </td>
                ))}
                <td className="py-1 px-3 text-slate-500 text-[11px]">純資産の月間増減</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* メインテーブル：電子マネー類 */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-8">
        <div className="px-4 py-3 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-300" />
            <h3 className="font-bold text-sm tracking-wide">
              電子マネー類【月末時点】
            </h3>
          </div>
          <span className="text-xs text-emerald-200 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            月間平均: ¥{summary.eMoneyAverage.toLocaleString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 text-center font-medium">
                <th className="py-2.5 px-3 text-left w-44 border-r border-slate-200">サービス名</th>
                {months.map((m) => (
                  <th key={m} className="py-2 px-1 w-20 border-r border-slate-200">
                    {m}月
                  </th>
                ))}
                <th className="py-2 px-3 text-right w-28 border-r border-slate-200 bg-slate-200/60 font-semibold text-slate-800">
                  変動（平均）
                </th>
                <th className="py-2 px-3 text-left min-w-[200px]">メモ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {emAccounts.map((acc) => {
                let sum = 0;
                let cnt = 0;
                for (let m = 1; m <= 12; m++) {
                  const val = monthlyAssets[acc.id]?.[currentYear]?.[m] || 0;
                  if (val > 0) {
                    sum += val;
                    cnt++;
                  }
                }
                const avg = cnt > 0 ? Math.round(sum / cnt) : 0;

                return (
                  <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-1.5 px-3 border-r border-slate-200 font-medium text-slate-800">
                      {acc.name}
                    </td>
                    {months.map((m) => (
                      <td key={m} className="p-0 border-r border-slate-200">
                        <EditableCell
                          value={monthlyAssets[acc.id]?.[currentYear]?.[m] || 0}
                          onChange={(val) => updateAssetValue(acc.id, currentYear, m, val)}
                        />
                      </td>
                    ))}
                    <td className="p-0 border-r border-slate-200 bg-slate-50">
                      <EditableCell value={avg} onChange={() => {}} readOnly className="font-semibold text-slate-800" />
                    </td>
                    <td className="py-1 px-3 text-slate-500 truncate text-[11px]" title={acc.description}>
                      {acc.description || '-'}
                    </td>
                  </tr>
                );
              })}

              {/* 合計 */}
              <tr className="bg-emerald-50/70 font-bold border-t-2 border-emerald-200 text-emerald-950">
                <td className="py-2 px-3 border-r border-slate-200">電子マネー合計</td>
                {months.map((m) => (
                  <td key={m} className="p-0 border-r border-slate-200">
                    <EditableCell
                      value={summary.eMoneyTotal[m] || 0}
                      onChange={() => {}}
                      readOnly
                      className="font-bold text-emerald-950"
                    />
                  </td>
                ))}
                <td className="p-0 border-r border-slate-200 bg-emerald-100/60">
                  <EditableCell
                    value={summary.eMoneyAverage}
                    onChange={() => {}}
                    readOnly
                    className="font-extrabold text-emerald-950"
                  />
                </td>
                <td className="py-1 px-3 text-emerald-800 text-[11px]">月末電子マネー保有総額</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* バンク説明・用途メモ アコーディオンパネル */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <button
          onClick={() => setIsMemoPanelOpen(!isMemoPanelOpen)}
          className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200/80 transition-colors flex items-center justify-between text-left font-bold text-slate-800 text-sm"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-600" />
            <span>金融機関・口座の用途・運用メモ（備忘録）</span>
            <span className="text-xs text-slate-500 font-normal">
              クリックで各口座のメモを直接編集可能
            </span>
          </div>
          {isMemoPanelOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
        </button>

        {isMemoPanelOpen && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {accounts.map((acc) => {
              const isEditing = editingMemoAccountId === acc.id;
              return (
                <div
                  key={acc.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-sky-300 transition-all text-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          acc.type === 'bank'
                            ? 'bg-sky-500'
                            : acc.type === 'securities'
                            ? 'bg-indigo-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                      {acc.name}
                    </span>
                    {!isEditing && (
                      <button
                        onClick={() => handleStartEditMemo(acc)}
                        className="p-1 text-slate-400 hover:text-sky-600 rounded"
                        title="メモ編集"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={memoEditText}
                        onChange={(e) => setMemoEditText(e.target.value)}
                        rows={2}
                        className="w-full text-xs p-1.5 border border-sky-400 rounded focus:outline-none bg-white"
                        placeholder="用途・運用メモを入力"
                        autoFocus
                      />
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setEditingMemoAccountId(null)}
                          className="px-2 py-0.5 rounded text-[11px] bg-slate-200 text-slate-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleSaveMemo(acc.id)}
                          className="px-2 py-0.5 rounded text-[11px] bg-sky-600 text-white flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> 保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                      {acc.description || <span className="text-slate-400 italic">メモなし</span>}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
