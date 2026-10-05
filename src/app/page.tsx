'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { MoneyFlowView } from '@/components/MoneyFlowView';
import { AssetBalanceView } from '@/components/AssetBalanceView';
import { DashboardView } from '@/components/DashboardView';
import { MasterSettingsView } from '@/components/MasterSettingsView';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'flow' | 'assets' | 'dashboard' | 'master'>('flow');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1">
        {activeTab === 'flow' && <MoneyFlowView />}
        {activeTab === 'assets' && <AssetBalanceView />}
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'master' && <MasterSettingsView />}
      </main>
    </div>
  );
}
