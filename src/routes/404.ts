import { FastifyInstance } from 'fastify'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
      statusCode: 404,
    })
  })
}
