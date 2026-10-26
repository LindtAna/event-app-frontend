// Go+SQLite Backend-kompatibel + Frontend-Erweiterungen

export type User = {
  id: number;
  tenantId: number;
  role: "owner" | "member";
  name?: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
};


export type Invitation = {
  id: number;
  tenantId: number;
  expiresAt: string;
  usedAt?: string | null;
  revokedAt?: string | null;
  createdBy: number;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  isDefault?: boolean;
}

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
  categoryName?: string;
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