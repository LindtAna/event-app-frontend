import { useCallback, type Dispatch, type SetStateAction } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import uploadIcon from '@/assets/icons/upload.svg'


type FileUploaderProps = {
    onFieldChange: (url: string) => void       // Handler zur Aktualisierung der Bild-URL im Formular
    imageUrl: string                           // URL oder Blob-Link für die Bildvorschau
    setFiles: Dispatch<SetStateAction<File[]>> // Setter zum Speichern der echten File-Objekte (für den Upload ans Backend)
}

export function FileUploader({ imageUrl, onFieldChange, setFiles }: FileUploaderProps) {
    // Callback-Funktion -> aufgerufen beim Drag & Drop oder Auswählen von Dateien
    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(acceptedFiles)
        if (acceptedFiles.length > 0) {
            onFieldChange(URL.createObjectURL(acceptedFiles[0])) // Erstellt eine temporäre lokale Vorschau-URL für das React-Hook-Form-Feld
        }
    }, [setFiles, onFieldChange])

    // Konfiguration des react-dropzone Hooks
    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.svg', '.webp']
        }
    })

    return (
        <div
            {...getRootProps()}
            className="flex-center bg-grey-50 flex h-72 cursor-pointer flex-col overflow-hidden rounded-xl border border-dashed border-grey-300 hover:border-primary-500 transition-colors">
            <input {...getInputProps()} className="cursor-pointer" />

{/* Konditionelles Rendering: Zeigt entweder das hochgeladene Bild oder das Drag-and-Drop-Feld */}
            {imageUrl ? (
                <div className="flex h-full w-full flex-1 justify-center">
                    <img
                        src={imageUrl}
                        alt="Event Vorschau"
                        className="w-full h-full object-cover object-center"
                    />
                </div>
            ) : (
                <div className="flex-center flex-col py-5 text-grey-500">
                    <img src={uploadIcon} width={77} height={77} alt="File Upload" />
                    <h3 className="mb-2 mt-2 font-medium">Foto hierher ziehen</h3>
                    <p className="p-medium-12 mb-4">SVG, PNG, JPG, WEBP</p>
                    <Button type="button" className="rounded-lg bg-secondary-dark">
                        Vom Computer auswählen
                    </Button>
                </div>
            )}
        </div>
    )
}