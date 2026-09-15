import { Link } from "react-router-dom"
import { footerLinks } from "@/constants"

const Footer = () => {
  return (
    <footer className="border-t border-primary-500/40">
      <div className="wrapper flex flex-col items-center gap-4 px-5 py-6 md:py-8">


        <nav className="flex flex-col items-center gap-2 md:flex-row md:justify-center md:gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              to={link.route}
              className="text-[10px] md:text-[14px] text-muted-foreground hover:text-primary hover:underline underline-offset-4 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>


        <p className="text-center leading-relaxed text-muted-foreground pt-2 pb-2 text-[10px] md:text-[14px] max-w-full">
          Copyright © 2005-2026 PlanFuchs. Alle Rechte vorbehalten.
        </p>
      </div>
    </footer>
  )
}

export default Footer