import { useForm } from "react-hook-form";
import { useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { de } from "date-fns/locale";
import { enUS } from "date-fns/locale";
import { ru } from "date-fns/locale";

import { useTranslation } from "react-i18next";


import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useAuth } from "@/hooks/useAuth";
import { createEvent, updateEvent } from "@/api/events";
import { uploadToCloudinary } from "@/api/upload";
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate'

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import Dropdown from "./Dropdown";
import { FileUploader } from "./FileUploader";

import type { Event } from "@/types";
import { createEventFormSchema } from "@/lib/validator";
import { eventDefaultValues } from "@/constants";


import calendar from "@/assets/icons/calendar.svg";
import location from "@/assets/icons/location.svg";
import link from "@/assets/icons/link.svg";


// Registrierung der verfügbaren Kalender-Lokalisierungen
registerLocale("de", de);
registerLocale("en", enUS);
registerLocale("ru", ru);

type EventFormProps = {
    type: "Create" | "Update";
    event?: Event;
    eventId?: string;
};

const EventForm = ({ type, event, eventId }: EventFormProps) => {
    const navigate = useLocalizedNavigate()
    const { t, i18n } = useTranslation()
    const eventFormSchema = createEventFormSchema(t)

    const [files, setFiles] = useState<File[]>([]) // FileUploader
    const { accessToken } = useAuth();

     // Aktuelle Sprache für DatePicker bestimmen
    const currentLanguage = (
        i18n.resolvedLanguage ?? i18n.language
    ).split("-")[0];

    const datePickerLocale =
        currentLanguage === "en"
            ? "en"
            : currentLanguage === "ru"
                ? "ru"
                : "de";

    const dateFormat =
        datePickerLocale === "en"
            ? "MMM d, yyyy h:mm aa"
            : "dd.MM.yyyy HH:mm";

    const initialValues =
    event && type === "Update"
        ? {
            ...event,
            categoryId:
                event.categoryId ||
                ("category" in event &&
                event.category !== null &&
                typeof event.category === "object" &&
                "id" in event.category &&
                typeof event.category.id === "string"
                    ? event.category.id
                    : ""),
            startDateTime: new Date(event.startDateTime),
            endDateTime: new Date(event.endDateTime),
        }
        : eventDefaultValues;

    // Zod-Validierung via Resolver + Festlegung des Formulardatentyps
    const form = useForm<z.infer<typeof eventFormSchema>>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: initialValues,
    });


    // onSubmit erhält automatisch strikt typisierte und validierte Daten
    async function onSubmit(values: z.infer<typeof eventFormSchema>) {
        try {
            if (!accessToken) {
                alert(t("eventForm.sessionExpired"));
                return;
            }

            let uploadedImageUrl = values.imageUrl;
            // Hochladen des Eventfotos zu Cloudinary (sofern eine Datei hochgeladen wurde)
            if (files.length > 0) {
                uploadedImageUrl = await uploadToCloudinary(files[0]);
            }
            // Erstellen des Request-Bodys für das Go-Backend
            const isNewCategory = values.categoryId.startsWith("new:");


            const payload = {
                title: values.title,
                description: values.description,
                imageUrl: uploadedImageUrl || "",
                location: values.location,
                startDateTime: values.startDateTime.toISOString(),
                endDateTime: values.endDateTime.toISOString(),
                ...(isNewCategory
                    ? { categoryName: values.categoryId.slice(4) }
                    : { categoryId: values.categoryId }),
                url: values.url || "",
            };
            // Anfrage senden
            const savedEvent =
                type === "Create"
                    ? await createEvent(payload, accessToken)
                    : await updateEvent(eventId!, payload, accessToken);

            //Wechsel zum erstellten/aktualisierten Event
            if (type === "Create") {
                form.reset();
            }
            navigate(`/events/${savedEvent.id || eventId}`);
        } catch (error) {
            console.error(error);
            alert(
                error instanceof Error
                    ? error.message
                    : t("eventForm.genericError")
            );
        }
    }


    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-5"
            >
                <div className="flex flex-col gap-5 md:flex-row">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <Input
                                        placeholder={t("eventForm.titlePlaceholder")}
                                        {...field}
                                        className="input-field"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Dropdown-Komponente*/}
                    <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                            <FormItem className="w-full rounded-lg">
                                <FormControl>
                                    <Dropdown
                                        onChangeHandler={field.onChange}
                                        value={field.value}
                                        token={accessToken}
                                    />
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
                                    <Textarea
                                       placeholder={t("eventForm.descriptionPlaceholder")}
                                        {...field}
                                        className="textarea rounded-2xl"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* FileUploader-Komponente */}
                    <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <FileUploader
                                        onFieldChange={field.onChange}
                                        imageUrl={field.value}
                                        setFiles={setFiles}
                                    />
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
                                        <img src={location} alt="location" width={24} height={24} />
                                        <Input
                                            placeholder={t("eventForm.locationPlaceholder")}
                                            {...field}
                                            className="input-field"
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
                        name="startDateTime"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-lg bg-primary-50 bg-dotted-pattern bg-cover bg-center px-4 py-2">
                                        <img src={calendar} alt="calendar" width={24} height={24} />
                                        <p className="ml-3 whitespace-nowrap text-grey-500 text-sm">
                                            {t("eventForm.start")}
                                        </p>
                                        <DatePicker
                                            selected={field.value}
                                            onChange={(date: Date | null) => field.onChange(date)}
                                            showTimeSelect
                                            locale={datePickerLocale}
                                            timeCaption={t("eventForm.time")}
                                            dateFormat={dateFormat}
                                            popperPlacement="bottom-start"
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
                                        <img src={calendar} alt="calendar" width={24} height={24} />
                                        <p className="ml-3 whitespace-nowrap text-grey-500 text-sm">
                                            {t("eventForm.end")}
                                        </p>
                                        <DatePicker
                                            selected={field.value}
                                            onChange={(date: Date | null) => field.onChange(date)}
                                            showTimeSelect
                                            locale={datePickerLocale}
                                            timeCaption={t("eventForm.time")}
                                            dateFormat={dateFormat}
                                            popperPlacement="bottom-start"
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
                                        <img src={link} alt="link" width={24} height={24} />
                                        <Input
                                            placeholder="URL"
                                            {...field}
                                            className="input-field"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex flex-1 items-center justify-center py-4">
                    <Button
                        className="w-full sm:w-fit"
                        size="lg"
                        type="submit"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting
                            ? t("eventForm.saving")
                            : type === "Create"
                                ? t("eventForm.createSubmit")
                                : t("eventForm.save")}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default EventForm;
