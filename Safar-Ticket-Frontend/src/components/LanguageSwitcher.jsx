import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };
    
    const isEn = i18n.language.startsWith('en');
    const isFa = i18n.language === 'fa';

    return (
        <div className="flex items-center text-sm font-semibold">
            <button 
                onClick={() => changeLanguage('en')}
                disabled={isEn}
                className={`px-3 py-1 rounded-s-md transition-colors ${isEn ? 'bg-primary-blue text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
            >
                EN
            </button>
            <button 
                onClick={() => changeLanguage('fa')}
                disabled={isFa}
                className={`px-3 py-1 rounded-e-md transition-colors ${isFa ? 'bg-primary-blue text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
            >
                FA
            </button>
        </div>
    );
};

export default LanguageSwitcher;