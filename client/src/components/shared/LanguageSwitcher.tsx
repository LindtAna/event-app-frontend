import {
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import {
  getPreferredLanguage,
  isAppLanguage,
  localizedPath,
} from '@/i18n/languages'

const LanguageSwitcher = () => {
  const { t } = useTranslation('common')

  const { lang } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const currentLanguage = isAppLanguage(lang)
    ? lang
    : getPreferredLanguage()

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const nextLanguage = event.target.value

    if (!isAppLanguage(nextLanguage)) {
      return
    }

    navigate(
      {
        pathname: localizedPath(
          location.pathname,
          nextLanguage,
        ),
        search: location.search,
        hash: location.hash,
      },
      {
        state: location.state,
      },
    )
  }

  return (
    <select
      aria-label={t('language.select')}
      value={currentLanguage}
      onChange={handleLanguageChange}
      className="h-9 rounded-md border border-primary-500/40 bg-white px-2 text-xs font-semibold text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      <option value="de">DE</option>
      <option value="en">EN</option>
      <option value="ru">RU</option>
    </select>
  )
}

export default LanguageSwitcher