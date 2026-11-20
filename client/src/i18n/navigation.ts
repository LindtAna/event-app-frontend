import type { To } from 'react-router-dom'
import type { AppLanguage } from './languages'

import { localizedPath } from './languages'

export function localizeTo(
  to: To,
  language: AppLanguage,
): To {
  if (typeof to === 'string') {
    if (!to.startsWith('/')) {
      return to
    }

    const hashIndex = to.indexOf('#')

    const pathAndSearch =
      hashIndex >= 0 ? to.slice(0, hashIndex) : to

    const hash =
      hashIndex >= 0 ? to.slice(hashIndex) : ''

    const searchIndex = pathAndSearch.indexOf('?')

    const pathname =
      searchIndex >= 0
        ? pathAndSearch.slice(0, searchIndex)
        : pathAndSearch

    const search =
      searchIndex >= 0
        ? pathAndSearch.slice(searchIndex)
        : ''
//entfernt ein gegebenenfalls vorhandenes Sprachpräfix und fügt das gewünschte Präfix hinzu
    return `${localizedPath(pathname, language)}${search}${hash}`
  }

  if (to.pathname?.startsWith('/')) {
    return {
      ...to,
      pathname: localizedPath(to.pathname, language),
    }
  }

  return to
}