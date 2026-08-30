import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getLocalizedCropName } from '../data/cropTranslations';

export const AlertsView = () => {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      title: "Weather Alert: Heavy Rain Expected",
      time: "2m ago",
      description: "Precipitation expected in the next 48 hours. Avoid top-dressing fertilizer and ensure drainage channels in field are open.",
      severity: "urgent", // red
      icon: "cloud_alert",
      isUnread: true
    },
    {
      id: 2,
      title: "Urgent Farm Advisory: Pest / Yellow Rust Watch",
      time: "1h ago",
      description: `Possible Yellow Rust & fungal spore conditions detected in neighboring farms for ${getLocalizedCropName(profile?.selected_crop || 'rice', i18n.language)}. Inspect lower leaf canopy immediately.`,
      severity: "urgent", // red
      icon: "crisis_alert",
      isUnread: true
    },
    {
      id: 3,
      title: "Crop Stage Update",
      time: "Yesterday",
      description: `Your ${getLocalizedCropName(profile?.selected_crop || 'rice', i18n.language)} crop has entered the active 'Vegetative Growth' stage. Optimal time for secondary weeding and balanced micro-nutrient spray.`,
      severity: "normal", // green
      icon: "eco",
      isUnread: false
    },
    {
      id: 4,
      title: "Market Price Alert: Mandi Price Up +5%",
      time: "Yesterday",
      description: `Mandi prices in ${profile?.district || 'Sonipat / Ludhiana'} Mandi increased by 5% this week. Strong trading volume reported.`,
      severity: "normal", // green
      icon: "payments",
      isUnread: false
    }
  ]);

  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isUnread: false })));
  };

  return (
    <div className="pb-24 px-4 pt-3 flex flex-col gap-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">{t('alerts.title')}</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">{t('alerts.subtitle')}</p>
        </div>
        <button
          onClick={markAllRead}
          className="text-xs font-bold text-primary hover:underline bg-secondary-container/50 px-3 py-1.5 rounded-full"
        >
          {t('alerts.mark_read')}
        </button>
      </div>

      {/* Alerts List */}
      <div className="flex flex-col gap-3">
        {alerts.map((item) => {
          const isUrgent = item.severity === 'urgent';
          return (
            <div
              key={item.id}
              className={`bg-surface-container-lowest rounded-3xl p-4 shadow-card border-l-4 transition-all relative overflow-hidden ${
                isUrgent ? 'border-l-error border-y border-r border-outline-variant/40' : 'border-l-secondary border-y border-r border-outline-variant/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  isUrgent ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'
                }`}>
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-on-surface pr-2">{item.title}</h3>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-on-surface-variant whitespace-nowrap">{item.time}</span>
                      {item.isUnread && (
                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
