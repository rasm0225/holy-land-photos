# Design Round 2 — Remaining Items

## Context

The design system from Round 1 has been implemented across all pages. The tokens, typography, nav, footer, and component styles are live at https://hlp.everyphere.com. This round covers the items that were called out as "not yet designed" in the original handoff, plus a few things that came up during implementation.

The existing design CSS is at `src/app/styles/design.css`. All tokens are in `:root`. The developer will add new styles to the same file.

---

## 1. Mobile Hamburger Menu

**Current state:** Mobile nav shows the brand name and a search icon. There is no way to reach About, Permission to Use, AI Search, or News from mobile.

**What's needed:** A hamburger drawer/menu that opens from the left or top when the ☰ icon is tapped. Should contain:
- Search
- AI Search
- About
- Permission to Use
- News
- Newsletter

Design considerations:
- 44×44px minimum hit targets (older users)
- Full-width overlay or slide-in panel
- Close on tap outside, X button, or Escape
- The handoff README said "match iOS/Android system sheet patterns"

---

## 2. Lightbox Overlay

**Current state:** Functional but unstyled — white background overlay with the image. Works (click photo to open, click/Escape to close) but looks rough.

**What's needed:** Fullscreen dark overlay with:
- Image centered, `object-fit: contain`, max 95vw × 95vh
- Close button (X) in top-right corner
- Dark semi-transparent background (the handoff suggested `rgba(0,0,0,0.9)`)
- Focus trap while open
- Accessible: `role="dialog"`, `aria-modal="true"`, keyboard dismissible

The lightbox is used on:
- Photo pages (click the main photo)
- Browse/section pages (click the lead image)

No prev/next navigation inside the lightbox for now — user closes and uses the page-level prev/next.

---

## 3. Download / Copyright Modal

**Current state:** Functional but unstyled. A modal with copyright text, "I Agree — Download" button, and "Cancel" button. Uses inline styles.

**What's needed:** Modal overlay matching the lightbox treatment:
- Centered card on dark overlay
- Brief copyright text (2 short paragraphs)
- Primary button: "I Agree — Download" (should match the `.pln-download` button style — dark fill, white text on hover)
- Secondary button: "Cancel" (outlined)
- Close on Escape, click outside, or Cancel
- Max-width ~480px

---

## 4. AI Search Chat Interface (Full Page)

**Current state:** The `/ai-search` page has a functional chat interface with inline styles. The homepage has a designed "Ask the Archive" embed from Round 1, but the full page doesn't match it.

**What's needed:** Apply the AI chat styles from the Round 1 design system to the full `/ai-search` page:
- Use `.pln-ai-panel`, `.pln-ai-input`, `.pln-ai-thread`, `.pln-ai-msg-user`, `.pln-ai-user-bubble`, `.pln-ai-md` classes
- User messages: right-aligned blue-tinted bubbles (`#eaf0f9`, border `#c8d6ea`)
- Assistant messages: full-width with "Holy Land Photos · AI" eyebrow tag
- Markdown rendering in assistant messages (headers, bold, links, lists)
- "Searching the archive..." loading state with pulsing dot
- Duration shown after each response (e.g., "— answered in 1.4s")
- Suggested question chips when the thread is empty

The CSS for all of this already exists in `design.css` (`.pln-ai-*` classes) — it just needs to be wired into the React component at `src/app/(frontend)/ai-search/AISearchChat.tsx`.

---

## 5. Newsletter Form

**Current state:** Styled with design system breadcrumbs and typography, but the form inputs still use some inline styles. The email input uses serif font matching the search box, which looks good. Name inputs use a lighter border.

**What's needed:** Mostly done — just review for consistency:
- Should the form inputs match the search box exactly (`.pln-searchbox` style with dark border)?
- Or is the current lighter treatment for name fields appropriate since they're optional?
- Success state uses `.pln-hint` card — is that the right treatment?
- Error state is red text below the field — should it have a different treatment?

---

## 6. Print Stylesheet Review

**Current state:** Basic print stylesheet exists in `design.css` (`@media print` block). Hides nav, footer, breadcrumbs, download button, keywords, AI section. Prints photo at full width with title and description.

**What's needed:** Review and refine:
- Add a source attribution line at the bottom: `Source: holylandphotos.org/photos/<id> · © Carl Rasmussen`
- Test with a real print preview — does the two-column layout collapse properly?
- Section pages: should the photo grid print or be hidden?
- Ensure minimum 12pt body text for readability

---

## Reference

- **Live site:** https://hlp.everyphere.com
- **Design CSS:** `src/app/styles/design.css`
- **Round 1 handoff:** `design_handoff_hlp_design_system/README.md`
- **Round 1 prototypes:** `design_handoff_hlp_design_system/source/` (run with `python3 -m http.server 8080` and open `screens.html`)

### Good test pages
- Homepage: https://hlp.everyphere.com
- Section with many photos: https://hlp.everyphere.com/browse/haran
- Photo with long description: https://hlp.everyphere.com/photos/IJNTHS82
- Photo by non-default photographer: https://hlp.everyphere.com/photos/IJOTIT22
- Search results: https://hlp.everyphere.com/search?q=haran
- AI Search: https://hlp.everyphere.com/ai-search
- Newsletter: https://hlp.everyphere.com/newsletter
