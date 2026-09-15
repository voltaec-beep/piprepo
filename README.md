# PipHub

A student hub. A reading catalogue with comprehension tests, activities worth points, and a store to spend the points in. A pip is the small round mark on a die or a playing card — it's also the progress dot in a test, the points a reader earns, and the shape a profile picture is cut to.

```
index.html              the app
manifest.json           makes it installable
sw.js                   makes it work offline
.nojekyll               ← do not delete this
icon-192.png  icon-512.png  icon-maskable-512.png
apple-touch-icon.png  favicon-32.png
modules.json            lists the content modules
amulet-of-samarkand.json  the-tortoise-and-the-hare.json  _template.json
avatars.json            lists the avatar pictures
owl.svg  fox.svg  cat.svg  whale.svg  bee.svg  mushroom.svg  moon.svg  rocket.svg
```

**Everything sits in one directory, deliberately.** GitHub's web uploader flattens folders when you drag files into it, so a nested layout silently breaks: the files upload, but `icons/icon-192.png` ends up at the root and the manifest's request for it returns 404. Chrome then refuses to install and offers a plain shortcut instead, with nothing anywhere explaining why. A flat package cannot fail that way.

The two data manifests are named `modules.json` and `avatars.json` rather than `manifest.json`, since flattening would otherwise collide them with the PWA manifest.

Open `index.html`. It works from a web server, from the file system, or from a SharePoint document library — though installing, offline use and the avatar folder all need a real address, so GitHub Pages is the better home. The Amulet module and the eight avatars are built into the file, so nothing is ever empty on a first run — the folders are for what you add.

An earlier AR Quiz System install is picked up and migrated automatically: its titles become the catalogue, its results become the first reader's history.

---

## 1. Who can do what

Everything an instructor would sign off on now sits behind one session unlock rather than a prompt per click. Press the key in the top bar, enter the password once, and instructor mode stays on until you lock it, sign out, or leave it idle for fifteen minutes.

**A reader can:** browse the catalogue, take any test they haven't taken, see their own records, change their own name, picture and PIN, switch readers, sign out.

**Instructor mode is required to:** retake a test, add titles by any route (folder, files, manifest, paste), remove a title, save a module out as a file, download or restore a backup, clear a reader's records, delete a reader, and open Titles or Settings at all — those two tabs don't appear until the key is turned.

The Titles and Settings tabs disappear again the moment instructor mode locks, and if you're standing on one when the idle timer fires you're returned to the catalogue.

**The honest limit, unchanged:** this is a deterrent, not security. The answer keys are inside `index.html`, and anyone who can open the file can work around the password. It stops a reader quietly retaking a test until the score looks better. It does not make the scores tamper-proof.

## 2. Readers and profiles

Each reader is a profile with a name, a picture, an optional PIN and their own records. Points, history and pass marks are per reader — two readers on one laptop never see each other's numbers.

**PipHub always opens on the sign-in screen.** Whoever used it last is never inherited by whoever opens it next, and instructor mode is locked on every start — important on a device more than one person picks up. A PIN is optional and four to eight digits; without one, a tap opens the shelf. Profiles are created by anyone, but only instructor mode deletes one.

Everything lives in this browser on this device. **Settings → Download a backup** carries readers, pictures, points and titles to another machine; dropping that backup file back in restores it.

## 3. Avatars

Three sources, one cropper:

- the eight built-in pictures, always available
- anything listed in `assets/manifest.json`, when PipHub is served from a web server
- any picture on the reader's device

Adding to the shelf means dropping an image in `assets/` and adding a line to its manifest:

```json
{ "schema": "pip-avatars/1",
  "avatars": [ { "file": "owl.svg", "name": "Owl" } ] }
```

SVG or raster both work. Pictures are fetched and converted in-page rather than pointed at directly, which keeps the canvas clean so cropping always works.

**The cropper** opens on whatever you picked. Drag to move, scroll or drag the slider to resize, and choose a shape: circle, rounded, or square. Two things make the coloured-background case work properly — you can zoom *below* fill so a whole square picture sits inside the frame, and you can put a colour behind it so the gap reads as deliberate rather than as a mistake. "Fill the frame" and "Fit it all in" snap to the two obvious positions.

The result is saved as a 256-pixel PNG already cut to the shape, transparent outside it. Because the shape is baked into the image rather than applied by CSS, a square-cropped avatar stays square everywhere it appears and nothing is locked to circles.

## 4. Palette

Two palettes, one set of semantic tokens. The switch is in the top bar, on the sign-in screen, and as a three-way choice on the profile page — automatic follows the device. It's a reader preference, so it is deliberately *not* behind the instructor key.

Everything is declared in `:root` (evening) and `[data-theme="light"]` (daylight) at the top of `index.html`. No colour is hardcoded anywhere else in the stylesheet, so retuning either palette means editing one block. The token names say what a colour is for — `--paper`, `--gold-ink`, `--pass`, `--surface` — rather than what it looks like, which is what lets one rule serve both palettes.

What changed and why:

- **Paper was a tan, and tan was the problem.** The old `#F1EBDD` sat at hue 87 with chroma 0.020 — it wasn't a neutral cream, it was desaturated gold. The accent (`#CE9A3A`, hue 79) was the *same hue*, separated only by saturation, so gold could never read as an accent on paper; it read as darker paper. Paper is now `#FEFBF4`: nearly white, chroma 0.010, with the gold fifteen times more saturated than the surface it sits on.
- **The dark surfaces were grey pretending to be blue.** Page, sunk, surface and raise all sat between chroma 0.020 and 0.032 — below the threshold where a hue is perceptible. They now run 0.038 to 0.073 in indigo, so the dark two thirds of the app read as a colour rather than as an absence of one.
- **The layers were stacked too close.** Four surfaces inside 9 points of lightness meant depth came entirely from borders. The range is now 20 points, so panels separate on their own.
- **Success was the quietest colour in the app.** The old sage was chroma 0.081 against a decorative brass at 0.126 — passing a test looked less important than a label. Pass and fail now run 0.141 and 0.162, above the accent.
- **The background gradients were doing nothing.** Two overlapping washes at almost no contrast read as a smudge. One radial glow from above the fold replaces them, so the page has a light source instead of a haze.

Every text-on-surface pair was checked: all body and label combinations clear WCAG AA in both palettes.

## 5. The module format

Only `title` and `questions` are required.

```json
{
  "id": "amulet-of-samarkand",
  "title": "The Amulet of Samarkand",
  "author": "Jonathan Stroud",
  "series": "The Bartimaeus Sequence",
  "volume": 1,
  "summary": "Shown on the title card before the reader begins.",
  "ar": { "level": 6.6, "points": 16.0, "wordCount": null, "interest": "MG+" },
  "quiz": {
    "passing": 70, "ask": 0,
    "shuffleQuestions": true, "shuffleOptions": true,
    "award": "proportional", "reviewMisses": true, "lockRetakes": true
  },
  "verdicts": { "high": "", "pass": "", "fail": "" },
  "questions": [
    { "q": "...", "options": ["...","..."], "answer": 0, "why": "...", "tag": "plot" }
  ]
}
```

- **`ask`** — questions drawn per attempt. `0` asks all. Set it to 10 against a bank of 40 and every attempt is a different test.
- **`award`** — `proportional` (points × percent), `full` (any pass earns the full value), `none` (score tracked, no points).
- **`lockRetakes`** — a second attempt needs the key. The first is always free.
- **`verdicts`** — the lines on the results card. The Amulet module carries your originals.
- **`answer`** is a zero-based index into `options`. A module where it points outside the list is rejected on import with the question number named.

Three ways in. **Add from folder** picks a directory and reads every module inside; it works even from a `file://` page. **Add files** and drag-and-drop take one or more. **Read from a manifest** fetches `modules/manifest.json` and everything it lists, and needs a web server — turn on auto-sync in Settings and it runs on every open. A module whose `id` matches one already installed replaces it, which is what makes the manifest a real sync rather than a duplicator.


---

## Putting PipHub on GitHub Pages

Drag every file into the repository root. There are no folders to preserve, so it does not matter whether your uploader keeps them. Then Settings → Pages → deploy from your branch, root.

```
index.html          the app
manifest.json       makes it installable
sw.js               makes it work offline
.nojekyll           ← do not delete this
icons/              home screen and browser icons
modules/            content modules
assets/             avatar pictures
```

`.nojekyll` matters more than it looks. GitHub Pages runs Jekyll by default, and Jekyll silently refuses to publish any file whose name begins with an underscore — which would make `modules/_template.json` return a 404 with no error anywhere to explain it. The empty `.nojekyll` file turns Jekyll off.

The entry point is `index.html` rather than `pip.html`, so the address is just your folder: `yourname.github.io/pip/`. Every path inside is relative, so it works at the root of a site or any depth of subfolder without editing anything.

### If Android offers a shortcut instead of an install

Chrome only offers a real install when three things are all true: the page is on https, the manifest is valid with both a 192 and a 512 icon, **and** a service worker with a fetch handler is actively controlling the start URL. Miss any one and you get a plain bookmark shortcut instead.

Sign in, unlock instructor mode, and open **Settings → App status**. It reports each of those from the phone itself and marks the failing one in red. "Copy report" puts the whole thing on the clipboard.

The icons line fetches each file and measures it, so a missing or wrong-sized icon is named outright. Other usual causes: `sw.js` didn't get uploaded, the page hasn't been reloaded once since the worker registered (it says "no — reload once"), or the site was opened over http because Enforce HTTPS is off in the repository's Pages settings.

### Installing it on a phone

**Android:** Chrome offers to install it, and an "Install PipHub" button also appears on the sign-in screen once the browser is ready. It lands on the home screen with the brass pip icon and opens with no address bar.

**iPhone and iPad:** Safari never offers this by itself, so PipHub shows an "Add to home screen" button with the three steps. Tap share, choose Add to Home Screen, tap Add.

One thing to tell readers on iOS, because it surprises people: **Safari and the home screen icon keep separate storage.** A reader who takes tests in Safari and then installs the icon will find an empty shelf. Install first, then use the icon from then on.

### Filling the screen

Installed, PipHub already has no browser chrome, so nothing more is needed. Opened in a browser tab, it asks for full screen on the tap that signs a reader in — the one gesture every session already has, which is what makes it possible at all, since no browser lets a page go full screen on load. It can be switched off under Appearance on the profile page. iPhone Safari has no full screen for web pages at all; the home screen icon is the answer there.

### Offline and updates

After the first visit PipHub works with no connection — app, modules and avatars are all cached. When you upload a new version, the next visit notices and offers a Reload button rather than swapping the app out underneath someone. If a test is in progress it waits until the test is finished before asking.

Module and avatar JSON is read network-first, so editing a book in `modules/` and pushing shows up on the next open without waiting for a cache to expire.

### What it does not change

Readers, avatars, points and history stay in browser storage on each device. They are never uploaded, so nothing personal is in your public repository — but they also do not sync between devices. A backup file is still the way to move a reader to a new phone, and still the only protection against someone clearing browser data.

If you ever add a picture to `assets/`, remember that folder **is** public. Personal photos should go in through "Use my own picture", which keeps them on the device.

---

## The store

Points stopped being a number and became a currency. A reader's **balance** is everything they have earned from tests minus everything they have spent, and it is what the catalogue header and the store both show now.

### Building the shelf

Unlock instructor mode and the Store grows an **Add an item** button, plus Edit, Lock and Remove on every card.

**What it is.** A name, an optional line of description, and a cost in points. The icon is either one of seventeen built-in symbols with a background and symbol colour you choose, or any picture you like — the same cropper the avatars use, so a photo of the actual reward can be cut to fit.

**How often it can be had.** Four rules: any number of times, once ever, up to a set number, or with a wait between. A cooldown item shows the reader when it comes back — "Again in 3 days" — rather than just refusing.

**When it exists.** Three rules:
- *Always* — it is simply there.
- *Between two dates* — a one-off window. Before it opens the reader sees "Opens 12 Mar"; while it runs they see how long is left, and the pill turns amber in the last week.
- *Returns on a cycle* — the seasonal case. Pick a first date, how many days it stays, and how many months until it comes back. A ten-day item every twelve months is a birthday treat; every three months is a school-term reward. Off-shelf it reads "Returns in about 1 month", and the editor previews that as you set it.

Two more switches: **Locked** shows an item but refuses redemption, which is useful for something a reader has to qualify for. **Hidden** takes it off their shelf entirely. There is also an option to hide an item completely while it is out of season rather than advertise its return.

### Featured, countdowns and sales

**Countdown badge.** An item with a closing date wears a small tilting badge with a blinking dot — "5 days left". Under six days it ticks faster; on the final day it turns coral and reads "Last day!". It only appears when there is genuinely something to count down to, so a permanent item stays quiet. Reduced-motion settings stop the animation.

**Featured.** Any item can be pinned to a Featured band at the top of the store, with a larger icon and a gold edge. Toggle it from the item's Feature button or from the editor.

**Sales.** An item can go on sale for a random amount off, on a repeating schedule:

- *Least off / most off* — the range the discount is drawn from, in 5% steps.
- *A sale may start every N days* — how often the schedule comes round.
- *Each sale lasts N days.*
- *Quiet spell after a sale* — the cooldown. **No sale can begin until it has passed**, however often the schedule says to repeat. Set "every 5 days" with a 14-day cooldown on a 3-day sale and the real gap becomes 17 days; the schedule is pushed out rather than ignored.
- *Odds a sale happens* — below 100% some cycles are skipped, so sales are a surprise rather than a timetable.
- *Move it to Featured while on sale* — discounted items promote themselves and drop back afterwards.

The discount amount is **not** rolled at render time. It is a deterministic function of the item and which cycle the calendar is in, so every device shows the same price, a reload never changes it, and the number cannot shift while a reader is deciding. Nothing is stored and nothing needs a background job.

On sale, the card shows the old price struck through, the new price beside it, and a shimmering "25% off" chip. The reader is charged the sale price, and the redemption log keeps what they paid, the full price, and the discount.

### Redeeming

A reader taps Redeem, confirms against their balance, and the points come off. Eligibility is rechecked at the moment of purchase, so two quick taps cannot overspend.

**Redemptions** (instructor) lists everything every reader has spent, newest first, with a count of what is still waiting to be handed over. **Mark given** tracks that. **Refund** returns the points and removes the redemption, for the inevitable mis-tap.

## Activities

Reading is no longer the only way to earn. An activity is anything you want to encourage — practice, a chore, a habit — with a point value attached.

**Building one.** Name, description, points, and an icon. Then two rules.

*How often it counts:* once only, every day, every week or every month. For a repeating activity you set how many times it can be done in that period, and weekly or monthly ones can also carry a **most-times-in-a-single-day** cap — so "three times a week, but only once a day" is a single setting rather than a rule you have to police. Daily counts reset at midnight, weekly on Monday morning, monthly on the first.

*Who it is for:* every reader, or named ones. An activity assigned to someone else simply does not appear on your list.

**Approval.** Tick *hold the points until an instructor approves it* and marking something done logs it without crediting anything. It appears under **Approvals** with a count of what is waiting, and the points land when you approve. Undo takes them back off. This is the difference between "I say I practised" and "you saw me practise".

A reader taps **Mark done** and the row tells them where they stand — "2 left today", "Done for this week", "1 waiting".

Activity points and test points are the same currency. The store's balance line breaks it down: what came from tests, what came from activities, what has been spent.

## Item and activity icons

Store items and activities share one icon system with three sources: any emoji from your device's keyboard (there is a field you can tap the emoji key into, plus fifty common ones to pick from), seventeen built-in symbols with a background and symbol colour you choose, or a picture cropped with the same tool the avatars use.

## Colour roles

Two colours carry meaning and they never swap jobs.

**Blue is the app.** Taken from the icon's own gradient (`#1163F0`, the deep end), it wears every primary button, the active nav tab and every selected control. Icons inside a blue button are yellow — the chick's colour against its own sky. White on that blue clears WCAG AA at 5.16.

**Gold is the currency.** Point medallions, the balance disc, earned totals, the quiz progress pips and the countdown badge. Nothing clickable is gold any more, so gold means "points" everywhere without exception.

## The app icon

Three versions are built from one piece of artwork, because the three places it appears want different things:

- **`icon-192` / `icon-512`** keep the rounded-square shape with genuinely **transparent** corners.
- **`icon-maskable-512`** is full-bleed: the blue gradient fills the whole square and the bird is scaled to 78% and centred, so it survives whatever shape Android crops it to.
- **`apple-touch-icon`** is full-bleed with no transparency, because iOS ignores alpha and applies its own rounded mask — a pre-rounded icon there gets rounded twice.

The same icon is inlined into the top bar as the wordmark's mark, and again on the sign-in screen as the brand lockup.

## On iOS, install it

The text fields misbehaving inside the installed app on iOS came from two things, both fixed: the status bar was set to `black-translucent`, which makes the web view extend under it and throws touch coordinates off in standalone mode; and iOS does not shrink the layout viewport when the keyboard opens, so a fixed overlay kept covering the whole screen while taps arrived in the smaller visual viewport. Overlays are now pinned to `window.visualViewport`, every control in a modal is at least 16px so Safari does not zoom on focus, and the page behind a modal is locked.

## Erasing a reader's data

Settings → Readers now shows tests taken, points spent and current balance per reader, with two actions. **Erase data** removes every test result, all earned points, the activity log, the redemption history and the profile picture, keeping the reader and their name. **Delete** removes the reader entirely. Both need the instructor key.

---

## Verified

Driven headlessly end to end: a simulated year of sales (18 windows, every gap at or above the cooldown, discounts spread across the configured band), activity day and week limits, per-day caps, approval-gated points, emoji icons surviving the editor, store cooldowns, once-only limits, seasonal windows, refunds restoring the balance, erasing a reader's data, every referenced file resolving over http, the full-screen request firing on the sign-in gesture, the back button guarding a test in progress, palette switching and persistence, profile creation, per-reader isolation of records, PIN sign-in, the retake gate closing again after instructor mode locks, folder sync over http, and the cropper — a zoomed-out square image on a brass backdrop exported at 256×256 with transparent corners outside the rounded mask and the source image intact in the middle.
