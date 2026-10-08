// Go+SQLite Backend-kompatibel + Frontend-Erweiterungen

export type User = {
  id: number;
  name?: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
};

export type Category = {
  id: string;
  name: string;
};

export type Event = {
  id: number;
  ownerId: number; 
  title: string;   
  description?: string;
  startDateTime: string | Date;
  endDateTime: string | Date;
  location?: string;
  imageUrl?: string;
  url?: string;
  categories?: Category[];
  categoryId?: string;
  owner?: User | null; 
};

export type Attendee = {
  id?: number;
  userId: number;
  eventId: number;
  user?: User | null;
};

export type EventWithDetails = Event & {
  attendees: User[];
};