// Go+SQLite Backend-kompatibel + Frontend-Erweiterungen

export type User = {
  id: number;
  email: string;
  name?: string;
  avatarUrl?: string;
  bio?: string;
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
  owner?: User;  
};

export type Attendee = {
  id?: number;
  userId: number;
  eventId: number;
  user?: User; 
};

export type EventWithDetails = Event & {
  attendees: User[];
};