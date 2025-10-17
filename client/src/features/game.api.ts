import axios from "@lib/axiosClient";
import type { Game } from "./game.types";
export const fetchGames = async (): Promise<Game[]> => {
  const { data } = await axios.get("/games");
  return data;
};