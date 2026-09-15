// mock. Later --> Go /auth/login
export const useAuth = () => {
  const user = { id: 'user_1', name: 'Manager' } 
  return {
    user,
    isSignedIn:!!user,
    logout: () => console.log('logout -> Go backend'),
  }
}
