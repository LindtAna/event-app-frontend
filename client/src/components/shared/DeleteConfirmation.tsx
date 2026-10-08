import { useState } from 'react'
import { deleteEvent } from '@/api/events'
import { useAuth } from '@/hooks/useAuth'

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

import deleteIcon from '@/assets/icons/delete.svg'

type DeleteConfirmationProps = {
  eventId: number | string
  onEventDeleted?: (eventId: number | string) => void
}

export const DeleteConfirmation = ({ eventId, onEventDeleted }: DeleteConfirmationProps) => {
  const { accessToken } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  const [open, setOpen] = useState(false)

 const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      setIsDeleting(true)
      await deleteEvent(eventId, accessToken,)
      setOpen(false)
      if (onEventDeleted) {
        onEventDeleted(eventId)
      }
    } catch (err) {
      console.error('Fehler beim Löschen des Events:', err)
      alert('Event konnte nicht gelöscht werden.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="cursor-pointer hover:opacity-75 transition-opacity"
          title="Event löschen"
        >
          <img src={deleteIcon} alt="Löschen" width={30} height={30} />
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Event wirklich löschen?</AlertDialogTitle>
          <AlertDialogDescription className="p-regular-16 text-red-500">
            Diese Aktion kann nicht rückgängig gemacht werden. Das Event wird dauerhaft gelöscht.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600"
          >
            {isDeleting ? 'Wird gelöscht...' : 'Löschen'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}