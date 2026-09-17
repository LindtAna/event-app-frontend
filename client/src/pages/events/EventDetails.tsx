import { Link, useParams } from 'react-router-dom'
import { dummyEvents, dummyAttendees } from '@/constants/dummy-data'
import { formatDateTime, getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import calendar from '@/assets/icons/calendar.svg'
import location from '@/assets/icons/location.svg'
import { Button } from '@/components/ui/button'


const EventDetails = () => {
    const { id } = useParams()
    // URL-Param ist string, Event.id ist number -> konvertieren
    const eventId = Number(id)
    const event = dummyEvents.find(e => e.id === eventId)

    if (!event) {
        return <div className="wrapper my-20 text-center">Event nicht gefunden</div>
    }

    // Teilnehmer für dieses Event aus dummy-data
    const attendees = dummyAttendees.filter(a => a.eventId === eventId)

    return (
        <>
            <section className="flex justify-center bg-primary-50 bg-dotted-pattern bg-contain">
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:max-w-7xl">
                    {/* Hero-Bild */}
                    <img
                        src={event.imageUrl || `https://picsum.photos/seed/${event.id}/1000/600`}
                        alt={event.title}
                        className="h-full min-h-[300px] w-full object-cover object-center"
                    />
                    <div className="flex w-full flex-col gap-8 p-5 md:p-10">
                        <div className="flex flex-col gap-6">
                            <h2 className="text-[28px] font-bold leading-tight md:text-[34px] lg:text-[48px]">{event.title}</h2>
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
                                    {event.owner?.name || `User #${event.ownerId}`}
                                </span>

                            </div>
                        </div>

                        <div className="flex flex-1 items-center justify-center py-4">
                            <Button asChild className="w-full sm:w-fit" size="lg">
                                <Link to="#">Teilnehmen ({attendees.length})</Link>
                            </Button>
                        </div>

                        <div className="flex flex-col gap-5">
                            <div className='flex gap-2 md:gap-3'>
                                <img src={calendar} alt="calendar" width={32} height={32} />
                                <div className="p-medium-16 lg:p-regular-20">
                                    {/* Nur Datum, da dummy-data kein time hat */}
                                    <p>{formatDateTime(event.date).dateOnly}</p>
                                </div>
                            </div>

                            <div className="p-regular-20 flex items-center gap-3">
                                <img src={location} alt="location" width={32} height={32} />
                                <p className="p-medium-16 lg:p-regular-20">{event.location}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <p className="p-medium-16 w-fit self-start rounded-3xl border border-secondary-dark/50 px-5 py-1.5 text-black">
                                Beschreibung:
                            </p>
                            <p className="p-medium-16 lg:p-regular-18">{event.description}</p>
                        </div>

                        {attendees.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <p className="p-medium-16 w-fit self-start rounded-3xl border border-secondary-dark/50 px-5 py-1.5 text-black">
                                    Teilnehmer:
                                </p>
                                <div className="flex -space-x-2 pt-1">
                                    {attendees.map(a => {
                                        const userName = a.user?.name || `User #${a.userId}`

                                        return (
                                            <Avatar
                                                key={a.id ?? a.userId}
                                                className="h-8 w-8 border-2 border-primary-500 ring-1 ring-slate-200"
                                            >
                                                <AvatarImage
                                                    src={a.user?.avatarUrl}
                                                    alt={userName}
                                                />
                                                <AvatarFallback className="bg-secondary-dark text-white text-xs font-semibold">
                                                    {getInitials(userName)}
                                                </AvatarFallback>
                                            </Avatar>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    )
}

export default EventDetails