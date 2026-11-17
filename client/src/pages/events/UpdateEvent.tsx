import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from "react-i18next"

import { useAuth } from '@/hooks/useAuth'

import type { Event } from '@/types'
import { getEventById } from '@/api/events'

import EventForm from '@/components/shared/EventForm'

const UpdateEvent = () => {
  const { t } = useTranslation()

  const { id } = useParams<{ id: string }>()
  const { accessToken, isLoading: isAuthLoading} = useAuth()

  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const isMissingId = !id
  const isMissingToken = !isAuthLoading && !accessToken

  const displayError = isMissingId
    ? t("eventPages.missingId")
    : isMissingToken
      ? t("eventPages.loginRequired")
      : error

  useEffect(() => {
  if (isAuthLoading || !id || !accessToken) return

  let cancelled = false

  const fetchEvent = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await getEventById(id, accessToken)

      if (!cancelled) {
        setEvent(data)
      }
    } catch (err) {
      console.error('Fehler beim Laden des Events:', err)

      if (!cancelled) {
        setError(t("eventPages.loadError"));
        setEvent(null)
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
}, [id, accessToken, isAuthLoading, t])

  if (isAuthLoading || (!isMissingId && !isMissingToken && isLoading)) {
    return (
      <div className="wrapper my-8 text-center text-gray-500 font-medium">
        {t("eventPages.loading")}
      </div>
    )
  }

  if (displayError || !event) {
    return (
      <div className="wrapper my-8 text-center">
        <h2 className="text-2xl font-bold text-red-500">
          {displayError || t("eventPages.notFound")}
        </h2>
      </div>
    )
  }

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-2 md:py-4">
        <h3 className="text-[24px] font-bold leading-tight md:text-[30px] lg:text-[36px] text-center">
          {t("eventPages.updateTitle")}
        </h3>
      </section>

      <div className="wrapper my-2">
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