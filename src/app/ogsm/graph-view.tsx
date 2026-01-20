'use client';

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertTriangle, CheckCircle, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import {
  ogsmObjectives,
  ogsmGoals,
  departmentOGSMs,
  perspectiveLabels,
  perspectiveColors,
  kpis,
  DepartmentOGSM,
  Perspective,
} from '@/data/mock-data';

// --- Logic Helpers ---

const getAlignmentStatus = (deptItem: DepartmentOGSM) => {
  if (!deptItem.linkedGoalId || !deptItem.kpiIds || deptItem.kpiIds.length === 0) {
    return { status: 'unknown', message: 'Không có dữ liệu liên kết' };
  }

  const goal = ogsmGoals.find(g => g.id === deptItem.linkedGoalId);
  const relevantKpis = kpis.filter(k => deptItem.kpiIds?.includes(k.id));

  if (!goal || relevantKpis.length === 0) return { status: 'unknown', message: 'Dữ liệu không đầy đủ' };

  // Alignment Logic:
  // If Goal Progress is High (> 70%) BUT KPI is 'off_track' or Trend is 'down' (and status not 'on_track')
  // Then there is a mismatch.

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

// --- Components ---

const TreeNode = ({
  label,
  subLabel,
  color = 'bg-slate-100',
  textColor = 'text-slate-900',
  children,
  warning
}: {
  label: string;
  subLabel?: string;
  color?: string;
  textColor?: string;
  children?: React.ReactNode;
  warning?: { message: string };
}) => {
  return (
    <div className="flex flex-col items-center">
      <div className={`relative z-10 flex flex-col items-center justify-center rounded-xl border-2 p-3 shadow-sm transition-all hover:shadow-md ${color} ${warning ? 'border-red-500 ring-4 ring-red-100' : 'border-slate-200'}`} style={{ minWidth: '180px', maxWidth: '220px' }}>
        {warning && (
          <div className="absolute -top-3 -right-3 z-20">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="rounded-full bg-red-100 p-1 text-red-600 shadow-sm border border-red-200">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-red-50 text-red-800 border-red-200">
                  <p>{warning.message}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        <p className={`text-sm font-bold text-center ${textColor}`}>{label}</p>
        {subLabel && <p className="mt-1 text-xs text-slate-500 text-center">{subLabel}</p>}
      </div>

      {children && (
        <div className="relative mt-4 flex w-full justify-center">
          {/* Connecting Line Vertical */}
          <div className="absolute -top-4 left-1/2 h-4 w-0.5 -translate-x-1/2 bg-slate-300"></div>

          {/* Children Container */}
          <div className="flex gap-6 pt-4 relative">
            {/* Horizontal line connecting children */}
            {React.Children.count(children) > 1 && (
              <div className="absolute top-0 left-10 right-10 h-0.5 bg-slate-300"></div>
            )}
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

// Start Simple: A recursive tree might be too wide. 
// Let's do a Horizontal Tree (Mindmap style) using Flex row.
// Actually, vertical might be easier to scroll if width is constrained. 
// BUT, OGSM usually is wide. Let's try a Horizontal Row-based layout.

const HorizontalNode = ({
  data,
  type,
  children
}: {
  data: any;
  type: 'perspective' | 'objective' | 'goal' | 'dept';
  children?: React.ReactNode;
}) => {
  let content = null;
  let borderColor = 'border-slate-200';
  let badge = null;
  let warning = null;

  if (type === 'perspective') {
    const p = data as Perspective;
    borderColor = perspectiveColors[p].replace('bg-', 'border-');
    content = (
      <div className={`min-w-[160px] p-4 rounded-lg border-l-4 bg-white shadow-sm ${borderColor}`}>
        <span className="font-bold text-lg uppercase text-slate-700">{perspectiveLabels[p]}</span>
      </div>
    );
  } else if (type === 'objective') {
    content = (
      <div className="min-w-[200px] max-w-[200px] p-3 rounded-lg border bg-white shadow-sm hover:border-blue-300 transition-colors">
        <p className="text-xs text-slate-400 font-semibold mb-1">OBJECTIVE</p>
        <p className="font-semibold text-slate-800">{data.name}</p>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{data.description}</p>
      </div>
    );
  } else if (type === 'goal') {
    content = (
      <div className="min-w-[200px] max-w-[200px] p-3 rounded-lg border bg-slate-50 shadow-sm">
        <div className="flex justify-between items-start">
          <p className="text-xs text-emerald-600 font-semibold mb-1">GOAL</p>
          <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 px-1 py-0">{data.target}</Badge>
        </div>
        <p className="font-medium text-slate-800 text-sm">{data.name}</p>
        <div className="mt-2 text-xs flex justify-between text-slate-500">
          <span>{data.owner}</span>
          <span>{data.progress}%</span>
        </div>
      </div>
    );
  } else if (type === 'dept') {
    const align = getAlignmentStatus(data);
    const isWarning = align.status === 'mismatch';

    warning = isWarning ? align.message : null;

    content = (
      <div className={`relative min-w-[220px] max-w-[220px] p-3 rounded-lg border bg-white shadow-sm ${isWarning ? 'border-red-300 ring-2 ring-red-100' : ''}`}>
        {isWarning && (
          <div className="absolute -top-2 -right-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="bg-red-500 text-white p-1 rounded-full shadow-md"><AlertTriangle size={14} /></div>
                </TooltipTrigger>
                <TooltipContent className="bg-red-50 text-red-900 border-red-200">
                  {warning}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        <p className="text-xs text-purple-600 font-semibold mb-1">{data.department}</p>
        <p className="font-medium text-slate-800 text-sm">{data.strategy}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {data.measures.map((m: string) => (
            <Badge key={m} variant="secondary" className="text-[10px] px-1 py-0 h-5">{m}</Badge>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">Owner: {data.owner}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center group">
      {/* Node Content */}
      <div className="relative z-10">
        {content}
      </div>

      {/* Connection Line to Children */}
      {children && (
        <div className="flex items-center">
          <div className="w-8 h-0.5 bg-slate-300"></div>
          <div className="flex flex-col gap-4 border-l-2 border-slate-300 pl-8 py-2">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

// Pure Recursive Tree Renderer (Horizontal)
// We need to group data by tree structure first
// Company -> Perspective -> Objective -> Goal -> Dept

const TreeLevel = ({
  items,
  renderNode,
  getChildren
}: {
  items: any[],
  renderNode: (item: any) => React.ReactNode,
  getChildren: (item: any) => any[]
}) => {
  return (
    <div className="flex flex-col gap-6">
      {items.map((item, idx) => {
        const children = getChildren(item);
        return (
          <div key={idx} className="flex items-start">
            {/* Node */}
            <div className="relative flex items-center pt-2"> {/* pt-2 to align with top of children roughly */}
              {/* Horizontal Line incoming is handled by parent, but outgoing needs to be drawn */}
              {renderNode(item)}

              {/* Connector to children */}
              {children.length > 0 && (
                <div className="flex items-start">
                  <div className="w-8 h-0.5 bg-slate-300 translate-y-[20px] #align-middle"></div> {/* Hardcoded alignment adjustment */}
                  <div className="relative flex flex-col gap-6 border-l-2 border-slate-300 pl-0">
                    {/* Recursive Call */}
                    <div className="pl-6 py-0">
                      <TreeLevel items={children} renderNode={renderNode} getChildren={getChildren} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Improved Layout: TreeView
export function GraphView() {
  const perspectives: Perspective[] = ['financial', 'external', 'internal', 'learning'];

  return (
    <div className="overflow-x-auto p-4 bg-slate-50/50 min-h-[500px] rounded-xl border border-dashed border-slate-200">
      <div className="min-w-[1000px]">
        <div className="flex flex-col gap-12">
          {perspectives.map(p => {
            const objectives = ogsmObjectives.filter(o => o.perspective === p);

            return (
              <div key={p} className="flex items-stretch group">
                {/* Level 1: Perspective */}
                <div className="w-[200px] flex-shrink-0 flex items-center relative py-4 mr-8">
                  <HorizontalNode data={p} type="perspective" />
                  {/* Connector Out */}
                  {objectives.length > 0 && <div className="absolute right-0 top-1/2 w-8 h-0.5 bg-slate-300"></div>}
                </div>

                {/* Level 2: Objectives */}
                <div className="flex flex-col justify-center gap-6 border-l-2 border-slate-300 pl-8 py-2">
                  {objectives.map(obj => {
                    const goals = ogsmGoals.filter(g => g.objectiveId === obj.id);

                    return (
                      <div key={obj.id} className="flex items-center relative">
                        {/* Connector In: Handled by border-l of parent container + pseudo elements could be better but simple border works for now */}
                        {/* The vertical line covers all, we need horizontal stubs. 
                                              Actually the border-l makes a full line. We want stubs. 
                                              Let's use the 'Connection Line' pattern.
                                          */}
                        <div className="absolute -left-8 top-1/2 w-8 h-0.5 bg-slate-300"></div>

                        <HorizontalNode data={obj} type="objective" />

                        {/* Connector Out */}
                        {goals.length > 0 && (
                          <>
                            <div className="w-8 h-0.5 bg-slate-300"></div>
                            <div className="flex flex-col justify-center gap-6 border-l-2 border-slate-300 pl-8 py-2">
                              {goals.map(goal => {
                                const depts = departmentOGSMs.filter(d => d.linkedGoalId === goal.id);

                                return (
                                  <div key={goal.id} className="flex items-center relative">
                                    <div className="absolute -left-8 top-1/2 w-8 h-0.5 bg-slate-300"></div>
                                    <HorizontalNode data={goal} type="goal" />

                                    {/* Connector Out to Dept */}
                                    {depts.length > 0 && (
                                      <>
                                        <div className="w-8 h-0.5 bg-slate-300"></div>
                                        <div className="flex flex-col justify-center gap-6 border-l-2 border-slate-300 pl-8 py-2">
                                          {depts.map(dept => (
                                            <div key={dept.id} className="flex items-center relative">
                                              <div className="absolute -left-8 top-1/2 w-8 h-0.5 bg-slate-300"></div>
                                              <HorizontalNode data={dept} type="dept" />
                                            </div>
                                          ))}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
