// Image IDs to hide from "Recent Additions" listings.
//
// Use case: a photo gets uploaded as a section's primary/cover image and
// isn't meant to surface on its own in the recent-uploads feed. Add the
// imageId here. If this list ever gets longer than ~10, consider moving
// it to a `excludeFromRecent` boolean on the Photo collection instead.
export const EXCLUDE_FROM_RECENT_IMAGE_IDS: readonly string[] = [
  'AtlasCover01',
]
