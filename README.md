# Lahok

Open-source event management for Sangguniang Kabataan (SK) councils in Philippine barangays.

Lahok (Filipino for "to join") helps an SK council plan events, keep a registry of participants, check people in with QR codes, and export attendance reports, from a phone or a laptop. Each barangay runs its own copy and makes it theirs with a name, logo, and color. No code changes needed.

> **Status:** MVP. The core flow works: create an event, register participants, scan QR codes at the venue, export attendance. See the [roadmap](#roadmap) for what is next.

## Screenshots

Screenshots will go here. Use fake data only.

## Features

**Public website**
- Home page and events list with search and category filter
- Event pages with banner, schedule, venue, and contact details
- Shows only events an admin marked public that are upcoming or ongoing

**Admin**
- **Events:** create, edit, and delete; banner upload; status (draft, upcoming, ongoing, completed, cancelled); public toggle; table and calendar views
- **Participants:** a registry for people of any age (name, birthdate, sex, zone, contact), with search and age-group filters; every person gets a QR code
- **Registrations:** add participants to events
- **Attendance:** live counts, undo a mistaken check-in, export a CSV report
- **Settings:** barangay name, location, logo, primary color, contact details, and an About text

**Check-in (staff and admins)**
- Scan participants' QR codes with a phone camera, or find a person by name
- Rules enforced by the database: only registered people, no double check-ins, only open events

## Tech stack

- [Next.js](https://nextjs.org) (App Router) with TypeScript
- [Tailwind CSS](https://tailwindcss.com) and [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com): Postgres, Auth, Storage, and row-level security
- [zod](https://zod.dev) and [React Hook Form](https://react-hook-form.com) for validation
- `qrcode.react` and `@yudiel/react-qr-scanner` for QR codes and scanning

## Roles

| | Public visitor | Staff | Admin |
|---|---|---|---|
| See public events | Yes | Yes | Yes |
| Check people in | No | Yes | Yes |
| See registered participants (for check-in) | No | Yes | Yes |
| Manage events, participants, registrations | No | No | Yes |
| Export reports, undo check-ins | No | No | Yes |
| Change settings | No | No | Yes |

The first user created becomes the admin. Every user created after that is staff. Public sign-ups are turned off, so accounts are created by the admin from the Supabase dashboard.

## Getting started

### Prerequisites

- A current LTS version of [Node.js](https://nodejs.org)
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account (only for deploying)

### 1. Clone and install

```bash
git clone https://github.com/YOUR-USERNAME/lahok.git
cd lahok
npm install
```

### 2. Create the database

1. Create a new project in Supabase.
2. Open **SQL Editor**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and run it.
3. Optional, for a demo or development project only: run [`supabase/seed.sql`](supabase/seed.sql) to add fake sample data.

The schema file is meant for a **new, empty project** and runs as a single transaction, so a failure leaves nothing half-applied.

### 3. Turn off public sign-ups

In Supabase, go to **Authentication, Sign In / Providers, Email** and turn off **Allow new users to sign up**.

### 4. Create the first admin

Go to **Authentication, Users, Add user**, enter an email and password, and tick the option to auto-confirm the user if it is shown. The first user becomes the admin. Add your staff the same way.

### 5. Set the environment variables

```bash
cp .env.example .env.local
```

Fill in the two values from **Project Settings, API** in Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

The anon (public) key is safe to use in the browser because row-level security protects the data. **Never put a service role key in these variables or commit one to the repository.**

### 6. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), go to `/auth/login`, and sign in as the admin. Then open **Settings** and enter your barangay's name, logo, and contact details.

> The phone camera only works over HTTPS (or on `localhost`). To test QR scanning on a phone, use your deployed URL.

## Deploying to Vercel

1. Push the project to GitHub and import it in Vercel.
2. Add the same two environment variables under **Settings, Environment Variables**.
3. Deploy.
4. In Supabase, go to **Authentication, URL Configuration** and set the **Site URL** to your Vercel domain.

## Main folders

```
app/
  (public)/         home page and public events
  (protected)/
    admin/          dashboard, events, participants, settings
    staff/          dashboard and QR check-in
  auth/             login
components/         UI and feature components
lib/                data access, validation, helpers
types/              shared types and constants
supabase/           schema.sql and seed.sql
```

## Security and privacy

Lahok stores personal information, and some of it belongs to minors. Treat it carefully.

- **Row-level security is the real boundary.** The interface hides things, but Postgres enforces who can read and write.
- **The public site never touches personal data.** Visitors can only read public events and the barangay's public settings.
- **QR codes contain no personal information**, only a random token.
- **Collect only what you need.** Skip optional fields you will not use.
- **Exported CSV files leave Lahok's protections.** They contain names, ages, and zones, so store and share them carefully.
- **Use fake data** for demos, screenshots, and bug reports.
- **The Data Privacy Act of 2012 (RA 10173) applies** to personal data in the Philippines. Each barangay that runs Lahok is responsible for its own data. This is general guidance, not legal advice.

To report a security problem, please open a private security advisory on GitHub instead of a public issue.

## Troubleshooting

- **I log in but get sent back to the login page.** Your account has no profile row, usually because it was created before `schema.sql` ran. Promote it manually in the SQL Editor:
  ```sql
  insert into public.profiles (id, email, role)
  select id, email, 'admin' from auth.users where email = 'you@example.com'
  on conflict (id) do update set role = 'admin';
  ```
- **Saving settings says nothing was saved.** The signed-in user is not an admin, or `schema.sql` did not finish. Check that `select * from public.barangay_settings;` returns one row.
- **Images do not load.** Check that `NEXT_PUBLIC_SUPABASE_URL` is set, then restart the dev server or redeploy. The image host is read from it at build time.
- **The camera does not open.** Allow camera access for the site, and open Lahok over HTTPS. You can still check people in by name.

## Roadmap

- Printable PDF attendance report
- Walk-in registration at the check-in screen
- Budget tracking per event
- Offline check-in that syncs later
- Participation certificates
- Multi-barangay hosting

## Contributing

Contributions are welcome. Please open an issue first to discuss larger changes. Keep screenshots and test data fake, and never commit secrets or real participant information.

## License

[MIT](LICENSE)