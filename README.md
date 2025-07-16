# Fastify CRUD App

A demo TypeScript REST API built with Fastify and SQLite, designed to test GitHub Actions workflows for automated version tagging and Docker image publishing to GitHub Container Registry (ghcr.io).

## Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev     # Development at http://localhost:3000

# Populate sample data
npm run seed
```

### Docker
```bash
# Using docker-compose
docker-compose up

# Or build and run manually
docker build -t fastify-crud-app .
docker run -p 3000:3000 -v $(pwd)/data:/app/data fastify-crud-app
```

Visit http://localhost:3000 for the web UI or http://localhost:3000/docs for API documentation.

## GitHub Release Workflow

Push to main or manually trigger the workflow to:
1. Bump version in package.json
2. Create git tag and GitHub release  
3. Build and publish multi-arch Docker image to ghcr.io

```bash
# Run with docker-compose (includes volume for persistent data)
docker-compose up

# Or pull from registry
docker pull ghcr.io/[username]/fastify-crud-app:latest
docker run -p 3000:3000 -v $(pwd)/data:/app/data ghcr.io/[username]/fastify-crud-app:latest
```

## Stack

- **Fastify** - Fast Node.js web framework
- **TypeScript** - Type safety
- **SQLite** - Embedded database with better-sqlite3
- **Docker** - Multi-stage builds for production
- **GitHub Actions** - Automated releases and container publishing