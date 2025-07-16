import { FastifyInstance } from 'fastify'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/', async (request, reply) => {
    reply.redirect('/app/')
  })
}
