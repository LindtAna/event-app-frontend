import { useEffect, useState } from 'react'
import {
  Navigate,
  Outlet,
  useLocation,
  useParams,
} from 'react-router-dom'

import i18n from '@/i18n'

import {
  getPreferredLanguage,
  isAppLanguage,
  localizedPath,
  savePreferredLanguage,
  type AppLanguage,
} from '@/i18n/languages'

function LanguageContent({
  language,
}: {
  language: AppLanguage
}) {
  const [readyLanguage, setReadyLanguage] =
    useState<AppLanguage | null>(null)

  useEffect(() => {
    let active = true

    document.documentElement.lang = language
    savePreferredLanguage(language)

    void i18n.changeLanguage(language)
      .then(() => {
        if (active) {
          setReadyLanguage(language)
        }
      })
      .catch((error: unknown) => {
        console.error('Language initialization failed:', error)

        if (active) {
          setReadyLanguage(language)
        }
      })

    return () => {
      active = false
    }
  }, [language])

  // Komponenten der vorherigen Sprache nach einer URL-Änderung nicht anzeigen
  if (readyLanguage !== language) {
    return null
  }

  return <Outlet />
}

export function PreferredLanguageRedirect() {
  const location = useLocation()
  const language = getPreferredLanguage()

  return (
    <Navigate
      to={{
        pathname: `/${language}/`,
        search: location.search,
        hash: location.hash,
      }}
      replace
      state={location.state}
    />
  )
}

export default function LanguageLayout() {
  const { lang } = useParams()
  const location = useLocation()

  // Unterstützung für alte URLs:
// /events/123 -> /de/events/123
  if (!isAppLanguage(lang)) {
    const preferredLanguage = getPreferredLanguage()

    return (
      <Navigate
        to={{
          pathname: localizedPath(
            location.pathname,
            preferredLanguage,
          ),
          search: location.search,
          hash: location.hash,
        }}
        replace
        state={location.state}
      />
    )
  }

  return <LanguageContent language={lang} />
}