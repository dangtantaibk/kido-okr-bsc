'use client';

import {
  Target,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Building2,
  Users,
  Sparkles,
  Globe,
  Wallet,
} from 'lucide-react';
import {
  perspectiveLabels,
  perspectiveColors,
  Perspective,
} from '@/data/mock-data';
import type { OGSMGoal, OGSMObjective, OGSMStrategy } from '@/data/mock-data';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getObjectivesWithCascade } from '@/lib/supabase/queries/ogsm';
import { useOrganization } from '@/contexts/organization-context';

const goalIcons: Record<string, React.ElementType> = {
  'goal-1': TrendingUp,
  'goal-2': Users,
  'goal-3': Sparkles,
  'goal-4': Globe,
  'goal-5': Wallet,
};

// Theme helper (same logic as Graph View)
const getThemeColors = (p: Perspective) => {
  const baseBg = perspectiveColors[p];
  const colorName = baseBg.replace('bg-', '').replace('-500', '');

  return {
    solidBg: `bg-${colorName}-500`,
    lightBg: `bg-${colorName}-50`,
    borderColor: `border-${colorName}-500`,
    textColor: `text-${colorName}-700`,
    subTextColor: `text-${colorName}-600`,
    gradientFrom: `from-${colorName}-50`,
    badgeBg: `bg-${colorName}-100`,
    badgeText: `text-${colorName}-700`,
    progressBg: `bg-${colorName}-500`,
    iconColor: `text-${colorName}-600`,
    hoverBg: `hover:bg-${colorName}-50`,
  };
};

import { InteractiveGraph } from './interactive-graph';

// --- Sub-components ---

const GoalItem = ({
  goal,
  theme,
  strategies,
}: {
  goal: OGSMGoal;
  theme: ReturnType<typeof getThemeColors>;
  strategies: OGSMStrategy[];
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const filteredStrategies = strategies.filter(s => s.goalId === goal.id);
  const GoalIcon = goalIcons[goal.id] || TrendingUp;

  return (
    <div className={`p-4 bg-gradient-to-r ${theme ? theme.gradientFrom : 'from-slate-50'} to-white border-b last:border-0`}>
      <div className="flex items-start gap-4">
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${theme ? theme.lightBg : 'bg-slate-100'} ${theme ? theme.iconColor : 'text-slate-600'} shadow-sm`}>
          <GoalIcon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-slate-900 text-sm">{goal.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">Owner: {goal.owner}</p>
            </div>
            <Badge className={`${theme ? theme.badgeBg : 'bg-slate-100'} ${theme ? theme.badgeText : 'text-slate-700'} text-xs font-bold border-0 shadow-sm whitespace-nowrap`}>
              {goal.target}
            </Badge>
          </div>

          {/* Progress */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">Progress</span>
              <span className={`font-bold ${theme ? theme.textColor : 'text-slate-700'}`}>{goal.progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden shadow-inner">
              <div
                className={`${theme ? theme.progressBg : 'bg-slate-500'} h-full rounded-full transition-all duration-500`}
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Collapsible Trigger */}
          {filteredStrategies.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`mt-3 flex items-center gap-1 text-xs font-medium ${theme ? theme.subTextColor : 'text-slate-500'} hover:text-slate-800 transition-colors focus:outline-none`}
            >
              {isExpanded ? 'Hide Strategies' : 'Show Strategies'}
              <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          )}

          {/* Strategies & Measures (Collapsible) */}
          {filteredStrategies.length > 0 && isExpanded && (
            <div className={`mt-3 pt-3 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300`}>
              {filteredStrategies.map((strategy) => (
                <div key={strategy.id} className="flex items-start gap-2 mb-3 last:mb-0">
                  <div className={`mt-1 w-4 h-4 rounded-full ${theme ? theme.lightBg : 'bg-slate-100'} flex items-center justify-center flex-shrink-0`}>
                    <ArrowRight className={`h-2.5 w-2.5 ${theme ? theme.iconColor : 'text-slate-500'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-800">{strategy.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {strategy.measures.map((measure) => (
                        <Badge key={measure} variant="outline" className={`text-[10px] px-1.5 py-0 ${theme ? theme.lightBg : 'bg-white'} ${theme ? theme.subTextColor : 'text-slate-600'} border-0 font-medium`}>
                          {measure}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function OGSMCompanyPage() {
  const [ogsmObjectives, setOgsmObjectives] = useState<OGSMObjective[]>([]);
  const [ogsmGoals, setOgsmGoals] = useState<OGSMGoal[]>([]);
  const [ogsmStrategies, setOgsmStrategies] = useState<OGSMStrategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { organization, activeFiscalYear, isLoading: isOrgLoading } = useOrganization();

  useEffect(() => {
    let isActive = true;

    const loadOGSM = async () => {
      try {
        setIsLoading(true);
        const supabase = getSupabaseBrowserClient();
        const orgId = organization?.id;

        if (!orgId) {
          return;
        }

        const objectiveRows = await getObjectivesWithCascade(
          supabase,
          orgId,
          activeFiscalYear
        );
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
            owner: goal.owner?.full_name || goal.owner?.email || '',
            progress: Number(goal.progress || 0),
          }))
        );

        const strategies = (objectiveRows || []).flatMap((obj: any) =>
          (obj.goals || []).flatMap((goal: any) =>
            (goal.strategies || []).map((strategy: any) => ({
              id: strategy.id,
              goalId: goal.id,
              name: strategy.name || '',
              measures: (strategy.measures || []).map((measure: any) => measure?.name || ''),
            }))
          )
        );

        setOgsmObjectives(objectives);
        setOgsmGoals(goals);
        setOgsmStrategies(strategies);
      } catch (error) {
        console.error('Failed to load OGSM data', error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    if (!isOrgLoading) {
      loadOGSM();
    }

    return () => {
      isActive = false;
    };
  }, [organization?.id, activeFiscalYear, isOrgLoading]);

  const getGoalsForObjective = (objectiveId: string) => {
    return ogsmGoals.filter(g => g.objectiveId === objectiveId);
  };

  if (isLoading) {
    return <div className="p-10 flex justify-center text-slate-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <Header title="Bản đồ chiến lược - Tổng công ty" subtitle="Objectives, Goals, Strategies, Measures - Tổng Công ty" />

      <div className="p-6">
        {/* Introduction */}
        <Card className="mb-6 border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">KIDO Group - Chiến lược 2025-2026</h2>
                <p className="mt-2 text-blue-100 max-w-lg">
                  Framework OGSM giúp cascade chiến lược từ cấp Công ty xuống các Phòng ban.
                  Theo dõi mục tiêu theo 4 góc nhìn BSC.
                </p>
              </div>
              <Link href="/ogsm/department">
                <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20">
                  Xem theo Phòng ban
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="list" className="w-full">
          <div className="sticky top-16 z-20 bg-slate-50/95 backdrop-blur supports-[backdrop-filter]:bg-slate-50/80 -mx-6 px-6 py-2 border-b border-slate-200 mb-6 shadow-sm transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <TabsList className="bg-white border shadow-sm self-start md:self-auto">
                <TabsTrigger value="list" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                  List View
                </TabsTrigger>
                <TabsTrigger value="graph" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                  Graph Tree View
                </TabsTrigger>
              </TabsList>

              {/* OGSM Flow - Inline */}
              <div className="hidden md:flex items-center gap-3 text-xs">
                <span className="font-semibold text-slate-400 mr-2 uppercase tracking-wider text-[10px]">OGSM Flow:</span>
                {[
                  { label: 'Objectives', letter: 'O', color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' },
                  { label: 'Goals', letter: 'G', color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
                  { label: 'Strategies', letter: 'S', color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
                  { label: 'Measures', letter: 'M', color: 'bg-purple-500', text: 'text-purple-700', bg: 'bg-purple-50' },
                ].map((item, index) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border border-transparent hover:border-slate-200 transition-colors ${item.bg}`}>
                      <div className={`${item.color} w-4 h-4 rounded text-[9px] flex items-center justify-center text-white font-bold`}>
                        {item.letter}
                      </div>
                      <span className={`font-semibold ${item.text}`}>{item.label}</span>
                    </div>
                    {index < 3 && <ArrowRight className="h-3 w-3 text-slate-300" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <TabsContent value="list" className="mt-0">
            {/* Perspective Legend */}
            <div className="mb-6 flex flex-wrap gap-2 sticky top-[120px] z-10 py-2 -mx-6 px-6 bg-slate-50/90 backdrop-blur-sm border-b">
              {(Object.keys(perspectiveLabels) as Perspective[]).map(p => {
                const theme = getThemeColors(p);
                return (
                  <div key={p} className={`flex items-center gap-2 px-2.5 py-1 rounded-full ${theme.lightBg} ${theme.textColor} text-[10px] font-bold border ${theme.borderColor.replace('border', 'border')} uppercase tracking-wide cursor-default hover:brightness-95 h-6`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${theme.solidBg}`}></div>
                    {perspectiveLabels[p]}
                  </div>
                );
              })}
            </div>

            {/* Objectives Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              {ogsmObjectives.map((objective) => {
                const goals = getGoalsForObjective(objective.id);
                const perspective = objective.perspective;
                const theme = perspective ? getThemeColors(perspective) : null;

                return (
                  <Card key={objective.id} className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow py-0 gap-0 h-full">
                    {/* Objective Header */}
                    <CardHeader className={`${theme ? theme.solidBg : 'bg-slate-500'} text-white pb-5 relative overflow-hidden pt-6 px-6`}>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                              <Target className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-[10px] px-1.5 py-0 h-5 font-normal">
                                  {objective.perspective ? perspectiveLabels[objective.perspective] : 'Objective'}
                                </Badge>
                              </div>
                              <CardTitle className="text-lg text-white mt-1 leading-snug">{objective.name}</CardTitle>
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-white/80 line-clamp-2">{objective.description}</p>
                      </div>
                    </CardHeader>

                    <CardContent className="p-0 bg-white">
                      {/* Goals List */}
                      <div className="divide-y divide-slate-100">
                        {goals.length > 0 ? (
                          goals.map(goal => (
                            <GoalItem key={goal.id} goal={goal} theme={theme} strategies={ogsmStrategies} />
                          ))
                        ) : (
                          <div className="p-8 text-center text-slate-400 text-sm">
                            Chưa có mục tiêu con (Goals)
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* CTA to Department */}
            <Card className="mt-6 border-2 border-dashed border-slate-300 bg-gradient-to-r from-slate-50 to-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <h3 className="font-semibold text-slate-900">Cascade xuống Phòng ban</h3>
                  <p className="text-sm text-slate-500">Xem chi tiết OGSM theo từng phòng ban</p>
                </div>
                <Link href="/ogsm/department">
                  <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-md">
                    Bản đồ chiến lược Phòng ban
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="graph">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Cây mục tiêu & Chiến lược (BSC Cascade)</h3>
              <p className="text-sm text-slate-500">
                Theo dõi sự đồng bộ từ Cấp công ty xuống Phòng ban.
                <span className="ml-2 font-medium text-blue-600">
                  Sử dụng chuột để kéo thả, cuộn để phóng to/thu nhỏ.
                </span>
              </p>
            </div>
            <InteractiveGraph />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
