import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MyFarm } from './MyFarm';
import { AIRecommendations } from './AIRecommendations';

export const PersonalisedFarming = ({ onNavigateWeather }) => {
  const [activeSubTab, setActiveSubTab] = useState('my-farm');
  const { t } = useTranslation();

  return (
    <div className="pb-24 px-4 pt-3 flex flex-col gap-4 max-w-md mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-on-surface">{t('farming.title')}</h1>
        <p className="text-xs text-on-surface-variant mt-0.5">{t('farming.subtitle')}</p>
      </div>

      {/* Sub-tab pills */}
      <div className="flex bg-surface-container rounded-2xl p-1 gap-1">
        <button
          onClick={() => setActiveSubTab('my-farm')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'my-farm'
              ? 'bg-surface-container-lowest text-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-sm">agriculture</span>
          {t('farming.tab_my_farm')}
        </button>
        <button
          onClick={() => setActiveSubTab('ai-recommend')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'ai-recommend'
              ? 'bg-surface-container-lowest text-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-sm">psychology</span>
          {t('farming.tab_ai_recommend')}
        </button>
      </div>

      {/* Content */}
      {activeSubTab === 'my-farm' && <MyFarm />}
      {activeSubTab === 'ai-recommend' && (
        <AIRecommendations 
          onNavigateWeather={onNavigateWeather} 
          onSwitchToFarm={() => setActiveSubTab('my-farm')}
        />
      )}
    </div>
  );
};
