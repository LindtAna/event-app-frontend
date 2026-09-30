import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import logo from '@/assets/images/logo.png'
import userIcon from '@/assets/icons/username.svg'
import { useAuth } from "@/hooks/useAuth"
import NavItems from "./NavItems"
import MobileNav from "./MobileNav"
import LoginModal from "./LoginModal"

const Header = () => {
  const { isSignedIn, user, logout } = useAuth()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    setIsUserMenuOpen(false)
  }

  return (
    <header className="w-full border-b border border-primary-500/40">
      <div className="wrapper flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 md:gap-2.5">
          <img
            src={logo}
            alt="PlanFuchs logo"
            className="size-12 md:size-14 object-contain flex-shrink-0"
          />
          <span className="text-[18px] md:text-[24px] lg:text-[36px] font-semibold tracking-tight font-poppins">
            PlanFuchs
          </span>
        </Link>

        {isSignedIn && (
          <nav className="hidden md:flex w-full max-w-xs justify-center">
            <NavItems />
          </nav>
        )}

        <div className="flex w-32 justify-end gap-3 items-center">
         {isSignedIn ? (
            <>
              {/* Benutzer-Pop-up-Menü */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center justify-center p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                  title={user?.name || "Benutzerkonto"}
                >
                  <img
                    src={userIcon}
                    alt="User Menu"
                    width={32}
                    height={32}
                    className="cursor-pointer"
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white py-2 shadow-xl ring-1 ring-black/5 z-50 border border-gray-100 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Angemeldet als</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {user?.name || user?.email}
                      </p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium mt-1"
                    >
                      Abmelden
                    </button>
                  </div>
                )}
              </div>

              <MobileNav />
            </>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="hover:scale-105 transition-transform"
              title="Anmelden"
            >
              <img
                src={userIcon}
                alt="Login"
                width={32}
                height={32}
                className="cursor-pointer"
              />
            </button>
          )}
        </div>
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </header>
  )
}

export default Header