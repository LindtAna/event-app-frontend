import { useTranslation } from 'react-i18next'

import { LocalizedLink } from '@/components/shared/LocalizedLink'

export default function NotFoundPage() {
  const { t } = useTranslation('common')

  return (
    <section className="wrapper flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">

      <h1 className="text-3xl font-bold text-primary-500">
        404
      </h1>

      <h2 className="text-xl font-semibold">
        {t('page.notFoundTitle')}
      </h2>

      <p className="text-secondary-dark">
        {t('page.notFoundDescription')}
      </p>

      <LocalizedLink
        to="/"
        className="font-semibold text-primary-500 hover:underline"
      >
        {t('page.backHome')}
      </LocalizedLink>

    </section>
  )
}