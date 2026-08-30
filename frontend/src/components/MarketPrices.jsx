import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { getLocalizedCropName, CROP_TRANSLATIONS } from '../data/cropTranslations';

const POPULAR_STATES = [
  'Punjab',
  'Haryana',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Maharashtra',
  'Rajasthan',
  'Gujarat',
  'Bihar',
  'West Bengal'
];

export const MarketPrices = () => {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState(profile?.state || 'Punjab');
  const [pricesList, setPricesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPrices = async (stateToFetch) => {
    setLoading(true);
    try {
      const data = await api.getMarketPrices(null, stateToFetch, profile?.district);
      setPricesList(data || []);
    } catch (err) {
      console.warn('Market prices error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices(selectedState);
  }, [selectedState]);

  const filteredPrices = pricesList.filter(item => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    const cropName = (item.crop || '').toLowerCase();
    const commName = (item.commodity || '').toLowerCase();
    const marketName = (item.market || '').toLowerCase();
    const districtName = (item.district || '').toLowerCase();
    const locName = getLocalizedCropName(item.crop, i18n.language).toLowerCase();
    return (
      cropName.includes(term) ||
      commName.includes(term) ||
      marketName.includes(term) ||
      districtName.includes(term) ||
      locName.includes(term)
    );
  });

  return (
    <div className="pb-24 px-4 pt-3 flex flex-col gap-4 max-w-md mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-on-surface">{t('mandi.title')}</h1>
        <p className="text-xs text-on-surface-variant mt-0.5">{t('mandi.subtitle')}</p>
      </div>

      {/* State Filter & Search */}
      <div className="flex flex-col gap-2.5">
        {/* Search input */}
        <div className="flex items-center bg-surface-container-lowest border border-outline-variant/60 rounded-2xl px-3.5 h-11 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant mr-2">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop, mandi or district..."
            className="flex-1 bg-transparent text-xs font-medium text-on-surface outline-none placeholder:text-on-surface-variant/50"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-on-surface-variant hover:text-on-surface p-1">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* State Quick Horizontal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-0.5">
          {POPULAR_STATES.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedState(st)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full flex-shrink-0 transition-all ${
                selectedState === st
                  ? 'bg-primary text-on-primary shadow-sm scale-105'
                  : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/50 hover:bg-surface-container-low'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Active Region Status Badge */}
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-bold text-primary flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            Mandis in {selectedState}
          </span>
          <span className="text-[11px] text-on-surface-variant font-medium">
            {filteredPrices.length} Mandis Listed
          </span>
        </div>
      </div>

      {/* Price Cards List */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
            <span className="text-xs font-semibold text-on-surface-variant">
              Fetching real-time {selectedState} Mandi arrivals...
            </span>
          </div>
        ) : filteredPrices.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-3xl p-8 text-center text-xs text-on-surface-variant shadow-card border border-outline-variant/40">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">store_mall_directory</span>
            <p className="font-semibold">No mandis found matching &quot;{searchQuery}&quot; in {selectedState}.</p>
            <p className="text-[11px] text-on-surface-variant/70 mt-1">Try another search term or state.</p>
          </div>
        ) : (
          filteredPrices.map((item, idx) => {
            const cropKey = item.crop?.toLowerCase();
            const meta = CROP_TRANSLATIONS[cropKey] || {};
            const isHighDemand = item.demand === 'High';

            return (
              <div
                key={`${item.commodity}-${item.market}-${idx}`}
                className="bg-surface-container-lowest rounded-3xl p-4 shadow-card border border-outline-variant/40 flex flex-col gap-3 hover:border-primary/40 transition-all"
              >
                {/* Top Row: Commodity & Location Badges */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-surface-container-low flex-shrink-0 border border-outline-variant/30">
                      <img
                        src={meta.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'}
                        alt={item.crop}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-on-surface">
                        {getLocalizedCropName(item.crop, i18n.language)}
                        <span className="text-[11px] font-normal text-on-surface-variant ml-1">
                          ({item.commodity})
                        </span>
                      </h3>
                      <div className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px] text-primary">storefront</span>
                        <span className="font-bold text-on-surface">{item.market}</span>
                        {item.district && (
                          <>
                            <span>•</span>
                            <span className="text-secondary font-medium">{item.district}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Demand Pill Badge */}
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full flex-shrink-0 ${
                      isHighDemand
                        ? 'bg-error-container text-on-error-container border border-error/30'
                        : 'bg-secondary-container text-on-secondary-container border border-secondary/30'
                    }`}
                  >
                    {isHighDemand ? '🔥 High Demand' : '✨ Normal'}
                  </span>
                </div>

                {/* Price Matrix */}
                <div className="grid grid-cols-3 gap-2 bg-surface-container-low/80 rounded-2xl p-2.5 text-center border border-outline-variant/30">
                  <div>
                    <span className="text-[10px] text-on-surface-variant font-medium block">{t('mandi.min_price')}</span>
                    <span className="text-xs font-bold text-on-surface">
                      ₹{Math.round(item.min_price)?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="border-x border-outline-variant/40">
                    <span className="text-[10px] text-primary font-extrabold block uppercase tracking-wider">{t('mandi.modal_price')}</span>
                    <span className="text-sm font-black text-primary">
                      ₹{Math.round(item.modal_price)?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-on-surface-variant font-normal block">/Quintal</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant font-medium block">{t('mandi.max_price')}</span>
                    <span className="text-xs font-bold text-on-surface">
                      ₹{Math.round(item.max_price)?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Footer Info & Verification */}
                <div className="flex items-center justify-between text-[11px] px-1 text-on-surface-variant">
                  <span className="text-secondary font-semibold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[14px]">
                      {item.trend === 'up' ? 'trending_up' : 'trending_flat'}
                    </span>
                    <span>{item.trend === 'up' ? 'Rising Trend' : 'Stable Market'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.is_live ? 'bg-green-500 animate-pulse' : 'bg-secondary'}`}></span>
                    <span>{item.is_live ? 'Live Agmarknet' : `${item.state} APMC`}</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Call Expert Banner CTA */}
      <div className="bg-surface-container-low rounded-3xl p-4 border border-primary/20 flex items-center justify-between shadow-sm mt-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary text-on-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">support_agent</span>
          </div>
          <div>
            <div className="font-bold text-xs text-on-surface">Kisan Call Centre (KCC)</div>
            <div className="text-[10px] text-on-surface-variant">Toll-free Mandi Hotline: 1800-180-1551</div>
          </div>
        </div>
        <a
          href="tel:18001801551"
          className="bg-primary hover:bg-primary-container text-on-primary font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all active:scale-95"
        >
          Call
        </a>
      </div>
    </div>
  );
};
