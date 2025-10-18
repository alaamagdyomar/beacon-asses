import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GameBoard from '@features/GameBoard';

describe('GameBoard', () => {
  it('renders 9 cells', () => {
    const socket = { emit: vi.fn() };
    render(<GameBoard socket={socket as any} />);
    expect(screen.getAllByRole('button')).toHaveLength(9);
  });

  it('emits playerMove with index on click', () => {
    const socket = { emit: vi.fn() };
    render(<GameBoard socket={socket as any} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[4]);
    expect(socket.emit).toHaveBeenCalledWith('playerMove', {
      roomId: 'room-1',
      cellIndex: 4,
      player: 'X',
    });
  });
});
