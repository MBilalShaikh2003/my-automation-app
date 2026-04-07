import WorkflowCanvas from "@/components/WorkflowCanvas";

export default function Home() {
  return (
    <main className="flex h-screen w-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b px-6 bg-white z-10">
        <h1 className="text-xl font-bold text-gray-800">SmartFlow AI</h1>
        <button 
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          // We will connect the Save function later
        >
          Save Workflow
        </button>
      </header>
      
      <div className="flex-1 w-full relative">
        <WorkflowCanvas />
      </div>
    </main>
  );
}