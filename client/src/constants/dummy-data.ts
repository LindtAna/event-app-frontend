import type { User, Category, Event, Attendee } from "../types/index";

export const dummyCategories: Category[] = [
  { id: "1", name: "Meeting" },
  { id: "2", name: "Workshop" },
  { id: "3", name: "Team-Event" },
  { id: "4", name: "Planning" },
];

export const dummyUsers: User[] = [
  { id: 1, name: "Anna Müller", email: "anna@firma.de", avatarUrl: "https://i.pravatar.cc/150?img=1", bio: "Projektleitung" },
  { id: 2, name: "Max Schmidt", email: "max@firma.de", avatarUrl: "https://i.pravatar.cc/150?img=8" },
  { id: 3, name: "Lisa Weber", email: "lisa@firma.de", avatarUrl: "https://i.pravatar.cc/150?img=5" },
  { id: 4, name: "Tom Becker", email: "tom@firma.de", avatarUrl: "https://i.pravatar.cc/150?img=12" },
];

export const dummyEvents: Event[] = [
  {
    id: 1, ownerId: 1, title: "Q1 Planning Meeting",
    description: "Strategische Planung für das erste Quartal. Ziele, Budgets und Roadmap werden besprochen.",
    startDateTime: "2026-10-15 10:30",
    endDateTime: "2026-10-15 11:30",
    location: "Konferenzraum A, Cologne",
    imageUrl: "https://picsum.photos/seed/event1/600/400",
    categories: [dummyCategories[3], dummyCategories[0]],
    owner: dummyUsers[0]
  },
  {
    id: 2, ownerId: 2, title: "Team Building im Park",
    description: "Lockeres Team-Event an der frischen Luft. Grillen und Kennenlernspiele für das neue Team.",
    startDateTime: "2026-10-15 15:00",
    endDateTime: "2026-10-15 18:00",
    location: "Herkulesberg, Cologne",
    imageUrl: "https://picsum.photos/seed/event2/600/400", categories: [dummyCategories[2]], owner: dummyUsers[1]
  },
  {
    id: 3, ownerId: 1, title: "React & Go Workshop",
    description: "Interner Workshop: Wie verbinden wir unser React-Frontend mit dem Go-Backend sauber und sicher.",
    startDateTime: "2026-10-15 12:45",
    endDateTime: "2026-10-15 14:30",
    location: "Online - Google Meet",
    imageUrl: "https://picsum.photos/seed/event3/600/400", categories: [dummyCategories[1]], owner: dummyUsers[0]
  },
  {
    id: 4, ownerId: 3, title: "Monatliches All-Hands",
    description: "Alle Mitarbeiter treffen sich für Updates aus allen Abteilungen und offene Fragerunde.",
    startDateTime: "2026-10-15 08:30",
    endDateTime: "2026-10-15 09:30",
    location: "Hauptsaal",
    imageUrl: "https://picsum.photos/seed/event4/600/400", categories: [dummyCategories[0]], owner: dummyUsers[2]
  },
  {
    id: 5, ownerId: 2, title: "Release Party v2.0",
    description: "Wir feiern das große Release von PlanFuchs 2.0 mit allen Beteiligten.",
    startDateTime: "2026-10-15 16:30",
    endDateTime: "2026-10-15 18:30",
    location: "Dachterrasse",
    imageUrl: "https://picsum.photos/seed/event5/600/400", categories: [dummyCategories[2]], owner: dummyUsers[1]
  },
];

export const dummyAttendees: Attendee[] = [
  { id: 1, userId: 2, eventId: 1, user: dummyUsers[1] },
  { id: 2, userId: 3, eventId: 1, user: dummyUsers[2] },
  { id: 3, userId: 1, eventId: 2, user: dummyUsers[0] },
  { id: 4, userId: 3, eventId: 2, user: dummyUsers[2] },
  { id: 5, userId: 4, eventId: 2, user: dummyUsers[3] },
];