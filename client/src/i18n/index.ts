import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { resources } from './resources'
import {
  defaultLanguage,
  supportedLanguages,
} from './languages'

export const defaultNS = 'common' as const

export const i18nReady = i18n
  .use(initReactI18next)
  .init({
    resources,

    lng: defaultLanguage,
    fallbackLng: defaultLanguage,

    supportedLngs: [...supportedLanguages],

    ns: [defaultNS],
    defaultNS,

    interpolation: {
      escapeValue: false,
    },

    returnNull: false,
  })

export default i18n