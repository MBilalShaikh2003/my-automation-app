import WorkflowCanvas from "@/components/WorkflowCanvas";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-6 bg-white z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
          <h1 className="text-lg font-bold text-gray-800 tracking-tight">SmartFlow AI</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded">v1.0 Beta</span>
          {/* Note: The Save button inside WorkflowCanvas is easier to manage for now, 
              but we'll eventually move the logic here! */}
        </div>
      </header>
      
      {/* Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: The Toolbox (Sidebar) */}
        <Sidebar />
        
        {/* RIGHT: The Drawing Board (Canvas) */}
        <div className="flex-1 relative">
          <WorkflowCanvas />
        </div>
      </div>
    </main>
  );
}