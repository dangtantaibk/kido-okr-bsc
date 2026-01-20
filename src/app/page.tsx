'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Target,
  BarChart3,
  CheckSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Users,
  Settings2,
  BookOpen,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  perspectiveLabels,
  statusLabels,
  statusColors,
} from '@/data/mock-data';
import type { OKR, KPI, CSF } from '@/data/mock-data';
import { useEffect, useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getOKRsByQuarter } from '@/lib/supabase/queries/okrs';
import { getKPIsByOrg, getKPIWithHistory } from '@/lib/supabase/queries/kpis';
import { getCSFs } from '@/lib/supabase/queries/csfs';
import { mapCSFRow, mapKpiHistory, mapKpiRow, mapOKRRow } from '@/lib/supabase/mappers';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { formatQuarterLabel } from '@/lib/period';

// Perspective Icons
const perspectiveIcons = {
  financial: DollarSign,
  external: Users,
  internal: Settings2,
  learning: BookOpen,
};

// Trend Icons
const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

export default function DashboardPage() {
  const [okrsData, setOkrsData] = useState<OKR[]>([]);
  const [kpisData, setKpisData] = useState<KPI[]>([]);
  const [csfsData, setCsfsData] = useState<CSF[]>([]);
  const [revenueHistory, setRevenueHistory] = useState<{ month: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { organization, isLoading: isOrgLoading, activeQuarter, activeFiscalYear } = useOrganization();
  const quarterLabel = formatQuarterLabel(activeQuarter, activeFiscalYear);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const supabase = getSupabaseBrowserClient();
        const orgId = organization?.id;

        if (!orgId) {
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }

        const [okrsRows, kpisRows, csfRows] = await Promise.all([
          getOKRsByQuarter(supabase, activeQuarter, orgId, activeFiscalYear),
          getKPIsByOrg(supabase, orgId, activeFiscalYear),
          getCSFs(supabase, orgId, activeFiscalYear),
        ]);

        if (!isMounted) {
          return;
        }

        const mappedOKRs = (okrsRows || []).map(mapOKRRow);
        const mappedKPIs = (kpisRows || []).map(mapKpiRow);
        const mappedCSFs = (csfRows || []).map((row) => {
          const mapped = mapCSFRow(row);
          return {
            ...mapped,
            relatedOKRs: mapped.relatedOKRs.map((okr) => okr.id),
          } as CSF;
        });

        setOkrsData(mappedOKRs);
        setKpisData(mappedKPIs);
        setCsfsData(mappedCSFs);

        const revenueKpi = kpisRows?.find((kpi: { id?: string; name?: string } | null) =>
          kpi?.name === 'Doanh thu'
        );
        if (revenueKpi?.id) {
          const kpiWithHistory = await getKPIWithHistory(supabase, revenueKpi.id);
          if (isMounted) {
            setRevenueHistory(mapKpiHistory(kpiWithHistory?.history || []));
          }
        }
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (!isOrgLoading) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [organization?.id, activeQuarter, activeFiscalYear, isOrgLoading]);

  const dashboardStats = useMemo(() => {
    const totalOKRs = okrsData.length;
    const totalKPIs = kpisData.length;
    const totalCSFs = csfsData.length;
    const averageProgress =
      totalOKRs === 0
        ? 0
        : Math.round(okrsData.reduce((acc, okr) => acc + okr.progress, 0) / totalOKRs);

    return {
      totalOKRs,
      okrsOnTrack: okrsData.filter((okr) => okr.status === 'on_track').length,
      okrsAtRisk: okrsData.filter((okr) => okr.status === 'at_risk').length,
      okrsOffTrack: okrsData.filter((okr) => okr.status === 'off_track').length,
      averageProgress,
      totalKPIs,
      kpisOnTrack: kpisData.filter((kpi) => kpi.status === 'on_track').length,
      kpisAtRisk: kpisData.filter((kpi) => kpi.status === 'at_risk').length,
      kpisOffTrack: kpisData.filter((kpi) => kpi.status === 'off_track').length,
      totalCSFs,
      csfsCompleted: csfsData.filter((csf) => csf.status === 'completed').length,
      csfsInProgress: csfsData.filter((csf) => csf.status === 'in_progress').length,
      csfsBlocked: csfsData.filter((csf) => csf.status === 'blocked').length,
    };
  }, [okrsData, kpisData, csfsData]);

  const revenueKPI = useMemo(
    () => ({
      history: revenueHistory,
    }),
    [revenueHistory]
  );

  if (isLoading) {
    return <div className="p-10 flex justify-center text-slate-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <Header title="Dashboard" subtitle={`Tổng quan chiến lược ${quarterLabel || ''}`.trim()} />

      <div className="p-6">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* OKRs Card */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Tổng OKRs</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">
                    {dashboardStats.totalOKRs}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="flex items-center text-emerald-600">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      {dashboardStats.okrsOnTrack} đúng tiến độ
                    </span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <Target className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPIs Card */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Tổng KPIs</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">
                    {dashboardStats.totalKPIs}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="flex items-center text-amber-600">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      {dashboardStats.kpisAtRisk} có rủi ro
                    </span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                  <BarChart3 className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CSFs Card */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Tổng CSFs</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">
                    {dashboardStats.totalCSFs}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="flex items-center text-blue-600">
                      {dashboardStats.csfsInProgress} đang thực hiện
                    </span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                  <CheckSquare className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Progress Card */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Tiến độ trung bình</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">
                    {dashboardStats.averageProgress}%
                  </p>
                  <div className="mt-2">
                    <Progress value={dashboardStats.averageProgress} className="h-2" />
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Perspectives */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          {/* Revenue Chart */}
          <Card className="border-0 shadow-md lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Doanh thu theo tháng (tỷ VND)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueKPI?.history || []}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 4 Perspectives Summary */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">4 Perspectives</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(['financial', 'external', 'internal', 'learning'] as const).map((perspective) => {
                const perspectiveOKRs = okrsData.filter((o) => o.perspective === perspective);
                const avgProgress =
                  Math.round(
                    perspectiveOKRs.reduce((acc, o) => acc + o.progress, 0) /
                    perspectiveOKRs.length
                  ) || 0;
                const Icon = perspectiveIcons[perspective];

                return (
                  <div
                    key={perspective}
                    className="flex items-center gap-4 rounded-lg border border-slate-100 bg-slate-50 p-3"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${perspective === 'financial'
                          ? 'bg-blue-100 text-blue-600'
                          : perspective === 'external'
                            ? 'bg-amber-100 text-amber-600'
                            : perspective === 'internal'
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-purple-100 text-purple-600'
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">
                        {perspectiveLabels[perspective]}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Progress value={avgProgress} className="h-1.5 flex-1" />
                        <span className="text-xs font-medium text-slate-500">{avgProgress}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* OKRs and KPIs Overview */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent OKRs */}
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">OKRs gần đây</CardTitle>
              <Badge variant="outline" className="text-blue-600">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                Xem tất cả
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {okrsData.slice(0, 4).map((okr) => (
                <div
                  key={okr.id}
                  className="flex items-start gap-4 rounded-lg border border-slate-100 bg-white p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`${statusColors[okr.status]} border-0 text-white`}
                      >
                        {statusLabels[okr.status]}
                      </Badge>
                      <span className="text-xs text-slate-400">{okr.quarter}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-900">{okr.objective}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Progress value={okr.progress} className="h-1.5 flex-1" />
                      <span className="text-xs font-semibold text-slate-600">{okr.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* KPIs At Risk */}
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">KPIs cần chú ý</CardTitle>
              <Badge variant="outline" className="text-amber-600">
                <AlertTriangle className="mr-1 h-3 w-3" />
                {kpisData.filter((k) => k.status !== 'on_track').length} cảnh báo
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {kpisData
                .filter((k) => k.status !== 'on_track')
                .slice(0, 4)
                .map((kpi) => {
                  const TrendIcon = trendIcons[kpi.trend];
                  const percentage = Math.round((kpi.current / kpi.target) * 100);

                  return (
                    <div
                      key={kpi.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">{kpi.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Hiện tại: {kpi.current}
                          {kpi.unit === '%' ? '%' : ` ${kpi.unit}`} / Mục tiêu: {kpi.target}
                          {kpi.unit === '%' ? '%' : ` ${kpi.unit}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className={`${statusColors[kpi.status]} border-0 text-white`}
                        >
                          {percentage}%
                        </Badge>
                        <div className="mt-1 flex items-center justify-end">
                          <TrendIcon
                            className={`h-4 w-4 ${kpi.trend === 'up'
                                ? 'text-emerald-500'
                                : kpi.trend === 'down'
                                  ? 'text-red-500'
                                  : 'text-slate-400'
                              }`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        </div>

        {/* CSFs Quick View */}
        <Card className="mt-6 border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Critical Success Factors</CardTitle>
            <div className="flex gap-2">
              <Badge className="bg-gray-400">
                {csfsData.filter((c) => c.status === 'not_started').length} Chưa bắt đầu
              </Badge>
              <Badge className="bg-blue-500">
                {csfsData.filter((c) => c.status === 'in_progress').length} Đang thực hiện
              </Badge>
              <Badge className="bg-emerald-500">
                {csfsData.filter((c) => c.status === 'completed').length} Hoàn thành
              </Badge>
              <Badge className="bg-red-500">
                {csfsData.filter((c) => c.status === 'blocked').length} Bị chặn
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {csfsData.slice(0, 4).map((csf) => (
                <div
                  key={csf.id}
                  className="rounded-lg border border-slate-100 bg-white p-4"
                >
                  <div className="flex items-start justify-between">
                    <Badge
                      variant="outline"
                      className={`${csf.status === 'completed'
                          ? 'bg-emerald-500'
                          : csf.status === 'in_progress'
                            ? 'bg-blue-500'
                            : csf.status === 'blocked'
                              ? 'bg-red-500'
                              : 'bg-gray-400'
                        } border-0 text-white`}
                    >
                      {csf.status === 'completed'
                        ? 'Hoàn thành'
                        : csf.status === 'in_progress'
                          ? 'Đang thực hiện'
                          : csf.status === 'blocked'
                            ? 'Bị chặn'
                            : 'Chưa bắt đầu'}
                    </Badge>
                    {csf.priority === 'critical' && <XCircle className="h-4 w-4 text-red-500" />}
                    {csf.priority === 'high' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-900">{csf.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {csf.team} • {csf.assignee}
                  </p>
                  <div className="mt-3">
                    <Progress value={csf.progress} className="h-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
