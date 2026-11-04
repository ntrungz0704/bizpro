import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';
import { TransformResponseInterceptor } from './transform-response.interceptor';

describe('TransformResponseInterceptor', () => {
  let interceptor: TransformResponseInterceptor<any>;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    interceptor = new TransformResponseInterceptor(reflector);
  });

  it('should transform data into standard success envelope', (done) => {
    const mockContext = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const callHandler = {
      handle: () => of({ id: 1, name: 'BizPro' }),
    };

    interceptor.intercept(mockContext, callHandler).subscribe((result: any) => {
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual({ id: 1, name: 'BizPro' });
      expect(result.timestamp).toBeDefined();
      done();
    });
  });

  it('should bypass transformation when @BypassTransform() is present', (done) => {
    const mockContext = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const rawData = { raw: 'data' };
    const callHandler = {
      handle: () => of(rawData),
    };

    interceptor.intercept(mockContext, callHandler).subscribe((result: any) => {
      expect(result).toBe(rawData);
      expect(result.success).toBeUndefined();
      done();
    });
  });

  it('should not double-wrap if response already has envelope structure', (done) => {
    const mockContext = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const existingEnvelope = {
      success: true,
      statusCode: 200,
      data: 'custom',
      timestamp: '2026-11-04T00:00:00.000Z',
    };

    const callHandler = {
      handle: () => of(existingEnvelope),
    };

    interceptor.intercept(mockContext, callHandler).subscribe((result: any) => {
      expect(result).toEqual(existingEnvelope);
      done();
    });
  });
});
