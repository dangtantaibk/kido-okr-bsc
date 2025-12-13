'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Pencil,
  Trash2,
  DollarSign,
  Users,
  Settings2,
  BookOpen,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { kpis, perspectiveLabels, statusLabels, statusColors, Perspective } from '@/data/mock-data';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getThemeColors } from '@/lib/theme';

const perspectiveIcons = { financial: DollarSign, external: Users, internal: Settings2, learning: BookOpen };

export default function KPIDetailPage() {
  const router = useRouter();
  const params = useParams();
  const kpi = kpis.find(k => k.id === params?.id) || kpis[0];

  if (!kpi) return <div>KPI Not Found</div>;

  const theme = getThemeColors(kpi.perspective);
  const Icon = perspectiveIcons[kpi.perspective];
  const percentage = Math.round((kpi.current / kpi.target) * 100);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header title="Chi tiết KPI" subtitle="Key Performance Indicator Detail" />

      <div className="p-6 max-w-5xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6 pl-0 hover:bg-transparent hover:text-blue-600"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Button>

        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            {/* Main Info Card */}
            <Card className="border-0 shadow-md overflow-hidden">
              <div className={`h-2 w-full ${theme.solidBg}`}></div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={`${statusColors[kpi.status]} border-0 text-white`}>
                    {statusLabels[kpi.status]}
                  </Badge>
                  <Badge variant="outline" className={`${theme.badgeBg} ${theme.badgeText} border-0`}>
                    {perspectiveLabels[kpi.perspective]}
                  </Badge>
                </div>
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm shrink-0 ${theme.lightBg} ${theme.textColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold leading-tight text-slate-900">
                      {kpi.name}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Hiện tại</p>
                    <p className={`text-4xl font-bold ${theme.textColor}`}>{kpi.current} <span className="text-lg font-medium text-slate-400">{kpi.unit}</span></p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Mục tiêu</p>
                    <p className="text-4xl font-bold text-slate-700">{kpi.target} <span className="text-lg font-medium text-slate-400">{kpi.unit}</span></p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-slate-500" />
                    Biểu đồ lịch sử
                  </h3>
                  <div className="h-[300px] w-full border rounded-xl p-4 bg-white shadow-sm">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={kpi.history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={theme.solidBg.replace('bg-', 'text-').replace('text-', '#').replace('blue-500', '#3b82f6').replace('amber-500', '#f59e0b').replace('emerald-500', '#10b981').replace('purple-500', '#a855f7')}
                          fill={theme.solidBg.replace('bg-', 'text-').replace('text-', '#').replace('blue-500', '#3b82f6').replace('amber-500', '#f59e0b').replace('emerald-500', '#10b981').replace('purple-500', '#a855f7') + '33'}
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Analysis Card */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Phân tích</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-dashed">
                  <span className="text-sm text-slate-500">Hoàn thành</span>
                  <span className={`font-bold text-lg ${percentage >= 100 ? 'text-emerald-600' : percentage >= 80 ? 'text-amber-600' : 'text-red-600'}`}>{percentage}%</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-dashed">
                  <span className="text-sm text-slate-500">Xu hướng</span>
                  <div className={`flex items-center gap-1 font-medium ${kpi.trend === 'up' ? 'text-emerald-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-slate-600'}`}>
                    {kpi.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : kpi.trend === 'down' ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                    {kpi.trend === 'up' ? 'Đang tăng' : kpi.trend === 'down' ? 'Đang giảm' : 'Ổn định'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 shadow-md h-12 text-base">
              <Pencil className="mr-2 h-4 w-4" />
              Cập nhật số liệu
            </Button>

            <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa KPI
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
