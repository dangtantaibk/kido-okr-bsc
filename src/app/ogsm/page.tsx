'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Target,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Building2,
  Users,
  Sparkles,
  Globe,
  Wallet,
} from 'lucide-react';
import {
  ogsmObjectives,
  ogsmGoals,
  ogsmStrategies,
} from '@/data/mock-data';
import Link from 'next/link';

const goalIcons: Record<string, React.ElementType> = {
  'goal-1': TrendingUp,
  'goal-2': Users,
  'goal-3': Sparkles,
  'goal-4': Globe,
  'goal-5': Wallet,
};

export default function OGSMCompanyPage() {
  const getGoalsForObjective = (objectiveId: string) => {
    return ogsmGoals.filter(g => g.objectiveId === objectiveId);
  };

  const getStrategiesForGoal = (goalId: string) => {
    return ogsmStrategies.filter(s => s.goalId === goalId);
  };

  return (
    <div className="min-h-screen">
      <Header title="OGSM Company" subtitle="Objectives, Goals, Strategies, Measures - Cấp Công ty" />

      <div className="p-6">
        {/* Introduction */}
        <Card className="mb-6 border-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">KIDO Group - Chiến lược 2025-2026</h2>
                <p className="mt-2 text-blue-100">
                  Framework OGSM giúp cascade chiến lược từ cấp Công ty xuống các Phòng ban
                </p>
              </div>
              <Link href="/ogsm/department">
                <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                  Xem theo Phòng ban
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* OGSM Flow Diagram */}
        <Card className="mb-6 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">OGSM Framework Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4 py-4">
              {[
                { label: 'Objectives', desc: 'Mục tiêu lớn', color: 'bg-blue-500' },
                { label: 'Goals', desc: 'Targets cụ thể', color: 'bg-emerald-500' },
                { label: 'Strategies', desc: 'Cách đạt mục tiêu', color: 'bg-amber-500' },
                { label: 'Measures', desc: 'Chỉ số đo lường', color: 'bg-purple-500' },
              ].map((item, index) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`${item.color} mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl text-white font-bold`}>
                      {item.label.charAt(0)}
                    </div>
                    <p className="font-semibold text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  {index < 3 && <ArrowRight className="h-5 w-5 text-slate-300" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Objectives and Goals */}
        <div className="space-y-6">
          {ogsmObjectives.map((objective) => {
            const goals = getGoalsForObjective(objective.id);
            return (
              <Card key={objective.id} className="border-0 shadow-md overflow-hidden">
                {/* Objective Header */}
                {/* Objective Header */}
                <CardHeader className="border-b bg-white pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Target className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Objective</p>
                        <CardTitle className="text-xl text-slate-900">{objective.name}</CardTitle>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-lg bg-slate-50 p-3">
                    <p className="text-sm font-medium text-slate-700">{objective.description}</p>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {/* Goals */}
                  <div className="divide-y">
                    {goals.map((goal) => {
                      const strategies = getStrategiesForGoal(goal.id);
                      const GoalIcon = goalIcons[goal.id] || TrendingUp;

                      return (
                        <div key={goal.id} className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                              <GoalIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-slate-900">{goal.name}</p>
                                  <p className="text-sm text-slate-500">Owner: {goal.owner}</p>
                                </div>
                                <div className="text-right">
                                  <Badge className="bg-emerald-100 text-emerald-700 text-lg font-bold">
                                    {goal.target}
                                  </Badge>
                                </div>
                              </div>

                              {/* Progress */}
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="text-slate-500">Tiến độ</span>
                                  <span className="font-semibold">{goal.progress}%</span>
                                </div>
                                <Progress value={goal.progress} className="h-2" />
                              </div>

                              {/* Strategies */}
                              {strategies.length > 0 && (
                                <div className="mt-4 rounded-lg border bg-slate-50 p-3">
                                  <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Strategies & Measures</p>
                                  {strategies.map((strategy) => (
                                    <div key={strategy.id} className="flex items-start gap-2 mt-2">
                                      <ArrowRight className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                      <div>
                                        <p className="text-sm font-medium text-slate-700">{strategy.name}</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {strategy.measures.map((measure) => (
                                            <Badge key={measure} variant="outline" className="text-xs bg-white">
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
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA to Department */}
        <Card className="mt-6 border-0 border-2 border-dashed border-slate-300 bg-slate-50">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="font-semibold text-slate-900">Cascade xuống Phòng ban</h3>
              <p className="text-sm text-slate-500">Xem chi tiết OGSM theo từng phòng ban</p>
            </div>
            <Link href="/ogsm/department">
              <Button>
                OGSM Department
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
