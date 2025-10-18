// src/test/integration/GameBoard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GameBoard from '@features/GameBoard';

describe('GameBoard', () => {
  it('renders 9 cells', () => {
    render(
      <GameBoard
        board={Array<'X' | 'O' | null>(9).fill(null)}
        disabled={false}
        onCellClick={vi.fn()}
      />
    );
    expect(screen.getAllByRole('button')).toHaveLength(9);
  });

  it('calls onCellClick with index when an empty cell is clicked', () => {
    const onCellClick = vi.fn();
    const board = Array<'X' | 'O' | null>(9).fill(null);

    render(
      <GameBoard
        board={board}
        disabled={false}
        onCellClick={onCellClick}
      />
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[4]);
    expect(onCellClick).toHaveBeenCalledWith(4);
  });

  it('does not call onCellClick when disabled', () => {
    const onCellClick = vi.fn();
    const board = Array<'X' | 'O' | null>(9).fill(null);

    render(
      <GameBoard
        board={board}
        disabled={true}
        onCellClick={onCellClick}
      />
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onCellClick).not.toHaveBeenCalled();
  });

  it('does not call onCellClick on a filled cell', () => {
    const onCellClick = vi.fn();
    const board: Array<'X' | 'O' | null> = [
      'X',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ];

    render(
      <GameBoard
        board={board}
        disabled={false}
        onCellClick={onCellClick}
      />
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // filled
    expect(onCellClick).not.toHaveBeenCalled();
  });
});
