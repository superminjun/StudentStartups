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

For verified members only (hide unconfirmed accounts in admin), run:

`supabase/patches_2026-04-08_members.sql`

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
  - `http://localhost:8080/reset-password`
  - `https://studentstartups.ca/login?mode=member`
  - `https://studentstartups.ca/reset-password`

In Supabase → **Authentication → Providers → Email**:
- Enable **Email OTP** (required for one-time access codes).

### Email templates (high-end, OTP only)
In Supabase → **Authentication → Email Templates**, update:

**Confirm Signup** template:
```html
<div style="font-family:Inter,Helvetica,Arial,sans-serif;background:#f7f4f0;padding:24px;border-radius:16px;">
  <h2 style="margin:0 0 8px;color:#1f1a17;">Confirm Your Student Startups Account</h2>
  <p style="margin:0 0 16px;color:#5a514b;">Enter this 6-digit code in the app to finish creating your account:</p>
  <div style="font-size:28px;letter-spacing:6px;font-weight:700;color:#1f1a17;">{{ .Token }}</div>
  <p style="margin:16px 0 0;color:#7a6f67;font-size:12px;">This code expires soon. If you didn’t request it, you can ignore this email.</p>
</div>
```

**Reset Password** template:
```html
<div style="font-family:Inter,Helvetica,Arial,sans-serif;background:#f7f4f0;padding:24px;border-radius:16px;">
  <h2 style="margin:0 0 8px;color:#1f1a17;">Reset Your Password</h2>
  <p style="margin:0 0 16px;color:#5a514b;">Use this 6-digit code to continue your password reset:</p>
  <div style="font-size:28px;letter-spacing:6px;font-weight:700;color:#1f1a17;">{{ .Token }}</div>
  <p style="margin:16px 0 0;color:#7a6f67;font-size:12px;">If you didn’t request this, you can ignore this email.</p>
</div>
```

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
