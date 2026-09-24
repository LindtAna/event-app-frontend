# EventApp Frontend-Client

https://img.shields.io/badge/React-latest-blue.svg
https://img.shields.io/badge/TypeScript-latest-3178c6.svg
https://img.shields.io/badge/Vite-latest-ffb020.svg
https://img.shields.io/badge/React_Router_DOM-latest-blue.svg
https://img.shields.io/badge/Tailwind_CSS-latest-06B6D4.svg
https://img.shields.io/badge/shadcn_ui--Radix_UI-latest-purple.svg
https://img.shields.io/badge/React_Hook_Form-latest-ff69b4.svg
https://img.shields.io/badge/Zod-latest-orange.svg
https://img.shields.io/badge/react--datepicker-latest-red.svg
https://img.shields.io/badge/Custom_Select-latest-lightgrey.svg
https://img.shields.io/badge/File_Uploader-latest-lightgrey.svg

## Über das Projekt

Der EventApp Client ist die clientseitige Anwendung einer Event-Management-Plattform, entwickelt auf Basis von React und TypeScript. Die Anwendung bietet Nutzern eine moderne Benutzeroberfläche zur Registrierung, Erstellung eigener Events, Profilverwaltung sowie zur Anmeldung als Teilnehmer für Veranstaltungen anderer Nutzer.

Der Client ist für die nahtlose Integration mit einem RESTful-API-Backend konzipiert, das in Go (Golang) unter Verwendung des Gin-Frameworks umgesetzt wurde. Der Fokus liegt auf einem komponentenbasierten Ansatz, starker Typisierung, clientseitiger Datenvalidierung und responsiver Benutzeroberfläche (Responsive Design).

---

## Hauptfunktionen

## Einheitliches Layout & Navigation
- Zentrale RootLayout-Struktur  
- Responsive Header-Komponente  
- Desktop-Menü  
- Mobile Hamburger-Navigation  

## Suche & Filterung
- Suchleiste  
- Kategorienfilter zum schnellen Auffinden passender Events  

## Event-Verwaltung (CRUD)
- Ansicht von Event-Karten und Event-Sammlungen  
- Erstellung und Bearbeitung von Events mit Unterstützung für:
  - Kategorieauswahl  
  - Datums-/Zeitauswahl  
  - Cover-Upload  
- Bestätigung kritischer Aktionen über Dialogfenster:
  - DeleteConfirmation (Löschen von Events)  
  - LeaveConfirmation (Abmeldung von einer Teilnahme)  

## Profilverwaltung
- Einsicht in den persönlichen Bereich  
- Bearbeitung der Nutzerdaten  
- Avatar-Upload  

## Teilnahmesystem
- Getrennte Ansicht von Events über Tab-Navigation:
  - **Ersteller** – vom Nutzer erstellte Veranstaltungen  
  - **Teilnehmer** – Events, bei denen er als Teilnehmer eingetragen ist


---

## Tech-Stack

### Core
- React  
- TypeScript  
- Vite  

### Routing
- React Router DOM  

### Styling
- Tailwind CSS  
- shadcn/ui-Komponenten (Radix UI)  

### Formularverarbeitung
- React Hook Form  
- Zod (Validierungsschemata unter `@/lib/validator`)  

### UI-Komponenten
- react-datepicker (Datums- und Zeitauswahl)  
- Benutzerdefinierte Select-Komponenten  
- File-Uploader  

### API-Integration (geplant)
- Fetch API / Axios zur Anbindung an das Go-Backend

---

## Repository-Struktur
```
.
├── public/                      # Statische öffentliche Ressourcen
├── src/
│   ├── assets/
│   │       ├── icons/          # SVG-Icons
│   │       └── images/        # Banner & andere Assets
│   ├── components/
│   │   ├── shared/                    # Wiederverwendbare Komponenten der Geschäftslogik
│   │   │   ├── Card.tsx               # Karte einer einzelnen Veranstaltung (Event-Karte)
│   │   │   ├── CategoryFilter.tsx     # Komponente zur Filterung von Events nach Kategorien
│   │   │   ├── Collection.tsx         # Liste von Event-Karten
│   │   │   ├── DeleteConfirmation.tsx # Modales Fenster zur Bestätigung der Event-Löschung
│   │   │   ├── Dropdown.tsx           # Dropdown-Auswahlliste für Kategorien
│   │   │   ├── EventForm.tsx          # Formular zum Erstellen / Bearbeiten von Events
│   │   │   ├── FileUploader.tsx       # Drag-and-Drop-Upload für Bilder
│   │   │   ├── Footer.tsx      
│   │   │   ├── Header.tsx             # Header der Anwendung mit Logo und Navigation
│   │   │   ├── LeaveConfirmation.tsx  # Modal.Fenster zur Bestätigung der Abmeldung(Event)
│   │   │   ├── MobileNav.tsx          # Responsives Hamburger-Menü für mobile Geräte
│   │   │   ├── NavItems.tsx           # Hauptelemente der Navigation (Links)
│   │   │   ├── ProfileForm.tsx        # Formular zur Bearbeitung des Benutzerprofils
│   │   │   └── Search.tsx             # Suchleiste zur Filterung von Events
│   │   │
│   │   └── ui/                  # Atomare Basis-UI-Komponenten (shadcn/ui)
│   │       ├── avatar.tsx
│   │       ├── button.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       └── textarea.tsx
│   ├── constants/
│   │   ├── index.ts            # Konstanten und Standardwerte (eventDefaultValues)
│   │   └── dummy-data.ts       # Test- / Mock-Daten
│   ├── hooks/
│   │   └── useAuth.ts   # Custom Hook(Verwaltung des Authentifizierungs- und Benutzerstatus)
│   ├── layouts/
│   │   └── RootLayout.tsx       # Hauptlayout der Anwendung (Header + <Outlet /> + Footer)
│   ├── lib/
│   │   ├── utils.ts             # Hilfsfunktionen / Utilities (cn, getInitials etc.)
│   │   └── validator.ts         # Zod-Validierungsschemata (eventFormSchema, profileFormSchema)
│   ├── pages/
│   │   ├── events/
│   │   │   ├── CreateEvent.tsx  # Seite zum Erstellen eines neuen Events
│   │   │   ├── EventDetails.tsx # Detailseite eines Events
│   │   │   └── UpdateEvent.tsx  # Seite zum Bearbeiten eines Events
│   │   └── profile/
│   │       ├── Profile.tsx        # Persönlicher Benutzerbereich (Informationen und Tabs)
│   │       └── UpdateProfile.tsx  # Seite zum Bearbeiten des Profils
│   ├── types/
│   │   └── index.ts             # Globale TypeScript-Interfaces (User, Event, Attendee)
│   ├── App.tsx                  # Hauptkomponente für das Routing
│   ├── index.css                # Globale Tailwind-CSS-Styles und Custom Utilities
│   └── main.tsx                 # Einstiegspunkt der React-Anwendung
├── index.html                   # Haupt-HTML-Template (Vite)
├── tailwind.config.js           # Tailwind-Konfiguration für Styles und Farbpalette
├── tsconfig.json                # Einstellungen des TypeScript-Compilers
└── package.json                 # Abhängigkeiten und npm-Skripte

```
## UI-Architektur und Datenflüsse

### 1. Layout & Navigation (RootLayout.tsx)
Alle Seiten sind in RootLayout eingebunden, was die durchgängige Darstellung der Komponenten Header und Footer sicherstellt.

### 2. Formulare, Dateien & Validierung
Die Formulare (EventForm, ProfileForm) basieren auf react-hook-form mit Validierung und Error-Handling über zodResolver.

Bei Änderungen an Textfeldern erfolgt eine strikte Typüberprüfung anhand der Schemata aus `@/lib/validator`.

Beim Upload von Dateien (FileUploader) wird der State an `files` übergeben und ein `FormData`-Objekt für den Versand eines Multipart-Requests an das Backend vorbereitet.

### 3. Bestätigungsdialoge
Um versehentliche, unumkehrbare Aktionen zu verhindern, werden isolierte Komponenten verwendet:

- **DeleteConfirmation.tsx** – ruft ein modales Fenster auf, bevor `DELETE /api/v1/events/:id` ausgeführt wird.  
- **LeaveConfirmation.tsx** – bestätigt die Abmeldung von einem Event vor dem Senden der Anfrage zum Löschen des Eintrags aus der Tabelle `event_attendees`.

---

## Integration mit der Backend-API

Der Client kommuniziert mit einem RESTful-API-Backend, das auf eine SQLite-Datenbank zugreift.

### Authentifizierung
Geschützte Routen nutzen JWT (JSON Web Tokens).  
Der Token wird im Header `Authorization: Bearer <token>` übertragen.

### Teilnehmer
Die Anmeldung zu Events erfolgt über einen autorisierten POST-Request an den Endpunkt:

`/events/:id/attendees/:userId`

### CORS
Das Backend verfügt über ein vorkonfiguriertes CORS zur Unterstützung der lokalen Entwicklung.

---


