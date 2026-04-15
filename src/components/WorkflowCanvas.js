"use client";

import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import { saveWorkflow, getLatestWorkflow } from '@/app/actions';

const getId = () => `node_${Date.now()}`;

function CanvasInner() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [currentWorkflowId, setCurrentWorkflowId] = useState(null);
  const [runningNodeId, setRunningNodeId] = useState(null);
  
  // State for the configuration panel
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const result = await getLatestWorkflow();
      if (result.success && result.workflow) {
        setNodes(result.workflow.nodes || []);
        setEdges(result.workflow.edges || []);
        setCurrentWorkflowId(result.workflow.id);
      }
    };
    loadData();
  }, [setNodes, setEdges]);

  // --- NODE SELECTION LOGIC ---
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/label');

      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getId(),
        type,
        position,
        data: { 
          label: label,
          prompt: "" // Initialize an empty prompt for AI nodes
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodesDelete = useCallback(
    (deleted) => {
      setEdges((eds) =>
        eds.filter((edge) => !deleted.some((node) => node.id === edge.source || node.id === edge.target))
      );
      // Close panel if the selected node is deleted
      if (selectedNode && deleted.some(n => n.id === selectedNode.id)) {
        setSelectedNode(null);
      }
    },
    [setEdges, selectedNode]
  );

  const handleRunWorkflow = async () => {
    const startNode = nodes.find(n => n.type === 'input');
    if (!startNode) return alert("Add a Trigger!");

    let currentNode = startNode;
    let workflowActive = true;
    let dataPayload = "Initial Data"; 

    while (workflowActive) {
      setRunningNodeId(currentNode.id);
      await new Promise(r => setTimeout(r, 1000));

      if (currentNode.type === 'default') {
        // Use the custom prompt in the execution log!
        const promptText = currentNode.data.prompt ? ` [Prompt: ${currentNode.data.prompt}]` : "";
        dataPayload = dataPayload.toUpperCase() + promptText;
      }

      const edge = edges.find(e => e.source === currentNode.id);
      if (edge) {
        currentNode = nodes.find(n => n.id === edge.target);
      } else {
        workflowActive = false;
        setRunningNodeId(null);
        alert(`Execution Finished. Output: ${dataPayload}`);
      }
    }
  };

  const handleSave = async () => {
    const result = await saveWorkflow(nodes, edges, currentWorkflowId);
    if (result.success) {
      alert("Workflow Synced!");
      setCurrentWorkflowId(result.id);
    }
  };

  const handleReset = () => {
    if (window.confirm("Clear canvas?")) {
      setNodes([]);
      setEdges([]);
      setCurrentWorkflowId(null);
      setSelectedNode(null);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex-1 h-full w-full relative" ref={reactFlowWrapper}>
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button onClick={handleReset} className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 shadow-md font-medium">
          Reset
        </button>
        <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow-lg font-medium">
          Save
        </button>
        <button onClick={handleRunWorkflow} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 shadow-lg font-medium flex items-center gap-2">
          ▶ Run
        </button>
      </div>

      <ReactFlow
        nodes={nodes.map((n) => ({
          ...n,
          style: {
            ...n.style,
            border: n.id === runningNodeId ? '2px solid #10b981' : (n.id === selectedNode?.id ? '2px solid #3b82f6' : '1px solid #ddd'),
            boxShadow: n.id === runningNodeId ? '0 0 15px #10b981' : 'none',
            transition: 'all 0.3s ease',
            borderRadius: '8px',
            background: 'white'
          }
        }))}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick} // Critical: Connects click to panel
        onPaneClick={onPaneClick} // Critical: Closes panel when clicking background
        onNodesDelete={onNodesDelete}
        deleteKeyCode={["Backspace", "Delete"]}
        fitView
      >
        <Background color="#cbd5e1" gap={20} variant="dots" />
        <Controls />
      </ReactFlow>

      {/* --- SETTINGS SIDEBAR --- */}
      {selectedNode && (
        <div className="absolute right-0 top-0 h-full w-80 bg-white border-l shadow-2xl z-[100] p-6 flex flex-col gap-6 animate-in slide-in-from-right duration-200">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="font-bold text-lg text-gray-800">Configuration</h3>
            <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-black transition-colors">✕</button>
          </div>

          <div className="space-y-4">
            {/* Label Input */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Display Name</label>
              <input
                type="text"
                className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedNode.data.label || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, label: val } } : n));
                  setSelectedNode(prev => ({ ...prev, data: { ...prev.data, label: val } }));
                }}
              />
            </div>

            {/* AI Prompt Input (Only shows for 'default' nodes) */}
            {selectedNode.type === 'default' && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">AI Prompt / Instructions</label>
                <textarea
                  rows="4"
                  placeholder="e.g. Summarize the input text..."
                  className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                  value={selectedNode.data.prompt || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, prompt: val } } : n));
                    setSelectedNode(prev => ({ ...prev, data: { ...prev.data, prompt: val } }));
                  }}
                />
              </div>
            )}
          </div>

          <div className="mt-auto text-[10px] text-gray-300 font-mono italic">
            ID: {selectedNode.id}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}