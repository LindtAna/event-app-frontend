import { useState, useEffect, createContext, useContext, type ReactNode } from 'react'

export type User = {
  id: number;
  name?: string; 
  email: string;
  bio?: string;
  avatarUrl?: string;
} | null

type AuthContextType = {
  user: User
  accessToken: string | null
  isSignedIn: boolean
  isLoading: boolean
  setAuth: (user: User, accessToken: string) => void
  logout: () => Promise<void>
}


const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  //Beim Start die Gültigkeit des HttpOnly-Cookies über /refresh überprüfen
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/auth/refresh", {
          method: "POST",
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setAccessToken(data.accessToken)
        }
      } catch (error) {
        console.error("Session restore failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [])

  const setAuth = (userData: User, token: string) => {
    setUser(userData)
    setAccessToken(token)
  }

  const logout = async () => {
    try {
      await fetch("http://localhost:8080/api/v1/auth/logout", {
        method: "POST",
        credentials: "include", //Wichtig für cookies!
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      setAccessToken(null)
    }
  }
 
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
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}