# Handoff: HolyLandPhotos · Round 2

This addendum covers the six items in `design-round2-brief.md`. Designs live in `source/round2.jsx` plus the existing `plain.jsx` / `mobile.jsx` tokens — no new tokens were introduced.

Open `source/index.html` and scroll to the **"Round 2 · Overlays"** and **"Round 2 · Pages"** sections at the bottom of the canvas. Or open the new `source/screens-r2.html` for a flat preview.

---

## 1 · Mobile hamburger drawer

**Behavior:** Slide-in from the left, 84% width capped at 320px. Overlay dims the rest of the screen with `rgba(0,0,0,0.4)`. Opens on burger tap, closes on:
- Tap outside (overlay)
- Tap the X button (top-right of drawer)
- Tap any link
- Press Escape
- Browser back button (push a history entry on open, pop it on close — this stops accidental site-exit on Android)

**Animation:** `transform: translateX(-100%)` → `0` over 220ms, ease-out. Disable when `prefers-reduced-motion: reduce` (set the animation-duration to `0.01ms` and it'll skip).

**Structure** — three labeled sections, each with a hairline divider:

| Section | Items |
|---|---|
| Search    | Search photos, AI Search |
| Archive   | Browse by Countries, Daily Life and Artifacts, Museums of the World, Complete Site List |
| About     | About this Site, Permission to Use, News, Newsletter, Feedback |

Footer of the drawer: copyright in `--ink-faint`.

**Styles** (in `source/round2.jsx`, `R2_CSS` block):
- `.mpln-drawer-overlay` — full-bleed dim layer.
- `.mpln-drawer` — the sliding panel itself. Shadow `6px 0 24px rgba(0,0,0,0.18)`.
- `.mpln-drawer-section` — vertical groups with hairline bottom border.
- `.mpln-drawer-label` — sans uppercase eyebrow, 11 px.
- `.mpln-drawer-link` — serif 18 px, `min-height: 44px` for hit targets. Active state: `--bg-alt` background.

**Accessibility:** `role="dialog"`, `aria-modal="true"`, `aria-label="Site menu"`. Focus moves into the drawer on open and returns to the burger button on close. Trap focus while open. The body underneath should get `aria-hidden="true"` while the drawer is open.

---

## 2 · Lightbox overlay

**Behavior:** Click any clickable image (photo page main image, section page lead image, photo grid thumbnails) → fullscreen overlay. Image centered with `object-fit: contain`, capped at `max-width: 95vw; max-height: 90vh`. Close on:
- Tap the X button (top-right, 44×44 hit target)
- Press Escape
- Click outside the image (overlay backdrop)

**No prev/next** inside the lightbox — user closes and uses page-level prev/next as you specified.

**Styles** (`.pln-overlay`, `.pln-overlay-close`, `.pln-lightbox-img`, `.pln-lightbox-cap`):

```css
.pln-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.9);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; /* whatever sits above your nav */
}
.pln-overlay-close {
  position: absolute; top: 20px; right: 20px;
  width: 44px; height: 44px;
  background: transparent; border: 0;
  color: rgba(255,255,255,0.9);
  display: flex; align-items: center; justify-content: center;
  border-radius: 3px;
}
.pln-overlay-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
.pln-lightbox-img {
  max-width: 95%;
  max-height: 90%;
  object-fit: contain;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}
```

In production, `position: fixed` instead of `absolute` (the prototype uses `absolute` because each artboard is its own positioning context).

**Caption strip** at the bottom of the lightbox: photo title (white, 600), ID, copyright, and "Press Esc to close" hint. Sans 13 px, 70% white. Use this strip on the photo-page lightbox; on section-page lead images, it can be omitted or just show "Click outside to close".

**Accessibility:**
- `role="dialog"`, `aria-modal="true"`, `aria-label="Photo lightbox"` (or aria-labelledby the image alt)
- Focus trap: only the close button is focusable inside; Tab cycles to itself
- Restore focus to the triggering image on close
- `<body style="overflow: hidden">` while open to prevent background scroll
- Set the X button's `aria-label="Close"` and pair it with the Esc affordance in the caption

---

## 3 · Download / copyright modal

**Behavior:** "Download Photo" button → modal opens. Same dark overlay as the lightbox, with a centered card.

**Structure of the card:**
- Eyebrow: "PERMISSION TO USE" (sans, 11 px, uppercase, `--ink-faint`)
- H2: "Before you download" (serif 22 px / 600)
- Two short paragraphs of permission copy:
  > "All photographs on HolyLandPhotos.org are the property of Dr. Carl Rasmussen and are provided **free for non-commercial use** — sermons, lessons, slides, personal study, and academic work."
  >
  > "Please credit *HolyLandPhotos.org* when you use a photograph. For commercial licensing or print reproduction, please [read our permission policy](/pages/permission-to-use)."
- Hairline divider, then action row
- Action row: **Cancel** (outlined secondary, left) + **I agree — Download** (dark fill primary, right, with download icon)

**Card styles** (`.pln-modal`, `.pln-btn-primary`, `.pln-btn-secondary`): max-width 480 px, 92% on mobile. 1 px ink border, no shadow. Padding 32×36.

**Behavior:**
- "I agree — Download" triggers the actual file download and closes the modal. Set a cookie (`hlp-permission-acknowledged=1`, 30 days) so repeat users don't see the modal every time. The first download per session always shows it.
- "Cancel" or any of the same dismiss patterns from the lightbox (Esc, overlay click, X button in the corner of the overlay, not the modal) closes without downloading.
- Trap focus inside the modal. Initial focus on **Cancel** (the safer choice), not the primary — keeps an accidental Enter press from auto-downloading.

**Tweakable copy:** The two paragraphs above are my draft. Adjust to whatever Dr. Rasmussen prefers; the layout has room for ~80 words total without breaking.

---

## 4 · AI Search · full page (`/ai-search`)

**Layout:** Same chrome as every other page (nav, breadcrumb, footer). Body:

```
Breadcrumb: Home › AI Search
┌────────────────────────────────────────────────────────┐
│ AI Search                                              │ ← h1
│ Ask plain-English questions about biblical sites…      │
│                                                        │
│ ┌──────────────────────────────────────────────────┐   │
│ │ About these answers. Powered by Claude AI…       │   │ ← disclaimer block
│ └──────────────────────────────────────────────────┘   │
├────────────────────────────────────────────────┬───────┤
│ ┌──────────────────────────────────────────┐   │       │
│ │ [ Ask a follow-up…                ] Ask  │   │ Recent│
│ ├──────────────────────────────────────────┤   │ ques. │
│ │                                          │   │       │
│ │  [User bubble]                           │   │ Try   │
│ │                                          │   │ asking│
│ │  HOLY LAND PHOTOS · AI                   │   │       │
│ │  Markdown response with [links] & lists  │   │       │
│ │  — answered in 1.4s                      │   │       │
│ │                                          │   │       │
│ └──────────────────────────────────────────┘   │       │
└────────────────────────────────────────────────┴───────┘
```

**Grid:** `1fr 240px`, gap 48 px, side rail is sticky (`top: 24px`). On mobile, the side rail moves below the thread.

**Reuse from existing CSS:** `.pln-ai-input`, `.pln-ai-thread` (rename to `.pln-aip-thread` here — min-height 360 px, max-height 640 px), `.pln-ai-msg-*`, `.pln-ai-user-bubble`, `.pln-ai-assistant-tag`, `.pln-ai-md`, `.pln-ai-foot`, `.pln-ai-loading`.

**New styles** in `R2_CSS`:
- `.pln-aip-hero` — H1 + intro + disclaimer block.
- `.pln-aip-disclaimer` — left-rule callout reusing the `.pln-hint` pattern.
- `.pln-aip-main` — the 2-column grid.
- `.pln-aip-thread-wrap` — the bordered chat container.
- `.pln-aip-side` — the right rail.

**Side rail contents:**
1. **Recent questions** — last ~6 questions from this user's history (URL slug or `localStorage`). Each item: the question as a clickable link to that conversation; the duration in `--ink-faint` underneath. Hairline dotted divider between.
2. **Try asking** — 4 evergreen prompts as the same link style. Clicking submits the query.

**Empty state:** Replace the thread with the same `.pln-ai-chips` + "Try asking" chip cluster from the homepage section. Once a message exists, switch to the thread layout.

**100-search soft-limit message:** Render at the top of the thread as a `.pln-aip-disclaimer` block: "You've asked over 100 questions — thank you for using AI Search! It costs us a little for each request. If you find it useful, consider [supporting the archive](/pages/feedback)." Doesn't block further queries.

**URL state:** Each conversation gets a `?c=<id>` query param so users can bookmark and share. Click a recent question → loads the conversation into the thread.

---

## 5 · Newsletter form — my answers to your review questions

The Round 2 brief asked me to settle four decisions:

| Question | My answer |
|---|---|
| Should all inputs match the search box exactly (dark border)? | **No.** Email should match the search box (1 px ink border, 18 px serif) because it's the required, high-stakes field. Name fields should use the lighter `--line-strong` border to visually de-emphasize them as optional. This is intentional hierarchy, not inconsistency. |
| Should optional fields be marked? | **Yes — with words, not asterisks.** I added "— optional" in `--ink-faint` next to the label. Asterisks are scannable but ambiguous (is it required or marked-required?). The audience reads carefully; words are better. |
| Is `.pln-hint` the right success treatment? | **Close, but not quite.** I built a dedicated `.pln-nl-success` style — same alt-background as the hint, but no left rule, and with an H3 + paragraph instead of the inline `<strong>` pattern. The success state is a *replacement* of the form, not a sibling callout; it deserves its own treatment. |
| Should error get a different treatment from red text? | **Yes — pair it with field-level state.** Add a `.pln-nl-input--error` modifier that tints the field border with `--accent` (the burnt-brown) and adds a soft `#fdf6f3` background tint. Below the field: red text *with* an inline alert icon, so it's identifiable by more than color (accessibility). The text alone is too easy to miss for older users. |

**Full form spec** is now in `source/round2.jsx`. All four states (idle / loading / error / success) are shown as artboards on the canvas:

- `r2-nl-idle` — fresh form
- `r2-nl-error` — invalid email submitted, error visible
- `r2-nl-success` — after submit, replaces the form entirely
- (Loading isn't a separate artboard — the submit button just goes to `Subscribing…` and disables for a beat. See the disabled `:disabled` style on `.pln-nl-submit`.)

**Other newsletter notes:**
- The submit row has a hairline top border separating it from the fields and includes a privacy reassurance line ("We never share your address…") next to the button.
- Required marker: small `var(--accent)` asterisk next to "Email address". This is fine because it's the *only* required field — the question is unambiguous.
- Field labels are sans 13 px / 600 — clearly distinct from the body. Don't use serif for labels.

---

## 6 · Print stylesheet — review

Pull up the **Print preview · photo page** artboard in the canvas to see the layout I'm proposing. It's a faithful render of how a single page prints with my rules.

**My revisions to the existing `@media print` block:**

```css
@media print {
  /* Hide chrome */
  .pln-nav, .pln-footer, .pln-crumbs, .pln-pnav, .pln-pnav-up,
  .pln-ai-section, .pln-aip-side, .pln-aip-input-wrap,
  .pln-download, .pln-kw, .pln-overlay,
  .pln-side, .pln-hint {
    display: none !important;
  }

  body {
    background: #fff;
    color: #000;
    font-family: Georgia, serif;
    font-size: 12pt;
    line-height: 1.4;
  }

  /* Page layout */
  .pln-main { max-width: none; padding: 0; }

  /* Photo page — collapse 2-col to 1, photo above text */
  .pln-photopage {
    display: block;
  }
  .pln-photo-main img {
    width: 100%; height: auto;
    border: none;
    page-break-inside: avoid;
    margin-bottom: 12pt;
  }

  /* H1 sized for print */
  .pln-h1 { font-size: 22pt; margin: 0 0 4pt; line-height: 1.15; }

  /* Body paragraphs */
  .pln-p, .pln-lead { font-size: 12pt; margin: 0 0 10pt; max-width: 100%; }

  /* Underline links subtly */
  a { color: #000 !important; text-decoration: none; border-bottom: 1px solid #999; }

  /* Source attribution — inject at the bottom of every photo and section page */
  .pln-photo-side::after,
  .pln-doc main::after {
    content: "Source: holylandphotos.org" attr(data-print-path) " · © Carl Rasmussen";
    display: block;
    border-top: 1px solid #999;
    padding-top: 8pt;
    margin-top: 24pt;
    font-size: 9.5pt;
    color: #444;
  }

  /* Section pages: HIDE the photo grid when printing. Scholars who want
     a specific photo will print that photo's page. */
  .pln-section-body .pln-grid,
  .pln-section-body > .pln-h2 + * { /* the "Photos (n)" h2 and grid */
    display: none;
  }
}
```

**Specific answers to your review questions:**

| Question | My take |
|---|---|
| Source attribution at the bottom? | **Yes — add it.** Use a `::after` pseudo-element on the photo-page right column that reads `attr(data-print-path)` from a hidden attribute on `<main>`. Server-renders into the URL path. The print preview artboard shows the format. |
| Does the two-column layout collapse properly? | **It needs the override above** — I'm forcing `display: block` on `.pln-photopage` and `.pln-grid` so the photo and text stack cleanly. Without this, the right column would land below the photo column anyway, but with a column gap that looks like a typo. |
| Should the section page photo grid print? | **No — hide it.** Printing a 5-column grid of thumbnails is wasteful and ugly. A scholar who wants a specific photo will go to its photo page and print *that*. Section pages should print the breadcrumb, title, body — the *narrative* part. |
| Minimum 12 pt body text? | **Set.** The CSS above pegs body to 12 pt and H1 to 22 pt. Captions and footer text go to 9.5 pt — fine for non-narrative meta. |

**To test:** Open any photo page in Chrome, hit `Cmd-P`, switch to "Save as PDF" so you don't waste paper. You should see one neat page with the photo, title, description, and a source line at the bottom. Hyperlinks underlined in gray, no nav chrome, no related-photos grid.

---

## What's still not designed

Items the Round 2 brief didn't include, in case they come up later:

- **Site list (`/site-list`)** — the 730-section hierarchy. Recommend a left-aligned outline with disclosure triangles, sans typography, dense.
- **Keyword pages** — should reuse the search results layout.
- **News index + detail** — index = card list with thumbnail/title/date; detail = section-page chrome with optional YouTube embed.
- **Recent additions** — placeholder per brief.

Holler when one of these becomes urgent.
