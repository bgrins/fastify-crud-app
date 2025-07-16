import { FastifyInstance } from 'fastify'
import { User, CreateUserInput, ErrorResponse } from '../types/index.js'
import { userValidation } from '../utils/validation.js'

interface IdParam {
  id: number
}

export default async function (fastify: FastifyInstance): Promise<void> {
  const userSchema = {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      created_at: { type: 'string' },
      updated_at: { type: 'string' },
    },
  }

  const createUserSchema = {
    type: 'object',
    required: ['name', 'email'],
    properties: {
      name: userValidation.name,
      email: userValidation.email,
    },
    additionalProperties: false,
  }

  fastify.get<{
    Reply: User[] | ErrorResponse
  }>(
    '/users',
    {
      schema: {
        response: {
          200: {
            type: 'array',
            items: userSchema,
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const users = fastify.db.prepare('SELECT * FROM users').all() as User[]
        return users
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.get<{
    Params: IdParam
    Reply: User | ErrorResponse
  }>(
    '/users/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
          },
        },
        response: {
          200: userSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const user = fastify.db
          .prepare('SELECT * FROM users WHERE id = ?')
          .get(request.params.id) as User | undefined
        if (!user) {
          return reply.code(404).send({ error: 'User not found' })
        }
        return user
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.post<{
    Body: CreateUserInput
    Reply: User | ErrorResponse
  }>(
    '/users',
    {
      schema: {
        body: createUserSchema,
        response: {
          201: userSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { name, email } = request.body

        // Check if email already exists
        const existingUser = fastify.db.prepare('SELECT id FROM users WHERE email = ?').get(email)
        if (existingUser) {
          return reply.code(409).send({ error: 'Email already exists' })
        }

        const stmt = fastify.db.prepare('INSERT INTO users (name, email) VALUES (?, ?)')
        const result = stmt.run(name, email)
        const user = fastify.db
          .prepare('SELECT * FROM users WHERE id = ?')
          .get(result.lastInsertRowid) as User
        return reply.code(201).send(user)
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.put<{
    Params: IdParam
    Body: CreateUserInput
    Reply: User | ErrorResponse
  }>(
    '/users/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
          },
        },
        body: createUserSchema,
        response: {
          200: userSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { name, email } = request.body

        // Check if email already exists for another user
        const existingUser = fastify.db
          .prepare('SELECT id FROM users WHERE email = ? AND id != ?')
          .get(email, request.params.id)
        if (existingUser) {
          return reply.code(409).send({ error: 'Email already exists' })
        }

        const stmt = fastify.db.prepare(
          'UPDATE users SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        )
        const result = stmt.run(name, email, request.params.id)

        if (result.changes === 0) {
          return reply.code(404).send({ error: 'User not found' })
        }

        const user = fastify.db
          .prepare('SELECT * FROM users WHERE id = ?')
          .get(request.params.id) as User
        return user
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.delete<{
    Params: IdParam
  }>(
    '/users/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const stmt = fastify.db.prepare('DELETE FROM users WHERE id = ?')
        const result = stmt.run(request.params.id)

        if (result.changes === 0) {
          return reply.code(404).send({ error: 'User not found' })
        }

        return reply.code(204).send()
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    }
  )
}
