export const headerLinks = [
  {
    key: 'home',
    route: '/',
  },
  {
    key: 'createEvent',
    route: '/events/create',
  },
  {
    key: 'profile',
    route: '/profile',
  },
] as const

export const footerLinks = [
  { key: 'privacyPolicy', route: '#' },
  { key: 'privacySettings', route: '#' },
  { key: 'termsOfUse', route: '#' },
  { key: 'imprint', route: '#' },
] as const


export const eventDefaultValues = {
  title: '',
  description: '',
  location: '',
  imageUrl: '',
  startDateTime: new Date(),
  endDateTime: new Date(),
  categoryId: '',
  url: '',
}


export const registerDefaultValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  avatarUrl: '',
}

export const profileDefaultValues = {
  name: '',
  email: '',
  bio: '',
  avatarUrl: '',
}