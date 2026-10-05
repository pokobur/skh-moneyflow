'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Account, AccountType } from '@/types';
import { exportToExcel } from '@/lib/excelExportImport';
import {
  Landmark,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  RotateCcw,
  Calendar,
  ArrowRight,
  Database,
  FileSpreadsheet,
  Download,
} from 'lucide-react';

export const MasterSettingsView: React.FC = () => {
  const {
    currentYear,
    years,
    accounts,
    flowItems,
    monthlyFlows,
    monthlyAssets,
    addAccount,
    updateAccount,
    deleteAccount,
    carryOverYear,
    resetToInitial,
  } = useStore();

  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingAcc, setEditingAcc] = useState<Account | null>(null);

  // 口座フォーム
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<AccountType>('bank');
  const [formDesc, setFormDesc] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // 繰越フォーム
  const [carryFromYear, setCarryFromYear] = useState(currentYear);
  const [carryToYear, setCarryToYear] = useState(currentYear + 1);

  const openAddModal = () => {
    setModalMode('add');
    setEditingAcc(null);
    setFormName('');
    setFormType('bank');
    setFormDesc('');
    setFormIsActive(true);
  };

  const openEditModal = (acc: Account) => {
    setModalMode('edit');
    setEditingAcc(acc);
    setFormName(acc.name);
    setFormType(acc.type);
    setFormDesc(acc.description);
    setFormIsActive(acc.is_active);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (modalMode === 'add') {
      addAccount({
        name: formName.trim(),
        type: formType,
        description: formDesc.trim(),
        is_active: formIsActive,
      });
    } else if (modalMode === 'edit' && editingAcc) {
      updateAccount(editingAcc.id, {
        name: formName.trim(),
        type: formType,
        description: formDesc.trim(),
        is_active: formIsActive,
      });
    }
    setModalMode(null);
  };

  const handleCarryOver = (e: React.FormEvent) => {
    e.preventDefault();
    if (carryFromYear === carryToYear) {
      alert('繰越元と繰越先は異なる年度を指定してください。');
      return;
    }
    if (years.some((y) => y.year === carryToYear)) {
      if (!confirm(`${carryToYear}年度は既に存在します。上書き更新しますか？`)) {
        return;
      }
    }
    carryOverYear(carryFromYear, carryToYear);
    alert(`${carryFromYear}年度から${carryToYear}年度への繰越処理が完了しました！`);
  };

  const bankList = accounts.filter((a) => a.type === 'bank');
  const secList = accounts.filter((a) => a.type === 'securities');
  const emList = accounts.filter((a) => a.type === 'e_money');

  const renderAccountGroup = (title: string, list: Account[], badgeColor: string) => (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mb-6">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${badgeColor}`} />
          <h4 className="font-bold text-sm text-slate-800">{title}</h4>
          <span className="text-xs text-slate-400">({list.length}口座)</span>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {list.map((acc) => (
          <div
            key={acc.id}
            className={`px-4 py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors ${
              !acc.is_active ? 'opacity-60 bg-slate-50/40' : ''
            }`}
          >
            <div className="min-w-[200px]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">{acc.name}</span>
                {acc.is_active ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-medium">
                    <CheckCircle className="w-3 h-3 text-emerald-600" /> 稼働中
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 border border-slate-300 px-1.5 py-0.2 rounded font-medium">
                    <XCircle className="w-3 h-3 text-slate-400" /> 休止
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 whitespace-pre-wrap">
                {acc.description || <span className="italic text-slate-400">用途メモなし</span>}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateAccount(acc.id, { is_active: !acc.is_active })}
                className={`text-xs px-2.5 py-1 rounded font-medium border transition-colors ${
                  acc.is_active
                    ? 'border-slate-300 text-slate-600 hover:bg-slate-100'
                    : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                {acc.is_active ? '休止にする' : '再開する'}
              </button>
              <button
                onClick={() => openEditModal(acc)}
                className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded"
                title="編集"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`口座「${acc.name}」を削除しますか？`)) {
                    deleteAccount(acc.id);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                title="削除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-20">
      {/* 1. 口座マスタ管理 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-sky-600" />
              口座・決済先マスタ
            </h3>
            <p className="text-xs text-slate-500">
              銀行、証券、暗号資産、電子マネーの名称・用途メモ・稼働ステータスを設定します。
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>口座追加</span>
          </button>
        </div>

        {renderAccountGroup('銀行預金口座', bankList, 'bg-sky-500')}
        {renderAccountGroup('証券・暗号資産口座', secList, 'bg-indigo-500')}
        {renderAccountGroup('電子マネー・ウォレット', emList, 'bg-emerald-500')}
      </div>

      {/* 2. 年度繰越機能 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">年度繰越ウィザード</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          前年度の費目（収入・支援・支出・投資）および引落設定、各口座の最新残高を新年度の初期残高へ引き継いで自動生成します。
        </p>

        <form onSubmit={handleCarryOver} className="flex flex-wrap items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">繰越元:</span>
            <select
              value={carryFromYear}
              onChange={(e) => setCarryFromYear(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-bold text-slate-800"
            >
              {years.map((y) => (
                <option key={y.year} value={y.year}>
                  {y.year}年度
                </option>
              ))}
            </select>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">新年度:</span>
            <input
              type="number"
              value={carryToYear}
              onChange={(e) => setCarryToYear(Number(e.target.value))}
              min={2000}
              max={2100}
              className="w-24 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-bold text-slate-800"
              required
            />
          </div>

          <button
            type="submit"
            className="ml-auto px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold transition-colors shadow-sm"
          >
            繰越実行
          </button>
        </form>
      </div>

      {/* 3. データの初期化・バックアップ */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-5 h-5 text-slate-700" />
          <h3 className="text-base font-bold text-slate-900">データメンテナンス</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Excelへのエクスポート、初期データ（SKH2026.xlsx）へのリセットを実行できます。
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => exportToExcel(currentYear, accounts, flowItems, monthlyFlows, monthlyAssets)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>{currentYear}年度 Excel (.xlsx) 出力</span>
          </button>

          <button
            onClick={() => {
              if (confirm('初期サンプルデータ（SKH2026.xlsxの内容）にリセットしますか？入力したデータは初期化されます。')) {
                resetToInitial();
                alert('初期データにリセットしました。');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-rose-500" />
            <span>SKH2026初期データに復元</span>
          </button>
        </div>
      </div>

      {/* 口座作成・編集モーダル */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {modalMode === 'add' ? '口座の追加' : '口座の編集'}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  口座・サービス名 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="例: 三井住友銀行、SBI証券、PayPay"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">口座種別</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as AccountType)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                >
                  <option value="bank">銀行預金</option>
                  <option value="securities">証券・暗号資産</option>
                  <option value="e_money">電子マネー・ウォレット</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">用途・運用メモ</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="例: 給与（メイン）＋投資信託定期／月10000／27日"
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="acc-is-active"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="acc-is-active" className="text-xs text-slate-700 select-none">
                  稼働中（休止中の場合はチェックを外す）
                </label>
              </div>

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
