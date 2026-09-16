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

## 5. Chapters

A title can be tested as a whole book, chapter by chapter, or both. Add a `chapters` array and each entry becomes its own test with its own questions, its own points and its own pass mark:

```json
"chapters": [
  { "id": "ch1", "title": "1. Down the Rabbit-Hole", "points": 1.5,
    "questions": [ { "q": "...", "options": ["...","..."], "answer": 0 } ] }
],
"questions": [ ... ]        // still the whole-book test, if you want one
```

The top-level `questions` array stays exactly what it was, so every existing module keeps working untouched. A title with both offers the chapters and a final test over the lot.

**Points.** Each chapter pays separately and pays once, from its best attempt — so a reader can retake chapter 2 without putting chapter 1's points at risk. The number on the catalogue medallion is every chapter plus the book test added together.

**Order.** Set `"chaptersInOrder": true` in `quiz` and each chapter stays locked until the one before it is passed, which keeps a reader honest about reading in sequence. The whole-book test is never gated — a reader who has finished the book can sit it.

**Progress** shows on the title page as a bar and on the catalogue card as "2/4 passed".

Every catalogue card leads with a badge naming what kind of test it is — **Full book quiz**, **Chapter quizzes**, or **Chapters + book** — so a reader can tell at a glance whether a title is read-then-test or read-along. The quiz names the chapter in its header, results name it, and every record keeps the chapter it belonged to.

`alice-in-wonderland.json` ships as a working example: three chapters at 1.5 points each, gated in order, plus a 3-point whole-book test.

## 6. The module format

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
- **`revealOnFail`** — off by default. A failed attempt lists the questions that were missed, with a one-word topic hint, but **not** the answers: telling a reader the answers and then advising them to go and read it again works against itself, and hands over the key for the retake. Passing shows the full review, answers and explanations included. Set it `true` to show answers however the attempt went.
- **`verdicts`** — the lines on the results card. The Amulet module carries your originals.
- **`answer`** is a zero-based index into `options`. A module where it points outside the list is rejected on import with the question number named.

**PipHub reads the module folder every time it opens.** Drop a new `.json` beside `index.html`, add its name to `modules.json`, push, and it appears on the next load with nobody pressing anything. A module whose `id` matches one already installed is replaced, so editing a title and pushing updates it in place. The read is silent when nothing has changed and silent when offline; it can be switched off under Settings.

Three ways to add by hand as well. **Add from folder** picks a directory and reads every module inside; it works even from a `file://` page. **Add files** and drag-and-drop take one or more. **Read from a manifest** fetches `modules/manifest.json` and everything it lists, and needs a web server — turn on auto-sync in Settings and it runs on every open. A module whose `id` matches one already installed replaces it, which is what makes the manifest a real sync rather than a duplicator.


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

**Corner badges.** The sale rosette owns the top-right corner of the card, overhanging it.

The countdown floats in that same corner when it is the only thing to say. As soon as a card carries both — or is featured — the countdown moves into a bar across the top of the card instead, because two things hanging off one corner either stack onto the title or spill off the edge of the shelf. The bar carries the feature banner on the left and the countdown on the right; with no feature banner, the bar belongs to the countdown alone and takes its colour, turning coral on the last day.

A sale wears a green rosette with the number large and "OFF" beneath, ringed by a slowly turning dashed circle, bobbing gently with a shine sweeping across it. Discounts of 30% or more get a larger rosette.

A closing item wears a swinging tag — "3 DAYS LEFT" — with a blinking dot. Under six days it swings faster; on the final day it turns coral and reads "LAST DAY". It only appears when there is genuinely something to count down to, so a permanent item stays quiet.

Both respect reduced-motion settings.

**Featured.** The store is one shelf, not two. A featured item sorts to the front of it rather than moving into a separate section, so an item that becomes featured — or promotes itself by going on sale — simply slides forward among its neighbours. Its look is configurable: a banner colour (gold, blue, mint, rose or plum), your own banner text — "STAFF PICK", "NEW", whatever fits — an optional glow, and a switch to give it the full width of the shelf. Toggle featuring from the item's Feature button or the editor; the look controls appear as soon as Featured is ticked.

**Sales.** An item can go on sale for a random amount off, on a repeating schedule:

- *Least off / most off* — the range the discount is drawn from, in 5% steps.
- *A sale may start every N days* — how often the schedule comes round.
- *Each sale lasts N days.*
- *Quiet spell after a sale* — the cooldown. **No sale can begin until it has passed**, however often the schedule says to repeat. Set "every 5 days" with a 14-day cooldown on a 3-day sale and the real gap becomes 17 days; the schedule is pushed out rather than ignored.
- *Odds a sale happens* — below 100% some cycles are skipped, so sales are a surprise rather than a timetable.
- *Move it to Featured while on sale* — discounted items promote themselves and drop back afterwards.

**A sale belongs to the item, so it cannot outlive it.** The schedule is intersected with the item's own availability before anything is shown:

- An item with three days left never carries a four-day sale. The sale is cut to three days, and the editor says so.
- A sale scheduled for after the item closes is never advertised. The store does not promise a discount on something that will be gone.
- A sale *can* appear in an item's final days — that case is useful, so it is allowed and simply clipped.
- For an item that returns on a cycle, a sale only counts if it lands inside one of its seasons. If the cadences never coincide, the editor says "no sale falls inside the time this item is available" rather than quietly scheduling one that never appears.

The discount amount is **not** rolled at render time. It is a deterministic function of the item and which cycle the calendar is in, so every device shows the same price, a reload never changes it, and the number cannot shift while a reader is deciding. Nothing is stored and nothing needs a background job.

On sale, the card shows the old price struck through, the new price beside it, and a shimmering "25% off" chip. The reader is charged the sale price, and the redemption log keeps what they paid, the full price, and the discount.

### Redeeming

An item a reader cannot afford yet is **not** dimmed. It keeps its full colour and simply says how many more points are needed, because something to save towards should look worth saving towards. Dimming is kept for items that are genuinely shut: out of season, locked, or already taken to their limit. The shelf sorts accordingly — redeemable first, then within reach, then closed.

A reader taps Redeem, confirms against their balance, and the points come off. Eligibility is rechecked at the moment of purchase, so two quick taps cannot overspend.

**Redemptions** (instructor) lists everything every reader has spent, newest first, with a count of what is still waiting to be handed over. **Mark given** tracks that. **Refund** returns the points and removes the redemption, for the inevitable mis-tap.

## Activities

Reading is no longer the only way to earn. An activity is anything you want to encourage — practice, a chore, a habit — with a point value attached.

**Building one.** Name, description, points, and an icon. Then two rules.

*How often it counts:* once only, every day, every week or every month. For a repeating activity you set how many times it can be done in that period, and weekly or monthly ones can also carry a **most-times-in-a-single-day** cap — so "three times a week, but only once a day" is a single setting rather than a rule you have to police. Daily counts reset at midnight, weekly on Monday morning, monthly on the first.

*When it is available:* always, between two dates, or returning on a cycle — the same three rules the store uses. That makes a reading-week challenge, a holiday task or a termly bonus possible: the activity appears on its own, wears a swinging countdown badge while it runs, and goes quiet when it is over. There is a switch to hide it entirely between runs rather than advertise its return.

*Who it is for:* every reader, or named ones. An activity assigned to someone else simply does not appear on your list.

**Approval.** Tick *hold the points until an instructor approves it* and marking something done logs it without crediting anything. It appears under **Approvals** with a count of what is waiting, and the points land when you approve. Undo takes them back off. This is the difference between "I say I practised" and "you saw me practise".

A reader taps **Mark done** and the row tells them where they stand — "2 left today", "Done for this week", "1 waiting".

Activity points and test points are the same currency. The store's balance line breaks it down: what came from tests, what came from activities, what has been spent.

## Item and activity icons

Store items and activities share one icon system with three sources: any emoji from your device's keyboard (there is a field you can tap the emoji key into, plus fifty common ones to pick from), seventeen built-in symbols with a background and symbol colour you choose, or a picture cropped with the same tool the avatars use.

**Size.** A slider sets how large the mark sits inside its tile, from 50% to 180%, and the preview follows as you drag. The scale is relative, not absolute, so one setting looks right everywhere the icon appears — the 68px featured tile, the 48px activity row, the 36px line in a receipt. A busy emoji can be dialled down, a simple glyph pushed up to fill its square.

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

## Your profile

The top bar carries three sections — Catalogue, Activities, Store — and that is all. Everything about *you* lives behind the avatar chip in the top right corner, which lights up while you are there.

The profile page is the hub: your picture and name, quick cards through to **Records** (tests taken, points from reading) and **Points** (balance and what you have redeemed), appearance settings, and the reader switcher. Records has a link straight back.

## Pip

Every reader has their own Pip, and Pip is their face everywhere in the app — the sign-in tile, the chip in the top right, their profile, the results card. He also fills the places that used to be blank sentences: an empty shelf, a store with nothing in it, records before a first test.

**He is drawn, not stored.** A look is a set of slot choices — colour, pattern, eyes, hat, back, holding, aura — assembled at render time against a rig whose anchor points move with the pose. That is why a crown sits correctly whether Pip is cheering or asleep, why he is sharp at 28 pixels and at 150, and why adding a new hat costs one shape rather than one per pose. A single light source governs every layer, so nothing looks pasted on.

Seven slots with 30 parts already give tens of thousands of combinations, and each new part multiplies rather than adds.

### Pip's room

Every other number in PipHub is a balance, and a balance goes down when it is used. The room is the opposite — a place that only fills up. It is reached from the profile page.

It is a scene, not a page. Pip stands in it, wearing whatever he is wearing. Behind him is a **bookshelf with a spine for every title finished** — colour and height drawn from the title itself, so the shelf is the same shelf every time. On the wall hang **frames of the best-rated artwork** sent in to events, and a **plaque with the longest run of days** ever managed. On a plinth stand **trophies for anything rated at the top of its rubric**. The reader picks the wall colour from six.

Nothing here is stored specially. The shelf, the frames, the plinth and the plaque are all read back out of records that already exist, so the room was true the moment it was built, including for readers who have been going for months.

Four figures sit under the scene and **never go down**: points earned in all, books finished, best run of days, and best rating. Spending does not touch them. A title later removed from the catalogue stays on the shelf — it is still a book they finished.

### Cosmetics

Bought with points from the **Pip** shelf in the store. Single parts are cheap; six complete looks — Bookworm, Royal, Winged, Astro, Starcaster, Legend — are bundles worth saving for, which makes them natural wishlist targets.

Two things make them different from ordinary store items. They are **yours for good** once unlocked, and they **never appear in Redemptions** — the app hands them over itself, so nothing waits for an instructor to mark it given. That makes them somewhere for points to go that costs you nothing, which lets the real-world rewards stay priced honestly.

Unlocking one puts it on immediately. **Dress Pip**, on the profile page or the store shelf, shows everything owned with a live preview; tap to wear, tap again to take off.

Settings → Pip lets you set the price of every part and look, take any of them off sale, or hide the shelf entirely. ### Which face a reader shows

Pip or a picture is an **explicit choice**, not a matter of which field happens to be filled. The profile page shows both side by side; tap to switch. A reader who already had an avatar keeps it until they say otherwise, and switching between them never deletes anything — the picture stays on file, and deleting it is its own deliberate action.

Dressing Pip or unlocking a cosmetic switches the choice to Pip automatically, since otherwise you would be dressing a face nobody could see.

### Top tier and powers

Two looks sit above the rest. **Dragonheart** — inferno body, swept horns, membraned wings, scales, a lit flame and rising embers. **Starborn** — an aurora body under a galaxy, a crown of turning stars, a tilted orbit ring and a drifting starfield.

A complete look can carry a **power**, and it only counts while **every piece of it is worn**. Take the orbit off and Starborn's boost switches off with it, which is what makes keeping the whole set on worth something.

Three kinds, set per look in Settings → Pip:

- **Point boost** — a percentage added to everything earned: tests, activities, streak payouts.
- **Store discount** — a percentage off everything, stacking with sales up to a 90% floor.
- **Extra wish payback** — added to what a granted wish pays back.

The boost is applied **as points are earned**, not to the running total. The record stores what was actually awarded and the percentage that produced it, so changing outfit later never rewrites history, and the results card says "Pip added 15%".

Dragonheart ships at 10% and Starborn at 15%, both editable — including down to none, if you would rather cosmetics stayed purely cosmetic.

### Cosmetics that move

Wings beat, a cape sways, a jetpack flickers, an aura pulses, sparks twinkle out of step with each other, a wand's star turns, a balloon bobs, a crown's gem catches the light. Pip himself breathes, and blinks every seven seconds.

Motion is scoped to the part that should move rather than the whole figure, and only full-size Pips animate — a grid of thirty swatches in the dressing room stays still. Reduced-motion settings stop all of it.

## Bonus cosmetics

A store item, an activity or an event can carry a Pip part along with it. The controls are the same in all three editors: a switch, a daily chance, and a pool of parts to tick.

**The roll is deterministic.** It is a function of the thing, the reader and the date, so it holds still all day, cannot flicker as the page redraws, and gives a reason to look again tomorrow. Nothing is stored and nothing ticks over in the background. Verified: identical when rolled twice, independent between readers, flipping about half the days in a month, and honest about its odds — 10, 25, 50 and 80 per cent came out at 9.8, 24.6, 49.6 and 79.2 over four thousand rolls each.

**A pool, not one part.** Anything a reader already owns is never picked, so a bonus does not quietly stop meaning anything once they have the hat.

**Win-only parts.** A part taken off sale in Settings → Pip can still sit in a bonus pool — that is how something becomes obtainable only by earning it. The pool marks those, so you can see what you are making exclusive.

**It is shown before anyone acts**, as a strip along the bottom of the card with the actual part drawn on a Pip and named: *"Comes with Wings — a bonus for Pip, today only."* The base reward is never reduced to pay for it, and nothing is ever bought in the hope of a bonus. For events the bonus lands with the **rating**, which is also the moment worth celebrating; for approval-gated activities it lands on approval; for store items, on redemption.

## Events

Off by default. Settings → Events switches the tab on for readers.

An event asks for something and is rated once it comes back. Four templates:

- **Arts and crafts** — make or draw something and photograph it.
- **Writing** — a review, a paragraph, a list.
- **Tally** — report a number: minutes read, pages, laps.
- **Challenge** — say you did it, with a note if you like.

**The rating decides the points.** Each event carries a rubric you write yourself — three by default, *Gave it a go* 2, *Nicely done* 4, *Outstanding* 8 — with up to six rows. Nothing is awarded until you have looked at it, and the card tells readers what the top rating is worth.

Scheduling reuses what the store and activities already use: always, between two dates, or returning on a cycle. So a one-off half-term competition, a fortnight-long challenge and something that comes back every December are all the same three controls. Events can be for everyone or for named readers, and limited to one entry or a few.

**Review** lists everything sent in, newest and unrated first, with the picture, the writing or the number and any note. Rate it, send it back for another go, or undo. Ratings run through Pip's point boost like everything else.

### Photographs

A phone photo is several megabytes and browser storage is a few megabytes in total, so pictures are shrunk on the way in: the long edge comes down to 1200px as JPEG, which took a 9.9 MB test image to 116 KB. The full picture is kept in IndexedDB, well away from the ordinary storage everything else uses, and only a small thumbnail travels with the profile. You can open any submission full size and save it as a file.

A reader may have five submissions waiting at once. Past that they are asked to wait until some come back, which stops an afternoon of enthusiasm filling the device.

## The wishlist

A reader marks **one** item as their wish — the thing they are saving for.

It can only be set on something **out of reach**: by default the item must cost at least 25% more than they currently have. You cannot wish for what you could just buy. The test uses the item's price *today*, so a sale that brings something within reach simply means buying it.

Redeeming a wish costs the normal price and then **pays a slice back** — 10% by default, with an optional cap. That payback is the whole point: it rewards having saved rather than spending as you went. It only pays if the wish is still on that item when it is redeemed, and the wish clears afterwards so a new one can be chosen.

The wish appears as a panel above the shelf with a progress bar and how far there is to go, as a marker on the item itself, and as a one-line nudge on the reading catalogue — "36.0 more points to Cinema trip". When the balance finally covers it, the panel turns green, says so once, and offers to redeem there and then.

All three numbers are instructor-set in Settings, and the whole thing can be switched off.

## Streaks

A run of periods in which a reader did enough. Nothing appears to readers until an instructor sets one up.

Each streak says what counts — **quizzes passed** or **activities done** — how many are needed per period, whether the period is a **day** or a **week**, how many periods in a row complete a run, and what the run pays. That covers "two activities a day for three days" and "a quiz a week for four weeks" with the same four fields.

Runs are **worked out from the records that already exist**, not tracked separately, so they are right even if PipHub was closed for a week, and they survive a restore. The period in progress never breaks a run — a streak only ends when a period finishes without enough in it.

Milestones repeat by default, so a run that keeps going keeps paying; there is a switch for once-only. Awards are remembered against the period that completed them, so re-opening the app never pays twice.

Readers see a strip on the page the streak belongs to — activity streaks on Activities, quiz streaks on the reading catalogue — showing the run so far, how much of the current period is done, and how far to the next payout.

## Backups and restore points

Live data is a single copy in `localStorage`. Two things sit behind it, and they do different jobs.

### Restore points

Compressed snapshots in IndexedDB, taken automatically. They undo mistakes.

One is taken **after every finished test**, and after a redemption or a logged activity if a minute and a half has passed since the last. One is taken when the app is backgrounded — the last reliable moment on a phone. And one is always taken **before anything destructive**: removing a title, clearing records, erasing or deleting a reader, restoring a backup file. Those are marked "safety" and kept for a fortnight whatever else is pruned.

Nothing is stored if nothing changed; snapshots are fingerprinted and a duplicate is skipped.

Retention thins out rather than piling up: the last six in full, then one a day for a week, then one a week for a month. Anything you take by hand is marked "kept" and held for two months. Settings lists them with what triggered each one, what it holds and how big it is, alongside how much device storage is in use. Any of them can be restored, saved out as a file, or deleted — and restoring takes a safety point first, so going back is itself undoable.

### Saved copies

A restore point lives in the same storage that a "clear site data" wipes, and that iOS can evict. Only a file survives losing the device, so **Save a copy** offers three scopes:

- **Everything** — readers and content.
- **Titles, store and activities** — no reader data at all. This is the shareable one: it moves your shelf to another teacher without carrying a child's name or photo. Restoring it *merges*, and never touches the readers already there.
- **Readers only** — names, pictures, points and history.

Every file carries a schema version, a timestamp, counts and a fingerprint, so a truncated or edited file is caught before it overwrites anything. PipHub records when you last saved one; if it has been more than a fortnight, unlocking instructor mode says so, and the Backups panel says so in amber.

A full copy holds children's names and pictures alongside every answer key. It should not go in the repository PipHub is served from.

## Erasing a reader's data

Settings → Readers now shows tests taken, points spent and current balance per reader, with two actions. **Points** opens an adjustment panel: quick −10 to +10 buttons or an exact figure, plus a reason the reader sees. It refuses to push anyone below zero, keeps a log of recent adjustments, and each one can be undone. Instructor-granted points show separately in the store's balance breakdown.

**Erase data** removes every test result, all earned points, the activity log, the redemption history and the profile picture, keeping the reader and their name. **Delete** removes the reader entirely. Both need the instructor key.

---

## Verified

Driven headlessly end to end: wish eligibility against a moving balance and the 10% payback landing on redemption, streak runs computed from seeded history with milestones paying once and only once, a simulated year of sales (18 windows, every gap at or above the cooldown, discounts spread across the configured band), activity day and week limits, per-day caps, approval-gated points, emoji icons surviving the editor, store cooldowns, once-only limits, seasonal windows, refunds restoring the balance, erasing a reader's data, every referenced file resolving over http, the full-screen request firing on the sign-in gesture, the back button guarding a test in progress, palette switching and persistence, profile creation, per-reader isolation of records, PIN sign-in, the retake gate closing again after instructor mode locks, folder sync over http, and the cropper — a zoomed-out square image on a brass backdrop exported at 256×256 with transparent corners outside the rounded mask and the source image intact in the middle.

## Seasonal looks and festival powers

Seasonal parts and looks carry a `season` key and only sit on the shelf inside that season's window (`PIP_SEASONS`). Anything already unlocked stays the reader's for good.

**Pricing for new drops:** Basic looks 30–55 points, Complete Looks 100–300, Top Tier 500–700. Every new look carries the standard **1% power** in one category, all year.

**Festival powers.** Anything above that 1% is tied to a season, so Basic looks stay worth wearing. A look can carry `festival:{season, abilities:[…]}`: those powers only switch on while that season is open, and the shelf card shows them in green with their end date. Out of season the look drops back to its standard 1%.

**Moon Festival 2026** (on the shelf 10 Sep – 10 Oct; festival night is 25 Sep):

- **Little Mooncake** (40 pts, +1% points): mooncake body with a pressed pattern and an osmanthus sprig.
- **Lantern Keeper** (240 pts, +1% wish payback): vermilion body with gold clouds, a lantern cap with a swinging tassel, a rabbit lantern and rising sky lanterns.
- **Jade Moon Sage** (650 pts, 1% off all year; **+2% points, 2% off and +2% wish payback during the Moon Festival**): jade body with moon silk and pearls, moonlit eyes, a crescent diadem with pearl strands, flowing silk ribbons, a moon mirror with a moving glint, a full moon behind, a **Moon pond** under his feet (the new *Ground* slot), rising moon dust, and a **Jade rabbit** companion that hops when Pip cheers, dozes when he sleeps and droops an ear when he is sad.

**Harvest Fair 2026** (on the shelf 16 Sep – 31 Oct):

- **Candy Apple** (45 pts, 1% off): a glossy candy-apple body, a caramel drip with sprinkles, and a wooden stick with a swaying leaf.
- **Fairground Friend** (260 pts, +1% points): a corn-silk body in picnic gingham with a blue-ribbon badge, happy eyes, a straw boater with a ticket in the band, cotton candy, two spinning pinwheels and swaying fair bunting.
- **Carousel Maestro** (680 pts, +1% wish payback all year; **+2.5% points, 2% off and +3% wish payback during the Harvest Fair**): a **colour-shifting body** that slowly cycles pink, gold and teal like carousel lights, a gilded marquee band with chasing bulbs, sparkle eyes, a ringmaster's top hat with a plume, a carousel crest behind him, a grand champion rosette, a turning **Ferris wheel** whose gondolas stay upright, a spinning **carousel deck** under his feet, falling confetti, and a **Carousel pony** companion that rides up and down its golden pole.
- **Sold on their own** (in no complete look): Apple cider colour, Flannel plaid, Candy heart eyes, Popcorn bucket hat, Fair kite, Hot cider mug, Apple orchard, Hay patch, Popping corn and a **Blue-ribbon lamb** companion (Sleepy).
- The Harvest Fair also has its own event banner, a confetti weather option, and Pip wears the straw boater on Harvest Fair events.

## Wish lock

Once a reader picks a wish, it is **locked in** for a set number of days (7 by default). A confirmation screen reminds them that choosing a wish is a commitment. While it is locked, the store shows "Locked · N days" instead of Change, and no other item can become their wish. When the wish is granted, the lock ends, unless "Keep the lock running even after the wish is granted" is ticked. An instructor with the key can release a lock. If the wished-for item is removed from the store, its lock ends too. Settings → Wishlist sets the number of days (0 turns the lock off).

## Seasonal event banners

An event can wear a banner for Spring, Summer, Fall, Winter, Halloween, Christmas, New Year, Independence Day or Moon Festival. The banner is a coloured strip across the top of the card with gently moving emoji, your own text (or the season's name), and the countdown inside it. You pick it in the event editor, which shows a live preview.

## Pips on display

Complete looks a reader owns but isn't wearing stand around Pip's room as figurines (up to six; four on a phone). Tap one to put that whole look on. The panel under the room lists all of them.

## Pip's pantry (food)

Food is bought with points in Pip's room and fed to Pip for a short power: a point boost, a store discount or extra wish payback, lasting a set number of minutes or hours. A food's power can be tied to a season (for example, it only works during Halloween). A seasonal food is only sold in its season, and its power pauses if the season ends while it is working.

- **Only one food works at a time.** A food's power adds to the power from Pip's outfit, but Pip won't eat another food until the current one wears off.
- **Feeding rules** (instructor, in the room): minutes between meals, most meals a day, and the default number of each food a reader can keep.
- **Per food** (Add food / Edit): price, power, duration, season, how often it can be bought (any time, once ever, up to a number, per day, per week, or with a wait in hours), most kept at once, hours before Pip eats that same food again, when it is on the menu (always, between two dates, or on a repeating cycle), hidden, win only, and hide when off the menu.
- Feeding plays a short animation: the food drops in, Pip chews, crumbs and hearts fly, and the power is shown. Turning on reduced motion shows a still version instead.
- While a food works, a bowl sits beside Pip, the room and dressing room show a green power pill with a live countdown, and the pantry shows how long is left.
- Food purchases are marked like cosmetics, so they never show up in Redemptions.
- Five starter foods are added on first run: Honey toast, Berry smoothie, Lucky cookie, Lotus mooncake (Moon Festival) and Pumpkin pie (Halloween).
- **As a bonus:** the bonus pool in the event, activity and store editors has a "Food for Pip's pantry" group. A won food goes into the pantry. Unlike cosmetics, food can be won again, but only once per event, activity or store item per day.

## The event engine: rounds, repeats and new kinds

**Rounds.** Every event runs in rounds, and each entry belongs to the round it was sent in. Entry limits ("once only", "up to N") now count **per round**, so an event a reader finished last round can be done again. Entries from before this update are placed in the right round by their date. An event that "returns on a cycle" gets a fresh round each time it comes back.

**Repeats** (in the event editor):

- **Every day**
- **Every week:** optionally only on chosen weekdays, such as Fridays.
- **Every month**
- **Every few days:** set the number of days.
- **Every year:** between two month/day dates; this can wrap the new year.

The editor shows whether the current round is open. Cards show "↻ Every day" and "Done 3×", and a finished event says "Sent in · again tomorrow".

**Timed challenges.** Any event can be limited to a time of day (for example 15:00–17:00). Pair it with "Between two dates" for a one-day challenge, or with a repeat for a daily one. While it is open, the card or its seasonal banner counts down live.

**New event kinds**

- **Checklist:** a few steps (read, draw, write a caption), each with its own points, plus an optional bonus for finishing them all. Steps can be required in order, and can need instructor approval. Readers work through them in "Open checklist".
- **Group goal:** every reader adds a number to one shared total, such as 500 minutes this week. The card shows a progress bar and how many are helping. When the target is reached, every reader the event is for, or only those who helped, gets the reward. Entries can also pay a little each, and can need approval before they count.
- **Holiday calendar:** one door opens each day from a month/day start date, and each door can pay. Missed doors can optionally be opened later. Opening every door pays a finishing bonus. The calendar comes back every year.

**Pip link-ups.** An event can require a complete Pip look to be worn, or cost one food from the pantry. The food is taken once per round, on the first entry. It can also hand out a guaranteed gift of a Pip part and/or a food. The gift lands when an entry is rated, when a checklist or calendar is finished, or when a group goal is reached. This is on top of the random bonus pool.

**Duplicate.** Each event card has a Duplicate button for instructors. It opens the editor on a copy with the same rubric, banner, steps, repeats, link-ups and bonus pool. The copy is hidden until you untick Hidden.

**Review.** Checklist steps, calendar doors and group-goal entries that need approval show a single Approve button. Checklist steps and group-goal entries never count toward room trophies.

## Connected events

**Steps that fill themselves in.** Each checklist step or calendar door can have a "Done when" rule:

- pass N quizzes (any title, or a named one)
- finish N books (optionally at a minimum reading level)
- log an activity N times (any activity, or a named one)
- earn N points
- get N top ratings on events

Only what happens after the round starts counts (for calendars, after that door's day starts). The step shows a progress bar, and when it is met the reader taps **Claim**. Cards say "2 ready to claim" and get a gold outline.

**Book-linked events.** Tick the books an event belongs to. It then appears on each book's page and on the results screen after a pass. It can optionally stay locked until the reader passes a quiz for one of those books.

**Quests.** "Comes after" locks an event until an earlier one is complete. For repeating events, the earlier one must be complete within the current round.

**Automatic group goals.** A group goal can count by itself from quizzes passed, books finished, activities logged (any activity, or a named one), or points earned during the round. Nothing needs to be typed.

## A living Pip

- **Pip on each page.** On the catalogue he holds a book and points out the title closest to being finished. In the store he waits by your wish and bounces when you can afford it. On activities he holds a balloon, or a trophy once something's done today. On events he wears the theme of an open seasonal event (a witch hat for Halloween, a Santa hat for Christmas, and so on). Tap him to hear what he thinks.
- **Quiz coach.** A small Pip reads along beside the question count, nods at each answer, cheers on the last question, and dozes after 45 seconds of idling. He never reacts to right or wrong answers, since that would give answers away mid-test.
- **The room across the day.** A window shows the sky, and the room's light changes through morning, day, evening and night. Pip's pose follows the time, and at night he wears a nightcap if he has no hat on.
- **Seasonal weather.** Scenery only: snow, blossom, sunshine, leaves, bats or sky lanterns, depending on the season. It shows in the room window and faintly across the top of the app. Winter, Spring and Summer seasons were added for this.
- **Companions.** A worn pet leaves Pip's side in the room and behaves by personality: the Jade rabbit (Curious) wanders to the shelf, the Ghostling (Sleepy) drifts and naps, and future pets default to Proud. Some days a companion finds something (a food, 1–3 points, or rarely a Pip part), which glows in the room until the reader taps it. There is at most one find a day. Finds are rolled from the reader, the pet and the date, so they can't be farmed, and an unclaimed find is gone the next day.
- **Instructor controls:** Settings → Wishes and streaks → Living Pip switches each of these on or off, can force or stop the weather, and sets the daily chance of a find.

## Countdown reminders

One strip on the catalogue shows the most pressing item, with "+N more" to expand:

- events closing within 24 hours (1 hour for timed challenges)
- today's calendar door
- steps ready to claim
- group goals at 75% or more with less than two days left
- a seasonal Pip shelf closing within 3 days
- the wish lock ending
- a food power wearing off

Each item can be dismissed until its next stage. The Events tab shows a small count badge. Every reminder type can be switched off in Settings.

## Pip powers: full control

Settings → Pip now manages powers in three places.

**Edit powers (on each complete look).**
- **All-year powers:** any mix of point boost, store discount and extra wish payback, one of each kind, each with its own percentage. Remove them all to make a look purely cosmetic.
- **Seasonal abilities:** tick any from the library. Each one uses its own dates, or custom dates for that look only.
- **Back to the shipped powers** removes your changes.

The Powers column shows each look's powers at a glance, including whether each seasonal ability is on now or when it starts. An asterisk (*) marks custom dates.

**Seasonal abilities (library).** Create, edit and delete named abilities, each with one or more powers and its dates:
- every year between two month/day dates (this can wrap the new year)
- specific dates
- following one of Pip's seasons (Autumn, Halloween, Moon Festival, Winter, Spring, Summer)

The list shows whether each ability is on now, waiting or ended, and which looks use it. Looks that shipped with a festival bonus (such as Jade Moon Sage) appear here as editable abilities. Deleting one removes it from every look straight away.

**Power categories.** Switch a kind of power off everywhere, or cap the total a reader can have of it. The cap covers outfit, seasonal ability and food together; 0 means no cap.

**How powers combine.** A look's powers only count while every piece is worn. For each kind, the strongest all-year or active seasonal value counts, food adds on top, and then the category cap applies. Earlier per-look power settings carry over automatically.

## Top bar

- **Menu icons:** each section has an icon (book, checklist, star, bag). The Store sits at the far right of the menu. The instructor's Titles and Settings show as icons with tooltips, unless one is open.
- **Narrow screens:** on medium-width screens the menu shows icons only, except the open section. On phones the menu becomes its own scrolling row with labels.
- **Pip's room button:** a house button next to the palette switch opens Pip's room, and it lights up while you're there.
- **Logo:** the PipHub logo in the top bar is larger (36px, or 32px on phones).

## Seasons (instructor)

Settings → Pip → **Seasons** lists every season with its yearly dates, whether it is open right now, its weather, and what uses it (Pip items, seasonal abilities, foods).

- **Edit** any season: rename it, change its yearly dates (an end before the start runs over the new year), and pick its weather.
- **Open or closed:** *Follow the dates* (normal), *Open now* (open from today until its next end date, whatever the dates say, which is handy for a surprise or for testing), or *Closed* (its items leave the shelf, and its abilities, foods and weather stop).
- **Back to the shipped dates** undoes changes to a season that came with PipHub.
- **New season** creates your own season. You can then use it in seasonal abilities ("Follow a Pip season"), foods and weather. Your own seasons can be deleted; anything using one stops until it is given other dates.
- Readers always keep items they already own. Changes are stored in `S.settings.pipSeasons` and travel with backups.
- When several seasons with weather are open, your own seasons show first, then Moon Festival, Halloween, Harvest Fair, Winter, Autumn, Spring and Summer.

## Your own powers (instructor)

Settings → **Your own powers** creates new kinds of power. Pick a capability and where it applies:

| Capability | Where it can apply |
|---|---|
| Point boost | everything, quizzes only, activities only, events and group goals only, streak payouts only |
| Store discount | store rewards and food, store rewards only, Pip's food only, **Pip cosmetics** |
| Extra wish payback | granted wishes |
| **Longer food powers** (new) | every food Pip eats: food powers last N% longer |
| **Companion luck** (new) | +N% chance of a daily companion find |
| **Bonus luck** (new) | +N% chance of bonus cosmetics and food on store items, activities and events |

The three new capabilities are also shipped power kinds you can put on any look. Your own powers show up in "Edit powers", seasonal abilities and the Power categories table (each with its own on/off and cap). A power adds to the shipped power of the same capability where both apply. Deleting a power removes it from every look and seasonal ability.

## Settings page

The palette switch is no longer in the top bar (it stays on the sign-in screen and the profile page). The instructor-mode line is now a slim strip. Every settings panel folds: they start collapsed, "Expand all" and "Collapse all" sit above them, and open panels stay open for the rest of the session.

## Pip Town (community)

A town of **simulated neighbours** with usernames like Aidan16, Bradley and KorKaijen#4623. Each one has a Pip look, a personality (Bookworm, Collector, Crafter, Sporty, Night owl, Easy-going) and always carries a **Pip Town** badge. Everything they do is worked out from the clock, so it holds still on reload and nothing runs in the background. The town is busier after school and at weekends.

- **Town tab:** every neighbour with a live status: **Online**, **Reading** (with the title), **Taking a quiz**, **In Store**, **Recently active** (with how long ago) or **Offline** (last seen). Filters for Online, Reading, In Store and Friends. An "Around town" feed shows what neighbours have been doing.
- **"N reading this"** on catalogue cards and title pages: how many in the town are reading the title and taking its quiz right now, with the faces of named neighbours on it.
- **Room visitors:** now and then a neighbour visits Pip's room.
- **Parcels (items only):** neighbours leave food or cheap Pip items at Pip's door (daily chance set by you), and send a **thank-you gift** the day after a reader gives them something.
- **Readers giving gifts:** readers can give food from the pantry (and, if you allow it, Pip items they own, which they then lose) on the Town page, from event activity and to room visitors. One gift per neighbour a day, with a daily limit. Gifts build a friendship level (up to five hearts).
- **Events:** "Neighbours join in" shows their activity on the event card and when a reader takes part. "Town-wide" puts a banner with live progress at the top of every page while the event is open.
- **Community-driven group goals:** tick "The town helps with this goal" and set where the town alone gets to by the end (presets: finishes it alone 120%, nearly 92%, needs a real push 65%, barely helps 30%), the shape of the climb (steady, slow start, late rush, fast start, in bursts), and how often the town's total moves (every hour, day, week or month). For a goal that doesn't repeat, set how many days it runs. Readers' own numbers add on top, the card shows "you X + Pip Town Y", and when the time is up the goal ends **reached** or **not reached**. Rewards go to real readers only.
- **Settings → Community:** switch the town on or off, rename it, choose how busy it is (Quiet, Lively, Bustling) and the town size behind the reading counts, switch each surface on or off, set the parcel chance and what parcels can hold, where readers can give and what, and the daily gift limit. You can add your own neighbours, remove them, or move shipped ones away.

## Whole looks as bonus awards

The "Bonus for Pip" pool in the event, activity and store editors now starts with two new groups: **Complete looks** and **Top-tier complete looks**. Tick any look and, on the days the bonus rolls, the card says "Comes with the complete *name* look". Winning it hands over every piece of the look, puts it on straight away, and plays the look-won celebration (listing its powers, including any seasonal bonus). A look the reader already fully owns is never picked. Looks that are out of season or taken off sale can still be won, which makes them win-only. Set the chance to 100% to make the look a certain prize.

Events also have a **guaranteed** "Gift a complete look" in Pip link-ups (top-tier looks are starred). It lands with the other gifts: when an entry is rated, a checklist or calendar is finished, or a group goal is reached.

## Books a reader owns

Titles → **Books each reader owns** is a grid of titles against readers. Tap a cell to switch between **Owns book** and **Not yet owned**; "All" and "None" set a whole reader at once. A title that isn't owned still appears in the catalogue with a red "Not yet owned" tag, and its quiz buttons read "Not yet owned" and can't be started. The title page says so too, and in instructor mode it has a one-tap "Mark Owns book" for the signed-in reader.

- Every title added from now on starts as **Not yet owned** for every reader, and so does every title for a reader created from now on.
- When this update first opens, readers who already exist are marked as owning the titles already installed, so nobody is locked out of books they were already reading.
- The switch "Only allow quizzes for books a reader owns" turns the whole rule off.

## Events page order

Pinned events come first ("Pin to the top of the Events page" in the event editor), then open community events, then events waiting for a Join or a Claim, then everything else that's open, then upcoming ones. Events that don't repeat and have finished (their dates are over, or their community goal's time ran out) move into a collapsed **Ended events** section at the bottom.

## Joining community events

An event is a **community event** when the town helps with its group goal, or when it is town-wide. By default readers must **Join** it to take part: until they do, the card shows "Join event", its steps and entries are closed, nothing they do counts toward it, and it pays them no rewards. Once they join, only what they do **after joining** counts. The editor has a switch to drop the Join requirement for a particular event. The town-wide banner no longer has a close button; it shows **Join** (or "✓ Joined" and View).

**Connected-event alerts.** PipHub checks what a reader is about to do against every open event they could take part in:

- **Starting a quiz** that would count toward a community event they haven't joined (goals counting quizzes passed, books finished or points earned, events linked to that book, or steps done by passing quizzes or earning points).
- **Marking an activity done** that would count toward one (goals counting that activity or points, or steps done by logging it).
- **Buying a Pip item, look or food** that can be earned in an open event (as a guaranteed gift, a bonus, or as part of a look that can be won).

It shows a message naming the events and why each is connected, with **Join** buttons and **Join and continue**, **Continue without joining** (or **Buy it anyway**) and **Open Events**. Each alert shows once a day for the same thing. The same connections appear as a small "🤝 Counts toward … — join to get credit" line on title pages and activity rows, and as "Can be earned in an event" on Pip shelf looks.

## What's new popup

After an update, the first time a reader reaches the catalogue they see a one-time popup:

- **The header** is a bold hero with the release title and headline, confetti, and the newest Pips on stage (the top-tier look in the middle).
- **The showcase** lists everything added since this device last saw the popup, worked out by comparing the catalogue: new top-tier Pips (with powers and seasonal bonus), new complete looks, new companions (with their personality), new cosmetics (counted by slot), new foods, store items, books and events.
- **"Also new"** lists the release's feature notes. Instructor-only notes are shown only in instructor mode.
- **Buttons** jump to the store or Events, or close the popup.

It shows once per version per device. A brand-new install doesn't show it. **Settings → What's new** can switch it off, preview it, or show it again on the next visit.

For each release, the app carries `APP_VERSION` (kept equal to the `VERSION` in `sw.js`) and an entry in `APP_RELEASES` with its title, headline, features and the seasons to spotlight.

## Banner → event

Clicking the town-wide banner (or its View button) opens the Events page, scrolls to that event and makes it glow. If the event is in Ended events, that section opens. The Join button on the banner still joins directly.

## Community goals update live

While PipHub is open, community goals refresh by themselves the moment the town's total moves (checked every 30 seconds; never while a popup, quiz or text field is in use). Each community goal card shows "Pip Town added +N in the last hour · next update in M min". The town's schedule is lined up with its step, so an hourly goal moves at the top of every hour. Totals round to the nearest whole number, so each step always shows its share. The editor states the average gain per step. A goal of 500 over 14 days at 90% moves about +1.3 an hour, so small targets or long runs move slowly by design.

## Growing Pip Town

**Add neighbours in bulk** (Settings → Community → Neighbours). Choose how many (up to 300 at a time), a name style (a mix, first names like *Priya*, name + numbers like *Leo27*, handles like *maya.reads*, gamer tags like *PixelFox#3812*, or mash-ups like *QuietOtter*), a personality or a mix, and whether some may wear seasonal items. Each neighbour gets a unique name and a Pip look made from everyday parts. You see them all before anything is added, and 🎲 New names draws another batch. "Remove generated neighbours" takes them all out again and keeps the ones you added by name. The neighbours table shows 25 at a time, with "Show all".

**Town ecosystem** (Settings → Town ecosystem) lets the town live on its own. Set:

- **Counting from:** the date the ecosystem starts; everything is worked out month by month from then.
- **Never fewer than / never more than:** population limits.
- **Breaks:** the average % of neighbours dormant at any time over the year, and how many weeks a break lasts. Dormant neighbours show as **Away** and don't read, shop, visit or appear in the feed.
- **Quiet hours:** a time window (for example 21:30–06:30) and the % of neighbours offline during it.
- **Moving in and out:** average new neighbours a month, average leaving a month, and the newcomers' name style. The exact number wobbles around the average from month to month.
- **Protection:** keep the shipped neighbours and the ones you added by name, and keep anyone a reader has given a gift to.
- **Announcements:** move-ins (📦) and move-outs (👋) in the town feed. New arrivals carry a NEW badge for two weeks, and the Town page has "New here" and "Away" filters.

The panel shows neighbours now, away now, moved in and moved away this month, a 12-month population forecast and the latest moves. **Reshuffle the future** changes who moves from next month on without touching anyone who has already moved.

Nothing here is stored or runs in the background: moves and breaks are worked out from the month and the ecosystem's seed, so every device shows the same town.

## Pop-ups wait for the reader

Celebration pop-ups (parcels from neighbours, companion finds, gifts, won looks, finished books, streaks, wishes) and the feeding animation no longer close by themselves. Each one has a clear button ("Got it", "Next" when more are waiting, "Yum, thanks!" after feeding). Escape or Enter closes it too, and so does a tap anywhere once it has been up for a moment, so the tap that opened it can't close it straight away. Settings → Living Pip has an option to make them close by themselves after a number of seconds.

## Companions on the move

Companions now move around Pip instead of only floating beside him, each in its own way:

| Companion | How it moves |
|---|---|
| Ghostling | Circles around Pip |
| Jade rabbit | Hops about along the ground, turning to face where it's going |
| Carousel pony | Explores all around: down past Pip's feet, up the far side and over his head |
| Blue-ribbon lamb | Strolls along the ground with a little waddle |

Companions speed up when Pip cheers, and stay put when he is asleep or sad. Small previews stay still, and reduced motion stops all of it. Settings → Living Pip can keep every companion beside Pip instead, and lists each companion's style. New companions take their style from `PET_MOVES` (orbit, hopabout, roam, stroll or hover); without an entry, their personality decides (Sleepy circles, Curious explores, Proud hops about).

## Smaller changes

- The What's new popup opens at the top and fits the screen: the header and buttons stay in view and the list scrolls between them. Its showcase is centred.
- Community event banners and cards read, for example, "12 neighbours helping · you and 2 other readers joined", or "no readers yet — be the first to join".
- Neighbours no longer carry a NEW badge. The "New here" filter on the Town page still finds recent arrivals.

## Events page layout

Community events a reader hasn't joined yet are shown at full strength with their Join button; they're no longer faded. "What you have sent in" now sits at the bottom of the Events page, below the events and the Ended events section.

## Close-up previews

Tapping any Pip item a reader doesn't have yet opens a large, animated preview: a complete look, a single part or a companion. It works on the store's Pip shelf (a look's picture or any single part), on bonus strips on events, activities and store items, on an event's gift pill, and on the What's new popup. The preview has pose buttons (Cheer, Stand, Read, Wait, Sleep). For single parts there's "On my Pip" to see the item on the reader's own Pip. Looks list every piece, with owned ones ticked, plus their powers and seasonal bonus. The preview also shows the season, any event it can be earned in, and an **Unlock** button with the price, or "Not in the store right now" when the item is win-only or out of season.

## Pip — Companions (Settings)

A new panel next to the Pip panel sets:

- **For all companions:** whether they move around Pip, whether they speed up when Pip cheers, their speed (slow to zippy), and whether they find things, with the daily chance.
- **For each companion:** how it moves (its own style, circles, hops about, explores all around, strolls, or stays beside Pip) and its personality in Pip's room (Curious, Sleepy or Proud), each with a preview.

These settings moved here from Living Pip. The events banner and cards no longer say "no readers yet".

## What companions can find

Settings → Pip — Companions → **What companions can find**. Each day a find happens (at the daily chance), it is one of:

- **Food:** optionally only the foods you tick; otherwise any food on the menu.
- **Points:** between a minimum and a maximum you set.
- **Pip items:** from the companion's own season (falling back to everyday items), everyday items only, or only the items you pick from a grid. A reader never finds an item they already own.

Each kind has an on/off switch and a weight that sets how likely it is compared with the others (default food 55, points 40, Pip items 5). Each companion also has a **Finds** setting: anything allowed, food only, points only, Pip items only, or nothing.

## Room badge

The Pip's room button in the top bar shows a pink count when something is waiting there that the reader hasn't seen yet: a companion's find or a parcel from a neighbour. Hovering it lists what's waiting. Opening the room clears the count; new finds and parcels bring it back. The count refreshes every minute, so a parcel arriving later in the day shows up without a reload.
