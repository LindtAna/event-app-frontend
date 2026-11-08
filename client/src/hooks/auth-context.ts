import { createContext } from "react";
import type { User } from "@/types";

type AuthContextType = {
    user: User | null;
    accessToken: string | null;
    isSignedIn: boolean;
    isLoading: boolean;
    setAuth: (user: User, accessToken: string) => void;
    logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);