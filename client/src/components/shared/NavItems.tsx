import { headerLinks } from "@/constants"
import { NavLink } from "react-router-dom"

const NavItems = () => {
  return (
    <ul className="md:flex-between flex w-full flex-col items-start gap-5 md:flex-row">
      {headerLinks.map((link) => (
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