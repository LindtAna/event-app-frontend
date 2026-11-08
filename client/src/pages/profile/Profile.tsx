import { useState, useEffect } from 'react'

import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Collection from '@/components/shared/Collection'

import { getInitials } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import type { Event } from '@/types'
import { getOrganizedEvents } from '@/api/events'
import { getEventsByAttendee } from '@/api/attendees'

import editIcon from '@/assets/icons/edit.svg'
import userIcon from '@/assets/icons/username.svg'
import mailIcon from '@/assets/icons/email.svg'
import infoIcon from '@/assets/icons/bio.svg'

type TabType = 'teilnehmer' | 'ersteller'

const Profile = () => {
  const { user: currentUser, accessToken, isLoading: isAuthLoading, } = useAuth()

  const currentUserId = currentUser?.id

  const [loadedUserId, setLoadedUserId] = useState<typeof currentUserId>()

  // standart auf 'ersteller' umschalten oder 'teilnehmer' beibehalten
  const [activeTab, setActiveTab] = useState<TabType>('ersteller')

  const [organizedEvents, setOrganizedEvents] = useState<Event[]>([])
  const [participatingEvents, setParticipatingEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const hasCurrentUserData =
    currentUserId !== undefined &&
    !!accessToken &&
    loadedUserId === currentUserId

  const isMissingAccessToken =
    !isAuthLoading &&
    currentUserId !== undefined &&
    !accessToken

  const displayError = isMissingAccessToken
    ? 'Die Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.'
    : hasCurrentUserData
      ? error
      : null

  const visibleOrganizedEvents = hasCurrentUserData
    ? organizedEvents
    : []

  const visibleParticipatingEvents = hasCurrentUserData
    ? participatingEvents
    : []

  const shouldShowLoading =
    isAuthLoading ||
    (
      currentUserId !== undefined &&
      !!accessToken &&
      (!hasCurrentUserData || isLoading)
    )

  const attendeeEventIds = visibleParticipatingEvents.map(
    (event) => event.id
  )

  useEffect(() => {
  // Warten, bis die Authentifizierung wiederhergestellt wurde.
  if (isAuthLoading || currentUserId === undefined || !accessToken) {
    return
  }

  let cancelled = false

  const fetchUserEvents = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [organizedData, participatingData] = await Promise.all([
        getOrganizedEvents(currentUserId, accessToken),
        getEventsByAttendee(currentUserId, accessToken),
      ])

      if (!cancelled) {
        setOrganizedEvents(organizedData ?? [])
        setParticipatingEvents(participatingData ?? [])
        setLoadedUserId(currentUserId)
      }
    } catch (err) {
      console.error('Fehler beim Laden der Events:', err)

      if (!cancelled) {
        setOrganizedEvents([])
        setParticipatingEvents([])
        setLoadedUserId(currentUserId)
        setError('Fehler beim Laden der Events.')
      }
    } finally {
      if (!cancelled) {
        setIsLoading(false)
      }
    }
  }

  void fetchUserEvents()

  return () => {
    cancelled = true
  }
}, [currentUserId, accessToken, isAuthLoading])

  if (!currentUser) return null

  const userName = currentUser.name || `User #${currentUser.id}`

  const handleEventDeleted = (eventId: number | string) => {
    setOrganizedEvents((prevEvents) =>
      prevEvents.filter((event) => event.id !== Number(eventId))
    )
  }
  const handleEventLeft = (eventId: number | string) => {
    setParticipatingEvents((prevEvents) =>
      prevEvents.filter((event) => event.id !== Number(eventId))
    )
  }
  return (
    <>
      {/* Benutzerprofil */}
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center border border-b-primary-500/40">
        <div className="wrapper flex flex-col gap-8 md:flex-row md:justify-between md:items-start">

          {/* Bearbeiten-Button - Mobile */}
          <div className="flex flex-col sm:flex-row gap-6 md:gap-10 items-center sm:items-start">
            <Link
              to="/profile/update"
              title="Profil bearbeiten"
              className="md:hidden self-end hover:scale-105 transition-opacity"
            >
              <img src={editIcon} alt="Bearbeiten" width={24} height={24} />
            </Link>

            {/* Avatar und Infos */}
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-2 border-primary-500/70 shadow-sm ring-1 ring-slate-200">
              <AvatarImage src={currentUser.avatarUrl} alt={userName} className="object-cover" />
              <AvatarFallback className="bg-secondary-dark text-white text-4xl font-semibold">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>

            {/* Benutzerdaten */}
            <div className="flex flex-col gap-4 text-center sm:text-left">
              <h2 className="text-[24px] font-bold md:text-[30px]">Mein Profil</h2>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <img src={userIcon} alt="Name" width={20} height={20} />
                  <span className="p-medium-18 text-black">{currentUser.name}</span>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <img src={mailIcon} alt="Email" width={20} height={20} />
                  <span className="p-medium-18 text-black">{currentUser.email}</span>
                </div>

                {currentUser.bio && (
                  <div className="flex items-center justify-center sm:justify-start gap-3">
                    <img src={infoIcon} alt="Bio" width={20} height={20} />
                    <span className="p-medium-18 text-black">{currentUser.bio}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bearbeiten-Button - Desktop */}
          <Button asChild variant="outline" className="hidden md:flex gap-2 bg-white hover:bg-primary/70 text-black border-primary-500/40">
            <Link to="/profile/update">
              <img src={editIcon} alt="Bearbeiten" width={16} height={16} />
              Profil bearbeiten
            </Link>
          </Button>
        </div>
      </section>

      {/* Event-Liste - Tabs */}
      <section className="wrapper flex flex-col gap-4">
        <h3 className="text-[24px] font-bold text-center md:text-start md:text-[28px]">Meine Events</h3>

        {/* Tab-Navigation */}
        <div className="flex gap-8 border-b border-primary-500/40 pb-2">
          <button
            role="tab"
            aria-selected={activeTab === 'teilnehmer'}
            onClick={() => setActiveTab('teilnehmer')}
            className={`p-medium-20 pb-2 transition-all hover:text-primary-500 relative ${activeTab === 'teilnehmer'
              ? 'text-black font-bold after:content-[""] after:absolute after:left-0 after:bottom-[-9px] after:w-full after:h-[3px] after:bg-primary-500'
              : 'text-gray-500'
              }`}
          >
            Teilnehmer
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'ersteller'}
            onClick={() => setActiveTab('ersteller')}
            className={`p-medium-20 pb-2 transition-all hover:text-primary-500 relative ${activeTab === 'ersteller'
              ? 'text-black font-bold after:content-[""] after:absolute after:left-0 after:bottom-[-9px] after:w-full after:h-[3px] after:bg-primary-500'
              : 'text-gray-500'
              }`}
          >
            Ersteller
          </button>
        </div>

        {/* Tab-Inhalte */}
        <div>
          {shouldShowLoading ? (
            <div className="flex-center min-h-[200px] text-gray-500 font-medium">
              Events werden geladen...
            </div>
          ) : displayError ? (
            <div className="flex-center min-h-[200px] text-red-500 font-medium">
              {displayError}
            </div>
          ) : activeTab === 'teilnehmer' ? (
            <Collection
              data={visibleParticipatingEvents}
              emptyTitle="Noch keine Event-Zusagen"
              emptyStateSubtext="Sie nehmen derzeit an keinen Events teil."
              emptyStateShowButton={false}
              collectionType="My_Events"
              currentUserId={currentUser.id}
              attendeeEventIds={attendeeEventIds}
              limit={6}
              onEventLeft={handleEventLeft}
            />
          ) : (
            <Collection
              data={visibleOrganizedEvents}
              emptyTitle="Noch keine Events erstellt"
              emptyStateSubtext="Erstellen Sie jetzt Ihr erstes Event."
              emptyStateShowButton={true}
              collectionType="Events_Organized"
              currentUserId={currentUser.id}
              attendeeEventIds={attendeeEventIds}
              limit={6}
              onEventDeleted={handleEventDeleted}
            />
          )}
        </div>
      </section>
    </>
  )
}

export default Profile