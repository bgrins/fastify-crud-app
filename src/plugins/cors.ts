import fp from 'fastify-plugin'
import cors from '@fastify/cors'
import { FastifyInstance } from 'fastify'
import { config, isDevelopment } from '../config/index.js'

async function corsPlugin(fastify: FastifyInstance): Promise<void> {
  await fastify.register(cors, {
    origin: isDevelopment ? true : config.corsOrigin,
    credentials: true,
  })
}

export default fp(corsPlugin, { name: 'cors' })
