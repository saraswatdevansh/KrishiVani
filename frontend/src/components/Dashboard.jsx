import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { api } from '../services/api';
import { getLocalizedCropName, CROP_TRANSLATIONS } from '../data/cropTranslations';

export const Dashboard = ({ onNavigate, onOpenSoilModal }) => {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const { speak, stop, isSpeaking, isSupported } = useSpeechSynthesis();

  const [weather, setWeather] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [topCrop, setTopCrop] = useState(profile?.selected_crop || 'maize');
  const [loading, setLoading] = useState(true);

  const selectedCropMeta = CROP_TRANSLATIONS[topCrop.toLowerCase()] || CROP_TRANSLATIONS.maize || CROP_TRANSLATIONS.rice;

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const lat = profile?.latitude || 28.6692;
        const lon = profile?.longitude || 77.4538;
        const state = profile?.state || 'Uttar Pradesh';
        const crop = profile?.selected_crop || 'maize';

        const forecastData = await api.getForecast(crop, lat, lon, state);
        if (forecastData.current_weather) {
          setWeather(forecastData.current_weather);
        }
        if (forecastData.urgent_alerts) {
          setAlerts(forecastData.urgent_alerts);
        }
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [profile]);

  const handleVoiceAdvisory = () => {
    if (isSpeaking) {
      stop();
      return;
    }

    const farmerName = profile?.full_name || 'Farmer';
    const cropName = getLocalizedCropName(topCrop, i18n.language);
    const temp = weather?.temperature ? `${weather.temperature} degree` : '28 degree';

    let speechText = '';
    if (i18n.language === 'hi') {
      speechText = `नमस्ते ${farmerName} जी। आपके क्षेत्र ${profile?.village_or_city || profile?.state || 'खेत'} में तापमान ${temp} सेल्सियस है। आपकी मुख्य फसल ${cropName} के लिए मौसम अनुकूल है। अगले दो दिनों में मौसम स्थिति को देखते हुए यूरिया और कीटनाशक छिड़काव की योजना बनाएं।`;
    } else if (i18n.language === 'pa') {
      speechText = `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ${farmerName} ਜੀ। ਤੁਹਾਡੇ ਇਲਾਕੇ ਵਿੱਚ ਤਾਪਮਾਨ ${temp} ਸੈਲਸੀਅਸ ਹੈ। ਤੁਹਾਡੀ ਮੁੱਖ ਫਸਲ ${cropName} ਲਈ ਖੇਤੀ ਸਲਾਹ ਉਪਲਬਧ ਹੈ।`;
    } else {
      speechText = `Namaste ${farmerName}. Current live temperature in ${profile?.village_or_city || profile?.state || 'your region'} is ${temp} Celsius. For your primary crop ${cropName}, weather conditions are currently favorable.`;
    }

    speak(speechText, i18n.language);
  };

  return (
    <div className="pb-24 px-4 pt-3 flex flex-col gap-4 max-w-md mx-auto">
      {/* 1. Farmer Welcome Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">
            {t('dashboard.greeting')}, {profile?.full_name?.split(' ')[0] || 'Farmer'}! 👋
          </h1>
          <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[15px] text-primary">pin_drop</span>
            <span className="font-bold text-on-surface">
              {profile?.village_or_city || profile?.district || 'Ghaziabad'}, {profile?.state || 'Uttar Pradesh'}
            </span>
            <span className="mx-1">•</span>
            <span>{profile?.farm_size || '2.0'} {profile?.farm_size_unit || 'Acres'}</span>
          </p>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-secondary-container/70 border border-secondary/20 p-0.5 flex items-center justify-center overflow-hidden shadow-sm">
          <img
            src={selectedCropMeta?.image || 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80'}
            alt={topCrop}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      </div>

      {/* 2. Voice Advisory Hero CTA (Mic Pulse Button) */}
      <div className="bg-gradient-to-br from-primary via-primary-container to-secondary rounded-3xl p-5 text-on-primary shadow-float relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute -left-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-lg pointer-events-none"></div>

        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={handleVoiceAdvisory}
            className={`w-16 h-16 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center shadow-lg transition-transform active:scale-95 flex-shrink-0 ${
              isSpeaking ? 'animate-mic-pulse ring-4 ring-secondary-container' : 'hover:scale-105'
            }`}
            title="Listen to Advisory"
          >
            <span className={`material-symbols-filled text-3xl ${isSpeaking ? 'text-error animate-bounce' : 'text-primary'}`}>
              {isSpeaking ? 'graphic_eq' : 'mic'}
            </span>
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] uppercase tracking-wider font-bold bg-white/20 px-2 py-0.5 rounded-full">
                {isSpeaking ? t('dashboard.voice_speaking') : t('dashboard.voice_cta_title')}
              </span>
            </div>
            <p className="text-xs text-on-primary/90 mt-1 font-medium leading-relaxed">
              {isSpeaking
                ? 'KrishiVani is reading your advisory aloud. Tap mic to stop.'
                : t('dashboard.voice_cta_desc')}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Live Weather Summary Card */}
      <div 
        onClick={() => onNavigate('weather')}
        className="bg-surface-container-lowest rounded-3xl p-4 shadow-card border border-outline-variant/40 flex items-center justify-between cursor-pointer hover:border-primary/40 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary">
            <span className="material-symbols-filled text-3xl text-secondary">
              {weather?.rain_1h > 0 ? 'rainy' : 'partly_cloudy_day'}
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-on-surface">
                {weather?.temperature ? `${weather.temperature}°C` : '32°C'}
              </span>
              <span className="text-xs font-semibold text-on-surface-variant">
                {weather?.description || 'Partly Cloudy'}
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant flex items-center gap-2 mt-0.5">
              <span>💧 Humidity: {weather?.humidity || 60}%</span>
              <span>💨 Wind: {weather?.wind_speed || 12} km/h</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-secondary bg-secondary-container px-2 py-0.5 rounded-full block text-center">
            {weather?.is_live ? '● Live OWM' : '● Forecast'}
          </span>
          <span className="text-[10px] text-on-surface-variant/80 mt-1 block">
            {profile?.village_or_city || 'Local Area'}
          </span>
        </div>
      </div>

      {/* 4. Active Farm Crop Card */}
      <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-card border border-outline-variant/40 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">psychology</span>
            <h2 className="text-sm font-bold text-on-surface">{t('dashboard.my_crop_title')}</h2>
          </div>
          <button
            onClick={() => onNavigate('crops')}
            className="text-xs font-bold text-primary hover:underline"
          >
            {t('dashboard.switch_crop_btn')}
          </button>
        </div>

        <div className="flex items-center gap-3 bg-surface-container-low/70 rounded-2xl p-3 border border-outline-variant/30">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container flex-shrink-0">
            <img
              src={selectedCropMeta?.image || 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80'}
              alt={topCrop}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-on-surface truncate">
                {getLocalizedCropName(topCrop, i18n.language)}
              </h3>
              <span className="text-[10px] font-bold bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full">
                Active Crop
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Region: <strong className="text-on-surface">{profile?.state || 'Uttar Pradesh'}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 5. Smart Bento Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {/* Crop Recommendations Button */}
        <div
          onClick={() => onNavigate('crops')}
          className="bg-surface-container-lowest rounded-3xl p-4 shadow-card border border-outline-variant/40 flex flex-col justify-between h-32 cursor-pointer hover:border-primary/40 transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-filled text-2xl">potted_plant</span>
          </div>
          <div>
            <div className="text-xs font-black text-on-surface">{t('dashboard.action_crops')}</div>
            <div className="text-[10px] text-on-surface-variant">Profit-aware AI Match</div>
          </div>
        </div>

        {/* Mandi Rates Button */}
        <div
          onClick={() => onNavigate('mandi')}
          className="bg-surface-container-lowest rounded-3xl p-4 shadow-card border border-outline-variant/40 flex flex-col justify-between h-32 cursor-pointer hover:border-primary/40 transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-filled text-2xl">storefront</span>
          </div>
          <div>
            <div className="text-xs font-black text-on-surface">{t('dashboard.action_mandi')}</div>
            <div className="text-[10px] text-on-surface-variant">Live Agmarknet Prices</div>
          </div>
        </div>
      </div>
    </div>
  );
};
