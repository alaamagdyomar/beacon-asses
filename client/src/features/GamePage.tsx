import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSocket } from '@hooks/useSocket';
import ConnectionStatus from '@components/ConnectionStatus';
import GameStatus from '@components/GameStatus';
import GameBoard from './GameBoard';

type Role = 'X' | 'O';
type Cell = Role | null;
type Winner = Role | 'Draw' | null;

type GameState = {
  roomId: string;
  board: Cell[];
  next: Role | null;
  winner: Winner;
  youAre?: Role | null;
};

// helpers
function readPersisted() {
  const roomId = sessionStorage.getItem('ttt.roomId') || null;
  const role =
    (sessionStorage.getItem('ttt.role') as Role | null) || null;
  return { roomId, role };
}

export default function GamePage() {
  const { socket, isConnected, connect } = useSocket();
  const [params] = useSearchParams();

  // URL params (work even after refresh)
  const urlRoomId = params.get('roomId');
  const urlRole = (params.get('role') as Role | null) ?? null;

  // server-driven state (single source of truth for board/turn/winner)
  const [state, setState] = useState<GameState | null>(null);

  // subscribe to server events
  useEffect(() => {
    if (!socket) return;

    const onGameState = (s: GameState) => setState(s);
    const onError = (msg: string) => {
      console.error('Game error:', msg);
      alert(msg);
    };

    socket.on('gameState', onGameState);
    socket.on('errorMessage', onError);
    return () => {
      socket.off('gameState', onGameState);
      socket.off('errorMessage', onError);
    };
  }, [socket]);

  useEffect(() => {
    (async () => {
      const persisted = readPersisted();
      const roomId = urlRoomId ?? persisted.roomId;

      if (!roomId) return;

      const s =
        socket && isConnected
          ? socket
          : await connect().catch(() => null);
      if (!s) {
        alert('Could not connect to server');
        return;
      }

      setTimeout(() => {
        s.emit('joinRoom', { roomId }, () => {});
      }, 25);
    })();
  }, [urlRoomId]);

  const youAre: Role | null = useMemo(() => {
    if (state?.youAre) return state.youAre;
    if (urlRole) return urlRole;
    const persisted = readPersisted();
    return persisted.role;
  }, [state?.youAre, urlRole]);

  // board disabled rules
  const boardDisabled = useMemo(() => {
    if (!state) return true;
    if (state.winner) return true;
    if (!youAre) return true;
    return state.next !== youAre;
  }, [state, youAre]);

  // click handler
  const handleCellClick = (index: number) => {
    if (!socket || !state || boardDisabled || !youAre) return;
    socket.emit('playerMove', {
      roomId: state.roomId,
      cellIndex: index,
      player: youAre,
    });
  };

  // tiny UI helper
  const copyRoomId = async () => {
    const rid = state?.roomId || urlRoomId || readPersisted().roomId;
    if (!rid) return;
    try {
      await navigator.clipboard.writeText(rid);
    } catch {
      // best-effort fallback
      prompt('Copy Room ID:', rid);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6 items-center">
      <div className="w-full max-w-md flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-600">
          Tic-Tac-Toe
        </h1>
        <ConnectionStatus connected={isConnected} />
      </div>

      {/* Room info + Status */}
      <div className="w-full max-w-md space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-700">
            Room:
            <span className="font-mono">
              {state?.roomId ||
                urlRoomId ||
                readPersisted().roomId ||
                '—'}
            </span>
          </div>
          <button
            type="button"
            onClick={copyRoomId}
            className="rounded bg-gray-100 px-2 py-1 text-xs border hover:bg-gray-200"
          >
            Copy
          </button>
        </div>

        <GameStatus
          youAre={youAre}
          next={state?.next ?? null}
          winner={state?.winner ?? null}
        />
      </div>

      {/* Board */}
      <div className="w-full max-w-md flex justify-center">
        <GameBoard
          board={state?.board ?? Array<Cell>(9).fill(null)}
          disabled={boardDisabled}
          onCellClick={handleCellClick}
        />
      </div>
    </div>
  );
}
