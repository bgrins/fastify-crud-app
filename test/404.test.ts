import { test } from 'node:test'
import assert from 'node:assert'
import Fastify from 'fastify'
import notFoundRoute from '../src/routes/404.js'

test('GET /non-existent returns 404', async (t) => {
  const fastify = Fastify()
  await fastify.register(notFoundRoute)

  const response = await fastify.inject({
    method: 'GET',
    url: '/non-existent-route',
  })

  assert.strictEqual(response.statusCode, 404)
  const body = JSON.parse(response.body)
  assert.strictEqual(body.error, 'Not Found')
  assert.ok(body.message.includes('/non-existent-route'))

  await fastify.close()
})
