import { Link } from 'react-router-dom'
import type { Event } from '@/types'

import owner from '@/assets/icons/ownership.svg'
import attendee from '@/assets/icons/attendee.svg'


type CardProps = {
  event: Event
  userRole?: 'owner' | 'attendee'
  currentUserId?: number
  attendeeEventIds?: number[]
}

const Card = ({ event, userRole, currentUserId, attendeeEventIds = [] }: CardProps) => {
  const formattedDate = new Date(event.startDateTime).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const primaryCategory = event.categories?.[0]?.name

  // Rollenbestimmung: Priorität -> übergebene userRole, andernfalls wird sie anhand der currentUserId berechnet
  let effectiveRole = userRole

  if (!effectiveRole && currentUserId) {
    if (event.ownerId === currentUserId) {
      effectiveRole = 'owner'
    } else if (attendeeEventIds.includes(event.id)) {
      effectiveRole = 'attendee'
    }
  }

  return (
    <div className="group relative flex min-h-[380px] w-full max-w-[400px] flex-col overflow-hidden rounded-lg bg-white shadow-md shadow-primary-500/30 hover:shadow-primary-500/60 transition-all hover:shadow-lg md:min-h-[430px] border border-primary-500/40">
      <Link
        to={`/events/${event.id}`}
        style={{ backgroundImage: `url(${event.imageUrl})` }}
        className="flex-center flex-grow bg-gray-50 bg-cover bg-center text-grey-500 min-h-[100px]"
      />

      <div className="flex min-h-[180px] flex-col gap-3 p-5 md:gap-4 ">
        <div className="flex flex-wrap items-center gap-2">
          {primaryCategory && (
            <p className="p-semibold-14 w-max rounded-lg bg-secondary px-4 py-1 text-black">
              {primaryCategory}
            </p>
          )}

          {effectiveRole === 'owner' && (
            <img
              src={owner}
              alt="Owner"
              title="Owner"
              className="h-7 w-auto object-contain select-none"
            />
          )}

          {effectiveRole === 'attendee' && (
            <img
              src={attendee}
              alt="Attendee"
              title="Attendee"
              className="h-7 w-auto object-contain select-none"
            />
          )}
        </div>

        <p className="p-medium-16 text-black">{formattedDate}</p>

        <Link to={`/events/${event.id}`}>
          <p className="p-medium-20 font-bold line-clamp-2 flex-1 text-black hover:text-primary-500 transition-colors">
            {event.title}
          </p>
        </Link>

        <div className="flex-between w-full mt-auto">
          <p className="p-medium-14 md:p-medium-16 text-secondary-dark">
            {event.owner?.name}
          </p>
          <p className="p-regular-14 text-secondary line-clamp-1">{event.location}</p>
        </div>
      </div>
    </div>
  )
}

export default Card