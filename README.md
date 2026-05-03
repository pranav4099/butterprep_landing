# ButterPrep Landing

Public landing page for ButterPrep.

This repo is intentionally landing-only. It does not include login screens, admin dashboards, teacher workflows, parent portal pages, Supabase functions, or post-login app forms.

## Run locally

```sh
npm install
npm run dev
```

Vite starts on:

```txt
http://127.0.0.1:8080/
```

## Demo Requests

The public "Book a Demo" form writes to the standalone Supabase table:

```txt
public.book_demo_requests
```

Set these public Vite variables in `.env`:

```sh
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```
