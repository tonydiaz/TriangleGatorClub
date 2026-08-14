# Triangle Gator Club — website template

A static site (built with [Eleventy](https://www.11ty.dev/)) that mirrors the layout of
`triangle-gator-pulse.base44.app`, with every page wired up to [Decap CMS](https://decapcms.org/)
so a non-technical board member can edit all text, button labels/links, and events from a
`/admin` panel — no code required.

Photos are placeholder SVGs (`src/images/uploads/hero-1.svg`, `hero-2.svg`) — swap them for
real photos through the CMS media library once it's live, since the original site's photos
weren't copied into this template.

## What's editable from the CMS

- **Site Settings** — nav links, header button, footer, scrolling banner text, social links
- **Home Page** — hero headline/copy/buttons/images, stats row, "who we are" copy, events
  section intro + tab labels, "Inner Circle" block
- **About & Contact Page** — hero, "Our Story" copy, all 4 board member cards, contact info,
  home-bar venue block
- **Scholarship Page** — hero, "what it covers" copy, the 3-item history timeline, closing CTA
- **Sponsor Page** — hero, all 3 sponsorship tiers (price + bullet features + button), open
  games intro, custom-package CTA
- **Events** — a folder of individual event entries (date, time, location, category badge,
  description, calendar/discuss/sponsor links). The same event list automatically powers
  both the Home page's "Upcoming Events" grid and the Sponsor page's "Open Games" grid — add,
  edit, or remove an event once and both pages update.

## Project structure

```
src/
  _data/            → site.json, home.json, about.json, scholarship.json, sponsor.json
                      (each field here is exactly what Decap CMS edits)
  _includes/        → base layout + header/footer/marquee/event-card partials
  events/           → one markdown file per event (also edited via Decap CMS)
  css/style.css     → all styling
  js/main.js        → mobile nav toggle, event tab filter, countdown badge
  images/uploads/   → CMS media library uploads land here
  admin/            → Decap CMS (index.html + config.yml)
  *.njk             → the four pages: index, about, scholarship, sponsor
```

## 1. Run it locally (optional, needs Node.js 18+)

```bash
npm install
npm run dev
```

Visit `http://localhost:8080`. To test the CMS locally too, run this in a second terminal:

```bash
npx decap-server
```

then visit `http://localhost:8080/admin/` (the config's `local_backend: true` routes CMS
saves through that local proxy instead of GitHub while you're developing).

## 2. Push to GitHub

```bash
git init
git add -A
git commit -m "Initial Triangle Gator Club template"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

## 3. Deploy on Netlify

1. [New site from Git](https://app.netlify.com/start) → pick this GitHub repo.
2. Build command: `npm run build` — Publish directory: `_site` (already set in `netlify.toml`).
3. Deploy. Note the site's `*.netlify.app` URL (or attach your own domain).

## 4. Wire up Decap CMS login (GitHub OAuth via Netlify)

Decap needs to authenticate editors against GitHub before it can commit their changes. Netlify
can run that OAuth handshake for you for free, with no extra server:

1. **Create a GitHub OAuth App**: GitHub → Settings → Developer settings → OAuth Apps → New OAuth App.
   - Homepage URL: your Netlify site URL (e.g. `https://your-site.netlify.app`)
   - Authorization callback URL: `https://api.netlify.com/auth/done`
   - Save it, then generate a **Client Secret**. Keep the Client ID and Secret handy.
2. **Register them in Netlify**: your site → Site configuration → General → Access & security →
   OAuth → **Install provider** → GitHub → paste the Client ID and Secret.
3. **Edit `src/admin/config.yml`** in the repo and replace the placeholders:
   - `repo:` → `YOUR-USERNAME/YOUR-REPO-NAME`
   - `site_url:` / `display_url:` → your real Netlify URL
   Commit and push — Netlify redeploys automatically.
4. Visit `https://your-site.netlify.app/admin/`, click **Login with GitHub**, authorize the
   app. You (and anyone you give write access to the GitHub repo) can now edit content — every
   save creates a commit that redeploys the site automatically.

## Notes / things you'll likely want to change

- **Placeholder images**: replace `hero-1.svg` / `hero-2.svg` via the CMS Home Page editor
  (Hero Image 1 / Hero Image 2 fields) once you have real photos.
- **Mailto/placeholder links**: `hero_button_url` on the Scholarship page points at
  `https://givebutter.com/` — update it to your actual Givebutter campaign URL. Sponsorship
  tier buttons and the custom-package CTA use `mailto:` links — update the address/subject
  lines as needed in the Sponsor Page and Events editors.
- **Countdown badge**: shows time remaining until the earliest event's date (from the Events
  collection) — no separate field to maintain, it's computed from whichever event is soonest.
- **Editors/permissions**: anyone who can push to the GitHub repo (or who you invite as a
  collaborator) can log into `/admin` and publish changes.
