
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import type { Dispatch, SetStateAction } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { registerUser } from "@/api/auth";
import { uploadToCloudinary } from "@/api/upload";
import type { User } from "@/types";

import RegisterForm from "./RegisterForm";


vi.mock("@/api/auth", () => ({
    registerUser: vi.fn(),
}));

vi.mock("@/api/upload", () => ({
    uploadToCloudinary: vi.fn(),
}));

// simulieren die Dateiauswahl ohne echtes Drag & Drop
vi.mock("./FileUploader", () => ({
    FileUploader: ({
        onFieldChange,
        setFiles,
    }: {
        onFieldChange: (url: string) => void;
        setFiles: Dispatch<SetStateAction<File[]>>;
    }) => (
        <input
            type="file"
            aria-label="Profilbild"
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

const mockRegisterUser = vi.mocked(registerUser);
const mockUploadToCloudinary = vi.mocked(uploadToCloudinary);

const testUser = {
    id: 1,
    tenantId: 10,
    role: "owner",
    name: "Test User",
    email: "test@example.com",
} as User;

const testCredentials = {
    name: "Test User",
    email: "test@example.com",
    password: "valid-password",
};

const testOwnerPayload = {
    ...testCredentials,
    avatarUrl: "",
    registrationType: "owner" as const,
    companyName: "Test Team",
};

const testMemberPayload = {
    ...testCredentials,
    avatarUrl: "",
    registrationType: "member" as const,
    invitationCode: "INVITE-123",
};

// Zeigt den aktuellen URL und Navigation State
const LocationDisplay = () => {
    const location = useLocation();

    const state = location.state as
        | { openLoginModal?: boolean }
        | null;

    return (
        <>
            <div data-testid="current-location">
                {location.pathname}
            </div>

            <div data-testid="login-modal-state">
                {String(state?.openLoginModal === true)}
            </div>
        </>
    );
};

// Rendert RegisterForm innerhalb eines echten React Routers
const renderRegisterForm = (
    initialEntry = "/register",
) =>
    render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <RegisterForm />
            <LocationDisplay />
        </MemoryRouter>,
    );

// Füllt die gemeinsamen Registrierungsfelder aus
const fillCommonFields = (
    confirmPassword = testCredentials.password,
) => {
    fireEvent.change(screen.getByPlaceholderText("Benutzername"), {
        target: { value: `  ${testCredentials.name}  ` },
    });

    fireEvent.change(screen.getByPlaceholderText("E-Mail"), {
        target: { value: `  ${testCredentials.email}  ` },
    });

    fireEvent.change(
        screen.getByPlaceholderText("Passwort (min. 8 Zeichen)"),
        {
            target: { value: testCredentials.password },
        },
    );

    fireEvent.change(
        screen.getByPlaceholderText("Passwort bestätigen"),
        {
            target: { value: confirmPassword },
        },
    );
};

// Sendet das Formular direkt ab
const submitForm = () => {
    const button = screen.getByRole("button", {
        name: "Registrieren",
    });

    const form = button.closest("form");

    expect(form).not.toBeNull();

    fireEvent.submit(form!);
};

describe("RegisterForm integration", () => {
    beforeEach(() => {
        mockRegisterUser.mockReset();
        mockUploadToCloudinary.mockReset();
    });

    it("registers an owner successfully with the correct payload", async () => {
        mockRegisterUser.mockResolvedValue(testUser);

        renderRegisterForm();

        fillCommonFields();

        fireEvent.change(screen.getByPlaceholderText("Teamsname"), {
            target: { value: "  Test Team  " },
        });

        submitForm();

        await waitFor(() => {
            expect(mockRegisterUser).toHaveBeenCalledWith(
                testOwnerPayload,
            );
        });

        expect(mockUploadToCloudinary).not.toHaveBeenCalled();

        expect(
            screen.getByRole("status"),
        ).toHaveTextContent("Registrierung erfolgreich!");

        expect(
            screen.getByRole("button", { name: "Einloggen" }),
        ).toBeInTheDocument();
    });

    it("registers a member successfully with the correct payload", async () => {
        mockRegisterUser.mockResolvedValue(testUser);

        renderRegisterForm("/register?type=member");

        fillCommonFields();

        fireEvent.change(
            screen.getByPlaceholderText("Einladungscode"),
            {
                target: { value: "  INVITE-123  " },
            },
        );

        submitForm();

        await waitFor(() => {
            expect(mockRegisterUser).toHaveBeenCalledWith(
                testMemberPayload,
            );
        });

        expect(mockUploadToCloudinary).not.toHaveBeenCalled();

        expect(
            screen.getByRole("status"),
        ).toHaveTextContent("Registrierung erfolgreich!");
    });

    it("uploads an avatar and includes the uploaded URL in the registration payload", async () => {
        const uploadedAvatarUrl =
            "https://res.cloudinary.com/test/image/upload/avatar.jpg";

        const testFile = new File(
            ["test image content"],
            "avatar.jpg",
            { type: "image/jpeg" },
        );

        mockUploadToCloudinary.mockResolvedValue(uploadedAvatarUrl);
        mockRegisterUser.mockResolvedValue(testUser);

        renderRegisterForm();

        fillCommonFields();

        fireEvent.change(screen.getByPlaceholderText("Teamsname"), {
            target: { value: "Test Team" },
        });

        fireEvent.change(screen.getByLabelText("Profilbild"), {
            target: {
                files: [testFile],
            },
        });

        submitForm();

        await waitFor(() => {
            expect(mockUploadToCloudinary).toHaveBeenCalledWith(
                testFile,
                "avatars",
            );
        });

        const expectedPayload = {
            ...testOwnerPayload,
            avatarUrl: uploadedAvatarUrl,
        };

        await waitFor(() => {
            expect(mockRegisterUser).toHaveBeenCalledWith(
                expectedPayload,
            );
        });

        expect(
            screen.getByRole("status"),
        ).toHaveTextContent("Registrierung erfolgreich!");
    });

    it("validates required fields and password confirmation without sending an API request", async () => {
        renderRegisterForm();

        fillCommonFields("different-password");

        // Teamname bleibt leer.

        submitForm();

        expect(
            await screen.findByText(
                "Bitte gib einen Teamnamen ein.",
            ),
        ).toBeInTheDocument();

        expect(
            screen.getByText("Passwörter stimmen nicht überein."),
        ).toBeInTheDocument();

        expect(mockRegisterUser).not.toHaveBeenCalled();
        expect(mockUploadToCloudinary).not.toHaveBeenCalled();

        expect(
            screen.getByTestId("current-location"),
        ).toHaveTextContent("/register");
    });

    it("displays an error when registration fails and keeps the form open", async () => {
        const alertMock = vi
            .spyOn(window, "alert")
            .mockImplementation(() => {});

        mockRegisterUser.mockRejectedValue(
            new Error("E-Mail-Adresse bereits registriert"),
        );

        renderRegisterForm();

        fillCommonFields();

        fireEvent.change(screen.getByPlaceholderText("Teamsname"), {
            target: { value: "Test Team" },
        });

        submitForm();

        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith(
                "E-Mail-Adresse bereits registriert",
            );
        });

        expect(mockRegisterUser).toHaveBeenCalledTimes(1);

        expect(
            screen.queryByRole("status"),
        ).not.toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: "Registrieren" }),
        ).toBeInTheDocument();
    });

    it("displays an error when avatar upload fails and does not register the user", async () => {
        const alertMock = vi
            .spyOn(window, "alert")
            .mockImplementation(() => {});

        const testFile = new File(
            ["test image content"],
            "avatar.jpg",
            { type: "image/jpeg" },
        );

        mockUploadToCloudinary.mockRejectedValue(
            new Error("Cloudinary upload failed"),
        );

        renderRegisterForm();

        fillCommonFields();

        fireEvent.change(screen.getByPlaceholderText("Teamsname"), {
            target: { value: "Test Team" },
        });

        fireEvent.change(screen.getByLabelText("Profilbild"), {
            target: {
                files: [testFile],
            },
        });

        submitForm();

        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith(
                "Cloudinary upload failed",
            );
        });

        expect(mockUploadToCloudinary).toHaveBeenCalledWith(
            testFile,
            "avatars",
        );

        expect(mockRegisterUser).not.toHaveBeenCalled();

        expect(
            screen.queryByRole("status"),
        ).not.toBeInTheDocument();
    });

    it("navigates to the home page with openLoginModal state after successful registration", async () => {
        mockRegisterUser.mockResolvedValue(testUser);

        renderRegisterForm();

        fillCommonFields();

        fireEvent.change(screen.getByPlaceholderText("Teamsname"), {
            target: { value: "Test Team" },
        });

        submitForm();

        expect(
            await screen.findByRole("status"),
        ).toHaveTextContent("Registrierung erfolgreich!");

        fireEvent.click(
            screen.getByRole("button", { name: "Einloggen" }),
        );

        await waitFor(() => {
            expect(
                screen.getByTestId("current-location"),
            ).toHaveTextContent("/");

            expect(
                screen.getByTestId("login-modal-state"),
            ).toHaveTextContent("true");
        });
    });

    it("navigates to the home page when registration is cancelled", async () => {
        renderRegisterForm();

        fireEvent.click(
            screen.getByRole("button", { name: "Abbrechen" }),
        );

        await waitFor(() => {
            expect(
                screen.getByTestId("current-location"),
            ).toHaveTextContent("/");
        });

        expect(
            screen.getByTestId("login-modal-state"),
        ).toHaveTextContent("false");

        expect(mockRegisterUser).not.toHaveBeenCalled();
        expect(mockUploadToCloudinary).not.toHaveBeenCalled();
    });
});
