import { useSocket } from "@hooks/useSocket";
import ConnectionStatus from "@components/ConnectionStatus";
import GameBoard from "./GameBoard";

export default function GamePage() {
  const { socket, isConnected } = useSocket();
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">Tic-Tac-Toe</h1>
      <GameBoard socket={socket} />
      <div className="mt-6"><ConnectionStatus connected={isConnected} /></div>
    </div>
  );
}