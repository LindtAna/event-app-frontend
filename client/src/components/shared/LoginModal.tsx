import { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useAuth } from "@/hooks/useAuth"
import { loginUser } from "@/api/auth"
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate"

import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import mailIcon from '@/assets/icons/email.svg'
import lockIcon from '@/assets/icons/lock.svg'
import seeIcon from "@/assets/icons/see.svg"
import dontSeeIcon from "@/assets/icons/dont-see.svg"


type LoginModalProps = {
  isOpen: boolean
  onClose: () => void
}

type ModalView = "login" | "registration-choice"
type RegistrationType = "owner" | "member"

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const { t } = useTranslation()
  const navigate = useLocalizedNavigate()

  const { setAuth } = useAuth()

  const [view, setView] = useState<ModalView>("login")
  const [showPassword, setShowPassword] = useState(false)

  const loginFormSchema = z.object({
    email: z.string().email(t("validation.login.invalidEmail")),
    password: z.string().min(1, t("validation.login.passwordRequired")),
  })

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  })

  const handleClose = () => {
    setView("login")
    setShowPassword(false)
    onClose()
  }
  if (!isOpen) return null

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    try {
      const data = await loginUser(values)

      setAuth(data.user, data.accessToken)
      handleClose()
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : t("loginModal.genericError"),
      )
    }
  }

  const handleShowRegistrationOptions = () => {
    setView("registration-choice")
  }

  const handleRegistrationRedirect = (type: RegistrationType) => {
    setView("login")
    setShowPassword(false)
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
          onClick={handleClose}
          aria-label={t("loginModal.close")}
        >
          <XIcon className="size-6" />
        </Button>

        {view === "login" ? (
          <>
            <div className="mb-6 text-center">
              <h2 className="text-[18px] font-bold leading-tight md:text-[20px] lg:text-[24px] text-center">
                {t("loginModal.title")}</h2>
              <p className="p-medium-12 md:p-regular-16 text-secondary-dark mt-2">
              {t("loginModal.subtitle")}</p>
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
                          <img src={mailIcon} alt="" width={24} height={24} />
                          <Input 
                          placeholder="example@example.com" 
                          {...field}
                            className="input-field placeholder:text-xs md:placeholder:text-sm"
                            type="email"
                            autoComplete="email"
                          />
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
                          <img src={lockIcon} alt="" width={24} height={24} />
                          <Input placeholder="********"
                            {...field}
                            className="input-field flex-1 !pr-0"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="flex-center h-8 w-8 shrink-0 rounded-md transition-colors hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <img
                              src={showPassword ? seeIcon : dontSeeIcon }
                              alt=""
                              className="size-6 md:size-9"
                            />
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-center text-sm p-medium-12 md:p-regular-16 text-secondary-dark mt-2">
                  {t("loginModal.noAccount")}{" "}
                  <span
                    className="cursor-pointer font-semibold p-medium-12 md:p-regular-16 text-primary-500 hover:underline"
                    onClick={handleShowRegistrationOptions}
                  >
                    {t("loginModal.registerHere")}
                  </span>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-lg bg-primary hover:bg-primary-500 hover:text-black text-white"
                  size="lg"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? t("loginModal.loading")
                    : t("loginModal.submit")}
                </Button>
              </form>
            </Form>
          </>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h2 className="text-[18px] font-bold leading-tight md:text-[20px] lg:text-[24px]">
                {t("loginModal.registrationTitle")}
              </h2>

              <p className="p-medium-12 md:p-regular-16 mt-2">
                 {t("loginModal.registrationSubtitle")}
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
                  {t("loginModal.createTeam")}
                </Button>

                <p className="text-center text-xs md:text-sm leading-relaxed text-secondary-dark">
                  {t("loginModal.createTeamDescription")}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  className="w-full whitespace-normal rounded-lg bg-primary py-6 text-white hover:bg-primary-500 hover:text-black"
                  size="lg"
                  onClick={() => handleRegistrationRedirect("member")}
                >
                  {t("loginModal.joinTeam")}
                </Button>

                <p className="text-center text-xs md:text-sm leading-relaxed text-secondary-dark">
                  {t("loginModal.joinTeamDescription")}
                </p>
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              {t("loginModal.alreadyHaveAccount")}{" "}
              <button
                type="button"
                className="cursor-pointer font-semibold text-primary hover:underline"
                onClick={handleBackToLogin}
              >
                 {t("loginModal.backToLogin")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default LoginModal