import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import EventForm from '@/components/shared/EventForm'
import type { Event } from '@/types'
import { getEventById } from '@/api/events'

const UpdateEvent = () => {
  const { id } = useParams<{ id: string }>()

  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchEvent = async () => {
      try {
        setIsLoading(true)
        setError(null)
    
        const data = await getEventById(id)
        setEvent(data)
      } catch (err) {
        console.error('Fehler beim Laden des Events:', err)
        setError('Veranstaltung konnte nicht geladen werden.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [id])

  if (isLoading) {
    return (
      <div className="wrapper my-8 text-center text-gray-500 font-medium">
        Veranstaltung wird geladen...
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="wrapper my-8 text-center">
        <h2 className="text-2xl font-bold text-red-500">
          {error || 'Veranstaltung nicht gefunden'}
        </h2>
      </div>
    )
  }

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="text-[28px] font-bold leading-tight md:text-[34px] lg:text-[48px] text-center">
          Event bearbeiten
        </h3>
      </section>

      <div className="wrapper my-8">
        <EventForm
          type="Update"
          event={event}
          eventId={event.id.toString()}
        />
      </div>
    </>
  )
}

export default UpdateEvent