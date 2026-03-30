# Supabase Setup (Required for Production Login + Live Admin Updates)

## 1) Create a Supabase project
Create a project in the Supabase dashboard and copy:
- Project URL
- Anon public key

Add them to `.env`:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 2) Run the schema SQL
Open the SQL Editor in Supabase and run:

`supabase/schema.sql`

If you already ran it once, also run the incremental file for member/meeting features:

`supabase/members_schema.sql`

If you already have everything running, apply the latest admin upgrades:

`supabase/patches_2026-03-29.sql`

For the newest hero content fields, run:

`supabase/patches_2026-03-30.sql`

For editable Shop terms, run:

`supabase/patches_2026-03-31.sql`

For admin member delete permissions, run:

`supabase/patches_2026-04-01.sql`

For the new Projects/Shop/Impact CMS, run:

`supabase/cms_schema.sql`

For editable site copy (all text), run:

`supabase/copy_schema.sql`

For the new Design controls (fonts/colors), run:

`supabase/theme_schema.sql`

This creates:
- `site_content` (for live updates)
- `site_copy` (text overrides)
- `site_theme` (fonts + colors)
- `admin_users` (admin allowlist)
- `orders` (checkout)
- `messages` (contact form)
- `members`, `meetings`, `attendance` (member portal)
- `contributions` (member contribution log)
- `projects`, `products`, `impact_metrics`, `impact_revenue`, `impact_donations`, `impact_member_growth` (CMS)

## 3) Create the first admin user
1. Go to **Authentication → Users** and create a user with your admin email + password.
2. Copy the user **UUID**.
3. Insert into `admin_users`:

```sql
insert into public.admin_users (id, email)
values ('YOUR-USER-UUID', 'you@yourdomain.com');
```

## 3.5) Auth settings (one-time codes + redirect URL)
In Supabase → **Authentication → URL Configuration**:
- Set **Site URL** to your real domain (ex: `https://studentstartups.ca`).
- Add **Redirect URLs** for local + production:
  - `http://localhost:8080/login?mode=member`
  - `https://studentstartups.ca/login?mode=member`

In Supabase → **Authentication → Providers → Email**:
- Enable **Email OTP** (required for one-time access codes).

## 4) Enable realtime updates (once)
In Supabase → Database → Replication:
- Enable replication for `site_content`, `site_copy`, `site_theme`, `members`, `meetings`, `attendance`, `contributions`, `orders`, `messages`,
  `projects`, `products`, `impact_metrics`, `impact_revenue`, `impact_donations`, `impact_member_growth`.

## 5) Storage buckets (images)
In Supabase → Storage, create public buckets:
- `project-images`
- `product-images`
- `site-images`

If file uploads show broken images, double-check the buckets are Public.

---
After this:
- `/login` works with Supabase Auth
- `/admin` edits update the live site instantly
