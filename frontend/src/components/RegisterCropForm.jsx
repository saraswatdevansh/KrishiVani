import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getLocalizedCropName, CROP_TRANSLATIONS } from '../data/cropTranslations';

const CROPS = [
  'rice', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas', 'mothbeans',
  'mungbean', 'blackgram', 'lentil', 'pomegranate', 'banana', 'mango',
  'grapes', 'watermelon', 'muskmelon', 'apple', 'orange', 'papaya',
  'coconut', 'cotton', 'jute', 'coffee'
];

const KHARIF_CROPS = ['rice', 'maize', 'cotton', 'jute', 'kidneybeans', 'pigeonpeas', 'mothbeans', 'mungbean', 'blackgram'];
const RABI_CROPS = ['chickpea', 'lentil'];
const ZAID_CROPS = ['watermelon', 'muskmelon'];

export const RegisterCropForm = ({ onClose, onSuccess, initialCrop }) => {
  const { t, i18n } = useTranslation();
  const { updateActiveCrop } = useAuth();
  
  const [formData, setFormData] = useState({
    crop_name: initialCrop || '',
    season: '',
    sowing_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (formData.crop_name) {
      if (KHARIF_CROPS.includes(formData.crop_name)) {
        setFormData(prev => ({ ...prev, season: 'kharif' }));
      } else if (RABI_CROPS.includes(formData.crop_name)) {
        setFormData(prev => ({ ...prev, season: 'rabi' }));
      } else if (ZAID_CROPS.includes(formData.crop_name)) {
        setFormData(prev => ({ ...prev, season: 'zaid' }));
      } else {
        setFormData(prev => ({ ...prev, season: 'perennial' }));
      }
    }
  }, [formData.crop_name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.crop_name || !formData.season || !formData.sowing_date) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await api.registerCrop(formData);
      try {
        await updateActiveCrop(formData.crop_name);
      } catch (authErr) {
        console.warn('Could not update active crop in context:', authErr);
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to register crop');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-t-3xl p-5 max-w-md w-full mx-auto animate-slide-up-fast flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-on-surface">{t('farming.register_crop')}</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {error && (
          <div className="bg-error/10 text-error text-sm p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 pb-6 space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Crop Name *
            </label>
            <select
              value={formData.crop_name}
              onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="" disabled>Select a crop</option>
              {CROPS.map(c => (
                <option key={c} value={c}>
                  {getLocalizedCropName(c, i18n.language)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Season *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['kharif', 'rabi', 'zaid', 'perennial'].map(s => (
                <label 
                  key={s} 
                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                    formData.season === s 
                      ? 'bg-secondary-container border-secondary text-on-secondary-container' 
                      : 'bg-surface-container-lowest border-outline-variant/50 text-on-surface-variant'
                  }`}
                >
                  <input
                    type="radio"
                    name="season"
                    value={s}
                    checked={formData.season === s}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    className="hidden"
                  />
                  <span className="capitalize text-sm font-medium">{s}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              {t('farming.sowing_date')} *
            </label>
            <input
              type="date"
              value={formData.sowing_date}
              onChange={(e) => setFormData({ ...formData, sowing_date: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              rows={2}
              placeholder="Any specific notes about this crop..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary font-bold py-3.5 rounded-xl shadow-sm hover:shadow active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                Register Crop
              </>
            )}
          </button>
          
        </form>
      </div>
    </div>
  );
};
