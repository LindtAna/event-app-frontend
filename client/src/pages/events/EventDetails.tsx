import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import { getEventById } from '@/api/events'
import type { Event, User } from '@/types'
import { getEventAttendees, addEventAttendee } from '@/api/attendees'

import { formatDateTime } from '@/lib/utils'

import { Button } from '@/components/ui/button'

import calendar from '@/assets/icons/calendar.svg'
import location from '@/assets/icons/location.svg'

const EventDetails = () => {
    const { id } = useParams<{ id: string }>()

    const {
        user,
        accessToken,
        isSignedIn,
        isLoading: isAuthLoading,
    } = useAuth()

    const [event, setEvent] = useState<Event | null>(null)
    const [attendees, setAttendees] = useState<User[]>([])

    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isAttendeesLoading, setIsAttendeesLoading] = useState(true)
    const [isJoining, setIsJoining] = useState(false)

    const [error, setError] = useState<string | null>(null)
    const [attendeesError, setAttendeesError] = useState<string | null>(null)
    const [joinError, setJoinError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) return

        let cancelled = false

        const fetchEvent = async () => {
            try {
                setIsLoading(true)
                setError(null)

                const data = await getEventById(id)

                if (!cancelled) {
                    setEvent(data)
                }
            } catch (err) {
                console.error('Fehler beim Laden des Events:', err)
                if (!cancelled) {
                    setError('Event konnte nicht geladen werden.')
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
            }
        }
        void fetchEvent()

        return () => {
            cancelled = true
        }
    }, [id])

    // Teilnehmer des Events laden
    useEffect(() => {
        if (!id) return

        let cancelled = false

        const fetchAttendees = async () => {
            setIsAttendeesLoading(true)
            setAttendeesError(null)
            setAttendees([])

            try {
                const data = await getEventAttendees(id)

                if (!cancelled) {
                    // Der Backend-Handler kann bei null Teilnehmern
                    // eine JSON-null-Antwort zurückgeben.
                    setAttendees(data ?? [])
                }
            } catch (err) {
                console.error(
                    'Fehler beim Laden der Teilnehmer:',
                    err
                )

                if (!cancelled) {
                    setAttendeesError(
                        'Teilnehmer konnten nicht geladen werden.'
                    )
                }
            } finally {
                if (!cancelled) {
                    setIsAttendeesLoading(false)
                }
            }
        }

        void fetchAttendees()

        return () => {
            cancelled = true
        }
    }, [id])

    // Prüfen, ob der aktuelle Benutzer bereits teilnimmt
    const isAttending = Boolean(
        user && attendees.some((attendee) => attendee.id === user.id)
    )

    // Aktuellen Benutzer als Teilnehmer registrieren
    const handleJoinEvent = async () => {
        if (!event || !user || !accessToken) {
            setJoinError('Bitte melde dich an, um teilzunehmen.')
            return
        }

        if (isAttending || isJoining) return

        try {
            setIsJoining(true)
            setJoinError(null)

            await addEventAttendee(event.id, user.id, accessToken)

            // Unmittelbar nach erfolgreicher Registrierung aktualisieren
            setAttendees((currentAttendees) => {
                const alreadyAdded = currentAttendees.some(
                    (attendee) => attendee.id === user.id
                )

                return alreadyAdded
                    ? currentAttendees
                    : [...currentAttendees, user]
            })

            // Teilnehmerliste nochmals mit dem Backend abgleichen.
            // Ein Fehler hierbei macht die erfolgreiche Anmeldung
            // nicht rückgängig.
            try {
                const updatedAttendees = await getEventAttendees(event.id)
                setAttendees(updatedAttendees ?? [])
            } catch (refreshError) {
                console.error(
                    'Teilnehmerliste konnte nicht aktualisiert werden:',
                    refreshError
                )
            }
        } catch (err) {
            console.error('Fehler bei der Anmeldung:', err)

            setJoinError(
                err instanceof Error
                    ? err.message
                    : 'Die Anmeldung ist fehlgeschlagen.'
            )
        } finally {
            setIsJoining(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex-center min-h-[300px] text-gray-500 font-medium">
                Event wird geladen...
            </div>
        )
    }

    if (error || !event) {
        return (
            <div className="wrapper my-20 text-center text-red-500 font-medium">
                {error || 'Event nicht gefunden'}
            </div>
        )
    }

    const joinButtonText = isAuthLoading
        ? 'Anmeldestatus wird geprüft...'
        : !isSignedIn
            ? 'Bitte anmelden, um teilzunehmen'
            : isAttendeesLoading
                ? 'Teilnehmer werden geladen...'
                : isAttending
                    ? 'Du nimmst teil'
                    : isJoining
                        ? 'Anmeldung läuft...'
                        : 'Teilnehmen'

    return (
        <>
            <section className="flex justify-center bg-primary-50 bg-dotted-pattern bg-contain">
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:max-w-7xl">
                    {/* Hero-Bild */}
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="h-full min-h-[300px] w-full object-cover object-center"
                    />
                    <div className="flex w-full flex-col gap-8 p-5 md:p-10">
                        <div className="flex flex-col gap-6">
                            <h2 className="text-[28px] font-bold leading-tight md:text-[34px] lg:text-[48px]">
                                {event.title}</h2>
                            <div className="flex items-center gap-3">
                                {/* Kategorie */}
                                {event.categories?.map(cat => (
                                    <p key={cat.id} className="p-medium-16 w-fit rounded-lg bg-secondary/70 px-4 py-2.5 text-black">
                                        {cat.name}
                                    </p>
                                ))}
                            </div>
                            {/* Badge + Name nebeneinander */}
                            <div className="flex items-center gap-3">
                                <p className="p-medium-16 w-fit font-bold text-black underline underline-offset-8 decoration-black decoration-2 px-2">
                                    Veranstalter:
                                </p>
                                <span className="p-medium-16 text-black">
                                    {event.owner?.name}
                                </span>

                            </div>
                        </div>

                        {/* Teilnahme */}
                        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-4">
                            <Button
                                className="w-full sm:w-fit"
                                size="lg"
                                onClick={handleJoinEvent}
                                disabled={
                                    isAuthLoading ||
                                    !isSignedIn ||
                                    !accessToken ||
                                    isAttendeesLoading ||
                                    isJoining ||
                                    isAttending
                                }
                            >
                                {joinButtonText}
                            </Button>

                            {joinError && (
                                <p
                                    role="alert"
                                    className="text-center text-sm font-medium text-red-500"
                                >
                                    {joinError}
                                </p>
                            )}
                        </div>

                        {/* Datum und Uhrzeit */}
                        <div className="flex flex-col gap-5">
                            <div className='flex gap-2 md:gap-3'>
                                <img src={calendar} alt="calendar" width={32} height={32} />
                                <p className="p-medium-16 lg:p-regular-20">Beginn:</p>
                                <div className="p-medium-16 lg:p-regular-20">
                                    <p>{formatDateTime(event.startDateTime).dateTime}</p>
                                </div>
                            </div>

                            <div className='flex gap-2 md:gap-3'>
                                <img src={calendar} alt="calendar" width={32} height={32} />
                                <p className="p-medium-16 lg:p-regular-20">Ende:</p>
                                <div className="p-medium-16 lg:p-regular-20">
                                    <p>{formatDateTime(event.endDateTime).dateTime}</p>
                                </div>
                            </div>


                            <div className="p-regular-20 flex items-center gap-3">
                                <img src={location} alt="location" width={32} height={32} />
                                <p className="p-medium-16 lg:p-regular-20">{event.location}</p>
                            </div>
                        </div>

                        {/* Beschreibung */}
                        <div className="flex flex-col gap-2">
                            <p className="p-medium-16 w-fit self-start rounded-3xl border border-secondary-dark/50 px-5 py-1.5 text-black">
                                Beschreibung:
                            </p>
                            <p className="p-medium-16 lg:p-regular-18">{event.description}</p>
                        </div>

                        {/* Teilnehmer */}

                        <div className="flex flex-col gap-2">
                            <p className="p-medium-16 w-fit self-start rounded-3xl border border-secondary-dark/50 px-5 py-1.5 text-black">
                                Teilnehmer ({attendees.length})
                            </p>

                            {isAttendeesLoading ? (
                                <p className="text-sm text-gray-500">
                                    Teilnehmer werden geladen...
                                </p>
                            ) : attendeesError ? (
                                <p className="text-sm text-red-500">
                                    {attendeesError}
                                </p>
                            ) : attendees.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                    Noch keine Teilnehmer.
                                </p>
                            ) : (
                                <ul className="flex flex-wrap gap-2 pt-1">
                                    {attendees.map((attendee) => (
                                        <li
                                            key={attendee.id}
                                            className="rounded-full border border-secondary-dark/30 bg-secondary/50 px-3 py-1.5 text-sm text-black"
                                        >
                                            {attendee.name ||
                                                `Teilnehmer #${attendee.id}`}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default EventDetails