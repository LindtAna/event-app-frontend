
import * as z from "zod"
import type { TFunction } from "i18next"

// Schema zur Erstellung und Bearbeitung von Events
export const createEventFormSchema = (t: TFunction) =>
  z.object({
    title: z
      .string()
      .min(3, t("validation.event.titleMin"))
      .max(100, t("validation.event.titleMax")),

    description: z
      .string()
      .min(3, t("validation.event.descriptionMin"))
      .max(400, t("validation.event.descriptionMax")),

    location: z
      .string()
      .min(3, t("validation.event.locationMin"))
      .max(200, t("validation.event.locationMax")),

    imageUrl: z.string(),

    startDateTime: z.date({
      message: t("validation.event.startDateRequired"),
    }),

    endDateTime: z.date({
      message: t("validation.event.endDateRequired"),
    }),

    categoryId: z
      .string()
      .min(1, t("validation.event.categoryRequired")),

    url: z
      .string()
      .url(t("validation.event.invalidUrl"))
      .or(z.literal("")),
  }).refine((data) => data.endDateTime > data.startDateTime, {
    message: t("validation.event.endDateAfterStart"),
    path: ["endDateTime"],
  })

// Registrierungsschema für Owner und Member
export const createRegisterFormSchema = (t: TFunction) =>
  z
    .object({
      registrationType: z.enum(["owner", "member"]),

      name: z
        .string()
        .trim()
        .min(2, t("validation.register.nameMin")),

      email: z
        .string()
        .trim()
        .email(t("validation.register.invalidEmail")),

      password: z
        .string()
        .min(8, t("validation.register.passwordMin"))
        .refine(
          (password) => new TextEncoder().encode(password).length <= 72,
          t("validation.register.passwordMaxBytes"),
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
          message: t("validation.register.passwordMismatch"),
          path: ["confirmPassword"],
        })
      }

      if (
        data.registrationType === "owner" && !data.companyName?.trim()
      ) {
        ctx.addIssue({
          code: "custom",
          message: t("validation.register.companyNameRequired"),
          path: ["companyName"],
        })
      }

      if (
        data.registrationType === "member" && !data.invitationCode?.trim()
      ) {
        ctx.addIssue({
          code: "custom",
          message: t("validation.register.invitationCodeRequired"),
          path: ["invitationCode"],
        })
      }
    })

// Schema zur Profilbearbeitung
export const createProfileFormSchema = (t: TFunction) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(2, t("validation.profile.nameMin")),

    email: z
      .string()
      .trim()
      .email(t("validation.profile.invalidEmail")),

    bio: z
      .string()
      .max(200, t("validation.profile.bioMax"))
      .optional(),

    avatarUrl: z.string().optional(),
  })
