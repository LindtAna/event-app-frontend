import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { FileUploader } from "./FileUploader"

import { registerFormSchema } from "@/lib/validator"
import { registerDefaultValues } from "@/constants"

import userIcon from '@/assets/icons/username.svg'
import mailIcon from '@/assets/icons/email.svg'
import lockIcon from '@/assets/icons/lock.svg' 


const RegisterForm = () => {
  const navigate = useNavigate()
  const [files, setFiles] = useState<File[]>([])

  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: registerDefaultValues,
  })

  async function onSubmit(values: z.infer<typeof registerFormSchema>) {
  try {
    const response = await fetch("http://localhost:8080/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        password: values.password,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Registrierung fehlgeschlagen")
    }

    console.log("Erfolgreich registriert!", data)
    navigate('/')
  } catch (error) {
    console.error("Registrierung Fehler:", error)
    alert(error instanceof Error ? error.message : "Ein Fehler ist aufgetreten")
  }
}

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 max-w-4xl mx-auto">
        
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

          {/* Name, Email, Password, Confirm Password */}
          <div className="flex flex-col gap-5 w-full md:w-1/2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-lg bg-primary-50 px-4 py-2">
                      <img src={userIcon} alt="name" width={24} height={24} />
                      <Input placeholder="Benutzername" {...field} className="input-field" />
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
                      <Input placeholder="E-Mail" {...field} className="input-field" type="email" />
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
                      <img src={lockIcon} alt="password" width={24} height={24} />
                      <Input placeholder="Passwort (min. 7 Zeichen)" {...field} className="input-field" type="password" />
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
                      <Input placeholder="Passwort bestätigen" {...field} className="input-field" type="password" />
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
            type="button"
            variant="outline"
            className="w-full md:w-auto min-w-[140px] rounded-lg border-secondary-dark bg-secondary hover:bg-secondary-dark hover:text-black text-white"
            size="lg"
            onClick={() => navigate('/')}
          >
            Abbrechen
          </Button>
          <Button
            type="submit"
            className="w-full md:w-auto min-w-[140px] rounded-lg bg-primary hover:bg-primary-500 hover:text-black text-white"
            size="lg"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Wird verarbeitet...' : 'Registrieren'}
          </Button>
        </div>

      </form>
    </Form>
  )
}

export default RegisterForm