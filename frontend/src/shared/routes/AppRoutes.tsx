import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AuthLayout } from '@/shared/layouts/AuthLayout'
import { AppLayout } from '@/shared/layouts/AppLayout'
import { Loader } from '@/shared/components/ui'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'
import { paths } from './paths'
import { LandingPage } from '@/modules/landing/pages/LandingPage'
import { LoginPage } from '@/modules/auth/pages/LoginPage'
import { RegisterPage } from '@/modules/auth/pages/RegisterPage'
import { VerifyEmailPage } from '@/modules/auth/pages/VerifyEmailPage'
import { DashboardPage } from '@/modules/dashboard/pages/DashboardPage'
import { MyProfilePage } from '@/modules/profile/pages/MyProfilePage'
import { EditProfilePage } from '@/modules/profile/pages/EditProfilePage'
import { PublicProfilePage } from '@/modules/profile/pages/PublicProfilePage'
import { NotFoundPage } from '@/shared/pages/NotFoundPage'

// Marketplace — lazy-loaded
const MarketplacePage = lazy(() =>
  import('@/modules/marketplace/pages/MarketplacePage').then((m) => ({ default: m.MarketplacePage })),
)
const ListingDetailPage = lazy(() =>
  import('@/modules/marketplace/pages/ListingDetailPage').then((m) => ({ default: m.ListingDetailPage })),
)
const CreateListingPage = lazy(() =>
  import('@/modules/marketplace/pages/CreateListingPage').then((m) => ({ default: m.CreateListingPage })),
)
const EditListingPage = lazy(() =>
  import('@/modules/marketplace/pages/EditListingPage').then((m) => ({ default: m.EditListingPage })),
)
const MyListingsPage = lazy(() =>
  import('@/modules/marketplace/pages/MyListingsPage').then((m) => ({ default: m.MyListingsPage })),
)
const SavedListingsPage = lazy(() =>
  import('@/modules/marketplace/pages/SavedListingsPage').then((m) => ({ default: m.SavedListingsPage })),
)

// Bulldog Exchange — lazy-loaded
const BulldogExchangePage = lazy(() =>
  import('@/modules/bulldog-exchange/pages/BulldogExchangePage').then((m) => ({ default: m.BulldogExchangePage })),
)
const ProductDetailPage = lazy(() =>
  import('@/modules/bulldog-exchange/pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })),
)
const MyReservationsPage = lazy(() =>
  import('@/modules/bulldog-exchange/pages/MyReservationsPage').then((m) => ({ default: m.MyReservationsPage })),
)
const CreateProductPage = lazy(() =>
  import('@/modules/bulldog-exchange/pages/CreateProductPage').then((m) => ({ default: m.CreateProductPage })),
)

// Notifications — lazy-loaded
const NotificationsPage = lazy(() =>
  import('@/modules/notifications/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })),
)

// Lost & Found — lazy-loaded
const LostFoundPage = lazy(() =>
  import('@/modules/lost-found/pages/LostFoundPage').then((m) => ({ default: m.LostFoundPage })),
)

// Settings — lazy-loaded
const SettingsPage = lazy(() =>
  import('@/modules/settings/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)

// Chibi — lazy-loaded
const ChibiPage = lazy(() =>
  import('@/modules/chibi/pages/ChibiPage').then((m) => ({ default: m.ChibiPage })),
)

// Admin — lazy-loaded
const AdminPage = lazy(() =>
  import('@/modules/admin/pages/AdminPage').then((m) => ({ default: m.AdminPage })),
)

// Campus Events — lazy-loaded
const EventsPage = lazy(() =>
  import('@/modules/events/pages/EventsPage').then((m) => ({ default: m.EventsPage })),
)
const EventDetailPage = lazy(() =>
  import('@/modules/events/pages/EventDetailPage').then((m) => ({ default: m.EventDetailPage })),
)
const CreateEventPage = lazy(() =>
  import('@/modules/events/pages/CreateEventPage').then((m) => ({ default: m.CreateEventPage })),
)
const EditEventPage = lazy(() =>
  import('@/modules/events/pages/EditEventPage').then((m) => ({ default: m.EditEventPage })),
)
const MyRsvpsPage = lazy(() =>
  import('@/modules/events/pages/MyRsvpsPage').then((m) => ({ default: m.MyRsvpsPage })),
)

// Static info pages — lazy-loaded
const InspirePage = lazy(() =>
  import('@/modules/inspire/pages/InspirePage').then((m) => ({ default: m.InspirePage })),
)
const NuisPage = lazy(() =>
  import('@/modules/nuis/pages/NuisPage').then((m) => ({ default: m.NuisPage })),
)

export function AppRoutes() {
  return (
    <Routes>
      {/* Landing page — shows to unauthenticated, redirects authenticated → /home */}
      <Route
        path={paths.landing}
        element={<PublicOnlyRoute redirectTo={paths.dashboard}><LandingPage /></PublicOnlyRoute>}
      />

      {/* Auth pages */}
      <Route element={<AuthLayout />}>
        <Route path={paths.verifyEmail} element={<VerifyEmailPage />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path={paths.login} element={<LoginPage />} />
          <Route path={paths.register} element={<RegisterPage />} />
        </Route>
      </Route>

      {/* Authenticated app */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path={paths.dashboard} element={<DashboardPage />} />
          <Route path={paths.profile} element={<MyProfilePage />} />
          <Route path={paths.editProfile} element={<EditProfilePage />} />
          <Route path={paths.userProfile} element={<PublicProfilePage />} />

          <Route
            path={paths.marketplace}
            element={<Suspense fallback={<Loader label="Loading…" />}><MarketplacePage /></Suspense>}
          />
          <Route
            path={paths.marketplaceNew}
            element={<Suspense fallback={<Loader label="Loading…" />}><CreateListingPage /></Suspense>}
          />
          <Route
            path={paths.myListings}
            element={<Suspense fallback={<Loader label="Loading…" />}><MyListingsPage /></Suspense>}
          />
          <Route
            path={paths.savedListings}
            element={<Suspense fallback={<Loader label="Loading…" />}><SavedListingsPage /></Suspense>}
          />
          <Route
            path={paths.marketplaceEdit}
            element={<Suspense fallback={<Loader label="Loading…" />}><EditListingPage /></Suspense>}
          />
          <Route
            path={paths.marketplaceListing}
            element={<Suspense fallback={<Loader label="Loading…" />}><ListingDetailPage /></Suspense>}
          />

          {/* Bulldog Exchange */}
          <Route
            path={paths.exchange}
            element={<Suspense fallback={<Loader label="Loading…" />}><BulldogExchangePage /></Suspense>}
          />
          <Route
            path={paths.exchangeNew}
            element={<Suspense fallback={<Loader label="Loading…" />}><CreateProductPage /></Suspense>}
          />
          <Route
            path={paths.myReservations}
            element={<Suspense fallback={<Loader label="Loading…" />}><MyReservationsPage /></Suspense>}
          />
          <Route
            path={paths.exchangeProduct}
            element={<Suspense fallback={<Loader label="Loading…" />}><ProductDetailPage /></Suspense>}
          />

          {/* Notifications */}
          <Route
            path={paths.notifications}
            element={<Suspense fallback={<Loader label="Loading…" />}><NotificationsPage /></Suspense>}
          />

          {/* Lost & Found */}
          <Route
            path={paths.lostFound}
            element={<Suspense fallback={<Loader label="Loading…" />}><LostFoundPage /></Suspense>}
          />

          {/* Settings */}
          <Route
            path={paths.settings}
            element={<Suspense fallback={<Loader label="Loading…" />}><SettingsPage /></Suspense>}
          />

          {/* Chibi */}
          <Route
            path={paths.chibi}
            element={<Suspense fallback={<Loader label="Loading…" />}><ChibiPage /></Suspense>}
          />

          {/* Admin */}
          <Route
            path={paths.admin}
            element={<Suspense fallback={<Loader label="Loading…" />}><AdminPage /></Suspense>}
          />

          {/* Campus Events */}
          <Route
            path={paths.events}
            element={<Suspense fallback={<Loader label="Loading…" />}><EventsPage /></Suspense>}
          />
          <Route
            path={paths.eventsNew}
            element={<Suspense fallback={<Loader label="Loading…" />}><CreateEventPage /></Suspense>}
          />
          <Route
            path={paths.myRsvps}
            element={<Suspense fallback={<Loader label="Loading…" />}><MyRsvpsPage /></Suspense>}
          />
          <Route
            path={paths.eventEdit}
            element={<Suspense fallback={<Loader label="Loading…" />}><EditEventPage /></Suspense>}
          />
          <Route
            path={paths.eventDetail}
            element={<Suspense fallback={<Loader label="Loading…" />}><EventDetailPage /></Suspense>}
          />

          {/* Static info pages */}
          <Route
            path={paths.inspire}
            element={<Suspense fallback={<Loader label="Loading…" />}><InspirePage /></Suspense>}
          />
          <Route
            path={paths.nuis}
            element={<Suspense fallback={<Loader label="Loading…" />}><NuisPage /></Suspense>}
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
