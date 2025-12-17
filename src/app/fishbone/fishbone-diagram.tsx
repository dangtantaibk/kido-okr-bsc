'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ConnectionMode,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { calculateFishboneLayout } from './layout-utils';
import { nodeTypes } from './custom-nodes';
import { FishboneStructure } from './types';
import { Button } from '@/components/ui/button';
import { Plus, Maximize2, Minimize2 } from 'lucide-react';
import { fishboneItems } from '@/data/mock-data';

const initialTreeData: FishboneStructure = {
  id: 'root',
  label: 'VẤN ĐỀ CHÍNH',
  children: [
    {
      id: 'c1', label: 'Con người', children: [
        { id: 'c1-1', label: 'Thiếu đào tạo', children: [] },
        { id: 'c1-2', label: 'Mệt mỏi', children: [] },
      ]
    },
    {
      id: 'c2', label: 'Máy móc', children: [
        { id: 'c2-1', label: 'Bảo trì kém', children: [] },
      ]
    },
    { id: 'c3', label: 'Nguyên vật liệu', children: [] },
    { id: 'c4', label: 'Phương pháp', children: [] },
    { id: 'c5', label: 'Môi trường', children: [] },
    { id: 'c6', label: 'Đo lường', children: [] },
  ]
};

function FishboneDiagramContent() {
  const [treeData, setTreeData] = useState<FishboneStructure>(initialTreeData);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const reactFlowInstance = useReactFlow();
  const [domReady, setDomReady] = useState(false);

  useEffect(() => {
    setDomReady(true);
  }, []);

  useEffect(() => {
    const { nodes: layoutNodes, edges: layoutEdges } = calculateFishboneLayout(treeData);

    const interactiveNodes = layoutNodes.map(node => {
      return {
        ...node,
        data: {
          ...node.data,
          onChange: (newLabel: string) => updateNodeLabel(node.id, newLabel),
          onAddChild: node.data.type !== 'head' || true ? () => addNode(node.id) : undefined,
          onDelete: node.data.type !== 'head' ? () => deleteNode(node.id) : undefined,
        }
      }
    });

    setNodes((prevNodes) => {
      const prevNodeMap = new Map(prevNodes.map(n => [n.id, n]));
      return interactiveNodes.map(n => {
        const prev = prevNodeMap.get(n.id);
        if (prev) {
          return { ...n, position: prev.position };
        }
        return n;
      });
    });

    setEdges(layoutEdges);

    if (nodes.length === 0) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2 });
      }, 50);
    }
  }, [treeData, reactFlowInstance, setNodes, setEdges]);

  const updateNodeLabel = (id: string, newLabel: string) => {
    const updateRecursive = (node: FishboneStructure): FishboneStructure => {
      if (node.id === id) return { ...node, label: newLabel };
      if (!node.children) return node;
      return { ...node, children: node.children.map(updateRecursive) };
    };
    setTreeData(prev => updateRecursive(prev));
  };

  const addNode = (parentId: string) => {
    const newNodeId = `node-${Date.now()}`;
    const updateRecursive = (node: FishboneStructure): FishboneStructure => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...(node.children || []), { id: newNodeId, label: 'Nguyên nhân mới', children: [] }]
        };
      }
      if (!node.children) return node;
      return { ...node, children: node.children.map(updateRecursive) };
    };
    setTreeData(prev => updateRecursive(prev));
  };

  const deleteNode = (id: string) => {
    const deleteRecursive = (node: FishboneStructure): FishboneStructure | null => {
      if (node.id === id) return null;
      if (!node.children) return node;
      const newChildren = node.children.map(deleteRecursive).filter(n => n !== null) as FishboneStructure[];
      return { ...node, children: newChildren };
    };
    setTreeData(prev => {
      const res = deleteRecursive(prev);
      return res || prev;
    });
  };

  const handleAddBigBone = () => {
    const newNodeId = `bone-${Date.now()}`;
    setTreeData(prev => ({
      ...prev,
      children: [...(prev.children || []), { id: newNodeId, label: 'Danh mục mới', children: [] }]
    }));
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2 });
    }, 100);
  };

  const content = (
    <div
      className={`
        flex flex-col border rounded-lg bg-slate-50 relative overflow-hidden transition-all duration-300
        ${isFullScreen ? 'rounded-none bg-white' : 'h-[600px] w-full'}
      `}
      style={isFullScreen ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 2147483647, // Max safe integer for z-index
        backgroundColor: 'white',
      } : {}}
    >
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button onClick={handleAddBigBone} size="sm" className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Thêm Nhánh Chính
        </Button>
        <Button onClick={toggleFullScreen} size="icon" variant="outline" className="shadow-sm bg-white" title={isFullScreen ? "Thu nhỏ" : "Toàn màn hình"}>
          {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        connectionMode={ConnectionMode.Loose}
        minZoom={0.2}
        maxZoom={4}
      >
        <Background color="#cbd5e1" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );

  if (isFullScreen && domReady) {
    // Only use Portal if specifically requested or if standard fixed fails, 
    // but here we already have Portal logic.
    return createPortal(content, document.body);
  }

  return content;
}

export default function FishboneDiagram() {
  return (
    <ReactFlowProvider>
      <FishboneDiagramContent />
    </ReactFlowProvider>
  );
}
