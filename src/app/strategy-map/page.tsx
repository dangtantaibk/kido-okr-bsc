"use client";

import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Node,
  Edge,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';

import type { StrategyNodeData } from './mock-data';
import { nodeTypes } from './custom-nodes';
import { DetailPanel } from './detail-panel';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, Plus, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useOrganization } from '@/contexts/organization-context';

const LAYER_DEFINITIONS = [
  { id: 'l1', label: 'TÀI CHÍNH', y: 50, color: '#F59E0B', category: 'TÀI CHÍNH' },
  { id: 'l2', label: 'KHÁCH HÀNG', y: 300, color: '#3B82F6', category: 'KHÁCH HÀNG' },
  { id: 'l3', label: 'QUY TRÌNH NỘI BỘ', y: 550, color: '#8B5CF6', category: 'QUY TRÌNH NỘI BỘ' },
  { id: 'l4', label: 'HỌC HỎI & PHÁT TRIỂN', y: 800, color: '#EC4899', category: 'HỌC HỎI & PHÁT TRIỂN' }, // Renaming to what user likely sees as "CON NGƯỜI"
];

const categoryMap: Record<string, StrategyNodeData['category']> = {
  financial: 'TÀI CHÍNH',
  external: 'KHÁCH HÀNG',
  internal: 'QUY TRÌNH NỘI BỘ',
  learning: 'HỌC HỎI & PHÁT TRIỂN',
};

const statusMap: Record<string, StrategyNodeData['status']> = {
  on_track: 'on-track',
  at_risk: 'at-risk',
  off_track: 'off-track',
  completed: 'on-track',
};

const parseJsonArray = <T,>(value: unknown, fallback: T[] = []) => {
  if (Array.isArray(value)) {
    return value as T[];
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as T[];
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
};

// Helper to get nodes with labels injected
const getNodesWithLabels = (nodes: Node[]) => {
  const labelNodes: Node[] = LAYER_DEFINITIONS.map(layer => ({
    id: `label-${layer.id}`,
    type: 'layerLabel',
    position: { x: -250, y: layer.y }, // Positioned to the left
    data: { label: layer.label, color: layer.color },
    draggable: false,
    selectable: false,
  }));
  return [...nodes, ...labelNodes];
};

function StrategyMapContent({
  filter,
  onAddNode,
  nodes: initialNodes,
  edges: initialEdges,
}: {
  filter: string;
  onAddNode: () => void;
  nodes: Node[];
  edges: Edge[];
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeData, setSelectedNodeData] = useState<StrategyNodeData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filter Logic
  useEffect(() => {
    setNodes((nds) => nds.map((node) => {
      if (node.type === 'layerLabel') return { ...node, hidden: false }; // Always show labels (or hide if purely strict?) -> Let's keep labels context

      const nodeCategory = node.data.category;
      let hidden = false;

      if (filter === 'Tất cả') {
        hidden = false;
      } else if (filter === 'Con người') {
        hidden = nodeCategory !== 'HỌC HỎI & PHÁT TRIỂN';
      } else if (filter === 'Vận hành') {
        hidden = nodeCategory !== 'QUY TRÌNH NỘI BỘ';
      } else if (filter.toUpperCase() !== nodeCategory) {
        hidden = true;
      }

      return { ...node, hidden };
    }));
  }, [filter, setNodes]);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);


  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type === 'layerLabel') return;
    setSelectedNodeData(node.data as StrategyNodeData);
    setIsDetailOpen(true);
  }, []);

  const closeDetail = () => setIsDetailOpen(false);

  return (
    <div className="w-full h-full relative bg-slate-50/50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        minZoom={0.2}
        maxZoom={4}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#cbd5e1', strokeWidth: 2 },
        }}
        connectionMode={ConnectionMode.Loose}
      >
        <Background color="#f1f5f9" gap={24} size={2} />
        <Controls position='top-right' className="bg-white border-slate-200 shadow-sm" />
      </ReactFlow>

      <DetailPanel
        isOpen={isDetailOpen}
        onClose={closeDetail}
        data={selectedNodeData}
      />
    </div>
  );
}

export default function StrategyMapPage() {
  const [filter, setFilter] = useState('Tất cả');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<string | null>('learning'); // Default to learning as per design initially
  const [flowNodes, setFlowNodes] = useState<Node[]>([]);
  const [flowEdges, setFlowEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const {
    organization,
    activeFiscalYear,
    setActiveFiscalYear,
    isLoading: isOrgLoading,
    yearOptions,
  } = useOrganization();

  useEffect(() => {
    let isActive = true;

    const loadStrategyMap = async () => {
      try {
        setIsLoading(true);
        const supabase = getSupabaseBrowserClient();
        const orgId = organization?.id;

        if (!orgId) {
          return;
        }

        let nodesQuery = supabase
          .from('okr_strategy_nodes')
          .select('*, owner:okr_users(*)')
          .eq('organization_id', orgId);

        if (activeFiscalYear) {
          nodesQuery = nodesQuery.eq('fiscal_year', activeFiscalYear);
        }

        const { data: nodesData, error: nodesError } = await nodesQuery;

        if (nodesError) {
          throw nodesError;
        }

        const { data: edgesData, error: edgesError } = await supabase
          .from('okr_strategy_edges')
          .select('*');

        if (edgesError) {
          throw edgesError;
        }

        if (!isActive) {
          return;
        }

        const mappedNodes = (nodesData || []).map((node) => ({
          id: node.id,
          type: 'goal',
          position: {
            x: Number(node.position_x || 0),
            y: Number(node.position_y || 0),
          },
          data: {
            id: node.id,
            label: node.label || '',
            category: categoryMap[node.category] || 'TÀI CHÍNH',
            status: statusMap[node.status] || 'on-track',
            progress: Number(node.progress || 0),
            ownerName: node.owner?.full_name || '',
            ownerRole: node.owner?.role || '',
            ownerAvatar: node.owner?.avatar_url || '',
            code: node.code || '',
            goals: parseJsonArray(node.goals_data, []),
            strategies: parseJsonArray(node.strategies_data, []),
          } as StrategyNodeData,
        }));

        const nodeIds = new Set(mappedNodes.map((node) => node.id));
        const mappedEdges = (edgesData || [])
          .filter((edge) => nodeIds.has(edge.source_node_id) && nodeIds.has(edge.target_node_id))
          .map((edge) => ({
          id: edge.id,
          source: edge.source_node_id,
          target: edge.target_node_id,
          label: edge.label || undefined,
          type: 'smoothstep',
          animated: true,
          }));

        setFlowNodes(getNodesWithLabels(mappedNodes));
        setFlowEdges(mappedEdges);
      } catch (error) {
        console.error('Failed to load strategy map', error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    if (!isOrgLoading) {
      loadStrategyMap();
    }

    return () => {
      isActive = false;
    };
  }, [organization?.id, activeFiscalYear, isOrgLoading]);

  const handleAddNode = () => {
    setIsAddOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-20px)] bg-slate-50 p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <span>Trang chủ</span>
            <span>/</span>
            <span>Chiến lược</span>
            <span>/</span>
            <span className="font-medium text-slate-900">Bản đồ chiến lược</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Bản đồ Chiến lược - Tổng công ty</h1>
            <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-bold ring-1 ring-green-600/20">
              {activeFiscalYear ? `Năm tài chính ${activeFiscalYear}` : 'Năm tài chính'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white min-w-[120px] justify-between">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                  {activeFiscalYear ? `FY ${activeFiscalYear}` : 'Chọn năm'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[120px]">
              {yearOptions.map((year) => (
                <DropdownMenuItem key={year} onClick={() => setActiveFiscalYear(year)}>
                  FY {year}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleAddNode} className="bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all hover:shadow-md">
            <Plus className="w-4 h-4 mr-2" />
            Thêm mục tiêu mới
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {['Tất cả', 'Tài chính', 'Khách hàng', 'Vận hành', 'Con người'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`
                            px-5 py-2 rounded-full text-sm font-medium transition-all duration-200
                            ${filter === tab
                ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-900 ring-offset-2'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 shadow-sm'}
                        `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Map Area */}
      <div className="flex-1 w-full min-h-0 border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden p-1 relative">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-slate-400">Loading...</div>
        ) : (
          <ReactFlowProvider>
            <StrategyMapContent
              filter={filter}
              onAddNode={handleAddNode}
              nodes={flowNodes}
              edges={flowEdges}
            />
          </ReactFlowProvider>
        )}
      </div>

      {/* Add Goal Dialog Placeholder */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-slate-900">Tạo Mục tiêu mới</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Field 1: Goal Name */}
            <div className="space-y-2">
              <Label htmlFor="goalName" className="text-sm font-semibold text-slate-900">
                Tên mục tiêu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="goalName"
                placeholder="Đào tạo kỹ năng lãnh đạo cấp trung"
                className="h-10 text-sm"
              />
            </div>

            {/* Field 2: BSC Pillar */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-900">
                Trụ cột BSC <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'financial', label: 'Tài chính', icon: '💰', color: 'border-blue-200 bg-blue-50 text-blue-700 ring-2 ring-blue-500 ring-offset-1' },
                  { id: 'customer', label: 'Khách hàng', icon: '😊', color: 'border-orange-200 bg-orange-50 text-orange-700 ring-2 ring-orange-500 ring-offset-1' },
                  { id: 'process', label: 'Vận hành', icon: '🦾', color: 'border-purple-200 bg-purple-50 text-purple-700 ring-2 ring-purple-500 ring-offset-1' },
                  { id: 'learning', label: 'Con người', icon: '🎓', color: 'border-green-200 bg-green-50 text-green-700 ring-2 ring-green-500 ring-offset-1' }
                ].map((pillar) => (
                  <div
                    key={pillar.id}
                    onClick={() => setSelectedPillar(pillar.id)}
                    className={`
                                flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-200
                                cursor-pointer hover:bg-slate-50 transition-all text-sm font-medium
                                ${selectedPillar === pillar.id ? pillar.color : 'bg-white text-slate-600'}
                            `}
                  >
                    <span className="text-xl">{pillar.icon}</span>
                    <span>{pillar.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Field 3: Parent Goal Link */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-900">
                Liên kết mục tiêu cấp trên
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-2.5 text-slate-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                </div>
                <Input
                  placeholder="Phát triển nguồn nhân lực chất lượng cao 2024"
                  className="pl-9 h-10 text-sm bg-slate-50 border-slate-200"
                  readOnly
                />
              </div>
            </div>

            {/* Field 4: Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-900">Ngày bắt đầu</Label>
                <div className="relative">
                  <Input type="date" className="h-10 text-sm" defaultValue="2024-01-01" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-900">Ngày kết thúc</Label>
                <div className="relative">
                  <Input type="date" className="h-10 text-sm" defaultValue="2024-12-31" />
                </div>
              </div>
            </div>

            {/* Field 5: Owner */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-900">Người phụ trách</Label>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">
                    NV
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Nguyễn Văn A</p>
                    <p className="text-xs text-slate-500">Trưởng phòng HR</p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-red-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>

            {/* Field 6: Description */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-900">Mô tả chi tiết</Label>
              <textarea
                className="w-full min-h-[100px] p-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none bg-slate-50"
                placeholder="Nhập mô tả về mục tiêu..."
              />
            </div>

          </div>

          <DialogFooter className="mt-8 flex gap-3 sm:justify-between">
            <Button variant="outline" className="w-full sm:w-1/2 h-11" onClick={() => setIsAddOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" className="w-full sm:w-1/2 h-11 bg-green-500 hover:bg-green-600 text-white font-semibold">
              <div className="mr-2 h-4 w-4 bg-black/20 rounded-sm flex items-center justify-center text-[10px]">💾</div>
              Lưu mục tiêu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
