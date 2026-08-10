import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { translations } from './translations'

export type Language = 'nl' | 'en'

const STORAGE_KEY = 'studie4su-lang'

type TranslationValue = string | Record<string, unknown>

function resolveKey(dict: Record<string, unknown>, key: string): string | undefined {
  const parts = key.split('.')
  let current: unknown = dict
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'string' ? current : undefined
}

interface LanguageContextValue {
  lang: Language
  setLang: (lang: Language) => void
  toggleLang: () => void
  /**
   * Translate a dot-notated key, e.g. t('nav.schools').
   * Falls back to the Dutch string, then to the key itself, so a missing
   * translation never renders a blank instead of visible text.
   * `vars` lets you interpolate values, e.g. t('greeting', { name: 'Jan' })
   * against a template like "Hallo {name}".
   */
  t: (key: string, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function getInitialLang(): Language {
  if (typeof window === 'undefined') return 'nl'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'en' || stored === 'nl' ? stored : 'nl'
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('nl')

  // Hydrate from localStorage on mount (client-only, avoids SSR mismatch).
  useEffect(() => {
    setLangState(getInitialLang())
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next: Language) => {
    setLangState(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next)
    }
  }, [])

  const toggleLang = useCallback(() => {
    setLang(lang === 'nl' ? 'en' : 'nl')
  }, [lang, setLang])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const dict = translations[lang] as Record<string, unknown>
      const fallbackDict = translations.nl as Record<string, unknown>
      let value = resolveKey(dict, key) ?? resolveKey(fallbackDict, key) ?? key

      if (vars) {
        for (const [varKey, varValue] of Object.entries(vars)) {
          value = value.replace(`{${varKey}}`, String(varValue))
        }
      }
      return value
    },
    [lang],
  )

  const contextValue = useMemo(
    () => ({ lang, setLang, toggleLang, t }),
    [lang, setLang, toggleLang, t],
  )

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return ctx
}
