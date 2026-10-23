import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import { useAuth } from "@/hooks/useAuth"
import { loginUser } from "@/api/auth"

import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import mailIcon from '@/assets/icons/email.svg'
import lockIcon from '@/assets/icons/lock.svg' 

const loginFormSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse."),
  password: z.string().min(1, "Passwort ist erforderlich."),
})

type LoginModalProps = {
  isOpen: boolean
  onClose: () => void
}

type ModalView = "login" | "registration-choice"
type RegistrationType = "owner" | "member"

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const navigate = useNavigate()
  const { setAuth } = useAuth()

   const [view, setView] = useState<ModalView>("login")

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  })

  // Bei erneutem Öffnen immer die Login-Ansicht anzeigen.
  useEffect(() => {
    if (isOpen) {
      setView("login")
    }
  }, [isOpen])

  if (!isOpen) return null

async function onSubmit(values: z.infer<typeof loginFormSchema>) {
  try {
    const data = await loginUser(values)

    setAuth(data.user, data.accessToken)
    onClose()
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : "Ein Fehler ist aufgetreten",
    )
  }
}

const handleShowRegistrationOptions = () => {
    setView("registration-choice")
  }

   const handleRegistrationRedirect = (type: RegistrationType) => {
    onClose()
    navigate(`/register?type=${type}`)
  }

  const handleBackToLogin = () => {
    setView("login")
  }

  return (
    <div className="fixed inset-0 z-50 px-6 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg bg-white border border-primary-500/70 p-6 shadow-lg md:p-8">
        
     
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          className="absolute right-3 top-3"
          onClick={onClose}
        >
          <XIcon className="size-6" />
        </Button>

      {view === "login" ? (
          <> 
        <div className="mb-6 text-center">
          <h2 className="text-[18px] font-bold leading-tight md:text-[20px] lg:text-[24px] text-center">Anmelden</h2>
          <p className="p-medium-12 md:p-regular-16 text-secondary-dark mt-2">Bitte melde dich an</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-lg bg-primary-50 bg-dotted-pattern bg-cover bg-center px-4 py-2">
                      <img src={mailIcon} alt="email" width={24} height={24} />
                      <Input placeholder="example@example.com" {...field} className="input-field" type="email" />
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
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-lg bg-primary-50 bg-dotted-pattern bg-cover bg-center px-4 py-2">
                      <img src={lockIcon} alt="password" width={24} height={24} />
                      <Input placeholder="********" {...field} className="input-field" type="password" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-center text-sm p-medium-12 md:p-regular-16 text-secondary-dark mt-2">
              Noch kein Account?{' '}
              <span
                className="cursor-pointer font-semibold p-medium-12 md:p-regular-16 text-primary-500 hover:underline"
                onClick={handleShowRegistrationOptions}
              >
                Hier klicken
              </span>
            </div>

            <Button
              type="submit"
              className="w-full rounded-lg bg-primary hover:bg-primary-500 hover:text-black text-white"
              size="lg"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Laden...' : 'Einloggen'}
            </Button>
          </form>
        </Form>
        </>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h2 className="text-[18px] font-bold leading-tight md:text-[20px] lg:text-[24px]">
                Account erstellen
              </h2>

              <p className="p-medium-12 md:p-regular-16 mt-2">
                Wie möchtest du PlanFuchs nutzen?
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  className="w-full whitespace-normal rounded-lg bg-primary py-6 text-white hover:bg-primary-500 hover:text-black"
                  size="lg"
                  onClick={() => handleRegistrationRedirect("owner")}
                >
                  Neues Team erstellen
                </Button>

                <p className="text-center text-xs md:text-sm leading-relaxed text-secondary-dark">
                  Erstelle einen neuen Bereich für dein Unternehmen und
                  verwalte ihn als Admin.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  className="w-full whitespace-normal rounded-lg bg-primary py-6 text-white hover:bg-primary-500 hover:text-black"
                  size="lg"
                  onClick={() => handleRegistrationRedirect("member")}
                >
                  Mit Einladung beitreten
                </Button>

                <p className="text-center text-xs md:text-sm leading-relaxed text-secondary-dark">
                  Mit einem Einladungscode kannst du einem bestehenden
                  Team beitreten.
                </p>
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              Du hast bereits einen Account?{" "}
              <button
                type="button"
                className="cursor-pointer font-semibold text-primary hover:underline"
                onClick={handleBackToLogin}
              >
                Zurück zur Anmeldung
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default LoginModal