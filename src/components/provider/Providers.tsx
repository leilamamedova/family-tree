'use client';

import { ReactFlowProvider } from 'reactflow';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ReactFlowProvider>{children}</ReactFlowProvider>;
}
