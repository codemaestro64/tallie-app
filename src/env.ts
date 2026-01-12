import { z } from 'zod'
import dotenv from 'dotenv'
import { NodeEnv } from '@/types/index.js'

export const DEFAULT_PORT = 3000
export const DEFAULT_SHUTDOWN_TIMEOUT = 10_000

// Load env file for the current environment
const envFile =
  process.env.NODE_ENV === 'test'
    ? '.env.test'
    : process.env.NODE_ENV === 'development'
      ? '.env.development'
      : '.env'
dotenv.config({ path: envFile })

const envSchema = z.object({
  NODE_ENV: z
    .enum([NodeEnv.Development, NodeEnv.Production, NodeEnv.Test])
    .catch(NodeEnv.Development),
  PORT: z.coerce.number().int().min(1).max(65535).catch(DEFAULT_PORT),
  APP_NAME: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-_]+$/, 'APP_NAME must be lowercase and URL-safe'),
  DB_STORAGE: z.enum(['local', 'system']).default('local'),

  DB_FILE_NAME: z.string().min(1).endsWith('.sqlite', 'DB_FILE_NAME must end with .sqlite'),
  CORS_ORIGINS: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(',').map((s) => s.trim()) : undefined)),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  SHUTDOWN_TIMEOUT: z.coerce.number().int().positive().catch(DEFAULT_SHUTDOWN_TIMEOUT),
})

export const env = envSchema.parse(process.env)
export type Env = z.infer<typeof envSchema>
