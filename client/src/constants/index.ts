export const headerLinks = [
  {
    label: 'Home',
    route: '/',
  },
  {
    label: 'Event erstellen', //Create Event
    route: '/events/create',
  },
  {
    label: 'Mein Profil',  //My Profile
    route: '/profile',
  },
]

export const footerLinks = [
  { label: "Datenschutzerklärung", route: "#" },
  { label: "Datenschutzeinstellungen", route: "#" },
  { label: "Nutzungsbedingungen", route: "#" },
  { label: "Impressum", route: "#" },
]


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