type Cell = 'X' | 'O' | null;

export type GameBoardProps = {
  board: Cell[];
  disabled?: boolean;
  onCellClick: (index: number) => void;
};
