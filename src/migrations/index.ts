import * as migration_20260329_add_sections_photos from './20260329_add_sections_photos';
import * as migration_20260519_012240_add_published_to_photos_and_sections from './20260519_012240_add_published_to_photos_and_sections';

export const migrations = [
  {
    up: migration_20260329_add_sections_photos.up,
    down: migration_20260329_add_sections_photos.down,
    name: '20260329_add_sections_photos',
  },
  {
    up: migration_20260519_012240_add_published_to_photos_and_sections.up,
    down: migration_20260519_012240_add_published_to_photos_and_sections.down,
    name: '20260519_012240_add_published_to_photos_and_sections'
  },
];
