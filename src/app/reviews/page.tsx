'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CalendarCheck,
  Users,
  Clock,
  CheckSquare,
  ChevronRight,
  Calendar,
  BarChart3,
  Target,
  GitBranch,
  ClipboardList,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReviewItem } from '@/data/mock-data';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getReviews } from '@/lib/supabase/queries/reviews';
import { getOrganizationByName, getFirstOrganization } from '@/lib/supabase/queries/organizations';
import { mapReviewRow } from '@/lib/supabase/mappers';

const organizationName = 'KIDO Group';

const reviewFlowSteps = [
  { icon: BarChart3, label: 'KPI Check', desc: 'Xem KPIs tuần' },
  { icon: Target, label: 'Gap Analysis', desc: 'Phân tích lệch' },
  { icon: GitBranch, label: 'Fishbone Update', desc: 'Cập nhật nguyên nhân' },
  { icon: ClipboardList, label: 'Actions', desc: 'Hành động tuần sau' },
];

export default function ReviewsPage() {
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadReviews = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const org =
          (await getOrganizationByName(supabase, organizationName)) ||
          (await getFirstOrganization(supabase));
        const orgId = org?.id;

        if (!orgId) {
          return;
        }

        const reviewRows = await getReviews(supabase, orgId);
        if (!isActive) {
          return;
        }

        setReviewItems((reviewRows || []).map(mapReviewRow));
      } catch (error) {
        console.error('Failed to load reviews', error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      isActive = false;
    };
  }, []);

  const weeklyReview = reviewItems.find(r => r.type === 'weekly');
  const monthlyReview = reviewItems.find(r => r.type === 'monthly');

  if (isLoading) {
    return <div className="p-10 flex justify-center text-slate-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <Header title="Review Process" subtitle="Quy trình đánh giá Weekly / Monthly" />

      <div className="p-6">
        {/* Review Flow */}
        <Card className="mb-6 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Review Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4 py-4">
              {reviewFlowSteps.map((step, index) => (
                <div key={step.label} className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <p className="font-semibold text-slate-900">{step.label}</p>
                    <p className="text-xs text-slate-500">{step.desc}</p>
                  </div>
                  {index < reviewFlowSteps.length - 1 && (
                    <ChevronRight className="h-6 w-6 text-slate-300" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Review Types */}
        <Tabs defaultValue="weekly" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="weekly">Weekly Review</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Review</TabsTrigger>
          </TabsList>

          {/* Weekly Review */}
          <TabsContent value="weekly">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-md">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5" />
                    <div>
                      <CardTitle className="text-base">Weekly Review</CardTitle>
                      <p className="text-blue-100 text-xs">{weeklyReview?.frequency}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-slate-400" />
                      <span className="text-slate-700">Thời lượng: {weeklyReview?.duration}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-slate-700">Participants:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {weeklyReview?.participants.map(p => (
                            <Badge key={p} variant="outline">{p}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t pt-6">
                    <p className="font-semibold text-slate-900 mb-3">Checklist</p>
                    <div className="space-y-3">
                      {weeklyReview?.checklist.map((item, index) => (
                        <div key={item} className="flex items-center gap-3 rounded-lg border p-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                            {index + 1}
                          </div>
                          <span className="text-slate-700">{item}</span>
                          <CheckSquare className="ml-auto h-5 w-5 text-slate-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Reviews */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">Lịch Review sắp tới</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { date: 'Thứ 2, 16/12/2024', time: '09:00 - 10:00', type: 'Weekly Review Tuần 50', status: 'upcoming' },
                    { date: 'Thứ 2, 23/12/2024', time: '09:00 - 10:00', type: 'Weekly Review Tuần 51', status: 'scheduled' },
                    { date: 'Thứ 2, 30/12/2024', time: '09:00 - 10:00', type: 'Weekly Review Tuần 52', status: 'scheduled' },
                  ].map((review, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${review.status === 'upcoming' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                          <CalendarCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{review.type}</p>
                          <p className="text-sm text-slate-500">{review.date} • {review.time}</p>
                        </div>
                      </div>
                      {review.status === 'upcoming' && (
                        <Badge className="bg-blue-500">Sắp tới</Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Monthly Review */}
          <TabsContent value="monthly">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-md">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5" />
                    <div>
                      <CardTitle className="text-base">Monthly Review</CardTitle>
                      <p className="text-purple-100 text-xs">{monthlyReview?.frequency}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-slate-400" />
                      <span className="text-slate-700">Thời lượng: {monthlyReview?.duration}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-slate-700">Participants:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {monthlyReview?.participants.map(p => (
                            <Badge key={p} variant="outline">{p}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t pt-6">
                    <p className="font-semibold text-slate-900 mb-3">Checklist</p>
                    <div className="space-y-3">
                      {monthlyReview?.checklist.map((item, index) => (
                        <div key={item} className="flex items-center gap-3 rounded-lg border p-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 font-bold text-sm">
                            {index + 1}
                          </div>
                          <span className="text-slate-700">{item}</span>
                          <CheckSquare className="ml-auto h-5 w-5 text-slate-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Schedule */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">Lịch Monthly Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { date: 'Thứ 5, 05/12/2024', time: '14:00 - 16:00', type: 'Monthly Review T12', status: 'completed' },
                    { date: 'Thứ 6, 05/01/2025', time: '14:00 - 16:00', type: 'Monthly Review T01/2025', status: 'upcoming' },
                    { date: 'Thứ 4, 05/02/2025', time: '14:00 - 16:00', type: 'Monthly Review T02/2025', status: 'scheduled' },
                  ].map((review, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${review.status === 'completed' ? 'bg-emerald-500 text-white' :
                          review.status === 'upcoming' ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                          <CalendarCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{review.type}</p>
                          <p className="text-sm text-slate-500">{review.date} • {review.time}</p>
                        </div>
                      </div>
                      {review.status === 'completed' && <Badge className="bg-emerald-500">Đã hoàn thành</Badge>}
                      {review.status === 'upcoming' && <Badge className="bg-purple-500">Sắp tới</Badge>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
