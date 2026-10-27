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
- Bei angemeldeten Benutzern werden die vollständige Event-Liste und die eigenen Teilnahme-Events parallel geladen. Beide Requests erhalten den aktuellen Access Token.
- Die Suche nach Event-Titeln nutzt den URL-Suchparameter `query` und vergleicht Titel ohne Beachtung der Groß-/Kleinschreibung.
- Der URL-Suchparameter `category` wird von `CategoryFilter` ID-basiert gesetzt. `Home` berücksichtigt `event.categoryId` sowie IDs oder Namen in `event.categories`. Ohne Kategorieparameter bzw. bei `All` ist kein Kategorie-Filter aktiv.
- Bei Auswahl einer Kategorie entfernt `CategoryFilter` den Suchparameter `query`, sodass eine Kategorieauswahl die Textsuche zurücksetzt. Die Auswahl „Alle Kategorien“ entfernt den Parameter `category`.
- `CategoryFilter` lädt die verfügbaren Kategorien über `getCategories(accessToken)` und damit authentifiziert über `GET /categories`. Während des Abrufs wird ein Ladezustand angezeigt; Ladefehler werden als Meldung dargestellt. Alte URLs, in denen statt einer Kategorie-ID ein Kategoriename steht, werden bei passender Kategorie auf die ID umgestellt.
- Die Event-Ergebnisse werden über die wiederverwendbare `Collection`-Komponente dargestellt. Lade- und Fehlerzustände sind vorgesehen.
- Teilnahme-IDs werden im Frontend gehalten, damit Karten den Status als Veranstalter oder Teilnehmer darstellen können.

### Registrierung und Anmeldung
- `LoginModal` bietet sowohl die Benutzeranmeldung als auch eine Auswahl des Registrierungsmodus: beim Klick auf „Hier klicken“ wird innerhalb des bestehenden Modalfensters eine Auswahl mit zwei Registrierungsoptionen angezeigt:
  - **Neues Team erstellen:** Weiterleitung zu `/register?type=owner` für die Registrierung eines Tenant-Owners.
  - **Mit Einladung beitreten:** Weiterleitung zu `/register?type=member` für die Registrierung eines Tenant-Members.
Vor der Navigation zur Registrierungsseite wird das Modalfenster geschlossen. Über „Zurück zur Anmeldung“ kann zur Login-Form zurückgekehrt werden, ohne das Modal zu schließen. Beim erneuten Öffnen des Modals wird wieder die Login-Ansicht angezeigt.
- `Register` (`src/pages/profile/Register.tsx`) stellt die Überschrift „Account erstellen“, einen kurzen Einführungstext und anschließend die Komponente `RegisterForm` dar.
- `RegisterForm` (`\src\components\shared\RegisterForm.tsx`) liest den Registrierungsmodus aus dem URL-Parameter `type`. Bei `owner `wird zusätzlich das Feld Teamsname angezeigt; bei `member` wird der Einladungscode abgefragt.
Beide Registrierungsmodi verwenden gemeinsame Formularfelder für Name, E-Mail-Adresse, Passwort, Passwortbestätigung und optionalen Avatar. Vor dem Absenden des Registrierungsformulars wird ein ausgewählter Avatar über die vorhandene Cloudinary-Upload-Funktion hochgeladen. Ohne ausgewählte Datei wird die vorhandene Formular-URL verwendet; ist diese nicht gesetzt, wird ein leerer String übermittelt.
- Die Registrierung meldet den Benutzer nicht automatisch an. Nach erfolgreicher Registrierung zeigt `RegisterForm` eine Bestätigung an. Die Schaltfläche „Einloggen“ navigiert zur Startseite und übergibt den Navigationszustand `openLoginModal: true`; `Header` öffnet daraufhin das Login-Modal und entfernt anschließend den Navigationszustand aus der Browserhistorie.
- Fehler der Registrierung werden dem Benutzer angezeigt; das Formular kann nach einem fehlgeschlagenen Request erneut abgesendet werden.
- Die clientseitige Formularvalidierung erfolgt über `Zod` und `zodResolver`.
- Die Anmeldung wird über `LoginModal` angeboten. Bei erfolgreicher Anmeldung übernimmt `setAuth` den zurückgegebenen Benutzer und Access Token in den Authentifizierungskontext. Danach wird das Modal geschlossen. Fehler werden dem Benutzer angezeigt.
- Der Authentifizierungskontext (`AuthProvider` / `useAuth`) stellt unter anderem `user`, `accessToken`, `isSignedIn`, `isLoading`, `setAuth` und `logout` bereit. Beim App-Start wird die Sitzung über `POST /auth/refresh` wiederherzustellen versucht; beim Logout wird `POST /auth/logout` aufgerufen. `apiFetch` setzt `credentials: 'include'`, damit der Browser HttpOnly-Cookies mitsenden und verarbeiten kann.
- Die Member-Registrierung verwendet einen zuvor von einem Tenant-Owner erstellten Einladungscode. Der Client übermittelt den Code im Feld Enladungscode. Ob die Einladung gültig, noch nicht verwendet, nicht widerrufen und nicht abgelaufen ist, wird vom Backend geprüft.
- - Im angemeldeten Zustand zeigt `Header` das Benutzeravatar bzw. ein Fallback-Icon. Das Benutzermenü enthält den Namen bzw. die E-Mail-Adresse des Benutzers und die Abmeldeaktion. Nicht angemeldete Besucher öffnen über das Benutzer-Icon das `Login-Modal`.

### Einladungsverwaltung
- Die Einladungsseite ermöglicht Tenant-Ownern, Einladungen für weitere Teammitglieder zu erstellen, bestehende Einladungen einzusehen und noch gültige Einladungen zu widerrufen.
- `NavItems` ergänzt den Navigationslink „Einladungen“ für Benutzer mit der Rolle `owner`. Die Seite prüft den Authentifizierungsstatus und leitet nicht angemeldete Benutzer sowie Benutzer mit einer anderen Rolle zur Startseite weiter. Die verbindliche Berechtigungsprüfung erfolgt im Backend.
- Für alle Einladungsrequests wird der Access Token übergeben.
- Beim Erstellen einer Einladung sendet der Client einen Ablaufzeitpunkt (`expiresAt`) im RFC3339-Format an die API. Aktuell wird dieser Zeitpunkt im Frontend auf sieben Tage nach der Erstellung gesetzt.
- Das Backend gibt den neu generierten `invitationCode` bei der Erstellung einmalig zurück. Der Code wird im Frontend angezeigt und kann über die Zwischenablage kopiert werden. Er wird nicht erneut vom Backend abgerufen. Vor dem Ersetzen eines noch nicht als kopiert markierten Codes erscheint ein Bestätigungsdialog. Nach erfolgreichem Kopieren wird der entsprechende Status in der Oberfläche angezeigt.
- Die Einladungsübersicht zeigt die ID sowie die Zeitpunkte der Erstellung, des Ablaufs, der Verwendung und des Widerrufs. Zeitstempel ohne Zeitzonenangabe werden vom Frontend als UTC interpretiert und für die Anzeige in deutscher Lokalzeit formatiert.
- Bereits verwendete, widerrufene oder abgelaufene Einladungen können über die Oberfläche nicht widerrufen werden.
- Nach einem erfolgreichen Widerruf wird der lokale Datensatz durch Setzen von `revokedAt` aktualisiert. Der DELETE-Request wird als `204 No Content` ohne Response-Body verarbeitet.
- Lade-, Erstellungs- und Widerrufsfehler sowie erfolgreiche Aktionen werden dem Benutzer über sichtbare Statusmeldungen angezeigt.

### Profilverwaltung
- Die Profilseite zeigt Avatar, Namen, E-Mail-Adresse und – sofern vorhanden – die Biografie (`bio`). Fehlt ein anzeigbares Avatarbild, werden die Initialen des Namens als Fallback verwendet.
- Die Profilbearbeitung ist unter `/profile/update` erreichbar.
- Die Benutzer-API stellt die Funktion `updateUserProfile` zum Aktualisieren des Profils bereit. Der Request-Payload umfasst `name` sowie optionale Werte für `bio` und `avatarUrl`; die Antwort ist als `{ user, message? }` typisiert.
- Für Avatar-Uploads ist in der Upload-Funktion ein eigenes Cloudinary-Preset vorgesehen.
- Die Profilseite hat getrennte Tabs für **Teilnehmer** und **Ersteller**. Standardmäßig ist `Ersteller` ausgewählt. Organisierte Events und Teilnahme-Events werden nach Vorliegen einer Benutzer-ID parallel geladen; ein Cleanup-Flag verhindert nach dem Unmount die Übernahme verspäteter Antworten.
- Während des Ladens und bei Fehlern werden entsprechende Zustände angezeigt. Für beide Eventlisten verwendet die Profilseite `Collection` mit einem Limit von 6 Einträgen.
- Nach dem Löschen eines organisierten Events oder dem Verlassen eines Events entfernt `Profile` das betreffende Event über einen Callback aus der jeweiligen lokalen Liste, ohne dass die Profilseite vollständig neu geladen werden muss.


### Event-Verwaltung (CRUD)
- Die Event-API unterstützt das Abrufen aller Events, eines einzelnen Events und der vom Benutzer organisierten Events sowie das Erstellen, Aktualisieren und Löschen von Events. Alle Event-Funktionen erwarten einen Access Token.
- Das gemeinsame Formular `EventForm` wird sowohl zum Erstellen als auch zum Bearbeiten verwendet.
- Event-Daten umfassen Titel, Beschreibung, Kategorie, Start- und Enddatum mit Uhrzeit, Veranstaltungsort bzw. Online-Hinweis, Bild und optionale externe URL.
- Die Datums- und Zeitauswahl erfolgt über `react-datepicker` mit deutscher Locale. Vor dem API-Aufruf werden Start- und Endzeit in ISO-Strings umgewandelt.
- Wurde eine neue Bilddatei ausgewählt, wird sie zuerst zu Cloudinary hochgeladen. Die zurückgegebene URL wird als `imageUrl` in den Event-Payload übernommen. Ohne neue Datei wird die vorhandene Formular-URL beibehalten.
- `Dropdown` lädt die verfügbaren Kategorien über `GET /categories`. Beim Anlegen einer neuen Kategorie wird zunächst nur ein temporärer Frontend-Eintrag mit einer ID im Format `new:<Name>` erzeugt; ein separater Kategorie-Erstellungsrequest wird von dieser Komponente nicht gesendet.
- Bereits vorhandene Kategorien werden über `categoryId` übertragen. Beginnt der Kategorienwert mit `new:`, sendet `EventForm` stattdessen den bereinigten Namen als `categoryName`. Die dauerhafte Verarbeitung der Kategorie erfolgt im Rahmen der Event-Verarbeitung durch das Backend; ein separater Kategorie-Create-Endpunkt wird vom Client-Code nicht aufgerufen.
- Nach erfolgreichem Erstellen oder Aktualisieren navigiert das Formular zur Detailseite des gespeicherten Events. Beim Erstellen wird das Formular zurückgesetzt; während des Speicherns ist der Submit-Button deaktiviert.
- In Event-Karten können Veranstalter ihre eigenen Events über einen Bestätigungsdialog löschen. Nach erfolgreichem Löschen wird ein optionaler Callback zur lokalen Listenaktualisierung aufgerufen. Teilnehmer können nach Bestätigung ihre Teilnahme beenden.
- `Collection` zeigt zunächst eine begrenzte Zahl von Events und bietet bei weiteren Ergebnissen die Schaltfläche **Mehr anzeigen**.
- `EventDetails` lädt Event und Teilnehmerliste getrennt. Beide Requests benötigen einen Access Token. Ohne Token zeigt die Seite einen Hinweis zur Anmeldung, statt Eventdaten oder Teilnehmer abzurufen. Die Teilnahme-Aktion setzt einen angemeldeten Benutzer und einen Access Token voraus, verhindert doppelte lokale Anmeldungen und gleicht die Teilnehmerliste nach erfolgreichem Beitritt erneut mit dem Backend ab.


### Teilnahmesystem
- Getrennte Ansicht von Events über Tab-Navigation:
  - **Ersteller** – vom Nutzer erstellte Veranstaltungen  
  - **Teilnehmer** – Events, bei denen er als Teilnehmer eingetragen ist
- Die Detailseite eines Events zeigt die Teilnehmerliste und ermöglicht angemeldeten Benutzern, sich als Teilnehmer einzutragen. Die Teilnahme-Requests werden mit Access Token ausgeführt.


### Suche & Filterung
- Suchleiste zur Suche anhand des Event-Titels.
- Kategorienfilter zum Auffinden passender Events; die ausgewählte Kategorie wird über den URL-Parameter `category` repräsentiert.
- Die Suche verwendet den URL-Parameter `query`. Bei Auswahl einer konkreten Kategorie wird `query` zurückgesetzt, damit Textsuche und Kategorieauswahl sich gegenseitig ausschließen. 

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
- API-Module für Authentifizierung, Events, Teilnahmen, Kategorien, Einladungen und Benutzerprofile
- Authentifizierte Requests mit Access Token; `apiFetch` bindet außerdem Cookies über `credentials: 'include'` ein
- JSON-Requests für die Event-Verwaltung, Teilnahmeaktionen, Einladungen und Profiländerungen

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
│   │   ├── auth.ts         # API-Funktionen für Authentifizierung
│   │   ├── invitations.ts  # API-Funktionen zur Einladungsverwaltung
│   │   ├── events.ts       # API-Funktionen zur Event-Verwaltung
│   │   ├── attendees.ts    # API-Funktionen zur Verwaltung von Event-Teilnahmen
│   │   ├── categories.ts   # API-Funktion zum Abrufen von Kategorien
│   │   ├── upload.ts       # Upload von Event- und Profilbildern zu Cloudinary
│   │   └── users.ts        # API-Funktion zur Aktualisierung des Benutzerprofils
│   ├── assets/
│   │     ├── icons/
│   │     └── images/
│   ├── components/
│   │   ├── shared/                    # Wiederverwendbare Komponenten der Geschäftslogik
│   │   │   ├── Card.tsx               # Karte einer einzelnen Veranstaltung (Event-Karte)
│   │   │   ├── CategoryFilter.tsx     # Komponente zur Filterung von Events nach Kategorien
│   │   │   ├── Collection.tsx         # Liste von Event-Karten
│   │   │   ├── DeleteConfirmation.tsx # Bestätigungsdialog für das Löschen eines Events
│   │   │   ├── Dropdown.tsx           # Kategorieauswahl mit temporären Kategorien
│   │   │   ├── EventForm.tsx          # Formular zum Erstellen / Bearbeiten von Events
│   │   │   ├── FileUploader.tsx       # Drag-and-Drop-Upload für Bilder
│   │   │   ├── Footer.tsx      
│   │   │   ├── Header.tsx             # Header mit Logo, Benutzer-Menü und Login-Modal
│   │   │   ├── LeaveConfirmation.tsx  # Bestätigungsdialog zum Verlassen eines Events
│   │   │   ├── MobileNav.tsx          # Responsives Hamburger-Menü
│   │   │   ├── NavItems.tsx           # Navigationslinks, einschließlich Owner-Link zu Einladungen
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
│   │   └── index.ts   # Konstanten und Standardwerte (eventDefaultValues,registerDefaultValues)
│   ├── hooks/
│   │   └── useAuth.tsx          # Authentifizierungsstatus und Sitzungswiederherstellung
│   ├── layouts/
│   │   └── RootLayout.tsx       # Hauptlayout der Anwendung (Header, Outlet und Footer)
│   ├── lib/
│   │   ├── api.ts               # Zentraler HTTP-Helper mit Token- und Cookie-Handling   
│   │   ├── utils.ts             # Hilfsfunktionen / Utilities (cn, getInitials etc.)
│   │   └── validator.ts         # Zod-Validierungsschemata (eventFormSchema, profileFormSchema)
│   ├── pages/
│   │   ├── Home.tsx                # Landingpage bzw. Event-Übersicht
│   │   ├── events/
│   │   │   ├── CreateEvent.tsx     # Seite zum Erstellen eines neuen Events
│   │   │   ├── EventDetails.tsx    # Detailseite eines Events
│   │   │   └── UpdateEvent.tsx     # Seite zum Bearbeiten eines Events
│   │   ├── profile/
│   │   │   ├── Profile.tsx         # Persönlicher Benutzerbereich (Informationen und Tabs)
│   │   │   ├── Register.tsx        # Seite zur Erstellung eines neuen Benutzerkontos
│   │   │   └── UpdateProfile.tsx   # Seite zum Bearbeiten des Profils
│   │   └── inviations/
│   │       └── InvitationPage.tsx  # Erstellen, Anzeigen und Widerrufen von Einladungen
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
- `registrationType`: Pflichtfeld; zulässige Werte sind `owner` und `member`
- `companyName`: bei `owner` erforderlich; wird über das Formularfeld Teamsname eingegeben
- `invitationCode`: bei `member` erforderlich; wird über das Formularfeld Einladungscode eingegeben
- `name`: Pflichtfeld; mindestens 2 Zeichen
- `email`: Pflichtfeld; muss eine gültige E-Mail-Adresse sein
- `password`: mindestens 8 Zeichen; maximal 72 Bytes gemäß Backend-Anforderung
- `confirmPassword`: muss mit `password` übereinstimmen
- `avatarUrl`: optional; enthält nach einem erfolgreichen Cloudinary-Upload die URL des Avatars
Bei den Feldern `companyName` und `invitationCode` bleibt die serverseitige Validierung maßgeblich; ungültige oder bereits verwendete Einladungen sowie bereits registrierte E-Mail-Adressen können zur Ablehnung der Registrierung führen.


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
| `/register` | `Register` | Registrierung; Auswahl des Modus über ?type=owner oder ?type=member |
| `/invitations` | `InvitationPage` | Einladungen für Teammitglieder verwalten; im Frontend auf Owner beschränkt |
| `/events/:id` | `EventDetails` | Event-Details und Teilnahme |
| `/events/create` | `CreateEvent` | Neues Event erstellen |
| `/events/:id/update` | `UpdateEvent` | Event bearbeiten |
| `/profile` | `Profile` | Eigenes Profil und eigene Events |
| `/profile/update` | `UpdateProfile` | Profil bearbeiten |

Alle Routen werden innerhalb des `RootLayout` gerendert.
`AuthProvider` umschließt den Router und stellt den Authentifizierungszustand bereit. Die rollenabhängige Navigation wird über `NavItems` gesteuert; die Berechtigungsprüfung muss zusätzlich im Backend erfolgen.

---

## Zentrale Komponenten und Datenflüsse
### `Home` (`src/pages/Home.tsx`)
Bei angemeldeten Benutzern lädt `Home` `getAllEvents(accessToken)` und `getEventsByAttendee(user.id, accessToken)` mit `Promise.all`. Während Authentifizierungs- und Event-Daten geladen werden, zeigt die Seite Ladezustände an. Fehler beim Laden führen zu einer sichtbaren Fehlermeldung. Bei erfolgreichem Abruf speichert der Client Events und Teilnahme-IDs separat. Löschen eines Events entfernt es aus der lokalen Event-Liste; Verlassen eines Events entfernt dessen ID aus den Teilnahme-IDs. Bei Gästen wird stattdessen die Landingpage angezeigt.

### `EventForm` (`src/components/shared/EventForm.tsx`)
Das Formular verwendet `useForm`, `zodResolver(eventFormSchema)`, `DatePicker`, `Dropdown` und `FileUploader`. Die DatePicker sind auf Deutsch lokalisiert und zeigen Datum und Uhrzeit im Format `dd.MM.yyyy HH:mm` an. Im Update-Modus werden vorhandene Event-Daten als Initialwerte verwendet und Start- sowie Endzeit in `Date`-Objekte umgewandelt. Für die Kategorie wird `event.categoryId` bevorzugt; als Fallback prüft der Code zusätzlich `(event as any).category?.id`.

Beim Absenden wird – sofern eine Datei ausgewählt wurde – die erste Datei aus `files` zu Cloudinary hochgeladen; andernfalls wird die vorhandene `imageUrl` übernommen. Die Datumswerte werden in ISO-Strings umgewandelt. Für eine bestehende Kategorie wird `categoryId`, für einen temporären Wert mit `new:` stattdessen `categoryName` gesendet. Die optionale URL wird bei leerem Wert als leerer String übertragen. Anschließend ruft das Formular `createEvent` oder `updateEvent` auf und navigiert zur gespeicherten Event-Detailseite. Fehler werden in der Konsole protokolliert und über `alert` angezeigt.

### `Dropdown` (`src/components/shared/Dropdown.tsx`)
`Dropdown` lädt beim Mounten alle Kategorien über `GET /categories`. Neue Kategorien werden über einen Dialog eingegeben und zunächst nur lokal gespeichert; ihre temporäre ID hat das Format `new:<Name>`. Vor dem Anlegen prüft die Komponente Namen ohne Beachtung der Groß-/Kleinschreibung. Existiert bereits eine gleichnamige Kategorie, wird deren vorhandene ID ausgewählt. Der Name des neuen Eintrags ist im Eingabefeld auf 100 Zeichen begrenzt.

Die Auswahl einer normalen Kategorie wird unmittelbar an das Formular weitergegeben. Werden neue Kategorien angelegt, während der initiale API-Request noch läuft, führt die Komponente die zurückgegebenen Daten mit zwischenzeitlich angelegten temporären Kategorien zusammen, sofern nicht bereits eine Kategorie gleichen Namens existiert. Ladefehler werden als Meldung unter dem Dropdown angezeigt. Das Dialogfenster und das Select-Dropdown haben getrennte Öffnungszustände.

### `CategoryFilter` (`src/components/shared/CategoryFilter.tsx`)

`CategoryFilter` wartet zunächst auf die Authentifizierungsprüfung und lädt Kategorien anschließend mit `getCategories(accessToken)` über `GET /categories` . Ohne Access Token werden keine Kategorien geladen und eine entsprechende Meldung wird angezeigt. Die ausgewählte Kategorie-ID wird in den URL-Parameter `category` geschrieben. Die Option „Alle Kategorien“ entfernt diesen Parameter. Bei Auswahl einer konkreten Kategorie wird außerdem `query` entfernt, wodurch die vorherige Textsuche zurückgesetzt wird. Die Änderungen erfolgen mit `setSearchParams(..., { replace: true })`, also ohne einen zusätzlichen Eintrag in der Browserhistorie.

Für ältere URLs, die statt einer Kategorie-ID einen Kategorienamen enthalten, sucht der Filter nach einem case-insensitiven Namens-Match und ersetzt den URL-Wert durch die passende ID. Während des Abrufs wird ein Ladeeintrag angezeigt; Fehler werden sichtbar dargestellt.

### `UpdateEvent` (`src/pages/events/UpdateEvent.tsx`)

Die Seite liest die Event-ID aus dem URL-Parameter, lädt die Veranstaltung über `getEventById` und unterscheidet zwischen Lade-, Fehler- und Erfolgszustand. Bei Erfolg übergibt sie das Event sowie dessen ID als String an `EventForm` im Modus `Update`.

### `EventDetails` (`src/pages/events/EventDetails.tsx`)

Event und Teilnehmerliste werden getrennt geladen, nachdem die Authentifizierungsprüfung abgeschlossen ist. Beide Requests benötigen einen Access Token. Ist kein Token vorhanden, wird das Laden abgebrochen und ein Hinweis zur Anmeldung angezeigt. Die Effekte nutzen ein `cancelled`-Flag, damit nach dem Aufräumen kein Ergebnis mehr in den Komponentenstatus übernommen wird.

Die Teilnahme-Aktion setzt einen angemeldeten Benutzer und einen Access Token voraus, verhindert doppelte lokale Anmeldungen und aktualisiert nach erfolgreichem Request zunächst den lokalen Teilnehmerstatus. Anschließend wird versucht, die Teilnehmerliste erneut mit dem Backend abzugleichen. Ein Fehler beim erneuten Laden macht die bereits erfolgreiche Teilnahme nicht rückgängig.

### `Card` und `Collection`

 `Collection` legt anhand des `collectionType` eine Standardrolle fest: `Events_Organized` übergibt `owner`, `My_Events` übergibt `attendee`; für `All_Events` wird keine Rolle vorgegeben. `Card` verwendet eine übergebene Rolle vorrangig. Fehlt sie, wird bei vorhandenem `currentUserId` zunächst `event.ownerId` verglichen und anschließend geprüft, ob `event.id` in `attendeeEventIds` enthalten ist. Die Karte zeigt die erste Kategorie, Startdatum und -uhrzeit, Titel, Veranstalternamen und Veranstaltungsort. Veranstalter erhalten Bearbeiten- und Löschen-Aktionen, Teilnehmer eine Aktion zum Verlassen des Events.
`Collection` zeigt standardmäßig 10 Einträge an; die Profilseite übergibt den Wert 6. Jeder Klick auf **Mehr anzeigen** erhöht die sichtbare Anzahl um das jeweilige Limit. Wenn keine Daten vorhanden sind, wird ein konfigurierbarer Leerzustand angezeigt; ein Button zum Erstellen eines Events kann optional eingeblendet werden.

### `Profile` (`src/pages/profile/Profile.tsx`)

Die Seite zeigt Avatar, Namen, E-Mail-Adresse und – sofern vorhanden – `bio`. Für Avatar wird bei fehlendem der Fallback verwendet: fehlende Avatarbilder werden über die Initialen-Fallback-Komponente dargestellt. Links zur Profilbearbeitung werden für mobile und Desktop-Ansichten unterschiedlich gerendert.

Nach Vorliegen einer Benutzer-ID ruft die Seite `getOrganizedEvents(currentUser.id)` und `getEventsByAttendee(currentUser.id)` parallel ab. Standardmäßig ist der Tab `Ersteller` ausgewählt; der andere Tab heißt `Teilnehmer`. Die Seite zeigt Lade- und Fehlerzustände und übergibt der `Collection` die passende Ereignisliste mit `limit={6}`. Nach Löschen oder Verlassen einer Veranstaltung wird die entsprechende lokale Liste anhand der Event-ID gefiltert. Ein Cleanup-Flag verhindert, dass Ergebnisse nach dem Aufräumen des Effekts noch in den Zustand übernommen werden.
Wenn kein angemeldeter Benutzer vorhanden ist, rendert die Komponente `null`.

### `DeleteConfirmation` (`src/components/shared/DeleteConfirmation.tsx`)

Die Komponente stellt einen Bestätigungsdialog für das dauerhafte Löschen eines Events dar. Beim Bestätigen ruft sie `deleteEvent(eventId, accessToken)` auf. Während der Anfrage ist die Aktion deaktiviert und der Buttontext wechselt zu „Wird gelöscht...“. Bei einem Fehler wird dieser in der Konsole protokolliert und eine Fehlermeldung per `alert` angezeigt. Nach erfolgreichem Löschen wird der optionale Callback `onEventDeleted(eventId)` aufgerufen, sodass übergeordnete Listen lokal aktualisiert werden können.

### `LoginModal` (`src/components/shared/LoginModal.tsx`)

`LoginModal` verwaltet die Login-Form sowie die Auswahl des Registrierungsmodus innerhalb desselben Modalfensters. Die Ansicht wird abhängig vom internen Komponentenstatus zwischen Login-Form und Registrierungsauswahl umgeschaltet. Bei erneutem Öffnen wird die Login-Ansicht aktiviert.
Die Anmeldung erfolgt über die Funktion `loginUser` aus `src/api/auth.ts`. Bei erfolgreicher Anmeldung werden der Benutzer und der Access Token über `setAuth` in den Authentifizierungskontext übernommen. Anschließend wird das Modalfenster geschlossen.
Die Registrierungsauswahl bietet zwei Optionen: die Owner-Registrierung mit einem neuen Team und den Beitritt als Member über einen Einladungscode. Die gewählte Option wird über den Query-Parameter `type` an die Registrierungsseite übergeben.

### `Register` (`src/pages/profile/Register.tsx`)

Die Seite rendert den Bereich mit der Überschrift „Account erstellen“, einen kurzen Registrierungshinweis und anschließend `RegisterForm`. Die Felder und der Request-Ablauf sind an die separate Formular-Komponente delegiert.

Nach erfolgreicher Registrierung zeigt `RegisterForm` eine Bestätigung. Die Schaltfläche „Einloggen“ navigiert zur Startseite und übergibt `openLoginModal: true` im Navigation State. `Header` erkennt diesen Zustand, öffnet das Login-Modal und entfernt anschließend den Zustand durch Navigation mit `replace: true`.

### Authentifizierungszustand (`src/hooks/useAuth.tsx`)

Der bisher dokumentierte Ablauf sieht einen globalen Auth-Kontext vor, der Benutzer und Access-Token verwaltet. Beim App-Start wird versucht, eine Sitzung über `/auth/refresh` wiederherzustellen; `isLoading` kennzeichnet die laufende Prüfung. `useAuth` wird unter anderem in `Home`, `EventForm`, `EventDetails`, `Profile` und `DeleteConfirmation` verwendet. 

---

## TypeScript-Datenmodelle (`src/types/index.ts`)

- `User`: `id: number`, `tenantId: number`, `role: "owner"`,  `email: string`; `name`, `bio` und `avatarUrl` sind optional.
- Invitation: `id: number`, `tenantId: number`, `createdBy: number`, `expiresAt: string` und `createdAt: string`; `usedAt` und `revokedAt` sind optional und können `string | null` sein.
- `Category`: `id: string`, `name: string`; `isDefault` ist optional.
- `Event`: `id: number`, `ownerId: number`, `title: string`. `description`, `location`, `imageUrl`, `url`, `categoryName`, `categories`, `categoryId` und `owner` sind optional. `startDateTime` und `endDateTime` haben den Typ `string | Date`; `categories` ist ein Array aus `Category`, `owner` hat den Typ `User | null`.
- `Attendee`: `id`, `userId: number`, `eventId: number`, `user`: `User[] | null`.
- `EventWithDetails`: erweitert `Event` um `attendees: User[]`.

---

## Integration mit der Backend-API
Alle folgenden Pfade sind relativ zur konfigurierten API-Basis-URL zu verstehen.
Die tatsächliche Zusammensetzung der URL sowie Header- und Fehlerbehandlung werden in `apiFetch` implementiert. Bei den hier dokumentierten geschützten Endpunkten übergeben die API-Funktionen den Access Token an `apiFetch`.

### Authentifizierung (`src/api/auth.ts`)

| Funktion | HTTP-Methode und Pfad | Zweck |
|---|---|---|
| `loginUser(payload)` | `POST /auth/login` | Benutzer anmelden und Benutzerobjekt sowie Access Token abrufen |
| `registerUser(payload)` | `POST /auth/register` | Owner oder Member registrieren 

`LoginPayload` enthält die Felder `email` und `password`. Die Antwort wird über den Typ `LoginResponse` mit den Feldern `user` und `accessToken` typisiert.Bei erfolgreicher Anmeldung setzt `LoginModal` diese Werte über `setAuth` in den Auth-Kontext.

`RegisterPayload` ist eine Union aus zwei Varianten: `registrationType: "owner"` mit `companyName` oder `registrationType: "member"` mit `invitationCode`. Beide Varianten enthalten `name`, `email`, `password` sowie optional `avatarUrl` und `bio`. Die Registrierung löst keine automatische Anmeldung aus.

Die API-Funktionen verwenden den zentralen HTTP-Helper `apiFetch` aus `src/lib/api.ts`. Dieser verwaltet die konfigurierte API-Basis-URL, Standard-Header, JSON-Antworten und die Fehlerbehandlung.`apiFetch` setzt außerdem `credentials: 'include'`, damit der Browser HttpOnly-Cookies mitsenden und verarbeiten kann. Das Backend liefert den Access Token separat in der JSON-Antwort und setzt das Refresh-Token-Cookie. 

### Einladungen (`src/api/invitations.ts`)

| Funktion | HTTP-Methode und Pfad | Zweck |
|---|---|---|
| `createInvitation(expiresAt, token)` | `POST /invitations` | Einladung erstellen und den einmalig zurückgegebenen Einladungscode abrufen |
| `getInvitations(token)` | `GET /invitations` | Einladungen des authentifizierten Tenants abrufen |
| `revokeInvitation(invitationId, token)` | `DELETE /invitations/:id` | Eine widerrufbare Einladung widerrufen |

`createInvitation` übermittelt den Ablaufzeitpunkt im Feld `expiresAt`. Die Antwort enthält den neu generierten `invitationCode` sowie den zugehörigen Einladungsdatensatz. Der Klartextcode wird vom Client nur für die Anzeige und das Kopieren verwendet.

`getInvitations` liefert die Einladungsdatensätze für die Übersicht. `revokeInvitation` verarbeitet eine erfolgreiche `DELETE`-Antwort ohne Response-Body (`204 No Content`). Nach erfolgreichem Widerruf aktualisiert `InvitationPage` den lokalen Einladungsdatensatz.

Die Berechtigungsprüfung und die tatsächliche Gültigkeit einer Einladung werden serverseitig durchgesetzt. Die Einschränkung der verfügbaren Aktionen im Frontend dient ausschließlich der Benutzerführung und ersetzt keine Backend-Autorisierung.

### Events (`src/api/events.ts`)

| Funktion | HTTP-Methode und Pfad | Zweck |
|---|---|---|
| `getAllEvents(token)` | `GET /events` | Alle Events abrufen |
| `getOrganizedEvents(userId. token)` | `GET /events?ownerId=<userId>` | Events eines Veranstalters abrufen |
| `getEventById(id, token)` | `GET /events/:id` | Einzelnes Event abrufen |
| `createEvent(payload, token)` | `POST /events` | Event erstellen |
| `updateEvent(eventId, payload, token)` | `PUT /events/:id` | Event aktualisieren |
| `deleteEvent(eventId, token)` | `DELETE /events/:id` | Event löschen |

Alle oben aufgeführten Funktionen erwarten einen Access Token und übergeben ihn an `apiFetch`.

`EventPayload` verlangt `title`, `description`, `imageUrl`, `location`, `startDateTime`, `endDateTime` und `url`. `categoryId` und `categoryName` sind optional; das Formular überträgt je nach Kategorie entweder die ID oder den Namen. `EventForm` wandelt `startDateTime` und `endDateTime` vor dem Request in ISO-Strings u

### Teilnahmen (`src/api/attendees.ts`)

| Funktion | HTTP-Methode und Pfad | Zweck |
|---|---|---|
| `getEventAttendees(eventId)` | `GET /events/:eventId/attendees` | Teilnehmer eines Events abrufen; Rückgabetyp `User[]` |
| `getEventsByAttendee(userId)` | `GET /attendees/:userId/events` | Events abrufen, an denen ein Benutzer teilnimmt |
| `addEventAttendee(eventId, userId, token)` | `POST /events/:eventId/attendees/:userId` | Benutzer als Teilnehmer hinzufügen |
| `leaveEvent(eventId, userId, token)` | `DELETE /events/:eventId/attendees/:userId` | Teilnahme beenden |

Alle Teilnahme-Funktionen erwarten einen Access Token. `getEventsByAttendee` wird auf der Startseite und im Profil zur Ermittlung der Teilnahme-Events verwendet. `getEventAttendees` liefert die Teilnehmer als `User[]`; die Detailseite behandelt zusätzlich eine mögliche `null`-Antwort des Backends als leere Liste.

### Benutzerprofil (`src/api/users.ts`)

| Funktion | HTTP-Methode und Pfad | Zweck |
|---|---|---|
| `updateUserProfile(payload, token?)` | `PUT /users/profile` | Profil aktualisieren |

Der Payload-Typ `UpdateProfilePayload` enthält `name` als Pflichtfeld sowie `bio` und `avatarUrl` als optionale Felder. Die Antwort ist als `UpdateProfileResponse` mit einem `user`-Objekt und optionaler `message` typisiert.

### Kategorien (`src/api/categories.ts`, `Dropdown` und `CategoryFilter`)

| Aufruf | HTTP-Methode und Pfad | Zweck |
|---|---|---|
| `getCategories(token)` | `GET /categories` | Verfügbare Kategorien authentifiziert laden |
| `apiFetch<Category[]>("/categories", { token })` in `Dropdown` | `GET /categories` | Verfügbare Kategorien für die Event-Formularauswahl laden |

`CategoryFilter` verwendet `getCategories`; `Dropdown` ruft `apiFetch` direkt auf. Beide Requests benötigen einen Access Token. Die Komponenten behandeln Ladefehler separat und zeigen eine Fehlermeldung an.

### Event-Payload und Kategorien

`EventForm` erzeugt vor dem Request ein Payload-Objekt und wandelt `startDateTime` und `endDateTime` mit `toISOString()` um. Bei einer bestehenden Kategorie wird `categoryId` gesendet. Ein vom Dropdown erzeugter temporärer Wert mit dem Präfix `new:` wird in `categoryName` umgewandelt. Das Dropdown sendet keinen eigenständigen Request zur Kategorieerstellung; die Verarbeitung des Namens erfolgt im Rahmen des Event-Requests durch das Backend.

---
## Bilder und Dateien: Cloudinary

`uploadToCloudinary(file, type = 'events')` lädt die ausgewählte Datei direkt zu Cloudinary hoch:

1. Der Typ `events` verwendet `VITE_CLOUDINARY_EVENTS_UPLOAD_PRESET`; der Typ `avatars` verwendet `VITE_CLOUDINARY_AVATARS_UPLOAD_PRESET`.
2. Die Funktion erstellt ein `FormData` mit `file` und `upload_preset`.
3. Sie sendet eine `POST`-Anfrage an `https://api.cloudinary.com/v1_1/<cloudName>/image/upload`.
4. Bei erfolgreicher Antwort gibt sie `secure_url` als String zurück.
5. Fehlt die Cloudinary-Konfiguration oder schlägt der Request fehl, wird ein Fehler ausgelöst. Die Fehlermeldung von Cloudinary wird bevorzugt, sofern sie verfügbar ist.

Die resultierende URL wird für Events als `imageUrl` und für Benutzerprofile als `avatarUrl` gespeichert. Die Cloudinary-Funktion verwendet die beiden `VITE_`-Variablen für den Cloud-Namen und die Presets; geheime Schlüssel dürfen nicht als Frontend-Umgebungsvariablen hinterlegt werden.