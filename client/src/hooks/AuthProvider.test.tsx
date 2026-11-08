import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiFetch, ApiError } from "@/lib/api";
import type { User } from "@/types";

import { AuthProvider } from "./AuthProvider";
import { useAuth } from "./useAuth";

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();

  return {
    ...actual,
    apiFetch: vi.fn(),
  };
});

const mockApiFetch = vi.mocked(apiFetch);

const testUser: User = {
  id: 1,
  tenantId: 10,
  role: "owner",
  name: "Test User",
  email: "test@example.com",
};

const AuthConsumer = () => {
  const { user, accessToken, isSignedIn, isLoading, setAuth, logout } =
    useAuth();

  return (
    <div>
      <output data-testid="user">{user?.email ?? "anonymous"}</output>
      <output data-testid="access-token">{accessToken ?? "no-token"}</output>
      <output data-testid="is-signed-in">{String(isSignedIn)}</output>
      <output data-testid="is-loading">{String(isLoading)}</output>

      <button
        type="button"
        onClick={() => setAuth(testUser, "updated-token")}
      >
        Set auth
      </button>

      <button type="button" onClick={() => void logout()}>
        Logout
      </button>
    </div>
  );
};

const renderAuthProvider = () =>
  render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>,
  );

describe("AuthProvider", () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts with an empty auth state while restoring the session", () => {
    mockApiFetch.mockReturnValueOnce(new Promise<never>(() => {}));

    renderAuthProvider();

    expect(screen.getByTestId("user")).toHaveTextContent("anonymous");
    expect(screen.getByTestId("access-token")).toHaveTextContent("no-token");
    expect(screen.getByTestId("is-signed-in")).toHaveTextContent("false");
    expect(screen.getByTestId("is-loading")).toHaveTextContent("true");

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/auth/refresh",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("restores the session successfully", async () => {
    mockApiFetch.mockResolvedValueOnce({
      user: testUser,
      accessToken: "restored-token",
    } as never);

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent(testUser.email);
      expect(screen.getByTestId("access-token")).toHaveTextContent(
        "restored-token",
      );
      expect(screen.getByTestId("is-signed-in")).toHaveTextContent("true");
      expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
    });
  });

  it("keeps the user anonymous when session restoration returns 401", async () => {
    mockApiFetch.mockRejectedValueOnce(
      new ApiError(401, "Unauthorized"),
    );

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("user")).toHaveTextContent("anonymous");
    expect(screen.getByTestId("access-token")).toHaveTextContent("no-token");
    expect(screen.getByTestId("is-signed-in")).toHaveTextContent("false");
  });

  it("ends loading and logs an error when session restoration fails", async () => {
    const error = new Error("Network error");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    mockApiFetch.mockRejectedValueOnce(error);

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
    });

    expect(consoleError).toHaveBeenCalledWith(
      "Session restore failed:",
      error,
    );

    expect(screen.getByTestId("user")).toHaveTextContent("anonymous");
    expect(screen.getByTestId("is-signed-in")).toHaveTextContent("false");
  });

  it("updates the authentication state through setAuth", async () => {
    mockApiFetch.mockRejectedValueOnce(
      new ApiError(401, "Unauthorized"),
    );

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
    });

    fireEvent.click(screen.getByRole("button", { name: "Set auth" }));

    expect(screen.getByTestId("user")).toHaveTextContent(testUser.email);
    expect(screen.getByTestId("access-token")).toHaveTextContent(
      "updated-token",
    );
    expect(screen.getByTestId("is-signed-in")).toHaveTextContent("true");
  });

  it("logs out and clears the authentication state successfully", async () => {
    mockApiFetch
      .mockResolvedValueOnce({
        user: testUser,
        accessToken: "restored-token",
      } as never)
      .mockResolvedValueOnce(undefined as never);

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId("is-signed-in")).toHaveTextContent("true");
    });

    fireEvent.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("anonymous");
      expect(screen.getByTestId("access-token")).toHaveTextContent("no-token");
      expect(screen.getByTestId("is-signed-in")).toHaveTextContent("false");
    });

    expect(mockApiFetch).toHaveBeenNthCalledWith(
      2,
      "/auth/logout",
      { method: "POST" },
    );
  });

  it("clears the authentication state even when logout request fails", async () => {
    const error = new Error("Logout request failed");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    mockApiFetch
      .mockResolvedValueOnce({
        user: testUser,
        accessToken: "restored-token",
      } as never)
      .mockRejectedValueOnce(error);

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId("is-signed-in")).toHaveTextContent("true");
    });

    fireEvent.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("anonymous");
      expect(screen.getByTestId("access-token")).toHaveTextContent("no-token");
      expect(screen.getByTestId("is-signed-in")).toHaveTextContent("false");
    });

    expect(consoleError).toHaveBeenCalledWith("Logout error:", error);
  });

  it("aborts the session restoration request when the provider unmounts", () => {
    let requestSignal: AbortSignal | undefined;

    mockApiFetch.mockImplementationOnce((_endpoint, options) => {
      requestSignal = options?.signal ?? undefined;
      return new Promise<never>(() => {});
    });

    const { unmount } = renderAuthProvider();

    expect(requestSignal).toBeDefined();
    expect(requestSignal?.aborted).toBe(false);

    unmount();

    expect(requestSignal?.aborted).toBe(true);
  });
});

describe("useAuth", () => {
  it("throws an error when used outside AuthProvider", () => {
    expect(() => render(<AuthConsumer />)).toThrow(
      "useAuth must be used within an AuthProvider",
    );
  });
});