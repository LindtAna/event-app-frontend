// Prioritäten:
// 1. Sprache in der URL
// 2. Im localStorage gespeicherte Sprache
// 3. Browsersprache
// 4. Deutsch

export const supportedLanguages = ['de', 'en', 'ru'] as const

export type AppLanguage = (typeof supportedLanguages)[number]

export const defaultLanguage: AppLanguage = 'de'

export const LANGUAGE_STORAGE_KEY = 'planfuchs-language'

export function isAppLanguage(
  value: unknown,
): value is AppLanguage {
  return (
    typeof value === 'string' &&
    (supportedLanguages as readonly string[]).includes(value)
  )
}

// Entfernt ein vorhandenes Sprachpräfix
export function stripLanguagePrefix(pathname: string): string {
  const path = pathname.replace(/^\/(de|en|ru)(?=\/|$)/, '')

  return path || '/'
}

// Fügt das ausgewählte Sprachpräfix hinzu
export function localizedPath(
  pathname: string,
  language: AppLanguage,
): string {
  const normalizedPath = pathname.startsWith('/')
    ? pathname
    : `/${pathname}`

  const pathWithoutLanguage = stripLanguagePrefix(normalizedPath)

  return pathWithoutLanguage === '/'
    ? `/${language}/`
    : `/${language}${pathWithoutLanguage}`
}

// Ruft die Sprache aus den gespeicherten Einstellungen oder den Browsereinstellungen ab
export function getPreferredLanguage(): AppLanguage {
  if (typeof window !== 'undefined') {
    try {
      const storedLanguage = localStorage.getItem(
        LANGUAGE_STORAGE_KEY,
      )

      if (isAppLanguage(storedLanguage)) {
        return storedLanguage
      }
    } catch {
      // Wenn localStorage nicht verfügbar ist, verwenden wir die Browsersprache
    }
  }

  const browserLanguages =
    typeof navigator !== 'undefined'
      ? navigator.languages?.length
        ? navigator.languages
        : [navigator.language]
      : []

  for (const browserLanguage of browserLanguages) {
    const baseLanguage = browserLanguage
      .toLowerCase()
      .split(/[-_]/)[0]

    if (isAppLanguage(baseLanguage)) {
      return baseLanguage
    }
  }

  return defaultLanguage
}

export function savePreferredLanguage(language: AppLanguage): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {
   // Die Sprache funktioniert weiterhin über die URL, selbst ohne localStorage
  }
}