import { useState, useEffect, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";
import type { User } from "@/types";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Beim Start die Gültigkeit des HttpOnly-Cookies über /refresh überprüfen
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const data = await apiFetch<{
                    user: User;
                    accessToken: string;
                }>("/auth/refresh", {
                    method: "POST",
                });

                setUser(data.user);
                setAccessToken(data.accessToken);
            } catch (error) {
                console.error("Session restore failed:", error);
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
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