import { useEffect, useState } from 'react';
import ConnectionStatus from '@components/ConnectionStatus';
import CreateJoinPanel from '@components/CreateJoinPanel';
import { useSocket } from '@hooks/useSocket';
import { fetchGames } from './func';
import type { GameSummary } from '../types/game';

export default function MainPage() {
  const [games, setGames] = useState<
    GameSummary[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { isConnected } = useSocket();
  console.log('isConnected =', isConnected);

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const data = await fetchGames();
        if (on) setGames(data);
      } catch (e) {
        console.error('Failed to load games', e);
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => {
      on = false;
    };
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header + connection */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-600">
          Tic-Tac-Toe
        </h1>
        <ConnectionStatus
          connected={isConnected}
        />
      </div>

      {/* Create / Join panel */}
      <CreateJoinPanel />

      {/* Past Games */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold">
          Past Games
        </div>

        {loading ? (
          <div className="p-4 text-sm text-gray-600">
            Loading…
          </div>
        ) : games.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">
            No games yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-blue-50 text-blue-800">
                <tr>
                  <th className="px-4 py-2">#</th>
                  {/* Show Room ID (new model); fall back to players (legacy) */}
                  <th className="px-4 py-2">
                    Room / Players
                  </th>
                  <th className="px-4 py-2">
                    Winner
                  </th>
                  <th className="px-4 py-2">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {games.map((g, i) => (
                  <tr
                    key={g.id ?? i}
                    className="border-t hover:bg-blue-50/40"
                  >
                    <td className="px-4 py-2">
                      {i + 1}
                    </td>
                    <td className="px-4 py-2">
                      {'roomId' in g &&
                      (g as any).roomId ? (
                        <span className="font-mono">
                          {(g as any).roomId}
                        </span>
                      ) : (
                        <span>
                          {(g as any).player1 ??
                            '—'}{' '}
                          vs{' '}
                          {(g as any).player2 ??
                            '—'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 font-medium text-blue-700">
                      {g.winner ?? '—'}
                    </td>
                    <td className="px-4 py-2">
                      {g.createdAt
                        ? new Date(
                            g.createdAt as unknown as string
                          ).toLocaleString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
