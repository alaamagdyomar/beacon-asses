import { describe, it, expect } from 'vitest';
import { formatDate } from '@lib/helpers';

describe('formatDate', () => {
  it('formats ISO string to human-friendly date', () => {
    const out = formatDate('2025-10-17T12:00:00.000Z');
    expect(out).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
  });
});
