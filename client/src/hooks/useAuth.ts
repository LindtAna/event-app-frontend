// mock. Later --> Go /auth/login

import { useState } from 'react'

type User = {
  id: number
  name: string
} | null

export const useAuth = () => {
  // Standardmäßig auf null setzen (nicht eingeloggt)
  const [user, setUser] = useState<User>(null)

  const login = () => {
    setUser({ id: 1, name: 'Manager' })
  }

  const logout = () => {
    setUser(null)
  }

  return {
    user,
    isSignedIn: !!user,
    login,
    logout,
  }
}


// export const useAuth = () => {
//   const user = { id: 1, name: 'Manager' } 
//   return {
//     user,
//     isSignedIn:!!user,
//     logout: () => console.log('logout -> Go backend'),
//   }
// }
