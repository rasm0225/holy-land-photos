import * as addSectionsPhotos from './20260329_add_sections_photos'

export const migrations = [
  {
    up: addSectionsPhotos.up,
    down: addSectionsPhotos.down,
    name: '20260329_add_sections_photos',
  },
]
