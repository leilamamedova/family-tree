'use client';

import { Handle, Position } from 'reactflow';

export default function FamilyConnectorNode() {
  return (
    <div className="relative w-2 h-2">
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        style={{ opacity: 0 }}
      />

      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0 }}
      />

      <div className="w-2 h-2 rounded-full bg-gray-400" />
    </div>
  );
}
