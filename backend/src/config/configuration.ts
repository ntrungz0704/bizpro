export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  database: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://bizpro_app:bizpro_password@localhost:5432/bizpro_db?schema=public',
  },
  auth: {
    accessSecret:
      process.env.JWT_ACCESS_SECRET ||
      'bizpro_access_secret_super_secure_key_change_in_production',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      'bizpro_refresh_secret_super_secure_key_change_in_production',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
    envelopeKey:
      process.env.AUTH_RESPONSE_ENVELOPE_KEY ||
      'bizpro_aes_256_gcm_durable_secret_key_32b!',
  },
  swagger: {
    enabled:
      process.env.ENABLE_SWAGGER !== undefined
        ? process.env.ENABLE_SWAGGER === 'true'
        : process.env.NODE_ENV !== 'production',
  },
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
});
