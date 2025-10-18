import type { GameBoardProps } from '@/types/board';
export default function GameBoard({
  board,
  disabled,
  onCellClick,
}: GameBoardProps) {
  return (
    <div className="grid grid-cols-3 gap-2 select-none">
      {board.map((cell: any, i: any) => {
        const isFilled = cell !== null;
        return (
          <button
            key={i}
            type="button"
            onClick={() =>
              !disabled &&
              !isFilled &&
              onCellClick(i)
            }
            disabled={disabled || isFilled}
            aria-label={`cell ${i}`}
            className={[
              'w-24 h-24 bg-white border-2 rounded-lg text-4xl font-bold',
              'flex items-center justify-center transition',
              disabled
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:bg-blue-50',
              isFilled
                ? 'border-gray-400'
                : 'border-gray-300',
            ].join(' ')}
          >
            {cell ?? ''}
          </button>
        );
      })}
    </div>
  );
}
