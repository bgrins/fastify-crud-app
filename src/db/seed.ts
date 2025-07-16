import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, '../../data/app.db')
const db = new Database(dbPath)

// Enable foreign key constraints
db.pragma('foreign_keys = ON')

console.log('🌱 Starting database seed...')

const clearTables = () => {
  db.exec('DELETE FROM posts')
  db.exec('DELETE FROM users')
  console.log('✅ Cleared existing data')
}

const seedUsers = () => {
  const users = [
    { name: 'John Doe', email: 'john@example.com' },
    { name: 'Jane Smith', email: 'jane@example.com' },
    { name: 'Bob Johnson', email: 'bob@example.com' },
    { name: 'Alice Williams', email: 'alice@example.com' },
    { name: 'Charlie Brown', email: 'charlie@example.com' },
  ]

  const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)')

  for (const user of users) {
    stmt.run(user.name, user.email)
  }

  console.log(`✅ Created ${users.length} users`)
  return users.length
}

const seedPosts = () => {
  const posts = [
    {
      title: 'Getting Started with Fastify',
      content: 'Fastify is a fast and low overhead web framework for Node.js...',
      user_id: 1,
    },
    {
      title: 'Building RESTful APIs',
      content: 'REST APIs are a crucial part of modern web development...',
      user_id: 1,
    },
    {
      title: 'TypeScript Best Practices',
      content: 'TypeScript helps catch errors early and improve code quality...',
      user_id: 2,
    },
    {
      title: 'Database Design Patterns',
      content: 'Good database design is essential for scalable applications...',
      user_id: 2,
    },
    {
      title: 'Authentication in Node.js',
      content: 'Securing your API endpoints is critical...',
      user_id: 3,
    },
    {
      title: 'Testing Strategies',
      content: 'Writing good tests ensures your code works as expected...',
      user_id: 3,
    },
    {
      title: 'Docker for Development',
      content: 'Containerization makes deployment consistent...',
      user_id: 4,
    },
    {
      title: 'CI/CD Best Practices',
      content: 'Automated deployment pipelines save time and reduce errors...',
      user_id: 4,
    },
    {
      title: 'Microservices Architecture',
      content: 'Breaking applications into smaller services has many benefits...',
      user_id: 5,
    },
    {
      title: 'Performance Optimization',
      content: 'Making your applications fast requires attention to detail...',
      user_id: 5,
    },
  ]

  const stmt = db.prepare('INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)')

  for (const post of posts) {
    stmt.run(post.title, post.content, post.user_id)
  }

  console.log(`✅ Created ${posts.length} posts`)
  return posts.length
}

try {
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
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  clearTables()
  seedUsers()
  seedPosts()

  console.log('✨ Database seeding completed successfully!')
} catch (error) {
  console.error('❌ Error seeding database:', error)
  process.exit(1)
} finally {
  db.close()
}
