import { useState } from 'react'
import leaveIcon from '@/assets/icons/leave.svg'
import {
  AlertDialog,
  AlertDialogAction,
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
}

export const LeaveConfirmation = ({ eventId }: LeaveConfirmationProps) => {
  const [isLeaving, setIsLeaving] = useState(false)

  const handleLeave = async () => {
    setIsLeaving(true)
    console.log(`[MOCK LEAVE] Event ID: ${eventId}`)

    await new Promise((resolve) => setTimeout(resolve, 800))

    setIsLeaving(false)
    // TODO: später API-Aufruf zur Stornierung(Delete Attendee)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="cursor-pointer hover:opacity-75 transition-opacity"
          title="Event verlassen"
        >
          <img src={leaveIcon} alt="Verlassen" width={30} height={30} />
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Event verlassen?</AlertDialogTitle>
          <AlertDialogDescription className="p-regular-16 text-grey-600">
            Möchten Sie Ihre Teilnahme an dieser Veranstaltung wirklich stornieren?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>

          <AlertDialogAction
            onClick={handleLeave}
            disabled={isLeaving}
            className="bg-secondary-dark hover:bg-red-600 text-black"
          >
            {isLeaving ? 'Wird verlassen...' : 'Verlassen'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}