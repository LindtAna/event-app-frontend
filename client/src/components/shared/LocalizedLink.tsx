import {
  Link,
  NavLink,
  useParams,
  type LinkProps,
  type NavLinkProps,
} from 'react-router-dom'

import { isAppLanguage } from '@/i18n/languages'
import { localizeTo } from '@/i18n/navigation'

export function LocalizedLink({
  to,
  ...props
}: LinkProps) {
  const { lang } = useParams()

  //unterstützt String-Ziele und React-Router-`To`-Objekte
  const localizedTo = isAppLanguage(lang)
    ? localizeTo(to, lang)
    : to

  return (
    <Link
      {...props}
      to={localizedTo}
    />
  )
}

export function LocalizedNavLink({
  to,
  ...props
}: NavLinkProps) {
  const { lang } = useParams()

  const localizedTo = isAppLanguage(lang)
    ? localizeTo(to, lang)
    : to

  return (
    <NavLink
      {...props}
      to={localizedTo}
    />
  )
}