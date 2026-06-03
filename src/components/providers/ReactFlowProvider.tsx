'use client';

import { ReactFlowProvider as BaseReactFlowProvider } from 'reactflow';

export default function ReactFlowProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BaseReactFlowProvider>{children}</BaseReactFlowProvider>;
}
