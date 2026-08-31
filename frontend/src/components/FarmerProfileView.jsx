import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getLocalizedCropName } from '../data/cropTranslations';

export const FarmerProfileView = ({ onEditProfile, onOpenLanguage }) => {
  const { t, i18n } = useTranslation();
  const { user, profile, logout } = useAuth();

  const getLanguageName = (lang) => {
    switch (lang) {
      case 'hi': return 'हिन्दी (Hindi)';
      case 'pa': return 'ਪੰਜਾਬੀ (Punjabi)';
      default: return 'English';
    }
  };

  return (
    <div className="pb-24 px-4 pt-3 flex flex-col gap-4 max-w-md mx-auto">
      {/* Top Profile Card */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-card border border-outline-variant/40 flex flex-col items-center relative overflow-hidden text-center">
        {/* Soft background header */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-secondary-container/60 to-transparent"></div>

        {/* Farmer Avatar */}
        <div className="w-24 h-24 rounded-full border-4 border-surface-container-lowest shadow-md overflow-hidden relative z-10 mb-3 bg-surface-container-high">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
            alt="Farmer Portrait"
            className="w-full h-full object-cover"
          />
        </div>

        <h1 className="text-xl font-black text-on-surface z-10">
          {profile?.full_name || user?.name || 'Harpreet Singh'}
        </h1>
        
        <p className="text-xs text-on-surface-variant flex items-center gap-1 z-10 mt-1">
          <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
          <span>{profile?.village_or_city || profile?.district || 'Farm Location'}{profile?.state ? `, ${profile.state}` : ''}</span>
        </p>

        <div className="mt-3 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 z-10 border border-secondary/30">
          <span className="material-symbols-filled text-sm text-secondary">verified</span>
          <span>{t('profile.member_badge')}</span>
        </div>
      </div>

      {/* Farm & Soil Details Bento Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-card border border-outline-variant/40 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant">Farm Size</span>
          <span className="text-base font-black text-on-surface">
            {profile?.farm_size || '2.5'} {profile?.farm_size_unit || 'Acres'}
          </span>
          <span className="text-[10px] text-secondary font-semibold">● Small & Marginal Farmer</span>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-card border border-outline-variant/40 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant">Selected Crop</span>
          <span className="text-base font-black text-primary truncate">
            {getLocalizedCropName(profile?.selected_crop || 'rice', i18n.language)}
          </span>
          <span className="text-[10px] text-on-surface-variant font-medium">Optimal Season</span>
        </div>
      </div>

      {/* Soil Health Card Summary */}
      <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-card border border-outline-variant/40 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-filled text-primary text-base">science</span>
            Soil Health Card (SHC) Values
          </h2>
          <button
            onClick={onEditProfile}
            className="text-[11px] font-bold text-primary hover:underline"
          >
            Edit
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-surface-container-low rounded-xl p-2.5 border border-outline-variant/30">
            <span className="text-[10px] font-bold text-secondary block">Nitrogen (N)</span>
            <span className="text-sm font-black text-on-surface">{profile?.nitrogen || 90}</span>
            <span className="text-[9px] text-on-surface-variant block">kg/ha</span>
          </div>
          <div className="bg-surface-container-low rounded-xl p-2.5 border border-outline-variant/30">
            <span className="text-[10px] font-bold text-secondary block">Phosphorus (P)</span>
            <span className="text-sm font-black text-on-surface">{profile?.phosphorus || 42}</span>
            <span className="text-[9px] text-on-surface-variant block">kg/ha</span>
          </div>
          <div className="bg-surface-container-low rounded-xl p-2.5 border border-outline-variant/30">
            <span className="text-[10px] font-bold text-secondary block">Potassium (K)</span>
            <span className="text-sm font-black text-on-surface">{profile?.potassium || 43}</span>
            <span className="text-[9px] text-on-surface-variant block">kg/ha</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-medium text-on-surface-variant bg-surface-container-low/60 rounded-xl px-3 py-2 border border-outline-variant/30">
          <span>Soil pH: <strong className="text-on-surface">{profile?.ph || 6.5}</strong></span>
          <span>Rainfall: <strong className="text-on-surface">{profile?.rainfall || 175} mm</strong></span>
        </div>
      </div>

      {/* Language & Settings */}
      <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-card border border-outline-variant/40 flex flex-col gap-2">
        <div 
          onClick={onOpenLanguage}
          className="flex items-center justify-between py-2 border-b border-outline-variant/30 cursor-pointer hover:opacity-80"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-xl">language</span>
            <div>
              <div className="text-xs font-bold text-on-surface">App Language</div>
              <div className="text-[10px] text-on-surface-variant">{getLanguageName(i18n.language)}</div>
            </div>
          </div>
          <span className="material-symbols-outlined text-lg text-on-surface-variant">chevron_right</span>
        </div>

        <div className="flex items-center justify-between py-2 cursor-pointer hover:opacity-80" onClick={onEditProfile}>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-xl">manage_accounts</span>
            <div>
              <div className="text-xs font-bold text-on-surface">Update Farmer Profile</div>
              <div className="text-[10px] text-on-surface-variant">Modify village, GPS location, soil data</div>
            </div>
          </div>
          <span className="material-symbols-outlined text-lg text-on-surface-variant">chevron_right</span>
        </div>
      </div>

      {/* Logout CTA */}
      <button
        onClick={logout}
        className="w-full h-11 bg-error-container/60 hover:bg-error-container text-error border border-error/30 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] mt-1"
      >
        <span className="material-symbols-outlined text-lg">logout</span>
        <span>{t('profile.logout_btn')}</span>
      </button>
    </div>
  );
};
