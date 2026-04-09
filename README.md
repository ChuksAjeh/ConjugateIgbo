# ConjugateIgbo — Language Curation Platform

A full-stack Igbo language learning platform. Learners practice verb conjugation across multiple Igbo dialects on a React Native mobile app backed by a Spring Boot REST API and PostgreSQL database.

---

## Project Structure

```
ConjugateIgbo/
├── backend/                    # Spring Boot 3.5 REST API (Java 21)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/org/conjugateigbo/core/
│   │   │   │   ├── ConjugateIgboApplication.java   # Entry point
│   │   │   │   ├── configuration/                  # CORS, startup runner
│   │   │   │   ├── controller/                     # REST controllers
│   │   │   │   ├── model/
│   │   │   │   │   ├── dto/                        # VerbDTO, AudioDTO
│   │   │   │   │   └── enums/                      # Dialect enum
│   │   │   │   ├── repository/verb/                # JDBC repository
│   │   │   │   ├── service/                        # Business logic + Excel import
│   │   │   │   └── util/                           # File/word utilities
│   │   │   └── resources/
│   │   │       ├── application.yml                 # Spring configuration
│   │   │       └── db/migration/                   # Flyway SQL migrations
│   │   └── test/                                   # Integration tests (Testcontainers)
│   ├── pom.xml                                     # Maven build descriptor
│   └── Dockerfile                                  # Container image
│
├── mobile/                     # React Native / Expo app (TypeScript)
│   ├── app/                    # Expo Router screens
│   │   ├── _layout.tsx         # Root layout (Sentry, theme, purchases init)
│   │   ├── (tabs)/             # Tab group
│   │   │   ├── index.tsx       # Practice screen (verb conjugation cards)
│   │   │   ├── verbs.tsx       # Verb library with search & filter
│   │   │   ├── favorites.tsx   # Bookmarked verbs
│   │   │   ├── pro.tsx         # Pro upgrade / subscriber status
│   │   │   └── settings.tsx    # User preferences
│   │   └── verb-filters.tsx    # Pronoun & verb-limit filter modal
│   ├── components/             # Shared UI components
│   │   ├── ThemeProvider.tsx   # Light/dark theme context
│   │   ├── FloatingTabBar.tsx  # Custom pill-shaped tab bar
│   │   ├── SplashScreen.tsx    # Animated splash screen
│   │   ├── IntroScreen.tsx     # First-launch onboarding
│   │   ├── StartPracticingScreen.tsx
│   │   └── PurchasesProvider.tsx   # RevenueCat context wrapper
│   ├── constants/
│   │   └── theme.ts            # Design tokens (colours, spacing, typography)
│   ├── hooks/                  # Custom React hooks
│   │   ├── useSettings.ts      # Global app settings (singleton store)
│   │   ├── useFavorites.ts     # Bookmarked verb IDs
│   │   ├── useProgress.ts      # Daily goal tracking
│   │   ├── usePurchases.ts     # Pro subscription state (RevenueCat)
│   │   ├── useNotifications.ts # Push notification scheduling
│   │   ├── useFrameworkReady.ts
│   │   └── models/
│   │       └── hooksInterfaces.ts  # Shared hook types
│   ├── lib/                    # Business logic & utilities
│   │   ├── conjugateVerbs.ts   # Rule-based Igbo conjugation engine
│   │   ├── verbService.ts      # Verb fetching, caching, offline fallback
│   │   ├── storage.ts          # AsyncStorage → FileSystem → memory fallback
│   │   ├── revenuecat.ts       # RevenueCat SDK initialisation
│   │   └── revenuecatUI.ts     # RevenueCat paywall UI helpers
│   ├── models/
│   │   ├── verb.ts             # Domain types: IgboVerb, Tense, Dialect, …
│   │   └── interfaces.ts       # UI constants: tenses, pronouns, labels
│   ├── data/
│   │   └── igboVerbs.ts        # Offline seed verbs (10 entries)
│   ├── styles/                 # Screen-specific style factories
│   │   ├── indexStyles.ts
│   │   ├── settingsStyles.ts
│   │   └── proStyles.ts
│   ├── assets/                 # Fonts, images, icons
│   ├── app.config.ts           # Expo configuration (EAS, Sentry, plugins)
│   └── package.json
│
└── README.md                   # ← you are here
```

---

## Architecture overview

```
Mobile app (Expo / React Native)
    │
    │  GET /{dialect}/verbs/all
    ▼
Backend REST API (Spring Boot)
    │
    │  JDBC
    ▼
PostgreSQL (Railway / local Docker)
    │
    Flyway migrations manage schema
```

The mobile app generates verb conjugations **locally** using a rule-based engine (`lib/conjugateVerbs.ts`). The backend only serves the verb list — it never returns conjugated forms. This keeps the API surface small and the app fully functional offline.

---

## Backend

### Prerequisites

| Tool | Version |
|------|---------|
| Java JDK | 21+ (recommended: install via [SDKMAN](https://sdkman.io)) |
| Apache Maven | 3.8+ |
| PostgreSQL | 15+ (or Docker — see below) |

### Environment variables

Create a `.env` file in `backend/` (or set the variables in your IDE run config):

```env
# PostgreSQL connection
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/conjugate_igbo
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=yourpassword

# Spring profile
SPRING_PROFILES_ACTIVE=dev
```

For local development with Docker you can spin up PostgreSQL quickly:

```bash
docker run --name conjugate-pg \
  -e POSTGRES_DB=conjugate_igbo \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -p 5432:5432 \
  -d postgres:15
```

### Running the backend

```bash
cd backend

# Build and run tests
mvn clean install

# Start the server (port 8080)
mvn spring-boot:run
```

The server starts at **http://localhost:8080**.

Flyway will automatically apply migrations from `src/main/resources/db/migration/` on first startup, creating the dialect verb tables.

### API endpoints

All routes are prefixed with `/api`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/ping` | Health check — returns `"pong"` |
| `GET` | `/{dialect}/verbs` | Paginated verb list (`limit`, `search` params) |
| `GET` | `/{dialect}/verbs/all` | All verbs for a dialect (no limit) |
| `GET` | `/{dialect}/verbs/{id}` | Single verb by ID |
| `GET` | `/{dialect}/verbs/{id}/audio` | 302 redirect to signed audio URL |
| `POST` | `/{dialect}/verbs/import` | Import verbs from an `.xlsx` file |

**Supported dialect slugs:** `delta-igbo`, `central-igbo`

### Running tests

```bash
mvn test
```

Integration tests use [Testcontainers](https://testcontainers.com/) to spin up a real PostgreSQL instance automatically. Docker must be running.

---

## Mobile

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | 9+ |
| Expo CLI | latest (`npm install -g expo-cli`) |
| Expo Go (optional) | Latest from App Store / Play Store |

### Environment variables

Create a `.env` file in `mobile/`:

```env
# Point to your local backend (use your machine's local IP, not localhost, for device testing)
EXPO_PUBLIC_API_URL=http://192.168.x.x:8080/api/

# Expo project ID (from expo.dev dashboard)
EXPO_PROJECT_ID=your-expo-project-id

# RevenueCat API key (optional for local dev — Pro features will be skipped if absent)
EXPO_PUBLIC_REVENUECAT_API_KEY=your_revenuecat_key
```

### Installing dependencies

```bash
cd mobile
npm install
```

### Running the app

```bash
# Start Metro bundler (opens Expo dev tools)
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run in a web browser (limited functionality — no push notifications)
npx expo start --web
```

Scan the QR code in the terminal with **Expo Go** to run on a physical device.

### Project conventions

**Design tokens** — all colours, spacing values, typography, and shadow presets live in `constants/theme.ts`. Never hardcode hex values or pixel numbers in components or style sheets.

**Style factories** — screen-level styles use the `createStyles(theme, isDark)` pattern rather than static `StyleSheet.create` calls. This keeps styles tree-shakeable and theme-aware.

**Hooks** — state that outlives a single component (settings, favorites, progress) lives in custom hooks under `hooks/`. The settings hook uses a module-level singleton so all instances share state without a context provider.

**Conjugation engine** — `lib/conjugateVerbs.ts` generates forms from linguistic rules. To add a new dialect, see the `@fileoverview` comment at the top of that file. To add a new tense, follow the documented steps in the same file.

### Building for production

```bash
# iOS (requires Apple Developer account)
npx eas build --platform ios

# Android
npx eas build --platform android
```

---

## Branch & merge rules

- **Never push directly to `main`.**
- All feature work branches off `develop`.
- Open a PR into `develop`; PRs require review and must pass CI.
- A merge to `develop` triggers a staging deployment.
- A merge to `main` (from `develop` only, after staging sign-off) triggers production.
- When merging `develop` → `main`, **do not update/rebase the branch** — just merge.

---

## Contributing

1. Fork the repo and create a branch from `develop`.
2. Follow the coding conventions above (design tokens, JSDoc/Javadoc, no direct main merges).
3. Open a PR against `develop` with a clear description of the change.
