import { useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { useAuth } from "@/hooks/useAuth"

import NavItems from "./NavItems"
import MobileNav from "./MobileNav"
import LoginModal from "./LoginModal"

import logo from '@/assets/images/logo.png'
import userIcon from '@/assets/icons/username.svg'

const Header = () => {
  const { isSignedIn, user, logout } = useAuth()

  const location = useLocation()
  const navigate = useNavigate()

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

  useEffect(() => {
    const navigationState = location.state as
      | { openLoginModal?: boolean }
      | null
    if (!navigationState?.openLoginModal) {
      return
    }
    setIsLoginModalOpen(true)

    navigate(
      {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      },
      {
        replace: true,
        state: null,
      },
    )
  }, [location, navigate])

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
          <span className="text-[14px] md:text-[24px] lg:text-[30px] font-semibold tracking-tight font-poppins">
            PlanFuchs
          </span>
        </Link>

        {isSignedIn && (
          <nav className="hidden md:flex flex-1 min-w-0 justify-center px-2">
            <NavItems />
          </nav>
        )}

        <div className="flex shrink-0 justify-end gap-3 items-center">
          {isSignedIn ? (
            <>
              {/* Benutzer-Pop-up-Menü */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center justify-center p-1 rounded-full hover:bg-primary-500/50 transition-colors focus:outline-none"
                  title={user?.name || "Benutzerkonto"}
                  aria-label={
                    user?.name
                      ? `Benutzerkonto von ${user.name}`
                      : "Benutzerkonto"
                  }
                  aria-expanded={isUserMenuOpen}
                >
                  <img
                    src={user?.avatarUrl || userIcon}
                    alt=""
                    width={36}
                    height={36}
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = userIcon
                    }}
                    className="size-8 md:size-10 cursor-pointer rounded-full object-cover"
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white py-2 shadow-xl ring-1 ring-black/5 z-50 border border-primary-500/50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-primary-500/50">
                      <p className="text-xs text-gray-500">Angemeldet als</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {user?.name || user?.email}
                      </p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-secondary/50 flex items-center gap-2 transition-colors font-medium mt-1"
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