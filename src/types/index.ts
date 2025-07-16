import { Database } from 'better-sqlite3'

declare module 'fastify' {
  interface FastifyInstance {
    db: Database
  }
}

export interface User {
  id: number
  name: string
  email: string
  created_at: string
  updated_at: string
}

export interface Post {
  id: number
  title: string
  content: string
  user_id: number
  created_at: string
  updated_at: string
}

export interface CreateUserInput {
  name: string
  email: string
}

export interface CreatePostInput {
  title: string
  content: string
  user_id: number
}

export interface UpdatePostInput {
  title: string
  content: string
}

export interface ErrorResponse {
  error: string
}
