import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageModal = ({ isOpen, onClose }) => {
  const { i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');

  if (!isOpen) return null;

  const languages = [
    { code: 'en', name: 'English', native: 'English', subtitle: 'Default System Language' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी', subtitle: 'हिंदी में फसल एवं मौसम सलाह' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', subtitle: 'ਪੰਜਾਬੀ ਵਿੱਚ ਖੇਤੀ ਅਤੇ ਮੌਸਮ ਸਲਾਹ' },
  ];

  const handleApply = () => {
    i18n.changeLanguage(selectedLang);
    localStorage.setItem('krishivani_lang', selectedLang);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl p-6 shadow-modal border border-outline-variant/40 flex flex-col gap-4 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-on-surface">Select Language</h2>
            <p className="text-xs text-on-surface-variant">Choose your preferred language for advisory and voice</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Language Cards */}
        <div className="flex flex-col gap-2.5 my-2">
          {languages.map((item) => {
            const isSelected = selectedLang === item.code;
            return (
              <div
                key={item.code}
                onClick={() => setSelectedLang(item.code)}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary bg-secondary-container/30 shadow-sm'
                    : 'border-outline-variant/50 bg-surface-container-low hover:border-outline-variant'
                }`}
              >
                <div>
                  <div className="text-base font-bold text-on-surface">{item.native}</div>
                  <div className="text-xs font-semibold text-primary">{item.name}</div>
                  <div className="text-[11px] text-on-surface-variant mt-0.5">{item.subtitle}</div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-primary bg-primary text-white' : 'border-outline-variant'
                  }`}
                >
                  {isSelected && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Confirm CTA */}
        <button
          onClick={handleApply}
          className="w-full h-12 bg-primary hover:bg-primary-container text-on-primary rounded-2xl font-bold text-sm shadow-sm transition-all active:scale-[0.98]"
        >
          Confirm Language
        </button>
      </div>
    </div>
  );
};
