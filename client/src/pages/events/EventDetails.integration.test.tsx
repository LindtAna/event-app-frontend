
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuth } from "@/hooks/useAuth";
import { getEventById } from "@/api/events";
import {
    getEventAttendees,
    addEventAttendee,
} from "@/api/attendees";

import type { Event, User } from "@/types";

import EventDetails from "./EventDetails";

// API-Funktionen mocken
vi.mock("@/api/events", () => ({
    getEventById: vi.fn(),
}));

vi.mock("@/api/attendees", () => ({
    getEventAttendees: vi.fn(),
    addEventAttendee: vi.fn(),
}));

// Authentifizierungsstatus steuern
vi.mock("@/hooks/useAuth", () => ({
    useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockGetEventById = vi.mocked(getEventById);
const mockGetEventAttendees = vi.mocked(getEventAttendees);
const mockAddEventAttendee = vi.mocked(addEventAttendee);

const ACCESS_TOKEN = "test-access-token";

const testUser: User = {
    id: 10,
    tenantId: 1,
    role: "member",
    name: "Test User",
    email: "test@example.com",
};

const testAttendee: User = {
    id: 20,
    tenantId: 1,
    role: "member",
    name: "Another Attendee",
    email: "attendee@example.com",
};

const testEvent: Event = {
    id: 42,
    ownerId: 1,
    title: "Test Event",
    description: "Description of the test event",
    location: "Cologne",
    imageUrl: "https://example.com/event.jpg",
    startDateTime: "2027-01-10T10:00:00.000Z",
    endDateTime: "2027-01-10T12:00:00.000Z",
    categoryName: "Music",
    owner: {
        id: 1,
        tenantId: 1,
        role: "owner",
        name: "Event Organizer",
        email: "organizer@example.com",
    },
};

// EventDetails innerhalb einer echten Router-Route rendern
const renderEventDetails = () =>
    render(
        <MemoryRouter initialEntries={["/events/42"]}>
            <Routes>
                <Route
                    path="/events/:id"
                    element={<EventDetails />}
                />
            </Routes>
        </MemoryRouter>,
    );

describe("EventDetails integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockUseAuth.mockReturnValue({
            user: testUser,
            accessToken: ACCESS_TOKEN,
            isSignedIn: true,
            isLoading: false,
        } as ReturnType<typeof useAuth>);

        mockGetEventById.mockResolvedValue(testEvent);
        mockGetEventAttendees.mockResolvedValue([testAttendee]);

        // Standardmäßig erfolgreiche Anmeldung
        mockAddEventAttendee.mockResolvedValue({
            userId: testUser.id,
            eventId: testEvent.id,
        });
    });

    it("loads and displays the event and its attendees", async () => {
        renderEventDetails();

        expect(
            await screen.findByRole("heading", {
                name: "Test Event",
            }),
        ).toBeInTheDocument();

        expect(screen.getByText("Event Organizer")).toBeInTheDocument();
        expect(screen.getByText("Description of the test event")).toBeInTheDocument();
        expect(screen.getByText("Cologne")).toBeInTheDocument();

        expect(
            await screen.findByRole("button", {
                name: "Another Attendee",
            }),
        ).toBeInTheDocument();

        expect(mockGetEventById).toHaveBeenCalledWith(
            "42",
            ACCESS_TOKEN,
        );

        expect(mockGetEventAttendees).toHaveBeenCalledWith(
            "42",
            ACCESS_TOKEN,
        );
    });

    it("handles an empty attendee list returned as null", async () => {
        mockGetEventAttendees.mockResolvedValue(null as unknown as User[]);

        renderEventDetails();

        expect(
            await screen.findByRole("heading", {
                name: "Test Event",
            }),
        ).toBeInTheDocument();

        expect(
            await screen.findByText("Noch keine Teilnehmer."),
        ).toBeInTheDocument();

        expect(screen.getByText("Teilnehmer (0)")).toBeInTheDocument();
    });

    it("displays an error when loading the event fails", async () => {
        vi.spyOn(console, "error").mockImplementation(() => { });

        mockGetEventById.mockRejectedValue(
            new Error("Event konnte nicht geladen werden"),
        );

        renderEventDetails();

        expect(
            await screen.findByText(
                "Event konnte nicht geladen werden.",
            ),
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("heading", {
                name: "Test Event",
            }),
        ).not.toBeInTheDocument();
    });

    it("displays an error when loading attendees fails but keeps the event visible", async () => {
        vi.spyOn(console, "error").mockImplementation(() => { });

        mockGetEventAttendees.mockRejectedValue(
            new Error("Attendees request failed"),
        );

        renderEventDetails();

        expect(
            await screen.findByRole("heading", {
                name: "Test Event",
            }),
        ).toBeInTheDocument();

        expect(
            await screen.findByText(
                "Teilnehmer konnten nicht geladen werden.",
            ),
        ).toBeInTheDocument();
    });

    it("displays an authentication message and does not call the APIs without an access token", async () => {
        mockUseAuth.mockReturnValue({
            user: null,
            accessToken: null,
            isSignedIn: false,
            isLoading: false,
        } as ReturnType<typeof useAuth>);

        renderEventDetails();

        expect(
            await screen.findByText(
                "Bitte melde dich an, um dieses Event anzusehen.",
            ),
        ).toBeInTheDocument();

        expect(mockGetEventById).not.toHaveBeenCalled();
        expect(mockGetEventAttendees).not.toHaveBeenCalled();
    });

    it("registers the current user and updates the attendee list", async () => {
        mockGetEventAttendees
            .mockResolvedValueOnce([testAttendee])
            .mockResolvedValueOnce([testAttendee, testUser]);

        renderEventDetails();

        const joinButton = await screen.findByRole("button", {
            name: "Teilnehmen",
        });

        fireEvent.click(joinButton);

        await waitFor(() => {
            expect(mockAddEventAttendee).toHaveBeenCalledWith(
                testEvent.id,
                testUser.id,
                ACCESS_TOKEN,
            );
        });

        expect(
            await screen.findByRole("button", {
                name: "Du nimmst teil",
            }),
        ).toBeDisabled();

        expect(
            screen.getByRole("button", {
                name: "Test User",
            }),
        ).toBeInTheDocument();

        expect(mockGetEventAttendees).toHaveBeenCalledTimes(2);
    });

    it("displays an error when joining the event fails", async () => {
        vi.spyOn(console, "error").mockImplementation(() => { });

        mockAddEventAttendee.mockRejectedValue(
            new Error("Anmeldung fehlgeschlagen"),
        );

        renderEventDetails();

        const joinButton = await screen.findByRole("button", {
            name: "Teilnehmen",
        });

        fireEvent.click(joinButton);

        expect(
            await screen.findByRole("alert"),
        ).toHaveTextContent("Anmeldung fehlgeschlagen");

        expect(
            screen.getByRole("button", {
                name: "Teilnehmen",
            }),
        ).toBeEnabled();

        expect(mockGetEventAttendees).toHaveBeenCalledTimes(1);
    });

    it("keeps the successful registration when refreshing attendees fails", async () => {
        vi.spyOn(console, "error").mockImplementation(() => { });

        mockGetEventAttendees
            .mockResolvedValueOnce([testAttendee])
            .mockRejectedValueOnce(
                new Error("Attendees refresh failed"),
            );

        renderEventDetails();

        const joinButton = await screen.findByRole("button", {
            name: "Teilnehmen",
        });

        fireEvent.click(joinButton);

        await waitFor(() => {
            expect(mockAddEventAttendee).toHaveBeenCalledTimes(1);
        });

        expect(
            await screen.findByRole("button", {
                name: "Du nimmst teil",
            }),
        ).toBeDisabled();

        expect(
            screen.getByRole("button", {
                name: "Test User",
            }),
        ).toBeInTheDocument();

        expect(mockGetEventAttendees).toHaveBeenCalledTimes(2);
    });
});
