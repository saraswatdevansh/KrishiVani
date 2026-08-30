import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { api } from '../services/api';
import { getLocalizedCropName, CROP_TRANSLATIONS } from '../data/cropTranslations';

export const CropRecommendations = ({ onSelectCrop, onNavigateWeather }) => {
  const { t, i18n } = useTranslation();
  const { profile, updateActiveCrop } = useAuth();
  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  // Soil & Location state
  const [selectedState, setSelectedState] = useState(profile?.state || 'Uttar Pradesh');
  const [nitrogen, setNitrogen] = useState(profile?.nitrogen || 76);
  const [phosphorus, setPhosphorus] = useState(profile?.phosphorus || 48);
  const [potassium, setPotassium] = useState(profile?.potassium || 25);
  const [ph, setPh] = useState(profile?.ph || 6.8);
  const [rainfall, setRainfall] = useState(profile?.rainfall || 88);
  const [showEditSoil, setShowEditSoil] = useState(false);

  const [stateSoilDefaults, setStateSoilDefaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [marketAvailable, setMarketAvailable] = useState(true);
  const [selectedCropKey, setSelectedCropKey] = useState(profile?.selected_crop || 'maize');

  useEffect(() => {
    // Load state defaults
    api.getSoilDefaults().then(data => {
      setStateSoilDefaults(data || []);
    }).catch(err => console.warn(err));
  }, []);

  useEffect(() => {
    if (profile) {
      setSelectedState(profile.state || 'Uttar Pradesh');
      setNitrogen(profile.nitrogen || 76);
      setPhosphorus(profile.phosphorus || 48);
      setPotassium(profile.potassium || 25);
      setPh(profile.ph || 6.8);
      setRainfall(profile.rainfall || 88);
      setSelectedCropKey(profile.selected_crop || 'maize');
    }
  }, [profile]);

  const autoFillForState = (stateName) => {
    setSelectedState(stateName);
    if (!stateSoilDefaults || stateSoilDefaults.length === 0) return;
    const match = stateSoilDefaults.find(s => s.state.toLowerCase() === stateName.toLowerCase());
    if (match) {
      setNitrogen(match.nitrogen);
      setPhosphorus(match.phosphorus);
      setPotassium(match.potassium);
      setPh(match.ph);
      setRainfall(match.rainfall);
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const payload = {
        nitrogen: parseFloat(nitrogen),
        phosphorus: parseFloat(phosphorus),
        potassium: parseFloat(potassium),
        ph: parseFloat(ph),
        rainfall: parseFloat(rainfall),
        latitude: profile?.latitude || 28.6692,
        longitude: profile?.longitude || 77.4538,
        state: selectedState,
        district: profile?.district || ''
      };

      const data = await api.predictCrops(payload);
      setRecommendations(data.recommendations || []);
      setWeatherData(data.weather);
      setMarketAvailable(data.market_data_available);

      // Auto-TTS execution on recommendations arrival
      if (data.recommendations && data.recommendations.length > 0) {
        const top = data.recommendations[0];
        const topName = getLocalizedCropName(top.crop, i18n.language);
        
        let autoSpeech = '';
        if (i18n.language === 'hi') {
          autoSpeech = `आपकी मिट्टी और ${selectedState} के मौसम के अनुसार नंबर 1 अनुशंसित फसल ${topName} है, जिसकी उपयुक्तता ${top.suitability_percentage}% और वर्तमान मंडी भाव ₹${top.mandi_price} प्रति क्विंटल है।`;
        } else if (i18n.language === 'pa') {
          autoSpeech = `ਤੁਹਾਡੀ ਮਿੱਟੀ ਅਤੇ ${selectedState} ਦੇ ਮੌਸਮ ਲਈ ਨੰਬਰ 1 ਸਿਫਾਰਸ਼ ਕੀਤੀ ਫਸਲ ${topName} ਹੈ, ਜਿਸਦੀ ਅਨੁਕੂਲਤਾ ${top.suitability_percentage}% ਅਤੇ ਮੰਡੀ ਭਾਅ ₹${top.mandi_price} ਪ੍ਰਤੀ ਕੁਇੰਟਲ ਹੈ।`;
        } else {
          autoSpeech = `Based on your soil and local ${selectedState} climate, the number 1 recommended crop is ${topName} with ${top.suitability_percentage}% suitability and current mandi price of ₹${top.mandi_price} per quintal.`;
        }
        
        speak(autoSpeech, i18n.language);
      }
    } catch (err) {
      console.warn('Prediction fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [selectedState, nitrogen, phosphorus, potassium, ph, rainfall]);

  const handleSelectPrimary = async (cropKey) => {
    try {
      await updateActiveCrop(cropKey);
      setSelectedCropKey(cropKey);
      alert(`✅ ${getLocalizedCropName(cropKey, i18n.language)} set as your primary crop.`);
    } catch (e) {
      console.warn('Error selecting crop:', e);
    }
  };

  const featured = recommendations[0];
  const compactList = recommendations.slice(1, 3);

  return (
    <div className="pb-24 px-4 pt-3 flex flex-col gap-4 max-w-md mx-auto">
      {/* Title & Subtitle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">{t('crops.title')}</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">{t('crops.subtitle')}</p>
        </div>
        <button
          onClick={() => {
            if (isSpeaking) stop();
            else if (featured) {
              const topName = getLocalizedCropName(featured.crop, i18n.language);
              speak(`Top recommended crop is ${topName}. Mandi price is ₹${featured.mandi_price} per quintal.`, i18n.language);
            }
          }}
          className={`w-9 h-9 rounded-full flex items-center justify-center border shadow-sm transition-all ${
            isSpeaking ? 'bg-error text-white animate-pulse' : 'bg-surface-container-lowest text-primary'
          }`}
          title="Voice Readout"
        >
          <span className="material-symbols-filled text-lg">{isSpeaking ? 'volume_up' : 'volume_mute'}</span>
        </button>
      </div>

      {/* Soil Parameters Pill Summary / Edit Toggle */}
      <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-card border border-outline-variant/40 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">science</span>
            <div className="text-xs">
              <span className="font-bold text-on-surface">Region: </span>
              <span className="text-primary font-extrabold">{selectedState}</span>
            </div>
          </div>
          <button
            onClick={() => setShowEditSoil(!showEditSoil)}
            className="text-xs font-bold text-primary hover:underline bg-secondary-container/50 px-3 py-1 rounded-full"
          >
            {showEditSoil ? 'Hide Parameters' : 'Adjust Soil / State'}
          </button>
        </div>

        {/* Live Weather Indicator on Crop Tab */}
        {weatherData && (
          <div className="text-[11px] text-on-surface-variant bg-surface-container-low/70 rounded-xl px-3 py-1.5 flex items-center justify-between">
            <span>🌡️ Live Temp: <strong>{weatherData.temperature}°C</strong></span>
            <span>💧 Humidity: <strong>{weatherData.humidity}%</strong></span>
            <span>🌧️ Rain: <strong>{rainfall} mm</strong></span>
          </div>
        )}
      </div>

      {/* Expandable Soil Adjusters & State Switcher */}
      {showEditSoil && (
        <div className="bg-surface-container-low rounded-3xl p-4 border border-outline-variant/50 flex flex-col gap-3">
          {/* State Switcher */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-on-surface-variant">Switch State (Auto-Fills Soil Health Card)</label>
            <select
              value={selectedState}
              onChange={(e) => autoFillForState(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-3 h-10 text-xs font-bold text-on-surface outline-none cursor-pointer"
            >
              {stateSoilDefaults.map(s => (
                <option key={s.state} value={s.state}>{s.state}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-bold text-on-surface">Nitrogen (N)</label>
              <input
                type="number"
                value={nitrogen}
                onChange={(e) => setNitrogen(e.target.value)}
                className="w-full bg-surface-container-lowest rounded-lg px-2 py-1 text-xs font-bold border border-outline-variant/60 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-on-surface">Phosphorus (P)</label>
              <input
                type="number"
                value={phosphorus}
                onChange={(e) => setPhosphorus(e.target.value)}
                className="w-full bg-surface-container-lowest rounded-lg px-2 py-1 text-xs font-bold border border-outline-variant/60 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-on-surface">Potassium (K)</label>
              <input
                type="number"
                value={potassium}
                onChange={(e) => setPotassium(e.target.value)}
                className="w-full bg-surface-container-lowest rounded-lg px-2 py-1 text-xs font-bold border border-outline-variant/60 outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-on-surface">pH: {ph}</label>
              <input
                type="range"
                min="4"
                max="9"
                step="0.1"
                value={ph}
                onChange={(e) => setPh(e.target.value)}
                className="w-full accent-primary h-1"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-on-surface">Seasonal Rain: {rainfall} mm</label>
              <input
                type="range"
                min="30"
                max="300"
                step="5"
                value={rainfall}
                onChange={(e) => setRainfall(e.target.value)}
                className="w-full accent-primary h-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="flex flex-col gap-3 py-6 items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
          <p className="text-xs font-semibold text-on-surface-variant">Running Random Forest ML & fetching Mandi rates...</p>
        </div>
      )}

      {/* Recommendations Display */}
      {!loading && featured && (
        <>
          {/* Featured #1 Crop Card */}
          <div className="bg-surface-container-lowest rounded-3xl shadow-card border-2 border-primary/20 overflow-hidden flex flex-col relative">
            {/* Top Rank Badge */}
            <div className="absolute top-3 left-3 z-10 bg-primary text-on-primary px-3 py-1 rounded-full text-xs font-extrabold shadow-md flex items-center gap-1">
              <span className="material-symbols-filled text-sm text-yellow-300">workspace_premium</span>
              <span>#1 {t('crops.featured_pick')}</span>
            </div>

            {/* Demand Badge */}
            <div className="absolute top-3 right-3 z-10 bg-surface-container-lowest/90 backdrop-blur-md text-primary font-bold text-[11px] px-2.5 py-1 rounded-full shadow-sm border border-outline-variant/40">
              🔥 {featured.demand_level} Demand
            </div>

            {/* Crop Image */}
            <div className="h-44 w-full relative bg-surface-container-high">
              <img
                src={CROP_TRANSLATIONS[featured.crop.toLowerCase()]?.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'}
                alt={featured.crop}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <h2 className="text-xl font-black tracking-tight drop-shadow-sm">
                  {getLocalizedCropName(featured.crop, i18n.language)}
                </h2>
                <p className="text-xs text-white/90 font-medium">
                  {CROP_TRANSLATIONS[featured.crop.toLowerCase()]?.category || 'Field Crop'} • {CROP_TRANSLATIONS[featured.crop.toLowerCase()]?.growing_season || 'Kharif'}
                </p>
              </div>
            </div>

            {/* Metrics & Details */}
            <div className="p-4 flex flex-col gap-3.5">
              {/* Suitability Score Bar */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-on-surface">{t('crops.suitability')}</span>
                  <span className="font-extrabold text-primary">{featured.suitability_percentage}% Optimal for {selectedState}</span>
                </div>
                <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(featured.suitability_percentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Price & Mandi Info */}
              <div className="grid grid-cols-2 gap-2 bg-surface-container-low/70 rounded-2xl p-3 border border-outline-variant/30">
                <div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">{t('crops.mandi_price')}</span>
                  <div className="text-base font-extrabold text-primary flex items-baseline gap-0.5">
                    <span>₹{featured.mandi_price?.toLocaleString('en-IN') || '2,450'}</span>
                    <span className="text-[10px] font-normal text-on-surface-variant">/Qtl</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">{t('crops.market_label')}</span>
                  <div className="text-xs font-bold text-on-surface truncate">
                    {featured.market || `${selectedState} Mandi`}
                  </div>
                  <span className="text-[10px] text-secondary font-semibold">
                    {marketAvailable ? '● Live Agmarknet' : '● Verified Daily Rate'}
                  </span>
                </div>
              </div>

              {/* Select CTA Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSelectPrimary(featured.crop)}
                  className={`flex-1 h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] ${
                    selectedCropKey.toLowerCase() === featured.crop.toLowerCase()
                      ? 'bg-secondary-container text-on-secondary-container border border-secondary/40'
                      : 'bg-primary hover:bg-primary-container text-on-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {selectedCropKey.toLowerCase() === featured.crop.toLowerCase() ? 'check_circle' : 'add_task'}
                  </span>
                  <span>
                    {selectedCropKey.toLowerCase() === featured.crop.toLowerCase()
                      ? t('crops.selected_badge')
                      : t('crops.select_crop_btn')}
                  </span>
                </button>

                <button
                  onClick={() => onNavigateWeather(featured.crop)}
                  className="px-3.5 h-11 bg-surface-container-low hover:bg-surface-container border border-outline-variant/60 rounded-xl text-primary flex items-center justify-center"
                  title="View Weather Advisory"
                >
                  <span className="material-symbols-outlined text-lg">cloud_sync</span>
                </button>
              </div>
            </div>
          </div>

          {/* Compact Cards #2 and #3 */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">
              Alternative High-Profit Crops for {selectedState}
            </h3>

            {compactList.map((cropItem, idx) => {
              const meta = CROP_TRANSLATIONS[cropItem.crop.toLowerCase()] || {};
              const isSelected = selectedCropKey.toLowerCase() === cropItem.crop.toLowerCase();
              return (
                <div
                  key={cropItem.crop}
                  className="bg-surface-container-lowest rounded-2xl p-3 shadow-card border border-outline-variant/40 flex items-center gap-3 hover:border-primary/40 transition-all"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container-low flex-shrink-0 relative">
                    <img
                      src={meta.image || 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80'}
                      alt={cropItem.crop}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1 left-1 bg-surface/90 text-primary font-black text-[9px] px-1.5 py-0.5 rounded-full">
                      #{idx + 2}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-on-surface truncate">
                        {getLocalizedCropName(cropItem.crop, i18n.language)}
                      </h4>
                      <span className="text-[10px] font-bold text-secondary">
                        {cropItem.suitability_percentage}% Match
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-extrabold text-primary">
                        ₹{cropItem.mandi_price?.toLocaleString('en-IN') || '2,100'}/Qtl
                      </span>
                      <button
                        onClick={() => handleSelectPrimary(cropItem.crop)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                          isSelected
                            ? 'bg-secondary-container text-on-secondary-container border-secondary/30'
                            : 'bg-surface-container-low text-primary border-outline-variant hover:bg-surface-container'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Select'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
