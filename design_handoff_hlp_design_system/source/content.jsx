// Real content sampled from hlp.everyphere.com — to make the mockups concrete.
// Image URLs hot-linked from the S3 bucket.

const S3 = "https://hlp-dev-photos-335804564725-us-east-2-an.s3.us-east-2.amazonaws.com";
const img = (id) => `${S3}/${id}.jpg`;
const sectionImg = (name) => `${S3}/section/${name}.jpg`;

// Haran section — real content
const HARAN = {
  slug: "haran",
  title: "Haran",
  type: "site",
  breadcrumb: [
    { label: "Home", href: "/" },
    { label: "Browse by Countries", href: "/browse/browse-by-countries" },
    { label: "Turkey", href: "/browse/turkey" },
    { label: "Eastern Turkey", href: "/browse/eastern-turkey" },
    { label: "Haran" },
  ],
  hero: img("TEETHN06"),
  heroAlt: "Haran — site and vicinity, looking across the plain",
  body: [
    'Haran (also Harran) is located 28 mi. [45 km.] south-southeast of Sanliurfa in an open plain area. The name means "cross roads." It was located on the route that led from Nineveh in the east to the ford on the Euphrates River at Carchemish 55 mi. [90 km.] to the west.',
    "It is mentioned 11 times in the Old Testament. Abram settled here for a period of time on his way from Ur to the Land of Canaan (Genesis 11 and 12). Isaac's wife Rebecca was from the area. Jacob lived here with Laban for 20 years after fleeing from his brother Esau (Genesis 29). Here he married Leah and Rachel, and all of his children, except Benjamin, were born here!",
    "The city is mentioned in cuneiform texts as far back as 2000 B.C. It was a center of the worship of the moon god Sin — who was also worshiped at Ur. It appears frequently in cuneiform documents and was the last capital of the Assyrian Empire until being captured in 609 B.C. by the Babylonians. In 53 B.C. Crassus, a prominent Roman, was killed here and his troops annihilated. In A.D. 217 the Roman emperor Caracalla was murdered here.",
    "Today about 7000 people live in the village and vicinity.",
  ],
  photos: [
    { id: "TEETHN08", title: "Mud Brick Buildings" },
    { id: "TEETHN02", title: "Beehive Houses 1" },
    { id: "TEETHN04", title: "Beehive Houses 2" },
    { id: "TEETHN09", title: "Village of Harran" },
    { id: "TEETHN10", title: "Countryside" },
    { id: "TEETHN15", title: "Plain to the South" },
    { id: "TEETHN07", title: "Grand Mosque 1" },
    { id: "TEETHN16", title: "Grand Mosque 2" },
    { id: "TEETHN17", title: "Grand Mosque 3" },
    { id: "TEETHN30", title: "Grand Mosque Detail" },
    { id: "TEETHN20", title: "Aleppo Gate" },
    { id: "TEETHN21", title: "City Wall" },
    { id: "TEETHN19", title: "Castle" },
    { id: "TEETHN18", title: "Excavations" },
    { id: "TEETHN31", title: "Dung Patties" },
    { id: "TEETHN32", title: "House Cleaning" },
    { id: "TEETHN22", title: "Water Canal" },
  ],
  keywords: [
    "Haran","Harran","Turkey","Abraham","Isaac","Jacob","Edessa",
    "Photographs","Pictures","Images","PowerPoint",
  ],
};

// Photo page — Tomb and Courtyard 2 (medium description)
const PHOTO_MIDRAS = {
  id: "ICSHMD10",
  title: "Tomb and Courtyard 2",
  parent: { label: "Midras (Rolling Stone Tomb)", href: "/browse/midras-rolling-stone-tomb" },
  index: 2,
  total: 8,
  prev: "ICSHMD01",
  next: "ICSHMD20",
  image: img("ICSHMD10"),
  description: [
    {
      type: "p",
      runs: [
        "View looking east from above. The outer courtyard of the tomb is visible in the lower center of the picture. It is an area 12 × 12 ft. [3.7 × 3.7 m.] carved into the soft solid rock, lined with hewn stones, which were then plastered and painted. At the east end of the courtyard the entrance to the tomb is visible.",
      ],
    },
    {
      type: "p",
      runs: [
        "For a detail of the entrance and the rolling stone ",
        { link: "Click Here", href: "/photos/ICSHMD20" },
        ".",
      ],
    },
    {
      type: "p",
      runs: [
        "For a map and descriptive commentary about the site ",
        { link: "Click Here", href: "/photos/go.asp?SiteID=65" },
        ".",
      ],
    },
  ],
  foundIn: [
    { label: "Midras (Rolling Stone Tomb)", href: "/browse/midras-rolling-stone-tomb" },
  ],
  keywords: [
    "Midras","Khirbet","Horvat","Israel","Central","Shephelah",
    "Khirbet Durusiya","Amos Kloner","Rolling Stone Tomb","Jesus","ICSHMD10",
  ],
};

// Homepage data
const HOME = {
  hero: {
    title: "Holy Week and Easter — Click on Image for More Photos",
    image: img("ICSHMD20"),
    caption: "Rolling Stone Tomb — Khirbet Midras",
    index: 1,
    total: 9,
    body: [
      { type: "p", runs: [
        "The following \u201Csites\u201D are related to the Last Week of Jesus' earthly ministry and his crucifixion and resurrection.",
      ]},
      { type: "p", runs: [
        "Don't miss what WAS ",
        { bold: "the best-preserved" },
        " \u201C",
        { link: "Rolling Stone Tomb", href: "/photos/ICSHMD20" },
        "\u201D in Israel — until it was destroyed.",
      ]},
      { type: "p", runs: [
        { link: "Gordon's Calvary", href: "/photos/IJNTGT02" },
        " and ",
        { link: "Garden Tomb", href: "/browse/garden-tomb-gordons-calvary" },
        " — alternative (Protestant) site of crucifixion and burial/resurrection of Jesus.",
      ]},
      { type: "p", runs: [
        { link: "Church of the Holy Sepulcher", href: "/browse/church-of-holy-sepulcher-12-folders" },
        " — probable site of crucifixion and burial/resurrection of Jesus.",
      ]},
    ],
  },
  sotw: {
    title: "Haran",
    image: img("TEETHN02"),
    href: "/browse/haran",
    body: 'Haran (also Harran) is located in southern Turkey 28 mi. [45 km.] south-southeast of Sanliurfa — about 56 mi. [90 km.] east of the Euphrates River. It is mentioned 11 times in the Old Testament [Hebrew Bible]. Abram settled here for a period of time on his way from Ur to the Land of Canaan (Genesis 11 and 12).',
  },
  browse: [
    { label: "Atlas Images", href: "/browse/atlas-images" },
    { label: "Browse by Countries", href: "/browse/browse-by-countries" },
    { label: "Daily Life and Artifacts", href: "/browse/daily-life-and-artifacts" },
    { label: "Museums of the World", href: "/browse/museums-of-the-world" },
    { label: "People", href: "/browse/people" },
    { label: "Complete Site List", href: "/site-list" },
    { label: "Search", href: "/search" },
  ],
  pages: [
    { label: "Tour — Turkey and Greece — April/May 2026", href: "/pages/tour-turkey-and-greece-aprilmay-2026" },
    { label: "Recent Additions", href: "/pages/recent-additions" },
    { label: "Permission to Use", href: "/pages/permission-to-use" },
    { label: "How to Use this Site", href: "/pages/how-to-use-this-site" },
    { label: "Topical Easy Find", href: "/pages/topical-easy-find" },
    { label: "About this Site", href: "/pages/about-this-site" },
    { label: "Recommended Reading", href: "/pages/recommended-reading" },
  ],
};

// Search results — for query "haran"
const SEARCH = {
  query: "haran",
  duration: "0.28s",
  total: 23,
  sections: [
    { type: "site", title: "Haran", path: "Turkey › Eastern Turkey", href: "/browse/haran" },
    { type: "region", title: "Eastern Turkey", path: "Turkey", href: "/browse/eastern-turkey", count: 14 },
    { type: "site", title: "Sanliurfa (Urfa)", path: "Turkey › Eastern Turkey", href: "/browse/sanliurfa" },
    { type: "site", title: "Göbekli Tepe", path: "Turkey › Eastern Turkey", href: "/browse/gobekli-tepe" },
  ],
  photos: [
    { id: "TEETHN02", title: "Beehive Houses 1", section: "Haran" },
    { id: "TEETHN08", title: "Mud Brick Buildings", section: "Haran" },
    { id: "TEETHN07", title: "Grand Mosque 1", section: "Haran" },
    { id: "TEETHN09", title: "Village of Harran", section: "Haran" },
    { id: "TEETHN20", title: "Aleppo Gate", section: "Haran" },
    { id: "TEETHN21", title: "City Wall", section: "Haran" },
    { id: "TEETHN19", title: "Castle", section: "Haran" },
    { id: "TEETHN30", title: "Grand Mosque Detail", section: "Haran" },
  ],
};

// Left-rail sidebar tree (Turkey area, for the section page sidebar variant)
const TURKEY_TREE = {
  current: "haran",
  items: [
    { label: "Western Turkey", children: [
      { label: "Aphrodisias" }, { label: "Assos" }, { label: "Ephesus" },
      { label: "Hierapolis" }, { label: "Laodicea" }, { label: "Miletus" },
      { label: "Pergamum" }, { label: "Sardis" }, { label: "Smyrna" },
      { label: "Troy" },
    ]},
    { label: "Central Turkey", children: [
      { label: "Antioch in Pisidia" }, { label: "Cappadocia" }, { label: "Iconium" },
      { label: "Lystra" },
    ]},
    { label: "Eastern Turkey", current: true, children: [
      { label: "Carchemish" },
      { label: "Göbekli Tepe" },
      { label: "Haran", current: true },
      { label: "Mt. Nemrut" },
      { label: "Nineveh (Mosul)" },
      { label: "Sanliurfa" },
    ]},
    { label: "Southern Turkey", children: [
      { label: "Antioch on the Orontes" }, { label: "Perga" }, { label: "Seleucia Pieria" },
      { label: "Tarsus" },
    ]},
  ],
};

window.HLP_CONTENT = { S3, img, sectionImg, HARAN, PHOTO_MIDRAS, HOME, SEARCH, TURKEY_TREE };
