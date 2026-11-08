import { useState, useEffect, type ReactNode } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { User } from "@/types";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Beim Start die Gültigkeit des HttpOnly-Cookies über /refresh überprüfen
    useEffect(() => {
        const controller = new AbortController();

        const restoreSession = async () => {
            try {
                const data = await apiFetch<{
                    user: User;
                    accessToken: string;
                }>("/auth/refresh", {
                    method: "POST",
                    signal: controller.signal,
                });
                if (controller.signal.aborted) return;

                setUser(data.user);
                setAccessToken(data.accessToken);
            } catch (error) {
                // Abgebrochene Anfragen nicht als Fehler behandeln
                if (controller.signal.aborted) return;

                // Kein gültiger Refresh-Cookie bedeutet: anonymer Benutzer
                if (error instanceof ApiError && error.status === 401) {
                    return;
                }

                console.error("Session restore failed:", error)
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false)
            }
            }
        };

        void restoreSession()

        return () => {
            controller.abort()
        }
    }, []);

    const setAuth = (userData: User, token: string) => {
        setUser(userData);
        setAccessToken(token);
    };

    const logout = async () => {
        try {
            await apiFetch("/auth/logout", { method: "POST" });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setUser(null);
            setAccessToken(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                isSignedIn: !!user,
                isLoading,
                setAuth,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};