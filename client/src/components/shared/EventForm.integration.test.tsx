
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuth } from "@/hooks/useAuth";
import { createEvent, updateEvent } from "@/api/events";
import { uploadToCloudinary } from "@/api/upload";
import type { Event } from "@/types";

import EventForm from "./EventForm";

// API-Funktionen werden gemockt, während die übrigen Modulexporte erhalten bleiben
vi.mock("@/api/events", () => ({
    createEvent: vi.fn(),
    updateEvent: vi.fn(),
}));

vi.mock("@/api/upload", () => ({
    uploadToCloudinary: vi.fn(),
}));

// Den Autorisierungszustand in Tests verwalten
vi.mock("@/hooks/useAuth", () => ({
    useAuth: vi.fn(),
}));

// Dropdown: Die Möglichkeit, eine Kategorie auszuwählen, bleibt erhalten
vi.mock("./Dropdown", () => ({
    default: ({
        value,
        onChangeHandler,
    }: {
        value?: string;
        onChangeHandler?: (value: string) => void;
    }) => (
        <select
            aria-label="Kategorie"
            value={value ?? ""}
            onChange={(event) => onChangeHandler?.(event.target.value)}
        >
            <option value="">Kategorie auswählen</option>
            <option value="1">Musik</option>
        </select>
    ),
}));

// simulieren die Dateiauswahl ohne echtes Drag & Drop
vi.mock("./FileUploader", () => ({
    FileUploader: ({
        onFieldChange,
        setFiles,
    }: {
        onFieldChange: (url: string) => void;
        setFiles: React.Dispatch<React.SetStateAction<File[]>>;
    }) => (
        <input
            type="file"
            aria-label="Eventbild"
            onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                    setFiles([file]);
                    onFieldChange("blob:preview");
                }
            }}
        />
    ),
}));

// DatePicker: ein vereinfachter, kontrollierter Input
vi.mock("react-datepicker", () => ({
    default: ({
        selected,
        onChange,
    }: {
        selected: Date;
        onChange: (date: Date | null) => void;
    }) => (
        <input
            type="datetime-local"
            aria-label="Datum"
            value={
                selected instanceof Date && !Number.isNaN(selected.getTime())
                    ? selected.toISOString().slice(0, 16)
                    : ""
            }
            onChange={(event) =>
                onChange(
                    event.target.value ? new Date(event.target.value) : null,
                )
            }
        />
    ),
    registerLocale: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockCreateEvent = vi.mocked(createEvent);
const mockUpdateEvent = vi.mocked(updateEvent);
const mockUploadToCloudinary = vi.mocked(uploadToCloudinary);

const ACCESS_TOKEN = "test-access-token";

const testEvent: Event = {
    id: 42,
    ownerId: 1,
    title: "Existing Event",
    description: "Existing event description",
    location: "Cologne",
    imageUrl: "https://example.com/old-image.jpg",
    startDateTime: "2027-01-10T10:00:00.000Z",
    endDateTime: "2027-01-10T12:00:00.000Z",
    categoryId: "1",
    url: "https://example.com",
};

const testPayload = {
    title: "Test Event",
    description: "A description for testing",
    location: "Cologne",
    imageUrl: "",
    startDateTime: new Date("2027-01-10T10:00:00").toISOString(),
    endDateTime: new Date("2027-01-10T12:00:00").toISOString(),
    categoryId: "1",
    url: "https://example.com",
};

// Zeigt die aktuelle URL zur Überprüfung der Navigation an
const LocationDisplay = () => {
    const location = useLocation();

    return (
        <output data-testid="current-location">
            {location.pathname}
        </output>
    );
};

// Wir rendern ein echtes EventForm innerhalb von React Router
const renderEventForm = (
    type: "Create" | "Update" = "Create",
    event?: Event,
    eventId?: string,
) =>
    render(
        <MemoryRouter initialEntries={["/events/create"]}>
            <EventForm type={type} event={event} eventId={eventId} />
            <LocationDisplay />
        </MemoryRouter>,
    );

//das Formular wird mit gültigen Daten ausgefüllt
const fillValidForm = () => {
    fireEvent.change(screen.getByPlaceholderText("Event-Titel"), {
        target: { value: testPayload.title },
    });

    fireEvent.change(screen.getByPlaceholderText("Beschreibung"), {
        target: { value: testPayload.description },
    });

    fireEvent.change(screen.getByLabelText("Kategorie"), {
        target: { value: testPayload.categoryId },
    });

    fireEvent.change(
        screen.getByPlaceholderText("Veranstaltungsort oder Online"),
        {
            target: { value: testPayload.location },
        },
    );

    fireEvent.change(screen.getAllByLabelText("Datum")[0], {
        target: { value: "2027-01-10T10:00" },
    });

    fireEvent.change(screen.getAllByLabelText("Datum")[1], {
        target: { value: "2027-01-10T12:00" },
    });

    fireEvent.change(screen.getByPlaceholderText("URL"), {
        target: { value: testPayload.url },
    });
};

//das Formular wird direkt abgesendet
const submitForm = () => {
    const button = screen.getByRole("button", {
        name: /Los geht’s!|Speichern/,
    });

    const form = button.closest("form");

    expect(form).not.toBeNull();

    fireEvent.submit(form!);
};

describe("EventForm integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockUseAuth.mockReturnValue({
            accessToken: ACCESS_TOKEN,
        } as ReturnType<typeof useAuth>);
    });

    it("creates an event successfully and navigates to the event page", async () => {
        mockCreateEvent.mockResolvedValue({
            ...testEvent,
            id: 42,
        });

        renderEventForm();

        fillValidForm();
        submitForm();

        await waitFor(() => {
            expect(mockCreateEvent).toHaveBeenCalledWith(
                testPayload,
                ACCESS_TOKEN,
            );
        });

        expect(
            await screen.findByTestId("current-location"),
        ).toHaveTextContent("/events/42");

        expect(mockUpdateEvent).not.toHaveBeenCalled();
    });

    it("updates an existing event successfully and navigates to its page", async () => {
        const updatedEventId = "42";

        mockUpdateEvent.mockResolvedValue({
            ...testEvent,
            title: testPayload.title,
        });

        renderEventForm("Update", testEvent, updatedEventId);

        fillValidForm();
        submitForm();

        await waitFor(() => {
            expect(mockUpdateEvent).toHaveBeenCalledWith(
                updatedEventId,
                {
                    ...testPayload,
                    startDateTime: "2027-01-10T10:00:00.000Z",
                    endDateTime: "2027-01-10T12:00:00.000Z",
                    imageUrl: "https://example.com/old-image.jpg",
                },
                "test-access-token",
            );
        });

        expect(
            await screen.findByTestId("current-location"),
        ).toHaveTextContent("/events/42");

        expect(mockCreateEvent).not.toHaveBeenCalled();
    });

    it("validates form fields without sending an API request", async () => {
        renderEventForm();

       // Fehlerhafte Überschrift und Fehlen der übrigen erforderlichen Daten
        fireEvent.change(screen.getByPlaceholderText("Event-Titel"), {
            target: { value: "AB" },
        });

        submitForm();

        expect(
            await screen.findByText(
                "Titel muss mindestens 3 Zeichen lang sein",
            ),
        ).toBeInTheDocument();

        expect(mockCreateEvent).not.toHaveBeenCalled();
        expect(mockUpdateEvent).not.toHaveBeenCalled();
        expect(mockUploadToCloudinary).not.toHaveBeenCalled();

        expect(screen.getByTestId("current-location")).toHaveTextContent(
            "/events/create",
        );
    });

    it("uploads an image and includes the uploaded URL in the event payload", async () => {
        const uploadedImageUrl =
            "https://res.cloudinary.com/test/image/upload/event.jpg";

        const testFile = new File(
            ["test image content"],
            "event.jpg",
            { type: "image/jpeg" },
        );

        mockUploadToCloudinary.mockResolvedValue(uploadedImageUrl);

        mockCreateEvent.mockResolvedValue({
            ...testEvent,
            id: 42,
            imageUrl: uploadedImageUrl,
        });

        renderEventForm();

        fillValidForm();

        fireEvent.change(screen.getByLabelText("Eventbild"), {
            target: {
                files: [testFile],
            },
        });

        submitForm();

        await waitFor(() => {
            expect(mockUploadToCloudinary).toHaveBeenCalledWith(testFile);
        });

        const expectedPayload = {
            ...testPayload,
            imageUrl: uploadedImageUrl,
        };

        await waitFor(() => {
            expect(mockCreateEvent).toHaveBeenCalledWith(
                expectedPayload,
                ACCESS_TOKEN,
            );
        });

        expect(
            await screen.findByTestId("current-location"),
        ).toHaveTextContent("/events/42");
    });

    it("displays a warning and does not call the API when accessToken is missing", async () => {
        const alertMock = vi
            .spyOn(window, "alert")
            .mockImplementation(() => { });

        mockUseAuth.mockReturnValue({
            accessToken: null,
        } as ReturnType<typeof useAuth>);

        renderEventForm();

        fillValidForm();
        submitForm();

        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith(
                "Deine Sitzung ist nicht aktiv. Bitte melde dich erneut an.",
            );
        });

        expect(mockCreateEvent).not.toHaveBeenCalled();
        expect(mockUpdateEvent).not.toHaveBeenCalled();
        expect(mockUploadToCloudinary).not.toHaveBeenCalled();

        expect(screen.getByTestId("current-location")).toHaveTextContent(
            "/events/create",
        );
    });

    it("displays an error when saving fails and does not navigate", async () => {
        const alertMock = vi
            .spyOn(window, "alert")
            .mockImplementation(() => { });

        mockCreateEvent.mockRejectedValue(
            new Error("Fehler beim Speichern des Events"),
        );

        renderEventForm();

        fillValidForm();
        submitForm();

        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith(
                "Fehler beim Speichern des Events",
            );
        });

        expect(mockCreateEvent).toHaveBeenCalledTimes(1);

        expect(screen.getByTestId("current-location")).toHaveTextContent(
            "/events/create",
        );

        expect(mockUpdateEvent).not.toHaveBeenCalled();
    });
});
