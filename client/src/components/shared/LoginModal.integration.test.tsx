
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiFetch } from "@/lib/api";
import { AuthProvider } from "@/hooks/AuthProvider";
import type { User } from "@/types";

import Header from "./Header";

// HTTP-Anfragen werden ersetzt, während die übrigen API-Exporte erhalten bleiben
vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();

  return {
    ...actual,
    apiFetch: vi.fn(),
  };
});

// Komponenten, die nicht zu den zu testenden Szenarien gehören
// Der Header zeigt sie erst nach erfolgreicher Autorisierung an
vi.mock("./NavItems", () => ({
  default: () => null,
}));

vi.mock("./MobileNav", () => ({
  default: () => null,
}));

const mockApiFetch = vi.mocked(apiFetch);

const testUser: User = {
  id: 1,
  tenantId: 10,
  role: "owner",
  name: "Test User",
  email: "test@example.com",
};

const testCredentials = {
  email: "test@example.com",
  password: "valid-password",
};

// Zeigt die aktuelle URL zur Überprüfung der Navigation an
const LocationDisplay = () => {
  const location = useLocation();

  return (
    <output data-testid="current-location">
      {location.pathname}
      {location.search}
    </output>
  );
};

//die aktuellen Header, LoginModal und AuthProvider werden innerhalb eines echten React Routers gerendert
const renderHeader = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <AuthProvider>
        <Header />
        <LocationDisplay />
      </AuthProvider>
    </MemoryRouter>,
  );

const waitForSessionCheck = async () => {
  await waitFor(() => {
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/auth/refresh",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });
};

const openLoginModal = async () => {
  fireEvent.click(screen.getByRole("button", { name: "Login" }));

  expect(
    await screen.findByRole("heading", { name: "Anmelden" }),
  ).toBeInTheDocument();
};

const fillLoginForm = () => {
  fireEvent.change(screen.getByPlaceholderText("example@example.com"), {
    target: { value: testCredentials.email },
  });

  fireEvent.change(screen.getByPlaceholderText("********"), {
    target: { value: testCredentials.password },
  });
};

describe("LoginModal integration", () => {
  beforeEach(() => {
    mockApiFetch.mockReset();

    // AuthProvider: keine bestehende Sitzung vorhanden
    mockApiFetch.mockRejectedValueOnce(
      new ApiError(401, "Unauthorized"),
    );
  });

  it("logs in successfully and updates the global authentication state", async () => {
    mockApiFetch.mockResolvedValueOnce({
      user: testUser,
      accessToken: "login-token",
    } as never);

    renderHeader();

    await waitForSessionCheck();
    await openLoginModal();

    fillLoginForm();

    fireEvent.click(
      screen.getByRole("button", { name: "Einloggen" }),
    );

    // Der eingegebene Login wird an die tatsächliche API-Funktion übergeben
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenNthCalledWith(
        2,
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify(testCredentials),
        },
      );
    });

    // Der AuthProvider hat den Benutzer übernommen
    expect(
      await screen.findByRole("button", {
        name: "Benutzerkonto von Test User",
      }),
    ).toBeInTheDocument();

    // Header hat das Login-Modal geschlossen
    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Anmelden" }),
      ).not.toBeInTheDocument();
    });
  });

  it("displays an error when login fails and keeps the modal open", async () => {
    const alertMock = vi
      .spyOn(window, "alert")
      .mockImplementation(() => {});

    mockApiFetch.mockRejectedValueOnce(
      new Error("Ungültige Zugangsdaten"),
    );

    renderHeader();

    await waitForSessionCheck();
    await openLoginModal();

    fillLoginForm();

    fireEvent.click(
      screen.getByRole("button", { name: "Einloggen" }),
    );

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        "Ungültige Zugangsdaten",
      );
    });

    // Das Login-Modal bleibt geöffnet
    expect(
      screen.getByRole("heading", { name: "Anmelden" }),
    ).toBeInTheDocument();

    // Der Benutzer wurde nicht authentifiziert
    expect(
      screen.getByRole("button", { name: "Login" }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Benutzerkonto von Test User",
      }),
    ).not.toBeInTheDocument();
  });

  it("validates email and password without sending a login request", async () => {
    renderHeader();

    await waitForSessionCheck();
    await openLoginModal();

    fireEvent.change(screen.getByPlaceholderText("example@example.com"), {
      target: { value: "invalid-email" },
    });

    // Passwort bleibt leer.

    const submitButton = screen.getByRole("button", {
      name: "Einloggen",
    });

    const form = submitButton.closest("form");

    expect(form).not.toBeNull();

    // submit direkt auslösen, damit React Hook Form
    // auch bei einem ungültigen HTML-E-Mail-Feld validiert
    fireEvent.submit(form!);

    expect(
      await screen.findByText("Ungültige E-Mail-Adresse."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Passwort ist erforderlich."),
    ).toBeInTheDocument();

    // Der einzige Request war die Session-Wiederherstellung
    expect(mockApiFetch).toHaveBeenCalledTimes(1);
  });

  it.each([
    {
      button: "Neues Team erstellen",
      expectedLocation: "/register?type=owner",
    },
    {
      button: "Mit Einladung beitreten",
      expectedLocation: "/register?type=member",
    },
  ])(
    "closes the modal and navigates to $expectedLocation",
    async ({ button, expectedLocation }) => {
      renderHeader();

      await waitForSessionCheck();
      await openLoginModal();

      fireEvent.click(screen.getByText("Hier klicken"));

      expect(
        screen.getByRole("heading", { name: "Account erstellen" }),
      ).toBeInTheDocument();

      fireEvent.click(
        screen.getByRole("button", { name: button }),
      );

      await waitFor(() => {
        expect(screen.getByTestId("current-location")).toHaveTextContent(
          expectedLocation,
        );

        // Das Modal wird durch den Wechsel des Navigation State geschlossen
        expect(
          screen.queryByRole("heading", { name: "Account erstellen" }),
        ).not.toBeInTheDocument();
      });
    },
  );
});
