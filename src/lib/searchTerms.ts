import type { Where } from 'payload'

/**
 * Shared term handling for the standard search page and the AI search
 * tools, so both match the same way: split the query into words, drop
 * function words, and match each remaining word as a whole word in its
 * singular or plural form. Word order never matters.
 *
 * Kept deliberately light. Only regular English plurals (-s, -es, -ies)
 * are handled; "children" will not find "child".
 */

// Function words dropped from a query before matching. Short and
// English-only; the dataset's titles/keywords are proper nouns and terms,
// none of which are on this list. "photo(s)"/"picture(s)" are here because
// Carl keyworded many sections with "Photos, Images, Pictures", so they are
// noise rather than signal.
export const STOP_WORDS = new Set([
  'a', 'an', 'and', 'the', 'of', 'in', 'on', 'at', 'to', 'for', 'from', 'with',
  'by', 'near', 'is', 'are', 'was', 'were', 'or', 'photos', 'photo', 'pictures', 'picture',
])

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Split a query into search terms, dropping stop words. If the query is
 *  nothing but stop words, the raw words are returned so it still searches
 *  for something. */
export function parseTerms(query: string): string[] {
  const raw = query.split(/\s+/).filter(Boolean)
  const meaningful = raw.filter((t) => !STOP_WORDS.has(t.toLowerCase()))
  return meaningful.length > 0 ? meaningful : raw
}

/** Candidate singular stems for a term: "synagogues" -> synagogue;
 *  "churches" -> church; "cities" -> city. The term itself is always
 *  included. Used for the loose DB pre-filter; termRegex() does the real
 *  match. */
export function stemsFor(term: string): string[] {
  const t = term.toLowerCase()
  const out = new Set([t])
  if (t.length > 4 && t.endsWith('ies')) out.add(t.slice(0, -3) + 'y')
  if (t.length > 3 && t.endsWith('es')) out.add(t.slice(0, -2))
  if (t.length > 2 && t.endsWith('s') && !t.endsWith('ss')) out.add(t.slice(0, -1))
  return [...out]
}

/** Whole-word, case-insensitive regex accepting the term in singular or
 *  plural form, both directions: "synagogue" matches "Synagogues" and
 *  "synagogues" matches "Synagogue"; "city"/"cities" match each other.
 *  Word boundaries are kept so "Athen" does not match "Athenian". */
export function termRegex(term: string): RegExp {
  const alts = stemsFor(term).flatMap((st) => {
    const e = escapeRegex(st)
    const forms = [`${e}(?:s|es)?`]
    if (st.endsWith('y')) forms.push(`${escapeRegex(st.slice(0, -1))}ies`)
    return forms
  })
  return new RegExp(`\\b(?:${alts.join('|')})\\b`, 'i')
}

/** Payload `where` clause requiring that, for every term, at least one of
 *  `fields` contains at least one of the term's stems. Substring match is
 *  deliberately loose; callers that need whole-word precision post-filter
 *  with allTermsMatch(). */
export function termsWhere(terms: string[], fields: string[]): Where[] {
  return terms.map((term) => ({
    or: fields.flatMap((f) => stemsFor(term).map((st): Where => ({ [f]: { contains: st } }))),
  }))
}

/** True when every term matches (whole word, singular/plural) in at least
 *  one of the given texts. */
export function allTermsMatch(terms: string[], texts: Array<string | null | undefined>): boolean {
  return terms.map(termRegex).every((re) => texts.some((t) => !!t && re.test(t)))
}
