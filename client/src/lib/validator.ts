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
}).refine((data) => data.endDateTime > data.startDateTime, {
  message: "Das Enddatum muss nach dem Startdatum liegen",
  path: ["endDateTime"],
});

// Registrierungsschema für Owner und Member
export const registerFormSchema = z
  .object({
    registrationType: z.enum(["owner", "member"]),
    
    name: z.string().trim().min(2, "Name muss mindestens 2 Zeichen lang sein."),
    email: z.string().trim().email("Ungültige E-Mail-Adresse."),
    password: z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein.")
      .refine(
        (password) => new TextEncoder().encode(password).length <= 72,
        "Passwort darf maximal 72 Byte umfassen.",
      ),
confirmPassword: z.string(),
companyName: z.string().optional(),
invitationCode: z.string().optional(),
avatarUrl: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwörter stimmen nicht überein.",
        path: ["confirmPassword"],
      })
    }

    if (
      data.registrationType === "owner" && !data.companyName?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Bitte gib einen Teamnamen ein.",
        path: ["companyName"],
      })
    }

    if (
      data.registrationType === "member" && !data.invitationCode?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Bitte gib deinen Einladungscode ein.",
        path: ["invitationCode"],
      })
    }
  })

// Schema zur Profilbearbeitung
export const profileFormSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein."),
  email: z.string().email("Ungültige E-Mail-Adresse."),
  bio: z.string().max(200, "Bio darf maximal 200 Zeichen lang sein.").optional(),
  avatarUrl: z.string().optional(),
})