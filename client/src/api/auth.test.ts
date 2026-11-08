
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api";
import { loginUser, registerUser } from "./auth";

vi.mock("@/lib/api", () => ({
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

const testUser = {
  id: 1,
  tenantId: 10,
  role: "owner" as const,
  name: "Test User",
  email: "test@example.com",
};

describe("loginUser", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it("sends login credentials to the API", async () => {
    const payload = {
      email: "test@example.com",
      password: "password123",
    };

    const response = {
      user: testUser,
      accessToken: "test-access-token",
    };

    apiFetchMock.mockResolvedValueOnce(response);

    const result = await loginUser(payload);

    expect(apiFetchMock).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    expect(result).toEqual(response);
  });
});

describe("registerUser", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it("sends an owner registration payload", async () => {
    const payload = {
      name: "Test Owner",
      email: "owner@example.com",
      password: "password123",
      registrationType: "owner" as const,
      companyName: "Test Company",
    };

    apiFetchMock.mockResolvedValueOnce(testUser);

    const result = await registerUser(payload);

    expect(apiFetchMock).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    expect(result).toEqual(testUser);
  });

  it("sends a member registration payload", async () => {
    const payload = {
      name: "Test Member",
      email: "member@example.com",
      password: "password123",
      registrationType: "member" as const,
      invitationCode: "test-invitation-code",
    };

    const memberUser = {
      ...testUser,
      role: "member" as const,
    };

    apiFetchMock.mockResolvedValueOnce(memberUser);

    const result = await registerUser(payload);

    expect(apiFetchMock).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    expect(result).toEqual(memberUser);
  });

  it("propagates API errors", async () => {
    const error = new Error("Registration failed");

    apiFetchMock.mockRejectedValueOnce(error);

    await expect(
      registerUser({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        registrationType: "owner",
        companyName: "Test Company",
      }),
    ).rejects.toBe(error);
  });
});
