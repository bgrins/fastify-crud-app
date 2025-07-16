import fp from 'fastify-plugin'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { FastifyInstance } from 'fastify'
import { isDevelopment } from '../config/index.js'

async function securityPlugin(fastify: FastifyInstance): Promise<void> {
  // Add security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: isDevelopment
      ? false
      : {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
          },
        },
  })

  // Add rate limiting
  await fastify.register(rateLimit, {
    max: 100, // max requests per window
    timeWindow: '1 minute',
    allowList: ['127.0.0.1'], // Allow localhost in development
    skipOnError: true, // Don't apply rate limit if server errors
    keyGenerator: (request) => {
      return (
        (request.headers['x-forwarded-for'] as string) ||
        (request.headers['x-real-ip'] as string) ||
        request.ip
      )
    },
    errorResponseBuilder: (request, context) => {
      return {
        statusCode: 429,
        error: 'Too Many Requests',
        message: `Rate limit exceeded, retry in ${context.after}`,
        date: Date.now(),
        expiresIn: context.ttl,
      }
    },
  })
}

export default fp(securityPlugin, { name: 'security' })
