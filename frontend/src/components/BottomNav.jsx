import React from 'react';
import { useTranslation } from 'react-i18next';

export const BottomNav = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();

  const navItems = [
    { id: 'home', label: t('nav.home'), icon: 'home', activeIcon: 'home' },
    { id: 'crops', label: t('nav.crops'), icon: 'psychology', activeIcon: 'psychology' },
    { id: 'mandi', label: t('nav.mandi'), icon: 'storefront', activeIcon: 'storefront' },
    { id: 'weather', label: t('nav.weather'), icon: 'partly_cloudy_day', activeIcon: 'partly_cloudy_day' },
    { id: 'advise', label: t('nav.advise'), icon: 'notifications_active', activeIcon: 'notifications_active' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-outline-variant/50 max-w-md mx-auto h-[68px] flex items-center justify-around px-2 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center select-none group active:scale-95 transition-transform"
          >
            <div
              className={`flex items-center justify-center w-14 h-7 rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container scale-105 shadow-sm'
                  : 'text-on-surface-variant group-hover:bg-surface-container'
              }`}
            >
              <span
                className={isActive ? 'material-symbols-filled text-[22px]' : 'material-symbols-outlined text-[22px]'}
              >
                {item.icon}
              </span>
            </div>
            <span
              className={`text-[11px] font-medium mt-0.5 transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
