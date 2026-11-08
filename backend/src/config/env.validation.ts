import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

const INSECURE_DEFAULT_SECRETS = new Set([
  'bizpro_access_secret_super_secure_key_change_in_production',
  'bizpro_refresh_secret_super_secure_key_change_in_production',
  'bizpro_aes_256_gcm_durable_secret_key_32b!',
  'secret',
  'changeme',
  'password',
  'admin',
  '12345678',
  'supersecret',
]);

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  PORT: number = 4000;

  @IsString()
  @IsOptional()
  FRONTEND_URL: string = 'http://localhost:3000';

  @IsString()
  @IsOptional()
  CORS_ORIGIN: string = 'http://localhost:3000';

  @IsString()
  @IsOptional()
  DATABASE_URL?: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_SECRET?: string;

  @IsString()
  @IsOptional()
  JWT_REFRESH_SECRET?: string;

  @IsString()
  @IsOptional()
  AUTH_RESPONSE_ENVELOPE_KEY?: string;

  @IsBoolean()
  @IsOptional()
  ENABLE_SWAGGER?: boolean;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((err) => Object.values(err.constraints || {}).join(', '))
      .join('; ');
    throw new Error(`Environment validation failed: ${messages}`);
  }

  const isProduction = validatedConfig.NODE_ENV === Environment.Production;

  // STRICT PRODUCTION VALIDATION RULES (BLK-01)
  if (isProduction) {
    const missing: string[] = [];
    const weak: string[] = [];
    const defaults: string[] = [];

    // 1. Mandatory Presence Checks
    if (!validatedConfig.JWT_ACCESS_SECRET) {
      missing.push('JWT_ACCESS_SECRET');
    }
    if (!validatedConfig.JWT_REFRESH_SECRET) {
      missing.push('JWT_REFRESH_SECRET');
    }
    if (!validatedConfig.AUTH_RESPONSE_ENVELOPE_KEY) {
      missing.push('AUTH_RESPONSE_ENVELOPE_KEY');
    }
    if (!validatedConfig.DATABASE_URL) {
      missing.push('DATABASE_URL');
    }

    if (missing.length > 0) {
      throw new Error(
        `[SECURITY ERROR] Production startup rejected: Missing mandatory environment secret(s): ${missing.join(', ')}. In production, all cryptographic secrets must be explicitly provided.`,
      );
    }

    // 2. Reject Insecure Default / Known Placeholder Secrets
    if (INSECURE_DEFAULT_SECRETS.has(validatedConfig.JWT_ACCESS_SECRET!)) {
      defaults.push('JWT_ACCESS_SECRET');
    }
    if (INSECURE_DEFAULT_SECRETS.has(validatedConfig.JWT_REFRESH_SECRET!)) {
      defaults.push('JWT_REFRESH_SECRET');
    }
    if (INSECURE_DEFAULT_SECRETS.has(validatedConfig.AUTH_RESPONSE_ENVELOPE_KEY!)) {
      defaults.push('AUTH_RESPONSE_ENVELOPE_KEY');
    }

    if (defaults.length > 0) {
      throw new Error(
        `[SECURITY ERROR] Production startup rejected: Default/placeholder secret(s) detected for: ${defaults.join(', ')}. Known default keys must NEVER be used in production.`,
      );
    }

    // 3. Minimum Cryptographic Entropy Checks (At least 32 characters)
    if (validatedConfig.JWT_ACCESS_SECRET!.length < 32) {
      weak.push('JWT_ACCESS_SECRET (must be >= 32 characters)');
    }
    if (validatedConfig.JWT_REFRESH_SECRET!.length < 32) {
      weak.push('JWT_REFRESH_SECRET (must be >= 32 characters)');
    }
    if (validatedConfig.AUTH_RESPONSE_ENVELOPE_KEY!.length < 32) {
      weak.push('AUTH_RESPONSE_ENVELOPE_KEY (must be >= 32 characters)');
    }

    if (weak.length > 0) {
      throw new Error(
        `[SECURITY ERROR] Production startup rejected: Insecure weak secret(s): ${weak.join(', ')}. Provide high-entropy secrets (256-bit+).`,
      );
    }

    // 4. Database URL Safety Check
    if (
      validatedConfig.DATABASE_URL!.includes('bizpro_user:bizpro_password')
    ) {
      throw new Error(
        '[SECURITY ERROR] Production startup rejected: DATABASE_URL must not connect with the default development credentials (bizpro_user:bizpro_password).',
      );
    }
  } else {
    // Development / Test Fallbacks with prominent warning
    if (!validatedConfig.DATABASE_URL) {
      validatedConfig.DATABASE_URL =
        'postgresql://bizpro_app:bizpro_password@localhost:5432/bizpro_db?schema=public';
    }
    if (!validatedConfig.JWT_ACCESS_SECRET) {
      validatedConfig.JWT_ACCESS_SECRET =
        'bizpro_access_secret_super_secure_key_change_in_production';
    }
    if (!validatedConfig.JWT_REFRESH_SECRET) {
      validatedConfig.JWT_REFRESH_SECRET =
        'bizpro_refresh_secret_super_secure_key_change_in_production';
    }
    if (!validatedConfig.AUTH_RESPONSE_ENVELOPE_KEY) {
      validatedConfig.AUTH_RESPONSE_ENVELOPE_KEY =
        'bizpro_aes_256_gcm_durable_secret_key_32b!';
    }
  }

  return validatedConfig;
}
