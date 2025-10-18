import axios from '@lib/axiosClient';
import type { GameSummary } from '../types/game';
export const fetchGames = async (): Promise<
  GameSummary[]
> => {
  const { data } = await axios.get('/games');
  return data;
};
