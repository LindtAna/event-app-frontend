
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_BASE_URL, ApiError, apiFetch } from "./api";

const fetchMock = vi.fn<typeof fetch>();

function createResponse(
    body: unknown,
    status = 200,
    jsonError?: Error,
): Response {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: jsonError
            ? vi.fn().mockRejectedValue(jsonError)
            : vi.fn().mockResolvedValue(body),
    } as unknown as Response;
}

describe("apiFetch", () => {
    beforeEach(() => {
        fetchMock.mockReset();
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("sends a request with default headers and credentials", async () => {
        const responseData = { success: true };

        fetchMock.mockResolvedValueOnce(createResponse(responseData));

        const result = await apiFetch<typeof responseData>("/events");

        expect(result).toEqual(responseData);

        expect(fetchMock).toHaveBeenCalledWith(
            `${API_BASE_URL}/events`,
            {
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );
    });

    it("sends the specified method, body and custom headers", async () => {
        const body = JSON.stringify({
            email: "test@example.com",
            password: "password123",
        });

        fetchMock.mockResolvedValueOnce(createResponse({ success: true }));

        await apiFetch("/auth/login", {
            method: "POST",
            body,
            headers: {
                "Content-Type": "application/custom+json",
                "X-Request-Source": "frontend",
            },
        });

        expect(fetchMock).toHaveBeenCalledWith(
            `${API_BASE_URL}/auth/login`,
            {
                credentials: "include",
                method: "POST",
                body,
                headers: {
                    "Content-Type": "application/custom+json",
                    "X-Request-Source": "frontend",
                },
            },
        );
    });

    it("adds a Bearer token to the Authorization header", async () => {
        fetchMock.mockResolvedValueOnce(createResponse({ success: true }));

        await apiFetch("/profile", {
            token: "test-access-token",
        });

        expect(fetchMock).toHaveBeenCalledWith(
            `${API_BASE_URL}/profile`,
            {
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer test-access-token",
                },
            },
        );
    });

    it("throws ApiError with the server error message", async () => {
        fetchMock.mockResolvedValueOnce(
            createResponse(
                { error: "Invalid credentials" },
                401,
            ),
        );

        await expect(apiFetch("/auth/login")).rejects.toMatchObject({
            name: "ApiError",
            status: 401,
            message: "Invalid credentials",
        });
    });

    it("uses the message field when the error field is unavailable", async () => {
        fetchMock.mockResolvedValueOnce(
            createResponse(
                { message: "Resource not found" },
                404,
            ),
        );

        await expect(apiFetch("/events/999")).rejects.toMatchObject({
            name: "ApiError",
            status: 404,
            message: "Resource not found",
        });
    });

    it("uses the default error message when the response has no JSON body", async () => {
        fetchMock.mockResolvedValueOnce(
            createResponse(
                null,
                500,
                new SyntaxError("Invalid JSON"),
            ),
        );

        await expect(apiFetch("/events")).rejects.toBeInstanceOf(ApiError);

        await expect(apiFetch("/events")).rejects.toBeDefined();
    });

    it("returns null when a successful response contains invalid JSON", async () => {
        fetchMock.mockResolvedValueOnce(
            createResponse(
                null,
                200,
                new SyntaxError("Invalid JSON"),
            ),
        );

        const result = await apiFetch("/events");

        expect(result).toBeNull();
    });

    it("uses the default error message when the response has no JSON body", async () => {
        fetchMock.mockResolvedValueOnce(
            createResponse(
                null,
                500,
                new SyntaxError("Invalid JSON"),
            ),
        );

        await expect(apiFetch("/events")).rejects.toMatchObject({
            name: "ApiError",
            status: 500,
            message: "Fehler bei der Anfrage",
        });
    });
});
