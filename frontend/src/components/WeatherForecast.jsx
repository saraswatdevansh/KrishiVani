import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { api } from '../services/api';
import { getLocalizedCropName } from '../data/cropTranslations';

export const WeatherForecast = ({ targetCrop }) => {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  const [activeCrop, setActiveCrop] = useState(targetCrop || profile?.selected_crop || 'maize');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecastList, setForecastList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const lat = profile?.latitude || 28.6692;
      const lon = profile?.longitude || 77.4538;
      const state = profile?.state || 'Uttar Pradesh';

      const data = await api.getForecast(activeCrop, lat, lon, state);
      setCurrentWeather(data.current_weather);
      setForecastList(data.forecast || []);

      // Auto readout
      if (data.forecast && data.forecast.length > 0) {
        const todayForecast = data.forecast[0];
        const advText = todayForecast.advisory_notes && todayForecast.advisory_notes.length > 0
          ? todayForecast.advisory_notes[0]
          : 'Weather is favorable for farming operations.';
        
        const cropName = getLocalizedCropName(activeCrop, i18n.language);
        let msg = '';
        if (i18n.language === 'hi') {
          msg = `${cropName} के लिए आज का मौसम: तापमान ${todayForecast.temp_high} डिग्री सेल्सियस, बारिश की संभावना ${Math.round(todayForecast.rain_prob * 100)} प्रतिशत। सलाह: ${advText}`;
        } else if (i18n.language === 'pa') {
          msg = `${cropName} ਲਈ ਅੱਜ ਦਾ ਮੌਸਮ: ਤਾਪਮਾਨ ${todayForecast.temp_high} ਡਿਗਰੀ, ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ${Math.round(todayForecast.rain_prob * 100)} ਪ੍ਰਤੀਸ਼ਤ।`;
        } else {
          msg = `Today's forecast for ${cropName}: High ${todayForecast.temp_high}°C, rain probability ${Math.round(todayForecast.rain_prob * 100)}%. ${advText}`;
        }
        speak(msg, i18n.language);
      }
    } catch (err) {
      console.warn('Forecast error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [activeCrop, profile]);

  const handleVoicePlay = () => {
    if (isSpeaking) {
      stop();
      return;
    }
    if (forecastList && forecastList.length > 0) {
      const todayForecast = forecastList[0];
      const cropName = getLocalizedCropName(activeCrop, i18n.language);
      const advText = todayForecast.advisory_notes?.[0] || 'Good conditions for field activities.';
      const msg = `Today's forecast for ${cropName}: Temperature is ${todayForecast.temp_high} Celsius with ${Math.round(todayForecast.rain_prob * 100)}% rain probability. ${advText}`;
      speak(msg, i18n.language);
    }
  };

  return (
    <div className="pb-24 px-4 pt-3 flex flex-col gap-4 max-w-md mx-auto">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">{t('weather.title')}</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            📍 {profile?.village_or_city || profile?.district || 'Ghaziabad'}, {profile?.state || 'Uttar Pradesh'}
          </p>
        </div>
        <button
          onClick={handleVoicePlay}
          className={`w-9 h-9 rounded-full flex items-center justify-center border shadow-sm transition-all ${
            isSpeaking ? 'bg-error text-white animate-pulse' : 'bg-surface-container-lowest text-primary'
          }`}
          title="Voice Readout"
        >
          <span className="material-symbols-filled text-lg">{isSpeaking ? 'volume_up' : 'volume_mute'}</span>
        </button>
      </div>

      {/* Main Today Weather Card */}
      {currentWeather && (
        <div className="bg-gradient-to-br from-primary via-primary-container to-secondary rounded-3xl p-5 text-on-primary shadow-float flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
              {currentWeather.is_live ? '● Live OWM Weather' : '● Forecast'}
            </span>
            <span className="text-xs text-white/90 font-medium">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
            </span>
          </div>

          <div className="flex items-center justify-between my-1">
            <div>
              <div className="text-4xl font-black tracking-tight">{currentWeather.temperature}°C</div>
              <div className="text-xs font-semibold text-white/90 mt-0.5">{currentWeather.description}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-white/80">Feels like {currentWeather.feels_like}°C</div>
              <div className="text-xs font-bold text-white/90 mt-0.5">💧 Humidity {currentWeather.humidity}%</div>
              <div className="text-xs font-bold text-white/90">💨 Wind {currentWeather.wind_speed} km/h</div>
            </div>
          </div>
        </div>
      )}

      {/* 5-Day Forecast List */}
      <div className="flex flex-col gap-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface">5-Day Agricultural Weather & Spray Schedule</h2>
        
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
            <span className="text-xs text-on-surface-variant">Fetching 5-day agro-meteorological forecast...</span>
          </div>
        ) : (
          forecastList.map((day, idx) => {
            const isSafe = day.spray_safe !== false && (day.rain_prob || 0) < 0.4 && (day.wind_speed || 0) < 18;
            return (
              <div
                key={day.date || idx}
                className="bg-surface-container-lowest rounded-2xl p-3.5 shadow-card border border-outline-variant/40 flex flex-col gap-2 hover:border-primary/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-xs text-on-surface">{day.day_name}</span>
                    <span className="text-[11px] text-on-surface-variant">{day.weather_condition}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-primary">{day.temp_high}°C</span>
                    <span className="text-[11px] text-on-surface-variant font-medium">/ {day.temp_low}°C</span>
                  </div>
                </div>

                {/* Badges Row */}
                <div className="flex items-center justify-between pt-1 border-t border-outline-variant/30 text-[11px]">
                  <div className="flex items-center gap-1 text-on-surface-variant">
                    <span>🌧️ Rain: <strong>{Math.round((day.rain_prob || 0) * 100)}%</strong></span>
                    <span className="mx-1">•</span>
                    <span>💨 <strong>{Math.round(day.wind_speed || 10)} km/h</strong></span>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isSafe
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-error-container text-on-error-container'
                    }`}
                  >
                    {isSafe ? '🌿 Spray Safe' : '⚠️ Delay Spray'}
                  </span>
                </div>

                {/* Smart Advisory Snippet */}
                {day.advisory_notes && day.advisory_notes.length > 0 && (
                  <p className="text-[10px] text-secondary font-medium bg-surface-container-low/60 rounded-xl p-2 mt-0.5">
                    💡 {day.advisory_notes[0]}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
