
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { getOrganizedEvents, deleteEvent } from "@/api/events";
import { getEventsByAttendee, leaveEvent } from "@/api/attendees";

import type { Event, User } from "@/types";

import Profile from "./Profile";

// API-Funktionen mocken
vi.mock("@/api/events", () => ({
    getOrganizedEvents: vi.fn(),
    deleteEvent: vi.fn(),
}));

vi.mock("@/api/attendees", () => ({
    getEventsByAttendee: vi.fn(),
    leaveEvent: vi.fn(),
}));

// Authentifizierungsstatus steuern
vi.mock("@/hooks/useAuth", () => ({
    useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockGetOrganizedEvents = vi.mocked(getOrganizedEvents);
const mockGetEventsByAttendee = vi.mocked(getEventsByAttendee);
const mockDeleteEvent = vi.mocked(deleteEvent);
const mockLeaveEvent = vi.mocked(leaveEvent);

const ACCESS_TOKEN = "test-access-token";

const testUser: User = {
    id: 10,
    tenantId: 1,
    role: "owner",
    name: "Test Owner",
    email: "owner@example.com",
};

const organizedEvent: Event = {
    id: 201,
    ownerId: testUser.id,
    title: "Organized Test Event",
    description: "An event organized by the current user",
    startDateTime: "2026-12-01T18:00:00Z",
    endDateTime: "2026-12-01T20:00:00Z",
    location: "Köln",
    imageUrl: "https://example.com/organized.jpg",
    owner: testUser,
};

const participatingEvent: Event = {
    id: 202,
    ownerId: 20,
    title: "Participating Test Event",
    description: "An event attended by the current user",
    startDateTime: "2026-12-05T18:00:00Z",
    endDateTime: "2026-12-05T20:00:00Z",
    location: "Bonn",
    imageUrl: "https://example.com/participating.jpg",
    owner: {
        id: 20,
        tenantId: 1,
        role: "owner",
        name: "Event Organizer",
        email: "organizer@example.com",
    },
};

// Profile innerhalb einer echten Router-Route rendern
const renderProfile = () =>
    render(
        <MemoryRouter initialEntries={["/profile"]}>
            <Routes>
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </MemoryRouter>,
    );

describe("Profile integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockUseAuth.mockReturnValue({
            user: testUser,
            accessToken: ACCESS_TOKEN,
            isSignedIn: true,
            isLoading: false,
        } as ReturnType<typeof useAuth>);

        mockGetOrganizedEvents.mockResolvedValue([organizedEvent]);
        mockGetEventsByAttendee.mockResolvedValue([participatingEvent]);

        mockDeleteEvent.mockResolvedValue(undefined);
        mockLeaveEvent.mockResolvedValue(undefined);
    });

    it("loads both event lists and displays organized events by default", async () => {
        renderProfile();

        expect(
            await screen.findByText("Organized Test Event"),
        ).toBeInTheDocument();

        expect(mockGetOrganizedEvents).toHaveBeenCalledWith(
            testUser.id,
            ACCESS_TOKEN,
        );

        expect(mockGetEventsByAttendee).toHaveBeenCalledWith(
            testUser.id,
            ACCESS_TOKEN,
        );

        // Ersteller ist der Standard-Tab
        expect(
            screen.getByRole("tab", { name: "Ersteller" }),
        ).toHaveAttribute("aria-selected", "true");

        expect(
            screen.getByRole("tab", { name: "Teilnehmer" }),
        ).toHaveAttribute("aria-selected", "false");

        // Der Teilnehmer-Tab ist zunächst nicht sichtbar
        expect(
            screen.queryByText("Participating Test Event"),
        ).not.toBeInTheDocument();
    });

    it("switches between organized and participating events", async () => {
        renderProfile();

        await screen.findByText("Organized Test Event");

        // Zum Teilnehmer-Tab wechseln
        fireEvent.click(
            screen.getByRole("tab", { name: "Teilnehmer" }),
        );

        expect(
            await screen.findByText("Participating Test Event"),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("tab", { name: "Teilnehmer" }),
        ).toHaveAttribute("aria-selected", "true");

        expect(
            screen.getByRole("tab", { name: "Ersteller" }),
        ).toHaveAttribute("aria-selected", "false");

        // Zurück zum Ersteller-Tab wechseln
        fireEvent.click(
            screen.getByRole("tab", { name: "Ersteller" }),
        );

        expect(
            await screen.findByText("Organized Test Event"),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("tab", { name: "Ersteller" }),
        ).toHaveAttribute("aria-selected", "true");

        // Beide Listen werden nicht erneut vom Backend geladen
        expect(mockGetOrganizedEvents).toHaveBeenCalledTimes(1);
        expect(mockGetEventsByAttendee).toHaveBeenCalledTimes(1);
    });

    it("deletes an organized event and updates the list locally", async () => {
        renderProfile();

        await screen.findByText("Organized Test Event");

        // Löschdialog öffnen
        fireEvent.click(
            screen.getByRole("button", { name: "Löschen" }),
        );

        const dialog = screen.getByRole("alertdialog");

        expect(
            within(dialog).getByText("Event wirklich löschen?"),
        ).toBeInTheDocument();

        // Löschen bestätigen
        fireEvent.click(
            within(dialog).getByRole("button", { name: "Löschen" }),
        );

        await waitFor(() => {
            expect(mockDeleteEvent).toHaveBeenCalledWith(
                organizedEvent.id,
                ACCESS_TOKEN,
            );
        });

        // Das Event wird aus der lokalen Liste entfernt
        await waitFor(() => {
            expect(
                screen.queryByText("Organized Test Event"),
            ).not.toBeInTheDocument();
        });

        expect(
            screen.getByText("Noch keine Events erstellt"),
        ).toBeInTheDocument();

        // Keine erneute Listenabfrage erforderlich
        expect(mockGetOrganizedEvents).toHaveBeenCalledTimes(1);
        expect(mockGetEventsByAttendee).toHaveBeenCalledTimes(1);
    });

    it("leaves a participating event and updates the list locally", async () => {
        renderProfile();

        await screen.findByText("Organized Test Event");

        // Zum Teilnehmer-Tab wechseln
        fireEvent.click(
            screen.getByRole("tab", { name: "Teilnehmer" }),
        );

        await screen.findByText("Participating Test Event");

        // Dialog zum Verlassen des Events öffnen
        fireEvent.click(
            screen.getByRole("button", { name: "Event verlassen" }),
        );

        const dialog = screen.getByRole("alertdialog");

        expect(
            within(dialog).getByText("Event verlassen?"),
        ).toBeInTheDocument();

        // Verlassen bestätigen
        fireEvent.click(
            within(dialog).getByRole("button", { name: "Verlassen" }),
        );

        await waitFor(() => {
            expect(mockLeaveEvent).toHaveBeenCalledWith(
                participatingEvent.id,
                testUser.id,
                ACCESS_TOKEN,
            );
        });

        // Das Event wird aus der lokalen Liste entfernt
        await waitFor(() => {
            expect(
                screen.queryByText("Participating Test Event"),
            ).not.toBeInTheDocument();
        });

        expect(
            screen.getByText("Noch keine Event-Zusagen"),
        ).toBeInTheDocument();

        // Keine erneute Listenabfrage erforderlich
        expect(mockGetOrganizedEvents).toHaveBeenCalledTimes(1);
        expect(mockGetEventsByAttendee).toHaveBeenCalledTimes(1);
    });
});
