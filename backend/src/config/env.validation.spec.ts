import 'reflect-metadata';
import { Environment, validate } from './env.validation';

describe('Environment Validation', () => {
  it('should validate and parse valid environment configuration', () => {
    const config = {
      NODE_ENV: 'development',
      PORT: '4000',
      FRONTEND_URL: 'http://localhost:3000',
      CORS_ORIGIN: 'http://localhost:3000',
    };

    const result = validate(config);
    expect(result.NODE_ENV).toBe(Environment.Development);
    expect(result.PORT).toBe(4000);
    expect(result.FRONTEND_URL).toBe('http://localhost:3000');
  });

  it('should provide default values for optional variables', () => {
    const config = {};
    const result = validate(config);

    expect(result.NODE_ENV).toBe(Environment.Development);
    expect(result.PORT).toBe(4000);
    expect(result.FRONTEND_URL).toBe('http://localhost:3000');
  });

  it('should throw error when NODE_ENV is invalid', () => {
    const config = {
      NODE_ENV: 'invalid_environment',
    };

    expect(() => validate(config)).toThrow('Environment validation failed');
  });

  it('should throw error when PORT is out of range', () => {
    const config = {
      PORT: '999999',
    };

    expect(() => validate(config)).toThrow('Environment validation failed');
  });
});
