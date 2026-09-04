import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, Check, ChevronDown, X, Sparkles } from 'lucide-react';
import { LanguageCode } from '../../utils/translations';

interface LanguageSelectorProps {
  variant?: 'floating' | 'header' | 'compact';
  className?: string;
  themePrimaryColor?: string;
  themeAccentColor?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'header',
  className = '',
  themePrimaryColor,
  themeAccentColor,
}) => {
  const { language, setLanguage, currentLanguageOption, availableLanguages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Translate Trigger Button */}
      <button
        type="button"
        id="translate-language-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Translate page / Change language"
        className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all shadow-md active:scale-95 border cursor-pointer ${
          variant === 'floating'
            ? 'bg-stone-900/90 text-white border-amber-400/40 hover:bg-stone-900'
            : 'bg-white/95 text-stone-800 border-stone-200/90 hover:bg-white hover:border-amber-400'
        }`}
        style={
          themeAccentColor && variant === 'floating'
            ? { borderColor: themeAccentColor }
            : {}
        }
      >
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 font-bold text-[10px]">
          <Globe className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
        </div>
        
        <span className="flex items-center gap-1.5">
          <span className="font-medium text-[11px] opacity-75 text-stone-600">{t('translate')}:</span>
          <span className="font-bold text-stone-900">{currentLanguageOption.nativeName.split(' ')[0]}</span>
        </span>
        
        <ChevronDown className={`w-3.5 h-3.5 opacity-60 text-stone-700 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Language Selection Portal - ALWAYS IN FOREGROUND at z-[99999] */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          {/* Dimmed Focus Backdrop */}
          <div 
            className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <div 
            className="relative z-10 w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-amber-200/60 p-5 animate-scaleUp overflow-hidden max-h-[85vh] flex flex-col text-stone-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
                  <Globe className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">{t('select_language')}</h4>
                  <p className="text-[11px] text-stone-500">Choose your preferred language</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Languages */}
            <div className="space-y-1.5 overflow-y-auto pr-1 flex-1 py-1">
              {availableLanguages.map((lang) => {
                const isSelected = language === lang.code;
                const isDefault = lang.code === 'en';
                const isHindiOption = lang.code === 'hi' || lang.code === 'roman_hi';

                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 text-white shadow-md font-bold'
                        : 'bg-stone-50 hover:bg-amber-50/80 text-stone-700 hover:text-stone-900 border border-stone-100 hover:border-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl drop-shadow-xs">{lang.flag}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs sm:text-sm font-semibold ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                            {lang.nativeName}
                          </span>
                          {isDefault && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                              isSelected ? 'bg-amber-400 text-stone-950' : 'bg-stone-200 text-stone-700'
                            }`}>
                              Default
                            </span>
                          )}
                          {isHindiOption && !isDefault && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                              isSelected ? 'bg-amber-400/30 text-amber-200' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {lang.code === 'roman_hi' ? 'Hinglish' : 'देवनागरी'}
                            </span>
                          )}
                        </div>
                        <span className={`text-[11px] block ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                          {lang.name}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span className="flex items-center gap-1 font-medium text-amber-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Auto-Translated Experience
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-stone-700 hover:text-stone-900 underline cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
