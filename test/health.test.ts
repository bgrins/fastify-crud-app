import { test } from 'node:test'
import assert from 'node:assert'
import Fastify from 'fastify'
import healthRoute from '../src/routes/health.js'

test('GET /health returns ok status', async (t) => {
  const fastify = Fastify()
  await fastify.register(healthRoute)

  const response = await fastify.inject({
    method: 'GET',
    url: '/health',
  })

  assert.strictEqual(response.statusCode, 200)
  const body = JSON.parse(response.body)
  assert.strictEqual(body.status, 'ok')
  assert.ok(body.timestamp)

  await fastify.close()
})
