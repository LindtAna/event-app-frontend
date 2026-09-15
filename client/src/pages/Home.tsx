import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import hero from '@/assets/images/hero.png'

export default function Home() {
  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-contain py-5 md:py-10">
        <div className="wrapper grid grid-cols-1 gap-5 md:grid-cols-2 2xl:gap-0">
          <div className="flex flex-col justify-center gap-8">
            <h1 className="text-[28px] font-bold leading-tight md:text-[34px] lg:text-[48px]">Ihre Veranstaltung, einfach geplant und organisiert</h1>
            <p className="p-regular-16 md:p-regular-24">
              Aufgaben und Termine immer im Blick behalten.<br />
              Zeitpläne in Echtzeit aktualisieren – ganz ohne Papier.</p>

            <Button asChild className="w-full sm:w-fit" size="lg">
              <Link to="/events">DEMO VEREINBAREN</Link>
            </Button>
          </div>

          <img
              src={hero}
              alt="PlanFuchs Dashboard Vorschau"
              className="max-h-[70vh] w-full object-contain object-center 2xl:max-h-[50vh]"
            />
        </div>
      </section>
    </>

  )
}
