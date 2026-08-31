import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { getLocalizedCropName } from '../data/cropTranslations';

export const AlertsView = ({ onMarkAllRead, hasUnreadAlerts }) => {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // all, weather, market, crop_stage
  const [weatherMeta, setWeatherMeta] = useState(null);
  const [locationMeta, setLocationMeta] = useState(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.getLiveAlerts();
      if (res && res.alerts) {
        setAlerts(res.alerts);
        setWeatherMeta(res.weather_summary);
        setLocationMeta(res.location);
      }
    } catch (err) {
      console.error('Failed to fetch live alerts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [profile?.selected_crop, profile?.state, profile?.district]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isUnread: false })));
    if (onMarkAllRead) {
      onMarkAllRead();
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'weather') return a.category === 'weather' || a.category === 'disease';
    if (activeFilter === 'market') return a.category === 'market';
    if (activeFilter === 'crop_stage') return a.category === 'crop_stage';
    return true;
  });

  const unreadCount = alerts.filter(a => a.isUnread).length;

  const getLocalizedAlert = (item) => {
    const lang = i18n.language;
    if (lang === 'en') return item;

    let title = item.title;
    let description = item.description;
    let time = item.time;
    let action_directive = item.action_directive;

    if (item.id === 'weather-rain-warning') {
      const match = item.title.match(/(\d+)%/);
      const pct = match ? match[1] : '100';
      if (lang === 'hi') {
        title = `🌧️ मौसम चेतावनी: भारी बारिश का अनुमान (${pct}% संभावना)`;
        description = `${locationMeta?.city || 'आपके क्षेत्र'} में अगले 24-48 घंटों में बारिश का अनुमान। निर्देश: ⛔ जलभराव और जड़ों को नुकसान से बचाने के लिए सिंचाई न करें। ⏸️ उर्वरक बहने से रोकने के लिए यूरिया का छिड़काव टालें।`;
        time = 'लाइव पूर्वानुमान';
        if (action_directive) {
          action_directive = {
            irrigation: '⛔ सिंचाई न करें',
            fertilizer: '⏸️ यूरिया का प्रयोग टालें'
          };
        }
      } else if (lang === 'pa') {
        title = `🌧️ ਮੌਸਮ ਚੇਤਾਵਨੀ: ਭਾਰੀ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ (${pct}%)`;
        description = `${locationMeta?.city || 'ਤੁਹਾਡੇ ਖੇਤਰ'} ਵਿੱਚ ਅਗਲੇ 24-48 ਘੰਟਿਆਂ ਵਿੱਚ ਮੀਂਹ ਦਾ ਅਨੁਮਾਨ। ਨਿਰਦੇਸ਼: ⛔ ਜੜ੍ਹਾਂ ਦੇ ਬਚਾਅ ਲਈ ਸਿੰਚਾਈ ਨਾ ਕਰੋ। ⏸️ ਯੂਰੀਆ ਖਾਦ ਪਾਉਣਾ ਮੁਲਤਵੀ ਕਰੋ।`;
        time = 'ਲਾਈਵ ਪੂਰਵ-ਅਨੁਮਾਨ';
        if (action_directive) {
          action_directive = {
            irrigation: '⛔ ਸਿੰਚਾਈ ਨਾ ਕਰੋ',
            fertilizer: '⏸️ ਯੂਰੀਆ ਮੁਲਤਵੀ ਕਰੋ'
          };
        }
      }
    } else if (item.id === 'weather-dry-irrigation') {
      if (lang === 'hi') {
        title = '☀️ मौसम सलाह: साफ एवं शुष्क मौसम';
        description = `${locationMeta?.city || 'आपके क्षेत्र'} में कम बारिश की संभावना के साथ मौसम साफ रहेगा। निर्देश: 💧 सुबह या शाम हल्की सिंचाई करें। ✅ पर्णीय उर्वरक छिड़काव के लिए अनुकूल समय।`;
        time = 'लाइव पूर्वानुमान';
        if (action_directive) {
          action_directive = {
            irrigation: '💧 सिंचाई की सलाह',
            fertilizer: '✅ छिड़काव के लिए सुरक्षित'
          };
        }
      } else if (lang === 'pa') {
        title = '☀️ ਮੌਸਮ ਸਲਾਹ: ਸਾਫ਼ ਅਤੇ ਖੁਸ਼ਕ ਮੌਸਮ';
        description = `${locationMeta?.city || 'ਤੁਹਾਡੇ ਖੇਤਰ'} ਵਿੱਚ ਮੌਸਮ ਸਾਫ਼ ਰਹੇਗਾ। ਨਿਰਦੇਸ਼: 💧 ਸਵੇਰੇ ਜਾਂ ਸ਼ਾਮ ਹਲਕੀ ਸਿੰਚਾਈ ਕਰੋ। ✅ ਪੌਸ਼ਟਿਕ ਸਪਰੇਅ ਲਈ ਢੁਕਵਾਂ ਸਮਾਂ।`;
        time = 'ਲਾਈਵ ਪੂਰਵ-ਅਨੁਮਾਨ';
        if (action_directive) {
          action_directive = {
            irrigation: '💧 ਸਿੰਚਾਈ ਦੀ ਸਲਾਹ',
            fertilizer: '✅ ਸਪਰੇਅ ਲਈ ਸੁਰੱਖਿਅਤ'
          };
        }
      }
    } else if (item.category === 'market') {
      if (lang === 'hi') {
        title = item.title.replace(/Live Mandi Price:/, 'लाइव मंडी भाव:')
                          .replace(/Mandi Price Alert:/, 'मंडी भाव अलर्ट:')
                          .replace(/Mandi Rate:/, 'मंडी दर:');
        description = item.description.replace(/Live APMC record:/, 'लाइव एगमार्कनेट रिकॉर्ड:')
                                      .replace(/Modal price in/, 'मॉडल भाव')
                                      .replace(/Steady arrivals reported across trading yards\./, 'मंडियों में स्थिर आवक दर्ज की गई।');
        time = 'एगमार्कनेट • आज';
      } else if (lang === 'pa') {
        title = item.title.replace(/Live Mandi Price:/, 'ਲਾਈਵ ਮੰਡੀ ਭਾਅ:')
                          .replace(/Mandi Price Alert:/, 'ਮੰਡੀ ਭਾਅ ਅਲਰਟ:')
                          .replace(/Mandi Rate:/, 'ਮੰਡੀ ਦਰ:');
        description = item.description.replace(/Live APMC record:/, 'ਲਾਈਵ ਐਗਮਾਰਕਨੇਟ ਰਿਕਾਰਡ:')
                                      .replace(/Modal price in/, 'ਮਾਡਲ ਭਾਅ')
                                      .replace(/Steady arrivals reported across trading yards\./, 'ਮੰਡੀਆਂ ਵਿੱਚ ਆਮਦ ਸਥਿਰ ਹੈ।');
        time = 'ਐਗਮਾਰਕਨੇਟ • ਅੱਜ';
      }
    } else if (item.category === 'crop_stage') {
      if (lang === 'hi') {
        title = item.title.replace(/Crop Stage:/, 'फसल विकास चरण:');
        description = item.description.replace(/Your/, 'आपकी')
                                      .replace(/crop is currently in the/, 'फसल वर्तमान में')
                                      .replace(/stage/, 'चरण में है।');
      } else if (lang === 'pa') {
        title = item.title.replace(/Crop Stage:/, 'ਫਸਲ ਵਿਕਾਸ ਪੜਾਅ:');
        description = item.description.replace(/Your/, 'ਤੁਹਾਡੀ')
                                      .replace(/crop is currently in the/, 'ਫਸਲ ਇਸ ਸਮੇਂ')
                                      .replace(/stage/, 'ਪੜਾਅ ਵਿੱਚ ਹੈ।');
      }
    }

    return { ...item, title, description, time, action_directive };
  };

  return (
    <div className="pb-24 px-4 pt-3 flex flex-col gap-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">{t('alerts.title')}</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {i18n.language === 'hi'
              ? `${locationMeta?.city || profile?.village_or_city || 'आपके क्षेत्र'} के लिए लाइव अलर्ट`
              : i18n.language === 'pa'
              ? `${locationMeta?.city || profile?.village_or_city || 'ਤੁਹਾਡੇ ਖੇਤਰ'} ਲਈ ਲਾਈਵ ਅਲਰਟ`
              : `Real-time API alerts for ${locationMeta?.city || profile?.village_or_city || 'your region'}`}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
            title="Refresh Live Data"
          >
            <span className={`material-symbols-outlined text-base ${refreshing ? 'animate-spin text-primary' : ''}`}>
              refresh
            </span>
          </button>
          <button
            onClick={markAllRead}
            className="text-xs font-bold text-primary hover:underline bg-secondary-container/60 px-3 py-1.5 rounded-full transition-colors"
          >
            {t('alerts.mark_read')}
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {[
          { id: 'all', label: i18n.language === 'hi' ? 'सभी अलर्ट' : i18n.language === 'pa' ? 'ਸਾਰੇ ਅਲਰਟ' : 'All Alerts', icon: 'notifications' },
          { id: 'weather', label: i18n.language === 'hi' ? 'मौसम और बारिश' : i18n.language === 'pa' ? 'ਮੌਸਮ ਅਤੇ ਮੀਂਹ' : 'Weather & Rain', icon: 'cloud_alert' },
          { id: 'market', label: i18n.language === 'hi' ? 'मंडी भाव' : i18n.language === 'pa' ? 'ਮੰਡੀ ਭਾਅ' : 'Mandi Rates', icon: 'payments' },
          { id: 'crop_stage', label: i18n.language === 'hi' ? 'फसल विकास' : i18n.language === 'pa' ? 'ਫਸਲ ਵਿਕਾਸ' : 'Crop Growth', icon: 'eco' },
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-3 py-1.5 rounded-full flex items-center gap-1 font-semibold whitespace-nowrap transition-all ${
              activeFilter === filter.id
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">{filter.icon}</span>
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="flex flex-col gap-3 py-8 items-center justify-center text-center">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-on-surface-variant font-medium">
            {i18n.language === 'hi' ? 'लाइव मौसम और मंडी डेटा की जांच की जा रही है...' : i18n.language === 'pa' ? 'ਲਾਈਵ ਮੌਸਮ ਅਤੇ ਮੰਡੀ ਡੇਟਾ ਦੀ ਜਾਂਚ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...' : 'Checking live weather and mandi feeds...'}
          </p>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-card border border-outline-variant/40 text-center flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-4xl text-primary">verified</span>
          <h3 className="font-bold text-sm text-on-surface">
            {i18n.language === 'hi' ? 'कोई अति-आवश्यक चेतावनी नहीं' : i18n.language === 'pa' ? 'ਕੋਈ ਜ਼ਰੂਰੀ ਚੇਤਾਵਨੀ ਨਹੀਂ' : 'No High Risk Alerts'}
          </h3>
          <p className="text-xs text-on-surface-variant max-w-xs">
            {i18n.language === 'hi' ? 'आपकी फसलों के लिए मौसम और मंडी स्थितियां सामान्य हैं।' : i18n.language === 'pa' ? 'ਤੁਹਾਡੀਆਂ ਫਸਲਾਂ ਲਈ ਮੌਸਮ ਅਤੇ ਮੰਡੀ ਦੀ ਸਥਿਤੀ ਆਮ ਹੈ।' : 'Weather and market conditions are currently stable for your active crops.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredAlerts.map((rawItem) => {
            const item = getLocalizedAlert(rawItem);
            const isUrgent = item.severity === 'urgent';
            const isWarning = item.severity === 'warning';

            return (
              <div
                key={item.id}
                className={`bg-surface-container-lowest rounded-3xl p-4 shadow-card border-l-4 transition-all flex flex-col gap-2 relative overflow-hidden ${
                  isUrgent
                    ? 'border-l-error border-y border-r border-outline-variant/40 bg-error-container/5'
                    : isWarning
                    ? 'border-l-amber-500 border-y border-r border-outline-variant/40'
                    : 'border-l-secondary border-y border-r border-outline-variant/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    isUrgent
                      ? 'bg-error-container text-on-error-container'
                      : isWarning
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-secondary-container text-on-secondary-container'
                  }`}>
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-bold text-xs text-on-surface leading-snug">{item.title}</h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-[10px] text-on-surface-variant whitespace-nowrap">{item.time}</span>
                      </div>
                    </div>

                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Direct Action Directive Tags if available */}
                    {item.action_directive && (
                      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-outline-variant/30">
                        <div className="p-1.5 rounded-lg bg-surface-container text-[10px] font-bold flex items-center gap-1 text-on-surface">
                          <span className="material-symbols-outlined text-xs text-primary">water_drop</span>
                          <span className="truncate">{item.action_directive.irrigation}</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-surface-container text-[10px] font-bold flex items-center gap-1 text-on-surface">
                          <span className="material-symbols-outlined text-xs text-secondary">science</span>
                          <span className="truncate">{item.action_directive.fertilizer}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
