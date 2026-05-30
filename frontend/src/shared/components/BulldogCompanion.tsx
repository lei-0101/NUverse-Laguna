import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { paths } from '@/shared/routes/paths'
import { cn } from '@/shared/lib/cn'

// ── Daily trivia ──────────────────────────────────────────────────────────────

const QUOTES = [
  "Did you know? NU Laguna's Bulldogs represent tenacity and loyalty. 🐾",
  "Today's tip: The library has private study pods — book one before they fill up!",
  "Quote: 'Education is not preparation for life; education is life itself.' — Dewey",
  "Fun fact: NUverse was built by NU Laguna students, for NU Laguna students. 💙",
  "Reminder: Your chibi earns XP when you RSVP to events. Try it!",
  "Did you know? NU Laguna has one of the greenest campuses in the province. 🌿",
  "Today's tip: Post your old textbooks on the Marketplace — help a classmate!",
  "Trivia: The Bulldog has been NU's mascot since 1947. Woof! 🐕",
  "Today's goal: Explore one module you haven't tried yet.",
  "Fun fact: The Bulldog Exchange restocks limited items periodically. Check back!",
  "Quote: 'The secret of getting ahead is getting started.' — Mark Twain",
  "Tip: Follow your classmates to see their listings and events on your feed!",
  "Did you know? Lost & Found items can be resolved within the same day!",
  "Motivation: Level up your Chibi by participating across all of NUverse. You've got this!",
  "Campus tip: The study halls on the 3rd floor are quietest on weekday mornings.",
  "Quote: 'Success is not final, failure is not fatal.' — Churchill",
  "Tip: Vote for Ideas that matter to you on the Suggestions page!",
  "Fun fact: NUverse Laguna tracks your XP across 10+ actions. How high can you go?",
  "Today's challenge: Greet a classmate you haven't talked to this week. 👋",
  "Reminder: Your marketplace listings get more views in the morning hours!",
  "Quote: 'Be the change you wish to see in the world.' — Gandhi",
  "Tip: Upload a profile photo — users with avatars get 30 bonus XP!",
  "Did you know? RSVP'd events show on your profile for classmates to see.",
  "Campus tip: The cafeteria has a secret lunch menu on Fridays. Ask nicely!",
  "Fun fact: You can earn XP just by logging in daily. Consistency wins! 📈",
  "Quote: 'The only way to do great work is to love what you do.' — Jobs",
  "Today's vibe: Study hard, explore campus, and woof on. 🐕‍🦺",
  "Tip: Complete your profile to unlock 50 XP and help people find you!",
  "Did you know? Critical announcements appear as a red banner at the top of every page.",
  "Motivation: Bulldog Pup → NUverse Legend is only 20 levels away. Start now!",
]

function getDailyQuote(): string {
  const today = new Date()
  const index = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % QUOTES.length
  return QUOTES[index]
}

function getTodayKey(): string {
  const d = new Date()
  return `nuverse_chibi_thought_${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`
}

// ── Page-aware emotes ─────────────────────────────────────────────────────────

type Emote = 'idle' | 'happy' | 'excited' | 'curious' | 'yawn' | 'sleep' | 'woof' | 'cheer'

const PATH_EMOTES: Record<string, Emote> = {
  [paths.events]:      'cheer',
  [paths.marketplace]: 'curious',
  [paths.chibi]:       'excited',
  [paths.exchange]:    'happy',
  [paths.lostFound]:   'curious',
  [paths.suggestions]: 'happy',
}

// ── Mini bulldog SVG ──────────────────────────────────────────────────────────

function BulldogFace({ emote, eyeOffset }: { emote: Emote; eyeOffset: { x: number; y: number } }) {
  const ox = eyeOffset.x
  const oy = eyeOffset.y

  const eyes = emote === 'sleep'
    ? <>
        <path d="M17 20 Q19 18 21 20" stroke="#1a1d24" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M27 20 Q29 18 31 20" stroke="#1a1d24" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </>
    : emote === 'excited' || emote === 'cheer'
    ? <>
        <circle cx="19" cy="20" r="5.5" fill="white" />
        <circle cx="29" cy="20" r="5.5" fill="white" />
        <circle cx={19.5 + ox} cy={20.5 + oy} r="3.5" fill="#1a1d24" />
        <circle cx={29.5 + ox} cy={20.5 + oy} r="3.5" fill="#1a1d24" />
        <circle cx={20.5 + ox} cy={19.5 + oy} r="1.2" fill="white" />
        <circle cx={30.5 + ox} cy={19.5 + oy} r="1.2" fill="white" />
      </>
    : <>
        <circle cx="19" cy="20" r="5" fill="white" />
        <circle cx="29" cy="20" r="5" fill="white" />
        <circle cx={19.5 + ox} cy={20.5 + oy} r="2.8" fill="#1a1d24" />
        <circle cx={29.5 + ox} cy={20.5 + oy} r="2.8" fill="#1a1d24" />
        <circle cx={20.5 + ox} cy={19.5 + oy} r="0.9" fill="white" />
        <circle cx={30.5 + ox} cy={19.5 + oy} r="0.9" fill="white" />
      </>

  const mouth = emote === 'yawn'
    ? <ellipse cx="24" cy="32" rx="5" ry="6" fill="#1a1d24" />
    : emote === 'sleep'
    ? <path d="M20 33 Q24 36 28 33" stroke="#8b4513" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    : emote === 'happy' || emote === 'excited' || emote === 'cheer'
    ? <>
        <path d="M19 31 Q24 37 29 31" stroke="#8b4513" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M20 32 Q24 36 28 32" fill="white" stroke="none" />
      </>
    : <path d="M20 32 Q24 35 28 32" stroke="#8b4513" strokeWidth="1.5" fill="none" strokeLinecap="round" />

  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      {/* Ears */}
      <ellipse cx="10" cy="14" rx="7" ry="9" fill="#e8a460" />
      <ellipse cx="38" cy="14" rx="7" ry="9" fill="#e8a460" />
      <ellipse cx="10" cy="14" rx="4" ry="5.5" fill="rgba(220,80,60,0.4)" />
      <ellipse cx="38" cy="14" rx="4" ry="5.5" fill="rgba(220,80,60,0.4)" />
      {/* Head */}
      <circle cx="24" cy="24" r="18" fill="#f5c58a" />
      {/* NU jersey collar patch */}
      <rect x="16" y="38" width="16" height="6" rx="3" fill="#1f3a8a" />
      <text x="24" y="43.5" textAnchor="middle" fill="#f5b300" fontSize="5" fontWeight="bold">N</text>
      {/* Eyes */}
      {eyes}
      {/* Snout */}
      <ellipse cx="24" cy="30" rx="8" ry="5.5" fill="#fcd9a8" />
      <ellipse cx="24" cy="26.5" rx="3.5" ry="2.5" fill="#2a1a0a" />
      {/* Mouth */}
      {mouth}
      {/* Collar tag */}
      <circle cx="24" cy="36.5" r="2" fill="#f5b300" />

      {/* ZZZ in sleep mode */}
      {emote === 'sleep' && (
        <text x="33" y="12" fill="#99a1b3" fontSize="7" fontWeight="bold">Z</text>
      )}
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function BulldogCompanion() {
  const navigate = useNavigate()
  const location = useLocation()
  const [emote, setEmote] = useState<Emote>('idle')
  const [showBubble, setShowBubble] = useState(false)
  const [bubbleState, setBubbleState] = useState<'typing' | 'text'>('typing')
  const [woofVisible, setWoofVisible] = useState(false)
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const emoteTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const woofTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Page-aware emote on route change
  useEffect(() => {
    const routeEmote = PATH_EMOTES[location.pathname]
    if (routeEmote) {
      setEmote(routeEmote)
      const t = setTimeout(() => setEmote('idle'), 3000)
      return () => clearTimeout(t)
    }
    setEmote('idle')
  }, [location.pathname])

  // Random idle emotes every 20–45s
  useEffect(() => {
    const IDLE_EMOTES: Emote[] = ['happy', 'yawn', 'curious']
    const schedule = () => {
      const delay = 20000 + Math.random() * 25000
      emoteTimerRef.current = setTimeout(() => {
        const pick = IDLE_EMOTES[Math.floor(Math.random() * IDLE_EMOTES.length)]
        setEmote(pick)
        setTimeout(() => setEmote('idle'), 2000)
        schedule()
      }, delay)
    }
    schedule()
    return () => { if (emoteTimerRef.current) clearTimeout(emoteTimerRef.current) }
  }, [])

  // Random WOOF bubble every 60–90s
  useEffect(() => {
    const schedule = () => {
      const delay = 60000 + Math.random() * 30000
      woofTimerRef.current = setTimeout(() => {
        setWoofVisible(true)
        setTimeout(() => setWoofVisible(false), 1500)
        schedule()
      }, delay)
    }
    schedule()
    return () => { if (woofTimerRef.current) clearTimeout(woofTimerRef.current) }
  }, [])

  // Sleep after 30s idle
  useEffect(() => {
    const resetIdle = () => {
      setEmote('idle')
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(() => setEmote('sleep'), 30000)
    }
    resetIdle()
    window.addEventListener('mousemove', resetIdle, { passive: true })
    window.addEventListener('keydown', resetIdle, { passive: true })
    return () => {
      window.removeEventListener('mousemove', resetIdle)
      window.removeEventListener('keydown', resetIdle)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [])

  // Show daily thought bubble after 5s if not seen today
  useEffect(() => {
    const key = getTodayKey()
    if (localStorage.getItem(key)) return
    const t = setTimeout(() => {
      setShowBubble(true)
      setBubbleState('typing')
      setTimeout(() => setBubbleState('text'), 2000)
    }, 5000)
    return () => clearTimeout(t)
  }, [])

  // Eye-tracking — cursor shifts pupils toward mouse (max 3px)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const btn = buttonRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const maxDist = 120
    const factor = Math.min(dist, maxDist) / maxDist
    setEyeOffset({ x: (dx / (dist || 1)) * factor * 3, y: (dy / (dist || 1)) * factor * 3 })
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  const handleClick = () => {
    if (showBubble) {
      localStorage.setItem(getTodayKey(), '1')
      setShowBubble(false)
    } else {
      navigate(paths.chibi)
    }
  }

  return (
    <div
      className="pointer-events-auto fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
      style={{ userSelect: 'none' }}
    >
      {/* WOOF bubble */}
      {woofVisible && (
        <div className="animate-[page-enter_0.2s_ease-out] rounded-full border border-border bg-surface px-3 py-1 text-sm font-bold text-foreground shadow-lg">
          WOOF! 🐾
        </div>
      )}

      {/* Daily thought bubble — cloud shape */}
      {showBubble && (
        <div
          className="relative w-56 cursor-pointer transition-all hover:scale-[1.02]"
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleClick()}
          aria-label="Today's tip from your Bulldog companion"
        >
          {/* Cloud body */}
          <div
            className="rounded-2xl border border-border bg-surface p-3 shadow-lg"
            style={{ boxShadow: '0 4px 20px rgba(74,110,232,0.12)' }}
          >
            {bubbleState === 'typing' ? (
              <div className="flex gap-1 py-1 px-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-2 w-2 rounded-full bg-muted-foreground"
                    style={{ animation: `idle-bob 0.8s ease-in-out ${i * 0.15}s infinite` }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs leading-relaxed text-foreground">
                {getDailyQuote()}
                <span className="mt-1.5 block text-right text-xs font-medium text-primary">Tap to dismiss →</span>
              </p>
            )}
          </div>
          {/* Cloud tail dots */}
          <div className="flex items-end justify-end gap-1 px-4 pt-1" aria-hidden="true">
            <div className="h-3 w-3 rounded-full border border-border bg-surface shadow-sm" />
            <div className="h-2 w-2 rounded-full border border-border bg-surface shadow-sm" />
            <div className="h-1.5 w-1.5 rounded-full border border-border bg-surface shadow-sm" />
          </div>
        </div>
      )}

      {/* The chibi */}
      <button
        ref={buttonRef}
        onClick={handleClick}
        className={cn(
          'group flex h-16 w-16 items-center justify-center rounded-2xl bg-surface shadow-xl transition-all duration-200',
          'hover:scale-110 hover:shadow-2xl active:scale-95',
          emote === 'sleep' ? 'opacity-80' : '',
        )}
        style={{
          border: '2px solid transparent',
          background: 'linear-gradient(var(--color-surface), var(--color-surface)) padding-box, linear-gradient(135deg, #f5b300, #4a6ee8, #f5b300) border-box',
          boxShadow: '0 4px 20px rgba(245,179,0,0.20), 0 2px 8px rgba(0,0,0,0.15)',
        }}
        aria-label="Bulldog companion — click to go to your Chibi page"
        title="Your Bulldog companion"
      >
        <div style={{ animation: 'idle-bob 3s ease-in-out infinite' }}>
          <BulldogFace emote={emote} eyeOffset={emote === 'sleep' ? { x: 0, y: 0 } : eyeOffset} />
        </div>
      </button>
    </div>
  )
}
