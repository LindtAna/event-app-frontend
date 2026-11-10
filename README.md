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

## Inhaltsverzeichnis

- [Über das Projekt](#uber-das-projekt)
- [Hauptfunktionen](#hauptfunktionen)
  - [Startseite und Event-Übersicht](#startseite-und-event-ubersicht)
  - [Registrierung und Anmeldung](#registrierung-und-anmeldung)
  - [Einladungsverwaltung](#einladungsverwaltung)
  - [Profilverwaltung](#profilverwaltung)
  - [Event-Verwaltung (CRUD)](#event-verwaltung-crud)
  - [Teilnahmesystem](#teilnahmesystem)
  - [Suche & Filterung](#suche--filterung)
- [Tech-Stack](#tech-stack)
  - [Core](#core)
  - [Routing und Anwendungszustand](#routing-und-anwendungszustand)
  - [Styling und UI](#styling-und-ui)
  - [Formulare und Validierung](#formulare-und-validierung)
  - [Datei-Uploads](#datei-uploads)
  - [API-Integration](#api-integration)
- [Konfiguration](#konfiguration)
- [Repository-Struktur](#repository-struktur)
- [Formularvalidierung](#formularvalidierung)
  - [Event-Formular](#event-formular)
  - [Registrierung](#registrierung)
  - [Profilbearbeitung](#profilbearbeitung)
- [Routing](#routing)
- [Zentrale Komponenten und Datenflüsse](#zentrale-komponenten-und-datenflusse)
  - [Home](#home)
  - [LoginModal](#loginmodal)
  - [Register](#register)
  - [Authentifizierungszustand](#authentifizierungszustand)
  - [Profile](#profile)
  - [EventForm](#eventform)
  - [Dropdown](#dropdown)
  - [CategoryFilter](#categoryfilter)
  - [UpdateEvent](#updateevent)
  - [EventDetails](#eventdetails)
  - [Card und Collection](#card-und-collection)
  - [DeleteConfirmation](#deleteconfirmation)
  - [InvitationPage](#invitationpage)
- [TypeScript-Datenmodelle](#typescript-datenmodelle)
- [Integration mit der Backend-API](#integration-mit-der-backend-api)
  - [Authentifizierung](#authentifizierung)
  - [Einladungen](#einladungen)
  - [Events](#events)
  - [Teilnahmen](#teilnahmen)
  - [Benutzerprofil](#benutzerprofil)
  - [Kategorien](#kategorien)
  - [Event-Payload und Kategorien](#event-payload-und-kategorien)
- [Bilder und Dateien: Cloudinary](#bilder-und-dateien-cloudinary)
- [Tests](#tests)
  - [Testkonfiguration](#testkonfiguration)
  - [Unit Tests](#unit-tests)
  - [Komponenten und Hook-Tests](#komponenten-und-hook-tests)
    - [AuthProvider und useAuth](#authprovider-und-useauth)
    - [LoginModal-Integrationstests](#loginmodal-integrationstests)
    - [EventForm-Integrationstests](#eventform-integrationstests)
    - [RegisterForm-Integrationstests](#registerform-integrationstests)
    - [EventDetails-Integrationstests](#eventdetails-integrationstests)
    - [InvitationPage-Integrationstests](#invitationpage-integrationstests)
    - [Profile-Integrationstests](#profile-integrationstests)
    - [Home-Integrationstests](#home-integrationstests)
  - [Testausführung](#testausführung)
  - [Continuous Integration (GitHub Actions)](#continuous-integration-github-actions)

════════════════════════════════════════════════════════════════════════

## Über das Projekt
[Zurück 🡡](#inhaltsverzeichnis)

Der EventApp Client ist die clientseitige Anwendung einer Event-Management-Plattform, entwickelt auf Basis von React und TypeScript. Die Anwendung bietet Nutzern eine moderne Benutzeroberfläche zur Registrierung, Erstellung eigener Events, Profilverwaltung sowie zur Anmeldung als Teilnehmer für Veranstaltungen anderer Nutzer.

Der Client kommuniziert über eine REST-API mit einem Backend auf Basis von Go (Golang), Gin und PostgreSQL. Formulare verwenden React Hook Form und Zod zur Validierung.
Event-Bilder und Profilavatare werden über Cloudinary hochgeladen.
Der Fokus liegt auf einem komponentenbasierten Ansatz, starker Typisierung, clientseitiger Datenvalidierung und responsiver Benutzeroberfläche (Responsive Design).

════════════════════════════════════════════════════════════════════════

## Hauptfunktionen
[Zurück 🡡](#inhaltsverzeichnis)

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
---

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
- Der Authentifizierungszustand wird über die React Context API bereitgestellt. Der `AuthProvider` verwaltet die Authentifizierungsdaten und stellt unter anderem `user`, `accessToken`, `isSignedIn`, `isLoading`, `setAuth` und `logout` über den Authentifizierungskontext zur Verfügung. Der Hook `useAuth` ermöglicht den Zugriff auf diesen Kontext innerhalb der React-Komponenten.
Beim App-Start wird versucht, die Sitzung über `POST /auth/refresh` wiederherzustellen. Beim Logout wird `POST /auth/logout` aufgerufen. `apiFetch` setzt `credentials: 'include'`, damit der Browser HttpOnly-Cookies mitsenden und verarbeiten kann.
- Die Member-Registrierung verwendet einen zuvor von einem Tenant-Owner erstellten Einladungscode. Der Client übermittelt den Code im Feld Enladungscode. Ob die Einladung gültig, noch nicht verwendet, nicht widerrufen und nicht abgelaufen ist, wird vom Backend geprüft.
- - Im angemeldeten Zustand zeigt `Header` das Benutzeravatar bzw. ein Fallback-Icon. Das Benutzermenü enthält den Namen bzw. die E-Mail-Adresse des Benutzers und die Abmeldeaktion. Nicht angemeldete Besucher öffnen über das Benutzer-Icon das `Login-Modal`.
---
[Zurück 🡡](#inhaltsverzeichnis)
### Einladungsverwaltung
- Die Einladungsseite ermöglicht Tenant-Ownern, Einladungen für weitere Teammitglieder zu erstellen, bestehende Einladungen einzusehen und noch gültige Einladungen zu widerrufen.
- `NavItems` ergänzt den Navigationslink „Einladungen“ für Benutzer mit der Rolle `owner`. Die Seite prüft den Authentifizierungsstatus und leitet nicht angemeldete Benutzer sowie Benutzer mit einer anderen Rolle zur Startseite weiter. Die verbindliche Berechtigungsprüfung erfolgt im Backend.
- Für alle Einladungsrequests wird der Access Token übergeben.
- Beim Erstellen einer Einladung sendet der Client einen Ablaufzeitpunkt (`expiresAt`) im RFC3339-Format an die API. Aktuell wird dieser Zeitpunkt im Frontend auf sieben Tage nach der Erstellung gesetzt.
- Das Backend gibt den neu generierten `invitationCode` bei der Erstellung einmalig zurück. Der Code wird im Frontend angezeigt und kann über die Zwischenablage kopiert werden. Er wird nicht erneut vom Backend abgerufen. Vor dem Ersetzen eines noch nicht als kopiert markierten Codes erscheint ein Bestätigungsdialog. Nach erfolgreichem Kopieren wird der entsprechende Status in der Oberfläche angezeigt.
- Die Einladungsübersicht zeigt die ID sowie die Zeitpunkte der Erstellung, des Ablaufs, der Verwendung und des Widerrufs. Zeitstempel ohne Zeitzonenangabe werden vom Frontend als UTC interpretiert und für die Anzeige in deutscher Lokalzeit formatiert.
- Bereits verwendete, widerrufene oder abgelaufene Einladungen können über die Oberfläche nicht widerrufen werden.
- Die Aktion „Widerrufen“ steht nur für aktive, noch nicht verwendete, nicht widerrufene und nicht abgelaufene Einladungen zur Verfügung. Nach einem erfolgreichen Widerruf wird der lokale Datensatz durch Setzen von `revokedAt` aktualisiert. Der DELETE-Request wird als `204 No Content` ohne Response-Body verarbeitet.
- Über die Aktion „Löschen“ können Einladungen unabhängig von ihrem Status dauerhaft aus der Datenbank entfernt werden. Vor dem Löschen wird eine Bestätigung angefordert, da die Operation nicht rückgängig gemacht werden kann. Nach erfolgreicher Löschung entfernt `InvitationPage` den betreffenden Datensatz aus dem lokalen React State, ohne die gesamte Liste erneut laden zu müssen. Das dauerhafte Löschen verwendet den Endpoint `DELETE /invitations/:id/permanent`. Es wird zusätzlich die Tenant-Zugehörigkeit der Einladung geprüft.
- Lade-, Erstellungs- Widerrufs- und Löschfehler sowie erfolgreiche Aktionen werden dem Benutzer über sichtbare Statusmeldungen angezeigt.
--- 
[Zurück 🡡](#inhaltsverzeichnis)
### Profilverwaltung
- Die Profilseite zeigt Avatar, Namen, E-Mail-Adresse und – sofern vorhanden – die Biografie (`bio`). Fehlt ein anzeigbares Avatarbild, werden die Initialen des Namens als Fallback verwendet.
- Die Profilbearbeitung ist unter `/profile/update` erreichbar.
- Die Benutzer-API stellt die Funktion `updateUserProfile` zum Aktualisieren des Profils bereit. Der Request-Payload umfasst `name` sowie optionale Werte für `bio` und `avatarUrl`; die Antwort ist als `{ user, message? }` typisiert.
- Für Avatar-Uploads ist in der Upload-Funktion ein eigenes Cloudinary-Preset vorgesehen.
- Die Profilseite hat getrennte Tabs für **Teilnehmer** und **Ersteller**. Standardmäßig ist `Ersteller` ausgewählt. Organisierte Events und Teilnahme-Events werden nach Vorliegen einer Benutzer-ID parallel geladen; ein Cleanup-Flag verhindert nach dem Unmount die Übernahme verspäteter Antworten.
- Während des Ladens und bei Fehlern werden entsprechende Zustände angezeigt. Für beide Eventlisten verwendet die Profilseite `Collection` mit einem Limit von 6 Einträgen.
- Nach dem Löschen eines organisierten Events oder dem Verlassen eines Events entfernt `Profile` das betreffende Event über einen Callback aus der jeweiligen lokalen Liste, ohne dass die Profilseite vollständig neu geladen werden muss.
---

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
---
[Zurück 🡡](#inhaltsverzeichnis)
### Teilnahmesystem
- Getrennte Ansicht von Events über Tab-Navigation:
  - **Ersteller** – vom Nutzer erstellte Veranstaltungen.
  - **Teilnehmer** – Events, bei denen er als Teilnehmer eingetragen ist.
- Die Detailseite eines Events zeigt die Teilnehmerliste und ermöglicht angemeldeten Benutzern, sich als Teilnehmer einzutragen. Die Teilnahme-Requests werden mit Access Token ausgeführt.
- Die  EventsDetail-Seite zeigt die Teilnehmer über die wiederverwendbare Komponente AttendeeCarousel als horizontale Reihe runder Avatare. Die Anzahl der sichtbaren Avatare passt sich der Bildschirmbreite an. Über Pfeil-Buttons kann die Liste schrittweise durchlaufen werden. Beim Überfahren, Fokussieren oder Anklicken eines Avatars wird der Name des Teilnehmers als Tooltip angezeigt.
---

### Suche & Filterung
- Suchleiste zur Suche anhand des Event-Titels.
- Kategorienfilter zum Auffinden passender Events; die ausgewählte Kategorie wird über den URL-Parameter `category` repräsentiert.
- Die Suche verwendet den URL-Parameter `query`. Bei Auswahl einer konkreten Kategorie wird `query` zurückgesetzt, damit Textsuche und Kategorieauswahl sich gegenseitig ausschließen. 

════════════════════════════════════════════════════════════════════════

## Tech-Stack
[Zurück 🡡](#inhaltsverzeichnis)

### Core
- React  
- TypeScript  
- Vite  

### Routing und Anwendungszustand
- React Router DOM
- React Context API für die globale Authentifizierung (`AuthContext`, `AuthProvider` und `useAuth`)

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

════════════════════════════════════════════════════════════════════════

## Konfiguration
[Zurück 🡡](#inhaltsverzeichnis)

Die Beispiel-Konfiguration liegt unter `client/.env.example`. Für die lokale Entwicklung sollte eine lokale Umgebungsdatei mit den passenden Werten angelegt werden.
Vite stellt Client-Variablen mit dem Präfix `VITE_` im Frontend-Code bereit. In diesen Variablen sollten daher keine geheimen Schlüssel oder privaten Zugangsdaten abgelegt werden.

- `VITE_API_BASE_URL` legt die Basis-URL der Backend-API fest.
- `VITE_CLOUDINARY_CLOUD_NAME` bezeichnet die Cloudinary-Cloud.
- `VITE_CLOUDINARY_AVATARS_UPLOAD_PRESET` wird für Avatar-Uploads verwendet.
- `VITE_CLOUDINARY_EVENTS_UPLOAD_PRESET` wird für Event-Bilder verwendet.


════════════════════════════════════════════════════════════════════════

## Repository-Struktur
[Zurück 🡡](#inhaltsverzeichnis)

```
.
├── .github/
│   └── workflows/
│       └── ci.yml   # GitHub Actions CI: Vitest, ESLint, TypeScript und Vite-Build
│
├── public/          # Statische öffentliche Ressourcen
├── src/
│   ├── api/
│   │   ├── auth.ts         # API-Funktionen für Authentifizierung
│   │   ├── invitations.ts  # API-Funktionen zur Einladungsverwaltung
│   │   ├── events.ts       # API-Funktionen zur Event-Verwaltung
│   │   ├── attendees.ts    # API-Funktionen zur Verwaltung von Event-Teilnahmen
│   │   ├── categories.ts   # API-Funktion zum Abrufen von Kategorien
│   │   ├── upload.ts       # Upload von Event- und Profilbildern zu Cloudinary
│   │   ├── users.ts        # API-Funktion zur Aktualisierung des Benutzerprofils
│   │   │
│   │   ├── auth.test.ts    # Unit-Tests für Login und Registrierung
│   │   └── upload.test.ts  # Unit-Tests für Cloudinary-Uploads
│   │
│   ├── assets/
│   │     ├── icons/
│   │     └── images/
│   ├── components/
│   │   ├── shared/                    # Wiederverwendbare Komponenten der Geschäftslogik
│   │   │   ├── AttendeeCarousel.tsx   # Responsive Teilnehmer-Avatare mit Navigation und Tooltips
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
│   │   │   ├── Search.tsx             # Suchleiste zur Filterung von Events
│   │   │   │
│   │   │   ├──  EventForm.integration.test.tsx  # Integration Tests für das Erstellen und Bearbeiten von Events
│   │   │   ├──  LoginModal.integration.test.tsx  # Integration Tests für Anmeldung und Registrierungsnavigation
│   │   │   └──  RegisterForm.integration.test.tsx  # Integration Tests für Owner-/Member-Registrierung, Avatar-Upload und Navigation
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
│   │   ├── auth-context.ts        # Erstellt und typisiert den Authentifizierungskontext
│   │   ├── AuthProvider.tsx       # Verwaltet den globalen Authentifizierungszustand und die Sitzungswiederherstellung
│   │   ├── useAuth.ts             # Stellt einen Hook für den Zugriff auf den Authentifizierungskontext bereit
│   │   └── AuthProvider.test.tsx  # Unit-Tests für AuthProvider und useAuth
│   │
│   ├── layouts/
│   │   └── RootLayout.tsx       # Hauptlayout der Anwendung (Header, Outlet und Footer)
│   ├── lib/
│   │   ├── api.ts               # Zentraler HTTP-Helper mit Token- und Cookie-Handling   
│   │   ├── utils.ts             # Hilfsfunktionen / Utilities (cn, getInitials etc.)
│   │   ├── validator.ts         # Zod-Validierungsschemata (eventFormSchema, profileFormSchema)
│   │   │
│   │   ├── api.test.ts          # Unit-Tests für den zentralen HTTP-Helper
│   │   └── validator.test.ts    # Unit-Tests der Validierung(Formulare)
│   │
│   ├── pages/
│   │   ├── Home.tsx                  # Landingpage bzw. Event-Übersicht
│   │   ├── Home.integration.test.tsx # Integrationstests für Event-Ladevorgänge, Suche, Kategorie-Filter und URL-Synchronisierung
│   │   │
│   │   ├── events/
│   │   │   ├── CreateEvent.tsx     # Seite zum Erstellen eines neuen Events
│   │   │   ├── EventDetails.tsx    # Detailseite eines Events
│   │   │   ├── UpdateEvent.tsx     # Seite zum Bearbeiten eines Events
│   │   │   │
│   │   │   └── EventDetails.integration.test.tsx  # Integration Tests für Event-Ladevorgänge, Teilnehmerliste und Event-Teilnahme
│   │   ├── profile/
│   │   │   ├── Profile.tsx         # Persönlicher Benutzerbereich (Informationen und Tabs)
│   │   │   ├── Register.tsx        # Seite zur Erstellung eines neuen Benutzerkontos
│   │   │   └── UpdateProfile.tsx   # Seite zum Bearbeiten des Profils
│   │   │   └── Profile.integration.test.tsx  # Integrationstests für Profilansicht, Event-Tabs und lokale Aktualisierung der Eventlisten
│   │   │
│   │   └── invitations/
│   │       ├── InvitationPage.tsx                    # Erstellen, Anzeigen, Widerrufen und Löschen von Einladungen
│   │       └── InvitationPage.integration.test.tsx   # Integrationstests für Einladungsverwaltung, Code-Erstellung, Kopieren, Widerrufen und Löschen
│   │
│   ├── test/
│   │   └── setup.ts  # Gemeinsame Initialisierung der Testumgebung
│   │
│   ├── types/
│   │   └── index.ts  # Globale TypeScript-Interfaces (User, Event, Attendee)
│   │
│   ├── App.tsx           # Hauptkomponente für das Routing
│   ├── index.css         # Globale Tailwind-CSS-Styles und Custom Utilities
│   └── main.tsx          # Einstiegspunkt der React-Anwendung
├── index.html            # Haupt-HTML-Template (Vite)
├── tailwind.config.js    # Tailwind-Konfiguration für Styles und Farbpalette
├── tsconfig.json         # Einstellungen des TypeScript-Compilers
└── package.json          # Abhängigkeiten und npm-Skripte

```
════════════════════════════════════════════════════════════════════════

## Formularvalidierung
(`src/lib/validator.ts`)

[Zurück 🡡](#inhaltsverzeichnis)

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

---
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
---
### Profilbearbeitung
- `name`: mindestens 2 Zeichen
- `bio`: optional, maximal 200 Zeichen
- `avatarUrl`: optionaler String


════════════════════════════════════════════════════════════════════════

## Routing
[Zurück 🡡](#inhaltsverzeichnis)

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

════════════════════════════════════════════════════════════════════════

## Zentrale Komponenten und Datenflüsse
[Zurück 🡡](#inhaltsverzeichnis)

### `Home`
(`src/pages/Home.tsx`)

Bei angemeldeten Benutzern lädt `Home` `getAllEvents(accessToken)` und `getEventsByAttendee(user.id, accessToken)` mit `Promise.all`. Während Authentifizierungs- und Event-Daten geladen werden, zeigt die Seite Ladezustände an. Fehler beim Laden führen zu einer sichtbaren Fehlermeldung. Bei erfolgreichem Abruf speichert der Client Events und Teilnahme-IDs separat. Löschen eines Events entfernt es aus der lokalen Event-Liste; Verlassen eines Events entfernt dessen ID aus den Teilnahme-IDs. Bei Gästen wird stattdessen die Landingpage angezeigt.

---

### `LoginModal`
(`src/components/shared/LoginModal.tsx`)

`LoginModal` verwaltet die Login-Form sowie die Auswahl des Registrierungsmodus innerhalb desselben Modalfensters. Die Ansicht wird abhängig vom internen Komponentenstatus zwischen Login-Form und Registrierungsauswahl umgeschaltet. Bei erneutem Öffnen wird die Login-Ansicht aktiviert.
Die Anmeldung erfolgt über die Funktion `loginUser` aus `src/api/auth.ts`. Bei erfolgreicher Anmeldung werden der Benutzer und der Access Token über `setAuth` in den Authentifizierungskontext übernommen. Anschließend wird das Modalfenster geschlossen.
Die Registrierungsauswahl bietet zwei Optionen: die Owner-Registrierung mit einem neuen Team und den Beitritt als Member über einen Einladungscode. Die gewählte Option wird über den Query-Parameter `type` an die Registrierungsseite übergeben.

---

### `Register`
(`src/pages/profile/Register.tsx`)

Die Seite rendert den Bereich mit der Überschrift „Account erstellen“, einen kurzen Registrierungshinweis und anschließend `RegisterForm`. Die Felder und der Request-Ablauf sind an die separate Formular-Komponente delegiert.

Nach erfolgreicher Registrierung zeigt `RegisterForm` eine Bestätigung. Die Schaltfläche „Einloggen“ navigiert zur Startseite und übergibt `openLoginModal: true` im Navigation State. `Header` erkennt diesen Zustand, öffnet das Login-Modal und entfernt anschließend den Zustand durch Navigation mit `replace: true`.

[Zurück 🡡](#inhaltsverzeichnis)

---
### Authentifizierungszustand
(`src/hooks/`)

Der globale Authentifizierungszustand wird über drei separate Dateien innerhalb von `src/hooks/` implementiert:
- `auth-context.ts`: Erstellt und typisiert den React-Kontext für die Authentifizierung.
- `AuthProvider.tsx`: Verwaltet den Benutzerstatus und den Access-Token. Beim App-Start wird versucht, die Sitzung über `POST /auth/refresh` wiederherzustellen. Außerdem stellt der Provider die Funktionen `setAuth` und `logout` bereit.
- `useAuth.ts`: Stellt den benutzerdefinierten Hook `useAuth` bereit, über den React-Komponenten auf den Authentifizierungskontext zugreifen können.

Der `AuthProvider` umschließt die Anwendung in `App.tsx`. `useAuth` wird unter anderem in `Home`, `EventForm`, `EventDetails`, `Profile` und `DeleteConfirmation` verwendet.

---

### `Profile`
(`src/pages/profile/Profile.tsx`)

Die Seite zeigt Avatar, Namen, E-Mail-Adresse und – sofern vorhanden – `bio`. Für Avatar wird bei fehlendem der Fallback verwendet: fehlende Avatarbilder werden über die Initialen-Fallback-Komponente dargestellt. Links zur Profilbearbeitung werden für mobile und Desktop-Ansichten unterschiedlich gerendert.

Nach Vorliegen einer Benutzer-ID ruft die Seite `getOrganizedEvents(currentUser.id)` und `getEventsByAttendee(currentUser.id)` parallel ab. Standardmäßig ist der Tab `Ersteller` ausgewählt; der andere Tab heißt `Teilnehmer`. Die Seite zeigt Lade- und Fehlerzustände und übergibt der `Collection` die passende Ereignisliste mit `limit={6}`. Nach Löschen oder Verlassen einer Veranstaltung wird die entsprechende lokale Liste anhand der Event-ID gefiltert. Ein Cleanup-Flag verhindert, dass Ergebnisse nach dem Aufräumen des Effekts noch in den Zustand übernommen werden.
Wenn kein angemeldeter Benutzer vorhanden ist, rendert die Komponente `null`.

[Zurück 🡡](#inhaltsverzeichnis)

---

### `EventForm`
(`src/components/shared/EventForm.tsx`)

Das Formular verwendet `useForm`, `zodResolver(eventFormSchema)`, `DatePicker`, `Dropdown` und `FileUploader`. Die DatePicker sind auf Deutsch lokalisiert und zeigen Datum und Uhrzeit im Format `dd.MM.yyyy HH:mm` an. Im Update-Modus werden vorhandene Event-Daten als Initialwerte verwendet und Start- sowie Endzeit in `Date`-Objekte umgewandelt. Für die Kategorie wird `event.categoryId` bevorzugt; als Fallback prüft der Code zusätzlich `(event as any).category?.id`.

Beim Absenden wird – sofern eine Datei ausgewählt wurde – die erste Datei aus `files` zu Cloudinary hochgeladen; andernfalls wird die vorhandene `imageUrl` übernommen. Die Datumswerte werden in ISO-Strings umgewandelt. Für eine bestehende Kategorie wird `categoryId`, für einen temporären Wert mit `new:` stattdessen `categoryName` gesendet. Die optionale URL wird bei leerem Wert als leerer String übertragen. Anschließend ruft das Formular `createEvent` oder `updateEvent` auf und navigiert zur gespeicherten Event-Detailseite. Fehler werden in der Konsole protokolliert und über `alert` angezeigt.

---

### `Dropdown`
(`src/components/shared/Dropdown.tsx`)

`Dropdown` lädt beim Mounten alle Kategorien über `GET /categories`. Neue Kategorien werden über einen Dialog eingegeben und zunächst nur lokal gespeichert; ihre temporäre ID hat das Format `new:<Name>`. Vor dem Anlegen prüft die Komponente Namen ohne Beachtung der Groß-/Kleinschreibung. Existiert bereits eine gleichnamige Kategorie, wird deren vorhandene ID ausgewählt. Der Name des neuen Eintrags ist im Eingabefeld auf 100 Zeichen begrenzt.

Die Auswahl einer normalen Kategorie wird unmittelbar an das Formular weitergegeben. Werden neue Kategorien angelegt, während der initiale API-Request noch läuft, führt die Komponente die zurückgegebenen Daten mit zwischenzeitlich angelegten temporären Kategorien zusammen, sofern nicht bereits eine Kategorie gleichen Namens existiert. Ladefehler werden als Meldung unter dem Dropdown angezeigt. Das Dialogfenster und das Select-Dropdown haben getrennte Öffnungszustände.

[Zurück 🡡](#inhaltsverzeichnis)

---

### `CategoryFilter`
(`src/components/shared/CategoryFilter.tsx`)
`CategoryFilter` wartet zunächst auf die Authentifizierungsprüfung und lädt Kategorien anschließend mit `getCategories(accessToken)` über `GET /categories` . Ohne Access Token werden keine Kategorien geladen und eine entsprechende Meldung wird angezeigt. Die ausgewählte Kategorie-ID wird in den URL-Parameter `category` geschrieben. Die Option „Alle Kategorien“ entfernt diesen Parameter. Bei Auswahl einer konkreten Kategorie wird außerdem `query` entfernt, wodurch die vorherige Textsuche zurückgesetzt wird. Die Änderungen erfolgen mit `setSearchParams(..., { replace: true })`, also ohne einen zusätzlichen Eintrag in der Browserhistorie.

Für ältere URLs, die statt einer Kategorie-ID einen Kategorienamen enthalten, sucht der Filter nach einem case-insensitiven Namens-Match und ersetzt den URL-Wert durch die passende ID. Während des Abrufs wird ein Ladeeintrag angezeigt; Fehler werden sichtbar dargestellt.

---

### `UpdateEvent`
(`src/pages/events/UpdateEvent.tsx`)
Die Seite liest die Event-ID aus dem URL-Parameter, lädt die Veranstaltung über `getEventById` und unterscheidet zwischen Lade-, Fehler- und Erfolgszustand. Bei Erfolg übergibt sie das Event sowie dessen ID als String an `EventForm` im Modus `Update`.

---

### `EventDetails`
(`src/pages/events/EventDetails.tsx`)

Die Event-Detailseite lädt das Event und die zugehörige Teilnehmerliste über zwei getrennte `useEffect`-Hooks, sobald die Authentifizierungsprüfung abgeschlossen ist. Beide Requests benötigen einen Access Token. Ist kein Token vorhanden, werden die Requests nicht ausgeführt und ein entsprechender Hinweis zur Anmeldung angezeigt.

Die Effekte verwenden jeweils ein `cancelled`-Flag, damit nach dem Aufräumen eines Effekts keine verspäteten API-Antworten mehr in den Komponentenstatus übernommen werden. Lade- und Fehlerzustände werden für das Event und die Teilnehmerliste getrennt verwaltet. Ein Fehler beim Laden der Teilnehmer verhindert nicht die Darstellung der Event-Details.

Die Teilnehmer werden über die wiederverwendbare Komponente `AttendeeCarousel` dargestellt. 
Die Teilnahme-Aktion setzt einen angemeldeten Benutzer und einen Access Token voraus.

Nach erfolgreichem Aufruf von `addEventAttendee` wird der aktuelle Benutzer zunächst unmittelbar in die lokale Teilnehmerliste übernommen. Anschließend wird versucht, die Teilnehmerliste erneut über `getEventAttendees` mit dem Backend abzugleichen. Ein Fehler bei diesem Refresh macht die bereits erfolgreiche Teilnahme nicht rückgängig. Fehler bei der eigentlichen Anmeldung werden dem Benutzer angezeigt.

Das Verlassen eines Events wird über die Event-Karte (`Card`) und die Funktion `leaveEvent` umgesetzt.

[Zurück 🡡](#inhaltsverzeichnis)

---

### `Card` und `Collection`
 `Collection` legt anhand des `collectionType` eine Standardrolle fest: `Events_Organized` übergibt `owner`, `My_Events` übergibt `attendee`; für `All_Events` wird keine Rolle vorgegeben. `Card` verwendet eine übergebene Rolle vorrangig. Fehlt sie, wird bei vorhandenem `currentUserId` zunächst `event.ownerId` verglichen und anschließend geprüft, ob `event.id` in `attendeeEventIds` enthalten ist. Die Karte zeigt die erste Kategorie, Startdatum und -uhrzeit, Titel, Veranstalternamen und Veranstaltungsort. Veranstalter erhalten Bearbeiten- und Löschen-Aktionen, Teilnehmer eine Aktion zum Verlassen des Events.
`Collection` zeigt standardmäßig 10 Einträge an; die Profilseite übergibt den Wert 6. Jeder Klick auf **Mehr anzeigen** erhöht die sichtbare Anzahl um das jeweilige Limit. Wenn keine Daten vorhanden sind, wird ein konfigurierbarer Leerzustand angezeigt; ein Button zum Erstellen eines Events kann optional eingeblendet werden.

---

### `DeleteConfirmation`
(`src/components/shared/DeleteConfirmation.tsx`)

Die Komponente stellt einen Bestätigungsdialog für das dauerhafte Löschen eines Events dar. Beim Bestätigen ruft sie `deleteEvent(eventId, accessToken)` auf. Während der Anfrage ist die Aktion deaktiviert und der Buttontext wechselt zu „Wird gelöscht...“. Bei einem Fehler wird dieser in der Konsole protokolliert und eine Fehlermeldung per `alert` angezeigt. Nach erfolgreichem Löschen wird der optionale Callback `onEventDeleted(eventId)` aufgerufen, sodass übergeordnete Listen lokal aktualisiert werden können.

---

### `InvitationPage`
(`src/pages/invitations/InvitationPage.tsx`)

Die Seite ermöglicht Tenant-Ownern die Verwaltung ihrer Einladungen. Nach Abschluss der Authentifizierungsprüfung werden die Einladungen über `getInvitations(accessToken)` geladen. Ein Cleanup-Flag verhindert, dass verspätete API-Antworten nach dem Unmount der Komponente noch in den React State übernommen werden.

Neue Einladungen werden über `createInvitation` erstellt. Der Client übermittelt einen Ablaufzeitpunkt im RFC3339-Format, der aktuell sieben Tage nach dem Erstellungszeitpunkt liegt. Der vom Backend einmalig zurückgegebene Einladungscode wird angezeigt und kann über die Zwischenablage kopiert werden. Vor dem Ersetzen eines noch nicht kopierten Codes fordert die Seite eine Bestätigung an.
Die Aktion „Widerrufen“ verwendet `revokeInvitation`. Sie steht ausschließlich für aktive Einladungen zur Verfügung. Nach erfolgreichem Widerruf aktualisiert die Seite `revokedAt` im lokalen Datensatz, ohne die gesamte Einladungsübersicht erneut zu laden.
Die Aktion „Löschen“ verwendet `deleteInvitation` und entfernt einen Einladungsdatensatz dauerhaft aus der Datenbank. Nach erfolgreicher Antwort `204 No Content` wird der Datensatz unmittelbar aus dem lokalen React State entfernt.
Lade-, Erstellungs-, Kopier-, Widerrufs- und Löschvorgänge werden durch sichtbare Statusmeldungen begleitet. Fehler beim Laden oder Ausführen einer Aktion werden dem Benutzer ebenfalls angezeigt.

Die frontendseitige Rollenprüfung dient der Benutzerführung; die verbindliche Autorisierung und Tenant-Isolation werden vom Backend durchgesetzt.

════════════════════════════════════════════════════════════════════════

## TypeScript-Datenmodelle
(`src/types/index.ts`)

[Zurück 🡡](#inhaltsverzeichnis)

- `User`: `id: number`, `tenantId: number`, `role: "owner"`,  `email: string`; `name`, `bio` und `avatarUrl` sind optional.
- Invitation: `id: number`, `tenantId: number`, `createdBy: number`, `expiresAt: string` und `createdAt: string`; `usedAt` und `revokedAt` sind optional und können `string | null` sein.
- `Category`: `id: string`, `name: string`; `isDefault` ist optional.
- `Event`: `id: number`, `ownerId: number`, `title: string`. `description`, `location`, `imageUrl`, `url`, `categoryName`, `categories`, `categoryId` und `owner` sind optional. `startDateTime` und `endDateTime` haben den Typ `string | Date`; `categories` ist ein Array aus `Category`, `owner` hat den Typ `User | null`.
- `Attendee`: `id`, `userId: number`, `eventId: number`, `user`: `User[] | null`.
- `EventWithDetails`: erweitert `Event` um `attendees: User[]`.

════════════════════════════════════════════════════════════════════════

## Integration mit der Backend-API
[Zurück 🡡](#inhaltsverzeichnis)

Alle folgenden Pfade sind relativ zur konfigurierten API-Basis-URL zu verstehen.
Die tatsächliche Zusammensetzung der URL sowie Header- und Fehlerbehandlung werden in `apiFetch` implementiert. Bei den hier dokumentierten geschützten Endpunkten übergeben die API-Funktionen den Access Token an `apiFetch`.

### Authentifizierung
(`src/api/auth.ts`)
| Funktion | HTTP-Methode und Pfad | Zweck |
|---|---|---|
| `loginUser(payload)` | `POST /auth/login` | Benutzer anmelden und Benutzerobjekt sowie Access Token abrufen |
| `registerUser(payload)` | `POST /auth/register` | Owner oder Member registrieren 

`LoginPayload` enthält die Felder `email` und `password`. Die Antwort wird über den Typ `LoginResponse` mit den Feldern `user` und `accessToken` typisiert.Bei erfolgreicher Anmeldung setzt `LoginModal` diese Werte über `setAuth` in den Auth-Kontext.

`RegisterPayload` ist eine Union aus zwei Varianten: `registrationType: "owner"` mit `companyName` oder `registrationType: "member"` mit `invitationCode`. Beide Varianten enthalten `name`, `email`, `password` sowie optional `avatarUrl` und `bio`. Die Registrierung löst keine automatische Anmeldung aus.

Die API-Funktionen verwenden den zentralen HTTP-Helper `apiFetch` aus `src/lib/api.ts`. Dieser verwaltet die konfigurierte API-Basis-URL, Standard-Header, JSON-Antworten und die Fehlerbehandlung.`apiFetch` setzt außerdem `credentials: 'include'`, damit der Browser HttpOnly-Cookies mitsenden und verarbeiten kann. Das Backend liefert den Access Token separat in der JSON-Antwort und setzt das Refresh-Token-Cookie. 

[Zurück 🡡](#inhaltsverzeichnis)

---
### Einladungen
(`src/api/invitations.ts`)
| Funktion | HTTP-Methode und Pfad | Zweck |
|---|---|---|
| `createInvitation(expiresAt, token)` | `POST /invitations` | Einladung erstellen und den einmalig zurückgegebenen Einladungscode abrufen |
| `getInvitations(token)` | `GET /invitations` | Einladungen des authentifizierten Tenants abrufen |
| `revokeInvitation(invitationId, token)` | `DELETE /invitations/:id` | Eine widerrufbare Einladung widerrufen |
| `deleteInvitation(invitationId, token)` | `DELETE /invitations/:id/permanent` | Eine Einladung unabhängig von ihrem Status dauerhaft aus der Datenbank löschen |

`createInvitation` übermittelt den Ablaufzeitpunkt im Feld `expiresAt`. Die Antwort enthält den neu generierten `invitationCode` sowie den zugehörigen Einladungsdatensatz. Der Klartextcode wird vom Client nur für die Anzeige und das Kopieren verwendet.

`getInvitations` liefert die Einladungsdatensätze für die Übersicht. `revokeInvitation` verarbeitet eine erfolgreiche `DELETE`-Antwort ohne Response-Body (`204 No Content`). Nach erfolgreichem Widerruf aktualisiert `InvitationPage` den lokalen Einladungsdatensatz.

`deleteInvitation` führt einen authentifizierten `DELETE`-Request an `/invitations/:id/permanent` aus. Das Backend löscht den Datensatz dauerhaft, sofern die Einladung zum Tenant des angemeldeten Owners gehört. 

Die Berechtigungsprüfung und die tatsächliche Gültigkeit einer Einladung werden serverseitig durchgesetzt. Die Einschränkung der verfügbaren Aktionen im Frontend dient ausschließlich der Benutzerführung und ersetzt keine Backend-Autorisierung.

[Zurück 🡡](#inhaltsverzeichnis)

---
### Events
(`src/api/events.ts`)
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

[Zurück 🡡](#inhaltsverzeichnis)

---
### Teilnahmen
(`src/api/attendees.ts`)
| Funktion | HTTP-Methode und Pfad | Zweck |
|---|---|---|
| `getEventAttendees(eventId)` | `GET /events/:eventId/attendees` | Teilnehmer eines Events abrufen; Rückgabetyp `User[]` |
| `getEventsByAttendee(userId)` | `GET /attendees/:userId/events` | Events abrufen, an denen ein Benutzer teilnimmt |
| `addEventAttendee(eventId, userId, token)` | `POST /events/:eventId/attendees/:userId` | Benutzer als Teilnehmer hinzufügen |
| `leaveEvent(eventId, userId, token)` | `DELETE /events/:eventId/attendees/:userId` | Teilnahme beenden |

Alle Teilnahme-Funktionen erwarten einen Access Token. `getEventsByAttendee` wird auf der Startseite und im Profil zur Ermittlung der Teilnahme-Events verwendet. `getEventAttendees` liefert die Teilnehmer als `User[]`; die Detailseite behandelt zusätzlich eine mögliche `null`-Antwort des Backends als leere Liste.

[Zurück 🡡](#inhaltsverzeichnis)

---
### Benutzerprofil
(`src/api/users.ts`)
| Funktion | HTTP-Methode und Pfad | Zweck |
|---|---|---|
| `updateUserProfile(payload, token?)` | `PUT /users/profile` | Profil aktualisieren |

Der Payload-Typ `UpdateProfilePayload` enthält `name` als Pflichtfeld sowie `bio` und `avatarUrl` als optionale Felder. Die Antwort ist als `UpdateProfileResponse` mit einem `user`-Objekt und optionaler `message` typisiert.

---
### Kategorien
(`src/api/categories.ts`, `Dropdown` und `CategoryFilter`)
| Aufruf | HTTP-Methode und Pfad | Zweck |
|---|---|---|
| `getCategories(token)` | `GET /categories` | Verfügbare Kategorien authentifiziert laden |
| `apiFetch<Category[]>("/categories", { token })` in `Dropdown` | `GET /categories` | Verfügbare Kategorien für die Event-Formularauswahl laden |

`CategoryFilter` verwendet `getCategories`; `Dropdown` ruft `apiFetch` direkt auf. Beide Requests benötigen einen Access Token. Die Komponenten behandeln Ladefehler separat und zeigen eine Fehlermeldung an.

[Zurück 🡡](#inhaltsverzeichnis)

---
### Event-Payload und Kategorien
`EventForm` erzeugt vor dem Request ein Payload-Objekt und wandelt `startDateTime` und `endDateTime` mit `toISOString()` um. Bei einer bestehenden Kategorie wird `categoryId` gesendet. Ein vom Dropdown erzeugter temporärer Wert mit dem Präfix `new:` wird in `categoryName` umgewandelt. Das Dropdown sendet keinen eigenständigen Request zur Kategorieerstellung; die Verarbeitung des Namens erfolgt im Rahmen des Event-Requests durch das Backend.

════════════════════════════════════════════════════════════════════════

## Bilder und Dateien: Cloudinary
[Zurück 🡡](#inhaltsverzeichnis)

`uploadToCloudinary(file, type = 'events')` lädt die ausgewählte Datei direkt zu Cloudinary hoch:

1. Der Typ `events` verwendet `VITE_CLOUDINARY_EVENTS_UPLOAD_PRESET`; der Typ `avatars` verwendet `VITE_CLOUDINARY_AVATARS_UPLOAD_PRESET`.
2. Die Funktion erstellt ein `FormData` mit `file` und `upload_preset`.
3. Sie sendet eine `POST`-Anfrage an `https://api.cloudinary.com/v1_1/<cloudName>/image/upload`.
4. Bei erfolgreicher Antwort gibt sie `secure_url` als String zurück.
5. Fehlt die Cloudinary-Konfiguration oder schlägt der Request fehl, wird ein Fehler ausgelöst. Die Fehlermeldung von Cloudinary wird bevorzugt, sofern sie verfügbar ist.

Die resultierende URL wird für Events als `imageUrl` und für Benutzerprofile als `avatarUrl` gespeichert. Die Cloudinary-Funktion verwendet die beiden `VITE_`-Variablen für den Cloud-Namen und die Presets; geheime Schlüssel dürfen nicht als Frontend-Umgebungsvariablen hinterlegt werden.

════════════════════════════════════════════════════════════════════════
## Tests
[Zurück 🡡](#inhaltsverzeichnis)

Für die Qualitätssicherung des Frontends werden Vitest und React Testing Library eingesetzt. Die Tests überprüfen die zentrale Authentifizierungslogik, die HTTP-Kommunikation, die API-Funktionendie Formularvalidierung sowie das Verhalten ausgewählter React-Komponenten und deren Integration mit der API.

Die Tests laufen in einer simulierten Browserumgebung auf Basis von jsdom. Externe HTTP-Anfragen werden durch Mock-Funktionen ersetzt. Dadurch können die Tests unabhängig vom laufenden Backend, der Datenbank und dem Cloudinary-Dienst ausgeführt werden.

---
### Testkonfiguration

- **Vitest:** Test-Runner und Assertion-Framework
- **React Testing Library:** Rendering von React-Komponenten und Überprüfung ihres Verhaltens
- **jest-dom:** Zusätzliche DOM-Assertions
- **jsdom:** Simulierte Browserumgebung für React-Tests

Die zentrale Testkonfiguration befindet sich in `vite.config.ts`. Die gemeinsame Testinitialisierung erfolgt über `src/test/setup.ts`. Neben dem automatischen Cleanup nach jedem Test stellt die Setup-Datei zusätzliche Browser-APIs für die Radix-UI-Komponenten bereit.

Da jsdom Pointer Events und Pointer-Capture-Methoden nicht vollständig implementiert, werden `PointerEvent`, `hasPointerCapture`, `setPointerCapture` und `releasePointerCapture` in der Testumgebung ergänzt. Zusätzlich wird `scrollIntoView` bereitgestellt. Dadurch kann insbesondere das Radix Select in den Integrationstests ohne Austausch der eigentlichen UI-Komponente getestet werden.

[Zurück 🡡](#inhaltsverzeichnis)

---
### Unit Tests

#### `API-Helper`
(`src/lib/api.test.ts`)

Die Tests überprüfen die zentrale HTTP-Funktion `apiFetch`, die von den API-Modulen der Anwendung verwendet wird.

- Korrekte URL- und Header-Konfiguration
- Übermittlung von HTTP-Methode, Request-Body und benutzerdefinierten Headern
- Einbindung des Bearer-Tokens in den Authorization-Header
- Verarbeitung von HTTP-Fehlern und Erstellung von `ApiError`
- Auswertung der Fehlermeldungen aus der Serverantwort
- Behandlung ungültiger oder fehlender JSON-Antworten
- Weitergabe von Netzwerkfehlern

Die Funktion `fetch` wird gemockt, sodass die HTTP-Kommunikation isoliert getestet werden kann.

#### `Authentifizierungs-API`
(`src/api/auth.test.ts`)

Tests überprüfen die API-Funktionen loginUser und registerUser:
- Übermittlung der Login-Daten an POST /auth/login
- Übermittlung der Registrierungsdaten für einen Tenant-Owner
- Übermittlung der Registrierungsdaten für einen Tenant-Member einschließlich Einladungscode
- Weitergabe von API-Fehlern an den aufrufenden Code

Dabei wird apiFetch gemockt. Die Tests prüfen insbesondere die korrekte Zuordnung der Request-Parameter und die Serialisierung der Payloads.

[Zurück 🡡](#inhaltsverzeichnis)
#### `Cloudinary-Upload`
(`src/api/upload.test.ts`)

Tests überprüfen die Funktion uploadToCloudinary, die Event-Bilder und Profilavatare direkt zu Cloudinary hochlädt:
- Upload eines Event-Bildes mit dem standardmäßig verwendeten Event-Preset
- Verwendung des separaten Avatar-Presets
- Behandlung einer fehlenden Cloudinary-Cloud-Konfiguration
- Behandlung eines fehlenden Event-Upload-Presets
- Behandlung eines fehlenden Avatar-Upload-Presets
- Weitergabe der von Cloudinary zurückgegebenen Fehlermeldung
- Verwendung einer Standardfehlermeldung, wenn Cloudinary keine konkrete Fehlermeldung liefert

Zusätzlich wird geprüft, ob die Datei und das ausgewählte Upload-Preset korrekt in einem FormData-Objekt übermittelt werden und ob die Funktion die zurückgegebene secure_url liefert.

Die externe fetch-Anfrage wird gemockt. Die Tests benötigen daher keine tatsächliche Verbindung zu Cloudinary.

#### `Validierung`
(`src/lib/validator.test.ts`)

Tests überprüfen die Validierung der Event-, Registrierungs- und Profilformulare:
- **Events:** Feldlängen, erforderliche Kategorie, optionale URL und zeitliche Reihenfolge von Start- und Enddatum
- **Registrierung:** Owner- und Member-Registrierung, Passwortbestätigung, Passwortlänge und erforderliche registrierungstypspezifische Angaben
- **Profil:** Pflichtfelder, gültige E-Mail-Adresse, Mindestlänge des Namens und maximale Bio-Länge
- **Datenbereinigung:** Trimmen von Name und E-Mail-Adresse vor der Rückgabe der validierten Daten

---
[Zurück 🡡](#inhaltsverzeichnis)
### Component and Hook Tests

#### `AuthProvider und useAuth`
(`src/hooks/AuthProvider.test.tsx`)

Die Tests überprüfen den globalen Authentifizierungszustand und die Wiederherstellung einer bestehenden Sitzung:
- Initialisierung des Authentifizierungszustands
- Erfolgreiche Sitzungswiederherstellung über `POST /auth/refresh`
- Behandlung einer fehlgeschlagenen Authentifizierung (HTTP 401)
- Behandlung von Netzwerk- und Serverfehlern
- Aktualisierung des Authentifizierungszustands über `setAuth`
- Erfolgreicher Logout und Zurücksetzen des Zustands
- Zurücksetzen des Zustands auch bei fehlgeschlagenem Logout
- Abbruch der laufenden Sitzungsanfrage beim Unmount des Providers
- Fehlerbehandlung bei der Verwendung von `useAuth` außerhalb eines `AuthProvider`

---
#### `LoginModal Integrationstests`
(`src/components/shared/LoginModal.integration.test.tsx`)**

Die Integrationstests überprüfen das Verhalten des Login-Modals und die Zusammenarbeit mit dem Authentifizierungskontext:
- Erfolgreiche Anmeldung: Aufruf von `loginUser`, Übernahme des Benutzers und Access Tokens in den Authentifizierungskontext sowie Schließen des Modals
- Fehlgeschlagene Anmeldung: Anzeige einer Fehlermeldung; das Modal bleibt geöffnet und der Benutzer bleibt nicht authentifiziert
- Formularvalidierung: Ungültige E-Mail-Adresse und leeres Passwort verhindern den API-Aufruf
- Owner-Registrierung: Navigation zu `/register?type=owner`
- Member-Registrierung: Navigation zu `/register?type=member`

Die Funktion `apiFetch` wird gemockt; der tatsächliche `AuthProvider` bleibt Bestandteil des Tests. Die Navigation wird über einen `MemoryRouter` überprüft. Dadurch können die Interaktionen einschließlich der Aktualisierung des Authentifizierungszustands ohne laufendes Backend getestet werden.

[Zurück 🡡](#inhaltsverzeichnis)

---
#### `EventForm Integrationstests`
(`src/components/shared/EventForm.integration.test.tsx`)

Die Integrationstests überprüfen die wichtigsten Abläufe des gemeinsamen Formulars zum Erstellen und Bearbeiten von Events:
- Erfolgreiches Erstellen eines Events: Aufruf von `createEvent` mit dem korrekten Payload und anschließende Navigation zur Event-Detailseite
- Erfolgreiches Bearbeiten eines bestehenden Events: Aufruf von `updateEvent` mit der korrekten Event-ID und den aktualisierten Daten; die vorhandene Bild-URL bleibt erhalten, wenn kein neues Bild hochgeladen wird
- Formularvalidierung: Ungültige Formulardaten verhindern den API-Aufruf
- Bild-Upload: Aufruf von `uploadToCloudinary` und Übernahme der zurückgegebenen URL in das Event-Payload
- Fehlender Access Token: Anzeige einer Warnmeldung; es wird kein API-Aufruf ausgeführt
- Fehlgeschlagenes Speichern: Anzeige einer Fehlermeldung; eine Navigation zur Event-Detailseite findet nicht statt

Die Event-API, der Cloudinary-Upload und der Authentifizierungskontext werden gemockt. Die Navigation wird über einen `MemoryRouter` überprüft. Für die Formularfelder werden die relevanten UI-Komponenten durch kontrollierte Testimplementierungen ersetzt. Dadurch lassen sich die Formularabläufe unabhängig vom Backend und von Cloudinary testen.

[Zurück 🡡](#inhaltsverzeichnis)

---
#### `RegisterForm Integrationstests` 
(`src/components/shared/RegisterForm.integration.test.tsx`)

Die Integrationstests überprüfen die Registrierungsabläufe für Tenant-Owner und Tenant-Member sowie die zugehörigen Formularaktionen:
- **Owner-Registrierung:** Erfolgreiche Registrierung mit dem Teamnamen; Überprüfung des korrekten API-Payloads.
- **Member-Registrierung:** Erfolgreiche Registrierung mit dem Einladungscode; Überprüfung des korrekten API-Payloads.
- **Avatar-Upload:** Hochladen eines ausgewählten Profilbildes über Cloudinary und Übernahme der zurückgegebenen URL als `avatarUrl` in den Registrierungspayload.
- **Formularvalidierung:** Fehlende Pflichtangaben und nicht übereinstimmende Passwörter verhindern den Registrierungsrequest.
- **Fehler bei der Registrierung:** Anzeige einer Fehlermeldung; das Formular bleibt geöffnet und kann erneut abgesendet werden.
- **Fehler beim Avatar-Upload:** Anzeige einer Fehlermeldung; die Registrierung wird nicht an die API übermittelt.
- **Navigation nach erfolgreicher Registrierung:** Die Schaltfläche „Einloggen“ navigiert zur Startseite und übergibt den Navigationszustand `openLoginModal: true`.
- **Abbrechen der Registrierung:** Die Schaltfläche „Abbrechen“ navigiert zur Startseite, ohne einen Registrierungsrequest auszuführen.

Zusätzlich wird geprüft, ob Name, E-Mail-Adresse, Teamname und Einladungscode vor der Übermittlung durch `trim()` bereinigt werden.
Die Registrierungs-API (`registerUser`), der Cloudinary-Upload (`uploadToCloudinary`) und die `FileUploader`-Komponente werden gemockt. Die Formularvalidierung mit React Hook Form und Zod sowie die Navigation über einen `MemoryRouter` bleiben Bestandteil des tatsächlichen Tests. Dadurch werden die Registrierungsabläufe und die Zusammenarbeit der beteiligten Komponenten ohne laufendes Backend oder eine tatsächliche Verbindung zu Cloudinary überprüft.

[Zurück 🡡](#inhaltsverzeichnis)

---
#### `EventDetails Integrationstests`
(`src/pages/events/EventDetails.integration.test.tsx`)

Die Integrationstests überprüfen das Laden der Event-Detailseite, die Darstellung der Teilnehmerliste und die Anmeldung eines Benutzers zu einem Event:
- **Event laden:** Erfolgreicher Abruf eines Events über `getEventById` und Darstellung der Event-Informationen, einschließlich Titel, Veranstalter, Beschreibung und Veranstaltungsort.
- **Teilnehmer laden:** Erfolgreicher Abruf der Teilnehmer über `getEventAttendees` und Darstellung in der `AttendeeCarousel`-Komponente.
- **Leere Teilnehmerliste:** Behandlung einer `null`-Antwort des Backend-Endpunkts als leere Liste; es wird der Hinweis „Noch keine Teilnehmer.“ angezeigt.
- **Fehler beim Laden des Events:** Anzeige einer Fehlermeldung, wenn der Event-Request fehlschlägt. Die Event-Detailinformationen werden nicht dargestellt.
- **Fehler beim Laden der Teilnehmer:** Anzeige einer Fehlermeldung für die Teilnehmerliste, während die Event-Detailseite weiterhin verfügbar bleibt.
- **Fehlender Access Token:** Anzeige eines Authentifizierungshinweises; die Requests zum Laden des Events und der Teilnehmer werden nicht ausgeführt.
- **Erfolgreiche Teilnahme:** Aufruf von `addEventAttendee` mit der korrekten Event-ID, Benutzer-ID und dem Access Token. Der angemeldete Benutzer wird unmittelbar in die lokale Teilnehmerliste übernommen. Anschließend wird die Liste erneut vom Backend geladen und der Teilnahmestatus in der Benutzeroberfläche aktualisiert.
- **Fehlgeschlagene Teilnahme:** Anzeige einer Fehlermeldung; der Benutzer kann die Teilnahme erneut versuchen.
- **Fehler beim Aktualisieren der Teilnehmerliste:** Eine bereits erfolgreiche Anmeldung bleibt bestehen, auch wenn der anschließende Refresh der Teilnehmerliste fehlschlägt.

Die Event-API (`getEventById`), die Teilnehmer-API (`getEventAttendees`, `addEventAttendee`) und der Authentifizierungshook (`useAuth`) werden gemockt. Die eigentliche `EventDetails`-Komponente, die `AttendeeCarousel`-Komponente und die Navigation über einen `MemoryRouter` bleiben Bestandteil des Tests.
Dadurch werden die wichtigsten Interaktionen zwischen Event-Detailseite, Authentifizierungszustand, API-Funktionen und Teilnehmerdarstellung ohne laufendes Backend überprüft.

[Zurück 🡡](#inhaltsverzeichnis)

---
#### `InvitationPage Integrationstests`
(src/pages/invitations/InvitationPage.integration.test.tsx)

Die Integrationstests überprüfen die Einladungsverwaltung für Tenant-Owner und die Zusammenarbeit der Seite mit den Einladungs-API-Funktionen:
- Erfolgreicher Abruf und Darstellung der Einladungsübersicht über getInvitations. Es wird geprüft, dass der Access Token übergeben wird und die Widerrufsaktion für verwendete, widerrufene und abgelaufene Einladungen deaktiviert ist.
- Einladung erstellen: Aufruf von createInvitation mit dem Access Token und einem Ablaufzeitpunkt im ISO-Format. Der Ablaufzeitpunkt liegt sieben Tage nach der Erstellung. Der neue Einladungscode wird angezeigt und der Datensatz lokal zur Liste hinzugefügt, ohne die Einladungsübersicht erneut abzurufen.
- Ersetzen eines nicht kopierten Codes: Vor dem Erstellen einer weiteren Einladung wird eine Bestätigung angefordert, wenn der vorherige Einladungscode noch nicht kopiert wurde. ere Einladung erstellt und der bisherige Code bleibt erhalten.
- Einladungscode kopieren: Aufruf der Clipboard-API zum Kopieren des Einladungscodes und Anzeige einer entsprechenden Erfolgsmeldung.
- Einladung widerrufen: Aufruf von revokeInvitation für eine aktive Einladung. Anschließend wird revokedAt im lokalen Datensatz aktualisiert und die Widerrufsaktion deaktiviert, ohne die Einladungsübersicht erneut zu laden.
- Einladung dauerhaft löschen und das Löschen abbrechen: Nach Bestätigung wird deleteInvitation aufgerufen und der betreffende Datensatz aus der lokalen Einladungsübersicht entfernt. Eine erneute Abfrage der gesamten Liste ist nicht erforderlich. Wird die Bestätigungsabfrage abgelehnt, wird kein Löschrequest ausgeführt.
- Fehler beim Laden: Schlägt der Abruf der Einladungen fehl, wird eine entsprechende Fehlermeldung angezeigt.

Die Einladungs-API (getInvitations, createInvitation, revokeInvitation, deleteInvitation) und der Authentifizierungshook (useAuth) werden gemockt. 
Die eigentliche InvitationPage-Komponente und die Navigation über einen MemoryRouter bleiben Bestandteil des Tests. Die Clipboard-API und die Bestätigungsdialoge werden ebenfalls durch Testimplementierungen abgebildet.
Dadurch werden die wesentlichen Einladungsabläufe einschließlich der lokalen Zustandsaktualisierung, der Fehlerbehandlung und der Bestätigungsdialoge ohne laufendes Backend überprüft.

[Zurück 🡡](#inhaltsverzeichnis)

---
#### `Profile-Integrationstests`
(`src/pages/profile/Profile.integration.test.tsx`)

Die Integrationstests überprüfen die Profilseite, das Laden der eigenen Veranstaltungen und die Interaktionen mit den beiden Eventlisten:
- **Eventlisten laden:** Paralleler Abruf der organisierten Events über `getOrganizedEvents` und der Teilnahme-Events über `getEventsByAttendee`. Es wird geprüft, dass beide API-Aufrufe mit der korrekten Benutzer-ID und dem Access Token ausgeführt werden.
- **Standardansicht:** Nach dem Laden ist standardmäßig der Tab „Ersteller“ ausgewählt. Die organisierten Events werden angezeigt, die Teilnahme-Events zunächst bleiben ausgeblendet.
- **Tab-Navigation:** Wechsel zwischen den Tabs „Ersteller“ und „Teilnehmer“ sowie Überprüfung der jeweils aktiven Ansicht. Beim Wechsel zwischen den Tabs werden die bereits geladenen Eventlisten wiederverwendet; es erfolgen keine zusätzlichen API-Aufrufe.
- **Organisiertes Event löschen:** Nach Bestätigung des Löschdialogs wird `deleteEvent` mit der korrekten Event-ID und dem Access Token aufgerufen. Anschließend wird das gelöschte Event unmittelbar aus der lokalen Liste entfernt. Die übrigen Profildaten und die zweite Eventliste bleiben erhalten.
- **Teilnahme beenden:** Nach Bestätigung des Dialogs zum Verlassen eines Events wird `leaveEvent` mit der korrekten Event-ID, Benutzer-ID und dem Access Token aufgerufen. Anschließend wird das Event aus der lokalen Teilnahme-Liste entfernt.

Die Event-API (`getOrganizedEvents`, `deleteEvent`), die Teilnahme-API (`getEventsByAttendee`, `leaveEvent`) und der Authentifizierungshook (`useAuth`) werden gemockt. Die eigentliche `Profile`-Komponente sowie die beteiligten Komponenten `Collection`, `Card`, `DeleteConfirmation` und `LeaveConfirmation` bleiben Bestandteil des Tests. Die Navigation wird über einen `MemoryRouter` bereitgestellt.

Die zentralen Abläufe der Profilseite werden einschließlich der parallelen Datenabfrage, der Tab-Navigation, der Bestätigungsdialoge und der lokalen Aktualisierung der Eventlisten ohne laufendes Backend überprüft.

[Zurück 🡡](#inhaltsverzeichnis)

---
#### `Home Integrationstests`
(`src/pages/Home.integration.test.tsx`)

Die Integrationstests überprüfen die Startseite für angemeldete Benutzer sowie das Zusammenspiel der Event-API, der Suchfunktion, des Kategorie-Filters und der URL-Suchparameter:
- **Event-Daten laden:** Paralleler Abruf der vollständigen Event-Liste über `getAllEvents` und der Teilnahme-Events über `getEventsByAttendee`. Zusätzlich werden die verfügbaren Kategorien über `getCategories` geladen. Es wird geprüft, dass alle API-Aufrufe die korrekten Benutzer- und Token-Parameter erhalten und die geladenen Events angezeigt werden.
- **Suche über URL-Parameter:** Übernahme des Parameters `query` in das Suchfeld und Filterung der Events anhand des Titels ohne Beachtung der Groß-/Kleinschreibung.
- **Suche über die Benutzeroberfläche:** Aktualisierung des URL-Parameters `query` nach der 300-ms-Debounce-Verzögerung. Dabei wird ein eventuell vorhandener Kategorieparameter `category` entfernt und die Event-Liste entsprechend dem Suchbegriff aktualisiert. Zusätzlich wird das Empty State bei einer Suche ohne Treffer überprüft.
- **Kategorie auswählen:** Auswahl einer Kategorie über das Radix Select. Die Kategorie-ID wird in den URL-Parameter `category` übernommen, während `query` entfernt wird. Anschließend werden nur Events der ausgewählten Kategorie angezeigt.
- **Kategorie-Filter zurücksetzen:** Die Auswahl „Alle Kategorien“ entfernt den URL-Parameter `category`. Danach werden wieder alle verfügbaren Events angezeigt.
- **Alte Kategorie-URLs:** Ein URL-Parameter mit einem Kategorienamen statt einer Kategorie-ID wird durch einen case-insensitiven Namensvergleich erkannt und automatisch durch die entsprechende Kategorie-ID ersetzt. Die Event-Liste wird anschließend anhand dieser ID gefiltert.

Die API-Funktionen (`getAllEvents`, `getEventsByAttendee`, `getCategories`) und der Authentifizierungshook (`useAuth`) werden gemockt. Die eigentlichen Komponenten `Home`, `Search`, `CategoryFilter`, `Collection` und `Card` bleiben Bestandteil des Tests. Auch das Radix Select wird nicht ersetzt, sodass die Kategorieauswahl über die tatsächliche UI-Komponente getestet wird.

Die Navigation und die URL-Suchparameter werden über einen `MemoryRouter` überprüft. Dadurch werden die Interaktionen zwischen API-Daten, Suchfeld, Kategorieauswahl, URL und Event-Darstellung ohne laufendes Backend getestet.

[Zurück 🡡](#inhaltsverzeichnis)

---
### Testausführung
| Befehl | Beschreibung |
|---|---|
| `npm run test:run` | Führt alle Tests einmalig aus |
| `npm run build` | Überprüft TypeScript und erstellt den Produktions-Build |
| `npm run lint` | Führt die statische Codeanalyse mit ESLint aus |

Die Tests können unabhängig vom Backend ausgeführt werden.

[Zurück 🡡](#inhaltsverzeichnis)

---
### Continuous Integration (GitHub Actions)

Für die automatisierte Qualitätssicherung wird GitHub Actions eingesetzt.
Der Workflow wird bei jedem Push auf den Branch `main`, bei Pull Requests gegen `main` sowie manuell gestartet.

Der CI-Prozess umfasst folgende Schritte:
- Einrichtung der Node.js-24-Umgebung
- Installation der Abhängigkeiten mit `npm ci`
- Ausführung der Unit- und Integrationstests mit Vitest
- Statische Codeanalyse mit ESLint
- TypeScript-Prüfung und Erstellung des Production Builds mit Vite

Dadurch werden Tests, Codequalität und Build nach Änderungen am Frontend automatisch überprüft.