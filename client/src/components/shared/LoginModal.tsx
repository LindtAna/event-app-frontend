import { useAuth } from "@/hooks/useAuth"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
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

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const navigate = useNavigate()

  const { login } = useAuth()

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  })

  if (!isOpen) return null

 async function onSubmit(values: z.infer<typeof loginFormSchema>) {
  try {
    const response = await fetch("http://localhost:8080/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: values.email,
        password: values.password,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Login fehlgeschlagen")
    }

    login(data.token)
    onClose()
  } catch (error) {
    console.error("Login Fehler:", error)
    // später shadcn-Toast mit Fehlermeldung für den Benutzer
    alert(error instanceof Error ? error.message : "Ein Fehler ist aufgetreten")
  }
}

  const handleRegisterRedirect = () => {
    onClose()
    navigate('/register')
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
                onClick={handleRegisterRedirect}
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
      </div>
    </div>
  )
}

export default LoginModal