
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@/hooks/useAuth'
import { leaveEvent } from '@/api/attendees'

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

import leaveIcon from '@/assets/icons/leave.svg'

type LeaveConfirmationProps = {
  eventId: number | string
  onEventLeft?: (eventId: number | string) => void
}

export const LeaveConfirmation = ({
  eventId,
  onEventLeft,
}: LeaveConfirmationProps) => {
  const { t } = useTranslation()
  const { user, accessToken } = useAuth()

  const [isOpen, setIsOpen] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLeave = async () => {
    if (!user || !accessToken) {
      setError(t('leaveConfirmation.loginRequired'))
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
          : t('leaveConfirmation.genericError')
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
           title={t('leaveConfirmation.triggerTitle')}
          aria-label={t('leaveConfirmation.triggerTitle')}
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
             {t('leaveConfirmation.title')}
          </AlertDialogTitle>

          <AlertDialogDescription className="p-regular-16 text-grey-600">
             {t('leaveConfirmation.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLeaving}>
             {t('leaveConfirmation.cancel')}
          </AlertDialogCancel>

          <button
            type="button"
            onClick={handleLeave}
            disabled={isLeaving}
            className="inline-flex items-center justify-center rounded-md bg-secondary-dark px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
             {isLeaving
              ? t('leaveConfirmation.leaving')
              : t('leaveConfirmation.confirm')}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}