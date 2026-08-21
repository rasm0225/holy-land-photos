/**
 * Centralized naming for the conversational search feature.
 *
 * Why this file exists: the feature name appeared in ~15 places across the nav,
 * homepage, floating widget and dedicated page, and had drifted into two
 * competing names ("AI Search" and "Ask the archive"). Renaming meant hunting
 * strings across the tree. Change the label here instead.
 *
 * Deliberately NOT centralized here:
 *   - The route `/ai-search`. It's in the sitemap and has been live since
 *     May 2026. The display name is an editorial choice; the URL is an SEO
 *     commitment. They are allowed to differ, and here they do.
 *   - Anything that changes what we *disclose*. See AI_DISCLOSURE_* below.
 */

/**
 * The feature's display name. This is the one line to edit for a rename.
 */
export const AI_SEARCH_LABEL = 'Smart Search'

/**
 * Plural form, for usage copy ("you've used 12 …s this month").
 * Separate constant so a future name that doesn't pluralize with a bare "s"
 * doesn't produce garbage.
 */
export const AI_SEARCH_LABEL_PLURAL = `${AI_SEARCH_LABEL}es`

/**
 * Link text pointing at the full-page experience from the homepage embed
 * and the floating widget.
 */
export const AI_SEARCH_FULL_PAGE_LINK = `Open the full ${AI_SEARCH_LABEL} page →`

/**
 * Attribution on each assistant response. Kept explicit on purpose: a reader
 * skimming a thread should be able to tell at a glance that a given block was
 * machine-generated, independent of whatever the feature is called.
 */
export const AI_ASSISTANT_TAG = 'Holy Land Photos · AI'

/**
 * Accuracy disclosures. These are NOT branding and should not be softened to
 * match a friendlier feature name — they exist so a scholarly audience knows
 * what it is reading and who did not write it. Reword only as a deliberate
 * decision, never as a side effect of renaming the feature.
 */
export const AI_DISCLOSURE_SHORT = 'Powered by Claude AI; verify with primary sources.'

export const AI_DISCLOSURE_FULL =
  'Powered by Claude AI. Responses are based on content from ' +
  'this website but are not written by or endorsed by Dr. Carl Rasmussen.'
