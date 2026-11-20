import { useState } from 'react'
import { useTranslation } from 'react-i18next'

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

export const DeleteConfirmation = ({ 
  eventId, 
  onEventDeleted 
}: DeleteConfirmationProps) => {
  const { t } = useTranslation()
  const { accessToken } = useAuth()

  const [isDeleting, setIsDeleting] = useState(false)
  const [open, setOpen] = useState(false)

 const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (!accessToken) {
      alert(t('deleteConfirmation.sessionExpired'))
      return
    }

    try {
      setIsDeleting(true)
      await deleteEvent(eventId, accessToken,)
      setOpen(false)
      onEventDeleted?.(eventId)
    } catch (err) {
      console.error('Fehler beim Löschen des Events:', err)
      alert('Event konnte nicht gelöscht werden.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
      <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="cursor-pointer hover:opacity-75 transition-opacity"
          title={t('deleteConfirmation.triggerTitle')}
        >
          <img src={deleteIcon}
          alt={t('deleteConfirmation.triggerAlt')}
          width={30} height={30}
          />
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>
             {t('leaveConfirmation.title')}</AlertDialogTitle>
             
          <AlertDialogDescription className="p-regular-16 text-red-500">
            {t('deleteConfirmation.title')}
            </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t('deleteConfirmation.cancel')}
            </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600"
          >
            {isDeleting
              ? t('deleteConfirmation.deleting')
              : t('deleteConfirmation.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}