import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '@hooks/useSocket';

type Role = 'X' | 'O';

export default function CreateJoinPanel() {
  const { socket, connect, isConnected } =
    useSocket();
  const navigate = useNavigate();
  const [joinId, setJoinId] = useState('');
  const [loading, setLoading] = useState<
    'create' | 'join' | null
  >(null);

  const handleCreate = async () => {
    try {
      setLoading('create');
      const s = await connect(); // <- lazy connect
      let done = false;
      const t = setTimeout(() => {
        if (!done) {
          setLoading(null);
          alert(
            'Failed to create room (timeout). Is the server running?'
          );
        }
      }, 3500);

      s.emit(
        'createRoom',
        {},
        (res: {
          ok: boolean;
          roomId?: string;
          player?: Role;
          reason?: string;
        }) => {
          done = true;
          clearTimeout(t);
          setLoading(null);
          if (
            !res?.ok ||
            !res.roomId ||
            !res.player
          ) {
            return alert(
              res?.reason ||
                'Failed to create room'
            );
          }
          sessionStorage.setItem(
            'ttt.roomId',
            res.roomId
          );
          sessionStorage.setItem(
            'ttt.role',
            res.player
          );
          navigate(
            `/game?roomId=${encodeURIComponent(res.roomId)}&role=${res.player}`
          );
        }
      );
    } catch (e) {
      console.error(e);
      setLoading(null);
      alert('Failed to connect to server');
    }
  };

  const handleJoin = async () => {
    const rid = joinId.trim();
    if (!rid)
      return alert('Enter a room id first');
    try {
      setLoading('join');
      const s = await connect(); // <- lazy connect
      let done = false;
      const t = setTimeout(() => {
        if (!done) {
          setLoading(null);
          alert(
            'Failed to join room (timeout). Is the server running?'
          );
        }
      }, 3500);

      s.emit(
        'joinRoom',
        { roomId: rid },
        (res: {
          ok: boolean;
          player?: Role;
          reason?: string;
        }) => {
          done = true;
          clearTimeout(t);
          setLoading(null);
          if (!res?.ok || !res.player)
            return alert(
              res?.reason || 'Failed to join'
            );
          sessionStorage.setItem(
            'ttt.roomId',
            rid
          );
          sessionStorage.setItem(
            'ttt.role',
            res.player
          );
          navigate(
            `/game?roomId=${encodeURIComponent(rid)}&role=${res.player}`
          );
        }
      );
    } catch (e) {
      console.error(e);
      setLoading(null);
      alert('Failed to connect to server');
    }
  };

  return (
    <div className="w-full max-w-md space-y-3 p-4 rounded-lg border bg-white">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          Play
        </h2>
        <span
          className={`text-xs ${isConnected ? 'text-green-600' : 'text-gray-500'}`}
        >
          {isConnected ? 'Connected' : 'Idle'}
        </span>
      </div>

      <button
        type="button"
        onClick={handleCreate}
        disabled={loading === 'create'}
        className="w-full rounded-md bg-blue-600 text-white px-3 py-2 text-sm font-medium disabled:opacity-60"
      >
        {loading === 'create'
          ? 'Creating…'
          : 'Create New Room'}
      </button>

      <div className="flex gap-2">
        <input
          value={joinId}
          onChange={(e) =>
            setJoinId(e.target.value)
          }
          placeholder="Enter Room ID"
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleJoin}
          disabled={loading === 'join'}
          className="rounded-md bg-gray-800 text-white px-3 py-2 text-sm font-medium disabled:opacity-60"
        >
          {loading === 'join'
            ? 'Joining…'
            : 'Join'}
        </button>
      </div>
    </div>
  );
}
