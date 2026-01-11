import app from './app.js'
import { env } from './env.js'
import logger from '@/utils/log.js'
import { db } from '@/db/client.js'

/**
 * Bootstrap function
 * Initializes async services (DB, caches, etc.) before starting HTTP server
 */
async function bootstrap() {
  try {
    // Initialize DB
    await db.initialize()

    // Start HTTP server
    const server = app.listen(env.PORT, () => {
      logger.info(`API running in ${env.NODE_ENV} mode on port ${env.PORT}`)
    })

    // Graceful shutdown
    const shutdown = (signal: string) => {
      logger.info(`${signal} received. Closing server...`)
      server.close(() => {
        logger.info('HTTP server closed. Exiting process.')
        process.exit(0)
      })

      setTimeout(() => {
        logger.error('Shutdown timed out. Forcing exit.')
        process.exit(1)
      }, env.SHUTDOWN_TIMEOUT)
    }

    process.on('SIGINT', () => shutdown('SIGINT'))
    process.on('SIGTERM', () => shutdown('SIGTERM'))

    // Catch uncaught/unhandled exceptions
    process.on('uncaughtException', (err) => {
      logger.error(err, 'Uncaught Exception')
      process.exit(1)
    })
    process.on('unhandledRejection', (reason) => {
      logger.error(reason as Error, 'Unhandled Rejection')
    })
  } catch (err) {
    logger.error(err as Error, 'Failed to bootstrap app')
    process.exit(1)
  }
}

bootstrap()
