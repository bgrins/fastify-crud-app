export const config = {
  host: process.env.HOST || '0.0.0.0',
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  dbPath: process.env.DB_PATH || './data/app.db',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}

export const isDevelopment = config.nodeEnv === 'development'
export const isProduction = config.nodeEnv === 'production'
