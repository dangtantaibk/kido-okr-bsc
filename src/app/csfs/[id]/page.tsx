'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  XCircle,
  Circle,
  Target,
  Pencil
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { csfStatusLabels, csfStatusColors, priorityLabels, priorityColors, perspectiveLabels, statusLabels, statusColors } from '@/data/mock-data';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getCSFs } from '@/lib/supabase/queries/csfs';
import { mapCSFRow, type CSFWithRelations } from '@/lib/supabase/mappers';
import { useOrganization } from '@/contexts/organization-context';

export default function CSFDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [csf, setCsf] = useState<CSFWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { organization, activeFiscalYear, isLoading: isOrgLoading } = useOrganization();

  useEffect(() => {
    let isActive = true;

    const loadCSF = async () => {
      try {
        setIsLoading(true);
        const csfId = typeof params?.id === 'string' ? params.id : '';
        if (!csfId) {
          return;
        }

        const supabase = getSupabaseBrowserClient();
        const orgId = organization?.id;

        if (!orgId) {
          return;
        }

        const csfRows = await getCSFs(supabase, orgId, activeFiscalYear);
        const match = (csfRows || []).find((row: any) => row?.id === csfId);
        if (!isActive) {
          return;
        }

        setCsf(match ? mapCSFRow(match) : null);
      } catch (error) {
        console.error('Failed to load CSF detail', error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    if (!isOrgLoading) {
      loadCSF();
    }

    return () => {
      isActive = false;
    };
  }, [params, organization?.id, activeFiscalYear, isOrgLoading]);

  const relatedOKRs = useMemo(() => csf?.relatedOKRs ?? [], [csf]);

  if (isLoading) {
    return <div className="p-10 flex justify-center text-slate-400">Loading...</div>;
  }

  if (!csf) return <div>CSF Not Found</div>;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header title="Chi tiết CSF" subtitle="Critical Success Factor Detail" />

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
              <div className={`h-2 w-full ${csf.status === 'in_progress' ? 'bg-blue-500' :
                csf.status === 'completed' ? 'bg-emerald-500' :
                  csf.status === 'blocked' ? 'bg-red-500' : 'bg-gray-400'
                }`}></div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={`${csfStatusColors[csf.status]} border-0 text-white`}>
                    {csfStatusLabels[csf.status]}
                  </Badge>
                  <Badge className={`${priorityColors[csf.priority]} border-0 text-white`}>
                    {priorityLabels[csf.priority]}
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold leading-tight text-slate-900">
                  {csf.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Mô tả</h3>
                  <p className="text-slate-700 leading-relaxed">{csf.description}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Tiến độ</h3>
                    <span className="text-2xl font-bold text-slate-900">{csf.progress}%</span>
                  </div>
                  <Progress value={csf.progress} className="h-4" />
                </div>
              </CardContent>
            </Card>

            {/* Related OKRs */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">OKRs Liên quan</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {relatedOKRs.map((okr) => (
                    <div key={okr.id} className="flex items-start gap-4 p-4 rounded-xl border bg-slate-50/50 hover:border-blue-200 transition-colors">
                      <div className="mt-1">
                        <Target className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{okr.objective}</h4>
                        <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                          <span>{perspectiveLabels[okr.perspective]}</span>
                          <Badge variant="outline" className={`scale-90 origin-left ${statusColors[okr.status]} text-white border-0`}>
                            {statusLabels[okr.status]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Meta Info */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Thông tin chung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-dashed">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <User className="h-4 w-4" /> Phụ trách
                  </span>
                  <span className="font-medium text-slate-900">{csf.assignee}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-dashed">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <User className="h-4 w-4" /> Team
                  </span>
                  <span className="font-medium text-slate-900">{csf.team}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-dashed">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Hạn hoàn thành
                  </span>
                  <span className="font-medium text-slate-900">{csf.dueDate}</span>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 shadow-md">
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa CSF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
