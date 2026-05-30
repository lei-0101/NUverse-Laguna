import { Link } from 'react-router-dom'
import { paths } from '@/shared/routes/paths'
import { NUverseMark } from '@/shared/components/NUverseMark'

const NUIS_FEATURES = [
  { icon: '📋', title: 'Student Records', desc: 'View and download your official transcript, enrollment form, and academic history.' },
  { icon: '💳', title: 'Online Payments', desc: 'Pay tuition, fees, and miscellaneous charges securely through NUIS.' },
  { icon: '📅', title: 'Enrollment', desc: 'Enroll online, add/drop subjects, and manage your section during enrollment periods.' },
  { icon: '📊', title: 'Grades & GWA', desc: 'Check your grades per subject and see your General Weighted Average anytime.' },
  { icon: '🔔', title: 'School Notices', desc: 'Receive official notices from the Registrar, Finance, and Academic offices.' },
  { icon: '🎓', title: 'Graduation Status', desc: 'Track your graduation requirements and clearance status.' },
]

export function NuisPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-10 animate-[page-enter_0.3s_ease-out]">
      {/* Header */}
      <div className="text-center space-y-4 max-w-xl">
        <div className="flex justify-center">
          <NUverseMark size={56} />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          NUIS Integration
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          The <strong>NU Information System (NUIS)</strong> is your official portal for academic records, enrollment, and institutional services. NUverse links you directly — your NUIS login is your NU email and student ID.
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {NUIS_FEATURES.map((f) => (
          <div
            key={f.title}
            className="flex gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="text-2xl shrink-0">{f.icon}</span>
            <div>
              <p className="font-semibold text-sm text-foreground">{f.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main CTA */}
      <div className="w-full max-w-sm space-y-3">
        <a
          href="https://onlineapp.nu-laguna.edu.ph/portal/services.php"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-[#3b5bd9] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30"
        >
          Access NU Online Portal ↗
        </a>
        <p className="text-center text-xs text-muted-foreground">
          Opens in a new tab. Use your NU email to log in.
        </p>
      </div>

      {/* Info note */}
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface-muted p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Having trouble? Contact the Registrar's Office at{' '}
          <span className="font-medium text-foreground">registrar@nu-laguna.edu.ph</span>{' '}
          or visit Building A, Room 102.
        </p>
      </div>

      <Link to={paths.dashboard} className="text-sm font-medium text-primary hover:underline">
        ← Back to Home
      </Link>
    </div>
  )
}
