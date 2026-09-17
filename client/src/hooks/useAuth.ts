// mock. Later --> Go /auth/login
export const useAuth = () => {
  const user = { id: 1, name: 'Manager' } 
  return {
    user,
    isSignedIn:!!user,
    logout: () => console.log('logout -> Go backend'),
  }
}
