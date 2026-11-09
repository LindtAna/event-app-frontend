
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import {
    createInvitation,
    deleteInvitation,
    getInvitations,
    revokeInvitation,
} from "@/api/invitations";

import type { Invitation, User } from "@/types";

import InvitationPage from "./InvitationPage";

// API-Funktionen mocken
vi.mock("@/api/invitations", () => ({
    createInvitation: vi.fn(),
    deleteInvitation: vi.fn(),
    getInvitations: vi.fn(),
    revokeInvitation: vi.fn(),
}));

// Authentifizierungsstatus steuern
vi.mock("@/hooks/useAuth", () => ({
    useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockCreateInvitation = vi.mocked(createInvitation);
const mockDeleteInvitation = vi.mocked(deleteInvitation);
const mockGetInvitations = vi.mocked(getInvitations);
const mockRevokeInvitation = vi.mocked(revokeInvitation);

const ACCESS_TOKEN = "test-access-token";

const testOwner: User = {
    id: 10,
    tenantId: 1,
    role: "owner",
    name: "Test Owner",
    email: "owner@example.com",
};

const activeInvitation: Invitation = {
    id: 101,
    tenantId: 1,
    createdBy: testOwner.id,
    createdAt: "2026-11-01T12:00:00Z",
    expiresAt: "2099-12-01T12:00:00Z",
};

const usedInvitation: Invitation = {
    id: 102,
    tenantId: 1,
    createdBy: testOwner.id,
    createdAt: "2026-11-01T12:00:00Z",
    expiresAt: "2099-12-01T12:00:00Z",
    usedAt: "2026-11-02T12:00:00Z",
};

const revokedInvitation: Invitation = {
    id: 103,
    tenantId: 1,
    createdBy: testOwner.id,
    createdAt: "2026-11-01T12:00:00Z",
    expiresAt: "2099-12-01T12:00:00Z",
    revokedAt: "2026-11-02T12:00:00Z",
};

const expiredInvitation: Invitation = {
    id: 104,
    tenantId: 1,
    createdBy: testOwner.id,
    createdAt: "2020-01-01T12:00:00Z",
    expiresAt: "2020-01-08T12:00:00Z",
};

const mockWriteText = vi.fn<(text: string) => Promise<void>>();

// InvitationPage innerhalb einer echten Router-Route rendern
const renderInvitationPage = () =>
    render(
        <MemoryRouter initialEntries={["/invitations"]}>
            <Routes>
                <Route
                    path="/"
                    element={<div>Startseite</div>}
                />
                <Route
                    path="/invitations"
                    element={<InvitationPage />}
                />
            </Routes>
        </MemoryRouter>,
    );

// Tabellenzeile anhand der Einladungs-ID finden
const getInvitationRow = (id: number) => {
    const idCell = screen.getByRole("cell", {
        name: String(id),
    });

    const row = idCell.closest("tr");

    if (!row) {
        throw new Error(`Invitation row with ID ${id} not found`);
    }

    return row;
};

describe("InvitationPage integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockUseAuth.mockReturnValue({
            user: testOwner,
            accessToken: ACCESS_TOKEN,
            isSignedIn: true,
            isLoading: false,
        } as ReturnType<typeof useAuth>);

        mockGetInvitations.mockResolvedValue([activeInvitation]);

        mockRevokeInvitation.mockResolvedValue(undefined);
        mockDeleteInvitation.mockResolvedValue(undefined);

        mockWriteText.mockResolvedValue(undefined);

        Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: {
                writeText: mockWriteText,
            },
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("loads and displays invitations and disables revoking unavailable invitations", async () => {
        mockGetInvitations.mockResolvedValueOnce([
            activeInvitation,
            usedInvitation,
            revokedInvitation,
            expiredInvitation,
        ]);

        renderInvitationPage();

        expect(
            await screen.findByRole("cell", {
                name: "101"
            }),
        ).toBeInTheDocument();

        expect(getInvitationRow(102)).toBeInTheDocument();
        expect(getInvitationRow(103)).toBeInTheDocument();
        expect(getInvitationRow(104)).toBeInTheDocument();

        expect(mockGetInvitations).toHaveBeenCalledWith(
            ACCESS_TOKEN,
        );

        // Aktive Einladung kann widerrufen werden
        expect(
            within(getInvitationRow(101)).getByRole("button", {
                name: "Widerrufen",
            }),
        ).toBeEnabled();

        // Verwendete, widerrufene und abgelaufene Einladungen
        // können nicht widerrufen werden
        for (const id of [102, 103, 104]) {
            expect(
                within(getInvitationRow(id)).getByRole("button", {
                    name: "Widerrufen",
                }),
            ).toBeDisabled();
        }
    });

    it("creates an invitation and updates the list locally", async () => {
        const createdInvitation: Invitation = {
            id: 202,
            tenantId: 1,
            createdBy: testOwner.id,
            createdAt: "2026-11-09T12:00:00Z",
            expiresAt: "2026-11-16T12:00:00Z",
        };

        mockCreateInvitation.mockResolvedValueOnce({
            invitation: createdInvitation,
            invitationCode: "NEW-INVITATION-CODE",
        });

        renderInvitationPage();

        await screen.findByRole("row", {
            name: /101/,
        });

        const beforeRequest = Date.now();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Code generieren",
            }),
        );

        expect(
            await screen.findByRole("textbox", {
                name: "Generierter Einladungscode",
            }),
        ).toHaveValue("NEW-INVITATION-CODE");

        await waitFor(() => {
            expect(mockCreateInvitation).toHaveBeenCalledTimes(1);
        });

        const [expiresAt, token] = mockCreateInvitation.mock.calls[0];

        expect(token).toBe(ACCESS_TOKEN);
        expect(expiresAt).toMatch(/Z$/);

        // Die Einladung ist sieben Tage gültig
        const validity = 7 * 24 * 60 * 60 * 1000;
        const expirationTime = Date.parse(expiresAt);

        expect(expirationTime).toBeGreaterThanOrEqual(
            beforeRequest + validity,
        );

        expect(expirationTime).toBeLessThan(
            beforeRequest + validity + 5000,
        );

        // Neue Einladung wird lokal hinzugefügt
        expect(
            await screen.findByRole("cell", {
                name: "202",
            }),
        ).toBeInTheDocument();

        // Die bestehende Einladung bleibt erhalten
        expect(getInvitationRow(202)).toBeInTheDocument();

        // Keine erneute Listenabfrage erforderlich
        expect(mockGetInvitations).toHaveBeenCalledTimes(1);

        expect(screen.getByRole("status")).toHaveTextContent(
            "Die Einladung wurde erstellt.",
        );
    });

    it("asks for confirmation before replacing an uncopied invitation code", async () => {
        mockCreateInvitation.mockResolvedValueOnce({
            invitation: {
                id: 202,
                tenantId: 1,
                createdBy: testOwner.id,
                createdAt: "2026-11-09T12:00:00Z",
                expiresAt: "2026-11-16T12:00:00Z",
            },
            invitationCode: "FIRST-CODE",
        });

        renderInvitationPage();

        const createButton = screen.getByRole("button", {
            name: "Code generieren",
        });

        fireEvent.click(createButton);

        const codeInput = await screen.findByRole("textbox", {
            name: "Generierter Einladungscode",
        });

        expect(codeInput).toHaveValue("FIRST-CODE");

        await waitFor(() => {
            expect(createButton).toBeEnabled();
        });

        const confirmSpy = vi
            .spyOn(window, "confirm")
            .mockReturnValue(false);

        fireEvent.click(createButton);

        expect(confirmSpy).toHaveBeenCalledWith(
            expect.stringContaining("noch nicht kopiert"),
        );

        // Ohne Bestätigung wird kein weiteres Token erzeugt
        expect(mockCreateInvitation).toHaveBeenCalledTimes(1);

        // Der bisherige Code bleibt erhalten
        expect(codeInput).toHaveValue("FIRST-CODE");
    });

    it("copies the invitation code to the clipboard", async () => {
        mockCreateInvitation.mockResolvedValueOnce({
            invitation: activeInvitation,
            invitationCode: "COPY-THIS-CODE",
        });

        renderInvitationPage();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Code generieren",
            }),
        );

        await screen.findByDisplayValue("COPY-THIS-CODE");

        fireEvent.click(
            screen.getByRole("button", {
                name: "Einladungscode kopieren",
            }),
        );

        await waitFor(() => {
            expect(mockWriteText).toHaveBeenCalledWith(
                "COPY-THIS-CODE",
            );
        });

        expect(screen.getByRole("status")).toHaveTextContent(
            "Der Einladungscode wurde in die Zwischenablage kopiert.",
        );
    });

    it("revokes an active invitation and updates the list locally", async () => {
        renderInvitationPage();

        const row = await screen.findByRole("row", {
            name: /101/,
        });

        fireEvent.click(
            within(row).getByRole("button", {
                name: "Widerrufen",
            }),
        );

        await waitFor(() => {
            expect(mockRevokeInvitation).toHaveBeenCalledWith(
                activeInvitation.id,
                ACCESS_TOKEN,
            );
        });

        expect(
            await screen.findByRole("status"),
        ).toHaveTextContent("Die Einladung wurde widerrufen.");

        // revokedAt wurde lokal gesetzt
        await waitFor(() => {
            const updatedCells = within(
                getInvitationRow(101),
            ).getAllByRole("cell");

            expect(updatedCells[4]).not.toHaveTextContent("-");
        });

        // Die widerrufene Einladung kann nicht erneut widerrufen werden
        expect(
            within(getInvitationRow(101)).getByRole("button", {
                name: "Widerrufen",
            }),
        ).toBeDisabled();

        // Keine erneute Listenabfrage
        expect(mockGetInvitations).toHaveBeenCalledTimes(1);
    });

    it("deletes an invitation after confirmation and updates the list locally", async () => {
        const confirmSpy = vi
            .spyOn(window, "confirm")
            .mockReturnValue(true);

        renderInvitationPage();

        const row = await screen.findByRole("row", {
            name: /101/,
        });

        fireEvent.click(
            within(row).getByRole("button", {
                name: "Löschen",
            }),
        );

        expect(confirmSpy).toHaveBeenCalledWith(
            expect.stringContaining("dauerhaft löschen"),
        );

        await waitFor(() => {
            expect(mockDeleteInvitation).toHaveBeenCalledWith(
                activeInvitation.id,
                ACCESS_TOKEN,
            );
        });

        await waitFor(() => {
            expect(
                screen.queryByRole("row", {
                    name: /101/,
                }),
            ).not.toBeInTheDocument();
        });

        expect(screen.getByRole("status")).toHaveTextContent(
            "Die Einladung wurde gelöscht.",
        );

        // Keine erneute Listenabfrage
        expect(mockGetInvitations).toHaveBeenCalledTimes(1);
    });

    it("does not delete an invitation when confirmation is cancelled", async () => {
        const confirmSpy = vi
            .spyOn(window, "confirm")
            .mockReturnValue(false);

        renderInvitationPage();

        const row = await screen.findByRole("row", {
            name: /101/,
        });

        fireEvent.click(
            within(row).getByRole("button", {
                name: "Löschen",
            }),
        );

        expect(confirmSpy).toHaveBeenCalledTimes(1);

        expect(mockDeleteInvitation).not.toHaveBeenCalled();

        expect(getInvitationRow(101)).toBeInTheDocument();
    });

    it("displays an error when loading invitations fails", async () => {
        mockGetInvitations.mockRejectedValueOnce(
            new Error("Failed to fetch invitations"),
        );

        renderInvitationPage();

        expect(
            await screen.findByRole("alert"),
        ).toHaveTextContent(
            "Die Einladungen konnten nicht geladen werden.",
        );

        expect(mockGetInvitations).toHaveBeenCalledWith(
            ACCESS_TOKEN,
        );
    });
});
