'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  addEdge,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Node,
  Edge,
  Handle,
  Position,
  MarkerType,
  BackgroundVariant,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import {
  perspectiveLabels,
  perspectiveColors,
  Perspective,
} from '@/data/mock-data';
import type { DepartmentOGSM, KPI, OGSMGoal, OGSMObjective } from '@/data/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Move,
  Minus,
  Plus,
  Maximize2,
  Minimize2,
  Layout,
  ArrowRight,
  ArrowDown
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getObjectivesWithCascade } from '@/lib/supabase/queries/ogsm';
import { getKPIsByOrg } from '@/lib/supabase/queries/kpis';
import { mapKpiRow } from '@/lib/supabase/mappers';
import { useOrganization } from '@/contexts/organization-context';

// --- Logic Helpers (Reused) ---
const formatOwnerLabel = (owner?: { full_name?: string | null; email?: string | null; role?: string | null } | null) => {
  const name = owner?.full_name || owner?.email || '';
  const role = owner?.role || '';

  if (!name) {
    return role;
  }

  return role ? `${name} (${role})` : name;
};

type MeasureForm = {
  id?: string;
  name: string;
  kpiId?: string | null;
};

type DepartmentOGSMRecord = DepartmentOGSM & {
  departmentId?: string | null;
  ownerId?: string | null;
  linkedGoalId?: string | null;
  measureItems: MeasureForm[];
};

const getAlignmentStatus = (
  deptItem: DepartmentOGSMRecord,
  ogsmGoals: OGSMGoal[],
  kpis: KPI[]
) => {
  if (!deptItem.linkedGoalId || !deptItem.kpiIds || deptItem.kpiIds.length === 0) {
    return { status: 'unknown', message: 'Không có dữ liệu liên kết' };
  }

  const goal = ogsmGoals.find(g => g.id === deptItem.linkedGoalId);
  const relevantKpis = kpis.filter(k => deptItem.kpiIds?.includes(k.id));

  if (!goal || relevantKpis.length === 0) return { status: 'unknown', message: 'Dữ liệu không đầy đủ' };

  const isGoalHealthy = goal.progress >= 70;
  const hasBadKPI = relevantKpis.some(k =>
    k.status === 'off_track' || (k.status === 'at_risk' && k.trend === 'down')
  );

  if (isGoalHealthy && hasBadKPI) {
    return {
      status: 'mismatch',
      message: 'Cảnh báo: Mục tiêu (Goal) báo cáo tốt nhưng KPI thực tế đang giảm/không đạt.'
    };
  }

  return { status: 'aligned', message: 'KPI và Mục tiêu đồng bộ' };
};

const getThemeColors = (p: Perspective) => {
  const baseBg = perspectiveColors[p]; // e.g. bg-blue-500
  const colorName = baseBg.replace('bg-', '').replace('-500', '');

  return {
    borderColor: `border-${colorName}-500`,
    textColor: `text-${colorName}-700`,
    subTextColor: `text-${colorName}-600`, // Slightly lighter text
    lightBg: `bg-${colorName}-50`,
    solidBg: `bg-${colorName}-500`, // Strong solid color
    gradientBg: `from-white to-${colorName}-50`, // Subtle gradient
    badgeBorder: `border-${colorName}-200`,
    badgeText: `text-${colorName}-700`,
    hoverBorder: `hover:border-${colorName}-400`,
    shadowColor: `shadow-${colorName}-100`, // Colored shadow if supported (standard tailwind might default)
  };
};

// --- Custom Node Implementation ---
const CustomNode = ({ data }: { data: any }) => {
  const { label, type, content, isExpanded, hasChildren, onToggle, warning, direction, perspective } = data;

  let nodeContent = null;
  let borderColor = 'border-slate-200';
  let sideHandle = Position.Left;
  let sourceHandle = Position.Right;

  // Theme Fallback
  const theme = perspective ? getThemeColors(perspective) : {
    borderColor: 'border-slate-200',
    textColor: 'text-slate-700',
    subTextColor: 'text-slate-600',
    lightBg: 'bg-slate-50',
    solidBg: 'bg-slate-500',
    gradientBg: 'from-white to-slate-50',
    badgeBorder: 'border-slate-200',
    badgeText: 'text-slate-700',
    hoverBorder: 'hover:border-slate-300',
    shadowColor: 'shadow-slate-100',
  };

  // Adjust handles for Top-Bottom layout
  if (direction === 'TB') {
    sideHandle = Position.Top;
    sourceHandle = Position.Bottom;
  }

  // Styling based on type
  if (type === 'perspective') {
    const p = content as Perspective;
    const colorClass = perspectiveColors[p];
    borderColor = colorClass.replace('bg-', 'border-');

    nodeContent = (
      <div className={`w-[220px] rounded-xl overflow-hidden shadow-lg bg-white border-2 ${borderColor} hover:scale-105 transition-transform duration-200`}>
        <div className={`${colorClass} p-3 text-white flex items-center justify-between`}>
          <span className="font-bold text-sm uppercase tracking-wider">{perspectiveLabels[p]}</span>
        </div>
        <div className="p-3 bg-white text-xs text-slate-500 italic flex justify-between items-center">
          <span>Chiến lược cấp độ</span>
          <div className={`w-2 h-2 rounded-full ${colorClass} animate-pulse`}></div>
        </div>
      </div>
    );
  } else if (type === 'objective') {
    nodeContent = (
      <div className={`w-[240px] rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all border ${theme.borderColor} ${theme.hoverBorder}`}>
        {/* Colorful Header */}
        <div className={`${theme.lightBg} px-4 py-2 border-b ${theme.badgeBorder} flex items-center justify-between`}>
          <p className={`text-[10px] uppercase font-bold ${theme.textColor}`}>OBJECTIVE</p>
          <div className={`w-1.5 h-1.5 rounded-full ${theme.solidBg}`}></div>
        </div>

        <div className="p-4">
          <p className="font-bold text-slate-900 text-sm mb-2">{content.name}</p>
          <div className="text-xs text-slate-500 line-clamp-2">
            {content.description}
          </div>
        </div>
      </div>
    );
  } else if (type === 'goal') {
    nodeContent = (
      <div className={`w-[240px] rounded-xl overflow-hidden bg-gradient-to-br ${theme.gradientBg} shadow-md hover:shadow-xl transition-all border border-transparent ${theme.hoverBorder}`}>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <p className={`text-[10px] uppercase font-bold ${theme.subTextColor}`}>GOAL</p>
            <Badge variant="outline" className={`bg-white ${theme.badgeText} ${theme.borderColor} text-xs font-bold shadow-sm`}>
              {content.target}
            </Badge>
          </div>

          <p className="font-semibold text-slate-900 text-sm mb-3 min-h-[40px]">{content.name}</p>

          <div className="w-full bg-white rounded-full h-2 mb-2 overflow-hidden border border-slate-100 shadow-inner">
            <div
              className={`${theme.solidBg} h-full rounded-full transition-all duration-500`}
              style={{ width: `${content.progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-medium">
            <span>{content.owner}</span>
            <span className={`${theme.textColor}`}>{content.progress}%</span>
          </div>
        </div>
      </div>
    );
  } else if (type === 'dept') {
    const isWarning = !!warning;
    nodeContent = (
      <div className={`w-[240px] rounded-xl bg-white shadow-md hover:shadow-xl transition-all border-l-[6px] ${theme.borderColor} ${isWarning ? '!border-red-500 ring-2 ring-red-100' : ''}`}>
        <div className="p-4">
          {isWarning && (
            <div className="absolute top-2 right-2 z-50">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-red-100 text-red-600 p-1 rounded-full cursor-help hover:bg-red-200 transition-colors">
                      <AlertTriangle size={14} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-white text-red-700 border-red-200 shadow-xl max-w-[200px]">
                    {warning}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          <p className={`text-[10px] uppercase font-bold mb-1 ${theme.subTextColor}`}>{content.department}</p>
          <p className="font-semibold text-slate-900 text-sm mb-2">{content.strategy}</p>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {content.measures.map((m: string, index: number) => (
              <span key={`${content.id}-measure-${index}`} className={`px-2 py-0.5 ${theme.lightBg} ${theme.subTextColor} text-[10px] rounded-md font-medium`}>
                {m}
              </span>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full ${theme.lightBg} flex items-center justify-center text-[10px] font-bold ${theme.textColor}`}>
              {content.owner.charAt(0)}
            </div>
            <span className="text-[10px] text-slate-500">{content.owner}</span>
          </div>
        </div>
      </div>
    );
  }

  // Adjust toggler position based on layout
  const togglerClass = direction === 'TB'
    ? "absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-slate-300 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-400 shadow-sm z-50 hover:scale-110 transition-all"
    : "absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-300 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-400 shadow-sm z-50 hover:scale-110 transition-all";

  return (
    <div className="relative group">
      <Handle
        type="target"
        position={sideHandle}
        className={`!bg-slate-400 !w-3 !h-3 hover:!bg-blue-500 hover:!w-4 hover:!h-4 transition-all ${direction === 'TB' ? '!-top-1.5 !left-1/2 !-translate-x-1/2' : '!-left-1.5 !top-1/2 !-translate-y-1/2'}`}
      />

      <div className="relative">
        {nodeContent}

        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={togglerClass}
          >
            {isExpanded ? <Minus size={14} /> : <Plus size={14} />}
          </button>
        )}
      </div>

      <Handle
        type="source"
        position={sourceHandle}
        className={`!bg-slate-400 !w-3 !h-3 hover:!bg-blue-500 hover:!w-4 hover:!h-4 transition-all ${direction === 'TB' ? '!-bottom-1.5 !left-1/2 !-translate-x-1/2' : '!-right-1.5 !top-1/2 !-translate-y-1/2'}`}
      />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

// --- DAGRE LAYOUT ---
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 280;
const nodeHeight = 160;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // Dagre returns center pt, converting to top-left

    // Pass direction to node data for handle positioning
    const updatedData = { ...node.data, direction };

    return {
      ...node,
      targetPosition: direction === 'TB' ? Position.Top : Position.Left,
      sourcePosition: direction === 'TB' ? Position.Bottom : Position.Right,
      data: updatedData,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: newNodes, edges };
};

// --- Main Component ---
export function InteractiveGraph({
  filterDepartment,
  onDepartmentSelect,
  onObjectiveSelect,
  onGoalSelect,
}: {
  filterDepartment?: string;
  onDepartmentSelect?: (dept: DepartmentOGSMRecord) => void;
  onObjectiveSelect?: (objective: OGSMObjective) => void;
  onGoalSelect?: (goal: OGSMGoal) => void;
}) {
  const [layoutDirection, setLayoutDirection] = useState<'LR' | 'TB'>('LR');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const graphContainerRef = React.useRef<HTMLDivElement>(null);
  const [ogsmObjectives, setOgsmObjectives] = useState<OGSMObjective[]>([]);
  const [ogsmGoals, setOgsmGoals] = useState<OGSMGoal[]>([]);
  const [departmentOGSMs, setDepartmentOGSMs] = useState<DepartmentOGSMRecord[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { organization, activeFiscalYear, isLoading: isOrgLoading } = useOrganization();

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const supabase = getSupabaseBrowserClient();
        const orgId = organization?.id;

        if (!orgId) {
          return;
        }

        const [objectiveRows, kpiRows] = await Promise.all([
          getObjectivesWithCascade(supabase, orgId, activeFiscalYear),
          getKPIsByOrg(supabase, orgId, activeFiscalYear),
        ]);

        if (!isActive) {
          return;
        }

        const objectives = (objectiveRows || []).map((obj: any) => ({
          id: obj.id,
          name: obj.name || '',
          description: obj.description || '',
          perspective: obj.perspective || 'financial',
        }));

        const goals = (objectiveRows || []).flatMap((obj: any) =>
          (obj.goals || []).map((goal: any) => ({
            id: goal.id,
            objectiveId: obj.id,
            name: goal.name || '',
            target:
              goal.target_text ||
              (goal.target_value
                ? `${goal.target_value}${goal.target_unit ? ` ${goal.target_unit}` : ''}`
                : ''),
            owner: formatOwnerLabel(goal.owner),
            progress: Number(goal.progress || 0),
          }))
        );

        const departmentRows = (objectiveRows || []).flatMap((obj: any) =>
          (obj.goals || []).flatMap((goal: any) =>
            (goal.department_ogsms || []).map((dept: any) => ({
              id: dept.id,
              department: dept.department?.name || '',
              departmentId: dept.department_id || dept.department?.id || null,
              purpose: dept.purpose || '',
              objective: dept.objective || '',
              strategy: dept.strategy || '',
              measures: (dept.measures || []).map((measure: any) => measure?.name || ''),
              measureItems: (dept.measures || [])
                .map((measure: any) => ({
                  id: measure?.id,
                  name: measure?.name || '',
                  kpiId: measure?.kpi_id || null,
                }))
                .filter((measure: { id?: string }) => Boolean(measure.id)),
              owner: formatOwnerLabel(dept.owner),
              ownerId: dept.owner_id || dept.owner?.id || null,
              progress: Number(dept.progress || 0),
              linkedGoalId: dept.linked_goal_id ?? goal.id,
              kpiIds: (dept.measures || [])
                .map((measure: any) => measure?.kpi_id)
                .filter(Boolean),
            }))
          )
        );

        setOgsmObjectives(objectives);
        setOgsmGoals(goals);
        setDepartmentOGSMs(departmentRows);
        setKpis((kpiRows || []).map(mapKpiRow));
      } catch (error) {
        console.error('Failed to load OGSM graph data', error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    if (!isOrgLoading) {
      loadData();
    }

    return () => {
      isActive = false;
    };
  }, [organization?.id, activeFiscalYear, isOrgLoading]);

  // 1. Initial Data Construction
  const { initialNodes, initialEdges } = useMemo(() => {
    let nodes: Node[] = [];
    let edges: Edge[] = [];
    const perspectives: Perspective[] = ['financial', 'external', 'internal', 'learning'];

    // Pre-calculate valid IDs if filtering
    let validGoalIds = new Set<string>();
    let validObjIds = new Set<string>();

    if (filterDepartment) {
      const relevantDepts = departmentOGSMs.filter(d => d.department === filterDepartment);
      relevantDepts.forEach(d => {
        if (d.linkedGoalId) validGoalIds.add(d.linkedGoalId);
      });
      ogsmGoals.forEach(g => {
        if (validGoalIds.has(g.id)) validObjIds.add(g.objectiveId);
      });
    }

    perspectives.forEach(p => {
      // 1. Get Objectives
      let objectives = ogsmObjectives.filter(o => o.perspective === p);
      if (filterDepartment) {
        objectives = objectives.filter(o => validObjIds.has(o.id));
      }

      // If filtering and no objectives for this perspective, skip the entire branch (cleanup)
      if (filterDepartment && objectives.length === 0) return;

      const pId = `p-${p}`;
      nodes.push({
        id: pId,
        type: 'custom',
        data: { label: p, type: 'perspective', content: p, hasChildren: objectives.length > 0, perspective: p },
        position: { x: 0, y: 0 }
      });

      objectives.forEach(obj => {
        const objId = obj.id;

        // 2. Get Goals
        let goals = ogsmGoals.filter(g => g.objectiveId === obj.id);
        if (filterDepartment) {
          goals = goals.filter(g => validGoalIds.has(g.id));
        }

        nodes.push({
          id: objId,
          type: 'custom',
          // Pass perspective prop
          data: { label: obj.name, type: 'objective', content: obj, hasChildren: goals.length > 0, perspective: p },
          position: { x: 0, y: 0 }
        });
        edges.push({ id: `${pId}-${objId}`, source: pId, target: objId, type: 'smoothstep', animated: true, style: { stroke: '#cbd5e1', strokeWidth: 2 } });

        goals.forEach(goal => {
          const goalId = goal.id;

          // 3. Get Departments
          let depts = departmentOGSMs.filter(d => d.linkedGoalId === goal.id);
          if (filterDepartment) {
            depts = depts.filter(d => d.department === filterDepartment);
          }

          nodes.push({
            id: goalId,
            type: 'custom',
            data: { label: goal.name, type: 'goal', content: goal, hasChildren: depts.length > 0, perspective: p },
            position: { x: 0, y: 0 }
          });
          edges.push({ id: `${objId}-${goalId}`, source: objId, target: goalId, type: 'smoothstep', animated: false, style: { stroke: '#cbd5e1', strokeWidth: 2 } });

          depts.forEach(dept => {
            const deptId = dept.id;
            const align = getAlignmentStatus(dept, ogsmGoals, kpis);
            nodes.push({
              id: deptId,
              type: 'custom',
              data: {
                label: dept.department,
                type: 'dept',
                content: dept,
                hasChildren: false,
                warning: align.status === 'mismatch' ? align.message : null,
                perspective: p
              },
              position: { x: 0, y: 0 }
            });
            edges.push({ id: `${goalId}-${deptId}`, source: goalId, target: deptId, type: 'smoothstep', animated: false, style: { stroke: '#cbd5e1', strokeWidth: 1.5 } });
          });
        });
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [filterDepartment, departmentOGSMs, ogsmGoals, ogsmObjectives, kpis]);

  // 2. State Logic
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [hiddenNodeIds, setHiddenNodeIds] = useState<Set<string>>(new Set());

  // 3. Helper to toggle nodes
  const toggleNode = useCallback((nodeId: string) => {
    const getDescendants = (id: string, currentEdges: Edge[]) => {
      let childrenIds: string[] = [];
      const directChildren = currentEdges.filter(e => e.source === id).map(e => e.target);
      childrenIds = [...directChildren];
      directChildren.forEach(childId => {
        childrenIds = [...childrenIds, ...getDescendants(childId, currentEdges)];
      });
      return childrenIds;
    };

    setHiddenNodeIds(prev => {
      const next = new Set(prev);
      const descendants = getDescendants(nodeId, initialEdges);
      const directChildren = initialEdges.filter(e => e.source === nodeId).map(e => e.target);

      if (directChildren.length === 0) return prev; // Leaf node

      const isChildHidden = next.has(directChildren[0]);

      if (isChildHidden) {
        // Expand
        directChildren.forEach(childId => next.delete(childId));
      } else {
        // Collapse
        descendants.forEach(d => next.add(d));
      }

      return next;
    });
  }, [initialEdges]);

  // 4. Effect to update Nodes based on hidden sets and Layout
  useEffect(() => {
    // Filter visible
    const visibleNodes = initialNodes.filter(n => !hiddenNodeIds.has(n.id));
    const visibleEdges = initialEdges.filter(e =>
      !hiddenNodeIds.has(e.source) && !hiddenNodeIds.has(e.target)
    );

    // Update state props
    const nodesWithState = visibleNodes.map(n => {
      const directChildren = initialEdges.filter(e => e.source === n.id).map(e => e.target);
      const isLeaf = directChildren.length === 0;
      const isExpanded = directChildren.length > 0 && !hiddenNodeIds.has(directChildren[0]);

      return {
        ...n,
        data: {
          ...n.data,
          isExpanded,
          hasChildren: !isLeaf,
          onToggle: () => toggleNode(n.id),
          direction: layoutDirection // Pass direction to node
        }
      };
    });

    // Run Layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodesWithState,
      visibleEdges,
      layoutDirection
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [hiddenNodeIds, initialNodes, initialEdges, toggleNode, setNodes, setEdges, layoutDirection]);

  // 5. Expand/Collapse All
  const handleExpandAll = () => setHiddenNodeIds(new Set());
  const handleCollapseAll = () => {
    const roots = initialNodes.filter(n => n.data.type === 'perspective').map(n => n.id);
    const allNodeIds = initialNodes.map(n => n.id);
    const toHide = allNodeIds.filter(id => !roots.includes(id));
    setHiddenNodeIds(new Set(toHide));
  };

  // 6. Full Screen Toggle
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      if (graphContainerRef.current) {
        graphContainerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
      }
    } else {
      document.exitFullscreen();
    }
  };

  // Layout Toggle
  const toggleLayout = () => {
    setLayoutDirection(prev => prev === 'LR' ? 'TB' : 'LR');
  };

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (!node.data?.type || !node.data?.content) {
        return;
      }
      if (node.data.type === 'dept' && onDepartmentSelect) {
        onDepartmentSelect(node.data.content as DepartmentOGSMRecord);
      }
      if (node.data.type === 'objective' && onObjectiveSelect) {
        onObjectiveSelect(node.data.content as OGSMObjective);
      }
      if (node.data.type === 'goal' && onGoalSelect) {
        onGoalSelect(node.data.content as OGSMGoal);
      }
    },
    [onDepartmentSelect, onObjectiveSelect, onGoalSelect]
  );

  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  }

  return (
    <div
      ref={graphContainerRef}
      className={`w-full transition-all duration-300 ${isFullScreen ? 'bg-white' : 'h-[800px] rounded-xl relative border border-slate-200 shadow-inner overflow-hidden'}`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        attributionPosition="bottom-right"
        className="bg-slate-50"
      >
        <Background color="#94a3b8" gap={20} size={1} variant={BackgroundVariant.Dots} className="opacity-20" />
        <Controls className="bg-white border border-slate-200 shadow-md rounded-lg overflow-hidden p-1 gap-1" showInteractive={false} />

        {/* Top Right Controls Panel */}
        <Panel position="top-right" className="bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-lg flex flex-col gap-3 min-w-[200px] m-4">
          {/* Node Count Badge */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Graph Controls</span>
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] h-5 px-1.5">
              {nodes.length} nodes
            </Badge>
          </div>

          {/* Layout Selector */}
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 block mb-1">Layout</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg">
              <button
                onClick={() => setLayoutDirection('LR')}
                className={`flex-1 flex items-center justify-center py-1 rounded-md text-xs transition-all ${layoutDirection === 'LR' ? 'bg-white shadow-sm text-blue-600 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Horizontal
              </button>
              <button
                onClick={() => setLayoutDirection('TB')}
                className={`flex-1 flex items-center justify-center py-1 rounded-md text-xs transition-all ${layoutDirection === 'TB' ? 'bg-white shadow-sm text-blue-600 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Vertical
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={handleExpandAll} className="h-7 text-[10px] px-2">
              <Maximize2 className="w-3 h-3 mr-1" /> Expand
            </Button>
            <Button variant="outline" size="sm" onClick={handleCollapseAll} className="h-7 text-[10px] px-2">
              <Minimize2 className="w-3 h-3 mr-1" /> Collapse
            </Button>
          </div>

          {/* Fullscreen */}
          <Button
            variant={isFullScreen ? "secondary" : "default"}
            size="sm"
            className={`w-full h-8 text-xs ${isFullScreen ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
            onClick={toggleFullScreen}
          >
            {isFullScreen ? (
              <> <Minimize2 className="w-3 h-3 mr-2" /> Exit Fullscreen </>
            ) : (
              <> <Maximize2 className="w-3 h-3 mr-2" /> Full Screen </>
            )}
          </Button>
        </Panel>

        {/* Legend Panel */}
        <Panel position="bottom-left" className="bg-white/90 backdrop-blur p-3 rounded-lg border border-slate-200 shadow-lg text-xs m-4">
          <p className="font-bold mb-2 text-slate-700 text-[10px] uppercase tracking-wider">Legend</p>
          <div className="space-y-1.5 opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span>Perspective</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border border-blue-500 bg-blue-50"></div>
              <span>Objective</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gradient-to-br from-white to-blue-50 border border-slate-200"></div>
              <span>Goal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-white border-l-4 border-blue-500 shadow-sm"></div>
              <span>Department</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
