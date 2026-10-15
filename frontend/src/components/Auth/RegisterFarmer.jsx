import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const RegisterFarmer = ({ onRegistrationComplete }) => {
  const { t, i18n } = useTranslation();
  const { user, saveFarmerProfile, logout } = useAuth();

  // Basic Details - dynamic defaults based on user name
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('Punjab');
  const [lat, setLat] = useState(30.9010);
  const [lon, setLon] = useState(75.8573);
  const [farmSize, setFarmSize] = useState(2.5);
  const [farmSizeUnit, setFarmSizeUnit] = useState('Acres');
  const [prefLang, setPrefLang] = useState(i18n.language || 'en');

  // Soil Parameters
  const [nitrogen, setNitrogen] = useState(85);
  const [phosphorus, setPhosphorus] = useState(46);
  const [potassium, setPotassium] = useState(35);
  const [ph, setPh] = useState(7.2);
  const [rainfall, setRainfall] = useState(85);

  // States & SHC data
  const [stateSoilDefaults, setStateSoilDefaults] = useState([]);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load state soil defaults
    const fetchDefaults = async () => {
      try {
        const data = await api.getSoilDefaults();
        setStateSoilDefaults(data);
        // Auto fill for initial state
        if (data && data.length > 0) {
          const match = data.find(s => s.state.toLowerCase() === stateName.toLowerCase());
          if (match) {
            setNitrogen(match.nitrogen);
            setPhosphorus(match.phosphorus);
            setPotassium(match.potassium);
            setPh(match.ph);
            setRainfall(match.rainfall);
          }
        }
      } catch (err) {
        console.warn('Failed to load soil defaults:', err);
      }
    };
    fetchDefaults();
  }, []);

  const autoFillSoilForState = (targetState) => {
    if (!stateSoilDefaults || stateSoilDefaults.length === 0) return;
    const match = stateSoilDefaults.find(
      s => s.state.toLowerCase() === targetState.toLowerCase()
    );
    if (match) {
      setNitrogen(match.nitrogen);
      setPhosphorus(match.phosphorus);
      setPotassium(match.potassium);
      setPh(match.ph);
      setRainfall(match.rainfall);
    }
  };

  // Detect Live Location Online
  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    setLocationStatus('Accessing device GPS coordinates...');

    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        setLat(latitude);
        setLon(longitude);

        try {
          setLocationStatus('Resolving location and regional soil health card online...');
          const geo = await api.reverseGeocode(latitude, longitude);
          
          const detectedCity = geo.name || 'Local Area';
          const detectedDistrict = geo.district || geo.name || 'Local District';
          const detectedState = geo.state || 'Uttar Pradesh';

          setVillage(detectedCity);
          setDistrict(detectedDistrict);
          setStateName(detectedState);

          if (geo.soil) {
            setNitrogen(geo.soil.nitrogen);
            setPhosphorus(geo.soil.phosphorus);
            setPotassium(geo.soil.potassium);
            setPh(geo.soil.ph);
            setRainfall(geo.soil.rainfall);
          } else {
            autoFillSoilForState(detectedState);
          }

          setLocationStatus(`📍 Detected: ${detectedCity} (${detectedDistrict}), ${detectedState}`);
        } catch (err) {
          setLocationStatus(`📍 GPS locked: ${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E`);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setLocationStatus('Location access denied or unavailable. You can type your location manually.');
        setIsDetectingLocation(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleStateChange = (e) => {
    const selected = e.target.value;
    setStateName(selected);
    autoFillSoilForState(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const profileData = {
        full_name: fullName.trim() || user?.name || 'Farmer',
        phone: phone.trim() || user?.phone || '9876543210',
        village_or_city: village.trim() || district.trim() || stateName,
        district: district.trim() || village.trim() || stateName,
        state: stateName,
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        farm_size: parseFloat(farmSize) || 2.0,
        farm_size_unit: farmSizeUnit,
        preferred_language: prefLang,
        nitrogen: parseFloat(nitrogen),
        phosphorus: parseFloat(phosphorus),
        potassium: parseFloat(potassium),
        ph: parseFloat(ph),
        rainfall: parseFloat(rainfall),
        selected_crop: null
      };

      await saveFarmerProfile(profileData);
      i18n.changeLanguage(prefLang);
      localStorage.setItem('krishivani_lang', prefLang);
      onRegistrationComplete();
    } catch (err) {
      alert(`Registration error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12 max-w-md mx-auto relative px-4 pt-4">
      {/* Top Banner Card */}
      <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-card border border-outline-variant/40 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-filled text-2xl">person_pin</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-on-surface">{t('register.title')}</h1>
              <p className="text-xs text-on-surface-variant">{t('register.subtitle')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-xs text-error font-semibold flex items-center gap-1 px-3 py-1.5 rounded-xl border border-error/30 hover:bg-error/10 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Login
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Section 1: Farmer & Location */}
        <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-card border border-outline-variant/40 flex flex-col gap-3.5">
          <h2 className="text-sm font-bold text-primary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">badge</span>
            Farmer & Farm Location
          </h2>

          {/* Full Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">{t('login.name_label')}</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full bg-surface-container-low border border-outline-variant/70 rounded-xl px-3.5 h-11 text-xs font-medium text-on-surface outline-none focus:border-primary"
            />
          </div>

          {/* Online Live Location Fetcher */}
          <div className="bg-surface-container-low/70 border border-secondary-container/80 rounded-2xl p-3.5 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className="w-full h-11 bg-secondary hover:bg-primary text-on-secondary rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-60"
            >
              <span className={`material-symbols-outlined text-[18px] ${isDetectingLocation ? 'animate-spin' : ''}`}>
                {isDetectingLocation ? 'progress_activity' : 'my_location'}
              </span>
              <span>{isDetectingLocation ? t('register.detecting') : t('register.detect_location_btn')}</span>
            </button>
            {locationStatus && (
              <p className="text-[11px] font-semibold text-secondary text-center px-1">
                {locationStatus}
              </p>
            )}
          </div>

          {/* Village & District */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Village / City</label>
              <input
                type="text"
                required
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="e.g. Ghaziabad / Khanna"
                className="w-full bg-surface-container-low border border-outline-variant/70 rounded-xl px-3 h-10 text-xs font-medium text-on-surface outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">District</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Ghaziabad / Ludhiana"
                className="w-full bg-surface-container-low border border-outline-variant/70 rounded-xl px-3 h-10 text-xs font-medium text-on-surface outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* State Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">{t('register.state_label')}</label>
            <select
              value={stateName}
              onChange={handleStateChange}
              className="w-full bg-surface-container-low border border-outline-variant/70 rounded-xl px-3 h-11 text-xs font-medium text-on-surface outline-none focus:border-primary cursor-pointer"
            >
              {stateSoilDefaults.length > 0 ? (
                stateSoilDefaults.map((s) => (
                  <option key={s.state} value={s.state}>
                    {s.state}
                  </option>
                ))
              ) : (
                <>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Bihar">Bihar</option>
                </>
              )}
            </select>
          </div>

          {/* Farm Size & Preferred Language */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">{t('register.farm_size_label')}</label>
              <div className="flex items-center bg-surface-container-low border border-outline-variant/70 rounded-xl h-10 overflow-hidden">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                  className="w-16 px-2 bg-transparent text-xs font-bold text-on-surface outline-none text-center"
                />
                <select
                  value={farmSizeUnit}
                  onChange={(e) => setFarmSizeUnit(e.target.value)}
                  className="flex-1 bg-surface-container border-l border-outline-variant/60 text-[11px] font-semibold text-on-surface px-1 h-full outline-none"
                >
                  <option value="Acres">{t('register.unit_acres')}</option>
                  <option value="Hectares">{t('register.unit_hectares')}</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">{t('register.lang_preference')}</label>
              <select
                value={prefLang}
                onChange={(e) => setPrefLang(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/70 rounded-xl px-2.5 h-10 text-xs font-semibold text-on-surface outline-none focus:border-primary"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Soil Health Card & NPK Gauges */}
        <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-card border border-outline-variant/40 flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">science</span>
              {t('register.soil_section_title')}
            </h2>
            <button
              type="button"
              onClick={() => autoFillSoilForState(stateName)}
              className="text-[11px] font-bold text-primary bg-secondary-container/60 hover:bg-secondary-container px-2.5 py-1 rounded-full border border-primary/20 transition-all"
            >
              Reset to {stateName} SHC
            </button>
          </div>

          {/* Visual NPK Gauges / Indicators */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Nitrogen Gauge */}
            <div className="bg-surface-container-low rounded-2xl p-3 border border-outline-variant/50 flex flex-col items-center">
              <span className="text-[11px] font-bold text-secondary">Nitrogen (N)</span>
              <div className="text-lg font-extrabold text-on-surface my-1">{nitrogen}</div>
              <span className="text-[10px] text-on-surface-variant font-medium">kg/ha</span>
              <input
                type="range"
                min="10"
                max="140"
                value={nitrogen}
                onChange={(e) => setNitrogen(e.target.value)}
                className="w-full mt-2 accent-primary cursor-pointer h-1.5"
              />
            </div>

            {/* Phosphorus Gauge */}
            <div className="bg-surface-container-low rounded-2xl p-3 border border-outline-variant/50 flex flex-col items-center">
              <span className="text-[11px] font-bold text-secondary">Phosphorus (P)</span>
              <div className="text-lg font-extrabold text-on-surface my-1">{phosphorus}</div>
              <span className="text-[10px] text-on-surface-variant font-medium">kg/ha</span>
              <input
                type="range"
                min="5"
                max="120"
                value={phosphorus}
                onChange={(e) => setPhosphorus(e.target.value)}
                className="w-full mt-2 accent-primary cursor-pointer h-1.5"
              />
            </div>

            {/* Potassium Gauge */}
            <div className="bg-surface-container-low rounded-2xl p-3 border border-outline-variant/50 flex flex-col items-center">
              <span className="text-[11px] font-bold text-secondary">Potassium (K)</span>
              <div className="text-lg font-extrabold text-on-surface my-1">{potassium}</div>
              <span className="text-[10px] text-on-surface-variant font-medium">kg/ha</span>
              <input
                type="range"
                min="5"
                max="140"
                value={potassium}
                onChange={(e) => setPotassium(e.target.value)}
                className="w-full mt-2 accent-primary cursor-pointer h-1.5"
              />
            </div>
          </div>

          {/* pH and Rainfall inputs */}
          <div className="grid grid-cols-2 gap-2.5 mt-1">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-on-surface">{t('register.ph_label')}</label>
                <span className="text-xs font-bold text-primary">{ph}</span>
              </div>
              <input
                type="range"
                min="4.0"
                max="9.0"
                step="0.1"
                value={ph}
                onChange={(e) => setPh(e.target.value)}
                className="w-full accent-primary h-2 cursor-pointer mt-1"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-on-surface">Rainfall (mm)</label>
                <span className="text-xs font-bold text-primary">{rainfall} mm</span>
              </div>
              <input
                type="range"
                min="30"
                max="300"
                step="5"
                value={rainfall}
                onChange={(e) => setRainfall(e.target.value)}
                className="w-full accent-primary h-2 cursor-pointer mt-1"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 bg-primary hover:bg-primary-container text-on-primary rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-float transition-all active:scale-[0.98] disabled:opacity-50 mt-1"
        >
          {submitting ? (
            <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>{t('register.submit_btn')}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
