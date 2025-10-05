import { createContext, useContext } from 'react';

export const translations = {
  en: {
    home: {
      title: 'Welcome to LearnLite',
      subtitle: 'Your AI-powered learning assistant',
      startLearning: 'Start Learning',
      analyzeDocuments: 'Analyze Documents'
    },
    chat: {
      placeholder: 'Type your message...',
      send: 'Send',
      clear: 'Clear Chat',
      save: 'Save Chat'
    },
    settings: {
      title: 'Settings',
      appearance: 'Appearance',
      light: 'Light',
      dark: 'Dark',
      voiceSettings: 'Voice Settings',
      voiceVolume: 'Voice Output Volume',
      language: 'Language',
      success: {
        theme: 'Theme updated successfully',
        language: 'Language updated successfully'
      },
      error: {
        load: 'Failed to load settings',
        theme: 'Failed to update theme',
        language: 'Failed to update language'
      }
    },
    nav: {
      home: 'Home',
      chat: 'Chat',
      saved: 'Saved',
      images: 'Images',
      documents: 'Documents',
      settings: 'Settings'
    }
  },
  es: {
    home: {
      title: 'Bienvenido a LearnLite',
      subtitle: 'Tu asistente de aprendizaje con IA',
      startLearning: 'Empezar a Aprender',
      analyzeDocuments: 'Analizar Documentos'
    },
    chat: {
      placeholder: 'Escribe tu mensaje...',
      send: 'Enviar',
      clear: 'Limpiar Chat',
      save: 'Guardar Chat'
    },
    settings: {
      title: 'Configuración',
      appearance: 'Apariencia',
      light: 'Claro',
      dark: 'Oscuro',
      voiceSettings: 'Configuración de Voz',
      voiceVolume: 'Volumen de Salida de Voz',
      language: 'Idioma',
      success: {
        theme: 'Tema actualizado con éxito',
        language: 'Idioma actualizado con éxito'
      },
      error: {
        load: 'Error al cargar la configuración',
        theme: 'Error al actualizar el tema',
        language: 'Error al actualizar el idioma'
      }
    },
    nav: {
      home: 'Inicio',
      chat: 'Chat',
      saved: 'Guardados',
      images: 'Imágenes',
      documents: 'Documentos',
      settings: 'Configuración'
    }
  }
};

export const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key
});

export const useTranslation = () => {
  const { language, t } = useContext(LanguageContext);
  return { language, t };
};

export const getTranslation = (language, key) => {
  const keys = key.split('.');
  let translation = translations[language];
  
  for (const k of keys) {
    if (!translation || !translation[k]) {
      return key; // Return the key if translation is not found
    }
    translation = translation[k];
  }
  
  return translation;
};