import { useState, useEffect, createContext, useContext, type ReactNode } from 'react'

type User = {
  id: number;
  name?: string;  // Backend liefert beim Login noch keinen Namen zurück
} | null

type AuthContextType = {
  user: User;
  isSignedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null)

  // Beim Laden der Anwendung prüfen , ob ein Token im localStorage vorhanden ist
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        // JWT dekodieren
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({ id: payload.userId })
      } catch (error) {
        console.error("Invalid token in storage")
        localStorage.removeItem('token')
      }
    }
  }, [])

  const login = (token: string) => {
    localStorage.setItem('token', token)
    const payload = JSON.parse(atob(token.split('.')[1]))
    setUser({ id: payload.userId })
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isSignedIn: !!user, login, logout }}>
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