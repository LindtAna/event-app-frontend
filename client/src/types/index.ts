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
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  category?: Category;
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