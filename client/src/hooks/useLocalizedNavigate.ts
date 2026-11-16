import { useCallback } from 'react'

import {
  useNavigate,
  useParams,
  type NavigateOptions,
  type To,
} from 'react-router-dom'

import { isAppLanguage } from '@/i18n/languages'
import { localizeTo } from '@/i18n/navigation'

export function useLocalizedNavigate() {
  const navigate = useNavigate()
  const { lang } = useParams()

  return useCallback(
    (to: To | number, options?: NavigateOptions) => {
      if (typeof to === 'number') {
        navigate(to)
        return
      }

      const destination = isAppLanguage(lang)
        ? localizeTo(to, lang)
        : to

      navigate(destination, options)
    },
    [navigate, lang],
  )
}