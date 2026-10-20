import { describe, expect, it } from 'vitest';

import { decodeToken, msUntilExpiry } from './token';

function fakeJwt(payload: object) {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`;
}

describe('decodeToken', () => {
  it('reads the subject and expiry', () => {
    expect(decodeToken(fakeJwt({ sub: 'AFE0026', exp: 1700000000 }))).toEqual({
      sub: 'AFE0026',
      exp: 1700000000,
    });
  });

  it('returns null for malformed tokens', () => {
    expect(decodeToken('not-a-token')).toBeNull();
    expect(decodeToken('a.%%%.c')).toBeNull();
  });
});

describe('msUntilExpiry', () => {
  it('is positive for a future expiry and non-positive once expired', () => {
    const now = 1_700_000_000_000;
    const token = fakeJwt({ sub: 'x', exp: now / 1000 + 60 });
    expect(msUntilExpiry(token, now)).toBe(60_000);
    expect(msUntilExpiry(token, now + 61_000)).toBeLessThan(0);
  });

  it('treats tokens without exp as expired', () => {
    expect(msUntilExpiry(fakeJwt({ sub: 'x' }))).toBe(0);
  });
});
