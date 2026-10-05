'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Account, FlowItem, MonthlyValues, YearData, CategoryType, AccountType } from '@/types';
import { initialAccounts, initialFlowItems, initialMonthlyFlows, initialMonthlyAssets, initialYears } from './initialData';

const STORAGE_KEY = 'skh_money_manager_v1';

interface StoreContextType {
  currentYear: number;
  years: YearData[];
  accounts: Account[];
  flowItems: FlowItem[];
  monthlyFlows: { [flowItemId: string]: MonthlyValues };
  monthlyAssets: { [accountId: string]: { [year: number]: MonthlyValues } };
  saveStatus: 'saved' | 'saving';

  setCurrentYear: (year: number) => void;
  updateFlowValue: (flowItemId: string, month: number, value: number) => void;
  updateAssetValue: (accountId: string, year: number, month: number, value: number) => void;
  addFlowItem: (item: Omit<FlowItem, 'id' | 'year' | 'sort_order'>) => void;
  updateFlowItem: (id: string, partial: Partial<FlowItem>) => void;
  deleteFlowItem: (id: string) => void;
  addAccount: (acc: Omit<Account, 'id' | 'sort_order'>) => void;
  updateAccount: (id: string, partial: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addYear: (year: number, memo?: string) => void;
  carryOverYear: (fromYear: number, toYear: number) => void;
  importAllData: (data: {
    accounts: Account[];
    flowItems: FlowItem[];
    monthlyFlows: { [flowItemId: string]: MonthlyValues };
    monthlyAssets: { [accountId: string]: { [year: number]: MonthlyValues } };
    detectedYear: number;
  }) => void;
  resetToInitial: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [years, setYears] = useState<YearData[]>(initialYears);
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [flowItems, setFlowItems] = useState<FlowItem[]>(initialFlowItems);
  const [monthlyFlows, setMonthlyFlows] = useState<{ [flowItemId: string]: MonthlyValues }>(initialMonthlyFlows);
  const [monthlyAssets, setMonthlyAssets] = useState<{ [accountId: string]: { [year: number]: MonthlyValues } }>(initialMonthlyAssets);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 初回ロード
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentYear) setCurrentYear(parsed.currentYear);
        if (parsed.years) setYears(parsed.years);
        if (parsed.accounts) setAccounts(parsed.accounts);
        if (parsed.flowItems) setFlowItems(parsed.flowItems);
        if (parsed.monthlyFlows) setMonthlyFlows(parsed.monthlyFlows);
        if (parsed.monthlyAssets) setMonthlyAssets(parsed.monthlyAssets);
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
    setIsLoaded(true);
  }, []);

  // オートセーブ（Debounced）
  useEffect(() => {
    if (!isLoaded) return;

    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      try {
        const dataToSave = {
          currentYear,
          years,
          accounts,
          flowItems,
          monthlyFlows,
          monthlyAssets,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        setSaveStatus('saved');
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
    }, 400);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [isLoaded, currentYear, years, accounts, flowItems, monthlyFlows, monthlyAssets]);

  // フロー値の更新
  const updateFlowValue = useCallback((flowItemId: string, month: number, value: number) => {
    setMonthlyFlows((prev) => {
      const itemValues = prev[flowItemId] || {};
      return {
        ...prev,
        [flowItemId]: {
          ...itemValues,
          [month]: value,
        },
      };
    });
  }, []);

  // 資産残高の更新
  const updateAssetValue = useCallback((accountId: string, year: number, month: number, value: number) => {
    setMonthlyAssets((prev) => {
      const accYears = prev[accountId] || {};
      const yearValues = accYears[year] || {};
      return {
        ...prev,
        [accountId]: {
          ...accYears,
          [year]: {
            ...yearValues,
            [month]: value,
          },
        },
      };
    });
  }, []);

  // 費目追加
  const addFlowItem = useCallback((item: Omit<FlowItem, 'id' | 'year' | 'sort_order'>) => {
    const newId = `flow-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setFlowItems((prev) => {
      const nextOrder = prev.length + 1;
      const newItem: FlowItem = {
        ...item,
        id: newId,
        year: currentYear,
        sort_order: nextOrder,
      };
      return [...prev, newItem];
    });
    setMonthlyFlows((prev) => ({
      ...prev,
      [newId]: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
    }));
  }, [currentYear]);

  // 費目編集
  const updateFlowItem = useCallback((id: string, partial: Partial<FlowItem>) => {
    setFlowItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...partial } : item)));
  }, []);

  // 費目削除
  const deleteFlowItem = useCallback((id: string) => {
    setFlowItems((prev) => prev.filter((item) => item.id !== id));
    setMonthlyFlows((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  }, []);

  // 口座追加
  const addAccount = useCallback((acc: Omit<Account, 'id' | 'sort_order'>) => {
    const newId = `acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setAccounts((prev) => {
      const newItem: Account = {
        ...acc,
        id: newId,
        sort_order: prev.length + 1,
      };
      return [...prev, newItem];
    });
    setMonthlyAssets((prev) => ({
      ...prev,
      [newId]: {
        [currentYear]: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
      },
    }));
  }, [currentYear]);

  // 口座更新
  const updateAccount = useCallback((id: string, partial: Partial<Account>) => {
    setAccounts((prev) => prev.map((acc) => (acc.id === id ? { ...acc, ...partial } : acc)));
  }, []);

  // 口座削除
  const deleteAccount = useCallback((id: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
  }, []);

  // 年度追加
  const addYear = useCallback((year: number, memo?: string) => {
    setYears((prev) => {
      if (prev.some((y) => y.year === year)) return prev;
      return [...prev, { year, memo }].sort((a, b) => a.year - b.year);
    });
    setCurrentYear(year);
  }, []);

  // 年度繰越（前年度の費目・引落設定・残高最終月を引き継いで新年度を作成）
  const carryOverYear = useCallback((fromYear: number, toYear: number) => {
    // 1. 年度の追加
    setYears((prev) => {
      if (prev.some((y) => y.year === toYear)) return prev;
      return [...prev, { year: toYear, memo: `${toYear}年度 収支・資産管理（${fromYear}年繰越）` }].sort((a, b) => a.year - b.year);
    });

    // 2. 費目のコピー
    setFlowItems((prevItems) => {
      const existingToYearItems = prevItems.filter((i) => i.year === toYear);
      if (existingToYearItems.length > 0) return prevItems; // 既に存在する場合は上書きしない

      const fromYearItems = prevItems.filter((i) => i.year === fromYear);
      const newItems: FlowItem[] = fromYearItems.map((item) => ({
        ...item,
        id: `flow-${toYear}-${item.name}-${Math.random().toString(36).substring(2, 6)}`,
        year: toYear,
      }));

      // 新しい費目の月次初期化 (すべて0)
      setMonthlyFlows((prevFlows) => {
        const nextFlows = { ...prevFlows };
        for (const item of newItems) {
          nextFlows[item.id] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 };
        }
        return nextFlows;
      });

      return [...prevItems, ...newItems];
    });

    // 3. 資産残高の繰越：前年の12月（または最後の入力月）の残高を新年度の1月に初期値として引き継ぐ
    setMonthlyAssets((prevAssets) => {
      const nextAssets = { ...prevAssets };
      for (const acc of accounts) {
        const fromYearValues = prevAssets[acc.id]?.[fromYear] || {};
        // 最終入力月を探す
        let lastVal = 0;
        for (let m = 12; m >= 1; m--) {
          if (fromYearValues[m] !== undefined && fromYearValues[m] !== 0) {
            lastVal = fromYearValues[m];
            break;
          }
        }
        if (!nextAssets[acc.id]) nextAssets[acc.id] = {};
        nextAssets[acc.id][toYear] = {
          1: lastVal,
          2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0,
        };
      }
      return nextAssets;
    });

    setCurrentYear(toYear);
  }, [accounts]);

  // 全体インポート
  const importAllData = useCallback((data: {
    accounts: Account[];
    flowItems: FlowItem[];
    monthlyFlows: { [flowItemId: string]: MonthlyValues };
    monthlyAssets: { [accountId: string]: { [year: number]: MonthlyValues } };
    detectedYear: number;
  }) => {
    setAccounts(data.accounts);
    setFlowItems(data.flowItems);
    setMonthlyFlows((prev) => ({ ...prev, ...data.monthlyFlows }));
    setMonthlyAssets((prev) => ({ ...prev, ...data.monthlyAssets }));
    setYears((prev) => {
      if (prev.some((y) => y.year === data.detectedYear)) return prev;
      return [...prev, { year: data.detectedYear, memo: `${data.detectedYear}年度（インポート）` }].sort((a, b) => a.year - b.year);
    });
    setCurrentYear(data.detectedYear);
  }, []);

  // 初期リセット
  const resetToInitial = useCallback(() => {
    setCurrentYear(2026);
    setYears(initialYears);
    setAccounts(initialAccounts);
    setFlowItems(initialFlowItems);
    setMonthlyFlows(initialMonthlyFlows);
    setMonthlyAssets(initialMonthlyAssets);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        currentYear,
        years,
        accounts,
        flowItems,
        monthlyFlows,
        monthlyAssets,
        saveStatus,
        setCurrentYear,
        updateFlowValue,
        updateAssetValue,
        addFlowItem,
        updateFlowItem,
        deleteFlowItem,
        addAccount,
        updateAccount,
        deleteAccount,
        addYear,
        carryOverYear,
        importAllData,
        resetToInitial,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
