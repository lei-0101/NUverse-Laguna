import { Link } from 'react-router-dom'
import { paths } from '@/shared/routes/paths'

const SPORTS = [
  { icon: '⚽', name: 'Football', schedule: 'Mon & Wed · 4–6 PM · Field A' },
  { icon: '🏀', name: 'Basketball', schedule: 'Tue & Thu · 4–6 PM · Gym Court' },
  { icon: '🏐', name: 'Volleyball', schedule: 'Fri · 4–7 PM · Court 2' },
  { icon: '🎾', name: 'Badminton', schedule: 'Mon–Fri · 7–9 AM · Covered Court' },
  { icon: '🏊', name: 'Swimming', schedule: 'Sat · 8 AM–12 PM · Pool' },
  { icon: '🥊', name: 'Taekwondo', schedule: 'Wed & Fri · 5–7 PM · Studio B' },
  { icon: '🏃', name: 'Track & Field', schedule: 'Daily · 6–7 AM · Track Oval' },
  { icon: '🎱', name: 'Billiards', schedule: 'Mon–Thu · 1–5 PM · Game Room' },
]

const PROGRAMS = [
  {
    title: 'Varsity Program',
    desc: 'Represent NU Laguna in UAAP and inter-school competitions. Open to all enrolled students who pass the tryouts.',
    badge: 'Competitive',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    title: 'Intramural Sports',
    desc: 'Compete against your classmates and department. Held every semester — sign up through your class representative.',
    badge: 'School-Wide',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Fitness & Wellness',
    desc: 'Drop-in classes for all skill levels: yoga, zumba, HIIT, and strength training. No sign-up needed — just show up.',
    badge: 'Open to All',
    color: 'from-amber-500 to-orange-600',
  },
]

export function InspirePage() {
  return (
    <div className="space-y-10 animate-[page-enter_0.3s_ease-out]">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#1a2f7a] to-[#0a1550] px-8 py-16 text-center text-white">
        <div className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.05) 40px, rgba(255,255,255,0.05) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.05) 40px, rgba(255,255,255,0.05) 41px)',
          }}
        />
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/60">NU Laguna</p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Inspire Sports Academy
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
          Where Bulldogs become champions. Pursue excellence on and off the field.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <span className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">🏆 UAAP Varsity</span>
          <span className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">🎽 Intramurals</span>
          <span className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">💪 Fitness Programs</span>
          <span className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">🐾 Go Bulldogs!</span>
        </div>
      </div>

      {/* Programs */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Programs</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PROGRAMS.map((p) => (
            <div key={p.title} className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6">
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${p.color}`} />
              <span className={`inline-block rounded-full bg-gradient-to-r ${p.color} px-2.5 py-0.5 text-xs font-semibold text-white`}>
                {p.badge}
              </span>
              <h3 className="mt-3 text-base font-semibold text-foreground">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sports Schedule */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Sports & Schedules</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SPORTS.map((s) => (
            <div
              key={s.name}
              className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="text-3xl">{s.icon}</span>
              <div>
                <p className="font-semibold text-foreground">{s.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{s.schedule}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Facilities */}
      <section className="rounded-2xl border border-border bg-surface p-6 space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Facilities</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {['🏟️ Multi-Purpose Gym', '🏊 Olympic Pool', '⚽ Football Field', '🏃 400m Track', '🎯 Game Room', '🧘 Wellness Studio', '🏋️ Weight Room', '🚿 Modern Locker Rooms'].map((f) => (
            <div key={f} className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2.5 text-sm font-medium text-foreground">
              {f}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl bg-gradient-to-br from-accent/10 via-amber-50/30 to-transparent dark:from-accent/5 dark:via-transparent border border-accent/20 p-8 text-center">
        <p className="text-2xl font-extrabold text-foreground">Ready to join the Bulldogs?</p>
        <p className="mt-2 text-sm text-muted-foreground">Visit the Sports Office at Building C, Room 101, or email sports@nu-laguna.edu.ph</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to={paths.dashboard}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </div>
  )
}
