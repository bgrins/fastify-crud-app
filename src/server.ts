import Fastify from 'fastify'
import path from 'path'
import { fileURLToPath } from 'url'
import autoLoad from '@fastify/autoload'
import './types/index.js'
import { config, isDevelopment } from './config/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const fastify = Fastify({
  logger: isDevelopment
    ? {
        level: config.logLevel,
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      }
    : {
        level: config.logLevel,
      },
})

fastify.register(autoLoad, {
  dir: path.join(__dirname, 'plugins'),
})

fastify.register(autoLoad, {
  dir: path.join(__dirname, 'routes'),
})

const start = async (): Promise<void> => {
  try {
    await fastify.listen({ port: config.port, host: config.host })
    fastify.log.info(`Server listening on http://${config.host}:${config.port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

// Graceful shutdown
const gracefulShutdown = async (): Promise<void> => {
  fastify.log.info('Received shutdown signal, closing server...')
  try {
    await fastify.close()
    fastify.log.info('Server closed successfully')
    process.exit(0)
  } catch (err) {
    fastify.log.error('Error during shutdown:', err)
    process.exit(1)
  }
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

start()
