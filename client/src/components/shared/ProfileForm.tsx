import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import type { User } from "@/types"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileUploader } from "./FileUploader"

import userIcon from '@/assets/icons/username.svg'
import mailIcon from '@/assets/icons/email.svg'

const profileFormSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein."),
  email: z.string().email("Ungültige E-Mail-Adresse."),
  bio: z.string().max(200, "Bio darf maximal 200 Zeichen lang sein.").optional(),
  avatarUrl: z.string().optional(),
})

type ProfileFormProps = {
  userId: number | string
  type: "Create" | "Update"
  user?: User
}

const ProfileForm = ({ userId, type, user }: ProfileFormProps) => {
  const navigate = useNavigate()
  const [files, setFiles] = useState<File[]>([])

  const initialValues = user && type === 'Update'
    ? {
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || ''
      }
    : { name: '', email: '', bio: '', avatarUrl: '' }

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: initialValues,
  })

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    console.log("Profile Form Submitted!", values)
    const formData = new FormData()
    if (files.length > 0) formData.append('file', files[0])

    await new Promise((resolve) => setTimeout(resolve, 1000))
    navigate('/profile')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 max-w-3xl mx-auto">
        
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-stretch">
          
          {/* linkeseite - Avatar upload*/}
          <div className="w-full md:w-1/2 aspect-square max-w-[320px]">
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

          {/* rechte seite - Name + email*/}
          <div className="flex flex-col justify-center gap-5 w-full md:w-1/2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-lg bg-primary-50 px-4 py-2">
                      <img src={userIcon} alt="name" width={24} height={24} />
                      <Input placeholder="Name" {...field} className="input-field" />
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
                      <Input placeholder="E-Mail" {...field} className="input-field" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Bio*/}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Textarea 
                  placeholder="Kurzbiografie / Rolle" 
                  {...field} 
                  className="textarea h-36 rounded-2xl bg-primary-50 border-none p-4 resize-none focus-visible:ring-1 focus-visible:ring-primary-500" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

       {/* Steuerungstasten */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full">
          <Button
            type="submit"
            className="w-full sm:w-auto min-w-[140px] rounded-lg bg-primary hover:bg-primary-500 hover:text-black text-white"
            size="lg"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Wird gespeichert...' : 'Speichern'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto min-w-[140px] rounded-lg border-secondary-dark bg-secondary hover:bg-secondary-dark hover:text-black text-white"
            size="lg"
            onClick={() => navigate('/profile')}
          >
            Abbrechen
          </Button>
          
        </div>

      </form>
    </Form>
  )
}

export default ProfileForm