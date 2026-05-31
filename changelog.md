# NUverse Laguna — Changelog

---

## [0.40.0] — 2026-05-31

### Polish Sprint — Dashboard Night Mode, Exchange Variants, Loading Screen, Terms Fix, Report Dropdown, Nav Spacing

**Summary**
Seven targeted fixes and one new feature: (1) Dashboard hero background was using dark navy colors in light mode during "night" period (after 8pm), making text unreadable — fixed to use a light indigo gradient; (2) Bulldog Exchange admin now has full variant edit and delete capability; (3) All product variants expanded from size-range groups to individual sizes (XS through 6XL) via V25 migration and DevDataSeeder update; (4) SHS Traditional Uniform products moved to `MerchandiseCategory.SHS` for proper filtering; College Traditional Uniform products added; (5) Invoice print/PDF fixed with proper `html, body` visibility approach; (6) Report modal category dropdown fixed for dark mode; (7) Navigation bar items got more breathing room to prevent "Lost & Found" and "Chibi" from appearing compressed; (8) Terms & Conditions modal no longer auto-pops on every login — accessible from Settings only; (9) New animated login loading screen shows after successful login for ~3.5 seconds with smiling Bulldog chibi before navigating to the dashboard.

**Changes by area**

*Dashboard — light-mode night period background:*
- `PERIOD_LIGHT.night.bg` changed from dark navy (`#0f172a`) to light indigo (`#eef2ff → #e8eeff → #f0f4ff`)
- `PERIOD_LIGHT.night.accent` changed from `#60a5fa` to `#1f3a8a`

*Bulldog Exchange — admin variant management:*
- `bulldogExchangeApi.ts`: added `updateVariant` (`PUT /variants/:id`) and `deleteVariant` (`DELETE /variants/:id`)
- `useBulldogExchange.ts`: added `useUpdateVariant` and `useDeleteVariant` hooks
- `ProductDetailPage.tsx`: admin variant panel shows ✏️ Edit + 🗑 Delete per variant; edit opens pre-filled modal; delete confirms then removes

*Bulldog Exchange — individual size variants:*
- `V25__expand_size_variants.sql`: expands `XS–3XL`, `4XL–6XL`, `XS–4XL`, `XS–6XL` grouped variants into individual sizes; updates SHS products to `SHS` category; adds College Traditional Uniform products
- `DevDataSeeder.java`: `seedVariantSizes()` helper added; all uniforms now seed individual sizes; SHS products use `MerchandiseCategory.SHS`; College Traditional Uniform products added

*Bulldog Exchange — invoice print fix:*
- `ReservationInvoicePage.tsx` print CSS: `html, body { visibility: hidden }` replaces broken `body * { visibility: hidden !important }`; `#invoice-printable` uses `position: absolute; inset: 0; max-width: 100%`; `print-hide` CSS class replaces `print:hidden`

*Report modal — dark mode:*
- `ReportModal.tsx`: `<select>` styled with `appearance-none` + custom chevron SVG; `[&>option]` Tailwind selectors ensure dark mode option colors

*Navigation:*
- `AppLayout.tsx`: nav container gets `shrink-0 gap-1 lg:gap-2 xl:gap-4`; `NavItem`: `px-2.5 py-1 rounded-lg` with `hover:bg-surface-muted/60`

*Terms & Conditions:*
- `App.tsx`: `useTermsCheck()` and `<TermsModal />` removed from global render tree
- Terms remain accessible from Settings → Terms & Rules section

*Login loading screen:*
- `LoginLoadingScreen.tsx` (new): full-screen dark overlay, CSS star field, centered 160px animated bulldog chibi, "Welcome back, Bulldog! 🐾" speech bubble, random greeting, `dot-pulse` loading dots; fades in/out over ~3.5s
- `index.css`: `@keyframes dot-pulse` added
- `LoginPage.tsx`: shows loading screen on login success before navigating

**New Migration**
| Version | Description |
|---------|-------------|
| V25 | Expand grouped size variants to individual sizes; SHS category update; College Traditional Uniform products |

---

## [0.39.0] — 2026-05-31

### Polish Sprint — Nav Readability, Dashboard Contrast, Exchange Admin Edit, Chibi Animations, Profile Cleanup, Quick Access Layout

**Summary**
Six targeted fixes following demo review: landing page nav text camouflages on white background when scrolled in light mode; dashboard hero text lacked contrast on pastel gradients; Outlook/Teams placement separated from NUIS Portal; admin lacked full product edit capability; profile still showed a now-removed marketplace activity toggle; and the chibi page had no animations. This sprint resolves all of these and runs a general inconsistency pass.

**Changes by area**

*Landing page — nav text readability on scroll:*
- "NUverse Laguna" wordmark and "Sign In" link were always `color: white`, making them invisible against the `rgba(255,255,255,0.94)` scrolled nav background in light mode
- Both now use `color: #1f3a8a` (NU primary blue) when `navScrolled && !isDark`, and white otherwise — smooth `transition-colors` included
- `textShadow` on Sign In removed in scrolled light mode (shadow was unnecessary against solid background)

*Dashboard hero — text contrast in light mode:*
- Eyebrow date text: was using `style.heroAccent` (e.g., `text-sky-600` on `from-sky-50` bg) — tiny 10px text with poor contrast. Now locked to `text-primary` (#1f3a8a) in light mode
- Name accent span: same issue, now `text-primary` in light mode (dark primary on light gradient is always readable)
- Sub-text: `text-muted-foreground` → `text-foreground/75 font-medium` in light mode for stronger contrast

*Dashboard — Quick Access grid layout:*
- NUIS Portal moved out of the `MODULES` array into a separate `NUIS_LINK` object
- New 3-column bottom row: [NUIS Portal] [Outlook] [MS Teams] — all rendered as `Ms365Card` components in a unified `grid-cols-3` row
- `Ms365Card` now supports both internal paths (using React Router `<Link>`) and external URLs (using `<a target="_blank">`) — detected by whether `href` starts with `http`

*Bulldog Exchange — admin full product edit:*
- `EditProductPage.tsx` created at `/exchange/:productId/edit` — pre-fills all fields (name, description, category, image) from existing product data via `useProduct` query
- `ProductImageUploader` included so admin can replace or upload product images
- Route `paths.exchangeProductEdit` + `editExchangeProductPath()` helper added to `paths.ts`
- Route registered in `AppRoutes.tsx` (lazy-loaded)
- `ProductDetailPage.tsx` now shows "✏️ Edit Product" button in admin actions linking to the edit page

*Profile — remove marketplace activity toggle:*
- `PrivacyToggles` component now returns `null` (both marketplace activity and chibi showcase toggles removed)
- `MyProfilePage`: `PrivacyToggles` import removed; `useUpdatePrivacy` hook call removed; privacy panel now only renders the `VisibilityToggle` (public/private profile switch)
- `useUpdatePrivacy` removed from the page's hook usage (the hook itself remains in case other code uses it)

*Chibi page — smooth animations without dislocation:*
- Whole SVG gets `animation: chibi-bob 2.8s ease-in-out infinite` (gentle vertical float as a single unit — no parts move independently, so nothing appears dislocated)
- Eyes: pupils wrapped in `<g>` elements with `transformOrigin` anchored to their center and `chibi-blink` animation — blinking both pupils together correctly; shine dots included in the same group
- Left arm: wrapped in `<g>` with `transformOrigin: '33.5px 72px'` (shoulder joint) and `chibi-wave-auto` animation — arm waves from the shoulder in SVG coordinate space

*General consistency pass:*
- `MyProfilePage`: removed unused `updatePrivacy` state and `PrivacyToggles` import; privacy section simplified
- `Dashboard`: `NUIS_LINK` extracted as constant; `Ms365Card` prop type made explicit so TypeScript accepts both NUIS and MS365 objects

---

## [0.38.0] — 2026-05-31

### Mega Sprint — Messaging, Suspension, Reactions, Events V2, Reports, Chibi Fix, Profile V2, and Platform-Wide Polish

**Summary**
Comprehensive cross-module sprint covering 11 feature areas: (1) Direct Messaging system (1:1 conversations, real-time-like polling, nav bell with unread count, marketplace integration); (2) Timed Suspension system with admin UI, auto-unsuspend scheduler, suspension screen shown to affected users; (3) Terms & Conditions modal for students on every login with Settings read view; (4) Private Profile follow approval (PENDING→ACCEPTED flow, pending requests panel); (5) Profile improvements — admin/faculty role display, message button, school label fixes, remove Chibi showcase toggle; (6) Reactions "who reacted" modal on all pages with emoji breakdown; (7) Admin permanent comment/post delete across L&F, Events, Announcements; (8) Campus Events V2 — ARCHIVED status, auto-archive scheduler, reactions, comments, RSVP attendee list; (9) Report System — users submit reports from Settings, admin reviews/closes from Admin Reports tab; (10) Bulldog Exchange — SHS category, invoice print fix; (11) Chibi page and companion fixes (tail removed, stable layout).

**Changes by area**

*Sprint 1 — Critical Fixes:*
- Landing page: fixed duplicate "NUverse Laguna" text by passing `showWordmark={false}` to `NUverseMark` in the nav
- Announcement edit: created `EditAnnouncementPage.tsx`, added `announcementEdit` route, added `editAnnouncementPath()` helper, fixed edit links in detail and browse pages
- Philippine timezone: JVM default set to `Asia/Manila` in `NUverseLagunaApplication.main()`, `spring.jackson.time-zone: Asia/Manila` added to `application.yml`, all announcement date formatters updated with `timeZone: 'Asia/Manila'`
- Homepage: MS365 "Microsoft 365" section removed; Outlook and Teams cards moved into the Quick Access section as a sub-row

*Sprint 2 — Suspension System + Terms & Conditions:*
- V20 migration: `suspended_until`, `suspend_count`, `suspension_reason` columns added to `users`
- `User.suspend(until, reason)` updated — increments count, stores date/reason; `User.reactivate()` clears suspension fields
- `User.isSuspensionExpired()` domain method added
- `SuspendUserRequest` DTO added; `AdminController.suspend()` accepts optional body with `suspendedUntil` and `reason`
- `SuspensionExpiryScheduler` runs every 5 min to auto-unsuspend expired suspensions
- `SuspendedException` + `SuspensionResponse` DTO; `GlobalExceptionHandler` returns HTTP 403 with structured `ACCOUNT_SUSPENDED` message
- `AuthServiceImpl.login()` auto-reactivates expired suspensions; throws `SuspendedException` for active suspensions
- `UserResponse` record extended with `suspendedUntil`, `suspendCount`, `suspensionReason`
- Frontend: `suspensionStore` (Zustand), `apiClient` intercepts `ACCOUNT_SUSPENDED` 403 and sets store
- `SuspensionScreen.tsx` full-screen overlay — shows duration, reason, offense count, T&C text; "I Understand & Accept" logs out
- `AdminPage.tsx` — suspend button opens modal with `suspendedUntil` datetime + reason inputs; quick stats shows "Suspended" count; suspend count badge per user row
- `TermsModal.tsx` — full T&C modal for student users on every login (reads all 8 sections, scroll-to-end required, checkbox confirm); `useTermsCheck()` hook auto-opens on user change
- Settings page: Terms & Rules section added with individual article cards and interactive T&C modal link

*Sprint 3 — Profile V2:*
- V21 migration: `status VARCHAR(20) DEFAULT 'ACCEPTED'` added to `follows` with status index
- `FollowStatus` enum (`PENDING` / `ACCEPTED`) added; `Follow.create()` accepts `targetIsPrivate`
- `ProfileServiceImpl.follow()` creates PENDING follow for private profiles; `approveFollow()` / `rejectFollow()` / `getPendingFollowers()` methods added
- `ProfileController` gains `GET /profile/me/pending-followers`, `POST /profile/:followerId/approve-follow`, `DELETE /profile/:followerId/reject-follow`
- `PublicProfileResponse` extended with `isFollowPending` and `role`
- Frontend: `FollowButton` shows "Pending…" state; `PublicProfilePage` shows pending banner + private-profile locked state + Message button (opens conversation)
- `MyProfilePage` shows `PendingFollowersPanel` with approve/reject per pending request
- `ProfileHeader` now renders admin/faculty as "Platform Administrator · NU Laguna" / "Faculty Member · NU Laguna" instead of school code; school labels corrected (SCS, SAS, SEA, SABM, SHS)
- `PrivacyToggles`: "Hide Bulldog Chibi showcase" row removed

*Sprint 4 — Direct Messaging:*
- V22 migration: `conversations` and `messages` tables
- `Conversation`, `Message` entities; `ConversationRepository`, `MessageRepository`; `MessagingService` / `MessagingServiceImpl` / `MessagingController`
- Frontend: `messagesApi.ts`, `MessagesPage.tsx` (sidebar + real-time-polling chat area), `paths.messages` route
- `MessageBell` component in `AppLayout` header with unread count badge (polling every 30s)
- `PublicProfilePage` Message button → `getOrCreate` conversation → navigate to messages with pre-selected conversation
- Marketplace "Message Seller" button now opens real conversation instead of notification

*Sprint 5 — Reactions Modal + Admin Delete Comments:*
- `LostFoundService` / `AnnouncementService` extended with `getReactions()`, `adminDeleteComment()`, `adminDelete()` (L&F only)
- `LostFoundController` adds `GET /{id}/reactions`, `DELETE /comments/{commentId}/admin`, `DELETE /{id}/admin`
- `AnnouncementController` adds `GET /{id}/reactions`
- Shared `ReactionSummary` DTO; `ReactionsModal.tsx` reusable component shows emoji breakdown + user list
- `LostFoundDetailPage`, `AnnouncementDetailPage`, `AnnouncementsPage` wired with ReactionsModal
- Admin delete comment buttons added to L&F comments section

*Sprint 6 — Campus Events V2:*
- V23 migration: `event_reactions` and `event_comments` tables
- `EventStatus.ARCHIVED` added; `CampusEvent.archive()` method
- `EventReaction`, `EventComment` entities; `EventReactionRepository`, `EventCommentRepository`
- `EventServiceImpl` extended with `getAttendees()`, `toggleReaction()`, `getReactions()`, `getComments()`, `addComment()`, `deleteComment()`, `adminDeleteComment()`
- `EventController` gains reaction, comment, attendee, and admin-delete endpoints
- `EventArchiveScheduler` runs every 30 min to auto-archive finished PUBLISHED events
- `EventResponse` extended with `reactionCount`, `userReaction`, `commentCount`
- Frontend: `EventStatus` type updated with `ARCHIVED`; `EventStatusBadge` handles ARCHIVED
- `EventDetailPage` gains reactions picker, ReactionsModal, attendees toggle, comments section with admin delete
- `eventsApi.ts` extended with all new endpoints

*Sprint 7 — Announcements Polish:*
- Delete confirmation: replaced `window.confirm` with proper custom modal in both `AnnouncementsPage.tsx` and `AnnouncementDetailPage.tsx`

*Sprint 8 — Bulldog Exchange:*
- `MerchandiseCategory.SHS` added to backend enum and Flyway migration applied inline
- Frontend: `MerchandiseCategory` type includes `'SHS'`; `MERCHANDISE_CATEGORIES` and `CATEGORY_LABELS` updated; SHS icon added to category filter
- Invoice print fix: replaced `body > * { display: none }` CSS (which hid the React root) with `body * { visibility: hidden }` + `#invoice-printable { visibility: visible }` approach

*Sprint 9 — Report System:*
- V24 migration: `reports` table
- `Report` entity, `ReportRepository`, `CreateReportRequest` / `ReportResponse` DTOs
- `ReportController`: `POST /api/reports` (any user), `GET /api/reports` (admin), `PATCH /api/reports/{id}/close` (admin)
- Frontend: `reportsApi.ts`, `ReportModal.tsx` shared component with category/subject/description form
- Settings `AccountSection` gains "Report an Issue" button opening the modal
- `AdminPage` gains "Reports" tab (`ReportsTab` component) showing all reports with open/closed status, reporter name, close action

*Sprint 10 — Chibi Fixes:*
- `BulldogCompanion.tsx`: tail SVG path removed from the companion face
- `ChibiPage.tsx`: removed `chibi-root` class from main SVG (stops up/down bounce); fixed arm/leg coordinates; removed tail; stabilized layout

**New Migrations**
| Version | Description |
|---------|-------------|
| V20 | Add suspension fields to users (suspended_until, suspend_count, suspension_reason) |
| V21 | Add status column to follows table for pending approval flow |
| V22 | Create conversations and messages tables for direct messaging |
| V23 | Create event_reactions and event_comments tables |
| V24 | Create reports table |

**New Endpoints (selected)**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/messages/conversations` | JWT | List user's conversations |
| POST | `/api/messages/conversations/with/:userId` | JWT | Get or create 1:1 conversation |
| GET | `/api/messages/conversations/:id/messages` | JWT | Paginated messages |
| POST | `/api/messages/conversations/:id/messages` | JWT | Send message |
| GET | `/api/messages/unread-count` | JWT | Unread count |
| GET | `/api/reports` | ADMIN | List all reports |
| POST | `/api/reports` | JWT | Submit report |
| PATCH | `/api/reports/:id/close` | ADMIN | Close report |
| GET | `/api/profile/me/pending-followers` | JWT | Pending follow requests |
| POST | `/api/profile/:followerId/approve-follow` | JWT | Approve follow request |
| DELETE | `/api/profile/:followerId/reject-follow` | JWT | Reject follow request |
| GET | `/api/events/:id/reactions` | JWT | Event reactions list |
| POST | `/api/events/:id/react` | JWT | Toggle event reaction |
| GET | `/api/events/:id/comments` | JWT | Event comments |
| POST | `/api/events/:id/comments` | JWT | Add event comment |
| GET | `/api/events/:id/attendees` | JWT | View RSVP attendees |
| GET | `/api/lost-found/:id/reactions` | JWT | L&F reactions list |
| DELETE | `/api/lost-found/:id/admin` | ADMIN | Admin delete L&F post |
| DELETE | `/api/lost-found/comments/:id/admin` | ADMIN | Admin delete any L&F comment |
| GET | `/api/announcements/:id/reactions` | JWT | Announcement reactions list |

**New Pages / Routes**
- `/messages` — `MessagesPage` (direct messaging with sidebar + chat)
- `/announcements/:announcementId/edit` — `EditAnnouncementPage` (admin/faculty)

---

## [0.37.0] — 2026-05-31

### Major Feature & Design Sprint — Announcements V2, Lost & Found V2, Bulldog Exchange V2, Profile Overhaul, Chibi Fix, INSPIRE Redesign, Landing Refresh

**Summary**
Comprehensive sprint across every module and the UI layer: Announcements gains full admin lifecycle (create-with-photo, edit, delete, archive/restore, reactions); Lost & Found gains detail page, edit, search, comments, and reactions; Bulldog Exchange gets SHS product labeling, fixed gender filter, reservation confirmation flow, ₱50 fee, Sunday pause on countdown, limited product flag, and improved invoice with anti-forgery code; Profile shows email and replaces course/year with school code and enrollment year; Chibi companion rebuilt with 40 goofy messages cycling every 60s (20s auto-dismiss); INSPIRE page fully restructured into clearly separated sections; Landing page refreshed with updated copy, bigger logo, new "What's Inside" background graphics; Quick Access redesigned with MS365 cards on home; Settings link changed from icon to text.

**Changes by area**

*Announcements — full admin lifecycle (backend + frontend):*
- V18 migration: `image_url` column on `emergency_announcements`; `announcement_reactions` table (unique per user per item, emoji field)
- `AnnouncementReaction` entity added with `create()` factory
- `AnnouncementReactionRepository` added
- `EmergencyAnnouncement.imageUrl` field + new `create(…, imageUrl)` overload + `update(…, imageUrl)` overload + `activate()` domain method
- `AnnouncementService` extended: `update`, `getById`, `activate`, `delete`, `toggleReaction`
- `AnnouncementServiceImpl` rewired with `AnnouncementReactionRepository`; `toResponse` now includes `imageUrl`, `reactionCount`, `userReaction`
- `AnnouncementController` adds: `GET /api/announcements/{id}`, `PUT /api/announcements/{id}`, `PATCH /api/announcements/{id}/activate`, `DELETE /api/announcements/{id}`, `POST /api/announcements/{id}/react`; `browse` passes `userId` for per-user reaction context
- `AnnouncementResponse` record extended with `imageUrl`, `reactionCount`, `userReaction`
- `CreateAnnouncementRequest` extended with `imageUrl`; `UpdateAnnouncementRequest` record added
- Frontend: `Announcement` type extended; `announcementsApi` expanded with all new endpoints
- `AnnouncementsPage.tsx` redesigned: clickable titles, inline emoji reaction picker (5 emojis), admin archive/restore/delete buttons, photo thumbnail strip
- `AnnouncementDetailPage.tsx` added at `/announcements/:announcementId`: full post view, reaction picker, admin action bar (edit/archive/restore/delete), `AnnouncementDetailPath` route registered
- `paths.announcementDetail` + `announcementDetailPath()` added to `paths.ts`

*Lost & Found — edit, search, detail, comments, reactions (backend + frontend):*
- V19 migration: `lost_found_comments` table; `lost_found_reactions` table (unique per user per item)
- `LostFoundComment`, `LostFoundReaction` entities added
- `LostFoundCommentRepository`, `LostFoundReactionRepository` added
- `LostFoundRepository.searchByKeyword()` JPQL method added
- `LostFoundItem.update()` domain method added
- `LostFoundService` extended: `update`, `getById`, `toggleReaction`, `getComments`, `addComment`, `deleteComment`; `browse` signature adds `keyword` param
- `LostFoundServiceImpl` rewired with both new repositories; `toResponse` includes `reactionCount`, `userReaction`, `commentCount`
- `LostFoundController` adds: `GET /api/lost-found/{id}`, `PUT /api/lost-found/{id}`, `POST /api/lost-found/{id}/react`, `GET /api/lost-found/{id}/comments`, `POST /api/lost-found/{id}/comments`, `DELETE /api/lost-found/comments/{commentId}`; `browse` accepts `?keyword`
- `LostFoundItemResponse` record extended with `reactionCount`, `userReaction`, `commentCount`
- `AddCommentRequest`, `UpdateLostFoundRequest`, `LostFoundCommentResponse` DTOs added
- Frontend: `LostFoundItem` type extended; `LostFoundComment`, `CreateLostFoundPayload` types added; `lostFoundApi` expanded
- `LostFoundPage.tsx`: search bar added, item title is now a `Link` to detail, reaction/comment count displayed, "View post →" link on each card
- `LostFoundDetailPage.tsx` added at `/lost-found/:itemId`: full post view, image, details grid, emoji reactions (5 emojis), comments section with add/delete, owner edit/resolve/delete actions
- `paths.lostFoundDetail` + `lostFoundDetailPath()` added; route registered in `AppRoutes.tsx`

*Bulldog Exchange — SHS labels, gender filter fix, invoice, fee, Sunday pause, confirmation, limited flag:*
- V16 migration: SQL UPDATE to fix product genders from UNISEX to MALE/FEMALE based on product name patterns
- V17 migration: `limited BOOLEAN NOT NULL DEFAULT FALSE` on `merchandise_products`
- `MerchandiseProduct` entity gains `limited` field + `setLimited()` method
- `ProductCardResponse` and `ProductResponse` extended with `limited`
- `ProductCardResponse` and `ProductResponse` mappers in service updated to include `limited`
- `DevDataSeeder`: new `seedProduct(name, description, category, gender)` overload; all gendered uniforms now call it with correct `MerchandiseGender`; Traditional Uniform products renamed to `[SHS] Traditional Uniform …` with SHS descriptions; College uniforms get `[College]` prefix in descriptions
- `ReservationCountdown.tsx`: pauses on Sundays (`.getDay() === 0`) — shows "Paused — Sunday" message; countdown only ticks on non-Sunday days
- `ProductDetailPage.tsx` fully rewritten: SHS/College badge rendered from name prefix; product name and description strip the prefix for display; 50-peso reservation fee displayed in UI; confirmation modal before reserve (shows item details, unit price, ₱50 fee, total); quantity selector (max 2); "limited product" notice replaces reserve button for limited items
- `ProductCard.tsx`: detects `[SHS]` and `[College]` name prefixes; shows colored level badge; "Display Only" overlay + "Limited" badge for limited products; hides "NU Official" ribbon when level tag shown
- `BulldogExchangePage.tsx`: gender filter pill tabs wired correctly (the root cause was products all defaulted to UNISEX — now fixed via V16 migration + seeder gender overload)
- `ReservationInvoicePage.tsx` fully rewritten: dedicated `<style>` tag for print isolation; chibi mascot looking straight forward; anti-forgery verification code (`NUE-{id_part}-{timestamp_part}`); breakdown showing unit price + ₱50 reservation fee + total; 48-hour pickup note with Sunday exclusion
- `types.ts` extended: `ProductCard.limited`, `ProductDetail.limited`

*Profile — email display, school label, enrollment year, Chibi showcase fix:*
- Backend: `PublicProfileResponse` record extended with `hideChibiShowcase`; `ProfileServiceImpl.getPublicProfile()` maps `profile.isHideChibiShowcase()` into response
- `UserProfile.update()` already had `hideChibiShowcase` — confirmed the field exists and propagates
- Frontend `types.ts`: `PublicProfileResponse.hideChibiShowcase` added
- `ProfileHeader.tsx`: `yearLevel` prop removed; `email` and `enrollmentYear` props added; `course` prop now treated as school code (SCS/SAS/SEA/SHS/SABM) and displayed with full school name; `email` displayed below the name with envelope icon
- `MyProfilePage.tsx`: passes `user.email` from `useAuthStore` and derives `enrollmentYear` from `profile.createdAt`
- `PublicProfilePage.tsx`: passes without `yearLevel`; `hideChibiShowcase` available for future chibi section toggle
- `schemas.ts`: `SCHOOL_OPTIONS` const added (SCS, SAS, SEA, SHS, SABM); `editProfileSchema` course field max changed to 10 chars; `yearLevelOptions` retained for backward-compat
- `ProfileForm.tsx`: "Course / Program" `Input` replaced with "School" `Select` using `SCHOOL_OPTIONS`

*Chibi companion — goofy messages, 1-min cycle, 20s auto-dismiss, tail fix:*
- `BulldogCompanion.tsx` rewritten: MESSAGES array expanded to 40 entries (goofy jokes, trivia, barks, helpful tips, funny observations); daily-quote logic removed; bubble now cycles every 60 seconds with 8s delay on first show; auto-dismiss after 20 seconds; manual dismiss on click; bubbleMsg state holds the current random message; dismissTimerRef prevents stale timers; BulldogFace SVG tail path redrawn to attach to the body's lower-right at `cx=40, cy=36` origin — no more floating tail

*INSPIRE Sports Academy — complete redesign:*
- `InspirePage.tsx` fully rewritten with clear visual hierarchy: each section (Student Sports Club, Facilities, Athletic Club Membership, Personal Training, Contact) now has a colored vertical accent line, section label, and its own visual personality
- Facilities cards: sport emoji large background watermark, per-sport accent color, description, sport tags, hours — all clearly grouped within each card
- Membership section: inclusions grid and pricing grid are visually separated from each other with clear labels
- Contact section: each contact method has an icon tile; social links as pill buttons; hours in a highlighted callout box
- Dark/light mode tested throughout

*Quick Access & Navigation:*
- `AppLayout.tsx`: Settings link changed from gear SVG icon to text "Settings"; Outlook/Teams links removed from header and mobile drawer
- `DashboardPage.tsx`: `MS365_LINKS` const added (Outlook + MS Teams); `Ms365Card` component added (external link card); "Microsoft 365" section added below Module grid
- `DashboardPage.tsx`: `MS365_LINKS` array uses brand-accurate colors (Outlook: #0078d4, Teams: #6264a7)

*Landing Page — content refresh and section enhancements:*
- Module descriptions updated with richer, more evocative copy for all 6 modules
- "LIVE PLATFORM" badge removed; replaced with "For Bulldogs, by Bulldogs" pill
- Hero tagline updated: "Your campus. Your community. Your universe."
- "What's Inside" section: floating hexagon grid pattern, radial glow accents, and two animated orbs added as background graphics
- Footer: radial glow accents + dot grid overlay added as background graphics
- Nav logo now shows "NUverse Laguna" wordmark next to the mark on desktop

*Auth pages — enhanced backgrounds:*
- `AuthLayout.tsx`: light mode right panel background upgraded to match dark mode richness — radial ellipse gradients at three positions (top-left blue, bottom-right amber, top-right violet)

*Overall backgrounds:*
- `AppLayout.tsx`: subtle fixed-position atmospheric glow added in light mode (blue at top-left, gold at bottom-right)
- `index.css`: added `@keyframes mesh-drift`, `sweep-reveal`, `card-glow-pulse`, `shimmer-line` + `.shimmer-line` class; `.bg-noise` pseudo-element texture class

**New Migrations**
| Version | Description |
|---------|-------------|
| V16 | Fix product genders (UPDATE merchandise_products based on name pattern) |
| V17 | Add `limited` boolean column to `merchandise_products` |
| V18 | Add `image_url` to `emergency_announcements`; create `announcement_reactions` table |
| V19 | Create `lost_found_comments` and `lost_found_reactions` tables |

**New Endpoints**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/announcements/{id}` | JWT | Get single announcement with reaction context |
| PUT | `/api/announcements/{id}` | ADMIN/FACULTY | Edit announcement |
| PATCH | `/api/announcements/{id}/activate` | ADMIN/FACULTY | Restore archived announcement |
| DELETE | `/api/announcements/{id}` | ADMIN | Permanently delete announcement |
| POST | `/api/announcements/{id}/react` | JWT | Toggle emoji reaction |
| GET | `/api/lost-found/{id}` | JWT | Get single L&F post |
| PUT | `/api/lost-found/{id}` | JWT (owner) | Edit L&F post |
| POST | `/api/lost-found/{id}/react` | JWT | Toggle emoji reaction |
| GET | `/api/lost-found/{id}/comments` | JWT | List comments |
| POST | `/api/lost-found/{id}/comments` | JWT | Add comment |
| DELETE | `/api/lost-found/comments/{id}` | JWT (author) | Delete comment |

**New Pages / Routes**
- `/announcements/:announcementId` — `AnnouncementDetailPage` (full post view, reactions, admin actions)
- `/lost-found/:itemId` — `LostFoundDetailPage` (full post view, reactions, comments, edit)

---

## [0.36.0] — 2026-05-31

### Feature Sprint — Gender Filtering, Message Seller, Announcements Browse, Reservation Invoice, Badge Component

**Summary**
Five self-contained features added across the stack: Bulldog Exchange gains gender targeting and keyword search on products; Marketplace gains a "Message Seller" in-app notification flow; a student-facing Announcements browse page is added; Bulldog Exchange reservations get a printable invoice view; and a multi-variant `Badge` component joins the shared UI system.

**Changes by area**

*Bulldog Exchange — Gender Targeting + Keyword Search:*
- `MerchandiseGender` enum added: `MALE`, `FEMALE`, `UNISEX`
- V15 migration: `gender VARCHAR(20) NOT NULL DEFAULT 'UNISEX'` column added to `merchandise_products`; index `idx_merchandise_products_gender` created
- `MerchandiseProduct` entity gains `gender` field; `create()` and `update()` factory/domain methods extended to accept `gender`
- `BulldogExchangeService.getProducts()` signature extended to `(keyword, category, gender, pageable)`
- `BulldogExchangeServiceImpl.getProducts()` branches on all combinations: keyword search (with/without category), category+gender filter, category-only, gender-only, or unfiltered — each path uses its own repository method to avoid cross-param interference
- `MerchandiseProductRepository` gains four new methods: `searchByName` (LIKE on name), `searchByNameAndCategory`, `findByCategoryAndGenderAndActiveTrue`, `findByGenderAndActiveTrue`
- `CreateProductRequest` and `UpdateProductRequest` DTOs include `gender` field
- `ProductCardResponse` includes `gender` field; `BulldogExchangeServiceImpl.toCardResponse()` maps `product.getGender()` (null-safe, defaults to `"UNISEX"`)
- `BulldogExchangeController.getProducts()` accepts `?keyword` and `?gender` request params alongside existing `?category`
- Frontend `types.ts` gains `MerchandiseGender = 'MALE' | 'FEMALE' | 'UNISEX'` and `ProductCard.gender`
- Frontend `bulldogExchangeApi.getProducts()` passes keyword and gender params when non-null
- `BulldogExchangePage.tsx` redesigned with SVG category icon map and gender filter pill tabs

*Marketplace — Message Seller:*
- `NotificationType.MARKETPLACE_MESSAGE` added to backend enum
- `MessageSellerRequest` record DTO added (`@NotBlank message`)
- `MarketplaceService.messageSeller(buyerId, listingId, message)` interface method added
- `MarketplaceServiceImpl.messageSeller()` — validates buyer is not the seller (400), looks up buyer display name via `UserProfileReader`, creates a `MARKETPLACE_MESSAGE` notification for the seller via `NotificationService`; `NotificationService` injected as a new dependency
- `POST /api/marketplace/{listingId}/message` endpoint added to `MarketplaceController`
- `MarketplaceServiceImpl` now publishes `MarketplaceListingCreatedEvent` on create and `MarketplaceListingSoldEvent` on mark-as-sold (event publisher wired in alongside `NotificationService`)
- Frontend `marketplaceApi.messageSeller(listingId, message)` added
- `ListingDetailPage.tsx` gains a **Message Seller** button (shown when listing is `AVAILABLE`); clicking opens an inline modal with a `<textarea>` (max 500 chars, character counter), Cancel, and Send (disabled while empty; shows loading state); success toasts and clears modal

*Announcements — Student Browse Page:*
- `GET /api/announcements/browse` endpoint added to `AnnouncementController` (any authenticated user, paginated newest-first) — separate from the admin-only `GET /api/announcements`
- `AnnouncementsPage.tsx` added at `/announcements`: priority-coded cards (`🚨 Critical` / `📣 Important` / `📌 General`) with left colour bar, archived badge for inactive/expired items, paginated via `Pagination` component
- `announcementsApi.browse(page, size)` added
- Route `/announcements` and `paths.announcements` constant added to `AppRoutes.tsx` and `paths.ts`

*Bulldog Exchange — Reservation Invoice Page:*
- `ReservationInvoicePage.tsx` added at `/exchange/reservations/:reservationId/invoice`: printable invoice card with product name, variant, price, status, issued/expires dates, customer name and email, seller policy note, and "Print / Save as PDF" button (`window.print()`); print controls hidden via `print:hidden`
- `reservationInvoicePath(reservationId)` helper added to `paths.ts`; `paths.reservationInvoice` route pattern added
- `ReservationCard.tsx` gains a **View Invoice** link button routing to the invoice page
- Route lazy-loaded in `AppRoutes.tsx`

*Shared UI — Badge Component:*
- `Badge.tsx` added: configurable `variant` (solid / soft / outline), `size` (sm / md), `color` (12 values: primary, accent, success, danger, warning, blue, violet, emerald, amber, red, gray), optional `dot` leading coloured circle. Extends `HTMLSpanElement` attributes for full prop pass-through
- Exported from `shared/components/ui/index.ts`

**New Endpoints**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/marketplace/{listingId}/message` | JWT | Send a message to a listing's seller (creates MARKETPLACE_MESSAGE in-app notification) |
| GET | `/api/announcements/browse` | JWT | Paginated announcement browse for students (newest-first) |

**New Migration**
- V15: `gender` column on `merchandise_products` (NOT NULL DEFAULT 'UNISEX', indexed)

**Affected Files**
- `backend/.../bulldog_exchange/domain/MerchandiseGender.java` (new)
- `backend/.../bulldog_exchange/domain/MerchandiseProduct.java`
- `backend/.../bulldog_exchange/application/BulldogExchangeService.java`
- `backend/.../bulldog_exchange/application/BulldogExchangeServiceImpl.java`
- `backend/.../bulldog_exchange/controller/BulldogExchangeController.java`
- `backend/.../bulldog_exchange/dto/CreateProductRequest.java`
- `backend/.../bulldog_exchange/dto/UpdateProductRequest.java`
- `backend/.../bulldog_exchange/dto/ProductCardResponse.java`
- `backend/.../bulldog_exchange/repository/MerchandiseProductRepository.java`
- `backend/.../marketplace/application/MarketplaceService.java`
- `backend/.../marketplace/application/MarketplaceServiceImpl.java`
- `backend/.../marketplace/controller/MarketplaceController.java`
- `backend/.../marketplace/dto/MessageSellerRequest.java` (new)
- `backend/.../announcements/controller/AnnouncementController.java`
- `backend/.../notifications/domain/NotificationType.java`
- `backend/.../db/migration/V15__merchandise_gender.sql` (new)
- `frontend/.../bulldog-exchange/types.ts`
- `frontend/.../bulldog-exchange/services/bulldogExchangeApi.ts`
- `frontend/.../bulldog-exchange/pages/BulldogExchangePage.tsx`
- `frontend/.../bulldog-exchange/pages/ReservationInvoicePage.tsx` (new)
- `frontend/.../bulldog-exchange/components/ReservationCard.tsx`
- `frontend/.../marketplace/services/marketplaceApi.ts`
- `frontend/.../marketplace/pages/ListingDetailPage.tsx`
- `frontend/.../announcements/services/announcementsApi.ts`
- `frontend/.../announcements/pages/AnnouncementsPage.tsx` (new)
- `frontend/.../shared/components/ui/Badge.tsx` (new)
- `frontend/.../shared/components/ui/index.ts`
- `frontend/.../shared/routes/AppRoutes.tsx`
- `frontend/.../shared/routes/paths.ts`

---

## [0.35.0] — 2026-05-31

### Backend — Remaining Gap Closure

**Summary**
Closed the last five backend gaps identified after v0.33.0: the only untriggered XP source (`DAILY_LOGIN`), two missing notification types, a Flyway clean-build failure, an `AdminController` code quality issue, and the missing frontend Reactivate button that left the `PATCH /reactivate` endpoint unreachable from the UI.

**Changes by area**

*XP System — `DAILY_LOGIN` (the last dead source):*
- `DailyLoginEvent` record added to `shared/event/`
- `AuthServiceImpl.login()` now publishes `DailyLoginEvent` after every successful login
- `ChibiXpEventRepository` gains `existsByUserIdAndSourceAndCreatedAtAfter` for deduplication
- `ChibiXpEventListener.onDailyLogin()` awards XP once per calendar day — subsequent logins on the same day are silently skipped
- All 11 `XpSource` values are now triggered end-to-end

*Notifications — two new types:*
- `NotificationType.LISTING_SOLD` added; `NotificationEventListener` handles `MarketplaceListingSoldEvent` → notifies the seller when their listing is marked as sold
- `NotificationType.LOST_FOUND_RESOLVED` added; `NotificationEventListener` handles `LostFoundItemResolvedEvent` → notifies the reporter when their item is resolved
- `ReferenceType` extended with `LISTING` and `LOST_FOUND_ITEM`
- Frontend `notifications/types.ts` updated to match both new types and reference types

*Flyway — clean-build stability:*
- `V10__suggestions.sql` and `V14__suggestion_votes_updated_at.sql` were previously deleted but remain in `flyway_schema_history` — a `mvn clean` build would fail Flyway validation
- `spring.flyway.ignore-migration-patterns: "*:missing"` added to `application.yml`; Flyway now tolerates missing history entries without error

*Admin — code quality and usability:*
- `AdminController` FQN inline class references replaced with proper `import` statements
- `ApiResponse.success()` in `getUsers` replaced with `ApiResponse.ok()` for consistency
- `AdminPage.tsx` gains a **Reactivate** button: shown for `SUSPENDED` users (the Suspend button shows for all other non-admin users); backed by `PATCH /api/admin/users/{id}/reactivate`

**219/219 backend tests pass. 0 failures.**

---

## [0.34.0] — 2026-05-31

### Frontend — Complete UI/UX Transformation Pass

**Summary**
Full editorial redesign of every authenticated page in the application. Each major page now has its own distinct visual personality, atmosphere, and editorial identity — fashion-magazine meets premium digital product. All pages are theme-safe (light + dark), fully typed, and animation-enhanced.

**Pages redesigned**

- **Dashboard** — Editorial bento-grid layout. Time-aware hero (dawn/morning/afternoon/evening/night) with massive typography, 6-module bento grid with animated hover states, chibi XP mini-widget, editorial event and listing rows with date columns and color bars.
- **Marketplace** — Premium e-commerce editorial header (green-tinted). Full inline filter system: horizontal scrollable category chips with SVG icons, condition pills, price range dropdown, live count badge. No more generic form panel.
- **Events** — Dynamic hero with category-reactive accent colors. Category picker with animated color-shift. Compact "Upcoming only" toggle. Removed redundant filter form, replaced with elegant pill-based navigation.
- **Bulldog Exchange** — Flagship store aesthetic with diagonal stripe texture, gold accents, premium reservation policy strip, gold category tabs. Admin "New Product" button styled in gold gradient.
- **Lost & Found** — Community bulletin board aesthetic. Live LOST/FOUND/resolved stat badges in the header. Color-coded item cards (amber=lost, green=found) with icon type badges, inline resolve buttons. Type toggle in modal redesigned as proper pill-switcher.
- **Chibi** — RPG character screen with atmospheric dark hero, orbital ring animations, tier-reactive glow effects, star particle field, labeled achievement cards with XP reward display.
- **Profile** — Premium ProfileHeader with gradient ring around avatar, editorial name typography, taller cover band with mesh orbs + dot grid + NU watermark. Section panels with icon headers.
- **Admin Panel** — Editorial control-center hero with red accents. Users tab shows quick stats (total/active/pending), redesigned table with role/status dot indicators. Announcements tab with priority picker as pill switcher.
- **Settings** — Two-column layout with icon sidebar nav. Theme section shows light/dark preview cards with active checkmark. Account info with editorial label typography.
- **Notifications** — Clean editorial header with unread count badge, skeleton loaders replacing spinner.

**Global CSS additions**
- `.no-scrollbar` utility for horizontal scroll containers

---

## [0.33.0] — 2026-05-31

### Backend — Gap Closure: Full System Completeness Pass

**Summary**
Closed every functional gap in the backend across all 8 modules. The system is now fully wired end-to-end: all XP sources fire, all modules have tests, demo data is complete, and several correctness and performance issues are resolved.

**Changes by area**

*XP System — fixed 6 dead XP sources (was never triggered):*
- `FIRST_LISTING` / `LISTING_SOLD` — `MarketplaceServiceImpl` now publishes `MarketplaceListingCreatedEvent` on listing creation and `MarketplaceListingSoldEvent` on mark-as-sold
- `LOST_FOUND_POST` / `LOST_FOUND_RESOLVED` — `LostFoundServiceImpl` now publishes `LostFoundItemCreatedEvent` and `LostFoundItemResolvedEvent`
- `UPLOAD_AVATAR` — `ProfileServiceImpl.updateAvatar()` now publishes `AvatarUploadedEvent`
- `COMPLETE_PROFILE` — `ProfileServiceImpl.updateProfile()` publishes `ProfileCompletedEvent` when all 4 fields (bio, course, yearLevel, interests) are filled
- `ChibiXpEventListener` wired with 6 new `@TransactionalEventListener` handlers for all the above

*Admin — missing reactivate:*
- `User.reactivate()` domain method added (throws 400 if already active)
- `PATCH /api/admin/users/{id}/reactivate` endpoint added to `AdminController`
- `GET /api/admin/users/{id}` endpoint added for single-user lookup

*Lost & Found — feature gaps:*
- `POST /api/lost-found/images` image upload endpoint added (consistent with Marketplace and Exchange)
- `LostFoundServiceImpl` fully rewritten: adds event publishing, `StorageService` injection, and batch profile loading (eliminates N+1 via `findByUserIdIn`)

*Performance — N+1 fixes:*
- `MerchandiseProductRepository`: `@EntityGraph(attributePaths = "variants")` added to `findByActiveTrue` and `findByCategoryAndActiveTrue` — product card browsing now loads variants in a single query

*API consistency:*
- `AnnouncementController`, `LostFoundController`, `ChibiController` — replaced `ApiResponse.success()` calls with `ApiResponse.ok()` and descriptive messages

*Demo data (DevDataSeeder):*
- Added 2 seeded announcements: Enrollment Period (IMPORTANT, 14d) + Maintenance Notice (GENERAL, 4d)
- Added 6 seeded lost & found items (3 LOST + 3 FOUND) attributed to demo students

*New tests (46 added, total 219):*
- `AnnouncementServiceImplTest` (7 tests) + `AnnouncementControllerTest` (8 tests)
- `LostFoundServiceImplTest` (10 tests) + `LostFoundControllerTest` (9 tests)
- `ChibiServiceImplTest` (8 tests) + `ChibiControllerTest` (4 tests)
- `MarketplaceServiceImplTest` — updated constructor to include `ApplicationEventPublisher`

**219/219 backend tests pass. 0 failures.**

---

## [0.32.0] — 2026-05-31

### Bulldog Exchange — Real Product Catalog Seeded (Backend)

**Summary**
Replaced the five placeholder demo products in `DevDataSeeder` with the full 30-product official catalog provided by the NU Laguna store. Every product now reflects real SKUs, accurate pricing, correct size tiers, and proper categories.

**Products added (30 total, 54 variants)**

| Category | Products |
|---|---|
| BAGS | NU Drawstring Bag (Black, Blue — ₱299) |
| CLOTHING | NU Pullover Jacket Hood Combi NU Gold (XS–XL × Blue/Yellow — ₱799) |
| CLOTHING | Male & Female Psychology Uniform Top + Bottom (XS–3XL / 4XL–6XL price tiers) |
| CLOTHING | NSTP Shirt & Jogging Pants (XS–4XL — ₱300 / ₱400) |
| CLOTHING | ESS Male & Female Polo + Khaki Short (XS–6XL — ₱600 each) |
| CLOTHING | PE Shirt & Jogging Pants (XS–4XL — ₱300 / ₱400) |
| CLOTHING | Traditional Uniform — Male Polo + Pants, Female Blouse + Skirt (XS–3XL / 4XL–6XL tiers) |
| CLOTHING | Tourism Uniform — Male Coat/Vest/Pants, Female Scarf/Blazer/Vest/Skirt (XS–3XL / 4XL–6XL tiers) |
| ACCESSORIES | NU Bulldog Basketball Cap (₱249), NU Bulldog Plush Key Chain (₱249) |
| OTHER | NU Bulldog Plushie Toy (₱399) |
| EQUIPMENT | NU HydroFresh FlipStraw Tumbler (₱399), HydroFresh Insulated Food Jar (₱499) |

**Variant design rationale**
- Uniform items with two price tiers (e.g., XS–3XL at ₱700 vs 4XL–6XL at ₱950) are modelled as two variants per product — matching real store pricing without over-engineering the schema.
- Apparel with a single price across all sizes (NSTP, PE, ESS) uses one variant with a size-range label.
- The Pullover Jacket uses 10 variants (5 sizes × 2 colors) to enable per-size stock management.

**No schema changes** — V5 migration covers all columns used. **173 backend tests: all pass.**

---

## [0.31.0] — 2026-05-31

### Front Pages — World-Class Visual Redesign (Landing, Login, Register)

**Business Purpose**
The three public-facing pages — landing, login, and register — are the first and last thing any evaluator, student, or faculty member sees. The previous versions were functional but template-grade: generic gradient heroes, standard form layouts, and no memorable visual identity. This redesign treats every pixel as a demonstration of engineering craft and design excellence. The goal: when opened side-by-side with any other university campus platform, NUverse must clearly win on visual quality, interaction polish, and emotional impact.

**Architecture Decisions**

- **Campus photo as the visual foundation:** The NU Laguna campus photo (`public/images/campus.jpg`) is now the backdrop for all three public pages. Light mode renders it with a medium NU-blue tint overlay (`rgba(18,48,140,0.50)`), keeping the campus clearly visible. Dark mode renders it with a deep dark overlay (`rgba(4,7,18,0.78)`) plus the existing CSS star field. Both modes read as obviously distinct — the light mode feels like campus daytime, dark mode like campus night.
- **Mouse parallax on landing hero:** `onMouseMove` on the hero section reads cursor position relative to the section and applies `translate(x, y)` to the campus photo (`±20px / ±12px` max). The photo is sized `115%` to prevent edges showing during movement. Transition is `0.15s ease-out` for smooth but responsive feel. No library dependency — raw DOM math.
- **`campus-breathe` CSS animation:** Applied to the campus photo on all three pages. A `30s` ease-in-out `scale(1.0 → 1.06)` cycle gives the photo subtle life without being distracting. GPU-only (transform) — no layout thrash.
- **Chibi bulldog mascot (landing only):** A 96×108px SVG bulldog character positioned absolute bottom-right of the hero. All animations are CSS-class-driven (`.chibi-root`, `.chibi-arm`, `.chibi-tail`, `.chibi-eye`, `.chibi-eye-r`) — no React state drives animation properties, eliminating the re-render glitch that caused jitter in the previous implementation. The arm auto-waves via `chibi-wave-auto` (waves during 68–96% of an 8s cycle, rests the remainder). `.chibi-root:hover` accelerates bob, wave, and tail CSS animations via CSS selector cascade. A speech bubble cycles through 6 messages using `opacity` + `transform` CSS transitions (no animation re-mounting).
- **Floating particles:** 12 particles (gold/blue/white) across the full hero width, driven by `particle-rise` keyframe. Each has distinct `bottom` origin, `left` position, size, delay, and duration — preventing the synchronized "all rising together" artifact from the previous 10-particle version.
- **Scroll-aware navbar:** `window.scroll` listener (passive) sets `navScrolled` state at 50px. Below threshold: `transparent` background, no border. Above threshold: glass morphism (`backdrop-filter: blur(20px)`) with mode-appropriate background. Nav text color adapts — always white over the hero photo.
- **Editorial hero typography:** Heading uses `clamp(3.5rem, 11vw, 7.5rem)` with `font-weight: 900` and `letter-spacing: -0.03em`. "NUverse" renders in a `135deg` gradient (`white → #cfe0ff → #a8c5ff → #f5b300`) with `drop-shadow` filter for glow depth. "LAGUNA" renders smaller (`0.44em`) in a pure gold gradient with `letter-spacing: 0.3em` — two distinct typographic registers on a single heading. A decorative gradient divider line sits between the heading and subtitle.
- **Halo ring effect:** A `560×560px` radial gradient div (`rgba(74,110,232,0.12)` center → transparent) is positioned absolute behind the hero text, giving the content area a subtle atmospheric depth without obscuring the campus photo.
- **AuthLayout — campus photo left panel:** The `auth-panel-bg` CSS class is now a solid dark fallback gradient. The actual left panel renders the campus photo via `<img>` with `campus-breathe` animation, overlaid with 4 floating orbs (using existing `float-orb` keyframe). Content includes a 80px NUverse mark with glow drop-shadow, a route-aware headline ("Welcome to" for login / "Join the" for register), gradient-text "NUverse Laguna", subtitle, and 5 module tags. Bottom credit stays fixed.
- **Form panel background:** Right panel uses `radial-gradient(ellipse ...)` to inject a faint blue tint into an otherwise flat background. In light mode: `#f8faff` base with a radial glow at bottom-right. In dark mode: `var(--color-bg)` with a radial glow at top-left. Neither is visible as a distinct element — just removes the "pure flat white/black" look.
- **Premium `Input` component:** Height raised from `h-11` (44px) to `h-12` (48px). Border upgraded from `border` (1px) to `border-[1.5px]`. Border radius from `rounded-lg` to `rounded-xl`. On focus: a separate overlay `<div>` with `box-shadow: 0 0 0 3px rgba(74,110,232,0.15)` provides the glow ring (avoids CSS `ring` utility artifacts). Label transitions to `var(--color-primary)` color on focus via inline style + `useState`. Error messages now include an inline SVG warning icon. `outline-none` replaces `focus-visible:ring-2` (the overlay div handles focus indication). Placeholder opacity at 40% prevents it from competing with real input text.
- **Submit buttons:** Height raised to `h-12`. Login button: `#1f3a8a → #4a6ee8 → #6d55e8` with `0 4px 24px rgba(74,110,232,0.38)` shadow. Register button: `#1f3a8a → #4a6ee8 → #8b5cf6 → #f59e0b` — a blue-to-gold sweep that's visually distinct from the login button. Both display `→` as part of the button text label. `hover:-translate-y-0.5` on both.
- **ThemeToggle — constant motion:** Sun icon: rays group has `animation: sun-spin-continuous 10s linear infinite` always active — not hover-triggered. Moon icon: sparkle `<circle>` elements retain `sparkle-pop`/`sparkle-pop-2` animation. The previous `moon-float` up/down animation was removed (it competed with the sparkles visually). The CSS `:hover .sun-rays` rule that previously triggered a one-shot spin is replaced with hover filter on `.theme-toggle-moon` only.
- **Module section light/dark:** Module overview section uses `#ffffff` in light mode, `#0a0f1e` in dark mode — a clear and unambiguous contrast. Heading color, description text color, border color, and card background all switch conditionally. Each card has an accent color sweep (`width: 0 → 100%`) on hover using the module's `accent` color.
- **`star field` (dark mode):** The `.stars-wrap` div renders on both the landing page and within the AuthLayout — CSS star field appears behind all content in dark mode via `z-index` layering. No JS.

**New CSS Keyframes Added to `index.css`**
- `sun-spin-continuous` — full `0 → 360deg` rotation for always-on sun rays
- `campus-breathe` — `scale(1.0 → 1.06)` 30s ease-in-out loop on campus photo
- `particle-rise` — particles drift upward with opacity fade in/out
- `hero-reveal` — entrance: `translateY(30px) opacity:0 → translateY(0) opacity:1`
- `chibi-bob` — 2.4s vertical bob for chibi body
- `chibi-wave-auto` — 8s cycle: arm rests 68%, waves 28%, returns 4%
- `chibi-wave-fast` — fast wave for hover state
- `chibi-blink` — 4.5s eye scale-Y collapse and restore
- `chibi-tail-wag` / `chibi-tail-fast` — tail rotation with transform-origin at root
- `bubble-in` — speech bubble entrance scale + fade

**New CSS Classes Added**
- `.chibi-root` — applies `chibi-bob` animation; `:hover` accelerates it
- `.chibi-arm` — applies `chibi-wave-auto`; `.chibi-root:hover .chibi-arm` switches to `chibi-wave-fast`
- `.chibi-tail` / `.chibi-root:hover .chibi-tail` — normal vs fast tail wag
- `.chibi-eye` / `.chibi-eye-r` — staggered blink on both pupils

**Affected Files**
- `modules/landing/pages/LandingPage.tsx` — complete rewrite; campus photo, parallax, particles, editorial hero, chibi mascot, module grid, scroll-aware nav, footer
- `shared/layouts/AuthLayout.tsx` — complete rewrite; campus photo left panel, floating orbs, route-aware headline, premium right panel background
- `modules/auth/pages/LoginPage.tsx` — rewrite; `clamp()` heading, gradient text, stripped to essentials
- `modules/auth/pages/RegisterPage.tsx` — rewrite; `clamp()` heading, gradient text, redesigned success state
- `modules/auth/components/LoginForm.tsx` — premium button (`h-12`, `→`, stronger shadow), consistent `gap-5`
- `modules/auth/components/RegisterForm.tsx` — premium button, consistent `gap-5`, cleaner strength bar
- `shared/components/ui/Input.tsx` — `h-12`, `rounded-xl`, `border-[1.5px]`, focus glow overlay div, label color transition, icon in error message
- `shared/components/ThemeToggle.tsx` — sun rays always rotate via `sun-spin-continuous`; moon float removed; sparkles retained
- `src/index.css` — multiple new keyframes and CSS classes as listed above

**Endpoints / Entities / Migrations**
None. Frontend-only changes.

---

## [0.30.0] — 2026-05-31

### Email Domain Update + Suggestions Module Removed

**Business Purpose**
The official student email domain for NU Laguna is `@students.nu-laguna.edu.ph`, not `@national-u.edu.ph`. All registration validation, placeholder text, notices, and backend allowed-domain configuration are updated to reflect the correct domain. The Suggestions & Feedback module is removed from the platform — it was never fully implemented (frontend stub only, no backend), and removing it reduces scope to what can actually be demonstrated.

**Architecture Decisions**

- **Email domain change:** The domain constant `NU_EMAIL_DOMAIN` in `schemas.ts` changed from `'national-u.edu.ph'` to `'students.nu-laguna.edu.ph'`. The backend `application.yml` default for `auth.allowed-email-domains` changed from `national-u.edu.ph` to `students.nu-laguna.edu.ph`. `AuthConfig.java` reads from yml — no Java code change needed. Admin/faculty demo accounts in `DevDataSeeder.java` use `@nu-laguna.edu.ph` (they bypass registration validation since the seeder creates users directly). Student demo accounts updated to `@students.nu-laguna.edu.ph`.
- **Suggestions module deletion:** Three frontend files deleted: `SuggestionsPage.tsx`, `suggestionsApi.ts`, `types.ts`. Two backend Flyway migrations deleted: `V10__suggestions.sql`, `V14__suggestion_votes_updated_at.sql`. All references purged: `paths.suggestions` removed from `paths.ts`; nav link removed from `AppLayout.tsx`; module shortcut removed from `DashboardPage.tsx`; speech tip removed from `BulldogCompanion.tsx`; XP row removed from `ChibiPage.tsx`; page mood mapping removed from `BulldogCompanion.tsx`; `--color-module-suggestions` CSS variable removed from `index.css`.
- **Test files updated:** All backend and frontend test files referencing `national-u.edu.ph` updated to `students.nu-laguna.edu.ph`. `schemas.test.ts` updated to use the new domain in its valid test fixture.

**Affected Files**
- `modules/auth/schemas.ts` — domain constant updated
- `modules/auth/schemas.test.ts` — test fixture email updated
- `modules/auth/components/RegisterForm.tsx` — placeholder text updated
- `modules/auth/components/LoginForm.tsx` — placeholder text updated
- `modules/auth/pages/RegisterPage.tsx` — domain notice text updated
- `backend/.../application.yml` — `allowed-email-domains` default updated
- `backend/.../DevDataSeeder.java` — student emails updated to new domain
- `backend/.../AuthControllerTest.java` — test emails updated
- `backend/.../AuthServiceImplTest.java` — test emails updated
- `backend/.../NUverseLagunaApplicationTests.java` — test email updated
- `backend/.../application-test.yml` — domain updated
- `shared/routes/paths.ts` — `suggestions` path removed
- `shared/layouts/AppLayout.tsx` — Suggestions nav link removed
- `modules/dashboard/pages/DashboardPage.tsx` — Suggestions shortcut removed
- `shared/components/BulldogCompanion.tsx` — tip text and mood mapping removed
- `modules/chibi/pages/ChibiPage.tsx` — XP row removed
- `src/index.css` — `--color-module-suggestions` removed
- `modules/suggestions/` — entire directory deleted
- `backend/.../V10__suggestions.sql` — deleted
- `backend/.../V14__suggestion_votes_updated_at.sql` — deleted

**Endpoints / Entities / Migrations**
V10 and V14 deleted. Backend validation domain updated.

---

## [0.28.0] — 2026-05-30

### Auth Pages — Premium Split-Screen Redesign (Login + Register)

**Business Purpose**
The login and register pages are the first thing any visitor experiences after the landing page — they set the emotional tone for everything that follows. The previous design was a single centered card on a plain background: functional but forgettable. This redesign replaces both pages with a world-class split-screen layout that communicates brand confidence, campus energy, and premium craftsmanship from the first second. The redesign targets two goals: impress demo viewers who open `/login` directly, and reduce bounce on new user registration by making the sign-up flow feel as polished as the product itself.

**Architecture Decisions**

- **Split-screen AuthLayout**: The `AuthLayout` shell is now a two-panel layout (52/48 width split on `lg`+, stacks on mobile). The left panel is a persistent, route-aware branding panel with animated floating orbs, a dot-grid overlay, the NUverseMark at 88px, a two-line gradient headline, and four campus feature pills. The right panel hosts the form `<Outlet />` on a clean `bg-surface` background. Star field (dark mode) renders behind both panels as before.
- **Route-aware left panel**: `AuthLayout` reads `useLocation().pathname` and selects `LOGIN_PANEL` or `REGISTER_PANEL` config at render time — different orb colors (blue/gold for login, blue/purple/pink for register), different eyebrow text, and different headline copy. No prop drilling; the layout owns this concern.
- **`auth-panel-bg` CSS class**: A new CSS utility in `index.css` handles the left panel background — warm sky gradient in light mode, NU-blue radial gradient with deep `#0a0d14` base in dark mode. Replaces the previous approach of conditionally applying `.hero-bg-light` / `.hero-bg-dark` (which couldn't be combined into a single `dark:` variant).
- **`auth-cta-btn` CSS class**: Submit buttons for both auth forms use a shimmer-sweep pseudo-element (`::after`) that fires on `:hover`. Zero JS, zero extra DOM nodes — a pure CSS highlight sweep that signals interactivity and premium craft.
- **Gradient submit buttons**: Login button uses `#1f3a8a → #4a6ee8` (NU brand blue). Register button uses `#4a6ee8 → #8b5cf6 → #f59e0b` (blue-purple-gold) — visually distinct between the two pages, reinforcing their different personalities.
- **Password visibility toggle**: Both `LoginForm` and `RegisterForm` now render an `EyeIcon`/`EyeOffIcon` SVG toggle button via the existing `endAdornment` prop on `Input`. No new dependencies; plain inline SVG. `aria-label` toggles for screen readers.
- **Password strength meter (register only)**: `RegisterForm` reads `watch('password')` from react-hook-form and derives a 4-level strength result (Weak/Fair/Good/Strong) from length, uppercase, lowercase, and digit checks — matching the existing Zod schema rules. Four segment bars transition from `border` color to the strength color via CSS `transition-all duration-300`. The hint text disappears once the user starts typing (replaced by the meter).
- **Distinct page personality**: LoginPage projects "welcome back, familiar, calm" energy — blue gradient on "NUverse", subtext "Your campus universe awaits." RegisterPage projects "discovery, invitation, excitement" — purple-gold gradient on "account", NU Laguna community framing, info badge about `@national-u.edu.ph` email. Success state is fully redesigned: pulsing green ring icon + "Check your inbox" heading + gradient "Go to sign in" button.
- **No new npm dependencies**: All icons are inline SVG. Animations are CSS keyframes already in `index.css`. Password strength is a pure function.
- **Test updated**: `LoginForm.test.tsx` updated — button query changed from `/log in/i` → `/sign in/i`, and the password field label query changed from regex to exact string `'Password'` to avoid collision with the eye-button's `aria-label="Show password"`.

**Affected Files**
- `shared/layouts/AuthLayout.tsx` — full rewrite; split-screen layout, route-aware panel config
- `modules/auth/pages/LoginPage.tsx` — full rewrite; eyebrow + gradient heading + footer divider
- `modules/auth/pages/RegisterPage.tsx` — full rewrite; distinct heading gradient + NU email badge + redesigned success state
- `modules/auth/components/LoginForm.tsx` — password toggle, gradient CTA, inline SVG icons
- `modules/auth/components/RegisterForm.tsx` — password toggle, strength meter, distinct gradient CTA
- `modules/auth/components/LoginForm.test.tsx` — updated button/label queries
- `src/index.css` — added `.auth-panel-bg` and `.auth-cta-btn` (shimmer sweep) CSS classes

**Endpoints / Entities / Migrations**
None.

---

## [0.27.0] — 2026-05-30

### Landing Page Polish — Announcement Strip Removed, Marquee Replaced, Footer Links Corrected

**Business Purpose**
Removed two elements that undermined the professional character of the landing page: the gradient announcement strip ("NUverse is now live…") felt marketing-gimmicky rather than institutional, and the auto-scrolling marquee ticker — while technically fine — looked like a low-budget website feature rather than a premium product. Both are replaced with a static, clean module strip that communicates the same information (what modules are inside the app) with far more restraint and polish. The footer University column was also corrected: three links that shouldn't appear publicly (NU Laguna Official homepage, Facebook, Instagram) were removed, and the Admissions link was updated to the correct NU Laguna online application URL.

**Architecture Decisions**
- **Module strip is fully static** — no CSS animation, no JavaScript, no DOM duplication trick. Five pill-shaped labels in a single centered row with a `·` separator between them. The strip sits between the hero and the feature sections as a quiet "what's inside" signal. On mobile the pills wrap naturally.
- **`MARQUEE_ITEMS` array and `@keyframes marquee` are now dead code.** The keyframe remains in `index.css` (it was added in v0.25.0) — removing it is a future cleanup; it causes no harm. The `marquee-track` class is no longer used anywhere.
- **Announcement strip removal is unconditional** — no feature flag or props, the `<div>` is simply gone from the render tree. The `gradient-shift` keyframe it used remains in `index.css` (still used by the full-width CTA section background).
- **Footer University column reduced to two links**: NUIS Portal and Admissions. The Admissions link is now an `<a href>` pointing to the NU Laguna online application system rather than a `mailto:` — `mailto:` links are discouraged on institutional landing pages as they depend on the user's mail client configuration.

**Affected Files**
- `modules/landing/pages/LandingPage.tsx`:
  - Removed: announcement strip `<div>` (gradient animated bar at page top)
  - Removed: `MARQUEE_ITEMS` constant
  - Removed: marquee ticker `<div>` with scrolling animation
  - Added: static module strip — 5 pill labels (Marketplace · Campus Events · Bulldog Exchange · Lost & Found · Bulldog Chibi) with `·` separators, centered, no motion
  - Footer University column: removed "NU Laguna Official", "Facebook Page", "Instagram" links; kept "NUIS Portal"; changed "Admissions" from `mailto:admissions@nu-laguna.edu.ph` to `https://onlineapp.nu-laguna.edu.ph/quest/home.php`

**Endpoints / Entities / Migrations**
None.

---

## [0.26.0] — 2026-05-30

### Suggestions & Feedback — Complete Removal (Backend + Frontend) · Landing Page Testimonials Removed

**Business Purpose**
Officially retired the Suggestions & Feedback feature from the product. The module has been removed from every layer of the stack: the Java module (controller, service, domain entities, repositories, DTOs), the XP reward wiring in the Chibi system, and all remaining frontend artifacts. The "Student Voices / What Bulldogs are saying" testimonials section was also removed from the landing page — as illustrative placeholder content, it adds no institutional credibility and is cleaner without it.

**Architecture Decisions**

- **Flyway migration files V10 and V14 are intentionally kept.** Deleting applied migration scripts from `db/migration/` causes Flyway to throw a `MissingMigrationsException` on startup if those versions are recorded in the `flyway_schema_history` table. Since the dev Codespace database has already run these migrations, removing the files would break startup. The `suggestions` and `suggestion_votes` tables remain in the schema as inert, empty tables — this causes no functional harm. A future cleanup migration (`V15__drop_suggestions.sql`) could drop them when the project is archived.
- **`POST_SUGGESTION` removed from `XpSource` and `XpStrategyFactory` together.** The `XpStrategyFactory.forSource()` is a complete switch expression (`switch` without a default) — removing `POST_SUGGESTION` from `XpSource` would cause a compile error in `XpStrategyFactory` if the `case` was not also removed. Both edits were made atomically. No `XpEvent` with source `POST_SUGGESTION` was ever fired (the `SuggestionServiceImpl` never called the Chibi service), so no existing XP data is affected.
- **Backend module directory deleted entirely** (`rm -rf modules/suggestions/`). This removes all 9 files cleanly in one operation rather than file-by-file, and leaves no orphaned packages or empty directories.
- **Testimonials section removed from `LandingPage.tsx` completely** — the `TESTIMONIALS` data array and the entire `<section>` block are gone. The landing page now flows directly from the stats strip into the full-width CTA section.

**Domain Rules**
- The Suggestions & Feedback feature no longer exists in any form. No route, no nav link, no controller endpoint, no domain entities in the Spring context.
- XP can no longer be awarded for `POST_SUGGESTION`. The enum value is gone from the codebase. Any `chibi_xp_events` rows with `source = 'POST_SUGGESTION'` in the database are harmless legacy data (the column is a `VARCHAR`, not a FK).

**Affected Files**

*Backend — deleted:*
- `modules/suggestions/application/SuggestionService.java`
- `modules/suggestions/application/SuggestionServiceImpl.java`
- `modules/suggestions/controller/SuggestionController.java`
- `modules/suggestions/domain/Suggestion.java`
- `modules/suggestions/domain/SuggestionStatus.java`
- `modules/suggestions/domain/SuggestionVote.java`
- `modules/suggestions/dto/SuggestionResponse.java`
- `modules/suggestions/repository/SuggestionRepository.java`
- `modules/suggestions/repository/SuggestionVoteRepository.java`

*Backend — edited:*
- `modules/chibi/domain/XpSource.java` — `POST_SUGGESTION` enum constant removed
- `modules/chibi/domain/XpStrategyFactory.java` — `case POST_SUGGESTION -> level -> 25` removed

*Backend — kept (unchanged):*
- `db/migration/V10__suggestions.sql` — retained to satisfy Flyway schema history
- `db/migration/V14__suggestion_votes_updated_at.sql` — retained for same reason

*Frontend — edited:*
- `modules/landing/pages/LandingPage.tsx` — `TESTIMONIALS` array and `<section>` ("Student Voices / What Bulldogs are saying") removed
- `shared/routes/AppRoutes.tsx` — already removed in v0.25.0
- `shared/layouts/AppLayout.tsx` — nav entry already removed in v0.25.0

**Endpoints Removed**
| Method | Path | Was | Now |
|--------|------|-----|-----|
| GET | `/api/suggestions` | paginated suggestion list | **404 — no handler** |
| POST | `/api/suggestions` | create suggestion | **404 — no handler** |
| POST | `/api/suggestions/{id}/vote` | upvote | **404 — no handler** |
| DELETE | `/api/suggestions/{id}/vote` | remove vote | **404 — no handler** |
| PATCH | `/api/suggestions/{id}/status` | admin status update | **404 — no handler** |

**Entities Removed**
- `Suggestion` — `suggestions` table still exists in DB (inert)
- `SuggestionVote` — `suggestion_votes` table still exists in DB (inert)
- `SuggestionStatus` enum — `OPEN`, `UNDER_REVIEW`, `ACCEPTED`, `DECLINED`, `DONE`

**Migrations**
None added. V10 and V14 retained.

---

## [0.25.0] — 2026-05-30

### World-Class Frontend Redesign — Landing Page, Navigation, Dashboard, Suggestions Removal, NUIS Link Fix

**Business Purpose**
Elevated the entire frontend to a professional, institutional-grade product that could represent NU Laguna publicly. The previous landing page looked like a student project — colorful bento grids, generic copy, no social proof, no product detail. This version replaces every section with deliberate, high-craft work: a live announcement bar establishing institutional credibility, four detailed feature sections with working HTML UI mockups (browser chrome included), a stats strip, testimonials, and a cinematic full-width gradient CTA. The authenticated shell is also refined — navigation now uses a colored pill active state, the user avatar is visible in the header, and the Dashboard greeting carries real contextual detail. Suggestions & Feedback was removed from the navigation and routes (per product decision) and the NUIS external link was corrected to the actual NU Laguna online portal URL.

**Architecture Decisions**

- **Landing page is entirely self-contained.** All UI mockups (`MarketplacePreview`, `EventsPreview`, `ExchangePreview`, `ChibiPreview`) are declared as sibling functions inside `LandingPage.tsx`. They are pure presentational components that accept only `isDark: boolean` — no API calls, no Zustand, no TanStack Query. This keeps the landing page fast and completely independent of the app's server state.
- **UI mockups use inline CSS variables for theming** rather than Tailwind dark-mode variants, because `LandingPage` is rendered outside `AppLayout` and dark mode is passed down explicitly from `useThemeStore`. All `background`, `borderColor`, and `color` values are computed from `isDark` and expressed as inline style objects.
- **Marquee ticker is a CSS-only infinite scroll.** The `MARQUEE_ITEMS` array is duplicated inside the rendered `<div>` (two copies of 12 items = 24 items). The `marquee` keyframe moves the container from `translateX(0)` to `translateX(-50%)`, creating a seamless loop at exactly half the total width. No JS `requestAnimationFrame`, no library. Added to `index.css`.
- **Announcement strip uses the existing `gradient-shift` keyframe** (already in `index.css`) to animate a moving gradient across the background — the strip's `backgroundSize: '200% 100%'` makes the gradient sweep visible as it cycles.
- **Feature sections use a `data-reveal` IntersectionObserver pattern** (same philosophy as the prior `data-stagger` approach) — elements start at `opacity: 0; transform: translateY(40px)` and transition to visible when 10% of the element enters the viewport. The stagger delay is `i * 100ms` per section.
- **`featureSections` array drives the section rendering loop.** Each entry carries: `eyebrow`, `headline`, `body`, `tags`, `align` ('left'/'right'), `preview` (a pre-rendered JSX node), and `accent` color hex. The loop alternates text/preview order via `lg:order-last` / `lg:order-first` based on `align`. This means adding or reordering modules requires only editing the data array.
- **Suggestions route removed cleanly.** The `SuggestionsPage` lazy import and `<Route>` were removed from `AppRoutes.tsx`. The nav entry was removed from `AppLayout.tsx`'s `NAV_LINKS`. The `paths.suggestions` path constant is kept in `paths.ts` (backend routes are untouched) — removing it would require updating `SuggestionsPage` references in the admin panel and notification system.
- **AppLayout nav active state: colored pill replaces bottom underline.** Previously the active item showed `text-foreground font-semibold` plus a `<span>` absolutely positioned at `-bottom-[13px]` with a gradient. This required the nav `<li>` to be `relative` and the bottom offset to match the nav's `py-2.5` exactly — a fragile coupling. The pill approach (`bg-primary/10 text-primary`) is self-contained in the `className` function, zero positioning required.
- **`UserAvatar` component in AppLayout** derives initials from `user.fullName.split(' ').slice(0,2).map(w=>w[0]).join('')` — handles single-name accounts gracefully (produces one initial). Styled with the same gradient as the primary CTA button for brand consistency.
- **Footer is dark-on-dark** (`#0f1f5c` / `#070a12`) for both light and dark modes. This is a deliberate product decision: an institutional dark footer on a landing page signals permanence and professionalism regardless of the user's OS theme. The footer is inside `LandingPage`, not `AppLayout`, so it does not affect authenticated pages.

**Domain Rules**
- Suggestions & Feedback module is hidden from all frontend navigation and routing. The backend API (`/api/suggestions/**`) remains intact and functional — data is preserved. A future release can restore the frontend without a migration.
- The NUIS external link now points to `https://onlineapp.nu-laguna.edu.ph/portal/services.php` (NU Laguna's actual online portal). The previous URL (`nuis.nu.edu.ph`) was the wrong domain. Button text updated to "Access NU Online Portal ↗".
- Landing page is `public` — unauthenticated users see the full page; authenticated users are redirected to `/home`. This does not change.
- All landing page testimonials and statistics are illustrative (not live from the DB) — these are aspirational/demo values appropriate for a school project presentation.

**Affected Modules**

*Landing page (`modules/landing/pages/LandingPage.tsx`) — complete rewrite:*
- Announcement strip (gradient animated bar) at document top
- Hero: stronger light-mode gradient (`#c7d7fe → #ddd6fe → #fde68a → #d1fae5`), stats row (5 modules / 100% verified / ₱0 fees / ∞ possibilities), improved hero description copy, login card unchanged
- Marquee ticker: 12-item infinite scroll strip between hero and features
- 4 feature sections replacing the bento grid and editorial "01/02/03" sections:
  - **Module 01 Marketplace**: shows a browser-chrome mockup with search bar, filter tabs, and 4 NU-relevant product cards (Engineering Books ₱850, Casio Calculator ₱1,200, BSIT Uniform ₱350, Lab Coat ₱480)
  - **Module 02 Campus Events**: shows 3 NU Laguna event cards with live gradient capacity bars (Battle of Bands 71%, Dean's Hour Talk 37%, Engineering Sports Fest 74%)
  - **Module 03 Bulldog Exchange**: shows official merch grid (NU Basketball Jersey ₱1,500, Engineering Polo ₱850, Campus Bag ₱1,200, NU Cap ₱450) with "OFFICIAL STORE" badge
  - **Module 04 Bulldog Chibi**: shows XP profile card (Bianca R., Level 8, 2,450 XP, 65% to Level 9) and a 6-cell achievements grid (3 unlocked, 3 locked)
- Stats strip: 4 gradient-text numbers (5 / 100% / 0 / ∞) with descriptions
- Testimonials: 3 student cards (Bianca Reyes BSIT-2, Miguel Santos BSBA-3, Princess Dela Cruz BSECE-1)
- Full-width gradient CTA section (was a centered box — now a full-viewport-width gradient panel with orbs and dot grid)
- Footer redesigned: dark navy `#0f1f5c` background, 4-column layout (Brand + social links · Platform · University links · Contact), white-on-dark type
- Footer bottom bar: removed "National University Laguna · Built by students, for students"; now "© 2026 NUverse Laguna — All Rights Reserved" + "Powered by Bulldogs ✦"

*AppLayout (`shared/layouts/AppLayout.tsx`):*
- `NavItem`: active state changed from text-only + absolute bottom-border span → `bg-primary/10 text-primary font-semibold` pill; inactive adds `hover:bg-surface-muted`
- `UserAvatar` component added: gradient circle with 1–2 initials; replaces plain first-name text in header
- Header gradient strip: 2px decorative gradient line at header bottom edge (`primary → accent → transparent`)
- Header background: more opaque (`rgba(10,13,20,0.88)` dark / `rgba(255,255,255,0.92)` light), refined box-shadow
- Mobile menu: user card with avatar + role displayed at top of drawer; Settings link added as text link; improved border/background treatment; `page-enter` slide animation on open

*DashboardPage (`modules/dashboard/pages/DashboardPage.tsx`):*
- Greeting banner: mesh gradient with radial orbs + decorative `NU` watermark (opacity 0.035), role pill, date line, contextual sub-headline per time of day (e.g. "A fresh start. Let's see what's on campus today.")
- `CATEGORY_META` map provides both color gradient and emoji icon per event category — replaces the inline ternary chains
- Event cards: added capacity progress bar (fill % derived from `rsvpCount/capacity`) with mono percentage label
- Quick actions: 6-column grid on desktop (was mixed 2/4-col), each card has inner top-highlight strip + radial hover glow + per-module `glowColor` box-shadow
- `SectionHeader`: "View all" link now uses a rounded-lg pill with `hover:bg-primary/8`
- Empty states: added relevant emoji icons above text

*AppRoutes (`shared/routes/AppRoutes.tsx`):*
- Removed `SuggestionsPage` lazy import
- Removed `/suggestions` route

*NuisPage (`modules/nuis/pages/NuisPage.tsx`):*
- External href corrected to `https://onlineapp.nu-laguna.edu.ph/portal/services.php`
- Button label updated to "Access NU Online Portal ↗"

*index.css:*
- Added `@keyframes marquee` (translate 0% → -50% for infinite ticker)
- `gradient-shift` keyframe already existed — reused for announcement strip and CTA section background animation

**Endpoints / Entities / Migrations**
None. This release is entirely frontend. No new API endpoints, no entity changes, no Flyway migrations. The Suggestions backend (`/api/suggestions/**`) remains fully intact.

---

## [0.24.0] — 2026-05-30

### Full Frontend Design Elevation — 14-Phase UI/UX Overhaul

**Business Purpose**
Closed the gap between the polished landing page experience and the flat authenticated interior. Every module now has its own atmospheric identity, card interactions feel premium and tactile, the profile page communicates personal identity, the Bulldog Companion is more alive, and the Chibi/Suggestions pages have game-quality polish. The app now delivers a consistent "flagship product" feel end-to-end.

**Architecture Decisions**
- Two new reusable hooks extracted to `shared/hooks/`: `useCountUp` (easeOut cubic count animation) and `useTilt` (mouse-position 3D perspective tilt). Both are zero-dependency, pure React.
- `useTilt` uses `perspective(900px) rotateX/Y` on the anchor element itself — no wrapper needed, works with `Link` via `ref` forwarding.
- `useCountUp` uses `requestAnimationFrame` internally; safe to call with `target=0` (instant reset). Applied at component mount, re-animates on `target` change.
- `ProfileHeader` is now a self-contained card with cover band — consuming pages (`MyProfilePage`, `PublicProfilePage`) no longer wrap it in `<Card>`. Skeletons updated to match the new cover band layout.
- Atmospheric page headers use `-mx-4 -mt-8 px-4 pt-8` negative margin bleed to span full content width without layout changes to `AppLayout`.
- `FlyingBulldog` on the landing page is a stateful component (`visible` → false after 3.2s) so it removes itself from the DOM after animation, leaving no residual layout cost.
- Sparkle burst particles on vote use CSS custom properties (`--tx`, `--ty`) driven by index-based trig to scatter 3 stars outward. No JS animation loop.
- `BulldogCompanion` eye-tracking uses a single `window.addEventListener('mousemove')` with passive:true; offset is clamped to `factor * 3px` via normalized direction vector.

**Domain Rules**
- `ProfileHeader` now always renders its own card container — never nest inside another `<Card>`.
- `useCountUp` is for display only; never use animated values in business logic or API calls.
- `useTilt` max tilt is 5–6° — do not increase beyond 8° (causes motion discomfort on large cards).
- Flying Bulldog shows once per page load only (component unmounts after animation); it is not persisted to `localStorage`.
- Atmospheric page headers bleed with `-mx-4 sm:-mx-6` to match the `AppLayout` padding — do not change `AppLayout` padding without updating all page headers.

**Affected Modules**
- `shared/components/ui/Card.tsx` — added `transition-all duration-200` to base card
- `shared/layouts/AppLayout.tsx` — active nav item: gradient underline bar replaces `bg-surface-muted`
- `shared/hooks/useCountUp.ts` — new hook (count-up animation)
- `shared/hooks/useTilt.ts` — new hook (3D card perspective tilt)
- `shared/components/BulldogCompanion.tsx` — gold gradient border ring, cloud-tail thought bubble, NU jersey on SVG, cursor eye-tracking, idle-bob inside button
- `modules/dashboard/pages/DashboardPage.tsx` — vivid greeting card with gradient, "NU" watermark, role pill badge
- `modules/profile/components/ProfileHeader.tsx` — gradient cover band (blue→purple→gold), avatar overlapping cover edge, font-mono stats, new card container
- `modules/profile/pages/MyProfilePage.tsx` — removed outer `<Card>` wrapper, updated skeleton
- `modules/profile/pages/PublicProfilePage.tsx` — removed outer `<Card>` wrapper
- `modules/events/components/EventCard.tsx` — category gradient accent strip, hover lift
- `modules/events/pages/EventsPage.tsx` — atmospheric header with category-reactive color, live event count pill
- `modules/marketplace/components/ListingCard.tsx` — hover lift, `font-mono tabular-nums text-accent` price, title hover color, `useTilt`
- `modules/marketplace/pages/MarketplacePage.tsx` — emerald atmospheric header, live listing count pill
- `modules/bulldog-exchange/components/ProductCard.tsx` — hover lift, font-mono price, `useTilt`
- `modules/lost-found/pages/LostFoundPage.tsx` — amber radial atmospheric header
- `modules/suggestions/pages/SuggestionsPage.tsx` — sky-blue atmospheric header, `SuggestionsStatsBar` with `useCountUp`, sparkle-burst on upvote, voted card ring highlight
- `modules/chibi/pages/ChibiPage.tsx` — `useCountUp` on all 3 stats, trophy-room achievements (glow + lock overlay + icon drop-shadow), XP earn list as game item cards
- `modules/landing/pages/LandingPage.tsx` — `FlyingBulldog` Superman-pose entry animation across hero on load
- `index.css` — `fly-across` and `sparkle-burst` keyframes added

**Endpoints / Entities / Migrations**
None. This release is purely frontend — no new API endpoints, no entity changes, no Flyway migrations.

---

## [0.23.0] — 2026-05-30

### Major Landing Page & Brand Overhaul

**Business Purpose**
Complete visual overhaul of the first impression — the landing page and brand mark now feel premium, iconic, and campus-energetic rather than generic. The login form is embedded in the hero so sign-in is immediate. Footer adds real NU Laguna contact details and official social links.

**Architecture Decisions**
- Login embedded directly in `LandingPage` via `HeroLoginForm` (uses same `useLogin` hook as `LoginPage`). `/login` route still exists for direct access.
- All background effects remain CSS-only (no Three.js, no extra deps).
- `NUverseMark` SVG viewBox expanded from 36×36 to 80×80 for bulldog face detail at larger sizes.
- `ThemeToggle` state moved to local `useState(bursting)` for the click animation; theme state still from Zustand.

**Domain Rules**
- Landing page is `public` — does not require auth, redirects authenticated users to `/home`.
- Social links use `target="_blank" rel="noopener noreferrer"` for security.
- NU Laguna contact info hardcoded (official data, not from DB).

**Affected Files**
- `frontend/src/shared/components/NUverseMark.tsx` — full redesign: 3D sphere, bulldog face, Y2K chrome ring, sparkles
- `frontend/src/shared/components/ThemeToggle.tsx` — animated sun/moon icons with hover/click effects
- `frontend/src/modules/landing/pages/LandingPage.tsx` — complete rebuild: split hero, inline login, anime bg, footer with contact + social
- `frontend/src/index.css` — 14 new keyframe animations + hero bg utility classes
- `frontend/public/favicon.svg` — replaced with branded bulldog-sphere mark

**Visual Changes**
- Hero: 2-column split (brand left, login card right). Collapses to vertical stack on mobile.
- Light mode: Anime sky gradient + diagonal god rays + dot grid + warm orbs
- Dark mode: Aurora bands + wireframe geometric shapes + star field
- Logo: 3D-lit NU blue sphere + front-facing bulldog face (gold, expressive) + iridescent Y2K chrome ring + sparkles
- ThemeToggle: Sun (gold rays, spin-on-hover) / Moon (silver crescent + star dots)
- Footer: NUverse brand + contact info block + SVG social icons (FB/IG/X/TikTok/LinkedIn) + copyright

---

## [0.22.1] — 2026-05-30

### Hotfix — Backend startup failures and null principal bugs

**Business Purpose**
Fixed 4 bugs that prevented the backend from starting and broke 4 API modules (Chibi, Lost & Found, Suggestions, Announcements).

**Fixes**

1. **V12 migration** — `chibi_achievements` was created in V11 without `created_at`/`updated_at` columns that `BaseEntity` requires. Added both via `ALTER TABLE … ADD COLUMN IF NOT EXISTS`.

2. **V13 migration** — `chibi_xp_events` was created in V11 without `updated_at`. Added via migration.

3. **V14 migration** — `suggestion_votes` was created in V10 without `updated_at`. Added via migration.

4. **Controller `@AuthenticationPrincipal UUID` bug** — `JwtAuthFilter` stores the principal as a `String` in the `SecurityContext`. Four controllers used `@AuthenticationPrincipal UUID userId` which resolves to `null` on type mismatch, causing `null` to be passed into services → null-not-null constraint violations. Fixed all 4 controllers to use `Authentication auth` + `UUID.fromString((String) auth.getPrincipal())`:
   - `ChibiController`
   - `LostFoundController`
   - `SuggestionController`
   - `AnnouncementController`

5. **Test fix** — `ProfileServiceImplTest` was missing the `ApplicationEventPublisher` mock argument added to `ProfileServiceImpl` in a prior session. Added `@Mock ApplicationEventPublisher eventPublisher` and updated constructor call.

**Affected Files**
- `db/migration/V12__chibi_achievements_audit.sql` (new)
- `db/migration/V13__chibi_xp_events_updated_at.sql` (new)
- `db/migration/V14__suggestion_votes_updated_at.sql` (new)
- `modules/chibi/controller/ChibiController.java`
- `modules/lostfound/controller/LostFoundController.java`
- `modules/suggestions/controller/SuggestionController.java`
- `modules/announcements/controller/AnnouncementController.java`
- `test/.../ProfileServiceImplTest.java`

---

## [0.22.0] — 2026-05-30

### Polish Sprint — Confetti, Leave Guard, Skeleton Loaders, Inspire & NUIS Pages

**Business Purpose**
Completed all remaining demo polish items: milestone moments now celebrate with confetti (RSVP, reservation, level-up), accidental navigation away from unsaved forms is prevented, every content page now shows a content-shaped skeleton instead of a spinner while loading, and two static info pages (Inspire Sports Academy and NUIS Integration) are accessible from the dashboard.

**Architecture Decisions**

**Confetti (CSS-only, portal-rendered)**
Created `shared/components/Confetti.tsx` — a portal-rendered component that generates 60 colored pieces using inline keyframe animations injected per-piece (avoids global CSS namespace pollution). Each piece has randomized: horizontal position, fall duration (2–3.2s), horizontal drift, rotation speed and direction, size, and shape (rect / circle / ribbon). Color palette uses the app's design tokens (NU blues, gold, green, rose, purple, cyan). The component auto-calls `onDone` after the longest animation completes and unmounts cleanly. Three wiring points:
- `RsvpButton` — fires confetti in the `rsvp.mutate` `onSuccess` callback
- `ProductDetailPage` — fires confetti on reservation `onSuccess`
- `ChibiPage` — detects level-up by comparing `profile.level` against `localStorage('nuverse_chibi_last_level')`; on first load the stored level is set without confetti; on subsequent loads where `level > storedLevel`, confetti fires and the stored level updates

**Leave Guard (React Router v7 `useBlocker`)**
Created `shared/hooks/useLeaveGuard(isDirty: boolean)`:
- Calls `useBlocker(isDirty)` — when `blocker.state === 'blocked'`, shows the browser's native confirm dialog; on confirm calls `blocker.proceed()`, on cancel calls `blocker.reset()`
- Separately adds a `beforeunload` event listener while dirty (handles tab close / hard refresh)
- Each form page tracks `isDirty` via a `useState(false)` + `onInput` event bubble on the wrapping div. `isDirty` resets to `false` on successful submit.
- Wired to: `CreateListingPage`, `EditListingPage`, `CreateEventPage`, `EditEventPage`, `CreateProductPage`, `EditProfilePage`

**Skeleton Loaders (content-shaped, replacing all spinners in main content areas)**
Rule: `<Loader>` is appropriate only for micro-loads (modal internals, non-critical). Page-level and grid-level loads get content-shaped skeletons using the existing `.skeleton` CSS class (shimmer animation via `box-shadow` spread).
- `ListingGrid` → 8-card skeleton grid (image placeholder + title + price)
- `EventGrid` → 6-card skeleton grid (image + title + badges row)
- `ProductGrid` → 8-card skeleton grid (image + title + price)
- `ListingDetailPage` → 2-column skeleton (large image left, title/price/actions right)
- `EventDetailPage` → stacked skeleton (badges + title + cover + info grid + CTA)
- `ProductDetailPage` → 2-column skeleton (image left, title/variants/CTA right)
- `MyProfilePage` → horizontal skeleton (avatar circle + name/course/stats)
- `PublicProfilePage` → same layout + follow button placeholder
- `EditProfilePage` → form field skeletons (label + input × 5)
- `EditListingPage` / `EditEventPage` → form field skeletons while listing/event loads

**Inspire Sports Academy (`/inspire`)**
Static informational page showcasing NU Laguna's athletic programs: three program cards (Varsity, Intramural, Fitness & Wellness), sports schedule grid (8 sports × schedule), facilities section (8 items), and a CTA section. Accessible from the dashboard quick-action grid (new "Sports" tile, red/orange gradient).

**NUIS Integration (`/nuis`)**
Static redirect page for the NU Information System. Explains what NUIS does (6 feature tiles: Records, Payments, Enrollment, Grades, Notices, Graduation Status), a primary CTA button opening `nuis.nu.edu.ph` in a new tab, and a contact fallback note. Accessible from the dashboard quick-action grid (new "NUIS" tile, slate gradient).

**Domain Rules**
- `DevEmailService` and `LocalStorageService` remain unchanged — no production services introduced
- No new backend endpoints — all new features are pure frontend

**Affected Modules**
- `shared/components/Confetti.tsx` (new)
- `shared/hooks/useLeaveGuard.ts` (new)
- `modules/events/components/RsvpButton.tsx` (confetti)
- `modules/bulldog-exchange/pages/ProductDetailPage.tsx` (confetti + skeleton)
- `modules/chibi/pages/ChibiPage.tsx` (confetti level-up detection)
- `modules/marketplace/pages/CreateListingPage.tsx` (leave guard)
- `modules/marketplace/pages/EditListingPage.tsx` (leave guard + skeleton)
- `modules/marketplace/components/ListingGrid.tsx` (skeleton)
- `modules/marketplace/pages/ListingDetailPage.tsx` (skeleton)
- `modules/events/pages/CreateEventPage.tsx` (leave guard)
- `modules/events/pages/EditEventPage.tsx` (leave guard + skeleton)
- `modules/events/components/EventGrid.tsx` (skeleton)
- `modules/events/pages/EventDetailPage.tsx` (skeleton)
- `modules/bulldog-exchange/components/ProductGrid.tsx` (skeleton)
- `modules/bulldog-exchange/pages/CreateProductPage.tsx` (leave guard)
- `modules/profile/pages/MyProfilePage.tsx` (skeleton)
- `modules/profile/pages/PublicProfilePage.tsx` (skeleton)
- `modules/profile/pages/EditProfilePage.tsx` (leave guard + skeleton)
- `modules/inspire/pages/InspirePage.tsx` (new)
- `modules/nuis/pages/NuisPage.tsx` (new)
- `shared/routes/paths.ts` (inspire + nuis paths)
- `shared/routes/AppRoutes.tsx` (inspire + nuis routes)
- `modules/dashboard/pages/DashboardPage.tsx` (Sports + NUIS quick-action tiles)

---

## [0.21.0] — 2026-05-30

### Polish Sprint — Animation consistency, correctness fixes, idle logout, 404 page, UX enhancements

**Business Purpose**
Closed all remaining UX and correctness gaps identified in the post-v0.20 audit. Every page now animates in consistently, SVG rendering is correct across pages, security-conscious idle logout is active, unknown routes show a branded experience, and key forms have character feedback plus shareable links.

**Architecture Decisions**

**Phase 1 — Page-enter animation consistency**
The `animate-[page-enter_0.3s_ease-out]` class was applied only to 7 of the 19+ authenticated pages. Added it uniformly to all missing pages: MarketplacePage, ListingDetailPage, MyListingsPage, SavedListingsPage, CreateListingPage, EditListingPage, EventsPage, EventDetailPage, MyRsvpsPage, CreateEventPage, EditEventPage, BulldogExchangePage, ProductDetailPage, MyReservationsPage, CreateProductPage, NotificationsPage, MyProfilePage, PublicProfilePage, EditProfilePage. Pages that return a `<Card>` as root received the class on the card itself; pages that return a `<div>` received it on the div.

**Phase 2 — SVG gradient ID de-collision**
SVG gradient IDs are global per document. `NUverseMark` and `ChibiPage.ChibiAvatar` both defined `snout-grad` with different colors — whichever rendered second would corrupt the other's gradient. Fixed by namespacing: NUverseMark IDs now carry an `nm-` prefix (`nm-ring-grad`, `nm-core-grad`, `nm-dog-grad`, `nm-snout-grad`). ChibiAvatar IDs carry a `ca-` prefix (`ca-head-grad`, `ca-body-grad`, `ca-ear-grad`, `ca-snout-grad`, `ca-collar-grad`, `ca-badge-grad`).

**Phase 3 — Auto-logout idle timer**
Created `src/shared/hooks/useIdleTimer.ts` — listens to mousemove, mousedown, keydown, touchstart, and scroll events. Checks every 30 seconds. At 9 minutes idle: fires a warning toast. At 10 minutes: calls logout, navigates to `/login`, and shows an info toast. Callback refs are kept current with `useRef` to avoid stale closure bugs. Wired into `AppLayout` via `useIdleTimer({ onIdle, onWarn })`.

**Phase 4 — Branded 404 page**
Replaced the silent `<Navigate to="/home" replace />` wildcard with a `NotFoundPage` component. Shows the NUverseMark logo, a sad bulldog SVG with a teardrop, a large "404" in JetBrains Mono, and two CTA buttons (Back to Home, Browse Marketplace). Inherits the star field in dark mode.

**Phase 5 — Copy link + character counters**
- **Copy link**: Added "🔗 Copy Link" button to `EventDetailPage` (in header alongside Edit) and `ListingDetailPage` (alongside the back navigation). Uses `navigator.clipboard.writeText(window.location.href)` + `toast.success` confirmation.
- **Character counters**: Added to `SuggestionsPage` title (max 100, hard cap enforced on `onChange`) and description (max 500). Added to `LostFoundPage` item name (shows `/200` from Zod schema) and description. Counters turn red at 90% capacity.

**Pre-existing TypeScript errors fixed** (blocked `vite build`):
- `LostFoundPage` — removed unused `Card` import
- `NotificationItem` — removed unused `exchangeProductPath` import
- `SuggestionsPage` — removed unused `user`/`useAuthStore` (page has no role-gated UI)
- `BulldogCompanion` — removed unused `useCallback` import and `collapsed`/`setCollapsed` state
- `Toast` — replaced `JSX.Element` type with `ReactElement` (JSX namespace not available without `react/jsx-runtime` types)

**Affected Modules**
- All 19 authenticated page components (animation)
- `shared/components/NUverseMark.tsx` (gradient ID fix)
- `modules/chibi/pages/ChibiPage.tsx` (gradient ID fix)
- `shared/hooks/useIdleTimer.ts` (new)
- `shared/layouts/AppLayout.tsx` (idle timer wiring)
- `shared/pages/NotFoundPage.tsx` (new)
- `shared/routes/AppRoutes.tsx` (404 route)
- `modules/events/pages/EventDetailPage.tsx` (copy link)
- `modules/marketplace/pages/ListingDetailPage.tsx` (copy link)
- `modules/suggestions/pages/SuggestionsPage.tsx` (char counters + TS fix)
- `modules/lost-found/pages/LostFoundPage.tsx` (char counters + TS fix)
- `shared/components/ui/Toast.tsx` (TS fix)
- `shared/components/BulldogCompanion.tsx` (TS fix)
- `modules/notifications/components/NotificationItem.tsx` (TS fix)

---

## [0.20.0] — 2026-05-30

### Full Demo Build — P0 through P4 implementation sprint

**Business Purpose**
Transformed NUverse Laguna from a 6-module skeleton (v0.13.0) into a fully demonstrable campus ecosystem. The sprint covered every remaining priority tier: visual identity overhaul, demo seed data, 4 new full-stack modules, gamification, admin tooling, and a persistent Bulldog companion. The app is now ready for a live finals demo with real data, real navigation, and a distinctive visual identity.

**Architecture Decisions**

**P0 — Visual Identity + Foundation**
- **Plus Jakarta Sans** (headings, body) + **JetBrains Mono** (numbers, prices, XP) via Google Fonts. `index.css` updated with `@import url(...)` and `--font-sans`/`--font-mono` CSS variables exposed to Tailwind's `@theme inline` block.
- **Star field in dark mode** — three CSS layers (`stars-1/2/3`) using `box-shadow` spread technique. Zero JS, zero DOM overhead. Layers have independent twinkle keyframe animations (4s/6s/8s). Only visible when `.dark` class is active on `<html>`.
- **Deep night sky** — dark bg deepened from `#0f1117` to `#0a0d14`, surfaces adjusted for consistency.
- **`NUverseMark` SVG component** — circle + dashed orbital ring + flying Bulldog in NU gold. Composable (`size`, `showWordmark` props). Replaces the blue-box "N" logo everywhere.
- **`AppLayout` rewrite** — sticky frosted header (`bg-surface/90 backdrop-blur-sm`), `NUverseMark`, hamburger mobile nav (useState toggle, full-width drawer), admin-only nav link, settings gear icon, star field, announcement banner, BulldogCompanion.
- **Page-enter animation** (`page-enter 0.3s ease-out`) defined in `index.css` and applied to every page root.
- **`DevDataSeeder.java`** — runs under `@Profile("dev")`. Creates 5 pre-verified accounts (ADMIN, FACULTY, 3×STUDENT), 5 published campus events, 7 marketplace listings, 5 exchange products with 15 variants. Idempotent (checks for admin email first). `User.createSeeded()` static factory added (sets ACTIVE status + explicit role, no verification token).
- Spring profile defaulted to `dev` via `${SPRING_PROFILES_ACTIVE:dev}`.

**P1 — Broken Features Fixed**
- **Toast system** — `useToastStore` (Zustand), `ToastContainer` (bottom-right, max 3 stacked). Progress bar countdown. Slide-in animation. `toast.success/error/info/warning()` singleton for imperative use anywhere. Mounted in `App.tsx`.
- **React `ErrorBoundary`** — catches render errors, shows branded bulldog error page with "Back to Home" button. Wraps entire app tree in `App.tsx`.
- **`NEW_FOLLOWER` notification** — `UserFollowedEvent` record added to `shared/event`. `ProfileServiceImpl.follow()` now publishes this event after saving the `Follow` entity. `NotificationEventListener.onUserFollowed()` creates the `NEW_FOLLOWER` notification (recipient = the followed user, referenceId = follower's UUID, referenceType = `USER_PROFILE`).
- **Notification click navigation** — `NotificationItem` updated with `buildNavTarget()` helper mapping `ReferenceType` → route. Clicking a notification marks it read + navigates to the referenced item. Frontend `types.ts` updated: added `EVENT_RSVP` notification type, `EVENT` reference type.

**P2 — New Modules**
- **Landing page** (`/`) — full-screen hero with animated mesh gradient, 4 floating CSS orbs, star field (dark), `NUverseMark` entrance, gradient headline "Your Campus. Your Universe.", module showcase grid with stagger IntersectionObserver animation, "Why NUverse?" section, final CTA card, footer. `PublicOnlyRoute` updated to accept children + optional `redirectTo` prop. Dashboard moved to `/home`; landing at `/` redirects authenticated users to `/home`.
- **Home Dashboard** — replaced "coming soon" with: time-of-day greeting, quick action grid (4 cards with gradients), upcoming events column (live from API), recent listings column (live from API). Uses TanStack Query with 2-min staleTime.
- **Emergency Announcements** (V8 migration, `announcements` module) — `AnnouncementPriority` enum (GENERAL/IMPORTANT/CRITICAL), `EmergencyAnnouncement` entity with `isEffective()` domain method, `AnnouncementRepository.findEffective()` (JPQL with expiry check), full CRUD controller (admin/faculty gated), `/api/announcements/active` public endpoint. Frontend: `AnnouncementBanner` component mounted at top of `AppLayout`, fetches active announcements, shows highest-priority first, auto-refreshes every 2 min, dismissible per session (CRITICAL re-appears).
- **Lost & Found** (V9 migration, `lostfound` module) — `ItemType` (LOST/FOUND), `ItemStatus` (OPEN/RESOLVED), `LostFoundItem` entity with `resolve()` domain method, repository with type/status filtering, full REST controller. Frontend: warm amber/green themed cards, filter tabs (ALL/LOST/FOUND), post-item modal with form, "Mark Resolved" button for reporters. Routes: `/lost-found`.
- **Suggestions & Feedback** (V10 migration, `suggestions` module) — `Suggestion` entity with `incrementVotes()`/`decrementVotes()`, `SuggestionVote` junction entity, vote uniqueness enforced at DB + service layer, status lifecycle (OPEN/UNDER_REVIEW/ACCEPTED/DECLINED/DONE), admin status-update endpoint. Frontend: ProductHunt-style upvote column, optimistic vote toggle with cache update, stats bar (idea count, total votes, in-progress count), post-idea modal. Routes: `/suggestions`.
- **Settings page** (`/settings`) — three-section layout: Account (display-only user info + link to edit profile), Appearance (dark/light toggle with live preview card), Privacy (notification preference toggles). Uses `useThemeStore`. Route + gear-icon link in nav.

**P3 — Gamification + Companion**
- **Bulldog Chibi XP system** (V11 migration, `chibi` module) — Strategy Pattern: `XpStrategy` interface + `XpStrategyFactory` maps each `XpSource` enum value to a concrete strategy. `LevelCalculator` uses triangular-number formula (Level n = n×(n-1)/2×100 XP), max level 20, `titleFor(level)` returns tier label. `ChibiProfile`/`ChibiXpEvent`/`ChibiAchievement` entities. `ChibiServiceImpl` awards XP, calculates level, unlocks achievements. `ChibiXpEventListener` hooks into `UserRegisteredEvent`, `EventRsvpEvent`, `ReservationCreatedEvent`, `UserFollowedEvent` using the established AFTER_COMMIT + REQUIRES_NEW pattern. REST: `GET /api/chibi/me`, `GET /api/chibi/users/{id}`. Frontend: space/game aesthetic page with animated SVG Bulldog avatar, XP bar with shimmer, tier-based color system (10 tiers), achievements grid (locked = greyscale, unlocked = gold glow), XP earn guide. Routes: `/chibi`.
- **BulldogCompanion component** — fixed bottom-right, always visible. Autonomous behaviors: idle bob animation, random emotes every 20–45s (happy/yawn/curious), random WOOF bubble every 60–90s, sleep mode after 30s of user inactivity (eyes close to lines). Page-aware reactions: navigating to Events → cheer, Marketplace → curious, Exchange → happy, Chibi → excited. Daily thought bubble (5s after first visit, `localStorage` key prevents repeat same day): 30+ NU Laguna trivia quotes, 2-second typing dots then text. Click to navigate to `/chibi` or dismiss thought bubble. Mounted in `AppLayout`.

**P4 — Admin Panel**
- **Admin panel** (`/admin`, ADMIN-only) — user management table with role/status badges and Suspend action, announcement management tab (post new GENERAL/IMPORTANT/CRITICAL, deactivate existing). `AdminController` with `GET /api/admin/users` + `PATCH /api/admin/users/{id}/suspend`. Frontend guard redirects non-admins to dashboard. Admin-only nav link appears in desktop + mobile nav.

**Affected Modules**
- All existing modules (auth, profile, marketplace, exchange, events, notifications) — notification event handlers, XP event handlers, API response alias
- New: announcements, lostfound, suggestions, chibi, admin (frontend + backend)
- Shared: `ApiResponse` (added `success()` alias), `SecurityConfig` (added public `/api/announcements/active`)

**Migrations**
- V8: emergency_announcements
- V9: lost_found_items
- V10: suggestions + suggestion_votes
- V11: chibi_profiles + chibi_xp_events + chibi_achievements

**Endpoints Added**
- `GET /api/announcements/active` (public)
- `GET/POST /api/announcements` (admin/faculty)
- `PATCH /api/announcements/{id}/deactivate` (admin/faculty)
- `GET/POST /api/lost-found` (authenticated)
- `GET /api/lost-found/mine` (authenticated)
- `PATCH /api/lost-found/{id}/resolve` (owner)
- `GET/POST /api/suggestions` (authenticated)
- `POST/DELETE /api/suggestions/{id}/vote` (authenticated)
- `PATCH /api/suggestions/{id}/status` (admin/faculty)
- `GET /api/chibi/me` (authenticated)
- `GET /api/chibi/users/{id}` (authenticated)
- `GET /api/admin/users` (admin)
- `PATCH /api/admin/users/{id}/suspend` (admin)

**Entities Added**
- `EmergencyAnnouncement`, `LostFoundItem`, `Suggestion`, `SuggestionVote`, `ChibiProfile`, `ChibiXpEvent`, `ChibiAchievement`

**Frontend Routes Added**
- `/` → LandingPage (unauthenticated), redirects to `/home` if authenticated
- `/home` → DashboardPage (was `/`)
- `/lost-found` → LostFoundPage
- `/suggestions` → SuggestionsPage
- `/settings` → SettingsPage
- `/chibi` → ChibiPage
- `/admin` → AdminPage (ADMIN only)

---

## [0.13.0] — 2026-05-30

### Campus Events System (backend + frontend + full test suite)

**Business Purpose**
NU Laguna students had no way to discover or register for campus activities — academic fairs, cultural shows, sports events, seminars, or social gatherings were invisible inside the app. This slice delivers the complete **Campus Events experience**: admins and faculty create events (in draft, then publish when ready), students browse with filters (category, status, upcoming-only) and RSVP with one click. The capacity guard prevents over-registration; every RSVP sends an `EVENT_RSVP` in-app notification. Admins can cancel or delete (drafts only). The full event lifecycle — DRAFT → PUBLISHED → CANCELLED — is enforced as domain behavior on the entity.

**Architecture Decisions**
- **`CampusEvent` carries domain behavior, not just getters.** `publish()`, `cancel()`, `updateDetails()`, and `isRsvpOpen()` enforce the state machine directly on the entity. Controllers and service methods are thin.
- **`EventRsvp` is a standalone entity with a `create()`/`cancel()` factory pattern**, matching the established domain-behavior style of `Follow`, `Reservation`, etc. The `UNIQUE(event_id, user_id)` constraint at the DB level is the safety net; the service layer handles re-RSVPs by deleting the cancelled row before inserting fresh.
- **`EventSpecification` follows the same null-safe `Stream.filter(nonNull).reduce(::and)` pattern** as `ListingSpecification` — all three filters (category, status, upcomingOnly) are optional and compose cleanly without null operands.
- **`EventRsvpEvent` domain event → `NotificationEventListener.onEventRsvp()`** fires an `EVENT_RSVP` notification to the attendee using the existing `AFTER_COMMIT + REQUIRES_NEW` pattern. `NotificationType` extended with `EVENT_RSVP`; `ReferenceType` extended with `EVENT`.
- **Access control split by concern:** `@PreAuthorize("hasAnyRole('ADMIN','FACULTY')")` gates create/update/publish; `@PreAuthorize("hasRole('ADMIN')")` gates cancel and delete. The service layer additionally enforces that only the event creator can edit/publish their own event (403 otherwise), matching the marketplace owner-check pattern.
- **`EventController` browse endpoint is public-scoped within JWT-authenticated routes** — no extra permission required to view events (students, faculty, and admin all browse).
- **Frontend: feature slice matching the established module pattern.** `modules/events` with strict types mirroring DTOs/enums, a thin `eventsApi`, TanStack Query hooks, smart/dumb component split. A native `<select>` (not the shared `Select` component) is used in `EventFilters` to avoid the `options`-prop contract mismatch for filter-only controls that don't bind to React Hook Form.
- **`EventForm` uses the shared `Select` component with the `options` prop** (matching `ProfileForm`'s pattern with `yearLevelOptions`), `Input` for datetime-local, and a `FileInput` for cover image upload reusing `validateImageFile` on the client side.
- **Cover image upload reuses `StorageService`** under a new `"events"` category — identical to marketplace `"listings"` and exchange `"exchange"`. No new infrastructure.
- **Jackson 2.x `LocalDateTime` test fix.** `EventControllerTest` registers a `SimpleModule` with a `LocalDateTime` serializer/deserializer (ISO format) on the Jackson 2.x `ObjectMapper`. This is the first controller test that has a `LocalDateTime` in the request body (prior tests avoided it). The pattern was driven by: Spring Boot 4 uses Jackson 3.x (`tools.jackson`) which has built-in time support; tests use Jackson 2.x (`com.fasterxml.jackson`) from jjwt; `jackson-datatype-jsr310` is not on the test classpath.
- **All five events pages are lazy-loaded.** `EventsPage`, `EventDetailPage`, `CreateEventPage`, `EditEventPage`, `MyRsvpsPage` — all code-split into their own chunks (verified in production build).

**Domain Rules (enforced)**
- Only `DRAFT` events can be published; only `PUBLISHED`/`DRAFT` events can be cancelled; only `DRAFT` events can be deleted.
- An event is RSVP-open only if its status is `PUBLISHED` and `startTime` is in the future.
- A user cannot RSVP twice to the same event — `DuplicateRsvpException` (409).
- If `capacity` is set, RSVP count must not exceed it — `EventCapacityExceededException` (409).
- Only the event creator (ADMIN or FACULTY role) can edit/publish. Only ADMIN can cancel/delete.
- Cancelling an RSVP transitions the `EventRsvp` row's status to `CANCELLED` (soft-cancel).

**Affected Modules**
- `modules/events` (new — full module): domain, repository, DTOs, service, controller.
- `modules/notifications/domain` — `NotificationType.EVENT_RSVP` and `ReferenceType.EVENT` added.
- `modules/notifications/application/NotificationEventListener` — `onEventRsvp` handler added.
- `shared/event` — `EventRsvpEvent` added.
- `frontend/modules/events` (new) — full Events UI slice.
- `frontend/shared` — events routes (lazy) + `AppLayout` nav entry; `paths` helpers (`events`, `eventsNew`, `myRsvps`, `eventDetail`, `eventEdit`, `eventDetailPath`, `editEventPath`).

**Endpoints**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/events` | JWT | Browse events (filter: category, status, upcomingOnly; paginated; sorted by startTime) |
| GET | `/api/events/{id}` | JWT | Event detail + viewer's RSVP status |
| POST | `/api/events` | ADMIN/FACULTY | Create event (DRAFT by default) |
| PUT | `/api/events/{id}` | ADMIN/FACULTY (creator) | Update event details |
| PATCH | `/api/events/{id}/publish` | ADMIN/FACULTY (creator) | DRAFT → PUBLISHED |
| PATCH | `/api/events/{id}/cancel` | ADMIN | Cancel event |
| DELETE | `/api/events/{id}` | ADMIN | Delete DRAFT event |
| POST | `/api/events/{id}/rsvp` | JWT | RSVP to an event |
| DELETE | `/api/events/{id}/rsvp` | JWT | Cancel RSVP |
| GET | `/api/events/my-rsvps` | JWT | Paginated attending RSVPs for the current user |
| POST | `/api/events/images` | ADMIN/FACULTY | Upload event cover image (multipart) |

**Entities & Services**
- `CampusEvent` (entity) — `campus_events` table; behaviors: `create()`, `publish()`, `cancel()`, `updateDetails()`, `isRsvpOpen()`, `isCreatedBy()`.
- `EventRsvp` (entity) — `event_rsvps` table; behaviors: `create()`, `cancel()`.
- `EventStatus` (enum) — `DRAFT`, `PUBLISHED`, `CANCELLED`.
- `EventCategory` (enum) — `ACADEMIC`, `CULTURAL`, `SPORTS`, `SEMINAR`, `SOCIAL`, `OTHER`.
- `RsvpStatus` (enum) — `ATTENDING`, `CANCELLED`.
- `EventCapacityExceededException`, `DuplicateRsvpException` — both return HTTP 409 Conflict.
- `EventService` / `EventServiceImpl` — all 11 use cases.
- `EventSpecification` — null-safe Specification composition for dynamic filtering.
- `EventRsvpEvent` (shared) — published after successful RSVP; consumed by `NotificationEventListener`.
- `NotificationType.EVENT_RSVP` — triggers RSVP confirmation notifications.

**Frontend Key Files Added**
| Area | Files |
|------|-------|
| Events module | `types`, `schemas`, `services/eventsApi`, `hooks/useEvents` (`useEvents`, `useEvent`, `useCreateEvent`, `useUpdateEvent`, `usePublishEvent`, `useCancelEvent`, `useDeleteEvent`, `useRsvp`, `useCancelRsvp`, `useMyRsvps`, `useUploadEventImage`), components (`EventCard`, `EventGrid`, `EventFilters`, `EventForm`, `RsvpButton`, `EventCategoryBadge`, `EventStatusBadge`), pages (`EventsPage`, `EventDetailPage`, `CreateEventPage`, `EditEventPage`, `MyRsvpsPage`) |
| Shared | events routes (lazy) + nav, `paths` link helpers (`eventDetailPath`, `editEventPath`) |

**Migrations**
- `V7__campus_events.sql` — `campus_events` table (FK `creator_id` → `users` ON DELETE SET NULL), `event_rsvps` table (FKs → `campus_events` and `users` ON DELETE CASCADE, `UNIQUE(event_id, user_id)`), 5 indexes for browse and RSVP count queries.

**Tests & Verification**
- **Backend: 173 tests pass** (+33 new): `EventServiceImplTest` (16 tests — createEvent DRAFT, getEvent detail/not-found, updateEvent non-creator 403, publishEvent DRAFT→PUBLISHED/already-published 409, cancelEvent, deleteEvent DRAFT/published 409, rsvp success+publishesEvent/duplicate/draft/capacity, cancelRsvp/no-rsvp, getMyRsvps pagination), `EventControllerTest` (17 tests — full HTTP surface: browse/empty, detail/404, create 201/missing-title 400, publish/409-conflict, cancel, delete/409-published, rsvp/duplicate/capacity-exceeded, cancel-rsvp/404, my-rsvps). Full suite green including real-Postgres Testcontainers integration test.
- **Frontend: 131 tests pass** (+24 new): `schemas.test.ts` (11 — valid form, empty/long title, invalid category, empty/long location, empty startTime, all 6 valid categories, image validation), `EventFilters.test.tsx` (7 — renders selects, category/status change, upcomingOnly toggle, clear filters shown/hidden, reset), `useEvents.test.tsx` (6 — useRsvp call/error, useCancelRsvp call, eventKeys structure). `tsc -b` clean; `vite build` succeeds (325 modules) with all five Events pages code-split into separate chunks.

---

## [0.12.0] — 2026-05-30

### Notifications Module (backend + frontend + full test suite)

**Business Purpose**
`ReservationCreatedEvent` and `UserRegisteredEvent` were already firing in the backend since v0.5.0 and v0.2.0 respectively, but had no consumer — students had no way to know their reservation was confirmed or to receive a welcome message. This slice delivers the complete **Notifications experience**: a persistent in-app notification feed where students can see activity, mark items read, and delete entries, with a live unread badge in the app header polled every 30 seconds. Every future module (Events, Lost & Found, Announcements) can now produce notifications by publishing a domain event.

**Architecture Decisions**
- **Event listener follows the `ProfileEventListener` pattern exactly.** `NotificationEventListener` consumes `ReservationCreatedEvent` and `UserRegisteredEvent` via `@TransactionalEventListener(AFTER_COMMIT)` + `@Transactional(REQUIRES_NEW)`. The `REQUIRES_NEW` is mandatory: in the `AFTER_COMMIT` phase the source transaction has already completed; without a new transaction the notification INSERT would join a completing context and be silently discarded.
- **No WebSocket — polling is correct for this scope.** The unread badge uses TanStack Query `refetchInterval: 30_000`. This is predictable, requires no infrastructure, and is easily upgraded to SSE or WebSocket when traffic justifies it. Polling only hits a single indexed `COUNT` query.
- **Ownership enforcement in the service layer.** `markAsRead` and `delete` verify `notification.recipientId == callingUserId` before any mutation. A non-owner receives 403 Forbidden — the same security pattern used in the Marketplace and Bulldog Exchange.
- **Explicit `@RequestParam` pagination** — matches the existing marketplace/exchange controller pattern. Avoids the `PageableHandlerMethodArgumentResolver` registration requirement in standalone MockMvc, keeping tests simple.
- **`mutationFn` wrapped in arrow functions** in all hooks. Passing a bare method reference directly as `mutationFn` causes TanStack Query v5 to forward its internal context object as a second argument to the API function — wrapping isolates that.
- **Frontend: feature slice matching the established module pattern.** `modules/notifications` with strict types mirroring the DTOs/enums, a thin `notificationsApi`, TanStack Query hooks, smart/dumb component split (`NotificationBell` → `NotificationPanel` → `NotificationItem`). `NotificationBell` handles click-outside and Escape key dismissal natively, with no library dependency.
- **`NotificationsPage` is lazy-loaded.** Confirmed as a separate `NotificationsPage-*.js` chunk in the production build.

**Domain Rules (enforced)**
- A notification belongs to exactly one recipient; only that recipient may read or delete it (403 otherwise).
- `markAsRead` is idempotent — calling it on an already-read notification is safe.
- `markAllAsRead` uses a single `@Modifying` JPQL bulk update scoped to the calling user — no N+1.
- Unread badge caps display at `99+` for counts > 99.

**Affected Modules**
- `modules/notifications` (new — full module): domain, repository, DTOs, service, event listener, controller.
- `shared/event` — `ReservationCreatedEvent` and `UserRegisteredEvent` now consumed by an additional listener; no changes to the events themselves.
- `frontend/modules/notifications` (new) — full notifications UI slice.
- `frontend/shared` — `NotificationBell` added to `AppLayout` header; notifications route (lazy) added to `AppRoutes`; `paths.notifications` added.

**Endpoints**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/notifications` | JWT | Paginated notifications for the current user (newest first) |
| GET | `/api/notifications/unread-count` | JWT | Unread badge count (polled every 30 s) |
| PATCH | `/api/notifications/{id}/read` | JWT | Mark a single notification as read |
| PATCH | `/api/notifications/read-all` | JWT | Mark all notifications as read (bulk update) |
| DELETE | `/api/notifications/{id}` | JWT | Delete a notification |

**Entities & Services**
- `Notification` (entity) — `notifications` table; domain behavior: `markAsRead()` (idempotent).
- `NotificationType` (enum) — `RESERVATION_CREATED`, `NEW_FOLLOWER`, `WELCOME`.
- `ReferenceType` (enum) — `RESERVATION`, `USER_PROFILE`.
- `NotificationService` / `NotificationServiceImpl` — `create`, `getMyNotifications`, `getUnreadCount`, `markAsRead`, `markAllAsRead`, `delete`.
- `NotificationEventListener` — `@TransactionalEventListener(AFTER_COMMIT)` + `REQUIRES_NEW` for `ReservationCreatedEvent` (→ `RESERVATION_CREATED`) and `UserRegisteredEvent` (→ `WELCOME`).

**Frontend Key Files Added**
| Area | Files |
|------|-------|
| Notifications module | `types`, `services/notificationsApi`, `hooks/useNotifications` (`useNotifications`, `useUnreadCount`, `useMarkAsRead`, `useMarkAllAsRead`, `useDeleteNotification`), components (`NotificationItem`, `NotificationPanel`, `NotificationBell`), pages (`NotificationsPage`) |
| Shared | `paths.notifications`, notifications route (lazy) in `AppRoutes`, `NotificationBell` in `AppLayout` header |

**Migrations**
- `V6__notifications.sql` — `notifications` table with `recipient_id` FK → `users`, partial index on `(recipient_id, is_read) WHERE is_read = FALSE` for the badge count query, composite index on `(recipient_id, created_at DESC)` for the list query.

**Tests & Verification**
- **Backend: 140 tests pass** (+22 new): `NotificationServiceImplTest` (11 tests — create with/without reference fields, getMyNotifications pagination, getUnreadCount, markAsRead owner/non-owner/not-found, markAllAsRead bulk update, delete owner/non-owner/not-found), `NotificationControllerTest` (11 tests — full HTTP surface: GET list/empty, GET unread-count/zero, PATCH read/not-found/forbidden, PATCH read-all, DELETE/not-found/forbidden). Full suite green including real-Postgres Testcontainers integration test.
- **Frontend: 107 tests pass** (+16 new): `useNotifications.test.tsx` (10 — `useUnreadCount` count/zero, `useMarkAsRead` call/cache-invalidation/error, `useMarkAllAsRead` bulk+invalidation, `notificationKeys` structure), `NotificationBell.test.tsx` (7 — accessible label, no badge at zero, badge count, 99+ cap, panel opens on click, aria-expanded, empty state message). `tsc -b` clean; `vite build` succeeds (305 modules) with `NotificationsPage` code-split into its own chunk.

---

## [0.11.0] — 2026-05-30

### Bulldog Exchange Vertical Slice (frontend UI + backend gap-closing + full test suite)

**Business Purpose**
The Bulldog Exchange backend has existed since v0.5.0 but had no UI or tests — NU Laguna students could not browse or reserve official merchandise. This slice delivers the complete **Bulldog Exchange experience**: browse products by category, view a product with its variants (size/color) and live stock indicators, reserve a variant with a 48-hour pickup window, track and cancel reservations. Admins gain product creation (with image upload), variant management (add/edit stock), and product deactivation — all on the same pages, role-gated. It also closes the backend gaps a real UI exposed (product image upload, test suites) and completes the missing `BulldogExchangeControllerTest`.

**Architecture Decisions**
- **Product image upload reuses the shared storage seam (DIP/OCP).** `POST /api/bulldog-exchange/images` (multipart, admin-only) delegates to the existing `StorageService` (`LocalStorageService` in dev) under a new `"exchange"` category and returns the stored URL. No new infrastructure — identical contract to the marketplace image upload. Magic-byte `FileValidator` (JPG/PNG/WEBP, ≤ 2 MB, UUID filenames) is inherited for free.
- **Backend test suites added in this slice.** `BulldogExchangeControllerTest` (17 tests, standalone MockMvc) covers the full HTTP surface: browsing, all admin CRUD, reserve/cancel flows, and error paths (409 for insufficient stock and reservation limit). `BulldogExchangeServiceImplTest` gained one test (`uploadImage` delegates to storage under `"exchange"` category) and its constructor was updated for the new `StorageService` dependency.
- **Frontend: feature slice matching the auth/profile/marketplace pattern.** `modules/bulldog-exchange` with strict types mirroring the DTOs/enums, Zod schemas mirroring the backend `@Size`/`@Min`/`@NotBlank` constraints (`stock` as a string-based field like `price` — coerced in the submit handler, avoids `zodResolver` input/output type friction), a thin `bulldogExchangeApi`, TanStack Query hooks (server state), and a smart/dumb component split.
- **Variant selection is a radio-group pattern.** `VariantSelector` renders each variant as an `aria-pressed` button showing size/color label, price, and inline stock text. Unavailable variants are shown dimmed but selectable so students can see what exists and what is sold out.
- **Live countdown timer for reservations.** `ReservationCountdown` runs a 1-second `setInterval` and turns red when under 1 hour remains — reinforcing the 48-hour pickup policy.
- **Viewer-aware product detail.** A single `ProductDetailPage` renders student actions (variant select, reserve, view reservations) or admin actions (add variant, update stock inline, deactivate) based on the session role — no separate admin screen.
- **All Bulldog Exchange routes are lazy-loaded.** All four pages (`BulldogExchangePage`, `ProductDetailPage`, `MyReservationsPage`, `CreateProductPage`) are `React.lazy` + `Suspense` — verified as separate chunks in the production build.

**Domain Rules (surfaced or enforced)**
- Product images must be JPG/PNG/WEBP and ≤ 2 MB (server-side `FileValidator`, mirrored client-side for fast feedback).
- `InsufficientStockException` and `ReservationLimitExceededException` both return **409 Conflict**; controller test assertions align with this.
- A student cannot hold more than 2 active (PENDING) reservations per product.
- Reservations expire after 48 hours; the `ReservationExpiryScheduler` (existing) restores stock.
- Reserve button is disabled when no variant is selected or the selected variant has 0 stock.

**Affected Modules**
- `modules/bulldog_exchange` (backend) — `uploadImage` use case + `UploadImageResponse` DTO + `POST /images` endpoint; `StorageService` dependency added to `BulldogExchangeServiceImpl`.
- `shared/storage` — reused unchanged (new `"exchange"` category key only).
- `frontend/modules/bulldog-exchange` (new) — full Bulldog Exchange UI slice.
- `frontend/shared` — exchange routes (lazy) + `AppLayout` nav entry; `paths` helpers (`exchange`, `exchangeNew`, `myReservations`, `exchangeProduct`, `exchangeProductPath`).

**Endpoints**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/bulldog-exchange/images` | ADMIN JWT | Upload a product image (multipart `file`) → returns stored URL |

(All other exchange endpoints — browse, detail, create/update/deactivate products, add variants, update stock, reserve, my-reservations, cancel — existed since v0.5.0 and are now consumed by the UI.)

**Entities & Services**
- `BulldogExchangeServiceImpl` — new `uploadImage` use case (delegates to `StorageService`); `StorageService` added as a dependency.
- `UploadImageResponse` (new DTO).
- `BulldogExchangeService` interface — `uploadImage(MultipartFile)` added.

**Frontend Key Files Added**
| Area | Files |
|------|-------|
| Exchange module | `types`, `schemas`, `services/bulldogExchangeApi`, `hooks/useBulldogExchange`, components (`StockBadge`, `ReservationStatusBadge`, `VariantSelector`, `ReservationCountdown`, `ReservationCard`, `ProductCard`, `ProductGrid`, `ProductImageUploader`), pages (`BulldogExchangePage`, `ProductDetailPage`, `MyReservationsPage`, `CreateProductPage`) |
| Shared | exchange routes (lazy) + nav, `paths` link helpers |

**Migrations**
- None — `merchandise_products`, `product_variants`, and `reservations` (V5) already exist; no schema change needed.

**Tests & Verification**
- **Backend: 118 tests pass** (+24 new): `BulldogExchangeControllerTest` (17 tests — full HTTP surface: browse, create/update/deactivate products, add variants, stock update, reserve/cancel, error paths); `uploadImage` service test (1). Existing `BulldogExchangeServiceImplTest` constructor updated for `StorageService` parameter. Full suite green including the real-Postgres Testcontainers integration test.
- **Frontend: 91 tests pass** (+41 new): `schemas.test.ts` (28 — productForm, variantForm, validateImageFile, formatPrice, formatVariantLabel, msUntilExpiry), `VariantSelector.test.tsx` (7 — renders variants, selected state, onChange, out-of-stock/low-stock indicators, empty state), `useBulldogExchange.test.tsx` (6 — createReservation success/error, cache invalidation, key structure). `tsc -b` clean; `vite build` succeeds (289 modules) with all Bulldog Exchange pages code-split into their own chunks.

---

## [0.10.0] — 2026-05-30

### Marketplace Vertical Slice (frontend UI + backend gap-closing)

**Business Purpose**
The Marketplace backend has existed since v0.6.0 but had no UI — students could not actually buy or sell. This slice delivers the full **Marketplace experience**: browse with search/filter, view a listing with its photo gallery and seller, post/edit/delete your own listings with **real photo uploads**, mark items as sold, save listings for later, report bad listings, and (for admins) suspend them. It also closes the backend gaps that a real UI exposed — listing image uploads, grid thumbnails — and fixes a latent defect that would have made the default (unfiltered) marketplace page return 500.

**Architecture Decisions**
- **Listing image upload reuses the shared storage seam (DIP/OCP).** `POST /api/marketplace/images` (multipart) delegates to the existing `StorageService` (`LocalStorageService` in dev) under a new `"listings"` category and returns the stored URL, which the client then submits in `CreateListingRequest.imageUrls`. This matches the established URL-based image contract (the create/update DTOs already took `imageUrls`) and inherits the magic-byte `FileValidator` (JPG/PNG/WEBP, ≤ 2 MB, server-generated UUID filenames) for free — no new validation or trust-the-client surface. A production Cloudinary/Supabase implementation swaps in without touching the marketplace module.
- **Grid thumbnails without N+1.** `ListingCardResponse` gained a `thumbnailUrl`. Rather than touch the lazy `images` collection per card (an N+1 over the page), the service batch-loads the primary image (`displayOrder = 0`) for the whole page in **one** projection query (`findPrimaryImages` → `ListingThumbnailProjection`) and maps it in memory. Detail still uses the existing `findByIdWithImages` fetch-join.
- **Frontend: feature slice mirroring auth/profile.** `modules/marketplace` with strict types mirroring the DTOs/enums, Zod schemas mirroring the backend `@Size`/`@Digits`/`@DecimalMin`/`FileValidator` rules, a thin `marketplaceApi`, TanStack Query hooks (server state), and a smart/dumb component split. Save/unsave is **optimistic with rollback** (mirrors the profile follow pattern). Reusable badges, image gallery, multi-image uploader, filters, and a shared create/edit form keep the pages thin.
- **Marketplace routes are lazy-loaded.** All six pages are `React.lazy` + `Suspense` so this heavier feature area is code-split out of the initial bundle (per the performance rules) — verified as separate chunks in the production build.
- **Viewer-aware detail actions.** A single detail page renders owner actions (edit / mark-sold / delete), buyer actions (save / report), and admin moderation (suspend) by comparing the cached `seller.userId` and the session `role` (`ROLE_ADMIN`) — no separate admin screen needed for this slice.

**Domain Rules (surfaced or enforced)**
- Listing photos must be JPG/PNG/WEBP and ≤ 2 MB (enforced server-side by `FileValidator`; mirrored client-side for fast feedback). A listing has at most 10 images; the **first image is the cover/thumbnail**.
- Browse returns only `AVAILABLE` listings; marking sold removes an item from the grid.
- Price accepts up to 8 integer + 2 fraction digits and must be ≥ 0 (mirrors `@Digits`/`@DecimalMin`).
- Report reason ≤ 500 chars; a user can report a listing once; saving is idempotent (already-saved → 409).
- Only the owner may edit/delete/mark-sold; only an admin may suspend.

**Bug Found During This Slice (pre-existing, now fixed)**
- **Unfiltered marketplace browse would 500.** `ListingSpecification.build` composed filters with `Specification.where(...).and(withKeyword(...))...`, and the optional `with*` helpers return `null` when their filter is absent. Spring Data (Boot 4) rejects `Specification.and(null)` with *"Other specification must not be null"* — so the **default marketplace page load** (no filters) threw. This path had no test before; the new card-mapping tests surfaced it immediately. Fix: `build` now streams the candidate specs, drops nulls, and reduces with `and`, so any combination of present/absent filters composes cleanly. Verified live (unfiltered browse → 200).

**Affected Modules**
- `modules/marketplace` (backend) — `uploadImage` use case + `UploadImageResponse` DTO + `POST /images` endpoint; `ListingCardResponse.thumbnailUrl`; `findPrimaryImages` projection + batch thumbnail mapping in `MarketplaceServiceImpl`; **null-safe `ListingSpecification`**.
- `shared/storage` — reused unchanged (new `"listings"` category).
- `frontend/modules/marketplace` (new) — full Marketplace UI slice.
- `frontend/shared` — marketplace routes (lazy) + `AppLayout` nav entry; `paths` helpers (`marketplaceListingPath`, `marketplaceEditPath`).

**Endpoints**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/marketplace/images` | JWT | Upload a listing image (multipart `file`) → returns stored URL |

(All other marketplace endpoints — browse, detail, create/update/delete, mark-sold, save/unsave, report, my-listings, saved, admin suspend — existed since v0.6.0 and are now consumed by the UI. `ListingCardResponse` now additionally carries `thumbnailUrl`.)

**Entities & Services**
- `MarketplaceServiceImpl` — new `uploadImage` use case (delegates to `StorageService`); `loadThumbnailMap` batch primary-image loader wired into browse / my-listings / saved.
- `ListingCardResponse` — new `thumbnailUrl` field.
- `UploadImageResponse` (new DTO); `MarketplaceListingRepository.ListingThumbnailProjection` (new projection) + `findPrimaryImages`.
- `ListingSpecification` — null-safe composition.

**Frontend Key Files Added**
| Area | Files |
|------|-------|
| Marketplace module | `types`, `schemas`, `services/marketplaceApi`, `hooks/useMarketplace`, components (`ListingCard`, `ListingGrid`, `MarketplaceFilters`, `ImageGallery`, `ListingImageUploader`, `ListingForm`, `ReportModal`, `badges`), pages (`MarketplacePage`, `ListingDetailPage`, `CreateListingPage`, `EditListingPage`, `MyListingsPage`, `SavedListingsPage`) |
| Shared | marketplace routes (lazy) + nav, `paths` link helpers |

**Migrations**
- None — `listing_images` (V4) already stores image URLs with `display_order`; no schema change needed for thumbnails or uploads.

**Tests & Verification**
- **Backend: 94 tests pass** (+4 new): `uploadImage` delegates to storage under the `listings` category; `getListings` maps the primary image into `thumbnailUrl` and yields `null` when a listing has no images; `POST /images` returns 201 with the URL. Existing service/controller constructors updated for the new `StorageService` dependency and `thumbnailUrl` field. Full suite green including the real-Postgres Testcontainers integration tests.
- **Frontend: 50 tests pass** (+21 new): marketplace `schemas` (title/description/price limits, valid/invalid price formats, report reason, image type/size, peso formatting), `MarketplaceFilters` (emits only populated filters, omits blanks, reset), `ListingImageUploader` (valid upload appends URL; rejects oversize/non-image/over-10 without uploading), and `useToggleSaveListing` (optimistic `isSaved` flip + rollback on error). `tsc -b` clean; `vite build` succeeds (274 modules) with marketplace pages code-split into their own chunks.
- **Live end-to-end** (Docker Postgres + Spring Boot + curl): register → verify → login; upload PNG → 201 + URL; non-image → 400; create listing with the image → 201; **unfiltered browse → 200 with `thumbnailUrl` populated** (the null-spec regression guard); filtered browse → 200; static `/uploads/listings/...` → 200 `image/png`; save → saved list shows the thumbnail; mark-sold → `SOLD` and removed from available browse.

---

## [0.9.0] — 2026-05-30

### Phase 0 Hygiene + Profile Vertical Slice (backend completion + Profile UI)

**Business Purpose**
The Profile, Marketplace, and Bulldog Exchange backends existed from earlier phases but had no UI. This slice delivers the first of those user-facing experiences — the **User Profile** — so NU Laguna users can present a campus identity: set a photo, course, year level, bio, and interests; control public/private visibility and what shows on their profile; and build the campus social graph by following each other. It also lands the **shared file-upload infrastructure** that every later image feature (marketplace, events, lost & found, merchandise) will reuse, and clears two correctness defects found along the way.

**Architecture Decisions**
- **`/api/auth/me` now returns 401, not 500/403, when unauthenticated.** The endpoint was under the `/api/auth/**` `permitAll` matcher, so with no cookie the controller dereferenced a null `Authentication`. The public matcher is now explicit (`register`, `login`, `logout`, `verify-email`); `/me` falls under `authenticated()`. A `RestAuthenticationEntryPoint` returns the standard `ApiResponse` envelope with a real 401 (Spring's default entry point would otherwise answer 403).
- **Shared storage abstraction (DIP/OCP).** `StorageService` is the seam; `LocalStorageService` writes to disk for development and `WebConfig` serves the files under `/uploads/**`. A production Cloudinary/Supabase implementation swaps in without touching callers. URLs are persisted; deletion is by URL.
- **Server-side image validation by magic bytes, not the client content type.** `FileValidator` + `ImageType` sniff the leading bytes to detect JPG/PNG/WEBP, enforce a 2 MB ceiling, and reject everything else — the client-declared MIME type and filename are never trusted. Filenames are server-generated UUIDs; a path-traversal guard keeps writes inside the storage root. A multipart size backstop (3 MB) maps to a clean 413.
- **Privacy is split by concern (ISP).** Visibility (`PUBLIC`/`PRIVATE`) keeps its existing endpoint; the two showcase toggles (`hideMarketplaceActivity`, `hideChibiShowcase`) get their own `PATCH /me/privacy`, mirroring the existing `/me/visibility` style rather than overloading the profile `PUT`.
- **Domain behavior, not anemic setters.** New `UserProfile.updatePrivacy(...)` joins the existing `updateAvatar(...)`; avatar replace/remove deletes the previous file through the storage seam after the new state is persisted.
- **Frontend: feature slice mirroring the auth module.** `modules/profile` with strict types mirroring the DTOs, Zod schemas mirroring the backend `@Size`/file rules, a thin `profileApi`, TanStack Query hooks (server state) and a smart/dumb component split. Follow/unfollow is **optimistic** with rollback on error. Reusable `Avatar`, `Textarea`, and `Select` were added to the shared UI kit; a `Page<T>` type models Spring Data pages for this and future paginated lists.

**Domain Rules (surfaced or enforced)**
- Avatar uploads must be JPG/PNG/WEBP and ≤ 2 MB (enforced server-side; mirrored client-side for fast feedback).
- Replacing or removing an avatar deletes the previously stored file.
- Visibility and the two showcase toggles are independent settings.
- A private profile shows only name + avatar to non-followers; the public profile page reflects this via `detailsHidden = isPrivate && !isFollowing`.
- Viewing your own profile by its public URL redirects to the editable own-profile view.

**Bugs Found During the Live Check (pre-existing, now fixed)**
- **User profiles were never actually persisted on registration.** `ProfileEventListener` creates the profile in an `@TransactionalEventListener(AFTER_COMMIT)` handler. Because the registration transaction has already committed in that phase, the profile `INSERT` joined a completing transaction and was silently discarded (the "Profile created" log ran, but no row landed). The earlier v0.8.0 auth-only live check never exercised this path. Fix: the listener now runs with `@Transactional(propagation = REQUIRES_NEW)`, so the profile is written in its own committed transaction. Guarded by a new Testcontainers regression test.
- **`/api/auth/me` 500 → 401** (described above), the follow-up flagged in v0.8.0.

**Affected Modules**
- `shared/security` — explicit public matchers, new `RestAuthenticationEntryPoint`.
- `shared/storage` (new) — `StorageService`, `LocalStorageService`, `FileValidator`, `ImageType`.
- `shared/config` (new) — `WebConfig` static serving for `/uploads/**`.
- `shared/handler` — `MaxUploadSizeExceededException` → 413.
- `modules/profile` — `updateAvatar`/`removeAvatar`/`updatePrivacy` (service + controller + domain), `UpdatePrivacyRequest`; `ProfileEventListener` transaction fix.
- `frontend/modules/profile` (new) — full Profile UI slice.
- `frontend/shared` — `Avatar`/`Textarea`/`Select` UI components, `Page<T>` type, profile routes + nav.

**Endpoints**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/profile/me/avatar` | JWT | Upload avatar (multipart `file`) — validates, stores, replaces |
| DELETE | `/api/profile/me/avatar` | JWT | Remove avatar and delete the stored file |
| PATCH | `/api/profile/me/privacy` | JWT | Set `hideMarketplaceActivity` / `hideChibiShowcase` |
| GET | `/uploads/**` | Public | Serve locally stored upload (dev only) |

(Existing profile endpoints — `me`, `me/visibility`, `{userId}`, follow/unfollow, followers/following — are unchanged and now consumed by the UI.)

**Entities & Services**
- `UserProfile` — new `updatePrivacy(...)` behavior.
- `StorageService` / `LocalStorageService`, `FileValidator`, `ImageType` — shared upload infrastructure.
- `RestAuthenticationEntryPoint` — JSON 401 for protected routes.
- `ProfileServiceImpl` — `updateAvatar`, `removeAvatar`, `updatePrivacy` use cases.

**Frontend Key Files Added**
| Area | Files |
|------|-------|
| Profile module | `types`, `schemas`, `services/profileApi`, `hooks/useProfile`, components (`ProfileHeader`, `ProfileForm`, `AvatarUploader`, `FollowButton`, `VisibilityToggle`, `PrivacyToggles`, `FollowList`, `FollowModal`), pages (`MyProfilePage`, `EditProfilePage`, `PublicProfilePage`) |
| Shared | `Avatar`, `Textarea`, `Select`, `Page<T>` type, profile routes + `AppLayout` nav |

**Migrations**
- None — the `avatar_url`, `hide_marketplace_activity`, and `hide_chibi_showcase` columns already exist (V3).

**Tests & Verification**
- **Backend: 90 tests pass** (+9 new): `RestAuthenticationEntryPointTest` (401 envelope), `FileValidatorTest` (magic-byte detection, oversize, empty, spoofed type → 400), `ProfileServiceImplTest` (avatar store/replace/remove + old-file deletion, privacy toggles), and a new Testcontainers integration test asserting registration persists a profile (the `AFTER_COMMIT` regression guard).
- **Frontend: 29 tests pass** (+18 new): profile `schemas` (edit limits, avatar type/size, year-level labels), `ProfileForm`, `AvatarUploader` (rejects oversize/non-image, remove action), `FollowButton`. `tsc -b` clean, `vite build` succeeds (257 modules).
- **Live end-to-end** (Docker Postgres + Spring Boot + curl): `/me` no cookie → 401; register → profile row persisted; multipart avatar upload → 200 + URL; static `/uploads/...` → 200; non-image → 400; privacy → 200; delete avatar → 200 then file 404.

---

## [0.8.0] — 2026-05-30

### Frontend Foundation + Authentication UI (first vertical slice)

**Business Purpose**
The backend reached v0.7.0 with four working modules while the frontend was still a bare Vite scaffold. This slice stands up the entire frontend foundation and delivers the first user-facing feature — authentication — so NU Laguna users can register with their NU email, verify, log in, and reach an authenticated app shell. Auth is the entry point every other screen depends on, and it validates the riskiest integration point early: the HTTP-only JWT cookie flow end to end.

**Architecture Decisions**
- **Same-origin dev via Vite proxy** — `/api` is proxied to `http://localhost:8080`, so the browser stays on one origin and the HTTP-only `access_token` cookie is sent with no CORS/SameSite friction. Axios uses `withCredentials: true` and `baseURL: '/api'`.
- **Feature-based structure** — `src/modules/<feature>` for feature code, `src/shared/{components,layouts,routes,store,lib}` for cross-cutting concerns, per the engineering rules.
- **Smart vs dumb split** — presentational forms (`LoginForm`, `RegisterForm`) own client-side validation only and receive `onSubmit`/`isSubmitting`/`serverError`; smart pages own the mutations, navigation, and server error mapping.
- **State boundaries** — Zustand holds only global state (`authStore` for session, `themeStore` for light/dark); TanStack Query owns all server state. The session is bootstrapped once via `/auth/me` before routes render, so guards never flash-redirect while the check is in flight.
- **401 handling** — a single Axios response interceptor clears the auth store on 401; route guards react and redirect, avoiding hard navigations.
- **Validation mirrors the backend** — Zod schemas reproduce the server's NU-email-domain and password-complexity rules for fast UX feedback, with the backend remaining the source of truth.
- **Strict typing** — `strict: true`, no `any`; the backend `ApiResponse<T>` envelope is modeled as a typed interface and unwrapped centrally.
- **Tailwind v4** via `@tailwindcss/vite`, semantic design tokens with a `.dark` class strategy and an NU blue/gold palette.
- **Test config isolation** — Vitest config lives in its own `vitest.config.ts` to avoid a type clash between Vite 8's plugin types and the Vite version Vitest bundles.

**Domain Rules Surfaced (client-side, server-authoritative)**
- Registration restricted to `@national-u.edu.ph` emails.
- Password ≥ 8 chars with at least one uppercase, one lowercase, and one number.
- Accounts must verify their email before login (the 403 "not active" path is surfaced as a friendly message).
- Authenticated users are kept out of login/register; unauthenticated users are redirected to login with the target route preserved.

**Affected Modules**
- `frontend/` — initialized real dependency set (router, Zustand, TanStack Query, Axios, RHF, Zod, Tailwind v4, Vitest/RTL); Vite proxy + alias; Tailwind theme.
- `modules/auth` (frontend) — types, Zod schemas, `authApi` service, `useAuth` hooks, forms, and Login/Register/VerifyEmail pages.
- `modules/dashboard` (frontend) — placeholder authenticated landing.
- `shared` (frontend) — `apiClient`, `queryClient`, `authStore`, `themeStore`, route guards, layouts, and a reusable UI kit.

**Endpoints Consumed**
- `POST /api/auth/register`, `GET /api/auth/verify-email`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.

**Key Files Added**
| Area | Files |
|------|-------|
| Shared lib | `apiClient.ts`, `queryClient.ts`, `types.ts`, `cn.ts` |
| Stores | `authStore.ts`, `themeStore.ts` |
| UI kit | `Button`, `Input`, `Card`, `Alert`, `Modal`, `Loader`, `Spinner`, `EmptyState`, `Pagination`, `ThemeToggle` |
| Routing/layouts | `AppRoutes`, `ProtectedRoute`, `PublicOnlyRoute`, `paths`, `AuthLayout`, `AppLayout` |
| Auth module | `types`, `schemas`, `services/authApi`, `hooks/useAuth`, `LoginForm`, `RegisterForm`, `LoginPage`, `RegisterPage`, `VerifyEmailPage` |

**Tests (Vitest + RTL — 11 passing)**
| Suite | Covers |
|-------|--------|
| `authStore.test.ts` | session state transitions (set/clear, bootstrap flag) |
| `schemas.test.ts` | NU-email + password rules, login required fields |
| `LoginForm.test.tsx` | validation blocking submit, valid submit payload, server-error rendering |
| `ProtectedRoute.test.tsx` | redirect when unauthenticated, render when authenticated |

**Verification**
- `tsc -b` clean, `vitest run` 11/11 passing, `vite build` succeeds (240 modules, ~131 kB gzip JS).
- **Live end-to-end auth check** (Postgres in Docker + Spring Boot on :8080 + Vite on :5173): register → 201, non-NU email → 400, login-before-verify → 401, email verify → 200, login → 200 with `HttpOnly; SameSite=Strict` `access_token` cookie, `/me` with cookie → 200, logout → cookie cleared. Cookie round-trip re-validated through the Vite `/api` proxy (the exact browser path).

### Backend fixes required to boot/run (pre-existing bugs found during the live check)
The backend had never actually been run — two startup/runtime bugs surfaced and were fixed:
- **`RateLimitFilter` could not be constructed** — it injected a Jackson 2 `com.fasterxml.jackson.databind.ObjectMapper` bean, which Spring Boot 4 no longer autoconfigures (Boot 4 ships a Jackson 3 mapper). Fix: the filter now owns a private `new ObjectMapper()` (Jackson 2 is on the classpath via `jjwt-jackson`); removed the constructor injection.
- **Every INSERT failed with `StaleObjectStateException`** — `BaseEntity` pre-initialized `@Id` (`= UUID.randomUUID()`), so Spring Data's `save()` treated entities as non-new and issued `merge` (UPDATE) instead of `persist` (INSERT). Fix: `BaseEntity` now implements `Persistable<UUID>` with a `@Transient isNew` flag cleared on `@PostPersist`/`@PostLoad`; `@GeneratedValue` removed (id is application-assigned). Keeps the pre-set id (so unit tests still have a non-null id) while making inserts persist correctly.

### Frontend contract fix (found during the live check)
- Backend `Role` enum serializes as `ROLE_STUDENT` / `ROLE_FACULTY` / `ROLE_ADMIN`, not `STUDENT`/`FACULTY`/`ADMIN`. Updated the `UserRole` type and the dashboard role display (strips the `ROLE_` prefix for presentation). Tests updated accordingly.

**Known backend follow-up (not yet fixed)**
- `GET /api/auth/me` without a cookie returns **500** instead of 401: the route is under `permitAll`, so the controller dereferences a null `Authentication`. The frontend tolerates this (any error on the bootstrap `/me` is treated as "logged out"), but the endpoint should return 401. Recommend either securing `/api/auth/me` (move it out of the `permitAll` matcher) or null-checking `Authentication` in the controller.

---

## [0.7.0] — 2026-05-29

### Marketplace Module: Tests + Test Infrastructure Fixes

**Business Purpose**
Validates all Marketplace business rules, HTTP contracts, and error paths before advancing to the next module. Ensures no regressions can be merged silently.

**Architecture Decisions**
- `MarketplaceServiceImplTest` — pure unit test (`@ExtendWith(MockitoExtension.class)`), all dependencies mocked; service instantiated directly via constructor. `@MockitoSettings(LENIENT)` is used in `AuthServiceImplTest` for stubs that apply to some tests but not all.
- `MarketplaceControllerTest` — standalone MockMvc (`MockMvcBuilders.standaloneSetup`) because `@WebMvcTest` was removed in Spring Boot 4.0. `GlobalExceptionHandler` is added as controller advice so error-path status codes are tested end-to-end.
- Custom `asUser(Authentication)` `RequestPostProcessor` sets both `SecurityContextHolder` and `request.setUserPrincipal()` — the only reliable way to inject `Authentication auth` controller parameters in standalone MockMvc under Spring Boot 4.0 / Spring Framework 7.
- `BaseEntity.id` initialised with `UUID.randomUUID()` at field declaration — Hibernate respects pre-set `@Id` values and will not override. This fixes a class of unit test NPEs where JPA-generated UUIDs were null.
- `PageImpl` in controller tests created with `PageRequest.of(0, 12)` (not `Unpaged`) — `Unpaged.getOffset()` throws `UnsupportedOperationException` during Jackson serialization without the Spring Data Jackson module.
- `jackson-datatype-jsr310` is not on the test classpath (Spring Boot 4.0 / Jackson 2.21 regression); `MapperFeature.REQUIRE_HANDLERS_FOR_JAVA8_TIMES` is disabled in the test `ObjectMapper` so `LocalDateTime` falls back to default serialization. Tests assert structural correctness (`$.success`, `$.data.title`), not timestamp formats.
- Testcontainers artifact IDs updated for 2.x: `testcontainers-postgresql` and `testcontainers-junit-jupiter` (prefixed format replaces the old bare names).

**Domain Rules Validated**
- Only `AVAILABLE` listings can be edited or marked as sold
- Only the listing owner can edit, mark as sold, or remove
- Max 10 images per listing enforced
- A user cannot report the same listing twice
- A user cannot save the same listing twice
- `isSaved=true` is set correctly in listing detail when the viewer has saved the listing

**Affected Modules**
- `shared/entity/BaseEntity` — UUID pre-initialized at field declaration
- `shared/handler/GlobalExceptionHandler` — verified via controller test controller-advice setup
- `modules/marketplace` — full test coverage
- `modules/auth/controller` — `AuthControllerTest` migrated from `@WebMvcTest` to `standaloneSetup`
- `pom.xml` — Testcontainers version property and correct 2.x artifact IDs

**Test Classes**
| Class | Count | What is covered |
|-------|-------|-----------------|
| `MarketplaceServiceImplTest` | 22 | All service use cases: create, read, update, markAsSold, remove, save/unsave, report, suspend — happy paths and error paths |
| `MarketplaceControllerTest` | 22 | HTTP binding, `@Valid` enforcement, status codes, error propagation for all 12 endpoints |
| `AuthServiceImplTest` | 12 | All auth use cases (updated for `ApplicationEventPublisher` param) |
| `AuthControllerTest` | 8 | HTTP layer (migrated from `@WebMvcTest` to `standaloneSetup`) |

---

## [0.6.0] — 2026-05-29

### Marketplace Module

**Business Purpose**
Provides a campus-exclusive buy-and-sell platform where NU Laguna students can list items, browse listings with filters, save favourites, and report inappropriate content. All transactions happen within the trusted campus community.

**Architecture Decisions**
- `MarketplaceListing` carries rich domain behavior: `markAsSold()`, `remove()`, `suspend()`, `updateDetails()`, `addImage()`, `replaceImages()` — enforces the invariant that sold/removed listings cannot be edited
- `ListingImage` uses package-private factory `create()` — only `MarketplaceListing` (same package) creates images, enforcing the ownership relationship
- `ListingSpecification` (Specification Pattern) builds dynamic JPA criteria queries for keyword/category/condition/price filtering — avoids large JPQL strings and is easily extended
- `UserProfileReader` interface in `shared/` crosses the module boundary cleanly (DIP): `MarketplaceServiceImpl` depends on the abstraction; `UserProfileReaderImpl` in the profile module provides the implementation
- N+1 prevented in list views by calling `userProfileReader.findProfileSummaries(sellerIds)` in a single batch query before mapping the page
- Single listing detail uses `findByIdWithImages` (`LEFT JOIN FETCH`) to load images without a second query
- Admin `suspendListing` is restricted at the controller layer via `@PreAuthorize("hasRole('ADMIN')")`
- Soft-delete pattern: listings are never hard-deleted, status is set to `REMOVED` or `SUSPENDED`

**Domain Rules**
- Only `AVAILABLE` listings can be edited or marked as sold — domain invariant enforced in `updateDetails()` and `markAsSold()`
- Only the listing owner can edit, mark as sold, or remove their listing
- Max 10 images per listing — enforced in `addImage()` and `replaceImages()`
- Price must be >= 0 (free items allowed)
- A user cannot report the same listing twice

**Affected Modules**
- `modules/marketplace` (new — full module)
- `shared/profile` (new: `UserProfileReader` interface, `ProfileSummary` DTO)
- `modules/profile/application` (new: `UserProfileReaderImpl`)
- `modules/profile/repository` (updated: `findByUserIdIn`)

**Endpoints**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/marketplace` | JWT | Browse listings (keyword, category, condition, price, pagination) |
| GET | `/api/marketplace/{id}` | JWT | Get listing detail with images |
| POST | `/api/marketplace` | JWT | Create listing |
| PUT | `/api/marketplace/{id}` | JWT | Update listing (owner only) |
| PATCH | `/api/marketplace/{id}/sold` | JWT | Mark as sold (owner only) |
| DELETE | `/api/marketplace/{id}` | JWT | Remove listing (owner only) |
| POST | `/api/marketplace/{id}/save` | JWT | Save listing |
| DELETE | `/api/marketplace/{id}/save` | JWT | Unsave listing |
| POST | `/api/marketplace/{id}/report` | JWT | Report listing |
| GET | `/api/marketplace/my-listings` | JWT | Seller's own listings (paginated) |
| GET | `/api/marketplace/saved` | JWT | Saved listings (paginated) |
| PATCH | `/api/marketplace/{id}/suspend` | ADMIN | Suspend listing |

**Entities & Services**
- `MarketplaceListing` — core entity with domain behaviors
- `ListingImage` — `@OneToMany` with `orphanRemoval`, ordered by `displayOrder`
- `SavedListing` — unique per `(user_id, listing_id)`
- `ListingReport` — moderation, unique per `(reporter_id, listing_id)` enforced at service level
- `ListingSpecification` — Specification Pattern for dynamic filtering
- `MarketplaceService` / `MarketplaceServiceImpl`
- `UserProfileReader` / `UserProfileReaderImpl` — cross-module profile data access

**Flyway Migrations**
- `V4__marketplace.sql` — 4 tables with FK constraints, 9 indexes, GIN full-text search index on `title + description`

---

## [0.5.0] — 2026-05-29

### Error Handling Enhancement

**Business Purpose**
Ensures every possible bad-request scenario returns a structured, user-friendly JSON response instead of Spring's default HTML error page or an unhandled 500. Applies to all current and future modules.

**Architecture Decisions**
- All handlers return `ApiResponse.error(message)` for consistency with the rest of the API
- `DataIntegrityViolationException` acts as a DB-level safety net for cases where application-level checks are bypassed
- `NoResourceFoundException` catches requests to undefined routes (Spring 6+ replacement for `NoHandlerFoundException`)
- `ConstraintViolationException` handles `@Validated` violations on path variables and method parameters

**Handlers Added**
| Exception | HTTP Status | Scenario |
|-----------|-------------|----------|
| `HttpMessageNotReadableException` | 400 | Malformed / missing JSON body |
| `MethodArgumentTypeMismatchException` | 400 | Invalid enum or UUID in `@RequestParam` / `@PathVariable` |
| `MissingServletRequestParameterException` | 400 | Missing required `@RequestParam` |
| `ConstraintViolationException` | 400 | `@Validated` constraint on method parameter |
| `DataIntegrityViolationException` | 409 | DB constraint violated (safety net) |
| `NoResourceFoundException` | 404 | Request to undefined route |

**Affected Modules**
- `shared/handler/GlobalExceptionHandler`

---

## [0.4.0] — 2026-05-29

### User Profiles Module

**Business Purpose**
Gives every NU Laguna student a campus identity — a profile showing their name, course, year level, bio, and interests. Students can control who sees their details via a public/private visibility setting, and build a campus social graph through the follow/unfollow system.

**Architecture Decisions**
- `UserProfile` is a separate entity from `User` — SRP: `User` owns authentication identity, `UserProfile` owns campus presentation data. No cross-module entity access needed.
- Cross-module integration uses Spring's built-in `ApplicationEventPublisher` — `AuthServiceImpl` publishes `UserRegisteredEvent`; `ProfileEventListener` (in the profile module) handles it with `@TransactionalEventListener(AFTER_COMMIT)`, guaranteeing the `users` FK exists when the profile row is inserted
- `ProfileEventListener` catches and logs any profile creation failure — registration succeeds even if profile creation encounters an edge-case error
- `Follow` is a dedicated entity (not a collection on `UserProfile`) to support pagination, indexed queries, and the self-follow DB constraint without loading the full graph
- JPQL subqueries in `UserProfileRepository` fetch follower/following profiles in a single query — no N+1
- Response DTOs are assembled directly in the service (not via MapStruct) because of multiple computed fields (follower counts, `isFollowing`, privacy filtering) — avoids unnecessary abstraction per the rules

**Domain Rules**
- Every user gets exactly one profile, auto-created on registration via domain event
- A user cannot follow themselves — enforced by `Follow.create()` (domain) AND `CHECK (follower_id != following_id)` (database)
- A user cannot follow the same person twice — enforced by service check AND `UNIQUE (follower_id, following_id)` constraint (database)
- `PRIVATE` profiles: only the owner and confirmed followers see bio, course, year level, and interests; everyone else sees name + avatar only
- `PUBLIC` profiles: all authenticated users see full details
- Profile `fullName` is independently editable (display name); it is initialized from the registration event

**Affected Modules**
- `modules/profile` (new — full module)
- `shared/event` (new: `UserRegisteredEvent`)
- `modules/auth/application/AuthServiceImpl` (updated — publishes `UserRegisteredEvent`)

**Endpoints**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/profile/me` | JWT | Get own full profile |
| PUT | `/api/profile/me` | JWT | Update bio, course, year level, interests, fullName |
| PATCH | `/api/profile/me/visibility` | JWT | Change visibility (PUBLIC / PRIVATE) |
| GET | `/api/profile/{userId}` | JWT | View another user's profile (privacy-aware) |
| POST | `/api/profile/{userId}/follow` | JWT | Follow a user |
| DELETE | `/api/profile/{userId}/follow` | JWT | Unfollow a user |
| GET | `/api/profile/me/followers` | JWT | Paginated follower list |
| GET | `/api/profile/me/following` | JWT | Paginated following list |

**Entities & Services**
- `UserProfile` (entity) — `user_profiles` table; behaviors: `updateDetails()`, `changeVisibility()`, `updateAvatar()`, `isPublic()`
- `Follow` (entity) — `follows` table; `Follow.create()` enforces the self-follow invariant
- `ProfileVisibility` (enum) — `PUBLIC`, `PRIVATE`
- `YearLevel` (enum) — `FIRST` → `GRADUATE`
- `UserProfileRepository` — `findByUserId`, `findFollowerProfiles`, `findFollowingProfiles` (JPQL subquery)
- `FollowRepository` — `existsByFollowerIdAndFollowingId`, `countByFollowingId`, `countByFollowerId`, `deleteByFollowerIdAndFollowingId` (`@Modifying`)
- `ProfileService` / `ProfileServiceImpl` — all profile use cases
- `ProfileEventListener` — `@TransactionalEventListener(AFTER_COMMIT)` creates profile on registration

**Flyway Migrations**
- `V3__create_profiles_and_follows.sql` — `user_profiles` (FK → users, CASCADE), `follows` (two FKs → users, CASCADE, UNIQUE + CHECK constraints), four indexes

---

## [0.3.0] — 2026-05-29

### Security: Rate Limiting

**Business Purpose**
Protect authentication endpoints from brute-force and credential-stuffing attacks. Protect the general API surface from request flooding.

**Architecture Decisions**
- Bucket4j 8.10.1 (in-memory token-bucket algorithm) — pure Java, no external infrastructure required for development; Redis-backed buckets can be swapped in for distributed deployments without changing business logic
- `RateLimitFilter extends OncePerRequestFilter` placed before `JwtAuthFilter` in the Spring Security chain — rate limiting is evaluated before any authentication work
- Separate bucket maps for auth-sensitive endpoints (`/api/auth/login`, `/api/auth/register`) and all other endpoints — allows independent tuning per environment via env vars
- IP resolution respects `X-Forwarded-For` for proxy/load-balancer deployments
- Returns `429 Too Many Requests` with `X-Rate-Limit-Retry-After-Seconds` header and a consistent `ApiResponse` error body

**Domain Rules**
- Login and register: 5 requests/minute per IP (configurable via `RATE_LIMIT_AUTH`)
- All other API endpoints: 60 requests/minute per IP (configurable via `RATE_LIMIT_API`)
- Rate limits are relaxed to 100/1000 per minute in the `test` profile to avoid interference with tests

**Affected Modules**
- `shared/security` (new: `RateLimitFilter`; updated: `SecurityConfig`)

**Dependencies Added**
- `com.bucket4j:bucket4j-core:8.10.1`

---

### Auth Module: Tests

**Business Purpose**
Validate all authentication business rules, workflows, edge cases, and state transitions before advancing to the next module — per the development workflow standard.

**Architecture Decisions**
- `AuthServiceImplTest` — pure unit test (`@ExtendWith(MockitoExtension.class)`), all dependencies mocked; service instantiated directly via constructor for clean, framework-free testing
- `AuthControllerTest` — web slice test (`@WebMvcTest`) with a `@TestConfiguration` that provides a minimal, permissive `SecurityFilterChain` to isolate HTTP/validation behavior from the full security stack; `@MockitoBean` for service and cookie helper
- `NUverseLagunaApplicationTests` — full integration test (`@SpringBootTest`) backed by a real PostgreSQL instance via Testcontainers `@ServiceConnection`; verifies Flyway migrations run cleanly and all beans wire correctly
- `application-test.yml` — overrides rate limits to high values so tests are never throttled

**Tests Written**
| Class | Test | Validates |
|-------|------|-----------|
| `AuthServiceImplTest` | `register_validRequest` | user saved, email sent |
| | `register_nonNuEmail` | domain invariant, 400 |
| | `register_duplicateEmail` | uniqueness, 409 |
| | `login_validCredentials` | returns `LoginResult` with token |
| | `login_wrongPassword` | same error as not-found (prevents enumeration), 401 |
| | `login_emailNotFound` | 401 |
| | `login_pendingVerification` | canLogin() domain rule, 403 |
| | `verifyEmail_validToken` | activate() runs, token cleared |
| | `verifyEmail_invalidToken` | 400 |
| | `verifyEmail_alreadyActive` | activate() invariant enforced, 400 |
| | `getCurrentUser_found` | returns UserResponse |
| | `getCurrentUser_notFound` | ResourceNotFoundException |
| `AuthControllerTest` | `register_validRequest` | 201 |
| | `register_invalidEmail` | 400, no service call |
| | `register_weakPassword` | 400, no service call |
| | `register_blankName` | 400 |
| | `login_validCredentials` | 200 + Set-Cookie header |
| | `login_invalidCredentials` | 401 |
| | `logout` | 200 + cleared Set-Cookie |
| | `me_authenticated` | 200 + user data |
| `NUverseLagunaApplicationTests` | `contextLoads` | full context, real DB, migrations |

---

## [0.2.0] — 2026-05-29

### Authentication Module

**Business Purpose**
Provides secure, campus-exclusive registration and login. Only NU Laguna email accounts may register. All sessions are stateless and secured via JWT stored in HTTP-only cookies to prevent XSS-based token theft.

**Architecture Decisions**
- Follows strict layered architecture: Controller → Application Service → Domain → Repository
- `User` entity carries domain behavior (`activate()`, `suspend()`, `canLogin()`) — avoids anemic model
- JWT is stored in an HTTP-only, SameSite cookie — never in localStorage
- JWT auth filter reads token from cookie and sets `SecurityContext` using claims (userId + role) — no DB hit per request
- Email domain validation is config-driven via `AuthConfig` (`@ConfigurationProperties`) — configurable per environment
- `EmailService` is abstracted as an interface; `DevEmailService` logs the verification link — production SMTP swapped in without code changes (OCP)
- `LoginResult` is an internal transfer object — the token never appears in the response body

**Domain Rules**
- Email must match an allowed NU domain (default: `national-u.edu.ph`)
- Email must be unique across the system
- Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one digit
- New accounts start in `PENDING_VERIFICATION` status
- Only `ACTIVE` accounts may log in
- Email verification token is cleared after successful verification
- `activate()` enforces the invariant: can only activate a `PENDING_VERIFICATION` account

**Affected Modules**
- `modules/auth` (new)
- `shared/security` (new: `CookieHelper`)

**Endpoints**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | Public | Register a new NU Laguna account |
| GET | `/api/auth/verify-email?token=` | Public | Verify email with token |
| POST | `/api/auth/login` | Public | Authenticate and receive JWT cookie |
| POST | `/api/auth/logout` | Public | Clear JWT cookie |
| GET | `/api/auth/me` | JWT | Get current authenticated user |

**Entities & Services**
- `User` (entity) — `users` table
- `Role` (enum) — `ROLE_STUDENT`, `ROLE_FACULTY`, `ROLE_ADMIN`
- `UserStatus` (enum) — `PENDING_VERIFICATION`, `ACTIVE`, `SUSPENDED`
- `UserRepository` — `findByEmail`, `existsByEmail`, `findByVerificationToken`
- `AuthService` / `AuthServiceImpl` — registration, login, verification, current-user lookup
- `UserMapper` (MapStruct) — `User` → `UserResponse`
- `EmailService` / `DevEmailService` — verification email dispatch
- `CookieHelper` — JWT cookie creation and clearing via Spring `ResponseCookie`

**Flyway Migrations**
- `V2__create_users_table.sql` — creates `users` table with indexes on `email` and `verification_token`

---

## [0.1.0] — 2026-05-29

### Backend Foundation

**Business Purpose**
Establishes the production-ready infrastructure that all future modules build on. Defines the project's architecture, security model, shared building blocks, and database migration baseline.

**Architecture Decisions**
- Modular monolith: each feature lives under `modules/<name>` with isolated layers (controller, application, domain, repository, dto, mapper, infrastructure)
- Shared infrastructure in `shared/` (entity, response, exception, handler, security) — available to all modules, no cross-module entity manipulation
- `BaseEntity` provides UUID PK and JPA-audited `createdAt`/`updatedAt` to all entities
- `ApiResponse<T>` enforces a consistent JSON envelope across all endpoints: `{ success, message, data }`
- `GlobalExceptionHandler` centralizes error handling — stack traces never reach the client
- `SecurityConfig` is stateless (no sessions), with CORS, CSRF disabled, and `@EnableMethodSecurity` for `@PreAuthorize` on individual endpoints
- All configuration driven by environment variables with safe dev defaults in `application.yml`
- Flyway owns all schema changes — `ddl-auto=validate` so Hibernate only validates, never alters

**Domain Rules**
- All primary keys are UUIDs (PostgreSQL `uuid_generate_v4()`)
- All entities must have `created_at` and `updated_at` (enforced by `BaseEntity`)
- Business logic must not live in controllers or repositories

**Affected Modules**
- `shared/entity`, `shared/response`, `shared/exception`, `shared/handler`, `shared/security` (all new)

**Entities & Services**
- `BaseEntity` — abstract mapped superclass with UUID PK and audit timestamps
- `ApiResponse<T>` — typed response record
- `AppException` — base runtime exception carrying `HttpStatus`
- `ResourceNotFoundException` — 404 extension of `AppException`
- `GlobalExceptionHandler` — handles `AppException`, `MethodArgumentNotValidException`, `AccessDeniedException`, generic fallback
- `JwtService` — JJWT 0.12 token generation/validation; embeds `role` claim
- `JwtAuthFilter` — `OncePerRequestFilter`; reads JWT from HTTP-only cookie; no DB lookup
- `SecurityConfig` — stateless filter chain, BCrypt encoder, CORS, `AuthenticationManager`

**Dependencies Added**
- JJWT 0.12.6 (`jjwt-api`, `jjwt-impl`, `jjwt-jackson`)
- MapStruct 1.6.3 + `lombok-mapstruct-binding`
- Testcontainers (`postgresql`, `junit-jupiter`, `spring-boot-testcontainers`)
- `spring-boot-starter-test`, `spring-boot-starter-security-test`

**Flyway Migrations**
- `V1__enable_uuid_extension.sql` — enables `uuid-ossp` PostgreSQL extension

---
