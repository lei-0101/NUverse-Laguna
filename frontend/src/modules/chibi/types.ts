export interface ChibiProfile {
  userId: string
  xp: number
  level: number
  title: string | null
  xpToNextLevel: number
  xpForCurrentLevel: number
  xpForNextLevel: number
  achievements: string[]
  createdAt: string
}
