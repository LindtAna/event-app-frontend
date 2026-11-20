import type { Event } from '@/types'
import { useTranslation } from 'react-i18next'

import { DeleteConfirmation } from './DeleteConfirmation'
import { LeaveConfirmation } from './LeaveConfirmation'
import { LocalizedLink } from './LocalizedLink'

import owner from '@/assets/icons/ownership.svg'
import attendee from '@/assets/icons/attendee.svg'
import editIcon from '@/assets/icons/edit.svg'

type CardProps = {
  event: Event
  userRole?: 'owner' | 'attendee'
  currentUserId?: number
  attendeeEventIds?: number[]
  onEventDeleted?: (eventId: number | string) => void
  onEventLeft?: (eventId: number | string) => void
}

const Card = ({
  event,
  userRole,
  currentUserId,
  attendeeEventIds = [],
  onEventDeleted,
  onEventLeft }: CardProps) => {

    const { t, i18n } = useTranslation()

  const locale = i18n.language.startsWith('en')
    ? 'en-US'
    : i18n.language.startsWith('ru')
      ? 'ru-RU'
      : 'de-DE'


  const formattedDate = new Date(event.startDateTime).toLocaleString(locale, {
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
      {/* delete, edit, leave event buttons */}
      {effectiveRole === 'owner' && (
        <div className="absolute right-2 top-2 z-10 flex gap-2">
          {/* edit */}
          <LocalizedLink
            to={`/events/${event.id}/update`}
            title={t('card.editEvent')}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 bg-dotted-pattern bg-cover bg-center border border-primary-500/40 shadow-sm backdrop-blur-sm transition-all hover:border-primary-500/80 hover:shadow-md hover:scale-105"
          >
            <img src={editIcon}
            alt={t('card.edit')}
            width={20} height={20} />
          </LocalizedLink>

          {/* delete */}
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 bg-dotted-pattern bg-cover bg-center border border-primary-500/40 shadow-sm backdrop-blur-sm transition-all hover:border-primary-500/80 hover:shadow-md hover:scale-105 [&>button]:flex [&>button]:h-full [&>button]:w-full [&>button]:items-center [&>button]:justify-center">
            <DeleteConfirmation eventId={event.id} onEventDeleted={onEventDeleted} />
          </div>
        </div>
      )}


      {/* leave event */}
      {effectiveRole === 'attendee' && (
        <div className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 bg-dotted-pattern bg-cover bg-center p-2 shadow-sm backdrop-blur-sm transition-all border border-primary-500/40 hover:border-primary-500/80 hover:shadow-md hover:scale-105">
          <LeaveConfirmation
            eventId={event.id}
            onEventLeft={onEventLeft}
          />
        </div>
      )}

      <LocalizedLink
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
              alt={t('card.owner')}
              title={t('card.owner')}
              className="h-7 w-auto object-contain select-none"
            />
          )}

          {effectiveRole === 'attendee' && (
            <img
              src={attendee}
              alt={t('card.attendee')}
              title={t('card.attendee')}
              className="h-7 w-auto object-contain select-none"
            />
          )}
        </div>

        <p className="p-medium-16 text-black">{formattedDate}</p>

        <LocalizedLink to={`/events/${event.id}`}>
          <p className="p-medium-20 font-bold line-clamp-2 flex-1 text-black hover:text-primary-500 transition-colors">
            {event.title}
          </p>
        </LocalizedLink>

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