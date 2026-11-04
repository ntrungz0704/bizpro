import { SetMetadata } from '@nestjs/common';
import { BYPASS_TRANSFORM_KEY } from '../constants';

/**
 * Decorator to bypass global response transformation.
 * Useful for file downloads, health checks, or raw streaming responses.
 */
export const BypassTransform = () => SetMetadata(BYPASS_TRANSFORM_KEY, true);
