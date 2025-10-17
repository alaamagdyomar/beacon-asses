interface GameBoardProps { socket: any; }
export default function GameBoard({ socket }: GameBoardProps) {
  const handleCellClick = (index: number) => socket?.emit("playerMove", { roomId: "room-1", cellIndex: index, player: "X" });
  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 9 }).map((_, i) => (
        <button key={i} onClick={() => handleCellClick(i)} className="w-24 h-24 bg-white border-2 border-gray-300 rounded-lg text-4xl font-bold flex items-center justify-center hover:bg-blue-50 transition"></button>
      ))}
    </div>
  );
}