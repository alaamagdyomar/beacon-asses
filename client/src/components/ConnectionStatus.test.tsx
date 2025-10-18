import { render, screen } from '@testing-library/react';
import ConnectionStatus from './ConnectionStatus';

describe('ConnectionStatus', () => {
  it('renders connected state', () => {
    render(<ConnectionStatus connected={true} />);
    expect(screen.getByText(/Connected/i)).toBeInTheDocument();
  });

  it('renders disconnected state', () => {
    render(<ConnectionStatus connected={false} />);
    expect(screen.getByText(/Disconnected/i)).toBeInTheDocument();
  });
});
