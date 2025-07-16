import fp from 'fastify-plugin'
import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { config } from '../config/index.js'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function databasePlugin(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  const dbPath = path.isAbsolute(config.dbPath)
    ? config.dbPath
    : path.join(__dirname, '../..', config.dbPath)

  // Ensure directory exists
  const dbDir = path.dirname(dbPath)
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  const db = new Database(dbPath)

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Enable foreign key constraints (they're disabled by default in SQLite)
  db.pragma('foreign_keys = ON')

  fastify.decorate('db', db)

  fastify.addHook('onClose', (instance, done) => {
    db.close()
    done()
  })
}

export default fp(databasePlugin, { name: 'database' })
