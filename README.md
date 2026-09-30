# Daymark

A mobile hobby planner built from the **Material 3 Design Kit (Community)** Figma file: its tokens, its components, and all 24 "Daymark" screens on the kit's *App Design* page, connected into one working app.

```bash
npm install
npm run dev      # regenerates tokens, then starts Vite
npm run build
```

Open the app, tap **I already have an account**, enter any 8+ character password, and you're in Alex's week. "Today" is fixed at **Tuesday, October 6, 2026** so the seeded plan reads correctly. Data is saved in the browser; **Profile → Reset demo data** restores the seed.

## Screens and flows

| Flow | Screens (route) |
| --- | --- |
| Account | Daymark `/welcome` → Create your account `/sign-up` ⇄ Welcome back `/sign-in` |
| Onboarding | Choose your hobbies → Set your pace → Find your time → Your starter plan (`/onboarding/*`) — the plan is generated from your picks, days and times |
| Today | Good morning `/` — momentum, start the next session, daily wins, **Plan** FAB |
| Calendar | Calendar `/calendar` (two-week or month view) → Tuesday, Oct 6 `/calendar/:date` — check sessions off, filter, *Ask AI to rebalance* (with undo) |
| Hobbies | Hobby library `/hobbies` → Guitar `/hobbies/:id` (practice journal for photos, video and audio, goal editing, pause/resume) → Guitar progress `/hobbies/:id/progress` |
| Planning | Create activity `/create` → Plan with AI `/plan` → Review AI plan `/plan/review` → added to the calendar |
| Sessions | Edit session `/sessions/:id` → Guitar practice `/sessions/:id/practice` (live timer, task by task) → Nice work! `/sessions/:id/done` (XP, streak, goal, reflection) |
| Progress | Progress `/progress` → Rewards `/rewards` → Trophy collection `/rewards/trophies` |
| Account settings | Profile `/profile` (details, weekly goal, theme, reset, sign out) → Notifications & AI `/settings` |
| Extras | Search `/search`, design-system reference `/system` |

The "AI" is a deterministic local planner (`src/app/ai.ts`). It reads the time budget from the request ("in 45 minutes"), picks a task template for the hobby, and scales it to fit. *Regenerate* cycles templates.

## Motion

- **Route transitions** use the View Transitions API with M3 patterns: shared axis X for forward/back, fade-through between tabs, shared axis Y for focused flows (practice, AI planner, celebration). The app bar cross-fades in place, and hobby avatars morph between the library and detail screens.
- **Feedback:** press ripples from the touch point, chip and checkbox check-in, the nav indicator expanding, count-up numbers, and snackbars with undo.
- **Progress:** wavy indicators travel continuously and ease to new values; the practice ring counts down live.
- **The authored moment:** *Nice work!* completes the ring, bursts sparks, pops the star, and lands the reward card.
- `prefers-reduced-motion` turns off spatial movement, ripples and the wave, while keeping state changes legible.

## Accessibility

- Every screen has one `h1` (focused on arrival so screen readers announce it) and `h2` sections.
- All icon-only controls have labels, and touch targets are 48dp.
- Tabs follow the ARIA tabs pattern; dialogs use native `<dialog>` (focus trap, Esc).
- Form errors say what is wrong and how to fix it.
- Snackbar and timer updates are announced through live regions.
- Colors come from the kit's schemes, including the high-contrast modes.

## Tokens

`tokens/m3.tokens.json` is the single source of truth, exported from the Figma variable collections:

| Figma collection | What's in it | CSS output |
| --- | --- | --- |
| **M3** (32 modes) | 49 color roles × Baseline light/dark (standard, medium, high contrast), Monochrome, and 12 palettes × light/dark | `--md-sys-color-*`, switched by `data-m3-theme` on `<html>` |
| **Typescale** + **Font theme** | 15 type roles (display → label), each with an emphasized weight | `--md-sys-typescale-*` and `.md-typescale-{role}[-emphasized]` classes |
| **Shape** | 10 corner radii (none → full) | `--md-sys-shape-corner-*` |
| Effect styles | Elevation levels 1–5, light and dark | `--md-sys-elevation-level{0-5}` |

`npm run tokens` (also run automatically before `dev`/`build`) regenerates `src/styles/tokens.css` and `src/theme/themes.gen.ts`. Don't edit those by hand.

## Code map

- `src/components`: M3 components (Button, IconButton, FAB, SegmentedButton, chips, TextField, SearchBar, Checkbox, Switch, Slider, Card/HorizontalCard, List, Avatar, Badge, Dialog, Snackbar, LinearProgress/CircularProgress, TopAppBar, NavigationBar, BottomAppBar, Tabs, CountUp), each a `.tsx` + `.css` pair on system tokens only.
- `src/app`: store (reducer + localStorage), seed data, dates, AI planner, navigation with view transitions, app shell, screen template, shared Daymark UI.
- `src/screens`: the 24 screens plus search.

Icons are [Material Symbols](https://fonts.google.com/icons) (the set the kit is built from), loaded as a variable font.

## Refinements over the Figma file

- **Navigation:** the kit's screens stack text labels over a *Bottom app bar* with placeholder icons (search, delete, archive, forward). The app uses an M3 `NavigationBar` with Today / Calendar / Hobbies / Progress. Tab roots drop the back arrow; Today gets a profile avatar.
- **Placeholder art:** the kit's star icons and "A" avatars became hobby symbols in each hobby's own tonal color pair, and trophy art shows status (unlocked, % progress, locked).
- **Labels:** segmented buttons labelled "Label" in the kit got real options (Two weeks / Month, Week / Month / 3 months), and the calendar's weekday labels match the real 2026 calendar.
- **Controls:** email fields use a mail icon, password fields a show/hide toggle, and binary settings are switches rather than "On" text.
- **Practice screen:** its small play / check / bell toolbar was folded into the Pause and Finish buttons and the task checkboxes.
- **Status bar:** device chrome is not reproduced.
