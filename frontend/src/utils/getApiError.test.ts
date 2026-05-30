import { describe, expect, it } from 'vitest';
import { getApiError } from './getApiError';

describe('getApiError', () => {
  it('returns detail when present', () => {
    const err = {
      isAxiosError: true,
      response: {
        status: 409,
        data: { detail: 'Username already exists' }
      }
    };
    expect(getApiError(err)).toBe('Username already exists');
  });
});
