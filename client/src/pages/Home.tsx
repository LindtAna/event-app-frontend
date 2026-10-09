
import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import { getAllEvents } from '@/api/events'
import type { Event } from '@/types'

import { Button } from '@/components/ui/button'

import Collection from '@/components/shared/Collection'
import Search from '@/components/shared/Search'
import CategoryFilter from '@/components/shared/CategoryFilter'

import hero from '@/assets/images/hero.png'


export default function Home() {
  const { user, isSignedIn, isLoading: isAuthLoading } = useAuth()
  const [searchParams] = useSearchParams()

  const searchQuery = searchParams.get('query') || ''
  const categoryQuery = searchParams.get('category') || ''

  const [events, setEvents] = useState<Event[]>([])
  const [isEventsLoading, setIsEventsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

// für den angemeldeten Benutzer alle Veranstaltungen laden 
  useEffect(() => {
    if (!isSignedIn) return

    const fetchEvents = async () => {
      setIsEventsLoading(true)
      setError(null)
      try {
        const data = await getAllEvents()
        setEvents(data || [])
      } catch (err) {
        console.error('Fehler beim Laden der Veranstaltungen:', err)
        setError('Veranstaltungen konnten nicht geladen werden.')
      } finally {
        setIsEventsLoading(false)
      }
    }

    fetchEvents()
  }, [isSignedIn])

 // Entfernen des Events aus local State ( nach erfolgreichem DELETE aus der Card)
  const handleEventDeleted = (eventId: number | string) => {
    setEvents((prev) => prev.filter((event) => event.id !== Number(eventId)))
  }

  // Filtern nach Suchanfrage und Kategorie
  const filteredEvents = events.filter((event) => {
    const matchQuery = searchQuery
      ? event.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true

    const matchCategory =
      categoryQuery && categoryQuery !== 'All'
        ? event.categoryId === categoryQuery ||
          event.categories?.some(
            (cat) => cat.id === categoryQuery || cat.name === categoryQuery
          )
        : true

    return matchQuery && matchCategory
  })

  // Warten auf den Abschluss der Autorisierungsprüfung (Flackern der Landingpage vermeiden)
  if (isAuthLoading) {
    return (
      <div className="wrapper my-8 flex items-center justify-center min-h-[300px]">
        <p className="p-regular-16 text-grey-500">Laden...</p>
      </div>
    )
  }


 // Autorisierter Benutzer
  if (isSignedIn && user) {
    return (
      <div className="wrapper my-8 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="h2-bold">
            Willkommen zurück, {user.name}!
          </h1>
          <p className="p-regular-16 text-grey-600">
            Hier sind Ihre aktuellen Veranstaltungen und Pläne im Überblick.
          </p>
        </div>

        <div className="flex w-full flex-col gap-5 md:flex-row">
          <Search placeholder="Event suchen..." />
          <CategoryFilter />
        </div>

        {isEventsLoading ? (
          <div className="flex items-center justify-center min-h-[200px] text-grey-500">
            Veranstaltungen werden geladen...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[200px] text-red-500">
            {error}
          </div>
        ) : (
          <Collection
            data={filteredEvents}
            emptyTitle="Keine Veranstaltungen gefunden"
            emptyStateSubtext={
              searchQuery || categoryQuery
                ? 'Versuchen Sie einen anderen Suchbegriff.'
                : 'Erstellen Sie Ihre erste Veranstaltung'
            }
            emptyStateShowButton={!searchQuery && !categoryQuery}
            collectionType="All_Events"
            currentUserId={user.id}
            attendeeEventIds={[]}
            limit={10}
            onEventDeleted={handleEventDeleted}
          />
        )}
      </div>
    )
  }

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
          <div className="border border-primary-500/40 rounded-xl p-6">
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
      </section>
    </>
  )
}