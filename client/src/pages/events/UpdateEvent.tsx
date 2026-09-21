import { useParams } from 'react-router-dom'
import EventForm from '@/components/shared/EventForm'
import { dummyEvents } from '@/constants/dummy-data'

const UpdateEvent = () => {
  const { id } = useParams<{ id: string }>()
  const mockUserId = 'user_12345'

  //nach einem Event in dummyData suchen anhand seiner URL-ID
  const event = dummyEvents.find((e) => e.id.toString() === id)

  if (!event) {
    return (
      <div className="wrapper my-8 text-center">
        <h2 className="text-2xl font-bold">Veranstaltung nicht gefunden</h2>
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
          userId={mockUserId}
          type="Update"
          event={event}
          eventId={event.id.toString()}
        />
      </div>
    </>
  )
}

export default UpdateEvent