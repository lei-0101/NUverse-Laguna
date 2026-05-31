/** Centralized route paths to avoid magic strings across the app. */
export const paths = {
  landing: '/',
  login: '/login',
  register: '/register',
  verifyEmail: '/verify-email',
  dashboard: '/home',
  profile: '/profile',
  editProfile: '/profile/edit',
  /** Route pattern for another user's public profile. */
  userProfile: '/profile/:userId',
  marketplace: '/marketplace',
  marketplaceNew: '/marketplace/new',
  myListings: '/marketplace/mine',
  savedListings: '/marketplace/saved',
  /** Route pattern for a single listing's detail page. */
  marketplaceListing: '/marketplace/:listingId',
  /** Route pattern for editing a listing. */
  marketplaceEdit: '/marketplace/:listingId/edit',
  /** Bulldog Exchange — NU official merchandise. */
  exchange: '/exchange',
  exchangeNew: '/exchange/new',
  myReservations: '/exchange/reservations',
  /** Printable reservation invoice */
  reservationInvoice: '/exchange/reservations/:reservationId/invoice',
  /** Route pattern for a single product's detail page. */
  exchangeProduct: '/exchange/:productId',
  /** Route pattern for editing a product. */
  exchangeProductEdit: '/exchange/:productId/edit',
  /** In-app notifications feed. */
  notifications: '/notifications',
  /** Campus Events */
  events: '/events',
  eventsNew: '/events/new',
  myRsvps: '/events/rsvps',
  /** Route pattern for a single event's detail page. */
  eventDetail: '/events/:eventId',
  /** Route pattern for editing an event. */
  eventEdit: '/events/:eventId/edit',
  /** Lost & Found */
  lostFound: '/lost-found',
  /** Route pattern for a single lost & found item detail page. */
  lostFoundDetail: '/lost-found/:itemId',
  /** Settings */
  settings: '/settings',
  /** Bulldog Chibi */
  chibi: '/chibi',
  /** Announcements — student browse view */
  announcements: '/announcements',
  /** Announcement detail page */
  announcementDetail: '/announcements/:announcementId',
  /** Route pattern for editing an announcement */
  announcementEdit: '/announcements/:announcementId/edit',
  /** Direct Messages */
  messages: '/messages',
  /** Admin Panel */
  admin: '/admin',
  /** Inspire Sports Academy */
  inspire: '/inspire',
  /** NUIS Integration */
  nuis: '/nuis',
} as const

/** Builds the link to a specific user's public profile. */
export function userProfilePath(userId: string): string {
  return `/profile/${userId}`
}

/** Builds the link to a single listing's detail page. */
export function marketplaceListingPath(listingId: string): string {
  return `/marketplace/${listingId}`
}

/** Builds the link to a listing's edit page. */
export function marketplaceEditPath(listingId: string): string {
  return `/marketplace/${listingId}/edit`
}

/** Builds the link to a single exchange product's detail page. */
export function exchangeProductPath(productId: string): string {
  return `/exchange/${productId}`
}

/** Builds the link to a product's edit page. */
export function editExchangeProductPath(productId: string): string {
  return `/exchange/${productId}/edit`
}

/** Builds the link to a single event's detail page. */
export function eventDetailPath(eventId: string): string {
  return `/events/${eventId}`
}

/** Builds the link to an event's edit page. */
export function editEventPath(eventId: string): string {
  return `/events/${eventId}/edit`
}

/** Builds the link to a reservation's printable invoice. */
export function reservationInvoicePath(reservationId: string): string {
  return `/exchange/reservations/${reservationId}/invoice`
}

/** Builds the link to a single announcement's detail page. */
export function announcementDetailPath(announcementId: string): string {
  return `/announcements/${announcementId}`
}

/** Builds the link to an announcement's edit page. */
export function editAnnouncementPath(announcementId: string): string {
  return `/announcements/${announcementId}/edit`
}

/** Builds the link to a single lost & found item's detail page. */
export function lostFoundDetailPath(itemId: string): string {
  return `/lost-found/${itemId}`
}
