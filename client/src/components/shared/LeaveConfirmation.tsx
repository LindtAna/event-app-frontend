
import { useState } from 'react'
import leaveIcon from '@/assets/icons/leave.svg'
import { leaveEvent } from '@/api/attendees'
import { useAuth } from '@/hooks/useAuth'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type LeaveConfirmationProps = {
  eventId: number | string
  onEventLeft?: (eventId: number | string) => void
}

export const LeaveConfirmation = ({
  eventId,
  onEventLeft,
}: LeaveConfirmationProps) => {
  const { user, accessToken } = useAuth()

  const [isOpen, setIsOpen] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLeave = async () => {
    if (!user || !accessToken) {
      setError('Bitte melde dich erneut an.')
      return
    }

    try {
      setIsLeaving(true)
      setError(null)

      await leaveEvent(eventId, user.id, accessToken)

      // Erst nach erfolgreicher Antwort die Card aktualisieren
      onEventLeft?.(eventId)

      setIsOpen(false)
    } catch (err) {
      console.error('Fehler beim Verlassen des Events:', err)

      setError(
        err instanceof Error
          ? err.message
          : 'Die Teilnahme konnte nicht storniert werden.'
      )
    } finally {
      setIsLeaving(false)
    }
  }

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isLeaving) {
          setIsOpen(open)
          if (open) setError(null)
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="cursor-pointer transition-opacity hover:opacity-75"
          title="Event verlassen"
          aria-label="Event verlassen"
        >
          <img
            src={leaveIcon}
            alt=""
            width={30}
            height={30}
          />
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Event verlassen?
          </AlertDialogTitle>

          <AlertDialogDescription className="p-regular-16 text-grey-600">
            Möchten Sie Ihre Teilnahme an dieser Veranstaltung wirklich stornieren?
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLeaving}>
            Abbrechen
          </AlertDialogCancel>

          <button
            type="button"
            onClick={handleLeave}
            disabled={isLeaving}
            className="inline-flex items-center justify-center rounded-md bg-secondary-dark px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLeaving ? 'Wird verlassen...' : 'Verlassen'}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}