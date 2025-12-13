'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Building2,
  Target,
  Lightbulb,
  BarChart3,
  TrendingUp,
  Users,
  Sparkles,
  Globe,
  Wallet,
  ArrowRight,
  Filter,
} from 'lucide-react';
import {
  departmentOGSMs,
  ogsmGoals,
  ogsmObjectives,
  perspectiveColors,
  perspectiveLabels,
  Perspective,
} from '@/data/mock-data';
import Link from 'next/link';
import { InteractiveGraph } from '../interactive-graph';

// --- Helpers ---

// Logic to derive Perspective from the linked Company Goal
const getPerspectiveForDept = (linkedGoalId?: string): Perspective | null => {
  if (!linkedGoalId) return null;
  const goal = ogsmGoals.find(g => g.id === linkedGoalId);
  if (!goal) return null;
  const objective = ogsmObjectives.find(o => o.id === goal.objectiveId);
  if (!objective) return null;
  return objective.perspective;
};

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

export default function OGSMDepartmentPage() {
  const [selectedDept, setSelectedDept] = useState<string>('all');

  // Extract unique departments
  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(departmentOGSMs.map(d => d.department))).sort();
  }, []);

  // Filter data
  const filteredData = useMemo(() => {
    if (selectedDept === 'all') return departmentOGSMs;
    return departmentOGSMs.filter(d => d.department === selectedDept);
  }, [selectedDept]);

  return (
    <div className="min-h-screen">
      <Header title="OGSM Department" subtitle="Phân rã chiến lược theo Phòng ban" />

      <div className="p-6">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/ogsm">
            <Button variant="outline" size="sm" className="hover:bg-slate-100">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại OGSM Company
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="list" className="w-full">
          {/* Sticky Header Bar */}
          <div className="sticky top-16 z-20 bg-slate-50/95 backdrop-blur supports-[backdrop-filter]:bg-slate-50/80 -mx-6 px-6 py-3 border-b border-slate-200 mb-6 shadow-sm transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

              {/* Left: View Tabs */}
              <TabsList className="bg-white border shadow-sm self-start md:self-auto h-9">
                <TabsTrigger value="list" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 text-xs px-3">
                  List View
                </TabsTrigger>
                <TabsTrigger value="graph" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 text-xs px-3">
                  Graph Tree View
                </TabsTrigger>
              </TabsList>

              {/* Right: Department Filter */}
              <div className="flex items-center gap-3 self-start md:self-auto w-full md:w-auto">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm h-9 w-full md:w-auto">
                  <Filter className="w-4 h-4 text-slate-400 ml-1" />
                  <span className="text-xs font-medium text-slate-500 whitespace-nowrap hidden sm:block">Phòng ban:</span>
                  <Select value={selectedDept} onValueChange={setSelectedDept}>
                    <SelectTrigger className="h-7 border-0 focus:ring-0 text-xs font-semibold text-slate-700 min-w-[140px] w-full md:w-[180px]">
                      <SelectValue placeholder="Chọn phòng ban" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs font-medium">Tất cả phòng ban ({departmentOGSMs.length})</SelectItem>
                      {uniqueDepartments.map(dept => (
                        <SelectItem key={dept} value={dept} className="text-xs">
                          {dept} ({departmentOGSMs.filter(d => d.department === dept).length})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

            </div>
          </div>

          <TabsContent value="list" className="mt-0">
            {/* Context Header if Filtered */}
            {selectedDept !== 'all' && (
              <div className="mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedDept}</h2>
                  <p className="text-sm text-slate-500">
                    Đang hiển thị {filteredData.length} mục tiêu chiến lược của phòng {selectedDept}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              {filteredData.map((dept) => {
                const perspective = getPerspectiveForDept(dept.linkedGoalId) || 'financial'; // Fallback to 'financial' if orphan
                const theme = getThemeColors(perspective);

                return (
                  <Card key={dept.id} className="border-0 shadow-md hover:shadow-lg transition-all overflow-hidden py-0 gap-0">
                    {/* Header */}
                    <CardHeader className={`${theme.solidBg} text-white py-4 px-6 relative overflow-hidden group`}>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-white/80 tracking-wider">Department</p>
                            <h3 className="text-lg font-bold leading-tight">{dept.department}</h3>
                          </div>
                        </div>
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                          {perspectiveLabels[perspective]}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 pt-6">
                      {/* Linked Goal Context */}
                      <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors cursor-default">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" />
                          Aligns with Company Goal
                        </p>
                        {dept.linkedGoalId ? (
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${theme.solidBg}`}></div>
                            <p className="text-xs font-semibold text-slate-700 line-clamp-1">
                              {ogsmGoals.find(g => g.id === dept.linkedGoalId)?.name || 'Unknown Goal'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Not linked to Company Goal</span>
                        )}
                      </div>

                      {/* Objective */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Target className={`h-4 w-4 ${theme.iconColor}`} />
                          <span className="text-sm font-bold text-slate-800">Mục tiêu (Objective)</span>
                        </div>
                        <p className="text-sm text-slate-600 pl-6 leading-relaxed">
                          {dept.objective}
                        </p>
                      </div>

                      {/* Strategy */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Lightbulb className={`h-4 w-4 ${theme.iconColor}`} />
                          <span className="text-sm font-bold text-slate-800">Chiến lược (Strategy)</span>
                        </div>
                        <p className="text-sm text-slate-600 pl-6 leading-relaxed">
                          {dept.strategy}
                        </p>
                      </div>

                      {/* Measures */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className={`h-4 w-4 ${theme.iconColor}`} />
                          <span className="text-sm font-bold text-slate-800">Đo lường (Metric)</span>
                        </div>
                        <div className="pl-6 flex flex-wrap gap-2">
                          {dept.measures.map(m => (
                            <Badge key={m} variant="secondary" className={`${theme.badgeBg} ${theme.badgeText} border-0 hover:scale-105 transition-transform`}>
                              {m}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Footer: Progress & Owner */}
                      <div className={`pt-4 border-t border-dashed ${theme.borderColor.replace('border', 'border-slate-200').replace('500', '200')}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full ${theme.lightBg} flex items-center justify-center text-xs font-bold ${theme.textColor}`}>
                              {dept.owner.charAt(0)}
                            </div>
                            <span className="text-xs font-medium text-slate-500">{dept.owner}</span>
                          </div>
                          <span className={`text-sm font-bold ${theme.textColor}`}>{dept.progress}%</span>
                        </div>
                        <Progress value={dept.progress} className={`h-2 bg-slate-100 [&>div]:${theme.progressBg}`} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredData.length === 0 && (
              <div className="text-center py-20 bg-slate-50 border border-slate-100 rounded-xl border-dashed">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900">Không có dữ liệu</h3>
                <p className="text-sm text-slate-500">Chưa có mục tiêu nào được gán cho phòng ban này.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="graph">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Department Alignment Graph</h3>
              <p className="text-sm text-slate-500">
                {selectedDept !== 'all'
                  ? `Showing vertical alignment for ${selectedDept}`
                  : 'Visualizing department contributions to company goals'}
              </p>
            </div>
            <InteractiveGraph filterDepartment={selectedDept !== 'all' ? selectedDept : undefined} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
