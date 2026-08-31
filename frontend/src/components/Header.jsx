import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export const Header = ({ onOpenLanguage, onOpenProfile, onOpenAlerts, activeTab, hasUnreadAlerts }) => {
  const { t, i18n } = useTranslation();
  const { user, profile } = useAuth();

  const getLanguageLabel = (lang) => {
    switch (lang) {
      case 'hi': return 'हिन्दी';
      case 'pa': return 'ਪੰਜਾਬੀ';
      default: return 'English';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-outline-variant/40 px-4 py-2.5 flex items-center justify-between shadow-sm">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-2.5 cursor-pointer">
        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-primary/20 p-0.5 shadow-xs">
          <img 
            src="/assets/logo.png" 
            alt="KrishiVani Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg tracking-tight text-primary">KRISHIVANI</span>
            <span className="text-[10px] uppercase tracking-wider bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded-full font-semibold">
              AI
            </span>
          </div>
          {profile?.village_or_city && (
            <p className="text-[11px] text-on-surface-variant flex items-center gap-0.5 -mt-0.5">
              <span className="material-symbols-outlined text-[13px]">location_on</span>
              {profile.village_or_city}, {profile.state}
            </p>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5">
        {/* Language Pill Switcher */}
        <button
          onClick={onOpenLanguage}
          className="flex items-center gap-1 bg-surface-container-low hover:bg-surface-container border border-outline-variant/50 text-on-surface text-xs font-medium px-2.5 py-1.5 rounded-full transition-all active:scale-95"
          title="Change Language"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">translate</span>
          <span>{getLanguageLabel(i18n.language)}</span>
        </button>

        {/* Notifications Button */}
        <button
          onClick={onOpenAlerts}
          className="relative p-2 rounded-full hover:bg-surface-container-high text-on-surface transition-transform active:scale-90"
          title="Alerts"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          {hasUnreadAlerts && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-surface animate-pulse"></span>
          )}
        </button>

        {/* Profile Avatar */}
        <button
          onClick={onOpenProfile}
          className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-semibold text-xs border border-outline-variant overflow-hidden ml-1 hover:ring-2 hover:ring-primary/40 transition-all active:scale-95"
          title="Farmer Profile"
        >
          {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user?.name ? user.name.charAt(0).toUpperCase() : 'K'}
        </button>
      </div>
    </header>
  );
};
