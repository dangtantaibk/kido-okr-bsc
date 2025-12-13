'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  DollarSign,
  Users,
  Settings2,
  BookOpen,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  kpis,
  Perspective,
  perspectiveLabels,
  statusLabels,
  statusColors,
} from '@/data/mock-data';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const perspectiveIcons = { financial: DollarSign, external: Users, internal: Settings2, learning: BookOpen };
const statusIcons = { on_track: CheckCircle2, at_risk: AlertTriangle, off_track: XCircle, completed: CheckCircle2 };

export default function KPIsPage() {
  const [selectedPerspective, setSelectedPerspective] = useState<Perspective | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredKPIs = kpis
    .filter((k) => selectedPerspective === 'all' || k.perspective === selectedPerspective)
    .filter((k) => selectedStatus === 'all' || k.status === selectedStatus);

  const onTrack = kpis.filter((k) => k.status === 'on_track').length;
  const atRisk = kpis.filter((k) => k.status === 'at_risk').length;
  const offTrack = kpis.filter((k) => k.status === 'off_track').length;

  return (
    <div className="min-h-screen">
      <Header title="KPIs" subtitle="Key Performance Indicators" />
      <div className="p-6">
        {/* Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md">
            <CardContent className="flex items-center justify-between p-6">
              <div><p className="text-emerald-100">Đúng tiến độ</p><p className="mt-1 text-4xl font-bold">{onTrack}</p></div>
              <CheckCircle2 className="h-12 w-12 text-emerald-200" />
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md">
            <CardContent className="flex items-center justify-between p-6">
              <div><p className="text-amber-100">Có rủi ro</p><p className="mt-1 text-4xl font-bold">{atRisk}</p></div>
              <AlertTriangle className="h-12 w-12 text-amber-200" />
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md">
            <CardContent className="flex items-center justify-between p-6">
              <div><p className="text-red-100">Chậm tiến độ</p><p className="mt-1 text-4xl font-bold">{offTrack}</p></div>
              <XCircle className="h-12 w-12 text-red-200" />
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Filter className="h-5 w-5 text-slate-400" />
          <Select value={selectedPerspective} onValueChange={(v) => setSelectedPerspective(v as Perspective | 'all')}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Perspective" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả Perspectives</SelectItem>
              <SelectItem value="financial">Tài chính</SelectItem>
              <SelectItem value="external">Khách hàng</SelectItem>
              <SelectItem value="internal">Quy trình nội bộ</SelectItem>
              <SelectItem value="learning">Học hỏi & Phát triển</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="on_track">Đúng tiến độ</SelectItem>
              <SelectItem value="at_risk">Có rủi ro</SelectItem>
              <SelectItem value="off_track">Chậm tiến độ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPIs Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredKPIs.map((kpi) => {
            const Icon = perspectiveIcons[kpi.perspective];
            const StatusIcon = statusIcons[kpi.status];
            const percentage = Math.round((kpi.current / kpi.target) * 100);
            return (
              <Card key={kpi.id} className="border-0 shadow-md hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.perspective === 'financial' ? 'bg-blue-100 text-blue-600' :
                          kpi.perspective === 'external' ? 'bg-amber-100 text-amber-600' :
                            kpi.perspective === 'internal' ? 'bg-emerald-100 text-emerald-600' :
                              'bg-purple-100 text-purple-600'
                        }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-medium">{kpi.name}</CardTitle>
                        <p className="text-xs text-slate-500">{perspectiveLabels[kpi.perspective]}</p>
                      </div>
                    </div>
                    <Badge className={`${statusColors[kpi.status]} border-0 text-white`}>
                      <StatusIcon className="mr-1 h-3 w-3" />{percentage}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-bold">{kpi.current}{kpi.unit === '%' && '%'}</span>
                      <span className="text-sm text-slate-500">/ {kpi.target}{kpi.unit === '%' ? '%' : ` ${kpi.unit}`}</span>
                    </div>
                    <Progress value={Math.min(percentage, 100)} className="mt-2 h-2" />
                  </div>
                  <div className="flex items-center justify-between border-t pt-3">
                    <div className={`flex items-center gap-1 text-sm ${kpi.trend === 'up' ? 'text-emerald-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-slate-500'
                      }`}>
                      {kpi.trend === 'up' ? <ArrowUp className="h-4 w-4" /> : kpi.trend === 'down' ? <ArrowDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                      <span>{kpi.trend === 'up' ? 'Tăng' : kpi.trend === 'down' ? 'Giảm' : 'Ổn định'}</span>
                    </div>
                    <span className="text-xs text-slate-400">xu hướng</span>
                  </div>
                  <div className="mt-3 h-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={kpi.history.slice(-6)}>
                        <Area type="monotone" dataKey="value" stroke={kpi.status === 'on_track' ? '#10b981' : kpi.status === 'at_risk' ? '#f59e0b' : '#ef4444'} strokeWidth={2} fill={kpi.status === 'on_track' ? '#10b98133' : kpi.status === 'at_risk' ? '#f59e0b33' : '#ef444433'} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="border-0 shadow-md">
            <CardHeader><CardTitle className="text-base">Doanh thu & EBITDA (tỷ VND)</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={kpis.find((k) => k.id === 'kpi-1')?.history.map((h, i) => ({ month: h.month, revenue: h.value, ebitda: kpis.find((k) => k.id === 'kpi-3')?.history[i]?.value || 0 }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="revenue" name="Doanh thu" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ebitda" name="EBITDA" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardHeader><CardTitle className="text-base">Hiệu suất sản xuất (OEE)</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={kpis.find((k) => k.id === 'kpi-7')?.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} domain={[75, 90]} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="value" name="OEE (%)" stroke="#10b981" strokeWidth={2} fill="#10b98133" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
