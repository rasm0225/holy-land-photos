import * as migration_20260329_add_sections_photos from './20260329_add_sections_photos';
import * as migration_20260519_012240_add_published_to_photos_and_sections from './20260519_012240_add_published_to_photos_and_sections';
import * as migration_20260519_150309_add_section_geo from './20260519_150309_add_section_geo';
import * as migration_20260519_180000_add_section_legacy_old_id from './20260519_180000_add_section_legacy_old_id';
import * as migration_20260520_202524_add_feedback_collection from './20260520_202524_add_feedback_collection';
import * as migration_20260520_fix_keyword_statute_typo from './20260520_fix_keyword_statute_typo';

export const migrations = [
  {
    up: migration_20260329_add_sections_photos.up,
    down: migration_20260329_add_sections_photos.down,
    name: '20260329_add_sections_photos',
  },
  {
    up: migration_20260519_012240_add_published_to_photos_and_sections.up,
    down: migration_20260519_012240_add_published_to_photos_and_sections.down,
    name: '20260519_012240_add_published_to_photos_and_sections',
  },
  {
    up: migration_20260519_150309_add_section_geo.up,
    down: migration_20260519_150309_add_section_geo.down,
    name: '20260519_150309_add_section_geo',
  },
  {
    up: migration_20260519_180000_add_section_legacy_old_id.up,
    down: migration_20260519_180000_add_section_legacy_old_id.down,
    name: '20260519_180000_add_section_legacy_old_id',
  },
  {
    up: migration_20260520_202524_add_feedback_collection.up,
    down: migration_20260520_202524_add_feedback_collection.down,
    name: '20260520_202524_add_feedback_collection',
  },
  {
    up: migration_20260520_fix_keyword_statute_typo.up,
    down: migration_20260520_fix_keyword_statute_typo.down,
    name: '20260520_fix_keyword_statute_typo'
  },
];
