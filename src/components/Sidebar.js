"use client";

export default function Sidebar() {
  const onDragStart = (event, nodeType, label) => {
    // We store the type and label in the drag event data
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const tools = [
    { type: 'input', label: 'Trigger: Webhook', color: 'bg-emerald-500' },
    { type: 'default', label: 'AI: Text Analysis', color: 'bg-violet-600' },
    { type: 'output', label: 'Action: Send Email', color: 'bg-blue-600' },
  ];

  return (
    <aside className="w-64 border-r bg-white p-4 flex flex-col gap-3 shadow-inner">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
        Components
      </h3>
      {tools.map((tool) => (
        <div
          key={tool.label}
          className={`${tool.color} text-white p-3 rounded-lg cursor-grab active:cursor-grabbing shadow-sm hover:brightness-110 transition-all font-medium text-sm`}
          onDragStart={(event) => onDragStart(event, tool.type, tool.label)}
          draggable
        >
          {tool.label}
        </div>
      ))}
    </aside>
  );
}