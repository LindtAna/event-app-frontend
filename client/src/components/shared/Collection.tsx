import { useState } from 'react'
import Card from './Card'
import { Button } from '@/components/ui/button'
import type { Event } from '@/types'

import arrowDown from '@/assets/icons/arrow-down-icon.svg'
import { Link } from 'react-router-dom'

type CollectionProps = {
  data: Event[]
  emptyTitle: string
  emptyStateSubtext: string
  limit?: number
  collectionType?: 'Events_Organized' | 'My_Events' | 'All_Events'
  currentUserId?: number
  attendeeEventIds?: number[]
  emptyStateShowButton?: boolean
}

const Collection = ({
  data,
  emptyTitle,
  emptyStateSubtext,
  limit = 10,
  collectionType = 'All_Events',
  currentUserId,
  attendeeEventIds = [],
  emptyStateShowButton = false,

}: CollectionProps) => {
  const [visibleCount, setVisibleCount] = useState(limit)

  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + limit)
  }

  const visibleEvents = data.slice(0, visibleCount)
  const hasMore = visibleCount < data.length

  return (
    <>
      {data.length > 0 ? (
        <div className="flex flex-col items-center gap-10">
          <ul className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
            {visibleEvents.map((event) => {
              let userRole: 'owner' | 'attendee' | undefined

              if (collectionType === 'Events_Organized') {
                userRole = 'owner'
              } else if (collectionType === 'My_Events') {
                userRole = 'attendee'
              }

              return (
                <li key={event.id} className="flex justify-center">
                  <Card
                    event={event}
                    userRole={userRole}
                    currentUserId={currentUserId}
                    attendeeEventIds={attendeeEventIds}
                  />
                </li>
              )
            })}
          </ul>

          {hasMore && (
            <div className="flex justify-center mt-4">
              <Button
                onClick={handleShowMore}
                className="group relative flex flex-col items-center text-xl mx-auto cursor-pointer px-12 my-4 py-2.5 bg-transparent hover:bg-transparent text-primary transition"
              >
                Mehr anzeigen
                <img
                  src={arrowDown}
                  alt="Mehr anzeigen Icon"
                  className="w-6 h-6 mt-1 transition-transform duration-200 group-hover:translate-y-1"
                />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-center wrapper min-h-[200px] w-full flex-col gap-3 rounded-[14px] bg-primary-50 bg-dotted-pattern bg-cover bg-center py-28 text-center border border-primary-500/40">
          <h3 className="p-bold-20 md:h5-bold text-secondary-dark">{emptyTitle}</h3>
          <p className="p-regular-14 text-secondary-dark">{emptyStateSubtext}</p>
           {emptyStateShowButton && (
            <Button asChild className="w-full sm:w-fit mt-2" size="lg">
              <Link to="/events/create">Los geht’s!</Link>
            </Button>
          )}
        </div>
      )}
    </>
  )
}

export default Collection