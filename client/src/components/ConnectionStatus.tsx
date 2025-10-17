import type { ConnectionStatusProps } from '@types/common.types';

export default function ConnectionStatus({ connected }: ConnectionStatusProps) {
  return <div className={`px-4 py-2 rounded-md font-medium text-sm ${connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{connected ? '🟢 Connected' : '🔴 Disconnected'}</div>;
}
