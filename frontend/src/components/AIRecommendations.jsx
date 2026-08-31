import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { api } from '../services/api';
import { getLocalizedCropName, CROP_TRANSLATIONS } from '../data/cropTranslations';
import { RegisterCropForm } from './RegisterCropForm';

const STATE_COORDINATES = {
  'Punjab': { lat: 30.9010, lon: 75.8573 },
  'Haryana': { lat: 29.0588, lon: 76.0856 },
  'Uttar Pradesh': { lat: 26.8467, lon: 80.9462 },
  'Madhya Pradesh': { lat: 22.9734, lon: 78.6569 },
  'Maharashtra': { lat: 19.7515, lon: 75.7139 },
  'Rajasthan': { lat: 27.0238, lon: 74.2179 },
  'Gujarat': { lat: 22.2587, lon: 71.1924 },
  'Karnataka': { lat: 15.3173, lon: 75.7139 },
  'Andhra Pradesh': { lat: 15.9129, lon: 79.7400 },
  'Tamil Nadu': { lat: 11.1271, lon: 78.6569 },
  'West Bengal': { lat: 22.9868, lon: 87.8550 },
  'Bihar': { lat: 25.0961, lon: 85.3131 },
  'Odisha': { lat: 20.9517, lon: 85.0985 },
  'Kerala': { lat: 10.8505, lon: 76.2711 },
  'Assam': { lat: 26.2006, lon: 92.9376 },
  'Himachal Pradesh': { lat: 31.1048, lon: 77.1734 },
  'Uttarakhand': { lat: 30.0668, lon: 79.0193 },
  'Jammu and Kashmir': { lat: 33.7782, lon: 76.5762 },
  'Chhattisgarh': { lat: 21.2787, lon: 81.8661 },
  'Jharkhand': { lat: 23.6102, lon: 85.2799 },
  'Telangana': { lat: 18.1124, lon: 79.0193 }
};

export const AIRecommendations = ({ onNavigateWeather, onSwitchToFarm }) => {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const { speak, isSpeaking, stop } = useSpeechSynthesis();

  const [recommendations, setRecommendations] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableStates, setAvailableStates] = useState([]);
  const [allSoilDefaults, setAllSoilDefaults] = useState([]);
  
  const [soilData, setSoilData] = useState({
    nitrogen: profile?.nitrogen ?? 85,
    phosphorus: profile?.phosphorus ?? 46,
    potassium: profile?.potassium ?? 35,
    ph: profile?.ph ?? 7.2,
    rainfall: profile?.rainfall ?? 85,
    state: profile?.state || 'Punjab',
    district: profile?.district || 'Ludhiana',
    latitude: profile?.latitude || 30.9010,
    longitude: profile?.longitude || 75.8573
  });

  const [expandedCard, setExpandedCard] = useState(null);
  const [showEditSoil, setShowEditSoil] = useState(false);
  const [selectedCropToRegister, setSelectedCropToRegister] = useState(null);

  // 1. Fetch available state soil defaults
  useEffect(() => {
    const loadDefaults = async () => {
      try {
        const defaults = await api.getSoilDefaults();
        if (Array.isArray(defaults) && defaults.length > 0) {
          setAllSoilDefaults(defaults);
          setAvailableStates(defaults.map(d => d.state));
        }
      } catch (err) {
        console.warn('Could not fetch soil defaults list:', err);
      }
    };
    loadDefaults();
  }, []);

  // 2. Sync with user profile on load
  useEffect(() => {
    if (profile) {
      const stateName = profile.state || 'Punjab';
      const coords = STATE_COORDINATES[stateName] || { lat: 30.9010, lon: 75.8573 };
      const updated = {
        nitrogen: profile.nitrogen ?? 85,
        phosphorus: profile.phosphorus ?? 46,
        potassium: profile.potassium ?? 35,
        ph: profile.ph ?? 7.2,
        rainfall: profile.rainfall ?? 85,
        state: stateName,
        district: profile.district || '',
        latitude: profile.latitude || coords.lat,
        longitude: profile.longitude || coords.lon
      };
      setSoilData(updated);
      fetchRecommendations(updated);
    } else {
      fetchRecommendations(soilData);
    }
  }, [profile]);

  const fetchRecommendations = async (dataToUse) => {
    setLoading(true);
    setError(null);
    try {
      const stateName = dataToUse.state || profile?.state || 'Punjab';
      const coords = STATE_COORDINATES[stateName] || { lat: 30.9010, lon: 75.8573 };
      
      const payload = {
        nitrogen: parseFloat(dataToUse.nitrogen ?? 85),
        phosphorus: parseFloat(dataToUse.phosphorus ?? 46),
        potassium: parseFloat(dataToUse.potassium ?? 35),
        ph: parseFloat(dataToUse.ph ?? 7.2),
        rainfall: parseFloat(dataToUse.rainfall ?? 85),
        latitude: parseFloat(dataToUse.latitude || profile?.latitude || coords.lat),
        longitude: parseFloat(dataToUse.longitude || profile?.longitude || coords.lon),
        state: stateName,
        district: dataToUse.district || profile?.district || ''
      };

      const response = await api.predictCrops(payload);
      if (response && response.recommendations) {
        setRecommendations(response.recommendations.slice(0, 5));
        setWeatherData(response.weather || null);
      }
    } catch (err) {
      console.error('Failed to fetch crop recommendations:', err);
      setError(err.message || 'Failed to fetch recommendations. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = (newState) => {
    const coords = STATE_COORDINATES[newState] || { lat: 28.6139, lon: 77.2090 };
    let match = allSoilDefaults.find(s => s.state?.toLowerCase() === newState?.toLowerCase());
    
    const newData = {
      ...soilData,
      state: newState,
      latitude: coords.lat,
      longitude: coords.lon,
      nitrogen: match ? match.nitrogen : soilData.nitrogen,
      phosphorus: match ? match.phosphorus : soilData.phosphorus,
      potassium: match ? match.potassium : soilData.potassium,
      ph: match ? match.ph : soilData.ph,
      rainfall: match ? match.rainfall : soilData.rainfall
    };
    
    setSoilData(newData);
    fetchRecommendations(newData);
  };

  const handleRecalculate = (e) => {
    e.preventDefault();
    setShowEditSoil(false);
    fetchRecommendations(soilData);
  };

  const colorForQuality = (quality) => {
    if (quality === 'excellent') return '#16a34a'; // green-600
    if (quality === 'good') return '#0284c7'; // lightBlue-600
    if (quality === 'moderate') return '#ca8a04'; // yellow-600
    return '#dc2626'; // red-600
  };

  const toggleExpand = (cropName) => {
    setExpandedCard(expandedCard === cropName ? null : cropName);
  };

  const handleVoiceAdvisory = (rec) => {
    if (isSpeaking) {
      stop();
      return;
    }
    const cropName = getLocalizedCropName(rec.crop, i18n.language);
    const strongList = rec.evidence?.strong_matches?.join(', ') || 'soil parameters';
    const text = i18n.language === 'hi'
      ? `नंबर 1 अनुशंसित फसल ${cropName} है। उपयुक्तता ${rec.suitability_percentage}% और मंडी भाव ₹${rec.mandi_price} प्रति क्विंटल है। मुख्य अनुकूल कारक ${strongList} हैं।`
      : i18n.language === 'pa'
      ? `ਨੰਬਰ 1 ਸਿਫਾਰਸ਼ ਕੀਤੀ ਫਸਲ ${cropName} ਹੈ। ਅਨੁਕੂਲਤਾ ${rec.suitability_percentage}% ਅਤੇ ਮੰਡੀ ਭਾਅ ₹${rec.mandi_price} ਪ੍ਰਤੀ ਕੁਇੰਟਲ ਹੈ।`
      : `Top recommended crop is ${cropName} with ${rec.suitability_percentage}% suitability. Mandi price is ₹${rec.mandi_price} per quintal. Strong factors include ${strongList}.`;
    speak(text, i18n.language);
  };

  const statesList = availableStates.length > 0 ? availableStates : Object.keys(STATE_COORDINATES);

  return (
    <div className="flex flex-col gap-4 relative pb-10">
      
      {/* Soil Summary / Edit */}
      <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-card border border-outline-variant/40">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">landscape</span>
            <div>
              <span className="text-xs font-bold text-on-surface">Region: </span>
              <span className="text-xs font-extrabold text-primary">{soilData.state}</span>
            </div>
          </div>
          <button 
            onClick={() => setShowEditSoil(!showEditSoil)}
            className="text-xs text-primary font-bold hover:underline bg-secondary-container/50 px-3 py-1 rounded-full"
          >
            {showEditSoil ? 'Hide Parameters' : 'Adjust Soil / State'}
          </button>
        </div>

        {/* Live Weather Indicator */}
        {weatherData && (
          <div className="text-[11px] text-on-surface-variant bg-surface-container-low/70 rounded-xl px-3 py-1.5 flex items-center justify-between mt-1">
            <span>🌡️ Temp: <strong>{weatherData.temperature}°C</strong></span>
            <span>💧 Humidity: <strong>{weatherData.humidity}%</strong></span>
            <span>🌧️ Rain: <strong>{soilData.rainfall} mm</strong></span>
          </div>
        )}

        {showEditSoil ? (
          <form onSubmit={handleRecalculate} className="space-y-3 mt-3 pt-3 border-t border-outline-variant/40 animate-fade-in">
            <div>
              <label className="block text-[10px] font-bold uppercase text-on-surface-variant mb-1">
                Switch State (Auto-Fills Soil Health Card)
              </label>
              <select 
                value={soilData.state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-3 h-10 text-xs font-bold text-on-surface outline-none cursor-pointer"
              >
                {statesList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-on-surface mb-0.5">Nitrogen (N)</label>
                <input type="number" value={soilData.nitrogen} onChange={e => setSoilData({...soilData, nitrogen: e.target.value})} className="w-full bg-surface-container-lowest rounded-lg px-2 py-1 text-xs font-bold border border-outline-variant/60 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface mb-0.5">Phosphorus (P)</label>
                <input type="number" value={soilData.phosphorus} onChange={e => setSoilData({...soilData, phosphorus: e.target.value})} className="w-full bg-surface-container-lowest rounded-lg px-2 py-1 text-xs font-bold border border-outline-variant/60 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface mb-0.5">Potassium (K)</label>
                <input type="number" value={soilData.potassium} onChange={e => setSoilData({...soilData, potassium: e.target.value})} className="w-full bg-surface-container-lowest rounded-lg px-2 py-1 text-xs font-bold border border-outline-variant/60 outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-on-surface mb-0.5">Soil pH: {soilData.ph}</label>
                <input type="range" min="4" max="9" step="0.1" value={soilData.ph} onChange={e => setSoilData({...soilData, ph: e.target.value})} className="w-full accent-primary h-1" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface mb-0.5">Seasonal Rain: {soilData.rainfall} mm</label>
                <input type="range" min="30" max="300" step="5" value={soilData.rainfall} onChange={e => setSoilData({...soilData, rainfall: e.target.value})} className="w-full accent-primary h-1" />
              </div>
            </div>
            <button type="submit" className="w-full bg-primary text-on-primary font-bold py-2 rounded-xl text-xs shadow-sm hover:shadow active:scale-[0.98] transition-all">
              {t('crops.btn_recalculate')}
            </button>
          </form>
        ) : (
          <div className="flex flex-wrap gap-1.5 text-[11px] mt-2 pt-2 border-t border-outline-variant/30">
            <span className="bg-surface-container px-2 py-0.5 rounded-lg font-medium">N: <strong>{soilData.nitrogen}</strong></span>
            <span className="bg-surface-container px-2 py-0.5 rounded-lg font-medium">P: <strong>{soilData.phosphorus}</strong></span>
            <span className="bg-surface-container px-2 py-0.5 rounded-lg font-medium">K: <strong>{soilData.potassium}</strong></span>
            <span className="bg-surface-container px-2 py-0.5 rounded-lg font-medium">pH: <strong>{soilData.ph}</strong></span>
            <span className="bg-surface-container px-2 py-0.5 rounded-lg font-medium">Rain: <strong>{soilData.rainfall}mm</strong></span>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-8 gap-3">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-on-surface-variant">Analyzing soil match & fetching Agmarknet mandi rates...</p>
        </div>
      ) : error ? (
        <div className="bg-error/10 text-error p-4 rounded-2xl text-xs text-center flex flex-col gap-2 border border-error/20">
          <p className="font-semibold">{error}</p>
          <button
            onClick={() => fetchRecommendations(soilData)}
            className="self-center px-4 py-1.5 bg-error text-white rounded-xl text-xs font-bold shadow-sm"
          >
            Retry Analysis
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {recommendations.map((rec, idx) => {
            const isTop = idx === 0;
            const cropMeta = CROP_TRANSLATIONS[rec.crop?.toLowerCase()] || {};
            const isExpanded = expandedCard === rec.crop;
            const evidence = rec.evidence || {};

            return (
              <div 
                key={rec.crop} 
                className={`bg-surface-container-lowest rounded-3xl p-4 shadow-card border transition-all ${
                  isTop ? 'border-primary/50 bg-gradient-to-b from-primary/5 to-transparent' : 'border-outline-variant/40'
                }`}
              >
                
                {/* Header Badge */}
                <div className="flex justify-between items-center mb-2.5">
                  <div className="flex items-center gap-1.5">
                    {isTop ? (
                      <span className="text-[10px] font-extrabold bg-primary text-on-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-filled text-[12px] text-yellow-300">workspace_premium</span>
                        #1 {t('crops.featured_pick')}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full">
                        #{idx + 1} Alternative Match
                      </span>
                    )}
                    <span className="text-[10px] font-bold bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full capitalize">
                      {rec.season || 'Kharif'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {isTop && (
                      <button 
                        onClick={() => handleVoiceAdvisory(rec)} 
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          isSpeaking ? 'bg-error text-white animate-pulse' : 'bg-surface-container text-primary hover:bg-surface-container-high'
                        }`}
                        title="Listen to Advisory"
                      >
                        <span className="material-symbols-outlined text-[16px]">{isSpeaking ? 'stop' : 'volume_up'}</span>
                      </button>
                    )}
                    {onNavigateWeather && (
                      <button
                        onClick={() => onNavigateWeather(rec.crop)}
                        className="w-7 h-7 rounded-full bg-surface-container text-primary flex items-center justify-center hover:bg-surface-container-high"
                        title="View Weather Advisory"
                      >
                        <span className="material-symbols-outlined text-[16px]">cloud_sync</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Crop Info Row */}
                <div className="flex gap-3 items-center">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface-container flex-shrink-0 relative">
                    <img
                      src={cropMeta.image || 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80'}
                      alt={rec.crop}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-extrabold text-base text-on-surface capitalize truncate">
                          {getLocalizedCropName(rec.crop, i18n.language)}
                        </h3>
                        <p className="text-[11px] text-on-surface-variant font-medium">
                          {rec.market || `${soilData.state} Mandi`}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-black text-primary">{rec.suitability_percentage}%</div>
                        <div className="text-[9px] text-on-surface-variant font-bold uppercase">{t('crops.suitability')}</div>
                      </div>
                    </div>

                    {/* Mandi Rate Badge */}
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xs font-extrabold text-primary">
                        ₹{rec.mandi_price?.toLocaleString('en-IN') || '2,450'}<span className="text-[10px] font-normal text-on-surface-variant">/Qtl</span>
                      </span>
                      <span className="text-[10px] font-semibold text-secondary">
                        {evidence.overall_match_percentage ? `${evidence.overall_match_percentage}% Soil Match` : 'Agronomic Fit'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-3 flex gap-2">
                  <button 
                    onClick={() => toggleExpand(rec.crop)}
                    className="flex-1 flex justify-center items-center gap-1 text-xs font-bold text-on-surface-variant bg-surface-container hover:bg-surface-container-high py-2 rounded-xl transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-primary">analytics</span>
                    <span>{t('farming.why_this_crop')}</span>
                    <span className="material-symbols-outlined text-[16px]">
                      {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  
                  <button 
                    onClick={() => setSelectedCropToRegister(rec.crop)}
                    className="flex-1 bg-primary text-on-primary text-xs font-bold py-2 rounded-xl hover:shadow active:scale-[0.98] transition-all text-center flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    <span>{t('farming.register_this')}</span>
                  </button>
                </div>

                {/* Expandable Evidence Card */}
                {isExpanded && evidence.feature_matches && (
                  <div className="mt-3 pt-3 border-t border-outline-variant/30 animate-fade-in flex flex-col gap-2.5">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-primary">fact_check</span>
                        {t('farming.evidence_title')}
                      </h4>
                      <span className="text-[10px] font-bold bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full">
                        {evidence.overall_match_percentage}% Match
                      </span>
                    </div>
                    
                    <div className="space-y-2 bg-surface-container-low/60 rounded-2xl p-2.5 border border-outline-variant/30">
                      {evidence.feature_matches.map((fm) => (
                        <div key={fm.feature} className="flex flex-col gap-0.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-on-surface-variant font-semibold text-[11px] capitalize">
                              {fm.label || fm.feature}
                            </span>
                            <span className="text-[10px] font-extrabold text-on-surface">
                              {Math.round(fm.match_percentage)}% ({fm.match_quality})
                            </span>
                          </div>
                          
                          <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-700" 
                              style={{ width: `${Math.min(fm.match_percentage, 100)}%`, backgroundColor: colorForQuality(fm.match_quality) }} 
                            />
                          </div>
                          
                          <div className="text-[9px] text-on-surface-variant flex justify-between">
                            <span>Your: <strong>{fm.user_value}</strong></span>
                            <span>Optimal: <strong>{fm.optimal_min} - {fm.optimal_max}</strong> (avg {fm.optimal_mean})</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Strong vs Weak Factors Pill Summary */}
                    <div className="flex gap-2 justify-between bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/30 text-xs">
                      {evidence.strong_matches && evidence.strong_matches.length > 0 && (
                        <div className="flex-1">
                          <span className="text-[9px] block text-on-surface-variant font-bold uppercase">{t('farming.strong_factors')}</span>
                          <span className="text-[11px] text-green-700 font-bold capitalize">
                            ✓ {evidence.strong_matches.join(', ')}
                          </span>
                        </div>
                      )}
                      {evidence.weak_matches && evidence.weak_matches.length > 0 && (
                        <div className="flex-1 text-right">
                          <span className="text-[9px] block text-on-surface-variant font-bold uppercase">{t('farming.weak_factors')}</span>
                          <span className="text-[11px] text-orange-700 font-bold capitalize">
                            ⚠️ {evidence.weak_matches.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedCropToRegister && (
        <RegisterCropForm 
          initialCrop={selectedCropToRegister}
          onClose={() => setSelectedCropToRegister(null)}
          onSuccess={() => {
            setSelectedCropToRegister(null);
            onSwitchToFarm();
          }}
        />
      )}
    </div>
  );
};
