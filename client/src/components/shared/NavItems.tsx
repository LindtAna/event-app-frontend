import { useTranslation } from 'react-i18next'

import { useAuth } from "@/hooks/useAuth"

import { headerLinks } from "@/constants"

import { LocalizedNavLink } from './LocalizedLink'

type NavItemsProps = {
  onNavigate?: () => void
}

const NavItems = ({ onNavigate }: NavItemsProps) => {
  const { user } = useAuth()
  const { t } = useTranslation('common')

   const labels = {
    home: t('navigation.home'),
    createEvent: t('navigation.createEvent'),
    profile: t('navigation.profile'),
    invitations: t('navigation.invitations'),
  }

   const visibleLinks =
    user?.role === 'owner'
      ? [
          headerLinks[0],
          headerLinks[1],
          { key: 'invitations' as const, route: '/invitations' },
          headerLinks[2],
        ]
      : headerLinks

  return (
    <ul className="flex w-full flex-col items-start gap-5 md:w-max md:flex-row md:flex-nowrap md:items-center md:gap-3 lg:gap-6">
      {visibleLinks.map((link) => (
        <li
          key={link.route}
          className="flex-center p-medium-16 whitespace-nowrap"
        >
          <LocalizedNavLink
            to={link.route}
            onClick={onNavigate}
            className={({ isActive }) =>
              isActive ? "text-primary-500 font-semibold" : "text-black"
            }
          >
            {labels[link.key]}
          </LocalizedNavLink>
        </li>
      ))}
    </ul>
  )
}

export default NavItems