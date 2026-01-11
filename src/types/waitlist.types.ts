import { waitlistTable } from '@/db/schema.js'

export type WaitlistStatus = 'waiting' | 'notified' | 'expired'
export type Waitlist = typeof waitlistTable.$inferSelect
