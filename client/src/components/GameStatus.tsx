import type { FC } from 'react';
import type { GameStatus } from '@/types/gameStatus';

const Badge: FC<{ children: string }> = ({
  children,
}) => (
  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
    {children}
  </span>
);

export default function GameStatus({
  youAre,
  next,
  winner,
}: GameStatus) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Badge>
        {youAre
          ? `You are ${youAre}`
          : 'Not joined'}
      </Badge>
      {winner ? (
        <span className="text-red-600 font-medium">
          {winner === 'Draw'
            ? 'Draw'
            : `Winner: ${winner}`}
        </span>
      ) : (
        <span className="text-gray-600">
          Turn: {next ?? '-'}
        </span>
      )}
    </div>
  );
}
