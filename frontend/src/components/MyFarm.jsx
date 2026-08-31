import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getLocalizedCropName, getLocalizedStageName, getLocalizedSeason, localizeCareTip, CROP_TRANSLATIONS } from '../data/cropTranslations';
import { RegisterCropForm } from './RegisterCropForm';

export const MyFarm = () => {
  const { t, i18n } = useTranslation();
  const { profile, updateActiveCrop } = useAuth();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const data = await api.getMyCrops();
      setCrops(data || []);
    } catch (error) {
      console.error('Failed to fetch crops:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, [profile?.selected_crop]);

  const handleSetPrimary = async (crop) => {
    try {
      await api.setPrimaryCrop(crop.id);
      await updateActiveCrop(crop.crop_name);
      fetchCrops();
    } catch (error) {
      console.error('Failed to set primary crop:', error);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.updateCropStatus(id, status);
      fetchCrops();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteCrop(id);
      fetchCrops();
    } catch (error) {
      console.error('Failed to delete crop:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 relative">
      {/* Top Banner with Multi-Crop Add Button */}
      <div className="flex items-center justify-between bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/40 shadow-sm">
        <div>
          <h3 className="text-xs font-extrabold text-on-surface">
            {i18n.language === 'hi' ? `पंजीकृत फसलें (${crops.length})` : i18n.language === 'pa' ? `ਦਰਜ ਕੀਤੀਆਂ ਫਸਲਾਂ (${crops.length})` : `Registered Farm Crops (${crops.length})`}
          </h3>
          <p className="text-[10px] text-on-surface-variant">
            {i18n.language === 'hi' ? 'एक साथ कई फसलों का प्रबंधन करें' : i18n.language === 'pa' ? 'ਇੱਕੋ ਸਮੇਂ ਕਈ ਫਸਲਾਂ ਦਾ ਪ੍ਰਬੰਧ ਕਰੋ' : 'Manage multiple active crops simultaneously'}
          </p>
        </div>
        <button
          onClick={() => setShowRegisterForm(true)}
          className="bg-primary text-on-primary text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm hover:shadow active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>{i18n.language === 'hi' ? '+ फसल जोड़ें' : i18n.language === 'pa' ? '+ ਫਸਲ ਜੋੜੋ' : '+ Add Crop'}</span>
        </button>
      </div>

      {crops.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl p-6 text-center shadow-card border border-outline-variant/40 mt-2">
          <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-5xl text-secondary">eco</span>
          </div>
          <h2 className="text-lg font-bold text-on-surface mb-2">{t('farming.no_crops_title')}</h2>
          <p className="text-sm text-on-surface-variant mb-6">{t('farming.no_crops_desc')}</p>
          <button 
            onClick={() => setShowRegisterForm(true)}
            className="bg-primary text-on-primary font-bold py-2.5 px-6 rounded-xl hover:shadow-md transition-shadow inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            {t('farming.register_crop')}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {crops.map((crop) => {
            const cropMeta = CROP_TRANSLATIONS[crop.crop_name?.toLowerCase()] || {};
            const isCompleted = crop.status === 'harvested' || crop.status === 'failed';
            const isPrimary = profile?.selected_crop?.toLowerCase() === crop.crop_name?.toLowerCase();

            return (
              <div 
                key={crop.id} 
                className={`bg-surface-container-lowest rounded-3xl p-4 shadow-card border transition-all ${
                  isPrimary ? 'border-primary/50 bg-gradient-to-b from-primary/5 to-transparent' : 'border-outline-variant/40'
                } ${isCompleted ? 'opacity-75' : ''}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container flex-shrink-0 relative">
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
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          crop.status === 'active' ? 'bg-secondary-container text-on-secondary-container' : 
                          crop.status === 'harvested' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {crop.status === 'active' ? getLocalizedSeason(crop.season, i18n.language) : getLocalizedSeason(crop.status, i18n.language)}
                        </span>
                      </div>
                      <div className="text-xs text-on-surface-variant flex gap-2 mt-0.5">
                        <span>{t('farming.sowing_date')}: <strong>{crop.sowing_date}</strong></span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {!isPrimary && crop.status === 'active' && (
                      <button
                        onClick={() => handleSetPrimary(crop)}
                        className="text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-lg transition-colors"
                        title="Set as Primary Crop"
                      >
                        {i18n.language === 'hi' ? 'मुख्य बनाएं' : i18n.language === 'pa' ? 'ਮੁੱਖ ਬਣਾਓ' : 'Make Primary'}
                      </button>
                    )}
                    {crop.status === 'active' && (
                      <button onClick={() => handleStatusChange(crop.id, 'harvested')} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-green-100 hover:text-green-700 transition-colors" title={t('farming.mark_harvested')}>
                        <span className="material-symbols-outlined text-[18px]">done_all</span>
                      </button>
                    )}
                    <button onClick={() => handleDelete(crop.id)} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-error hover:bg-error/10 transition-colors" title={t('farming.delete_crop')}>
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>

                {crop.status === 'active' && (
                  <>
                    <div className="bg-surface-container-low rounded-2xl p-3 mb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase">{t('farming.current_stage')}</p>
                          <p className="text-sm font-extrabold text-primary">
                            {getLocalizedStageName(crop.current_stage || 'Growing', i18n.language)}
                          </p>
                          {crop.days_in_stage !== undefined && (
                            <p className="text-[10px] text-on-surface-variant">
                              {i18n.language === 'hi' ? `इस चरण में दिन ${crop.days_in_stage}` : i18n.language === 'pa' ? `ਇਸ ਪੜਾਅ 'ਚ ਦਿਨ ${crop.days_in_stage}` : `Day ${crop.days_in_stage} in this stage`}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-primary font-bold">{crop.days_remaining} {t('farming.days_remaining')}</p>
                          {crop.expected_harvest_date && (
                            <p className="text-[10px] text-on-surface-variant">
                              {i18n.language === 'hi' ? `कटाई: ${crop.expected_harvest_date}` : i18n.language === 'pa' ? `ਵਾਢੀ: ${crop.expected_harvest_date}` : `Harvest: ${crop.expected_harvest_date}`}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Dynamic Stage Progress Bar */}
                      <div className="flex flex-col gap-1 mt-2">
                        <div className="flex justify-between text-[10px] font-semibold text-on-surface-variant">
                          <span>{i18n.language === 'hi' ? 'चरण प्रगति' : i18n.language === 'pa' ? 'ਪੜਾਅ ਪ੍ਰਗਤੀ' : 'Stage Progress'}</span>
                          <span className="font-bold text-primary">{crop.stage_progress_pct || 0}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className="h-full bg-secondary rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(crop.stage_progress_pct || 0, 100)}%` }}
                          />
                        </div>
                        {crop.next_stage && (
                          <div className="text-[10px] text-on-surface-variant flex items-center justify-between mt-1 pt-1 border-t border-outline-variant/30">
                            <span>
                              {i18n.language === 'hi' ? 'अगला: ' : i18n.language === 'pa' ? 'ਅਗਲਾ: ' : 'Next: '}
                              <strong>{getLocalizedStageName(crop.next_stage, i18n.language)}</strong>
                            </span>
                            {crop.next_stage_date && (
                              <span>
                                {crop.next_stage_date.replace(/Stage ends in (\d+) days/i, i18n.language === 'hi' ? '$1 दिनों में यह चरण पूरा होगा' : i18n.language === 'pa' ? '$1 ਦਿਨਾਂ ਵਿੱਚ ਪੜਾਅ ਪੂਰਾ ਹੋਵੇਗਾ' : 'Stage ends in $1 days')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {crop.stage_advisory && crop.stage_advisory.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-on-surface mb-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-primary">lightbulb</span>
                          {t('farming.stage_advisory')}
                        </p>
                        <ul className="text-xs text-on-surface-variant pl-5 list-disc space-y-0.5">
                          {crop.stage_advisory.map((adv, i) => (
                            <li key={i}>{localizeCareTip(adv, i18n.language)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}

          <button 
            onClick={() => setShowRegisterForm(true)}
            className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-10"
          >
            <span className="material-symbols-outlined text-3xl">add</span>
          </button>
        </div>
      )}

      {showRegisterForm && (
        <RegisterCropForm 
          onClose={() => setShowRegisterForm(false)} 
          onSuccess={() => {
            setShowRegisterForm(false);
            fetchCrops();
          }} 
        />
      )}
    </div>
  );
};
