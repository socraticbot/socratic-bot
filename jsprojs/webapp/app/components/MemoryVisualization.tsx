'use client';

interface MemoryNode {
  id: string;
  content: string;
  timestamp: Date;
  connections: string[];
}

interface MemoryVisualizationProps {
  memories?: MemoryNode[];
}

export default function MemoryVisualization({ memories = [] }: MemoryVisualizationProps) {
  // Mock data for visualization
  const mockMemories: MemoryNode[] = memories.length > 0 ? memories : [
    {
      id: '1',
      content: 'Explored the concept of inference vs observation',
      timestamp: new Date('2024-01-15'),
      connections: ['2'],
    },
    {
      id: '2',
      content: 'Discussed the importance of questioning assumptions',
      timestamp: new Date('2024-01-16'),
      connections: ['1', '3'],
    },
    {
      id: '3',
      content: 'Reflected on how to slow down thinking',
      timestamp: new Date('2024-01-17'),
      connections: ['2'],
    },
  ];

  if (mockMemories.length === 0) {
    return (
      <div className="fade-in text-center py-8">
        <p className="text-base text-gray-500">
          Your thinking history will appear here.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Memories are stored in Swarm, tied to your wallet.
        </p>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg text-gray-700 font-light">
          Your Thinking Journey
        </h3>
        <p className="text-sm text-gray-500">
          Memories stored in Swarm, connected by your reasoning.
        </p>
      </div>

      <div className="space-y-4">
        {mockMemories.map((memory, index) => (
          <div
            key={memory.id}
            className="p-4 bg-white/50 rounded-lg border border-gray-200 hover:bg-white/70 transition-colors duration-300"
            style={{
              opacity: 1 - index * 0.1, // Fade older memories
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm text-gray-600 leading-relaxed flex-1">
                {memory.content}
              </p>
              <span className="text-xs text-gray-400 ml-4">
                {memory.timestamp.toLocaleDateString()}
              </span>
            </div>
            {memory.connections.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Connected to {memory.connections.length} other thought
                  {memory.connections.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">
          All memories are encrypted and stored in Swarm.
          <br />
          Only you can access them with your wallet.
        </p>
      </div>
    </div>
  );
}
