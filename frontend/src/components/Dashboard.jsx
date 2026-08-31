import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { api } from '../services/api';
import { getLocalizedCropName, getLocalizedStageName, getLocalizedSeason, getLocalizedWeatherCondition, CROP_TRANSLATIONS } from '../data/cropTranslations';

// Intelligent rule-based evaluation of live weather, rainfall forecast, irrigation & fertilizer actions per crop
function getCropWeatherSuitability(cropName, weather, forecast, lang = 'en') {
  const crop = cropName?.toLowerCase() || 'rice';
  const temp = weather?.temperature ?? 28;
  const humidity = weather?.humidity ?? 60;
  const rain1h = weather?.rain_1h ?? 0;
  const windSpeed = weather?.wind_speed ?? 10;

  // 1. Calculate upcoming rainfall forecast & probability
  const todayRainProb = forecast?.[0]?.rain_prob != null ? Math.round(forecast[0].rain_prob * 100) : (rain1h > 0 ? 85 : 15);
  const tomorrowRainProb = forecast?.[1]?.rain_prob != null ? Math.round(forecast[1].rain_prob * 100) : 10;
  const maxRainProb = Math.max(todayRainProb, tomorrowRainProb);
  const isRainImminent = maxRainProb >= 40 || rain1h > 0;

  // 2. Compute universal Irrigation Action Directive
  let irrigation = {
    status: 'normal',
    action: lang === 'hi' ? 'सामान्य सिंचाई' : lang === 'pa' ? 'ਆਮ ਸਿੰਚਾਈ' : 'NORMAL MOISTURE',
    reason: lang === 'hi' ? 'खेत में सामान्य नमी का स्तर बनाए रखें।' : lang === 'pa' ? 'ਖੇਤ ਵਿੱਚ ਆਮ ਨਮੀ ਬਣਾਈ ਰੱਖੋ।' : 'Maintain standard field moisture levels.',
    icon: 'water_drop'
  };

  if (isRainImminent) {
    irrigation = {
      status: 'stop',
      action: lang === 'hi' ? 'सिंचाई न करें' : lang === 'pa' ? 'ਸਿੰਚਾਈ ਨਾ ਕਰੋ' : 'DO NOT IRRIGATE',
      reason: lang === 'hi'
        ? `24-48 घंटों में बारिश (${maxRainProb}%) का अनुमान। जलभराव और जड़ों के सड़ने से बचें।`
        : lang === 'pa'
        ? `24-48 ਘੰਟਿਆਂ 'ਚ ਮੀਂਹ (${maxRainProb}%) ਦੀ ਸੰਭਾਵਨਾ। ਜੜ੍ਹਾਂ ਦੇ ਗਲਣ ਤੋਂ ਬਚੋ।`
        : `Rain forecast (${maxRainProb}% chance in 24-48h). Avoid over-saturation and root rot.`,
      icon: 'block'
    };
  } else if (temp >= 32 && maxRainProb < 20) {
    irrigation = {
      status: 'needed',
      action: lang === 'hi' ? 'सिंचाई की सिफारिश' : lang === 'pa' ? 'ਸਿੰਚਾਈ ਦੀ ਲੋੜ' : 'IRRIGATION RECOMMENDED',
      reason: lang === 'hi'
        ? `गर्म व सूखा मौसम (${temp}°C)। सुबह के समय हल्की सिंचाई करें।`
        : lang === 'pa'
        ? `ਗਰਮ ਤੇ ਸੁੱਕਾ ਮੌਸਮ (${temp}°C)। ਸਵੇਰ ਵੇਲੇ ਹਲਕੀ ਸਿੰਚਾਈ ਕਰੋ।`
        : `Dry & warm conditions (${temp}°C, low rain risk). Schedule light early morning watering.`,
      icon: 'water_drop'
    };
  }

  // 3. Compute universal Fertilizer & Chemical Directive
  let fertilizer = {
    status: 'safe',
    action: lang === 'hi' ? 'उर्वरक प्रयोग सुरक्षित' : lang === 'pa' ? 'ਖਾਦ ਪਾਉਣਾ ਸੁਰੱਖਿਅਤ' : 'SAFE TO APPLY',
    reason: lang === 'hi'
      ? 'पत्तियां सूखी और मौसम अनुकूल है। यूरिया या पोषक तत्वों के छिड़काव का सही समय।'
      : lang === 'pa'
      ? 'ਮੌਸਮ ਅਨੁਕੂਲ ਹੈ। ਖਾਦ ਜਾਂ ਪੌਸ਼ਟਿਕ ਸਪਰੇਅ ਲਈ ਸਹੀ ਸਮਾਂ।'
      : 'Dry canopy & moderate conditions. Optimal window for basal/foliar nutrients.',
    icon: 'check_circle'
  };

  if (isRainImminent) {
    fertilizer = {
      status: 'delay',
      action: lang === 'hi' ? 'उर्वरक और यूरिया का प्रयोग टालें' : lang === 'pa' ? 'ਖਾਦ ਅਤੇ ਯੂਰੀਆ ਮੁਲਤਵੀ ਕਰੋ' : 'POSTPONE FERTILIZER & UREA',
      reason: lang === 'hi'
        ? `बारिश (${maxRainProb}%) के पानी के साथ नाइट्रोजन बह जाएगा। बारिश रुकने के बाद ही यूरिया डालें।`
        : lang === 'pa'
        ? `ਮੀਂਹ (${maxRainProb}%) ਦੇ ਪਾਣੀ ਨਾਲ ਨਾਈਟ੍ਰੋਜਨ ਵਹਿ ਜਾਵੇਗਾ। ਮੀਂਹ ਰੁਕਣ ਤੋਂ ਬਾਅਦ ਹੀ ਯੂਰੀਆ ਪਾਓ।`
        : `Rainfall (${maxRainProb}% chance) will leach dissolved nitrogen into runoff. Apply only after rain.`,
      icon: 'pause_circle'
    };
  } else if (windSpeed >= 20) {
    fertilizer = {
      status: 'delay',
      action: lang === 'hi' ? 'छिड़काव टालें' : lang === 'pa' ? 'ਸਪਰੇਅ ਟਾਲੋ' : 'DELAY FOLIAR SPRAY',
      reason: lang === 'hi'
        ? `तेज़ हवा (${windSpeed} किमी/घंटा) से दवा का बहाव और नुकसान होता है।`
        : lang === 'pa'
        ? `ਤੇਜ਼ ਹਵਾ (${windSpeed} ਕਿਲੋਮੀਟਰ/ਘੰਟਾ) ਨਾਲ ਦਵਾਈ ਦਾ ਨੁਕਸਾਨ ਹੁੰਦਾ ਹੈ।`
        : `High winds (${windSpeed} km/h) cause chemical spray drift and poor leaf absorption.`,
      icon: 'air'
    };
  }

  // 4. Crop-Specific Agronomic Verdicts
  // 4a. Rice / Paddy
  if (crop === 'rice') {
    if (isRainImminent) {
      return {
        status: 'good',
        badge: lang === 'hi' ? 'धान के लिए बारिश फायदेमंद' : lang === 'pa' ? 'ਝੋਨੇ ਲਈ ਮੀਂਹ ਲਾਭਦਾਇਕ' : 'Rain Beneficial (Paddy)',
        color: 'text-green-700 bg-green-50 border-green-200',
        icon: 'thunderstorm',
        rainChance: maxRainProb,
        irrigation,
        fertilizer,
        summary: lang === 'hi'
          ? `बारिश (${maxRainProb}% संभावना) खेत में 3-5 सेमी पानी का स्तर बनाए रखने में सहायक है।`
          : lang === 'pa'
          ? `ਮੀਂਹ (${maxRainProb}% ਸੰਭਾਵਨਾ) ਖੇਤ ਵਿੱਚ 3-5 ਸੈਂਟੀਮੀਟਰ ਪਾਣੀ ਬਣਾਈ ਰੱਖਣ 'ਚ ਮਦਦਗਾਰ ਹੈ।`
          : `Precipitation (${maxRainProb}% chance) helps maintain target 3-5 cm standing water.`,
        precaution: lang === 'hi'
          ? 'खेत की मेड़ मजबूत रखें ताकि बारिश का पानी जमा हो सके, लेकिन बारिश थमने तक यूरिया टॉप-ड्रेसिंग न करें।'
          : lang === 'pa'
          ? 'ਖੇਤ ਦੀ ਵੱਟ ਮਜ਼ਬੂਤ ਰੱਖੋ ਤਾਂ ਜੋ ਮੀਂਹ ਦਾ ਪਾਣੀ ਇਕੱਠਾ ਹੋ ਸਕੇ, ਪਰ ਮੀਂਹ ਰੁਕਣ ਤੱਕ ਯੂਰੀਆ ਨਾ ਪਾਓ।'
          : 'Keep bunds intact to harvest rainwater, but strictly hold urea top-dressing until showers stop.'
      };
    } else if (temp > 37) {
      return {
        status: 'caution',
        badge: lang === 'hi' ? 'अत्यधिक गर्मी चेतावनी' : lang === 'pa' ? 'ਵੱਧ ਗਰਮੀ ਚੇਤਾਵਨੀ' : 'High Heat Watch',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        icon: 'warning',
        rainChance: maxRainProb,
        irrigation: {
          status: 'needed',
          action: lang === 'hi' ? 'पानी का स्तर बढ़ाएं' : lang === 'pa' ? 'ਪਾਣੀ ਦਾ ਪੱਧਰ ਵਧਾਓ' : 'TOP UP WATER LEVEL',
          reason: lang === 'hi' ? 'अधिक गर्मी से धान के खेत में पानी जल्दी सूखता है।' : lang === 'pa' ? 'ਗਰਮੀ ਕਾਰਨ ਪਾਣੀ ਜਲਦੀ ਸੁੱਕਦਾ ਹੈ।' : 'High heat accelerates evaporation from paddy beds.',
          icon: 'water_drop'
        },
        fertilizer,
        summary: lang === 'hi' ? 'तेज़ धूप से खेत का पानी सूख सकता है और पत्तियों के सिरे झुलस सकते हैं।' : lang === 'pa' ? 'ਧੁੱਪ ਨਾਲ ਪੱਤਿਆਂ ਦੇ ਸਿਰੇ ਝੁਲਸ ਸਕਦੇ ਹਨ।' : 'Intense heat can dry standing water and cause leaf tip burn.',
        precaution: lang === 'hi' ? 'सुबह या शाम के समय खेत में पानी का स्तर 5 सेमी तक बनाए रखें।' : lang === 'pa' ? 'ਸਵੇਰੇ ਜਾਂ ਸ਼ਾਮ ਨੂੰ ਪਾਣੀ 5 ਸੈਂਟੀਮੀਟਰ ਤੱਕ ਰੱਖੋ।' : 'Replenish field water to 5cm during early morning or evening hours.'
      };
    }
  }

  // 4b. Maize / Corn
  if (crop === 'maize') {
    if (isRainImminent) {
      return {
        status: 'bad',
        badge: lang === 'hi' ? 'जलभराव चेतावनी' : lang === 'pa' ? 'ਪਾਣੀ ਖੜ੍ਹਨ ਦੀ ਚੇਤਾਵਨੀ' : 'Waterlogging Alert',
        color: 'text-red-700 bg-red-50 border-red-200',
        icon: 'gpp_bad',
        rainChance: maxRainProb,
        irrigation,
        fertilizer,
        summary: lang === 'hi' ? `मक्के की जड़ें खड़े पानी के प्रति बहुत संवेदनशील हैं (${maxRainProb}% बारिश)।` : lang === 'pa' ? `ਮੱਕੀ ਦੀਆਂ ਜੜ੍ਹਾਂ ਖੜ੍ਹੇ ਪਾਣੀ ਨਾਲ ਖਰਾਬ ਹੁੰਦੀਆਂ ਹਨ (${maxRainProb}% ਮੀਂਹ)।` : `Maize roots are highly sensitive to standing water (${maxRainProb}% rain probability).`,
        precaution: lang === 'hi' ? 'खेत में तुरंत जल निकासी की नालियां खोलें और सभी उर्वरक प्रयोग टालें।' : lang === 'pa' ? 'ਪਾਣੀ ਦੀ ਨਿਕਾਸੀ ਯਕੀਨੀ ਬਣਾਓ ਅਤੇ ਖਾਦ ਪਾਉਣਾ ਰੋਕੋ।' : 'Open drainage furrows immediately and postpone all fertilizer applications.'
      };
    }
  }

  // 4c. Cotton
  if (crop === 'cotton') {
    if (isRainImminent || humidity > 78) {
      return {
        status: 'bad',
        badge: lang === 'hi' ? 'टिंडे सड़ने और कीट का खतरा' : lang === 'pa' ? 'ਟੀਂਡੇ ਗਲਣ ਦਾ ਖਤਰਾ' : 'Boll Rot / Pest Alert',
        color: 'text-red-700 bg-red-50 border-red-200',
        icon: 'gpp_bad',
        rainChance: maxRainProb,
        irrigation,
        fertilizer,
        summary: lang === 'hi' ? `अधिक नमी (${maxRainProb}% बारिश, ${humidity}% नमी) से सफेद मक्खी का प्रकोप बढ़ता है।` : lang === 'pa' ? `ਨਮੀ (${maxRainProb}% ਮੀਂਹ, ${humidity}% ਨਮੀ) ਨਾਲ ਚਿੱਟੀ ਮੱਖੀ ਦਾ ਖਤਰਾ ਵਧਦਾ ਹੈ।` : `High moisture (${maxRainProb}% rain, ${humidity}% humidity) promotes boll shedding & Whitefly.`,
        precaution: lang === 'hi' ? 'खेत से तुरंत पानी निकालें और पत्तियां सूखने तक छिड़काव टालें।' : lang === 'pa' ? 'ਖੇਤ ਵਿੱਚੋਂ ਪਾਣੀ ਕੱਢੋ ਅਤੇ ਪੱਤੇ ਸੁੱਕਣ ਤੱਕ ਸਪਰੇਅ ਰੋਕੋ।' : 'Ensure rapid drainage and delay all pesticide sprays until foliage dries.'
      };
    }
  }

  // 4d. Pulses
  if (['chickpea', 'lentil', 'pigeonpeas', 'kidneybeans', 'mungbean', 'blackgram', 'mothbeans'].includes(crop)) {
    if (isRainImminent || humidity > 75) {
      return {
        status: 'bad',
        badge: lang === 'hi' ? 'उकठा / झुलसा रोग का खतरा' : lang === 'pa' ? 'ਝੁਲਸ ਰੋਗ ਦਾ ਖਤਰਾ' : 'Rust / Wilt Hazard',
        color: 'text-red-700 bg-red-50 border-red-200',
        icon: 'gpp_bad',
        rainChance: maxRainProb,
        irrigation,
        fertilizer,
        summary: lang === 'hi' ? `दलहनी फसलें जलभराव सहन नहीं कर सकतीं (${maxRainProb}% बारिश का जोखिम)।` : lang === 'pa' ? `ਦਾਲਾਂ ਦੀਆਂ ਫਸਲਾਂ ਪਾਣੀ ਖੜ੍ਹਨਾ ਬਰਦਾਸ਼ਤ ਨਹੀਂ ਕਰ ਸਕਦੀਆਂ (${maxRainProb}% ਮੀਂਹ)।` : `Pulses cannot tolerate saturated root zones (${maxRainProb}% rain risk).`,
        precaution: lang === 'hi' ? 'सिंचाई तुरंत रोकें और चारों ओर जल निकासी की व्यवस्था करें।' : lang === 'pa' ? 'ਸਿੰਚਾਈ ਰੋਕੋ ਅਤੇ ਪਾਣੀ ਦੀ ਨਿਕਾਸੀ ਸਾਫ਼ ਕਰੋ।' : 'Strictly stop irrigation, ensure clear perimeter drains, and pause foliar feeds.'
      };
    }
  }

  // Default fallback
  return {
    status: 'good',
    badge: isRainImminent 
      ? (lang === 'hi' ? `बारिश निगरानी (${maxRainProb}%)` : lang === 'pa' ? `ਮੀਂਹ ਨਿਗਰਾਨੀ (${maxRainProb}%)` : `Rain Watch (${maxRainProb}%)`) 
      : (lang === 'hi' ? 'मौसम अनुकूल' : lang === 'pa' ? 'ਮੌਸਮ ਅਨੁਕੂਲ' : 'Weather Favorable'),
    color: isRainImminent ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-green-700 bg-green-50 border-green-200',
    icon: isRainImminent ? 'cloud' : 'check_circle',
    rainChance: maxRainProb,
    irrigation,
    fertilizer,
    summary: isRainImminent 
      ? (lang === 'hi' ? `संभावित बारिश (${maxRainProb}% संभावना)। प्राकृतिक रूप से मिट्टी में नमी की पूर्ति।` : lang === 'pa' ? `ਸੰਭਾਵੀ ਮੀਂਹ (${maxRainProb}%)। ਮਿੱਟੀ ਵਿੱਚ ਕੁਦਰਤੀ ਨਮੀ ਦੀ ਪੂਰਤੀ।` : `Upcoming precipitation (${maxRainProb}% chance). Natural soil replenishment expected.`)
      : (lang === 'hi' ? 'वर्तमान तापमान और मौसमी पैरामीटर सामान्य विकास सीमा में हैं।' : lang === 'pa' ? 'ਤਾਪਮਾਨ ਅਤੇ ਮੌਸਮ ਆਮ ਵਿਕਾਸ ਸੀਮਾ ਵਿੱਚ ਹਨ।' : 'Current temperature and weather parameters are within normal growth bounds.'),
    precaution: isRainImminent 
      ? (lang === 'hi' ? 'उर्वरक प्रयोग टालें और खेत में जल निकासी की निगरानी करें।' : lang === 'pa' ? 'ਖਾਦ ਪਾਉਣਾ ਮੁਲਤਵੀ ਕਰੋ ਅਤੇ ਨਿਕਾਸੀ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ।' : 'Postpone fertilizer application and monitor field drainage.')
      : (lang === 'hi' ? 'नियमित सिंचाई और मानक फसल देखभाल जारी रखें।' : lang === 'pa' ? 'ਆਮ ਸਿੰਚਾਈ ਅਤੇ ਫਸਲ ਦੀ ਦੇਖਭਾਲ ਜਾਰੀ ਰੱਖੋ।' : 'Follow standard irrigation and crop care schedule.')
  };
}

export const Dashboard = ({ onNavigate, onOpenSoilModal }) => {
  const { t, i18n } = useTranslation();
  const { profile, updateActiveCrop } = useAuth();
  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [registeredCrops, setRegisteredCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch registered crops & weather
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const lat = profile?.latitude || 30.9010;
      const lon = profile?.longitude || 75.8573;
      const state = profile?.state || 'Punjab';
      const crop = profile?.selected_crop || 'rice';

      // 1. Fetch live weather & 5-day forecast
      const forecastData = await api.getForecast(crop, lat, lon, state);
      if (forecastData.current_weather) {
        setWeather(forecastData.current_weather);
      }
      if (forecastData.forecast) {
        setForecast(forecastData.forecast);
      }

      // 2. Fetch all registered farm crops
      const crops = await api.getMyCrops();
      setRegisteredCrops(crops || []);
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [profile?.selected_crop, profile?.state]);

  const activeCrops = registeredCrops.filter(c => c.status === 'active');
  const primaryCropName = profile?.selected_crop || (activeCrops.length > 0 ? activeCrops[0].crop_name : 'rice');

  const handleSetPrimary = async (crop) => {
    try {
      await api.setPrimaryCrop(crop.id);
      await updateActiveCrop(crop.crop_name);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to set primary crop:', err);
    }
  };

  // Multi-crop synthesized Voice Advisory with explicit rain, irrigation & fertilizer directives
  const handleVoiceAdvisory = () => {
    if (isSpeaking) {
      stop();
      return;
    }

    const farmerName = profile?.full_name || 'Farmer';
    const temp = weather?.temperature ? `${weather.temperature} degree` : '28 degree';
    const hum = weather?.humidity ? `${weather.humidity}%` : '60%';
    const location = profile?.village_or_city || profile?.state || 'your region';

    const cropsToAdvise = activeCrops.length > 0 ? activeCrops : [{ crop_name: primaryCropName }];
    
    let cropReports = cropsToAdvise.map(c => {
      const cName = getLocalizedCropName(c.crop_name, i18n.language);
      const suit = getCropWeatherSuitability(c.crop_name, weather, forecast);
      
      if (i18n.language === 'hi') {
        const irrText = suit.irrigation.status === 'stop' 
          ? 'बारिश के कारण सिंचाई तुरंत रोक दें।' 
          : suit.irrigation.status === 'needed' 
          ? 'सूखे मौसम के कारण हल्की सिंचाई करें।' 
          : 'सिंचाई सामान्य रखें।';
        const fertText = suit.fertilizer.status === 'delay'
          ? 'बारिश से खाद बहने का खतरा है, इसलिए यूरिया या खाद का छिड़काव टालें।'
          : 'खाद और पोषण देने के लिए मौसम सुरक्षित है।';
        return `आपकी ${cName} फसल के लिए: ${irrText} ${fertText} ${suit.precaution}`;
      } else if (i18n.language === 'pa') {
        const irrText = suit.irrigation.status === 'stop' ? 'ਮੀਂਹ ਕਾਰਨ ਸਿੰਚਾਈ ਰੋਕੋ।' : 'ਸਿੰਚਾਈ ਕੀਤੀ ਜਾ ਸਕਦੀ ਹੈ।';
        const fertText = suit.fertilizer.status === 'delay' ? 'ਖਾਦ ਅਤੇ ਯੂਰੀਆ ਪਾਉਣਾ ਮੁਲਤਵੀ ਕਰੋ।' : 'ਖਾਦ ਪਾਉਣ ਲਈ ਢੁਕਵਾਂ ਸਮਾਂ ਹੈ।';
        return `ਤੁਹਾਡੀ ${cName} ਫਸਲ ਲਈ: ${irrText} ${fertText} ${suit.precaution}`;
      } else {
        return `For your ${cName} crop: Irrigation recommendation is ${suit.irrigation.action}. Fertilizer recommendation is ${suit.fertilizer.action}. ${suit.precaution}`;
      }
    }).join(' ');

    const todayRainChance = forecast?.[0]?.rain_prob != null ? Math.round(forecast[0].rain_prob * 100) : (weather?.rain_1h > 0 ? 85 : 15);
    let speechText = '';
    if (i18n.language === 'hi') {
      speechText = `नमस्ते ${farmerName} जी। आपके क्षेत्र ${location} में तापमान ${temp} सेल्सियस है और बारिश की संभावना ${todayRainChance}% है। ${cropReports}`;
    } else if (i18n.language === 'pa') {
      speechText = `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ${farmerName} ਜੀ। ਤੁਹਾਡੇ ਇਲਾਕੇ ਵਿੱਚ ਤਾਪਮਾਨ ${temp} ਸੈਲਸੀਅਸ ਅਤੇ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ${todayRainChance}% ਹੈ। ${cropReports}`;
    } else {
      speechText = `Namaste ${farmerName}. Live temperature in ${location} is ${temp} Celsius with a ${todayRainChance}% rain forecast. ${cropReports}`;
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
              {profile?.village_or_city || profile?.district || 'Farm Location'}{profile?.state ? `, ${profile.state}` : ''}
            </span>
            <span className="mx-1">•</span>
            <span>{profile?.farm_size || '2.0'} {profile?.farm_size_unit || 'Acres'}</span>
          </p>
        </div>
        
        <button
          onClick={() => onNavigate('profile')}
          className="w-12 h-12 rounded-2xl bg-surface-container border border-outline-variant/40 p-0.5 flex items-center justify-center overflow-hidden shadow-sm hover:scale-105 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
          title="Farmer Profile"
        >
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
            alt="Farmer Portrait"
            className="w-full h-full object-cover rounded-xl"
          />
        </button>
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
            title="Listen to Multi-Crop Advisory"
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
                ? 'KrishiVani is reading live advisories for all your active crops. Tap mic to stop.'
                : activeCrops.length > 1
                ? `Tap to hear personalized weather advisories for all ${activeCrops.length} registered crops.`
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
            {weather?.is_live ? '● Live OWM' : '● Live Weather'}
          </span>
          <span className="text-[10px] text-on-surface-variant/80 mt-1 block">
            {profile?.village_or_city || profile?.state || 'Local Area'}
          </span>
        </div>
      </div>

      {/* 4. Multi-Crop Farm Management & Weather Suitability Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">agriculture</span>
            <h2 className="text-sm font-bold text-on-surface">
              {i18n.language === 'hi'
                ? `पंजीकृत फसलें (${activeCrops.length > 0 ? activeCrops.length : '1 मुख्य'})`
                : i18n.language === 'pa'
                ? `ਦਰਜ ਕੀਤੀਆਂ ਫਸਲਾਂ (${activeCrops.length > 0 ? activeCrops.length : '1 ਮੁੱਖ'})`
                : `My Farm Crops (${activeCrops.length > 0 ? activeCrops.length : '1 Default'})`}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('farming')}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 bg-secondary-container/40 px-2.5 py-1 rounded-full"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            <span>
              {i18n.language === 'hi' ? '+ फसल जोड़ें / प्रबंधन' : i18n.language === 'pa' ? '+ ਫਸਲ ਜੋੜੋ / ਪ੍ਰਬੰਧ' : '+ Add / Manage'}
            </span>
          </button>
        </div>

        {/* List of Active Registered Crops */}
        {activeCrops.length === 0 ? (
          // Default Profile Crop Card when no crops registered in DB yet
          <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-card border border-outline-variant/40 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container flex-shrink-0">
                <img
                  src={CROP_TRANSLATIONS[primaryCropName.toLowerCase()]?.image || 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80'}
                  alt={primaryCropName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-on-surface truncate">
                    {getLocalizedCropName(primaryCropName, i18n.language)}
                  </h3>
                  <span className="text-[10px] font-bold bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full">
                    {i18n.language === 'hi' ? 'मुख्य फसल' : i18n.language === 'pa' ? 'ਮੁੱਖ ਫਸਲ' : 'Primary Crop'}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {i18n.language === 'hi' ? 'राज्य:' : i18n.language === 'pa' ? 'ਰਾਜ:' : 'Region:'} <strong className="text-on-surface">{profile?.state || 'Punjab'}</strong>
                </p>
              </div>
            </div>

            {/* Weather Suitability Verdict & Action Directives */}
            {(() => {
              const suit = getCropWeatherSuitability(primaryCropName, weather, forecast, i18n.language);
              return (
                <div className={`p-3.5 rounded-2xl border text-xs flex flex-col gap-2.5 ${suit.color}`}>
                  <div className="flex items-center justify-between font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">{suit.icon}</span>
                      <span className="text-xs">{suit.badge}</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/80 shadow-xs border border-current/20">
                      🌧️ {suit.rainChance}% {i18n.language === 'hi' ? 'बारिश जोखिम' : i18n.language === 'pa' ? 'ਮੀਂਹ ਜੋਖਮ' : 'Rain Risk'}
                    </span>
                  </div>

                  <p className="text-[11px] leading-relaxed opacity-95">{suit.summary}</p>

                  {/* 2-Column Action Grid for Irrigation & Fertilizer Directives */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-current/15">
                    {/* Irrigation Directive */}
                    <div className={`p-2 rounded-xl text-xs flex flex-col gap-0.5 shadow-xs ${
                      suit.irrigation.status === 'stop' ? 'bg-red-100/90 text-red-900 border border-red-300' :
                      suit.irrigation.status === 'needed' ? 'bg-blue-100/90 text-blue-900 border border-blue-300' :
                      'bg-white/80 text-gray-800 border border-gray-200'
                    }`}>
                      <div className="flex items-center gap-1 font-black text-[10px] uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[13px]">{suit.irrigation.icon}</span>
                        <span>{suit.irrigation.action}</span>
                      </div>
                      <p className="text-[10px] leading-tight font-medium opacity-90">{suit.irrigation.reason}</p>
                    </div>

                    {/* Fertilizer Directive */}
                    <div className={`p-2 rounded-xl text-xs flex flex-col gap-0.5 shadow-xs ${
                      suit.fertilizer.status === 'delay' ? 'bg-amber-100/90 text-amber-900 border border-amber-300' :
                      suit.fertilizer.status === 'safe' ? 'bg-emerald-100/90 text-emerald-900 border border-emerald-300' :
                      'bg-white/80 text-gray-800 border border-gray-200'
                    }`}>
                      <div className="flex items-center gap-1 font-black text-[10px] uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[13px]">{suit.fertilizer.icon}</span>
                        <span>{suit.fertilizer.action}</span>
                      </div>
                      <p className="text-[10px] leading-tight font-medium opacity-90">{suit.fertilizer.reason}</p>
                    </div>
                  </div>

                  <div className="text-[11px] font-semibold pt-1 flex items-start gap-1 text-on-surface">
                    <span className="material-symbols-outlined text-[14px] text-primary flex-shrink-0 mt-0.5">tips_and_updates</span>
                    <span>{suit.precaution}</span>
                  </div>
                </div>
              );
            })()}

            <button
              onClick={() => onNavigate('farming')}
              className="w-full bg-primary/10 text-primary font-bold py-2 rounded-xl text-xs hover:bg-primary/20 transition-colors text-center"
            >
              {i18n.language === 'hi'
                ? '+ मेरा खेत में बुवाई की जानकारी दर्ज करें'
                : i18n.language === 'pa'
                ? '+ ਮੇਰਾ ਖੇਤ ਵਿੱਚ ਬਿਜਾਈ ਦਰਜ ਕਰੋ'
                : '+ Register Active Sowing Details in My Farm'}
            </button>
          </div>
        ) : (
          // Render each registered crop with dynamic suitability and lifecycle stage
          <div className="flex flex-col gap-3">
            {activeCrops.map((crop) => {
              const cropMeta = CROP_TRANSLATIONS[crop.crop_name?.toLowerCase()] || {};
              const isPrimary = profile?.selected_crop?.toLowerCase() === crop.crop_name?.toLowerCase();
              const suit = getCropWeatherSuitability(crop.crop_name, weather, forecast, i18n.language);

              return (
                <div 
                  key={crop.id}
                  className={`bg-surface-container-lowest rounded-3xl p-4 shadow-card border transition-all flex flex-col gap-3 ${
                    isPrimary ? 'border-primary/50 bg-gradient-to-b from-primary/5 to-transparent' : 'border-outline-variant/40'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container flex-shrink-0 relative">
                        <img
                          src={cropMeta.image || 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80'}
                          alt={crop.crop_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-extrabold text-base text-on-surface">
                            {getLocalizedCropName(crop.crop_name, i18n.language)}
                          </h3>
                          {isPrimary && (
                            <span className="text-[10px] font-extrabold bg-primary text-on-primary px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                              <span className="material-symbols-filled text-[11px] text-yellow-300">star</span>
                              {i18n.language === 'hi' ? 'मुख्य' : i18n.language === 'pa' ? 'ਮੁੱਖ' : 'Primary'}
                            </span>
                          )}
                          <span className="text-[10px] font-bold bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full capitalize">
                            {getLocalizedSeason(crop.season, i18n.language)}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {i18n.language === 'hi' ? 'चरण:' : i18n.language === 'pa' ? 'ਪੜਾਅ:' : 'Stage:'} <strong className="text-on-surface">{getLocalizedStageName(crop.current_stage || 'Growing', i18n.language)}</strong> ({crop.stage_progress_pct || 0}%)
                        </p>
                      </div>
                    </div>

                    {!isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(crop)}
                        className="text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-lg transition-colors"
                        title="Set as Primary Crop"
                      >
                        {i18n.language === 'hi' ? 'मुख्य बनाएं' : i18n.language === 'pa' ? 'ਮੁੱਖ ਬਣਾਓ' : 'Make Primary'}
                      </button>
                    )}
                  </div>

                  {/* Weather Suitability Verdict & Action Directives */}
                  <div className={`p-3.5 rounded-2xl border text-xs flex flex-col gap-2.5 ${suit.color}`}>
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">{suit.icon}</span>
                        <span className="text-xs">
                          {i18n.language === 'hi'
                            ? `${suit.badge} (${getLocalizedCropName(crop.crop_name, i18n.language)})`
                            : i18n.language === 'pa'
                            ? `${suit.badge} (${getLocalizedCropName(crop.crop_name, i18n.language)})`
                            : `${suit.badge} for ${getLocalizedCropName(crop.crop_name, i18n.language)}`}
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/80 shadow-xs border border-current/20">
                        🌧️ {suit.rainChance}% {i18n.language === 'hi' ? 'बारिश जोखिम' : i18n.language === 'pa' ? 'ਮੀਂਹ ਜੋਖਮ' : 'Rain Risk'}
                      </span>
                    </div>

                    <p className="text-[11px] leading-relaxed opacity-95">{suit.summary}</p>

                    {/* 2-Column Action Grid for Irrigation & Fertilizer Directives */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-current/15">
                      {/* Irrigation Directive */}
                      <div className={`p-2 rounded-xl text-xs flex flex-col gap-0.5 shadow-xs ${
                        suit.irrigation.status === 'stop' ? 'bg-red-100/90 text-red-900 border border-red-300' :
                        suit.irrigation.status === 'needed' ? 'bg-blue-100/90 text-blue-900 border border-blue-300' :
                        'bg-white/80 text-gray-800 border border-gray-200'
                      }`}>
                        <div className="flex items-center gap-1 font-black text-[10px] uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[13px]">{suit.irrigation.icon}</span>
                          <span>{suit.irrigation.action}</span>
                        </div>
                        <p className="text-[10px] leading-tight font-medium opacity-90">{suit.irrigation.reason}</p>
                      </div>

                      {/* Fertilizer Directive */}
                      <div className={`p-2 rounded-xl text-xs flex flex-col gap-0.5 shadow-xs ${
                        suit.fertilizer.status === 'delay' ? 'bg-amber-100/90 text-amber-900 border border-amber-300' :
                        suit.fertilizer.status === 'safe' ? 'bg-emerald-100/90 text-emerald-900 border border-emerald-300' :
                        'bg-white/80 text-gray-800 border border-gray-200'
                      }`}>
                        <div className="flex items-center gap-1 font-black text-[10px] uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[13px]">{suit.fertilizer.icon}</span>
                          <span>{suit.fertilizer.action}</span>
                        </div>
                        <p className="text-[10px] leading-tight font-medium opacity-90">{suit.fertilizer.reason}</p>
                      </div>
                    </div>

                    <div className="text-[11px] font-semibold pt-1 flex items-start gap-1 text-on-surface">
                      <span className="material-symbols-outlined text-[14px] text-primary flex-shrink-0 mt-0.5">tips_and_updates</span>
                      <span>{suit.precaution}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Smart Bento Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {/* Personalised Farming Navigation */}
        <div
          onClick={() => onNavigate('farming')}
          className="bg-surface-container-lowest rounded-3xl p-4 shadow-card border border-outline-variant/40 flex flex-col justify-between h-32 cursor-pointer hover:border-primary/40 transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-filled text-2xl">potted_plant</span>
          </div>
          <div>
            <div className="text-xs font-black text-on-surface">
              {i18n.language === 'hi' ? 'व्यक्तिगत खेती' : i18n.language === 'pa' ? 'ਨਿੱਜੀ ਖੇਤੀ' : 'Personalised Farming'}
            </div>
            <div className="text-[10px] text-on-surface-variant">
              {i18n.language === 'hi' ? 'मेरा खेत और AI प्रमाण' : i18n.language === 'pa' ? 'ਮੇਰਾ ਖੇਤ ਅਤੇ AI ਸਬੂਤ' : 'My Farm & AI Proofs'}
            </div>
          </div>
        </div>

        {/* Mandi Rates Navigation */}
        <div
          onClick={() => onNavigate('mandi')}
          className="bg-surface-container-lowest rounded-3xl p-4 shadow-card border border-outline-variant/40 flex flex-col justify-between h-32 cursor-pointer hover:border-primary/40 transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-filled text-2xl">storefront</span>
          </div>
          <div>
            <div className="text-xs font-black text-on-surface">{t('dashboard.action_mandi')}</div>
            <div className="text-[10px] text-on-surface-variant">
              {i18n.language === 'hi' ? 'ताजा एगमार्कनेट मंडी भाव' : i18n.language === 'pa' ? 'ਤਾਜ਼ਾ ਮੰਡੀ ਭਾਅ' : 'Live Agmarknet Prices'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

