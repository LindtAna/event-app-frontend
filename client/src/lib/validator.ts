import * as z from "zod"

export const eventFormSchema = z.object({
  title: z
    .string()
    .min(3, 'Titel muss mindestens 3 Zeichen lang sein')
    .max(100, 'Titel darf maximal 100 Zeichen lang sein'),
  
  description: z
    .string()
    .min(3, 'Beschreibung muss mindestens 3 Zeichen lang sein')
    .max(400, 'Beschreibung darf maximal 400 Zeichen lang sein'),
  
  location: z
    .string()
    .min(3, 'Ort muss mindestens 3 Zeichen lang sein')
    .max(200, 'Ort darf maximal 200 Zeichen lang sein'),
  
  imageUrl: z.string(),
  
  startDateTime: z.date({
    message: 'Bitte wähle ein Startdatum aus',
  }),
  
  endDateTime: z.date({
    message: 'Bitte wähle ein Enddatum aus',
  }),
  
  categoryId: z.string().min(1, 'Bitte wähle eine Kategorie aus'),
  
  url: z.string().url('Ungültige URL').or(z.literal('')),
})