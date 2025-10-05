import React, { useState } from 'react';
import { LanguageContext, getTranslation } from '@/lib/i18n';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');


  const t = (key) => getTranslation(language, key);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};