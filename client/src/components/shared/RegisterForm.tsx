import { useForm } from "react-hook-form"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { FileUploader } from "./FileUploader"

import { registerFormSchema } from "@/lib/validator"
import { registerDefaultValues } from "@/constants"
import { registerUser } from "@/api/auth"
import { uploadToCloudinary } from "@/api/upload"

import userIcon from '@/assets/icons/username.svg'
import mailIcon from '@/assets/icons/email.svg'
import lockIcon from '@/assets/icons/lock.svg'
import teamIcon from '@/assets/icons/team.svg'
import invitationIcon from '@/assets/icons/invitation.svg'

type RegistrationType = "owner" | "member"

type RegisterFormValues = z.infer<typeof registerFormSchema>

const RegisterForm = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const registrationType: RegistrationType =
    searchParams.get("type") === "member" ? "member" : "owner"

  const [files, setFiles] = useState<File[]>([])
  const [isRegistered, setIsRegistered] = useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      ...registerDefaultValues,
      registrationType,
      companyName: "",
      invitationCode: "",
    },
  })

  async function onSubmit(values: RegisterFormValues) {
    try {
      // Zuerst den Avatar zu Cloudinary hochladen, falls eine Datei ausgewählt wurde
      const avatarUrl = files.length > 0
        ? await uploadToCloudinary(files[0], "avatars")
        : values.avatarUrl?.trim() ?? ""

      const commonPayload = {
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        avatarUrl,
      }

      if (values.registrationType === "owner") {
        await registerUser({
          ...commonPayload,
          registrationType: "owner",
          companyName: values.companyName?.trim() ?? "",
        })
      } else {
        await registerUser({
          ...commonPayload,
          registrationType: "member",
          invitationCode: values.invitationCode?.trim() ?? "",
        })
      }

      // Die API registriert den Benutzer, meldet ihn aber nicht automatisch an
      setIsRegistered(true)
    } catch (error) {
      console.error("Registrierung fehlgeschlagen:", error)

      alert(
        error instanceof Error
          ? error.message
          : "Bei der Registrierung ist ein Fehler aufgetreten.",
      )
    }
  }
  if (isRegistered) {
    return (
      <div
        className="mx-auto max-w-2xl rounded-lg border border-primary-500/40 bg-white p-6 text-center shadow-sm md:p-10"
        role="status"
        aria-live="polite"
      >
        <h2 className="text-xl font-bold leading-tight md:text-2xl">
          Registrierung erfolgreich!
        </h2>

        <p className="mt-4 text-sm leading-relaxed text-secondary-dark md:text-base">
          Du hast dich erfolgreich registriert und kannst dich jetzt einloggen.
        </p>

        <Button
          type="button"
          className="mt-6 w-full rounded-lg bg-primary text-white hover:bg-primary-500 hover:text-black sm:w-auto sm:min-w-[180px]"
          size="lg"
          onClick={() =>
            navigate("/", {
              state: { openLoginModal: true },
            })
          }
        >
          Einloggen
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 max-w-4xl mx-auto">

        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">

          {/* avatar upload */}
          <div className="w-full md:w-1/2 aspect-square max-w-[320px] mx-auto md:mx-0">
            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem className="h-full w-full">
                  <FormControl className="h-full w-full">
                    <FileUploader
                      onFieldChange={field.onChange}
                      imageUrl={field.value || ''}
                      setFiles={setFiles}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Gemeinsame Felder und das modusabhängige Feld */}
          <div className="flex flex-col gap-5 w-full md:w-1/2">

            {/* Modusabhängige Feld */}
            {registrationType === "owner" ? (
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <div className="flex-center h-[54px] w-full overflow-hidden rounded-lg bg-primary-50 px-4 py-2">
                        <img src={teamIcon} alt="name" width={24} height={24} />
                        <Input
                          placeholder="Teamsname"
                          autoComplete="off"
                          {...field}
                          value={field.value ?? ""}
                          className="input-field"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="invitationCode"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <div className="flex-center h-[54px] w-full overflow-hidden rounded-lg bg-primary-50 px-4 py-2">
                        <img src={invitationIcon} alt="name" width={24} height={24} />
                        <Input
                          placeholder="Einladungscode"
                          autoComplete="off"
                          {...field}
                          value={field.value ?? ""}
                          className="input-field"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Gemeinsame Felder -> Name, Email, Password, comfirm Password */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-lg bg-primary-50 px-4 py-2">
                      <img src={userIcon} alt="name" width={24} height={24} />
                      <Input placeholder="Benutzername"
                        autoComplete="name"
                        {...field}
                        className="input-field" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-lg bg-primary-50 px-4 py-2">
                      <img src={mailIcon} alt="email" width={24} height={24} />
                      <Input placeholder="E-Mail"
                      autoComplete="email"
                        {...field}
                        className="input-field"
                        type="email" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-lg bg-primary-50 px-4 py-2">
                      <img src={lockIcon} alt="Password" width={24} height={24} />
                      <Input placeholder="Passwort (min. 8 Zeichen)"
                        autoComplete="new-password"
                        {...field}
                        className="input-field"
                        type="password" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-lg bg-primary-50 px-4 py-2">
                      <img src={lockIcon} alt="confirm password" width={24} height={24} />
                      <Input placeholder="Passwort bestätigen"
                      autoComplete="new-password"
                        {...field}
                        className="input-field"
                        type="password" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Steuerungstasten */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 w-full">
         
          <Button
            type="submit"
            className="w-full md:w-auto min-w-[140px] rounded-lg bg-primary hover:bg-primary-500 hover:text-black text-white"
            size="lg"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Wird verarbeitet...' : 'Registrieren'}
          </Button>

           <Button
            type="button"
            variant="outline"
            className="w-full md:w-auto min-w-[140px] rounded-lg border-secondary-dark bg-secondary hover:bg-secondary-dark hover:text-black text-white"
            size="lg"
            onClick={() => navigate('/')}
          >
            Abbrechen
          </Button>
        </div>

      </form>
    </Form>
  )
}

export default RegisterForm