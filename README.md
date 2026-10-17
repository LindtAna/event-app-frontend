# EventApp Frontend-Client

![React](https://img.shields.io/badge/React-latest-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-latest-3178c6.svg)
![Vite](https://img.shields.io/badge/Vite-latest-ffb020.svg)
![React Router DOM](https://img.shields.io/badge/React_Router_DOM-latest-blue.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-latest-06B6D4.svg)
![shadcn/ui](https://img.shields.io/badge/shadcn_ui--Radix_UI-latest-purple.svg)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-latest-ff69b4.svg)
![Zod](https://img.shields.io/badge/Zod-latest-orange.svg)
![react-datepicker](https://img.shields.io/badge/react--datepicker-latest-red.svg)
![Custom Select](https://img.shields.io/badge/Custom_Select-latest-lightgrey.svg)
![File Uploader](https://img.shields.io/badge/File_Uploader-latest-lightgrey.svg)

## Über das Projekt

Der EventApp Client ist die clientseitige Anwendung einer Event-Management-Plattform, entwickelt auf Basis von React und TypeScript. Die Anwendung bietet Nutzern eine moderne Benutzeroberfläche zur Registrierung, Erstellung eigener Events, Profilverwaltung sowie zur Anmeldung als Teilnehmer für Veranstaltungen anderer Nutzer.

Der Client kommuniziert über eine REST-API mit einem Backend auf Basis von Go (Golang), Gin und SQLite. Formulare verwenden React Hook Form und Zod zur Validierung.
Event-Bilder und Profilavatare werden über Cloudinary hochgeladen.
Der Fokus liegt auf einem komponentenbasierten Ansatz, starker Typisierung, clientseitiger Datenvalidierung und responsiver Benutzeroberfläche (Responsive Design).

---

## Hauptfunktionen

### Startseite und Event-Übersicht

- Nicht angemeldete Besucher sehen eine öffentliche Landingpage mit Hero-Bild und einer Einführung in PlanFuchs.
- Nach erfolgreicher Authentifizierung zeigt die Startseite eine Begrüßung sowie die Event-Übersicht.
- Vor der Entscheidung, welche Ansicht angezeigt wird, wartet `Home` auf den Abschluss der Authentifizierungsprüfung.
- Bei angemeldeten Benutzern werden die vollständige Event-Liste und die eigenen Teilnahme-Events parallel geladen.
- Die Suche nach Event-Titeln nutzt den URL-Suchparameter `query` und vergleicht Titel ohne Beachtung der Groß-/Kleinschreibung.
- Der URL-Suchparameter `category` wird von `CategoryFilter` ID-basiert gesetzt. Die dokumentierte Filterlogik von `Home` berücksichtigt `event.categoryId` sowie IDs oder Namen in `event.categories`; ohne Kategorieparameter bzw. bei `All` ist kein Kategorie-Filter aktiv.
- Bei Auswahl einer Kategorie entfernt `CategoryFilter` den Suchparameter `query`, sodass eine Kategorieauswahl die Textsuche zurücksetzt. Die Auswahl „Alle Kategorien“ entfernt den Parameter `category`.
- `CategoryFilter` lädt die verfügbaren Kategorien über `GET /categories`, zeigt einen Ladezustand und stellt Ladefehler als Meldung dar. Alte URLs, in denen statt einer Kategorie-ID ein Kategoriename steht, werden bei passender Kategorie auf die ID umgestellt.
- Die Ergebnisse werden über die wiederverwendbare `Collection`-Komponente dargestellt. Lade- und Fehlerzustände sind vorgesehen.
- Teilnahme-IDs werden im Frontend gehalten, damit Karten den Status als Veranstalter oder Teilnehmer darstellen können.

### Registrierung und Anmeldung

- `Register` (`src/pages/profile/Register.tsx`) stellt die Überschrift „Account erstellen“, einen kurzen Einführungstext und anschließend die Komponente `RegisterForm` dar.
- Das Registrierungsformular ist laut bisher dokumentiertem Validierungsschema für Name, E-Mail-Adresse, Passwort und Passwortbestätigung vorgesehen; das Schema enthält zusätzlich ein optionales Feld `avatarUrl`. Die aktuelle Implementierung von `RegisterForm` selbst wurde in dieser Aktualisierung nicht mitgeliefert.
- Die clientseitige Formularvalidierung erfolgt über Zod und `zodResolver`.
- Die Anmeldung wird über `LoginModal` angeboten. Der Authentifizierungszustand wird über `AuthProvider` und `useAuth` bereitgestellt.
- Der bisher dokumentierte Authentifizierungsablauf sieht beim App-Start einen Aufruf von `POST /auth/refresh` zur Wiederherstellung einer Sitzung und beim Logout `POST /auth/logout` vor. Der Auth-Kontext stellt unter anderem `user`, `accessToken`, `isSignedIn`, `isLoading`, `setAuth` und `logout` bereit.

### Suche & Filterung
- Suchleiste  
- Kategorienfilter zum schnellen Auffinden passender Events  

### Event-Verwaltung (CRUD)

- Die Event-API unterstützt das Abrufen aller Events, eines einzelnen Events und der vom Benutzer organisierten Events sowie das Erstellen, Aktualisieren und Löschen von Events.
- Das gemeinsame Formular `EventForm` wird sowohl zum Erstellen als auch zum Bearbeiten verwendet.
- Event-Daten umfassen Titel, Beschreibung, Kategorie, Start- und Enddatum mit Uhrzeit, Veranstaltungsort bzw. Online-Hinweis, Bild und optionale externe URL.
- Die Datums- und Zeitauswahl erfolgt über `react-datepicker` mit deutscher Locale. Vor dem API-Aufruf werden Start- und Endzeit in ISO-Strings umgewandelt.
- Wurde eine neue Bilddatei ausgewählt, wird sie zuerst zu Cloudinary hochgeladen. Die zurückgegebene URL wird als `imageUrl` in den Event-Payload übernommen. Ohne neue Datei wird die vorhandene Formular-URL beibehalten.
- `Dropdown` lädt die verfügbaren Kategorien über `GET /categories`. Beim Anlegen einer neuen Kategorie wird zunächst nur ein temporärer Frontend-Eintrag mit einer ID im Format `new:<Name>` erzeugt; ein separater Kategorie-Erstellungsrequest wird von dieser Komponente nicht gesendet.
- Bereits vorhandene Kategorien werden über `categoryId` übertragen. Beginnt der Kategorienwert mit `new:`, sendet `EventForm` stattdessen den bereinigten Namen als `categoryName`. Die dauerhafte Verarbeitung der Kategorie ist Aufgabe des Backends und anhand der hier vorliegenden Frontend-Dateien nicht verifiziert.
- Nach erfolgreichem Erstellen oder Aktualisieren navigiert das Formular zur Detailseite des gespeicherten Events. Beim Erstellen wird das Formular zurückgesetzt; während des Speicherns ist der Submit-Button deaktiviert.
- In Event-Karten können Veranstalter ihre eigenen Events über einen Bestätigungsdialog löschen. Nach erfolgreichem Löschen wird ein optionaler Callback zur lokalen Listenaktualisierung aufgerufen. Teilnehmer können nach Bestätigung ihre Teilnahme beenden.
- `Collection` zeigt zunächst eine begrenzte Zahl von Events und bietet bei weiteren Ergebnissen die Schaltfläche **Mehr anzeigen**.

### Profilverwaltung

- Die Profilseite zeigt Avatar, Namen, E-Mail-Adresse und – sofern vorhanden – die Biografie (`bio`). Fehlt ein anzeigbares Avatarbild, werden die Initialen des Namens als Fallback verwendet.
- Die Profilbearbeitung ist unter `/profile/update` erreichbar.
- Die Benutzer-API stellt die Funktion `updateUserProfile` zum Aktualisieren des Profils bereit. Der Request-Payload umfasst `name` sowie optionale Werte für `bio` und `avatarUrl`; die Antwort ist als `{ user, message? }` typisiert.
- Für Avatar-Uploads ist in der Upload-Funktion ein eigenes Cloudinary-Preset vorgesehen.
- Die Profilseite hat getrennte Tabs für **Teilnehmer** und **Ersteller**. Standardmäßig ist `Ersteller` ausgewählt. Organisierte Events und Teilnahme-Events werden nach Vorliegen einer Benutzer-ID parallel geladen; ein Cleanup-Flag verhindert nach dem Unmount die Übernahme verspäteter Antworten.
- Während des Ladens und bei Fehlern werden entsprechende Zustände angezeigt. Für beide Eventlisten verwendet die Profilseite `Collection` mit einem Limit von 6 Einträgen.
- Nach dem Löschen eines organisierten Events oder dem Verlassen eines Events entfernt `Profile` das betreffende Event über einen Callback aus der jeweiligen lokalen Liste, ohne dass die Profilseite vollständig neu geladen werden muss.

### Teilnahmesystem
- Getrennte Ansicht von Events über Tab-Navigation:
  - **Ersteller** – vom Nutzer erstellte Veranstaltungen  
  - **Teilnehmer** – Events, bei denen er als Teilnehmer eingetragen ist

---

## Tech-Stack
### Core
- React  
- TypeScript  
- Vite  

### Routing und Anwendungszustand
- React Router DOM
- React Context API für die Authentifizierung (`AuthProvider` / `useAuth`) 

### Styling und UI
- Tailwind CSS
- shadcn/ui-Komponenten auf Basis von Radix UI
- `lucide-react` für Icons
- Eigene SVG-Icons und globale CSS-Utilities 

### Formulare und Validierung
- React Hook Form
- `@hookform/resolvers` mit `zodResolver`
- Zod-Schemata aus `@/lib/validator`
- `react-datepicker` für Datums- und Zeitauswahl
- `date-fns/locale/de` für die deutsche Datums-/Zeitdarstellung  

### Datei-Uploads
- Eigene `FileUploader`-Komponente
- Cloudinary-Upload über `@/api/upload`
- Getrennte Upload-Presets für Avatare und Event-Bilder über Umgebungsvariablen

### API-Integration
- Gemeinsamer API-Helper `apiFetch` aus `@/lib/api`
- API-Module für Events, Teilnahmen und Benutzerprofile
- Abruf von Kategorien über `apiFetch<Category[]>('/categories')` in `Dropdown` und `CategoryFilter`
- JSON-Requests für die Event-Verwaltung und Profiländerungen

---

## Konfiguration

Die Beispiel-Konfiguration liegt unter `client/.env.example`. Für die lokale Entwicklung sollte eine lokale Umgebungsdatei mit den passenden Werten angelegt werden.
Vite stellt Client-Variablen mit dem Präfix `VITE_` im Frontend-Code bereit. In diesen Variablen sollten daher keine geheimen Schlüssel oder privaten Zugangsdaten abgelegt werden.

- `VITE_API_BASE_URL` legt die Basis-URL der Backend-API fest.
- `VITE_CLOUDINARY_CLOUD_NAME` bezeichnet die Cloudinary-Cloud.
- `VITE_CLOUDINARY_AVATARS_UPLOAD_PRESET` wird für Avatar-Uploads verwendet.
- `VITE_CLOUDINARY_EVENTS_UPLOAD_PRESET` wird für Event-Bilder verwendet.


---

## Repository-Struktur

```
.
├── public/                      # Statische öffentliche Ressourcen
├── src/
│   ├── api/
│   │   ├── events.ts    # API-Funktionen zur Event-Verwaltung
│   │   ├── attendees.ts # API-Funktionen zur Verwaltung von Event-Teilnahmen
│   │   ├── upload.ts    # Upload von Event- und Profilbildern zu Cloudinary
│   │   └── users.ts     # API-Funktion zur Aktualisierung des Benutzerprofils
│   ├── assets/
│   │     ├── icons/
│   │     └── images/
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
│   │   │   ├── RegisterForm.tsx       # Formular zur Registrierung neuer Benutzer
│   │   │   ├── LoginModal.tsx         # Modales Fenster zur Benutzeranmeldung (Login)
│   │   │   └── Search.tsx             # Suchleiste zur Filterung von Events
│   │   │
│   │   └── ui/                  # Atomare Basis-UI-Komponenten (shadcn/ui)
│   │       ├── avatar.tsx
│   │       ├── button.tsx
│   │       ├── form.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── separator.tsx
│   │       ├── input.tsx
│   │       ├── textarea.tsx
│   │       └── ..usw
│   ├── constants/
│   │   ├── index.ts   # Konstanten und Standardwerte (eventDefaultValues,registerDefaultValues)
│   │   └── dummy-data.ts   # Test- / Mock-Daten
│   ├── hooks/
│   │   └── useAuth.tsx  # Verwaltung des Authentifizierungsstatus.Wiederherstellung der Sitzung über HttpOnly-Cookies
│   ├── layouts/
│   │   └── RootLayout.tsx       # Hauptlayout der Anwendung (Header + <Outlet /> + Footer)
│   ├── lib/
│   │   ├── api.ts  # Zentrale API-Funktion für HTTP-Anfragen mit Token- und Cookie-Authentifizierung sowie Fehlerbehandlung   
│   │   ├── utils.ts             # Hilfsfunktionen / Utilities (cn, getInitials etc.)
│   │   └── validator.ts         # Zod-Validierungsschemata (eventFormSchema, profileFormSchema)
│   ├── pages/
│   │   ├── events/
│   │   │   ├── CreateEvent.tsx  # Seite zum Erstellen eines neuen Events
│   │   │   ├── EventDetails.tsx # Detailseite eines Events
│   │   │   └── UpdateEvent.tsx  # Seite zum Bearbeiten eines Events
│   │   └── profile/
│   │       ├── Profile.tsx        # Persönlicher Benutzerbereich (Informationen und Tabs)
│   │       ├── Register.tsx       # Seite zur Erstellung eines neuen Benutzerkontos
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
---

## Formularvalidierung (`src/lib/validator.ts`)
### Event-Formular

| Feld | Validierungsregel |
|---|---|
| `title` | String, mindestens 3 und höchstens 100 Zeichen |
| `description` | String, mindestens 3 und höchstens 400 Zeichen |
| `location` | String, mindestens 3 und höchstens 200 Zeichen |
| `imageUrl` | String; keine zusätzliche URL-Prüfung im Schema |
| `startDateTime` | Muss ein `Date`-Wert sein; Fehlermeldung bei fehlendem/ungültigem Wert |
| `endDateTime` | Muss ein `Date`-Wert sein; zusätzlich Vergleich mit `startDateTime` |
| `categoryId` | Nicht leer |
| `url` | Muss eine gültige URL oder ein leerer String sein |

Die zusätzliche Regel weist `endDateTime` zurück, wenn der Wert **vor** `startDateTime` liegt. 

### Registrierung
- `name`: mindestens 2 Zeichen
- `email`: gültige E-Mail-Adresse
- `password`: mindestens 7 Zeichen
- `confirmPassword`: muss mit `password` übereinstimmen
- `avatarUrl`: optionaler String

### Profilbearbeitung
- `name`: mindestens 2 Zeichen
- `bio`: optional, maximal 200 Zeichen
- `avatarUrl`: optionaler String

---

## Routing
Im `src/App.tsx` registrierten Routen sind:

| Pfad | Komponente | Zweck |
|---|---|---|
| `/` | `Home` | Landingpage bzw. Event-Übersicht |
| `/register` | `Register` | Registrierung |
| `/events/:id` | `EventDetails` | Event-Details und Teilnahme |
| `/events/create` | `CreateEvent` | Neues Event erstellen |
| `/events/:id/update` | `UpdateEvent` | Event bearbeiten |
| `/profile` | `Profile` | Eigenes Profil und eigene Events |
| `/profile/update` | `UpdateProfile` | Profil bearbeiten |

Alle Routen werden innerhalb des `RootLayout` gerendert; `AuthProvider` stellt den Authentifizierungszustand bereit.

---

## Zentrale Komponenten und Datenflüsse
### `Home` (`src/pages/Home.tsx`)
Bei angemeldeten Benutzern lädt `Home` `getAllEvents()` und `getEventsByAttendee(user.id)` mit `Promise.all`. Während Authentifizierungs- und Event-Daten geladen werden, zeigt die Seite Ladezustände an. Fehler beim Laden führen zu einer sichtbaren Fehlermeldung. Bei erfolgreichem Abruf speichert der Client Events und Teilnahme-IDs separat. Löschen eines Events entfernt es aus der lokalen Event-Liste; Verlassen eines Events entfernt dessen ID aus den Teilnahme-IDs. Bei Gästen wird stattdessen die Landingpage angezeigt.

### `EventForm` (`src/components/shared/EventForm.tsx`)
Das Formular verwendet `useForm`, `zodResolver(eventFormSchema)`, `DatePicker`, `Dropdown` und `FileUploader`. Die DatePicker sind auf Deutsch lokalisiert und zeigen Datum und Uhrzeit im Format `dd.MM.yyyy HH:mm` an. Im Update-Modus werden vorhandene Event-Daten als Initialwerte verwendet und Start- sowie Endzeit in `Date`-Objekte umgewandelt. Für die Kategorie wird `event.categoryId` bevorzugt; als Fallback prüft der Code zusätzlich `(event as any).category?.id`.

Beim Absenden wird – sofern eine Datei ausgewählt wurde – die erste Datei aus `files` zu Cloudinary hochgeladen; andernfalls wird die vorhandene `imageUrl` übernommen. Die Datumswerte werden in ISO-Strings umgewandelt. Für eine bestehende Kategorie wird `categoryId`, für einen temporären Wert mit `new:` stattdessen `categoryName` gesendet. Die optionale URL wird bei leerem Wert als leerer String übertragen. Anschließend ruft das Formular `createEvent` oder `updateEvent` auf und navigiert zur gespeicherten Event-Detailseite. Fehler werden in der Konsole protokolliert und über `alert` angezeigt.

### `Dropdown` (`src/components/shared/Dropdown.tsx`)
`Dropdown` lädt beim Mounten alle Kategorien über `GET /categories`. Neue Kategorien werden über einen Dialog eingegeben und zunächst nur lokal gespeichert; ihre temporäre ID hat das Format `new:<Name>`. Vor dem Anlegen prüft die Komponente Namen ohne Beachtung der Groß-/Kleinschreibung. Existiert bereits eine gleichnamige Kategorie, wird deren vorhandene ID ausgewählt. Der Name des neuen Eintrags ist im Eingabefeld auf 100 Zeichen begrenzt.

Die Auswahl einer normalen Kategorie wird unmittelbar an das Formular weitergegeben. Werden neue Kategorien angelegt, während der initiale API-Request noch läuft, führt die Komponente die zurückgegebenen Daten mit zwischenzeitlich angelegten temporären Kategorien zusammen, sofern nicht bereits eine Kategorie gleichen Namens existiert. Ladefehler werden als Meldung unter dem Dropdown angezeigt. Das Dialogfenster und das Select-Dropdown haben getrennte Öffnungszustände.

### `CategoryFilter` (`src/components/shared/CategoryFilter.tsx`)

`CategoryFilter` lädt die Kategorien über `GET /categories` und schreibt die ausgewählte Kategorie-ID in den URL-Parameter `category`. Die Option „Alle Kategorien“ entfernt diesen Parameter. Bei Auswahl einer konkreten Kategorie wird außerdem `query` entfernt, wodurch die vorherige Textsuche zurückgesetzt wird. Die Änderungen erfolgen mit `setSearchParams(..., { replace: true })`, also ohne einen zusätzlichen Eintrag in der Browserhistorie.

Für ältere URLs, die statt einer Kategorie-ID einen Kategorienamen enthalten, sucht der Filter nach einem case-insensitiven Namens-Match und ersetzt den URL-Wert durch die passende ID. Die Komponente zeigt während des Abrufs einen Ladeeintrag und bei Fehlern eine sichtbare Fehlermeldung an.

### `UpdateEvent` (`src/pages/events/UpdateEvent.tsx`)

Die Seite liest die Event-ID aus dem URL-Parameter, lädt die Veranstaltung über `getEventById` und unterscheidet zwischen Lade-, Fehler- und Erfolgszustand. Bei Erfolg übergibt sie das Event sowie dessen ID als String an `EventForm` im Modus `Update`.

### `EventDetails` (`src/pages/events/EventDetails.tsx`)

Event und Teilnehmerliste werden separat geladen. Die Effekte nutzen ein `cancelled`-Flag, damit nach dem Aufräumen kein Ergebnis mehr in den Komponentenstatus übernommen wird. Die Teilnahme-Aktion verlangt `user` und `accessToken`, verhindert doppelte lokale Anmeldungen und aktualisiert nach erfolgreichem Request den Teilnehmerstatus. Anschließend wird versucht, die Teilnehmerliste erneut mit dem Backend abzugleichen.

### `Card` und `Collection`

 `Collection` legt anhand des `collectionType` eine Standardrolle fest: `Events_Organized` übergibt `owner`, `My_Events` übergibt `attendee`; für `All_Events` wird keine Rolle vorgegeben. `Card` verwendet eine übergebene Rolle vorrangig. Fehlt sie, wird bei vorhandenem `currentUserId` zunächst `event.ownerId` verglichen und anschließend geprüft, ob `event.id` in `attendeeEventIds` enthalten ist. Die Karte zeigt die erste Kategorie, Startdatum und -uhrzeit, Titel, Veranstalternamen und Veranstaltungsort. Veranstalter erhalten Bearbeiten- und Löschen-Aktionen, Teilnehmer eine Aktion zum Verlassen des Events.
`Collection` zeigt standardmäßig 10 Einträge an; die Profilseite übergibt den Wert 6. Jeder Klick auf **Mehr anzeigen** erhöht die sichtbare Anzahl um das jeweilige Limit. Wenn keine Daten vorhanden sind, wird ein konfigurierbarer Leerzustand angezeigt; ein Button zum Erstellen eines Events kann optional eingeblendet werden.

### `Profile` (`src/pages/profile/Profile.tsx`)

Die Seite zeigt Avatar, Namen, E-Mail-Adresse und – sofern vorhanden – `bio`. Für Avatar wird bei fehlendem der Fallback verwendet: fehlende Avatarbilder werden über die Initialen-Fallback-Komponente dargestellt. Links zur Profilbearbeitung werden für mobile und Desktop-Ansichten unterschiedlich gerendert.

Nach Vorliegen einer Benutzer-ID ruft die Seite `getOrganizedEvents(currentUser.id)` und `getEventsByAttendee(currentUser.id)` parallel ab. Standardmäßig ist der Tab `Ersteller` ausgewählt; der andere Tab heißt `Teilnehmer`. Die Seite zeigt Lade- und Fehlerzustände und übergibt der `Collection` die passende Ereignisliste mit `limit={6}`. Nach Löschen oder Verlassen einer Veranstaltung wird die entsprechende lokale Liste anhand der Event-ID gefiltert. Ein Cleanup-Flag verhindert, dass Ergebnisse nach dem Aufräumen des Effekts noch in den Zustand übernommen werden.
Wenn kein angemeldeter Benutzer vorhanden ist, rendert die Komponente `null`.

### `DeleteConfirmation` (`src/components/shared/DeleteConfirmation.tsx`)

Die Komponente stellt einen Bestätigungsdialog für das dauerhafte Löschen eines Events dar. Beim Bestätigen ruft sie `deleteEvent(eventId, accessToken)` auf. Während der Anfrage ist die Aktion deaktiviert und der Buttontext wechselt zu „Wird gelöscht...“. Bei einem Fehler wird dieser in der Konsole protokolliert und eine Fehlermeldung per `alert` angezeigt. Nach erfolgreichem Löschen wird der optionale Callback `onEventDeleted(eventId)` aufgerufen, sodass übergeordnete Listen lokal aktualisiert werden können.

### `Register` (`src/pages/profile/Register.tsx`)

Die Seite rendert den Bereich mit der Überschrift „Account erstellen“, einen kurzen Registrierungshinweis und anschließend `RegisterForm`. Die Felder und der Request-Ablauf sind an die separate Formular-Komponente delegiert.

### Authentifizierungszustand (`src/hooks/useAuth.tsx`)

Der bisher dokumentierte Ablauf sieht einen globalen Auth-Kontext vor, der Benutzer und Access-Token verwaltet. Beim App-Start wird versucht, eine Sitzung über `/auth/refresh` wiederherzustellen; `isLoading` kennzeichnet die laufende Prüfung. `useAuth` wird unter anderem in `Home`, `EventForm`, `EventDetails`, `Profile` und `DeleteConfirmation` verwendet. 

---

## TypeScript-Datenmodelle (`src/types/index.ts`)

- `User`: `id: number`, `email: string`; `name`, `bio` und `avatarUrl` sind optional.
- `Category`: `id: string`, `name: string`.
- `Event`: `id` und `ownerId` sind Zahlen; `title` ist erforderlich. `description`, `location`, `imageUrl`, `url`, `categories`, `categoryId` und `owner` sind optional. `startDateTime` und `endDateTime` sind als `string | Date` typisiert. `categories` ist ein Array aus `Category`; `owner` kann `User` oder `null` sein.
- `Attendee`: optionale numerische `id`, numerische `userId` und `eventId` sowie optionales `user`-Objekt (`User | null`).
- `EventWithDetails`: erweitert `Event` um `attendees: User[]`.

---

## Integration mit der Backend-API
Alle folgenden Pfade sind relativ zur konfigurierten API-Basis-URL zu verstehen.
Die tatsächliche Zusammensetzung der URL sowie Header- und Fehlerbehandlung werden in `apiFetch` implementiert.

### Events (`src/api/events.ts`)

| Funktion | HTTP-Methode und Pfad | Zweck |
|---|---|---|
| `getAllEvents()` | `GET /events` | Alle Events abrufen |
| `getOrganizedEvents(userId)` | `GET /events?ownerId=<userId>` | Events eines Veranstalters abrufen |
| `getEventById(id)` | `GET /events/:id` | Einzelnes Event abrufen |
| `createEvent(payload, token?)` | `POST /events` | Event erstellen |
| `updateEvent(eventId, payload, token?)` | `PUT /events/:id` | Event aktualisieren |
| `deleteEvent(eventId, token?)` | `DELETE /events/:id` | Event löschen |

`EventPayload` verlangt die Felder `title`, `description`, `imageUrl`, `location`, `startDateTime`, `endDateTime` und `url`. `categoryId` und `categoryName` sind optional; das Formular überträgt je nach Kategorie entweder die ID oder den Namen. Der Access-Token ist bei den Schreibfunktionen optional typisiert und wird an `apiFetch` weitergegeben.

### Teilnahmen (`src/api/attendees.ts`)

| Funktion | HTTP-Methode und Pfad | Zweck |
|---|---|---|
| `getEventAttendees(eventId)` | `GET /events/:eventId/attendees` | Teilnehmer eines Events abrufen; Rückgabetyp `User[]` |
| `getEventsByAttendee(userId)` | `GET /attendees/:userId/events` | Events abrufen, an denen ein Benutzer teilnimmt |
| `addEventAttendee(eventId, userId, token)` | `POST /events/:eventId/attendees/:userId` | Benutzer als Teilnehmer hinzufügen |
| `leaveEvent(eventId, userId, token)` | `DELETE /events/:eventId/attendees/:userId` | Teilnahme beenden |

Für das Hinzufügen und Beenden einer Teilnahme ist ein Token als erforderlicher Funktionsparameter vorgesehen. `getEventsByAttendee` wird sowohl auf der Startseite als auch im Profil zur Ermittlung der Teilnahme-Events verwendet.

### Benutzerprofil (`src/api/users.ts`)

| Funktion | HTTP-Methode und Pfad | Zweck |
|---|---|---|
| `updateUserProfile(payload, token?)` | `PUT /users/profile` | Profil aktualisieren |

Der Payload-Typ `UpdateProfilePayload` enthält `name` als Pflichtfeld sowie `bio` und `avatarUrl` als optionale Felder. Die Antwort ist als `UpdateProfileResponse` mit einem `user`-Objekt und optionaler `message` typisiert.

### Kategorien (`Dropdown` und `CategoryFilter`)

| Aufruf | HTTP-Methode und Pfad | Zweck |
|---|---|---|
| `apiFetch<Category[]>('/categories')` | `GET /categories` | Verfügbare Kategorien laden |

Sowohl `Dropdown` als auch `CategoryFilter` laden die Kategorien beim ersten Rendern. Beide Komponenten behandeln Ladefehler separat und zeigen eine Fehlermeldung an.

### Event-Payload und Kategorien

`EventForm` erzeugt vor dem Request ein Payload-Objekt und wandelt `startDateTime` und `endDateTime` mit `toISOString()` um. Bei einer bestehenden Kategorie wird `categoryId` gesendet. Ein vom Dropdown erzeugter temporärer Wert mit dem Präfix `new:` wird in `categoryName` umgewandelt. Das Feld `url` wird bei leerem Formularwert als leerer String übertragen. Die konkrete Persistenz- und Bereinigungslogik für Kategorien ist im Backend zu prüfen.

---
## Bilder und Dateien: Cloudinary

`uploadToCloudinary(file, type = 'events')` lädt die ausgewählte Datei direkt zu Cloudinary hoch:

1. Der Typ `events` verwendet `VITE_CLOUDINARY_EVENTS_UPLOAD_PRESET`; der Typ `avatars` verwendet `VITE_CLOUDINARY_AVATARS_UPLOAD_PRESET`.
2. Die Funktion erstellt ein `FormData` mit `file` und `upload_preset`.
3. Sie sendet eine `POST`-Anfrage an `https://api.cloudinary.com/v1_1/<cloudName>/image/upload`.
4. Bei erfolgreicher Antwort gibt sie `secure_url` als String zurück.
5. Fehlt die Cloudinary-Konfiguration oder schlägt der Request fehl, wird ein Fehler ausgelöst. Die Fehlermeldung von Cloudinary wird bevorzugt, sofern sie verfügbar ist.

Die resultierende URL wird für Events als `imageUrl` und für Benutzerprofile als `avatarUrl` gespeichert. Die Cloudinary-Funktion verwendet die beiden `VITE_`-Variablen für den Cloud-Namen und die Presets; geheime Schlüssel dürfen nicht als Frontend-Umgebungsvariablen hinterlegt werden.

