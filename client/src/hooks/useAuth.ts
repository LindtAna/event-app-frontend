// mock. Later --> Go /auth/login
export const useAuth = () => {
  const user = null 
  return {
    user,
    isSignedIn:!!user,
    logout: () => console.log('logout -> Go backend'),
  }
}