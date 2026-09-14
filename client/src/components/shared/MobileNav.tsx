
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
  return (
    <nav className="md:hidden">
      <Sheet>

        <SheetTrigger className="align-middle">
          <img src={menu} alt="Menu" className="h-24 w-24 cursor-pointer"/>
        </SheetTrigger>

        <SheetContent className="flex flex-col gap-6 bg-white md:hidden">
            <img src={logo} alt="PlanFuchs" className="h-10 w-10 object-contain" />
            <span className="text- font-semibold">PlanFuchs</span>

          <Separator className="border border-gray-50" />

          <NavItems />

        </SheetContent>
      </Sheet>
    </nav>
  )
}

export default MobileNav