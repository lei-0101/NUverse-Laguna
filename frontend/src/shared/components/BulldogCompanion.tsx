import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { paths } from '@/shared/routes/paths'
import { cn } from '@/shared/lib/cn'

// ── Messages — silly, goofy, trivia, jokes, barks ─────────────────────────────

const MESSAGES = [
  // ── Goofy / Silly / Random ─────────────────────────────────────────────────
  "bro you're still here. okay. *sits next to you* fine. 🐾",
  "I had a whole personality crisis today. turns out I'm just a dog. moving on.",
  "ngl I forgot what I was doing. what were YOU doing. were any of us doing anything. 🌀",
  "I bit my tongue earlier. not relevant to your life but I needed someone to know. 😤",
  "staring contest. go. ... you blinked. I win. 🐶",
  "my brain said 'new idea!' then immediately said 'nah.' same.",
  "I sneezed so hard I saw the matrix for a second.",
  "you ever just sit there thinking about absolutely nothing for 20 minutes? no? just me? okay.",
  "current status: existing. that's the update.",
  "I walked into a room and forgot why. twice. in a row. thriving.",
  "my sleep schedule is beyond repair. I've accepted it. I'm at peace. you should be too. 😌",
  "okay but what ARE we even doing here. genuinely asking. 🌌",
  "I got distracted 4 times just now and I'm a dog with no homework. imagine being you rn 😭",
  "bro I thought of the funniest thing and then immediately forgot it. devastating.",
  "I tried speed-reading my textbook. finished. understood nothing. moving on.",
  "my alarm went off. I said 'noted' and went back to sleep. no regrets. 😴",
  "6-step morning routine: alarm, snooze, alarm, snooze, alarm, late. flawless.",
  "submitted a 2-page reflection at 11:59. I am bro. bro was right. 😤",
  "'just one episode' — me, 4 episodes ago. the assignment knows. 🍿",
  "study aesthetic: hoodie, no sleep, mild panic. very authentic.",
  "group chat sent 'may meeting ba tayo tonight?' at 11pm. I have ascended. 🌌",
  "refreshed my grades portal 40 times. it changed. for the worse. respect.",
  "I put 'student' in my bio. the most fiction I've written all semester.",
  "pro tip: 'moreover' adds half a page to any essay. you're welcome. 📝",
  "'I'll start after I eat.' I am still eating. send help. 🍜",
  "everyone's confident until the internet dies during submission. every time. 😤",
  "my spirit animal is a USB that only works on the third try. 🔄",
  "I have been described as 'a lot.' I consider it a compliment. 🐾",
  "the word 'just' in a professor's sentence is never just. 'just read 3 chapters.' yeah okay.",
  "I opened 7 tabs to study. I closed 7 tabs. I stared at the wall. productive.",
  "bro said 'I work better under pressure' and created the pressure himself. I know him well. it's me.",

  // ── Friend-enemy / No-filter bestie energy ────────────────────────────────
  "you're not my favorite person today. but you're top 5. that's something. 🐾",
  "I would take a bullet for you. I would also eat the last piece of bread without telling you. it's complicated.",
  "the audacity to be here instead of finishing that output. respect honestly. 😤",
  "I'm rooting for you. silently. because I don't wanna make it weird.",
  "you're okay I guess. don't make it a big deal.",
  "I saw what you submitted last minute. we don't talk about it. we move forward.",
  "genuinely can't tell if you're entertaining or annoying. keeping you around to find out.",
  "hey. I think you're doing fine. don't quote me on that.",
  "if you fail I will immediately start planning your comeback. because that's what dogs do. 🐾",
  "you're actually not that bad. I said what I said. don't push it. 🐾",
  "ngl I've been judging your screen time this whole time. still here though. 👀",
  "I'll defend you to anyone who talks bad about you. I will also be the first to roast you. that's the deal.",
  "would lend you a pen. would forget you borrowed it. would deny it. friendship.",
  "if you wake me up to borrow notes at midnight we are DONE. 😤",
  "I care about you AND I judge your life choices. both true. simultaneously. 🐕",
  "you snooped my profile and I snooped yours. we're even. don't bring it up. 👀",
  "I will hype you up in public and roast you in private. this is what loyalty looks like.",
  "I wanna support you but you keep doing things last minute and it's giving me secondhand stress.",
  "bro your group mates are so lucky to have you. sucks to be them. jk. (half jk.)",
  "you haven't texted back in 3 hours but you've been active. I saw. 👁️",

  // ── Calling you out (playfully) ────────────────────────────────────────────
  "locking in? you? with those tabs open? respect the commitment. 💀",
  "you said 'I'll do it later' like 4 hours ago. it is now later. just noting. 👀",
  "not saying your sleep schedule is broken. I'm just saying mine is perfect. 😴",
  "you've been on this page for a while. impressive focus. or impressive avoidance. could be both.",
  "that last-minute submission energy? historically effective. keep it up. 😤",
  "you have an unread notification. it's probably nothing. or everything. check it. 📳",
  "fun observation: you're still here. funny how that works. 🐾",
  "how many times have you reread that same paragraph? just asking. asking for a friend. that friend is me.",
  "your to-do list is looking at you. I can see it from here. 👁️",
  "you scrolled right past something back there. not judging. I'd do the same.",

  // ── Singing (with attitude) ────────────────────────────────────────────────
  "🎵 we don't talk about homework, no no no— 🎵",
  "🎵 all by myselfffff... IN THE ZONE... at midniiiight~ 🎵",
  "🎵 don't stop me now, I'm procrastinating, having such a good time~ 🎵",
  "🎵 somebody once told me the deadline's gonna get me~ 🎵",
  "🎵 I will survive~ I will survive~ 🎵 academic version, no notes.",
  "🎵 this is fine, this is fine, everything is fine~ 🎵 (it's not.)",
  "🎵 can't stop won't stop scrolling~ 🎵 please stop.",
  "🎵 BAAAARK BAAARK BAAARK BAAARK— 🎵 that's my original song. streams only.",
  "🎵 requirements requirements wag mo akong ganyanin~ 🎵",

  // ── Trivia (dry delivery) ──────────────────────────────────────────────────
  "🐙 octopuses have three hearts. I have one and it's stressed for you.",
  "🦈 sharks are older than trees. your problems are temporary. sharks are forever.",
  "🌙 the moon drifts 3.8cm away from Earth every year. it's doing a slow walk-out. iconic.",
  "🐝 bees can recognize human faces. they see you. they know.",
  "📏 a day on Venus is longer than a year on Venus. your semester felt the same? valid.",
  "⚡ lightning hits Earth 100 times per second. somewhere out there someone's having a worse day.",
  "🐾 bulldogs were bred in England for bull-baiting. we reinvented ourselves. you can too.",
  "🧠 the human brain is 60% fat. so the next time someone calls you a fathead, technically—",
  "📊 NU Laguna is in Calamba — city of hot springs. this is trivia and also a threat.",
  "🏆 NU Bulldogs UAAP champions. multiple times. we don't talk about off-seasons.",

  // ── Platform reminders (unbothered tone) ──────────────────────────────────
  "you have an unread announcement. probably important. probably. 📢",
  "there are events you haven't RSVPed to. just leaving that here. 🎪",
  "Bulldog Exchange reservations expire in 48 hours. just saying. ⏳",
  "log in tomorrow too. XP. streak. do it. 🔥",
  "your profile's incomplete. I'm not judging. (I'm judging.) 👤",
  "there's a Lost & Found section if you lost something. or found something. use it. 🔍",

  // ── Random bro moments ─────────────────────────────────────────────────────
  "ZZZ— HUH?! you're here. I knew that. I was testing you. passed. 👀",
  "current mood: 🐕 full send. no notes.",
  "I have been professionally trained to be adorable. degree: Paws University, cum laude. 🎓",
  "I woke up like this. flawless. you should see me. 💅",
  "one day you'll look back at this semester and LAUGH. and it'll be hilarious. trust.",
  "life gave you requirements. you submitted them. you WON. that's the arc.",
  "BARK. 🐾 that's it. that's the hype. you're welcome.",
  "ngl you're kind of growing on me. don't let it get to your head tho. 🐾",
  "personal motto: bark first, overthink never. try it.",
  "nothing to say today just vibing and watching you do great things. 🐕",
  "some days you're the dog. some days you're the whole campus. today? the campus. 🏫",
  "I COULD say something profound but I'll let your energy speak. it's speaking. loud.",

  // ── Greetings ─────────────────────────────────────────────────────────────
  "oh hey! you're back. I missed you. don't tell anyone. 🐾",
  "HELLO!! hi. okay. calm. hi. 👋",
  "good morning! or afternoon. or evening. whatever — you made it. that's the win.",
  "hey hey hey. look who showed up. legend behavior. 🐶",
  "oh you're online! same. I've been here the whole time. watching. supportively. 👀",
  "greetings, fellow campus being. how goes the survival? 🏫",
  "HI. okay I'm excited. I've been sitting here waiting. how are you ACTUALLY.",
  "you came back and that means something. I don't know what. but something. 🐾",
  "welcome back to the campus universe! population: you, me, and everyone else trying. 🌐",
  "oh wow you're here. didn't see you come in. (I did. I watched the whole thing.)",

  // ── Conversational ────────────────────────────────────────────────────────
  "what's on your mind? actually don't tell me. I can't reply. but I felt like asking. 🐕",
  "if you could have one superpower right now what would it be. I'd pick infinite focus. or snacks.",
  "be honest. what tab are you actually on right now. no judgment. I know it's not this one.",
  "quick question: are you okay? like genuinely. nod once for yes. twice for 'I need snacks.'",
  "what's the most unhinged thing you've done for a deadline? I feel like it's a good story.",
  "if this app was a person, what would you say to it? I'd say 'thank you for existing' obviously. 🐾",
  "random: what's your go-to comfort food when studying? mine is imaginary because I'm a chibi. 🍜",
  "tell me your favorite module on this app. no wait I already know. it's me. the chibi. obviously.",
  "hypothetically: if you could change one thing about uni life, what would it be? I'd add more nap rooms.",
  "I've been thinking and honestly you're doing better than you think. not saying more. just that.",

  // ── Cute / Impactful ──────────────────────────────────────────────────────
  "you walked in here today. that took something. respect. 🐾",
  "not everything has to be productive. sometimes existing is enough. and you're doing great at existing.",
  "small wins count. submitted? win. ate today? win. opened the app? actually yes, win. 🏆",
  "you are literally the only person who can do what you do. think about that for a sec.",
  "there's something cool about the fact that you're still going. not everyone does. you do. 🐕",
  "your presence matters here. on campus. in this app. also in my heart but that's embarrassing.",
  "being here — even just scrolling — means you're still in it. and that's actually huge.",
  "I hope you know that today didn't break you. tomorrow you wake up again. that's the whole thing.",
  "the fact that you're still trying after everything? lowkey one of the most impressive things I've seen. 🐾",

  // ── Funny jokes ───────────────────────────────────────────────────────────
  "why did the student bring a ladder to school? because the course was at a higher level. 🎓",
  "what do you call a dog who aces every exam? a labra-DOOCTOR. (I'm the dog. I'm the doctor.) 🐶",
  "why don't programmers like nature? too many bugs. 🐛 (not me tho I am a feature.)",
  "what's the difference between a teacher and a train? one says 'spit out your gum,' the other says 'chew chew.' 🚂",
  "I told a joke about Wi-Fi. nobody got it. 📶 classic.",
  "why did the student eat his homework? teacher said it was a piece of cake. 🍰 (different from the assignment being easy.)",
  "what do you call a sleeping dog on a college campus? a nap-rador. that's me on any given Tuesday. 😴",
  "how do you comfort a grammar nerd? 'there, their, they're.' 🤭",
  "I asked my pencil if it was tired. it said 'I'm write on the edge.' ✏️ I laughed alone.",
  "why is studying like a broken pencil? pointless. WAIT no — only when you skip the review. review your notes. 😤",
  "what do you call a dog who does magic tricks? a labracadabrador. I'm him. 🐾✨",
  "why don't scientists trust atoms? they make up everything. just like my group mate's excuses. 😤",
  "knock knock. who's there? Ambi. Ambi who? Ambiguous exam instructions, welcome to college. 😭",
  "I tried to write a chemistry joke. no reaction. 🧪 story of my life.",
  "what's the most popular subject in witch school? spell-ing. 🧙 I'm going to leave now.",

  // ── Beautiful / Uplifting (delivered casually) ────────────────────────────
  "every big thing started small. you included. 🌱",
  "someone out there is going to be really glad you didn't quit today. that someone might be you.",
  "you are built for harder things than this. and you're still going. quietly impressive. 🐾",
  "the version of you from a year ago would be kind of amazed by where you are now. just saying.",
  "your chapter isn't done yet. don't summarize it too early. keep writing. ✍️",
  "you don't have to have it all figured out. neither do I and I'm doing great. relatively. 🐕",
  "the campus is better because you're in it. I don't say this to everyone. (I say it to everyone. but I mean it.)",
  "growth isn't always loud. sometimes it's just quietly showing up. and you did. 🌟",
]

function getRandomMessage(): string {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)]
}

// ── Page-aware emotes ─────────────────────────────────────────────────────────

type Emote = 'idle' | 'happy' | 'excited' | 'curious' | 'yawn' | 'sleep' | 'woof' | 'cheer'

const PATH_EMOTES: Record<string, Emote> = {
  [paths.events]:      'cheer',
  [paths.marketplace]: 'curious',
  [paths.chibi]:       'excited',
  [paths.exchange]:    'happy',
  [paths.lostFound]:   'curious',
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
      {/* NU jersey collar */}
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
  const [bubbleMsg, setBubbleMsg] = useState('')
  const [bubbleState, setBubbleState] = useState<'typing' | 'text'>('typing')
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const emoteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bubbleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openBubble = useCallback(() => {
    setBubbleMsg(getRandomMessage())
    setShowBubble(true)
    setBubbleState('typing')
    const textTimer = setTimeout(() => setBubbleState('text'), 1500)
    // Auto-dismiss after 20 seconds
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    dismissTimerRef.current = setTimeout(() => {
      setShowBubble(false)
      clearTimeout(textTimer)
    }, 20000)
  }, [])

  const closeBubble = useCallback(() => {
    setShowBubble(false)
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
  }, [])

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

  // Speech bubble every 1 minute, auto-dismiss after 20s
  useEffect(() => {
    // Show first bubble after 8s
    const firstTimer = setTimeout(openBubble, 8000)
    // Then every 60s
    const intervalId = setInterval(openBubble, 60000)
    bubbleIntervalRef.current = intervalId
    return () => {
      clearTimeout(firstTimer)
      clearInterval(intervalId)
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    }
  }, [openBubble])

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

  const handleBulldogClick = () => {
    if (showBubble) {
      closeBubble()
    } else {
      navigate(paths.chibi)
    }
  }

  return (
    <div
      className="pointer-events-auto fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
      style={{ userSelect: 'none' }}
    >
      {/* Speech bubble */}
      {showBubble && (
        <div
          className="relative w-60 cursor-pointer transition-all hover:scale-[1.02] animate-[page-enter_0.25s_ease-out]"
          onClick={closeBubble}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && closeBubble()}
          aria-label="Dismiss Bulldog companion message"
        >
          {/* Cloud body */}
          <div
            className="rounded-2xl border border-border bg-surface p-3 shadow-xl"
            style={{ boxShadow: '0 4px 24px rgba(74,110,232,0.14)' }}
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
                {bubbleMsg}
                <span className="mt-1.5 block text-right text-[10px] font-medium text-muted-foreground">
                  tap to dismiss · auto-closes in 20s
                </span>
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

      {/* The chibi button */}
      <button
        ref={buttonRef}
        onClick={handleBulldogClick}
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
