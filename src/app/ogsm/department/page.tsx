'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Building2,
  Target,
  Lightbulb,
  BarChart3,
} from 'lucide-react';
import { departmentOGSMs } from '@/data/mock-data';
import Link from 'next/link';

const purposeColors: Record<string, string> = {
  'Tăng trưởng': 'bg-emerald-500',
  'NPD': 'bg-purple-500',
  'Chi phí': 'bg-amber-500',
};

export default function OGSMDepartmentPage() {
  // Group by purpose
  const groupedByPurpose = departmentOGSMs.reduce((acc, dept) => {
    if (!acc[dept.purpose]) acc[dept.purpose] = [];
    acc[dept.purpose].push(dept);
    return acc;
  }, {} as Record<string, typeof departmentOGSMs>);

  return (
    <div className="min-h-screen">
      <Header title="OGSM Department" subtitle="Phân rã chiến lược theo Phòng ban" />

      <div className="p-6">
        {/* Back to Company */}
        <Link href="/ogsm">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại OGSM Company
          </Button>
        </Link>

        {/* OGSM Table Header */}
        <Card className="mb-6 border-0 shadow-md">
          <CardContent className="p-0">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 border-b bg-slate-50 p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <div className="col-span-2 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>Phòng ban</span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>Mục tiêu</span>
              </div>
              <div className="col-span-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                <span>Chiến lược</span>
              </div>
              <div className="col-span-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Chỉ số đo</span>
              </div>
              <div className="col-span-2 text-right">Tiến độ</div>
            </div>

            {/* Rows */}
            <div className="divide-y">
              {departmentOGSMs.map((dept) => (
                <div key={dept.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50/50 transition-colors">
                  {/* Department */}
                  <div className="col-span-2">
                    <p className="font-semibold text-slate-900">{dept.department}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`h-2 w-2 rounded-full ${purposeColors[dept.purpose] || 'bg-gray-500'}`} />
                      <span className="text-xs text-slate-500">{dept.purpose}</span>
                    </div>
                  </div>

                  {/* Objective */}
                  <div className="col-span-2">
                    <span className="text-lg font-bold text-emerald-600">
                      {dept.objective}
                    </span>
                  </div>

                  {/* Strategy */}
                  <div className="col-span-3">
                    <p className="text-sm font-medium text-slate-700">{dept.strategy}</p>
                  </div>

                  {/* Measures */}
                  <div className="col-span-3 flex flex-wrap gap-1">
                    {dept.measures.map((measure) => (
                      <span key={measure} className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600">
                        {measure}
                      </span>
                    ))}
                  </div>

                  {/* Progress */}
                  <div className="col-span-2">
                    <div className="flex items-center justify-end gap-3 mb-1">
                      <span className="text-xs text-slate-400">{dept.owner}</span>
                      <span className={`font-bold ${dept.progress >= 80 ? 'text-emerald-600' : dept.progress >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                        {dept.progress}%
                      </span>
                    </div>
                    <Progress value={dept.progress} className="h-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Grouped by Purpose View */}
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Theo Mục đích chiến lược</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {Object.entries(groupedByPurpose).map(([purpose, departments]) => (
            <Card key={purpose} className="border-0 shadow-md overflow-hidden bg-slate-50/50">
              <CardHeader className={`${purposeColors[purpose] || 'bg-gray-500'} text-white px-4 py-3`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold uppercase tracking-wide">{purpose}</CardTitle>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white">
                    {departments.length} phòng ban
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {departments.map((dept) => (
                  <div key={dept.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-slate-900">{dept.department}</p>
                      <Badge variant="outline" className="font-bold">{dept.objective}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{dept.strategy}</p>
                    <Progress value={dept.progress} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
