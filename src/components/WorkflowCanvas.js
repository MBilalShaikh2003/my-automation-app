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

// Use a timestamp for unique IDs so they don't clash after refresh
const getId = () => `node_${Date.now()}`;

function CanvasInner() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [currentWorkflowId, setCurrentWorkflowId] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Combined Load Logic: Runs once on mount
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
        data: { label: label },
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
    },
    [setEdges]
  );

  const handleSave = async () => {
    const result = await saveWorkflow(nodes, edges, currentWorkflowId);
    if (result.success) {
      alert("Workflow Synced!");
      setCurrentWorkflowId(result.id);
    }
  };

  const handleReset = () => {
    if (window.confirm("Clear canvas? This creates a new workflow entry on next save.")) {
      setNodes([]);
      setEdges([]);
      setCurrentWorkflowId(null);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex-1 h-full w-full relative" ref={reactFlowWrapper}>
      {/* BUTTONS RE-INSERTED HERE */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button
          onClick={handleReset}
          className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 shadow-md font-medium transition-colors"
        >
          Reset Canvas
        </button>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow-lg font-medium transition-transform active:scale-95"
        >
          Save Workflow
        </button>
      </div>

      {/* REACTFLOW RE-INSERTED HERE */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodesDelete={onNodesDelete}
        deleteKeyCode={["Backspace", "Delete"]}
        fitView
      >
        <Background color="#cbd5e1" gap={20} variant="dots" />
        <Controls />
      </ReactFlow>
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