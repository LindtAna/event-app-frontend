import { Link } from "react-router-dom"
import logo from '@/assets/images/logo.png'
import { useAuth } from "@/hooks/useAuth"
import { Button } from "../ui/button"
import NavItems from "./NavItems"
import MobileNav from "./MobileNav"

const Header = () => {
     const { user, isSignedIn } = useAuth()
  return (
    <header className="w-full border-b">
        <div className="wrapper flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
        <img 
          src={logo} 
          alt="PlanFuchs logo"
          className="h-20 w-20 object-contain flex-shrink-0"
        />
        <span className="text-[42px] font-semibold tracking-tight font-poppins">
            PlanFuchs
          </span>
      </Link>

       {isSignedIn && (
          <nav className="hidden md:flex w-full max-w-xs justify-center">
            <NavItems />
          </nav>
        )}


      <div className="flex w-32 justify-end gap-3 items-center">
          {isSignedIn? (
            <>
               {/* later Avatar + Dropdown */}
              <div className="h-9 w-9 rounded bg-orange-100" />
              <MobileNav />
            </>
          ) : (
            <Button asChild className="rounded" size="lg">
              <Link to="/sign-in">Login</Link>
            </Button>
          )}
        </div>
        
        </div>
    </header>
  )
}

export default Header