'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Users, Calendar, Bell } from 'lucide-react';
import { useOrganization } from '@/contexts/organization-context';
import { parseQuarterLabel, quarterOptions } from '@/lib/period';

export default function SettingsPage() {
  const { organization, isLoading, updateOrganization } = useOrganization();
  const [formState, setFormState] = useState({
    name: '',
    slogan: '',
    fiscalYear: '',
    quarter: 'Q4',
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!organization) {
      return;
    }

    const parsed = parseQuarterLabel(organization.current_quarter ?? '');
    setFormState({
      name: organization.name ?? '',
      slogan: organization.slogan ?? '',
      fiscalYear: organization.fiscal_year ?? parsed.fiscalYear ?? '',
      quarter: parsed.quarter || 'Q4',
    });
  }, [organization]);

  const isDirty = useMemo(() => {
    if (!organization) {
      return false;
    }

    const parsed = parseQuarterLabel(organization.current_quarter ?? '');
    return (
      formState.name !== (organization.name ?? '') ||
      formState.slogan !== (organization.slogan ?? '') ||
      formState.fiscalYear !== (organization.fiscal_year ?? parsed.fiscalYear ?? '') ||
      formState.quarter !== (parsed.quarter || 'Q4')
    );
  }, [formState, organization]);

  useEffect(() => {
    if (saveStatus !== 'saving' && isDirty) {
      setSaveStatus('idle');
    }
  }, [isDirty, saveStatus]);

  const handleSave = async () => {
    if (!organization?.id) {
      return;
    }

    setSaveStatus('saving');
    try {
      await updateOrganization({
        name: formState.name.trim(),
        slogan: formState.slogan.trim(),
        fiscal_year: formState.fiscalYear.trim(),
        current_quarter: formState.quarter,
      });
      setSaveStatus('success');
    } catch (error) {
      console.error('Failed to update organization', error);
      setSaveStatus('error');
    }
  };

  return (
    <div className="min-h-screen">
      <Header title="Cài đặt" subtitle="Quản lý cấu hình hệ thống" />

      <div className="p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Company Info */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Thông tin công ty</CardTitle>
                  <p className="text-sm text-slate-500">Cấu hình thông tin tổ chức</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tên công ty</Label>
                  <Input
                    value={formState.name}
                    onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Tên công ty"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mã công ty</Label>
                  <Input defaultValue="KIDO" disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Slogan</Label>
                <Input
                  value={formState.slogan}
                  onChange={(event) => setFormState((prev) => ({ ...prev, slogan: event.target.value }))}
                  placeholder="Slogan"
                />
              </div>
            </CardContent>
          </Card>

          {/* Fiscal Year */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Năm tài chính</CardTitle>
                  <p className="text-sm text-slate-500">Cấu hình chu kỳ báo cáo</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Năm tài chính hiện tại</Label>
                  <Input
                    value={formState.fiscalYear}
                    onChange={(event) => setFormState((prev) => ({ ...prev, fiscalYear: event.target.value }))}
                    placeholder="2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quý hiện tại</Label>
                  <Select
                    value={formState.quarter}
                    onValueChange={(value) => setFormState((prev) => ({ ...prev, quarter: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn quý" />
                    </SelectTrigger>
                    <SelectContent>
                      {quarterOptions.map((quarter) => (
                        <SelectItem key={quarter} value={quarter}>
                          {quarter}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-lg border bg-slate-50 p-4">
                <p className="text-sm text-slate-600">
                  <strong>Ghi chú:</strong> Năm tài chính bắt đầu từ 01/01 và kết thúc vào 31/12
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Thông báo</CardTitle>
                  <p className="text-sm text-slate-500">Cấu hình cảnh báo và thông báo</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium text-slate-900">Cảnh báo KPI có rủi ro</p>
                  <p className="text-sm text-slate-500">Nhận thông báo khi KPI dưới 80% mục tiêu</p>
                </div>
                <Badge className="bg-emerald-500">Bật</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium text-slate-900">Nhắc nhở cập nhật OKRs</p>
                  <p className="text-sm text-slate-500">Nhắc nhở cập nhật tiến độ hàng tuần</p>
                </div>
                <Badge className="bg-emerald-500">Bật</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium text-slate-900">Báo cáo CSFs bị chặn</p>
                  <p className="text-sm text-slate-500">Thông báo ngay khi CSF bị đánh dấu blocked</p>
                </div>
                <Badge className="bg-emerald-500">Bật</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Thành viên</CardTitle>
                    <p className="text-sm text-slate-500">Quản lý người dùng hệ thống</p>
                  </div>
                </div>
                <Button variant="outline">Thêm thành viên</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Nguyễn Văn An', role: 'CEO', email: 'an.nguyen@kido.vn' },
                  { name: 'Trần Thị Mai', role: 'CFO', email: 'mai.tran@kido.vn' },
                  { name: 'Lê Hoàng Nam', role: 'COO', email: 'nam.le@kido.vn' },
                  { name: 'Phạm Thị Hoa', role: 'CMO', email: 'hoa.pham@kido.vn' },
                  { name: 'Võ Minh Tuấn', role: 'CTO', email: 'tuan.vo@kido.vn' },
                ].map((user) => (
                  <div key={user.email} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-semibold text-white">
                        {user.name.split(' ').slice(-1)[0].charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{user.role}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline">Hủy thay đổi</Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-blue-700"
              disabled={isLoading || saveStatus === 'saving' || !isDirty}
              onClick={handleSave}
            >
              {saveStatus === 'saving' ? 'Đang lưu...' : 'Lưu cài đặt'}
            </Button>
          </div>
          {saveStatus === 'success' && (
            <p className="text-right text-sm text-emerald-600">Đã lưu cấu hình.</p>
          )}
          {saveStatus === 'error' && (
            <p className="text-right text-sm text-red-500">Lưu thất bại. Vui lòng thử lại.</p>
          )}
        </div>
      </div>
    </div>
  );
}
