import { describe, it, expect, vi } from 'vitest';
import axios from '@lib/axiosClient';
import { fetchGames } from '@features/func';

vi.mock('@lib/axiosClient', () => ({
  default: { get: vi.fn() },
}));

describe('fetchGames', () => {
  it('returns games on success', async () => {
    const mock = [{ id: '1', player1: 'A', player2: 'B', winner: 'A', createdAt: '2025-10-17' }];
    (axios.get as any).mockResolvedValue({ data: mock });
    const data = await fetchGames();
    expect(axios.get).toHaveBeenCalledWith('/games');
    expect(data).toEqual(mock);
  });

  it('throws on error', async () => {
    (axios.get as any).mockRejectedValue(new Error('Network error'));
    await expect(fetchGames()).rejects.toThrow('Network error');
  });
});
