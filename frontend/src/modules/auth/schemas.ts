import { z } from 'zod'

/** NU Laguna email domain — server is the source of truth; this is a fast UX check. */
const NU_EMAIL_DOMAIN = 'national-u.edu.ph'

const passwordRules = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Include at least one lowercase letter')
  .regex(/[A-Z]/, 'Include at least one uppercase letter')
  .regex(/\d/, 'Include at least one number')

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be at most 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email')
    .refine(
      (value) => value.toLowerCase().endsWith(`@${NU_EMAIL_DOMAIN}`),
      `Use your NU Laguna email (@${NU_EMAIL_DOMAIN})`,
    ),
  password: passwordRules,
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
