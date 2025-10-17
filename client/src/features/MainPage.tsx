import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ConnectionStatus from "@components/ConnectionStatus";
import { useSocket } from "@hooks/useSocket";
import { fetchGames } from "./game.api";
import type { Game } from "./game.types";

export default function MainPage() {
  const [games, setGames] = useState<Game[]>([]);
  const { isConnected } = useSocket();
  useEffect(() => { fetchGames().then(setGames).catch(console.error); }, []);
  return (
    <div>
      <h1 className="text-3xl font-bold text-blue-600 mb-6">🎯 Past Games</h1>
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <table className="w-full text-sm text-center">
          <thead className="bg-blue-100 text-blue-800">
            <tr><th>#</th><th>Player 1</th><th>Player 2</th><th>Winner</th><th>Date</th></tr>
          </thead>
          <tbody>{games.map((g, i) => (
            <tr key={g.id || i} className="border-b hover:bg-blue-50">
              <td>{i + 1}</td><td>{g.player1}</td><td>{g.player2}</td>
              <td className="font-semibold text-blue-600">{g.winner}</td>
              <td>{new Date(g.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <Link to="/game"><button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Start New Game</button></Link>
      <div className="mt-6"><ConnectionStatus connected={isConnected} /></div>
    </div>
  );
}