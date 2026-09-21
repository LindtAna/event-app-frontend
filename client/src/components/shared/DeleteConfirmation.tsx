import { useState } from 'react'
import deleteIcon from '@/assets/icons/delete.svg'
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

type DeleteConfirmationProps = {
  eventId: number | string
}

export const DeleteConfirmation = ({ eventId }: DeleteConfirmationProps) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    console.log(`[MOCK DELETE] Event ID: ${eventId}`)
    
    await new Promise((resolve) => setTimeout(resolve, 800))
    
    setIsDeleting(false)
    // TODO: später wird die Lösch-API aufgerufen und die Ereignisliste aktualisiert
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
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>

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