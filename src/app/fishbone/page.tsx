'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Plus,
  GitBranch,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import FishboneDiagram from './fishbone-diagram';
import {
  fishboneItems,
  actionStatusLabels,
  actionStatusColors,
} from '@/data/mock-data';
import { useState } from 'react';

const factorColors: Record<string, string> = {
  'Forecast': 'bg-blue-500',
  'Kho': 'bg-emerald-500',
  'Trade': 'bg-amber-500',
  'Sản xuất': 'bg-purple-500',
  'NPD': 'bg-pink-500',
  'Logistics': 'bg-cyan-500',
};

export default function FishbonePage() {
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);

  const factors = [...new Set(fishboneItems.map(item => item.factor))];

  const filteredItems = selectedFactor
    ? fishboneItems.filter(item => item.factor === selectedFactor)
    : fishboneItems;

  const statusCounts = {
    done: fishboneItems.filter(i => i.status === 'done').length,
    pending: fishboneItems.filter(i => i.status === 'pending').length,
    overdue: fishboneItems.filter(i => i.status === 'overdue').length,
  };

  return (
    <div className="min-h-screen">
      <Header title="Fishbone Analysis" subtitle="Phân tích nguyên nhân gốc rễ" />

      <div className="p-6">
        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md">
            <CardContent className="flex items-center justify-between p-6">
              <div><p className="text-emerald-100">Hoàn thành</p><p className="mt-1 text-4xl font-bold">{statusCounts.done}</p></div>
              <CheckCircle2 className="h-12 w-12 text-emerald-200" />
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md">
            <CardContent className="flex items-center justify-between p-6">
              <div><p className="text-amber-100">Đang chờ</p><p className="mt-1 text-4xl font-bold">{statusCounts.pending}</p></div>
              <Clock className="h-12 w-12 text-amber-200" />
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md">
            <CardContent className="flex items-center justify-between p-6">
              <div><p className="text-red-100">Quá hạn</p><p className="mt-1 text-4xl font-bold">{statusCounts.overdue}</p></div>
              <XCircle className="h-12 w-12 text-red-200" />
            </CardContent>
          </Card>
        </div>

        {/* Filter by Factor */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-500 mr-2">Yếu tố:</span>
          <Button
            variant={selectedFactor === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFactor(null)}
          >
            Tất cả
          </Button>
          {factors.map(factor => (
            <Button
              key={factor}
              variant={selectedFactor === factor ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFactor(factor)}
            >
              {factor}
            </Button>
          ))}
        </div>

        {/* Fishbone Diagram (Interactive) */}
        <Card className="mb-6 border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <GitBranch className="h-5 w-5 text-blue-500" />
                Sơ đồ Fishbone
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <FishboneDiagram />
          </CardContent>
        </Card>

        {/* Action Items Table */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Hành động khắc phục</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Yếu tố</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Vấn đề</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Hành động</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Người phụ trách</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Deadline</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Kết quả mong đợi</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Badge className={`${factorColors[item.factor] || 'bg-gray-500'} text-white`}>
                          {item.factor}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-900">{item.problem}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.action}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.owner}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.deadline}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.result}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={`${actionStatusColors[item.status]} text-white`}>
                          {actionStatusLabels[item.status]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
