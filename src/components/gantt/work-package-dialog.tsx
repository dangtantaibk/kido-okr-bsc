'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Trash2, Save, Plus } from 'lucide-react';
import type { OpenProjectWorkPackage, OpenProjectStatus } from '@/types/openproject';
import type { OpenProjectType, OpenProjectUserSimple } from '@/lib/openproject/actions';
import {
  getTypes,
  getStatuses,
  getProjectMembers,
  createWorkPackage,
  updateWorkPackage,
  deleteWorkPackage,
} from '@/lib/openproject/actions';

interface WorkPackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  workPackage?: OpenProjectWorkPackage | null;
  projectId: number;
  onSuccess: () => void;
}

interface FormData {
  subject: string;
  typeId: number | null;
  statusId: number | null;
  startDate: string;
  dueDate: string;
  assigneeId: number | null;
  description: string;
}

export function WorkPackageDialog({
  open,
  onOpenChange,
  mode,
  workPackage,
  projectId,
  onSuccess,
}: WorkPackageDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFetchingOptions, setIsFetchingOptions] = useState(false);

  const [types, setTypes] = useState<OpenProjectType[]>([]);
  const [statuses, setStatuses] = useState<OpenProjectStatus[]>([]);
  const [members, setMembers] = useState<OpenProjectUserSimple[]>([]);

  const [formData, setFormData] = useState<FormData>({
    subject: '',
    typeId: null,
    statusId: null,
    startDate: '',
    dueDate: '',
    assigneeId: null,
    description: '',
  });

  const [error, setError] = useState<string | null>(null);

  // Load options when dialog opens
  useEffect(() => {
    if (open && projectId) {
      loadOptions();
    }
  }, [open, projectId]);

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && workPackage) {
      const typeHref = workPackage._links.type?.href;
      const statusHref = workPackage._links.status?.href;
      const assigneeHref = workPackage._links.assignee?.href;

      setFormData({
        subject: workPackage.subject || '',
        typeId: typeHref ? parseInt(typeHref.split('/').pop() || '0') : null,
        statusId: statusHref ? parseInt(statusHref.split('/').pop() || '0') : null,
        startDate: workPackage.startDate || '',
        dueDate: workPackage.dueDate || '',
        assigneeId: assigneeHref ? parseInt(assigneeHref.split('/').pop() || '0') : null,
        description: workPackage.description?.raw || '',
      });
    } else if (mode === 'create') {
      setFormData({
        subject: '',
        typeId: null,
        statusId: null,
        startDate: '',
        dueDate: '',
        assigneeId: null,
        description: '',
      });
    }
  }, [mode, workPackage]);

  const loadOptions = async () => {
    setIsFetchingOptions(true);
    try {
      const [typesData, statusesData, membersData] = await Promise.all([
        getTypes(projectId),
        getStatuses(),
        getProjectMembers(projectId),
      ]);
      setTypes(typesData);
      setStatuses(statusesData);
      setMembers(membersData);
    } catch (err) {
      console.error('Failed to load options:', err);
    } finally {
      setIsFetchingOptions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.subject.trim()) {
      setError('Vui lòng nhập tiêu đề');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'create') {
        await createWorkPackage({
          subject: formData.subject,
          projectId,
          typeId: formData.typeId || undefined,
          statusId: formData.statusId || undefined,
          startDate: formData.startDate || null,
          dueDate: formData.dueDate || null,
          description: formData.description || undefined,
          assigneeId: formData.assigneeId,
        });
      } else if (workPackage) {
        await updateWorkPackage({
          id: workPackage.id,
          lockVersion: workPackage.lockVersion,
          subject: formData.subject,
          typeId: formData.typeId || undefined,
          statusId: formData.statusId || undefined,
          startDate: formData.startDate || null,
          dueDate: formData.dueDate || null,
          description: formData.description,
          assigneeId: formData.assigneeId,
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!workPackage) return;

    const confirmed = window.confirm(`Bạn có chắc muốn xóa "${workPackage.subject}"?`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteWorkPackage(workPackage.id);
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Tạo Work Package mới' : 'Chỉnh sửa Work Package'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Điền thông tin để tạo work package mới'
              : `Chỉnh sửa thông tin #${workPackage?.id}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Subject */}
            <div className="grid gap-2">
              <Label htmlFor="subject">Tiêu đề *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Nhập tiêu đề..."
                disabled={isLoading}
              />
            </div>

            {/* Type & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Loại</Label>
                <Select
                  value={formData.typeId?.toString() || ''}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, typeId: v ? parseInt(v) : null }))}
                  disabled={isLoading || isFetchingOptions}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại..." />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Trạng thái</Label>
                <Select
                  value={formData.statusId?.toString() || ''}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, statusId: v ? parseInt(v) : null }))}
                  disabled={isLoading || isFetchingOptions}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái..." />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.id} value={status.id.toString()}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dueDate">Ngày kết thúc</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Assignee */}
            <div className="grid gap-2">
              <Label>Người thực hiện</Label>
              <Select
                value={formData.assigneeId?.toString() || 'none'}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, assigneeId: v === 'none' ? null : parseInt(v) }))}
                disabled={isLoading || isFetchingOptions}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn người thực hiện..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không phân công</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Nhập mô tả..."
                rows={3}
                disabled={isLoading}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-500 bg-red-50 rounded-lg p-3">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            {mode === 'edit' && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading || isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span className="ml-2">Xóa</span>
              </Button>
            )}
            <div className="flex-1" />
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === 'create' ? (
                <Plus className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="ml-2">{mode === 'create' ? 'Tạo mới' : 'Lưu'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
