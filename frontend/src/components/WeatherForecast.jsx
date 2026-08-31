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
      const lat = profile?.latitude || 28.6667;
      const lon = profile?.longitude || 77.4333;
      const state = profile?.state || 'Uttar Pradesh';
      const locName = profile?.village_or_city || profile?.district || profile?.state || 'Ghaziabad';

      const data = await api.getForecast(activeCrop, lat, lon, state, locName);
      if (data.current_weather) {
        setCurrentWeather(data.current_weather);
      }
      setForecastList(data.forecast || []);
    } catch (err) {
      console.warn('Forecast error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [activeCrop, profile?.village_or_city, profile?.district, profile?.state]);

  const handleVoicePlay = () => {
    if (isSpeaking) {
      stop();
      return;
    }
    const loc = currentWeather?.city || profile?.village_or_city || profile?.district || profile?.state || 'your location';
    const temp = currentWeather?.temperature ?? (forecastList?.[0]?.temp_max || 30);
    const hum = currentWeather?.humidity ?? 67;
    const wind = currentWeather?.wind_speed ?? 7;
    const rainChance = forecastList?.[0]?.rain_probability || 15;
    const cropName = activeCrop ? getLocalizedCropName(activeCrop, i18n.language) : (i18n.language === 'hi' ? 'फसलों' : 'crops');

    let msg = '';
    if (i18n.language === 'hi') {
      msg = `${loc} में आज का लाइव मौसम: तापमान ${temp} डिग्री सेल्सियस है, नमी ${hum} प्रतिशत और हवा की गति ${wind} किलोमीटर प्रति घंटा है। बारिश की संभावना ${rainChance} प्रतिशत है। ${
        rainChance > 40 ? 'बारिश के कारण सिंचाई और कीटनाशक छिड़काव टालें।' : 'मौसम खेत कार्यों और छिड़काव के लिए अनुकूल है।'
      }`;
    } else if (i18n.language === 'pa') {
      msg = `${loc} ਵਿੱਚ ਅੱਜ ਦਾ ਲਾਈਵ ਮੌਸਮ: ਤਾਪਮਾਨ ${temp} ਡਿਗਰੀ ਸੈਲਸੀਅਸ, ਨਮੀ ${hum} ਪ੍ਰਤੀਸ਼ਤ ਅਤੇ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ${rainChance} ਪ੍ਰਤੀਸ਼ਤ ਹੈ।`;
    } else {
      msg = `Live weather for ${loc}: Current temperature is ${temp} degrees Celsius, humidity is ${hum}%, and wind speed is ${wind} km/h. Rain risk is ${rainChance}%. ${
        rainChance > 40 ? 'Postpone foliar sprays and irrigation due to expected rainfall.' : 'Weather is favorable for farm operations and intercultural activities.'
      }`;
    }
    speak(msg, i18n.language);
  };

  const todayRainProb = forecastList?.[0]?.rain_probability ?? 15;
  const isTodaySpraySafe = forecastList?.[0]?.spray_safe !== false && todayRainProb < 35 && (currentWeather?.wind_speed || 10) < 18;

  return (
    <div className="pb-24 px-4 pt-3 flex flex-col gap-4 max-w-md mx-auto">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">{t('weather.title')}</h1>
          <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
            <span>{currentWeather?.city || profile?.village_or_city || profile?.district || 'Ghaziabad'}, {profile?.state || 'Uttar Pradesh'}</span>
          </p>
        </div>
        <button
          onClick={handleVoicePlay}
          className={`w-9 h-9 rounded-full flex items-center justify-center border shadow-sm transition-all ${
            isSpeaking ? 'bg-error text-white animate-pulse' : 'bg-surface-container-lowest text-primary hover:bg-primary/10'
          }`}
          title="Voice Readout"
        >
          <span className="material-symbols-filled text-lg">{isSpeaking ? 'volume_up' : 'volume_mute'}</span>
        </button>
      </div>

      {/* Main Hero Today Weather Card */}
      {currentWeather && (
        <div className="bg-gradient-to-br from-primary via-primary-container to-secondary rounded-3xl p-5 text-on-primary shadow-float flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping"></span>
              {i18n.language === 'hi' ? 'लाइव मौसम' : i18n.language === 'pa' ? 'ਲਾਈਵ ਮੌਸਮ' : 'Live OWM Weather'}
            </span>
            <span className="text-xs text-white/90 font-medium">
              {new Date().toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'pa' ? 'pa-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
            </span>
          </div>

          <div className="flex items-center justify-between my-1">
            <div>
              <div className="text-4xl font-black tracking-tight">{currentWeather.temperature}°C</div>
              <div className="text-xs font-semibold text-white/90 mt-0.5 capitalize">
                {getLocalizedWeatherCondition(currentWeather.description, i18n.language)}
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="text-xs font-medium text-white/80">
                {i18n.language === 'hi' ? `महसूस ${currentWeather.feels_like}°C` : i18n.language === 'pa' ? `ਮਹਿਸੂਸ ${currentWeather.feels_like}°C` : `Feels like ${currentWeather.feels_like}°C`}
              </div>
              <div className="text-xs font-semibold text-white/90 mt-0.5">
                {i18n.language === 'hi' ? `अधिकतम ${currentWeather.temp_max}° / न्यूनतम ${currentWeather.temp_min}°` : `Max ${currentWeather.temp_max}° / Min ${currentWeather.temp_min}°`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4-Column Weather Parameters Grid */}
      {currentWeather && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Temperature */}
          <div className="bg-surface-container-lowest rounded-2xl p-3 shadow-card border border-outline-variant/40 flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-primary text-xl mb-1">device_thermostat</span>
            <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
              {i18n.language === 'hi' ? 'तापमान' : i18n.language === 'pa' ? 'ਤਾਪਮਾਨ' : 'Temp'}
            </span>
            <span className="text-base font-black text-on-surface mt-0.5">{currentWeather.temperature}°C</span>
            <span className="text-[10px] text-on-surface-variant/70 mt-0.5">
              {i18n.language === 'hi' ? `महसूस ${currentWeather.feels_like}°` : `Feels ${currentWeather.feels_like}°`}
            </span>
          </div>

          {/* Humidity */}
          <div className="bg-surface-container-lowest rounded-2xl p-3 shadow-card border border-outline-variant/40 flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-blue-600 text-xl mb-1">humidity_percentage</span>
            <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
              {i18n.language === 'hi' ? 'नमी' : i18n.language === 'pa' ? 'ਨਮੀ' : 'Humidity'}
            </span>
            <span className="text-base font-black text-on-surface mt-0.5">{currentWeather.humidity}%</span>
            <span className="text-[10px] text-on-surface-variant/70 mt-0.5">
              {currentWeather.humidity > 70 ? (i18n.language === 'hi' ? 'उच्च नमी' : 'High') : (i18n.language === 'hi' ? 'सामान्य' : 'Normal')}
            </span>
          </div>

          {/* Wind Speed */}
          <div className="bg-surface-container-lowest rounded-2xl p-3 shadow-card border border-outline-variant/40 flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-teal-600 text-xl mb-1">air</span>
            <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
              {i18n.language === 'hi' ? 'हवा की गति' : i18n.language === 'pa' ? 'ਹਵਾ ਦੀ ਗਤੀ' : 'Wind'}
            </span>
            <span className="text-base font-black text-on-surface mt-0.5">{currentWeather.wind_speed} <span className="text-[11px] font-bold">km/h</span></span>
            <span className="text-[10px] text-on-surface-variant/70 mt-0.5">
              {currentWeather.wind_speed < 15 ? (i18n.language === 'hi' ? 'शांत' : 'Gentle') : (i18n.language === 'hi' ? 'तेज हवा' : 'Breezy')}
            </span>
          </div>

          {/* Rain Probability */}
          <div className="bg-surface-container-lowest rounded-2xl p-3 shadow-card border border-outline-variant/40 flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-indigo-600 text-xl mb-1">rainy</span>
            <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
              {i18n.language === 'hi' ? 'बारिश जोखिम' : i18n.language === 'pa' ? 'ਮੀਂਹ ਜੋਖਮ' : 'Rain Risk'}
            </span>
            <span className="text-base font-black text-on-surface mt-0.5">{todayRainProb}%</span>
            <span className={`text-[10px] font-bold mt-0.5 ${todayRainProb > 40 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {todayRainProb > 40 ? (i18n.language === 'hi' ? 'जोखिम' : 'Moderate') : (i18n.language === 'hi' ? 'कम जोखिम' : 'Low Risk')}
            </span>
          </div>
        </div>
      )}

      {/* Spray Safety & Advisory Banner */}
      <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 shadow-xs ${
        isTodaySpraySafe ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-amber-50 text-amber-900 border-amber-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-xl flex-shrink-0">
            {isTodaySpraySafe ? 'check_circle' : 'warning'}
          </span>
          <div>
            <div className="font-bold text-xs">
              {isTodaySpraySafe
                ? (i18n.language === 'hi' ? '🌿 आज कीटनाशक / पोषक छिड़काव सुरक्षित है' : '🌿 Spray Safe Window Open')
                : (i18n.language === 'hi' ? '⚠️ छिड़काव टालें - बारिश या तेज हवा का जोखिम' : '⚠️ Delay Foliar Spray Operations')}
            </div>
            <div className="text-[10px] opacity-90 mt-0.5">
              {isTodaySpraySafe
                ? (i18n.language === 'hi' ? 'हवा की गति 15 किमी/घंटे से कम है और बारिश का जोखिम कम है।' : 'Low precipitation probability & optimal wind velocity for foliar absorption.')
                : (i18n.language === 'hi' ? 'बारिश से खाद और कीटनाशक बहने का खतरा है।' : 'Wash risk or high drift velocity detected. Postpone chemical operations.')}
            </div>
          </div>
        </div>
        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex-shrink-0 ${
          isTodaySpraySafe ? 'bg-emerald-200/70 text-emerald-900' : 'bg-amber-200/70 text-amber-900'
        }`}>
          {isTodaySpraySafe ? 'Optimal' : 'Caution'}
        </span>
      </div>

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
                    <span className="text-[11px] text-on-surface-variant capitalize">
                      {getLocalizedWeatherCondition(day.description || day.condition, i18n.language)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-primary">{day.temp_max}°C</span>
                    <span className="text-[11px] text-on-surface-variant font-medium">/ {day.temp_min}°C</span>
                  </div>
                </div>

                {/* Badges Row */}
                <div className="flex items-center justify-between pt-1 border-t border-outline-variant/30 text-[11px]">
                  <div className="flex items-center gap-1 text-on-surface-variant">
                    <span>
                      {i18n.language === 'hi' ? '🌧️ बारिश:' : i18n.language === 'pa' ? '🌧️ ਮੀਂਹ:' : '🌧️ Rain:'} <strong>{Math.round((day.rain_probability || (day.rain_prob * 100)) || 0)}%</strong>
                    </span>
                    <span className="mx-1">•</span>
                    <span>
                      💧 <strong>{day.humidity}%</strong>
                    </span>
                    <span className="mx-1">•</span>
                    <span>
                      💨 <strong>{Math.round(day.wind_speed || 8)} {i18n.language === 'hi' ? 'किमी/घं' : i18n.language === 'pa' ? 'ਕਿਲੋਮੀਟਰ/ਘੰ' : 'km/h'}</strong>
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
                      ? (i18n.language === 'hi' ? '🌿 सुरक्षित' : i18n.language === 'pa' ? '🌿 ਸੁਰੱਖਿਅਤ' : '🌿 Spray Safe')
                      : (i18n.language === 'hi' ? '⚠️ टालें' : i18n.language === 'pa' ? '⚠️ ਟਾਲੋ' : '⚠️ Delay Spray')}
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
