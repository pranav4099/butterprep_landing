# Admin Essentials Hub - No Login Build

This is a runnable copy of `admin-essentials-hub-main` with the login, role selection, academic-year selection, and parent-login screens removed from the active app flow.

## Run locally

```sh
npm install
npm run dev
```

The Vite dev server uses the existing project config and normally starts on:

```txt
http://localhost:8080
```

Opening `/` redirects directly to `/dashboard`.

## Notes

- The original `admin-essentials-hub-main` folder is unchanged.
- Admin context defaults to user `Admin` and the current academic year.
- Parent context defaults to the first seeded child, so parent pages remain viewable without parent login.
- Old auth URLs such as `/login`, `/select-role`, `/select-year`, `/parent/login`, and `/parent/select-child` redirect to app pages instead of rendering login screens.
