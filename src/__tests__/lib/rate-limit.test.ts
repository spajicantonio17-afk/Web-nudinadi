import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit, RATE_LIMITS, getIp } from '@/lib/rate-limit';

describe('rateLimit', () => {
  // Use unique keys per test to avoid interference
  let key: string;
  beforeEach(() => {
    key = `test_${Date.now()}_${Math.random()}`;
  });

  it('allows requests within the limit', () => {
    const config = { limit: 3, windowSeconds: 60 };
    const r1 = rateLimit(key, config);
    const r2 = rateLimit(key, config);
    const r3 = rateLimit(key, config);

    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it('blocks requests over the limit', () => {
    const config = { limit: 2, windowSeconds: 60 };
    rateLimit(key, config);
    rateLimit(key, config);
    const r3 = rateLimit(key, config);

    expect(r3.success).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it('returns correct remaining count', () => {
    const config = { limit: 5, windowSeconds: 60 };
    const r1 = rateLimit(key, config);
    expect(r1.remaining).toBe(4);

    const r2 = rateLimit(key, config);
    expect(r2.remaining).toBe(3);
  });

  it('returns a future resetAt timestamp', () => {
    const config = { limit: 5, windowSeconds: 300 };
    const r = rateLimit(key, config);
    expect(r.resetAt).toBeGreaterThan(Date.now());
    expect(r.resetAt).toBeLessThanOrEqual(Date.now() + 300_000 + 100);
  });

  it('has expected rate limit configs', () => {
    expect(RATE_LIMITS.ai.limit).toBe(10);
    expect(RATE_LIMITS.auth.limit).toBe(5);
    expect(RATE_LIMITS.verify.limit).toBe(3);
    expect(RATE_LIMITS.support.limit).toBe(3);
    expect(RATE_LIMITS.profile_update.limit).toBe(5);
    expect(RATE_LIMITS.admin.limit).toBe(30);
  });
});

describe('getIp', () => {
  it('extracts IP from x-forwarded-for header', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getIp(req)).toBe('1.2.3.4');
  });

  it('returns unknown when no header', () => {
    const req = new Request('http://localhost');
    expect(getIp(req)).toBe('unknown');
  });
});
