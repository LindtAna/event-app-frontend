
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { getAllEvents } from "@/api/events";
import { getEventsByAttendee } from "@/api/attendees";
import { getCategories } from "@/api/categories";

import type { Event, Category, User } from "@/types";

import Home from "./Home";

// API-Funktionen mocken
vi.mock("@/api/events", () => ({
    getAllEvents: vi.fn(),
    deleteEvent: vi.fn(),
}));

vi.mock("@/api/attendees", () => ({
    getEventsByAttendee: vi.fn(),
    leaveEvent: vi.fn(),
}));

vi.mock("@/api/categories", () => ({
    getCategories: vi.fn(),
}));

// Authentifizierungsstatus steuern
vi.mock("@/hooks/useAuth", () => ({
    useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockGetAllEvents = vi.mocked(getAllEvents);
const mockGetEventsByAttendee = vi.mocked(getEventsByAttendee);
const mockGetCategories = vi.mocked(getCategories);

const ACCESS_TOKEN = "test-access-token";

const testUser: User = {
    id: 10,
    tenantId: 1,
    role: "member",
    name: "Test User",
    email: "user@example.com",
};

const testCategories: Category[] = [
    {
        id: "cat-tech",
        name: "Technologie",
    },
    {
        id: "cat-food",
        name: "Kochen",
    },
];

const techEvent: Event = {
    id: 101,
    ownerId: 20,
    title: "React Meetup",
    description: "A meetup for React developers",
    startDateTime: "2026-12-01T18:00:00Z",
    endDateTime: "2026-12-01T20:00:00Z",
    location: "Köln",
    imageUrl: "https://example.com/react.jpg",
    categoryId: "cat-tech",
    categories: [testCategories[0]],
    owner: {
        id: 20,
        tenantId: 1,
        role: "owner",
        name: "Event Organizer",
        email: "organizer@example.com",
    },
};

const advancedTechEvent: Event = {
    id: 102,
    ownerId: 20,
    title: "Advanced React Conference",
    description: "Advanced topics in React development",
    startDateTime: "2026-12-05T18:00:00Z",
    endDateTime: "2026-12-05T20:00:00Z",
    location: "Bonn",
    imageUrl: "https://example.com/conference.jpg",
    categoryId: "cat-tech",
    categories: [testCategories[0]],
    owner: {
        id: 20,
        tenantId: 1,
        role: "owner",
        name: "Event Organizer",
        email: "organizer@example.com",
    },
};

const foodEvent: Event = {
    id: 103,
    ownerId: 30,
    title: "Cooking Workshop",
    description: "A practical cooking workshop",
    startDateTime: "2026-12-10T18:00:00Z",
    endDateTime: "2026-12-10T20:00:00Z",
    location: "Düsseldorf",
    imageUrl: "https://example.com/cooking.jpg",
    categoryId: "cat-food",
    categories: [testCategories[1]],
    owner: {
        id: 30,
        tenantId: 1,
        role: "owner",
        name: "Workshop Organizer",
        email: "workshop@example.com",
    },
};

const testEvents: Event[] = [
    techEvent,
    advancedTechEvent,
    foodEvent,
];

// Aktuelle URL für Assertions sichtbar machen
const LocationSearch = () => {
    const location = useLocation();

    return (
        <output data-testid="location-search">
            {location.search}
        </output>
    );
};

// Home innerhalb eines echten Routers rendern
const renderHome = (initialEntry = "/") =>
    render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Home />
            <LocationSearch />
        </MemoryRouter>,
    );

// Aktuelle URL-Parameter abrufen
const getCurrentSearchParams = () =>
    new URLSearchParams(
        screen.getByTestId("location-search").textContent ?? "",
    );

// Radix Select über Pointer-Events bedienen
const selectCategory = async (categoryName: string) => {
    const trigger = screen.getByRole("combobox");

    fireEvent.pointerDown(trigger, {
        button: 0,
        ctrlKey: false,
        pointerType: "mouse",
    });

    const option = await screen.findByRole("option", {
        name: categoryName,
    });

    fireEvent.pointerMove(option, {
        pointerType: "mouse",
    });

    fireEvent.pointerUp(option, {
        button: 0,
        pointerType: "mouse",
    });
};

describe("Home integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockUseAuth.mockReturnValue({
            user: testUser,
            accessToken: ACCESS_TOKEN,
            isSignedIn: true,
            isLoading: false,
        } as ReturnType<typeof useAuth>);

        mockGetAllEvents.mockResolvedValue(testEvents);
        mockGetEventsByAttendee.mockResolvedValue([]);
        mockGetCategories.mockResolvedValue(testCategories);
    });

    it("loads events, attendee data and categories and displays all events", async () => {
        renderHome();

        // Auf die erfolgreiche Event-Ladung warten
        expect(
            await screen.findByText("React Meetup"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("Advanced React Conference"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("Cooking Workshop"),
        ).toBeInTheDocument();

        // API-Aufrufe mit den korrekten Parametern
        expect(mockGetAllEvents).toHaveBeenCalledWith(
            ACCESS_TOKEN,
        );

        expect(mockGetEventsByAttendee).toHaveBeenCalledWith(
            testUser.id,
            ACCESS_TOKEN,
        );

        expect(mockGetCategories).toHaveBeenCalledWith(
            ACCESS_TOKEN,
        );

        // Beide Event-Listen werden jeweils einmal geladen
        expect(mockGetAllEvents).toHaveBeenCalledTimes(1);
        expect(mockGetEventsByAttendee).toHaveBeenCalledTimes(1);
    });

    it("reads the search query from the URL and filters events case-insensitively", async () => {
        renderHome("/?query=rEaCt");

        // Das Suchfeld übernimmt den Wert aus der URL
        const searchInput = screen.getByPlaceholderText(
            "Event suchen...",
        );

        expect(searchInput).toHaveValue("rEaCt");

        // Beide React-Events werden angezeigt
        expect(
            await screen.findByText("React Meetup"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("Advanced React Conference"),
        ).toBeInTheDocument();

        // Events ohne passenden Titel werden ausgeblendet
        expect(
            screen.queryByText("Cooking Workshop"),
        ).not.toBeInTheDocument();
    });

    it("updates the URL when searching and resets the category filter", async () => {
        renderHome("/?category=cat-food");

        // Warten, bis die Events geladen wurden
        await screen.findByText("Cooking Workshop");

        const searchInput = screen.getByPlaceholderText(
            "Event suchen...",
        );

        // Suchbegriff eingeben
        fireEvent.change(searchInput, {
            target: { value: "React" },
        });

        // Debounce abwarten und URL-Änderung überprüfen
        await waitFor(() => {
            const params = getCurrentSearchParams();

            expect(params.get("query")).toBe("React");
            expect(params.has("category")).toBe(false);
        });

        // Die Suchergebnisse werden aktualisiert
        expect(
            screen.getByText("React Meetup"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("Advanced React Conference"),
        ).toBeInTheDocument();

        expect(
            screen.queryByText("Cooking Workshop"),
        ).not.toBeInTheDocument();

        // Eine Suche ohne Treffer führt zum Empty State
        fireEvent.change(searchInput, {
            target: { value: "Nonexistent Event" },
        });

        await waitFor(() => {
            expect(
                getCurrentSearchParams().get("query"),
            ).toBe("Nonexistent Event");
        });

        expect(
            await screen.findByText("Keine Veranstaltungen gefunden"),
        ).toBeInTheDocument();

        expect(
            screen.queryByText("React Meetup"),
        ).not.toBeInTheDocument();
    });

    it("filters events by category and removes the search query from the URL", async () => {
        renderHome("/?query=React");

        // Warten, bis die initialen Suchergebnisse sichtbar sind
        await screen.findByText("React Meetup");

        // Kategorie über das echte Radix Select auswählen
        await selectCategory("Technologie");

        await waitFor(() => {
            const params = getCurrentSearchParams();

            expect(params.get("category")).toBe("cat-tech");
            expect(params.has("query")).toBe(false);
        });

        // Alle Events der ausgewählten Kategorie werden angezeigt
        expect(
            screen.getByText("React Meetup"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("Advanced React Conference"),
        ).toBeInTheDocument();

        expect(
            screen.queryByText("Cooking Workshop"),
        ).not.toBeInTheDocument();
    });

    it("removes the category filter and displays all events again", async () => {
        renderHome("/?category=cat-tech");

        // Zunächst nur Events der Technologie-Kategorie
        expect(
            await screen.findByText("React Meetup"),
        ).toBeInTheDocument();

        expect(
            screen.queryByText("Cooking Workshop"),
        ).not.toBeInTheDocument();

        // Alle Kategorien auswählen
        await selectCategory("Alle Kategorien");

        await waitFor(() => {
            expect(
                getCurrentSearchParams().has("category"),
            ).toBe(false);
        });

        // Der vollständige Event-Überblick wird wieder angezeigt
        expect(
            screen.getByText("React Meetup"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("Advanced React Conference"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("Cooking Workshop"),
        ).toBeInTheDocument();
    });

    it("converts an old category name in the URL into its category ID", async () => {
        renderHome("/?category=tEcHnOlOgIe");

        // Das alte URL-Format wird durch die ID ersetzt
        await waitFor(() => {
            expect(
                getCurrentSearchParams().get("category"),
            ).toBe("cat-tech");
        });

        // Die Events der entsprechenden Kategorie werden angezeigt
        expect(
            await screen.findByText("React Meetup"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("Advanced React Conference"),
        ).toBeInTheDocument();

        expect(
            screen.queryByText("Cooking Workshop"),
        ).not.toBeInTheDocument();
    });
});
