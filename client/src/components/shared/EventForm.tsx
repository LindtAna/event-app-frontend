import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import type { Event } from "@/types"
import { eventFormSchema } from "@/lib/validator"

import calendar from '@/assets/icons/calendar.svg'
import location from '@/assets/icons/location.svg'
import link from '@/assets/icons/link.svg'


// TODO: Externe Standardwerte (eventDefaultValues) werden später aus constants importiert
// TODO: Dropdown- und FileUploader-Komponenten werden später erstellt und importiert

type EventFormProps = {
    userId: string
    type: "Create" | "Update"
    event?: Event
    eventId?: string
}

// Lokale Standardwerte für das Formular vor der Implementierung der Zod-Validierung
const defaultValues = {
    title: "",
    categoryId: "",
    description: "",
    imageUrl: "",
    location: "",
    startDateTime: new Date(),
    endDateTime: new Date(),
    url: "",
}

const EventForm = ({ userId, type, event, eventId }: EventFormProps) => {
    const navigate = useNavigate();

    const initialValues = event && type === 'Update'
        ? {
            ...event,
            startDateTime: new Date(event.startDateTime),
            endDateTime: new Date(event.endDateTime)
        }
        : defaultValues;

        // Zod-Validierung via Resolver + Festlegung des Formulardatentyps
    const form = useForm<z.infer<typeof eventFormSchema>>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: initialValues,
    })

    // onSubmit erhält automatisch strikt typisierte und validierte Daten
   async function onSubmit(values: z.infer<typeof eventFormSchema>) {
        console.log("Form Submitted!");
        console.log("Validated Values:", values);
        console.log("Current UserId:", userId);

        // Netzwerkanfrage simulieren
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // TODO: Später API-Anfrage an das Go-Backend senden
        if (type === 'Create') {
            form.reset();
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <div className="flex flex-col gap-5 md:flex-row">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <Input placeholder="Event-Titel" {...field} className="input-field" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Später -> Dropdown-Komponente*/}
                    <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <Input placeholder="Kategorie oder ID" {...field} className="input-field" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex flex-col gap-5 md:flex-row">
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl className="h-72">
                                    <Textarea placeholder="Beschreibung" {...field} className="textarea rounded-2xl" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Später -> FileUploader-Komponente */}
                    <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <Input placeholder="Bild-URL (http://...)" {...field} className="input-field" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex flex-col gap-5 md:flex-row">
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-lg bg-primary-50 bg-dotted-pattern bg-cover bg-center px-4 py-2">
                                        <img
                                            src={location}
                                            alt="location"
                                            width={24}
                                            height={24}
                                        />
                                        <Input placeholder="Veranstaltungsort oder Online" {...field} className="input-field" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex flex-col gap-5 md:flex-row">
                    <FormField
                        control={form.control}
                        name="startDateTime"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-lg bg-primary-50 bg-dotted-pattern bg-cover bg-center px-4 py-2">
                                        <img
                                            src={calendar}
                                            alt="calendar"
                                            width={24}
                                            height={24}
                                        />
                                        <p className="ml-3 whitespace-nowrap text-grey-500 text-sm">Beginn:</p>
                                        <DatePicker
                                            selected={field.value}
                                            onChange={(date: Date | null) => field.onChange(date)}
                                            showTimeSelect
                                            timeInputLabel="Time:"
                                            dateFormat="MM/dd/yyyy h:mm aa"
                                            wrapperClassName="datePicker"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="endDateTime"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-lg bg-primary-50 bg-dotted-pattern bg-cover bg-center px-4 py-2">
                                        <img src={calendar}
                                            alt="calendar"
                                            width={24}
                                            height={24}
                                        />
                                        <p className="ml-3 whitespace-nowrap text-grey-500 text-sm">Ende:</p>
                                        <DatePicker
                                            selected={field.value}
                                            onChange={(date: Date | null) => field.onChange(date)}
                                            showTimeSelect
                                            timeInputLabel="Time:"
                                            dateFormat="MM/dd/yyyy h:mm aa"
                                            wrapperClassName="datePicker"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex flex-col gap-5 md:flex-row">
                    <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-lg bg-grey-50 px-4 py-2">
                                        <img
                                            src={link}
                                            alt="link"
                                            width={24}
                                            height={24}
                                        />
                                        <Input placeholder="URL" {...field} className="input-field" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex flex-1 items-center justify-center py-4">
                    <Button
                        className="w-full sm:w-fit" size="lg"
                        type="submit"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting
                            ? 'Wird gespeichert...'
                            : type === 'Create'
                                ? 'Los geht’s!'
                                : 'Event korrigieren'
                        }
                    </Button>
                </div>
            </form>
        </Form>
    )
}

export default EventForm