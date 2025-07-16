import { FastifyInstance } from 'fastify'
import { Post, CreatePostInput, UpdatePostInput, ErrorResponse } from '../types/index.js'
import { postValidation } from '../utils/validation.js'

interface IdParam {
  id: number
}

interface UserIdParam {
  userId: number
}

export default async function (fastify: FastifyInstance): Promise<void> {
  const postSchema = {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      title: { type: 'string' },
      content: { type: 'string' },
      user_id: { type: 'integer' },
      created_at: { type: 'string' },
      updated_at: { type: 'string' },
    },
  }

  const createPostSchema = {
    type: 'object',
    required: ['title', 'content', 'user_id'],
    properties: {
      title: postValidation.title,
      content: postValidation.content,
      user_id: postValidation.user_id,
    },
    additionalProperties: false,
  }

  fastify.get<{
    Reply: Post[] | ErrorResponse
  }>(
    '/posts',
    {
      schema: {
        response: {
          200: {
            type: 'array',
            items: postSchema,
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const posts = fastify.db.prepare('SELECT * FROM posts').all() as Post[]
        return posts
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.get<{
    Params: IdParam
    Reply: Post | ErrorResponse
  }>(
    '/posts/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
          },
        },
        response: {
          200: postSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const post = fastify.db
          .prepare('SELECT * FROM posts WHERE id = ?')
          .get(request.params.id) as Post | undefined
        if (!post) {
          return reply.code(404).send({ error: 'Post not found' })
        }
        return post
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.get<{
    Params: UserIdParam
    Reply: Post[] | ErrorResponse
  }>(
    '/users/:userId/posts',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            userId: { type: 'integer' },
          },
        },
        response: {
          200: {
            type: 'array',
            items: postSchema,
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const posts = fastify.db
          .prepare('SELECT * FROM posts WHERE user_id = ?')
          .all(request.params.userId) as Post[]
        return posts
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.post<{
    Body: CreatePostInput
    Reply: Post | ErrorResponse
  }>(
    '/posts',
    {
      schema: {
        body: createPostSchema,
        response: {
          201: postSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { title, content, user_id } = request.body

        // Check if user exists
        const user = fastify.db.prepare('SELECT id FROM users WHERE id = ?').get(user_id)
        if (!user) {
          return reply.code(400).send({ error: 'Invalid user_id: User does not exist' })
        }

        const stmt = fastify.db.prepare(
          'INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)'
        )
        const result = stmt.run(title, content, user_id)
        const post = fastify.db
          .prepare('SELECT * FROM posts WHERE id = ?')
          .get(result.lastInsertRowid) as Post
        return reply.code(201).send(post)
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.put<{
    Params: IdParam
    Body: UpdatePostInput
    Reply: Post | ErrorResponse
  }>(
    '/posts/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
          },
        },
        body: {
          type: 'object',
          required: ['title', 'content'],
          properties: {
            title: postValidation.title,
            content: postValidation.content,
          },
          additionalProperties: false,
        },
        response: {
          200: postSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { title, content } = request.body
        const stmt = fastify.db.prepare(
          'UPDATE posts SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        )
        const result = stmt.run(title, content, request.params.id)

        if (result.changes === 0) {
          return reply.code(404).send({ error: 'Post not found' })
        }

        const post = fastify.db
          .prepare('SELECT * FROM posts WHERE id = ?')
          .get(request.params.id) as Post
        return post
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.delete<{
    Params: IdParam
  }>(
    '/posts/:id',
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
        const stmt = fastify.db.prepare('DELETE FROM posts WHERE id = ?')
        const result = stmt.run(request.params.id)

        if (result.changes === 0) {
          return reply.code(404).send({ error: 'Post not found' })
        }

        return reply.code(204).send()
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    }
  )
}
