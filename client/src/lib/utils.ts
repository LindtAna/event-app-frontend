import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import qs from 'query-string'


// Hilfsfunktion für shadcn: Tailwind-Klassen korrekt zusammenführen
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Datum aus Go-Backend (YYYY-MM-DD) für deutsches UI formatieren
export const formatDateTime = (dateString: string | Date) => {
  if (!dateString) return { dateTime: '', dateOnly: '', timeOnly: '' }

  // Bei einem String im Format YYYY-MM-DD die Bindestriche für das Parsing ersetzen
  const date = typeof dateString === 'string' && dateString.length === 10
    ? new Date(`${dateString}T00:00:00`)
    : new Date(dateString)

  if (isNaN(date.getTime())) {
    return { dateTime: 'Ungültiges Datum', dateOnly: 'Ungültiges Datum', timeOnly: '' }
  }

  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    year: 'numeric',
    day: 'numeric',
  }

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }

  return {
    dateTime: date.toLocaleString('de-DE', dateTimeOptions),
    dateOnly: date.toLocaleString('de-DE', dateOptions),
    timeOnly: date.toLocaleString('de-DE', timeOptions),
  }
}

// Vorschau für Datei-Upload (Avatar / Event-Bild) vor dem Senden an Go-Backend
export const convertFileToUrl = (file: File) => URL.createObjectURL(file)

type UrlQueryParams = {
  params: string
  key: string
  value: string | null
}
type RemoveUrlQueryParams = {
  params: string
  keysToRemove: string[]
}


// Query-Param in URL setzen/aktualisieren  (Search & CategoryFilter)
export function formUrlQuery({ params, key, value }: UrlQueryParams) {
  const currentUrl = qs.parse(params)
  currentUrl[key] = value
  return qs.stringifyUrl(
    { url: window.location.pathname, query: currentUrl },
    { skipNull: true }
  )
}

// Query-Params aus URL entfernen (Filter-Reset)
export function removeKeysFromQuery({ params, keysToRemove }: RemoveUrlQueryParams) {
  const currentUrl = qs.parse(params)
  keysToRemove.forEach((key) => delete currentUrl[key])
  return qs.stringifyUrl(
    { url: window.location.pathname, query: currentUrl },
    { skipNull: true }
  )
}