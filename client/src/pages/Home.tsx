import { useState, useEffect } from 'react'
import { useSearchParams} from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { LocalizedLink } from '@/components/shared/LocalizedLink'

import { useAuth } from '@/hooks/useAuth'
import { getAllEvents } from '@/api/events'
import { getEventsByAttendee } from '@/api/attendees'
import type { Event } from '@/types'

import { Button } from '@/components/ui/button'

import Collection from '@/components/shared/Collection'
import Search from '@/components/shared/Search'
import CategoryFilter from '@/components/shared/CategoryFilter'

import hero from '@/assets/images/hero.png'


export default function Home() {
  const { t } = useTranslation()
  const { user, isSignedIn, accessToken, isLoading: isAuthLoading } = useAuth()
  const [searchParams] = useSearchParams()

  const searchQuery = searchParams.get('query') || ''
  const categoryQuery = searchParams.get('category') || ''

  const userId = user?.id

const [events, setEvents] = useState<Event[]>([])
const [attendeeEventIds, setAttendeeEventIds] = useState<number[]>([])
const [isEventsLoading, setIsEventsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [loadedUserId, setLoadedUserId] = useState<typeof userId>()

// Sicherstellen, dass nur Daten des aktuell angemeldeten Benutzers angezeigt werden
const hasCurrentUserData =
  userId !== undefined && loadedUserId === userId

const visibleEvents = hasCurrentUserData ? events : []
const visibleAttendeeEventIds = hasCurrentUserData ? attendeeEventIds : []
const visibleError = hasCurrentUserData ? error : null

const visibleLoading =
  userId !== undefined && (!hasCurrentUserData || isEventsLoading)

// für den angemeldeten Benutzer alle Veranstaltungen und Teilnahmen laden 
useEffect(() => {
  if (
    isAuthLoading ||
    userId === undefined ||
    !accessToken
  ) {
    return
  }

  let cancelled = false

  const fetchData = async () => {
    setIsEventsLoading(true)
    setError(null)

    try {
      const [eventsData, myEventsData] = await Promise.all([
        getAllEvents(accessToken),
        getEventsByAttendee(userId, accessToken),
      ])

      if (!cancelled) {
        setEvents(eventsData ?? [])
        setAttendeeEventIds(
          (myEventsData ?? []).map((event) => event.id)
        )
        setLoadedUserId(userId)
      }
    } catch (err) {
      console.error('Fehler beim Laden der Daten:', err)

      if (!cancelled) {
        setEvents([])
        setAttendeeEventIds([])
        setLoadedUserId(userId)
        setError(t('home.authenticated.loadError'))
      }
    } finally {
      if (!cancelled) {
        setIsEventsLoading(false)
      }
    }
  }

  void fetchData()

  return () => {
    cancelled = true
  }
}, [isAuthLoading, userId, accessToken, t])

 // Entfernen des Events aus local State ( nach erfolgreichem DELETE aus der Card)
  const handleEventDeleted = (eventId: number | string) => {
    setEvents((prev) => prev.filter((event) => event.id !== Number(eventId)))
  }

  const handleEventLeft = (eventId: number | string) => {
  setAttendeeEventIds((prev) =>
    prev.filter((id) => id !== Number(eventId))
  )
}

  // Filtern nach Suchanfrage und Kategorie
  const filteredEvents = visibleEvents.filter((event) => {
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


 // Autorisierter Benutzer
  if (isSignedIn && user) {
    return (
      <div className="wrapper my-8 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-[18px] font-bold md:text-[24px] lg:text-[30px]">
            {t('home.authenticated.welcome', { name: user.name })}
          </h1>
          <p className="text-[14px] md:text-[18px] lg:text-[20px]">
             {t('home.authenticated.description')}
          </p>
        </div>

        <div className="flex w-full flex-col gap-5 md:flex-row">
          <Search placeholder={t('home.authenticated.searchPlaceholder')} />
          <CategoryFilter />
        </div>

        {visibleLoading ? (
          <div className="flex items-center justify-center min-h-[200px] text-grey-500">
            {t('home.authenticated.loading')}
          </div>
        ) : visibleError ? (
          <div className="flex items-center justify-center min-h-[200px] text-red-500">
            {visibleError}
          </div>
        ) : (
          <Collection
            data={filteredEvents}
             emptyTitle={t('home.authenticated.emptyTitle')}
            emptyStateSubtext={
              searchQuery || categoryQuery
                 ? t('home.authenticated.emptySearch')
      : t('home.authenticated.emptyDefault')
            }
            emptyStateShowButton={!searchQuery && !categoryQuery}
            collectionType="All_Events"
            currentUserId={user.id}
            attendeeEventIds={visibleAttendeeEventIds}
            limit={10}
            onEventDeleted={handleEventDeleted}
            onEventLeft={handleEventLeft}
          />
        )}
      </div>
    )
  }

  // Guest - unauthorisierte Benutzer
  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-contain">
        <div className="wrapper grid grid-cols-1 gap-5 md:grid-cols-2 2xl:gap-0">
          <div className="flex flex-col justify-center gap-4">
            <h1 className="text-[24px] font-bold leading-tight md:text-[30px] lg:text-[36px]">
               {t('home.guest.heroTitle')}
            </h1>
            <p className="p-regular-14 md:p-regular-18 max-w-[50ch]">
             {t('home.guest.heroDescriptionLine1')}
  <br />
  {t('home.guest.heroDescriptionLine2')}
            </p>
            <Button asChild className="w-full sm:w-fit" size="lg">
              <LocalizedLink to="/register">
               {t('home.guest.getStarted')}
               </LocalizedLink>
            </Button>
          </div>
          <img src={hero}
          alt={t('home.guest.heroImageAlt')}
          className="max-h-[70vh] w-full object-contain object-center" />
        </div>
      </section>

      <section className="wrapper my-8 md:my-10 flex flex-col gap-12">
        <h2 className="h2-bold text-center">{t('home.guest.howItWorks')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border border-primary-500/40 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-2">{t('home.guest.step1Title')}</h3>
            <p className="text-sm">
              {t('home.guest.step1Description')}</p>
          </div>
          <div className="border border-primary-500/40 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-2">{t('home.guest.step2Title')}</h3>
            <p className="text-sm">
              {t('home.guest.step2Description')}</p>
          </div>
          <div className="border border-primary-500/40 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-2"> {t('home.guest.step3Title')}</h3>
            <p className="text-sm">{t('home.guest.step3Description')}</p>
          </div>
        </div>
      </section>
    </>
  )
}