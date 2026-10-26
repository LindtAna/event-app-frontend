import { useAuth } from "@/hooks/useAuth"
import { headerLinks } from "@/constants"
import { NavLink } from "react-router-dom"

type NavItemsProps = {
  onNavigate?: () => void
}

const NavItems = ({ onNavigate }: NavItemsProps) => {
  const { user } = useAuth()

   const visibleLinks = user?.role === "owner" ? headerLinks.flatMap((link) =>
          link.route === "/profile"
            ? [
                {
                  label: "Einladungen",
                  route: "/invitations",
                },
                link,
              ]
            : [link],
        )
      : headerLinks

  return (
    <ul className="flex w-full flex-col items-start gap-5 md:w-max md:flex-row md:flex-nowrap md:items-center md:gap-3 lg:gap-6">
      {visibleLinks.map((link) => (
        <li
          key={link.route}
          className="flex-center p-medium-16 whitespace-nowrap"
        >
          <NavLink
            to={link.route}
            onClick={onNavigate}
            className={({ isActive }) =>
              isActive ? "text-primary-500 font-semibold" : "text-black"
            }
          >
            {link.label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

export default NavItems