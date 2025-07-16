import fp from 'fastify-plugin'
import fastifyStatic from '@fastify/static'
import path from 'path'
import { fileURLToPath } from 'url'
import { FastifyInstance } from 'fastify'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function staticPlugin(fastify: FastifyInstance): Promise<void> {
  await fastify.register(fastifyStatic, {
    root: path.join(__dirname, '../../public'),
    prefix: '/app/',
  })
}

export default fp(staticPlugin, { name: 'static' })
