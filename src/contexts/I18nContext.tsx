"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { Language, MessageKey, messages } from "@/i18n/messages";

const STORAGE_KEY = "aaaes-language";
const DEFAULT_LANGUAGE: Language = "pt-BR";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: MessageKey) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function readStoredLanguage(): Language {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "en-US" || stored === "pt-BR" ? stored : DEFAULT_LANGUAGE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    setLanguageState(readStoredLanguage());
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = useCallback(
    (key: MessageKey) => messages[language][key] ?? messages[DEFAULT_LANGUAGE][key] ?? key,
    [language]
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n deve ser utilizado dentro de um I18nProvider");
  }
  return context;
}
