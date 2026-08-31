import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { api } from '../services/api';
import { getLocalizedCropName, getLocalizedWeatherCondition, getLocalizedDayName, localizeAdvisory } from '../data/cropTranslations';

export const WeatherForecast = ({ targetCrop }) => {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  const [activeCrop, setActiveCrop] = useState(targetCrop || profile?.selected_crop || 'rice');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecastList, setForecastList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const lat = profile?.latitude || 30.9010;
      const lon = profile?.longitude || 75.8573;
      const state = profile?.state || 'Punjab';

      const data = await api.getForecast(activeCrop, lat, lon, state);
      setCurrentWeather(data.current_weather);
      setForecastList(data.forecast || []);

      // Auto readout
      if (data.forecast && data.forecast.length > 0) {
        const todayForecast = data.forecast[0];
        const advText = todayForecast.advisory_notes && todayForecast.advisory_notes.length > 0
          ? localizeAdvisory(todayForecast.advisory_notes[0], i18n.language)
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
      const advText = localizeAdvisory(todayForecast.advisory_notes?.[0] || 'Good conditions for field activities.', i18n.language);
      const msg = i18n.language === 'hi'
        ? `${cropName} के लिए मौसम: तापमान ${todayForecast.temp_high} डिग्री सेल्सियस, बारिश की संभावना ${Math.round((todayForecast.rain_prob || 0) * 100)}%। ${advText}`
        : i18n.language === 'pa'
        ? `${cropName} ਲਈ ਮੌਸਮ: ਤਾਪਮਾਨ ${todayForecast.temp_high} ਡਿਗਰੀ, ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ${Math.round((todayForecast.rain_prob || 0) * 100)}%। ${advText}`
        : `Today's forecast for ${cropName}: Temperature is ${todayForecast.temp_high} Celsius with ${Math.round(todayForecast.rain_prob * 100)}% rain probability. ${advText}`;
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
              {currentWeather.is_live
                ? (i18n.language === 'hi' ? '● लाइव मौसम' : i18n.language === 'pa' ? '● ਲਾਈਵ ਮੌਸਮ' : '● Live OWM Weather')
                : (i18n.language === 'hi' ? '● पूर्वानुमान' : '● Forecast')}
            </span>
            <span className="text-xs text-white/90 font-medium">
              {new Date().toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'pa' ? 'pa-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
            </span>
          </div>

          <div className="flex items-center justify-between my-1">
            <div>
              <div className="text-4xl font-black tracking-tight">{currentWeather.temperature}°C</div>
              <div className="text-xs font-semibold text-white/90 mt-0.5">
                {getLocalizedWeatherCondition(currentWeather.description, i18n.language)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-white/80">
                {i18n.language === 'hi' ? `महसूस ${currentWeather.feels_like}°C` : i18n.language === 'pa' ? `ਮਹਿਸੂਸ ${currentWeather.feels_like}°C` : `Feels like ${currentWeather.feels_like}°C`}
              </div>
              <div className="text-xs font-bold text-white/90 mt-0.5">
                {i18n.language === 'hi' ? `💧 नमी ${currentWeather.humidity}%` : i18n.language === 'pa' ? `💧 ਨਮੀ ${currentWeather.humidity}%` : `💧 Humidity ${currentWeather.humidity}%`}
              </div>
              <div className="text-xs font-bold text-white/90">
                {i18n.language === 'hi' ? `💨 हवा ${currentWeather.wind_speed} किमी/घं` : i18n.language === 'pa' ? `💨 ਹਵਾ ${currentWeather.wind_speed} ਕਿਲੋਮੀਟਰ/ਘੰ` : `💨 Wind ${currentWeather.wind_speed} km/h`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5-Day Forecast List */}
      <div className="flex flex-col gap-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface">
          {i18n.language === 'hi'
            ? '5-दिवसीय कृषि मौसम पूर्वानुमान और छिड़काव समय-सारणी'
            : i18n.language === 'pa'
            ? '5-ਦਿਨਾ ਖੇਤੀਬਾੜੀ ਮੌਸਮ ਪੂਰਵ-ਅਨੁਮਾਨ ਅਤੇ ਸਪਰੇਅ ਸ਼ਡਿਊਲ'
            : '5-Day Agricultural Weather & Spray Schedule'}
        </h2>
        
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
            <span className="text-xs text-on-surface-variant">
              {i18n.language === 'hi' ? '5-दिवसीय मौसम पूर्वानुमान प्राप्त किया जा रहा है...' : i18n.language === 'pa' ? '5-ਦਿਨਾ ਮੌਸਮ ਪੂਰਵ-ਅਨੁਮਾਨ ਪ੍ਰਾਪਤ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...' : 'Fetching 5-day agro-meteorological forecast...'}
            </span>
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
                    <span className="font-extrabold text-xs text-on-surface">
                      {getLocalizedDayName(day.day_name, i18n.language)}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      {getLocalizedWeatherCondition(day.weather_condition, i18n.language)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-primary">{day.temp_high}°C</span>
                    <span className="text-[11px] text-on-surface-variant font-medium">/ {day.temp_low}°C</span>
                  </div>
                </div>

                {/* Badges Row */}
                <div className="flex items-center justify-between pt-1 border-t border-outline-variant/30 text-[11px]">
                  <div className="flex items-center gap-1 text-on-surface-variant">
                    <span>
                      {i18n.language === 'hi' ? '🌧️ बारिश:' : i18n.language === 'pa' ? '🌧️ ਮੀਂਹ:' : '🌧️ Rain:'} <strong>{Math.round((day.rain_prob || 0) * 100)}%</strong>
                    </span>
                    <span className="mx-1">•</span>
                    <span>
                      💨 <strong>{Math.round(day.wind_speed || 10)} {i18n.language === 'hi' ? 'किमी/घं' : i18n.language === 'pa' ? 'ਕਿਲੋਮੀਟਰ/ਘੰ' : 'km/h'}</strong>
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isSafe
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-error-container text-on-error-container'
                    }`}
                  >
                    {isSafe
                      ? (i18n.language === 'hi' ? '🌿 छिड़काव सुरक्षित' : i18n.language === 'pa' ? '🌿 ਸਪਰੇਅ ਸੁਰੱਖਿਅਤ' : '🌿 Spray Safe')
                      : (i18n.language === 'hi' ? '⚠️ छिड़काव टालें' : i18n.language === 'pa' ? '⚠️ ਸਪਰੇਅ ਟਾਲੋ' : '⚠️ Delay Spray')}
                  </span>
                </div>

                {/* Smart Advisory Snippet */}
                {day.advisory_notes && day.advisory_notes.length > 0 && (
                  <p className="text-[10px] text-secondary font-medium bg-surface-container-low/60 rounded-xl p-2 mt-0.5">
                    💡 {localizeAdvisory(day.advisory_notes[0], i18n.language)}
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
