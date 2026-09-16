import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import hero from '@/assets/images/hero.png'


export default function Home() {

  // Guest - unauthorisierte Benutzer
  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-contain py-5 md:py-10">
        <div className="wrapper grid grid-cols-1 gap-5 md:grid-cols-2 2xl:gap-0">
          <div className="flex flex-col justify-center gap-8">
            <h1 className="text-[28px] font-bold leading-tight md:text-[34px] lg:text-[48px]">
              Ihre Veranstaltung, einfach geplant und organisiert
            </h1>
            <p className="p-regular-16 md:p-regular-24 max-w-[50ch]">
              Aufgaben und Termine immer im Blick behalten.<br />
              Zeitpläne in Echtzeit aktualisieren – ganz ohne Papier.
            </p>
            <Button asChild className="w-full sm:w-fit" size="lg">
              <Link to="/sign-in">Jetzt loslegen</Link>
            </Button>
          </div>
          <img src={hero} alt="PlanFuchs Dashboard" className="max-h-[70vh] w-full object-contain object-center" />
        </div>
      </section>

   
      <section className="wrapper my-8 md:my-10 flex flex-col gap-12">
        <h2 className="h2-bold text-center">Wie funktioniert PlanFuchs?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border  border-primary-500/40 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-2">1. Event erstellen</h3>
            <p className="text-sm">Alle Infos und Bilder im Handumdrehen hinzufügen.</p>
          </div>
          <div className="border border-primary-500/40 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-2">2. Team einladen</h3>
            <p className="text-sm">Kollegen einladen und Zusagen im Blick behalten.</p>
          </div>
          <div className="border border-primary-500/40 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-2">3. Überblick behalten</h3>
            <p className="text-sm">Alle Aufgaben und Termine zentral an einem Ort.</p>
          </div>
        </div>
        
      {/* TODO: Dashboard-Ansicht für angemeldete Nutzer (Search, CategoryFilter, Collection) */}
  
      </section>
    </>
  )
}