import axios from '@lib/axiosClient';
import type { Game } from '../types/game';
export const fetchGames = async (): Promise<Game[]> => {
  const { data } = await axios.get('/games');
  return data;
};
