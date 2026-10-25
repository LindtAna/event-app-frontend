import { useAuth } from "@/hooks/useAuth"
import { headerLinks } from "@/constants"
import { NavLink } from "react-router-dom"

const NavItems = () => {
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
    <ul className="md:flex-between flex w-full flex-col items-start gap-5 md:flex-row">
      {visibleLinks.map((link) => (
        <li
          key={link.route}
          className="flex-center p-medium-16 whitespace-nowrap"
        >
          <NavLink
            to={link.route}
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