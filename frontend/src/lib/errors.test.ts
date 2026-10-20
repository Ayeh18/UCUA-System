import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';

import { getErrorMessage } from './errors';

function apiError(status: number, data: unknown) {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, {
    status,
    statusText: '',
    data,
    headers: {},
    config,
  });
}

describe('getErrorMessage', () => {
  it('uses a string detail from the API', () => {
    expect(getErrorMessage(apiError(401, { detail: 'Invalid staff ID or password' }))).toBe(
      'Invalid staff ID or password',
    );
  });

  it('uses the first validation message and strips the "Value error" prefix', () => {
    const error = apiError(422, {
      detail: [{ msg: 'Value error, Password too short' }, { msg: 'other' }],
    });
    expect(getErrorMessage(error)).toBe('Password too short');
  });

  it('explains network failures', () => {
    const error = new AxiosError('Network Error', 'ERR_NETWORK');
    expect(getErrorMessage(error)).toMatch(/unable to reach the server/i);
  });

  it('falls back for unknown errors', () => {
    expect(getErrorMessage(null, 'Fallback')).toBe('Fallback');
  });
});
