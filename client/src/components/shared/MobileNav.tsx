import { useState } from "react"
import { useTranslation } from 'react-i18next'

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

import NavItems from "./NavItems"

import logo from "@/assets/images/logo.png"
import menu from "@/assets/icons/menu.svg"

const MobileNav = () => {
  const { t } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger className="align-middle" aria-label={t('navigation.openMenu')}>
          <img src={menu} alt="" className="size-8 cursor-pointer" />
        </SheetTrigger>

        <SheetContent className="flex flex-col gap-6 bg-white md:hidden">
        
          <div className="flex items-center gap-2.5 pt-4 pl-6">
            <img src={logo} alt="PlanFuchs" className="size-10 object-contain" />
            <span className="text-[20px] font-semibold tracking-tight font-poppins">
              PlanFuchs
            </span>
          </div>

          <Separator className="border border-primary-500/60" />

          <div className="pl-6">
             <NavItems onNavigate={() => setIsOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  )
}

export default MobileNav