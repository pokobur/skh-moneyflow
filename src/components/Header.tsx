'use client';

import React, { useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { exportToExcel, parseExcelFile } from '@/lib/excelExportImport';
import {
  Calendar,
  Download,
  Upload,
  PlusCircle,
  RotateCcw,
  CheckCircle2,
  Loader2,
  TableProperties,
  Landmark,
  LayoutDashboard,
  Settings,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'flow' | 'assets' | 'dashboard' | 'master';
  setActiveTab: (tab: 'flow' | 'assets' | 'dashboard' | 'master') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentYear,
    years,
    accounts,
    flowItems,
    monthlyFlows,
    monthlyAssets,
    saveStatus,
    setCurrentYear,
    addYear,
    carryOverYear,
    importAllData,
    resetToInitial,
  } = useStore();

  const [isCarryOverOpen, setIsCarryOverOpen] = useState(false);
  const [newYearInput, setNewYearInput] = useState(currentYear + 1);
  const [isImportHelpOpen, setIsImportHelpOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportToExcel(currentYear, accounts, flowItems, monthlyFlows, monthlyAssets);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseExcelFile(buffer, currentYear, accounts, flowItems);
      importAllData(parsed);
      alert(`「${file.name}」のインポートが完了しました（${parsed.detectedYear}年度）。`);
    } catch (err) {
      console.error(err);
      alert('エクセルファイルの読み込みに失敗しました。');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCarryOverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (years.some((y) => y.year === newYearInput)) {
      alert(`${newYearInput}年は既に存在します。`);
      return;
    }
    carryOverYear(currentYear, newYearInput);
    setIsCarryOverOpen(false);
  };

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-50">
      {/* 上段: アプリタイトル、年度選択、保存ステータス、アクションボタン */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500 rounded-lg text-white shadow-inner flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
              SKHマネーフロー
            </h1>
          </div>
        </div>

        {/* 中央: 年度セレクター & 新年度作成 */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
          <Calendar className="w-4 h-4 text-sky-400 ml-1" />
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer pr-2"
          >
            {years.map((y) => (
              <option key={y.year} value={y.year} className="bg-slate-900 text-white">
                {y.year}年度
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setNewYearInput(Math.max(...years.map((y) => y.year)) + 1);
              setIsCarryOverOpen(true);
            }}
            className="flex items-center gap-1 text-xs bg-sky-600 hover:bg-sky-500 text-white px-2.5 py-1 rounded transition-colors shadow-sm"
            title="次年度を作成・繰越"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>新年度作成</span>
          </button>
        </div>

        {/* 右側: 保存ステータス & 入出力ボタン */}
        <div className="flex items-center gap-2">
          {/* 保存ステータス */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-xs border border-slate-700 text-slate-300">
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span className="text-amber-300 text-xs">保存中...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 text-xs">自動保存済</span>
              </>
            )}
          </div>

          {/* インポート */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-2.5 py-1.5 rounded transition-colors"
            title="Excelファイルのインポート"
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">インポート</span>
          </button>

          {/* エクスポート */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1 text-xs bg-emerald-700 hover:bg-emerald-600 text-white font-medium px-2.5 py-1.5 rounded transition-colors shadow-sm"
            title="Excelファイル (.xlsx) としてダウンロード"
          >
            <Download className="w-3.5 h-3.5" />
            <span>エクスポート</span>
          </button>

          {/* リセット */}
          <button
            onClick={() => {
              if (confirm('初期サンプルデータにリセットしますか？')) {
                resetToInitial();
              }
            }}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
            title="初期データに復元"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 下段: タブナビゲーション */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 flex overflow-x-auto">
        <button
          onClick={() => setActiveTab('flow')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'flow'
              ? 'border-sky-500 text-sky-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <TableProperties className="w-4 h-4" />
          <span>マネーフロー（収支・投資）</span>
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'assets'
              ? 'border-sky-500 text-sky-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>資産残高（口座・証券・電子）</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'border-sky-500 text-sky-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>年間ダッシュボード</span>
        </button>

        <button
          onClick={() => setActiveTab('master')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'master'
              ? 'border-sky-500 text-sky-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>口座・設定マスタ</span>
        </button>
      </div>

      {/* 新年度作成モーダル */}
      {isCarryOverOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl text-slate-100">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-sky-400">
              <PlusCircle className="w-5 h-5" />
              新年度の作成 & 繰越
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {currentYear}年度の費目構成・引落設定を引き継ぎ、各口座の最新残高を新年度の1月に初期残高としてセットします。
            </p>
            <form onSubmit={handleCarryOverSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  作成する対象年度
                </label>
                <input
                  type="number"
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(Number(e.target.value))}
                  min={2000}
                  max={2100}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-sky-500 text-sm"
                  required
                />
              </div>

              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-slate-200">引き継ぎ内容：</p>
                <p>・収入・支援・支出・投資の費目および引落設定</p>
                <p>・前年度の最終入力月の口座残高を新年度1月の初期残高へ自動反映</p>
                <p>・新年度の収支データは0クリアで入力スタンバイ</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCarryOverOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
                >
                  引き継いで作成
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
