# ButterPrep Landing

Public landing page for ButterPrep.

This repo is intentionally landing-only. It does not include login screens, admin dashboards, teacher workflows, parent portal pages, Supabase functions, or post-login app forms.

## Run locally

Create a local `.env` file first:

```sh
VITE_SUPABASE_URL=<butterprep-dev Supabase URL>
VITE_SUPABASE_PUBLISHABLE_KEY=<butterprep-dev anon/publishable key>
```

Then run:

```sh
npm install
npm run dev
```

Vite starts on:

```txt
http://127.0.0.1:8080/
```

## Demo Requests

The public "Book a Demo" and "Contact Us" buttons open the same demo request form.

On submit, the form writes to this standalone Supabase table in `butterprep-dev`:

```txt
public.book_demo_requests
```

This table is intentionally independent:

- no foreign keys
- not attached to any existing app tables
- RLS enabled
- public `anon` role has insert-only access
- browser code inserts only into `public.book_demo_requests`

The submitted fields are:

```txt
full_name
email
phone
school
role
message
source
page_url
user_agent
```

## Environment Variables

The site needs these public Vite variables:

```sh
VITE_SUPABASE_URL=<butterprep-dev Supabase URL>
VITE_SUPABASE_PUBLISHABLE_KEY=<butterprep-dev anon/publishable key>
```

Do not use or expose a Supabase service-role key in this frontend.

`.env` is ignored by Git, so anyone cloning the repo or deploying the site must set these variables themselves.

## Hosting

Set the same variables in the hosting platform before building/deploying.

For Vite, `VITE_*` variables are baked into the built static files at build time. If the variables are changed later, rebuild/redeploy the site.

Expected behavior:

- correct `butterprep-dev` env vars: submissions go to `public.book_demo_requests`
- missing env vars: the form shows a configuration error
- env vars pointing to another Supabase project: the form will try that other project instead

## Build Check

```sh
npm run build
npm run lint
```
