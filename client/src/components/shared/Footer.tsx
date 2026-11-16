import { useTranslation } from 'react-i18next'

import { footerLinks } from '@/constants'
import { LocalizedLink } from './LocalizedLink'

const Footer = () => {
  const { t } = useTranslation('common')

  const labels = {
    privacyPolicy: t('footer.privacyPolicy'),
    privacySettings: t('footer.privacySettings'),
    termsOfUse: t('footer.termsOfUse'),
    imprint: t('footer.imprint'),
  }

  return (
    <footer className="border-t border-primary-500/40">
      <div className="wrapper flex flex-col items-center gap-4 px-5 py-6 md:py-8">


        <nav className="flex flex-col items-center gap-2 md:flex-row md:justify-center md:gap-6">
          {footerLinks.map((link) => (
            <LocalizedLink
              key={link.key}
              to={link.route}
              className="text-[10px] md:text-[14px] text-muted-foreground hover:text-primary hover:underline underline-offset-4 transition-colors"
            >
             {labels[link.key]}
            </LocalizedLink>
          ))}
        </nav>


        <p className="text-center leading-relaxed text-muted-foreground pt-2 pb-2 text-[10px] md:text-[14px] max-w-full">
          {t('footer.copyright')}
        </p>
      </div>
    </footer>
  )
}

export default Footer