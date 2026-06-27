# TikTok Drop Shopping Platform

A virtual dropshipping task platform with:
- **Customer website** — register/login, complete tasks, earn commission, withdraw
- **Admin website** — manage products, users, deposits, withdrawals, VIP levels, settings

Both are Next.js 15 apps connected to one Supabase PostgreSQL database.

---

## Project Structure

```
tiktok-dropship/
├── customer-app/          # Public customer website (Next.js)
├── admin-app/             # Admin control panel (Next.js)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql   # Full database schema
└── README.md
```

---

## Quick Start (Local)

### 1. Create a Supabase project
- Go to [supabase.com](https://supabase.com) and create a project
- Open **SQL Editor** and run the full contents of `supabase/migrations/001_initial_schema.sql`
- Copy the **Project URL**, **anon public key**, and **service_role secret** from **Settings → API**

### 2. Run the customer website

```bash
cd customer-app
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`

### 3. Run the admin website

```bash
cd admin-app
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3001`

### 4. Create the first admin account

1. In Supabase → **Authentication → Add User**, create a new user with email + password
2. Copy that user's **UID**
3. Run this SQL in Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'paste-uid-here';
```

4. Log into the admin site with that email/password

---

## Deploy to Vercel (Recommended)

### Step 1 — Push code to GitHub

Create a new GitHub repo, then push this folder:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tiktok-dropship.git
git push -u origin main
```

### Step 2 — Deploy customer website

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your `tiktok-dropship` GitHub repo
3. Set **Root Directory** to `customer-app`
4. Add environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

5. Click **Deploy**

### Step 3 — Deploy admin website

1. Go to [vercel.com/new](https://vercel.com/new) again
2. Import the same repo
3. Set **Root Directory** to `admin-app`
4. Add environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

5. Click **Deploy**

### Step 4 — Create admin account

After deploying, follow the same admin creation steps in **Supabase Authentication** and set `role = 'admin'` in the `profiles` table.

---

## Environment Variables

### Customer app

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |

### Admin app

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (kept secret, server-side only) |

---

## Notes

- This platform uses **virtual tasks**, not real product shipping.
- Users deposit funds, complete tasks, earn commission, and withdraw after meeting VIP requirements.
- Daily task limits reset automatically via a PostgreSQL cron job defined in the migration.
