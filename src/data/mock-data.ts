// Mock data for KIDO Group Strategic Balanced Scorecard

export type Perspective = 'financial' | 'external' | 'internal' | 'learning';
export type OKRStatus = 'on_track' | 'at_risk' | 'off_track' | 'completed';
export type CSFStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface KeyResult {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
}

export interface OKR {
  id: string;
  objective: string;
  perspective: Perspective;
  quarter: string;
  status: OKRStatus;
  progress: number;
  keyResults: KeyResult[];
  owner: string;
  dueDate: string;
}

export interface KPI {
  id: string;
  name: string;
  perspective: Perspective;
  target: number;
  current: number;
  unit: string;
  status: OKRStatus;
  trend: 'up' | 'down' | 'stable';
  history: { month: string; value: number }[];
}

export interface CSF {
  id: string;
  title: string;
  description: string;
  status: CSFStatus;
  priority: Priority;
  assignee: string;
  team: string;
  dueDate: string;
  relatedOKRs: string[];
  progress: number;
}

export interface User {
  id: string;
  name: string;
  role: string;
  avatar: string;
  team: string;
}

// Company Info
export const companyInfo = {
  name: 'KIDO Group',
  slogan: 'Tập đoàn FMCG hàng đầu Việt Nam',
  logo: '/kido-logo.png',
  fiscalYear: '2024',
  currentQuarter: 'Q4 2024',
};

// Users
export const users: User[] = [
  { id: '1', name: 'Nguyễn Văn An', role: 'CEO', avatar: '', team: 'Ban điều hành' },
  { id: '2', name: 'Trần Thị Mai', role: 'CFO', avatar: '', team: 'Tài chính' },
  { id: '3', name: 'Lê Hoàng Nam', role: 'COO', avatar: '', team: 'Vận hành' },
  { id: '4', name: 'Phạm Thị Hoa', role: 'CMO', avatar: '', team: 'Marketing' },
  { id: '5', name: 'Võ Minh Tuấn', role: 'CTO', avatar: '', team: 'Công nghệ' },
];

// OKRs Data
export const okrs: OKR[] = [
  // Financial Perspective
  {
    id: 'okr-1',
    objective: 'Tăng trưởng doanh thu 15% so với năm trước',
    perspective: 'financial',
    quarter: 'Q4 2024',
    status: 'at_risk',
    progress: 72,
    owner: 'Trần Thị Mai',
    dueDate: '2024-12-31',
    keyResults: [
      { id: 'kr-1-1', title: 'Đạt 8,000 tỷ VND doanh thu', target: 8000, current: 6200, unit: 'tỷ VND' },
      { id: 'kr-1-2', title: 'Mở rộng 50 đại lý phân phối mới', target: 50, current: 38, unit: 'đại lý' },
      { id: 'kr-1-3', title: 'Tăng doanh thu online 30%', target: 30, current: 25, unit: '%' },
    ],
  },
  {
    id: 'okr-2',
    objective: 'Tối ưu hóa biên lợi nhuận gộp đạt 26%',
    perspective: 'financial',
    quarter: 'Q4 2024',
    status: 'on_track',
    progress: 95,
    owner: 'Trần Thị Mai',
    dueDate: '2024-12-31',
    keyResults: [
      { id: 'kr-2-1', title: 'Giảm chi phí nguyên liệu 5%', target: 5, current: 4.8, unit: '%' },
      { id: 'kr-2-2', title: 'Tăng hiệu quả sản xuất 10%', target: 10, current: 9.5, unit: '%' },
    ],
  },
  // External Perspective
  {
    id: 'okr-3',
    objective: 'Nâng cao trải nghiệm và độ hài lòng khách hàng',
    perspective: 'external',
    quarter: 'Q4 2024',
    status: 'on_track',
    progress: 88,
    owner: 'Phạm Thị Hoa',
    dueDate: '2024-12-31',
    keyResults: [
      { id: 'kr-3-1', title: 'Đạt NPS 70+', target: 70, current: 68, unit: 'điểm' },
      { id: 'kr-3-2', title: 'Giảm thời gian phản hồi xuống <2h', target: 2, current: 1.8, unit: 'giờ' },
      { id: 'kr-3-3', title: 'Tỷ lệ hài lòng đạt 92%', target: 92, current: 90, unit: '%' },
    ],
  },
  {
    id: 'okr-4',
    objective: 'Mở rộng thị phần ngành kem lên 45%',
    perspective: 'external',
    quarter: 'Q4 2024',
    status: 'at_risk',
    progress: 78,
    owner: 'Phạm Thị Hoa',
    dueDate: '2024-12-31',
    keyResults: [
      { id: 'kr-4-1', title: 'Tăng thị phần kem lên 45%', target: 45, current: 43, unit: '%' },
      { id: 'kr-4-2', title: 'Ra mắt 3 hương vị kem mới', target: 3, current: 2, unit: 'sản phẩm' },
    ],
  },
  // Internal Perspective
  {
    id: 'okr-5',
    objective: 'Nâng cao hiệu suất và chất lượng sản xuất',
    perspective: 'internal',
    quarter: 'Q4 2024',
    status: 'on_track',
    progress: 85,
    owner: 'Lê Hoàng Nam',
    dueDate: '2024-12-31',
    keyResults: [
      { id: 'kr-5-1', title: 'Đạt 98% sản phẩm đạt chuẩn', target: 98, current: 97.5, unit: '%' },
      { id: 'kr-5-2', title: 'Giảm 30% khiếu nại chất lượng', target: 30, current: 28, unit: '%' },
      { id: 'kr-5-3', title: 'Tăng OEE lên 85%', target: 85, current: 82, unit: '%' },
    ],
  },
  {
    id: 'okr-6',
    objective: 'Chuyển đổi số quy trình vận hành',
    perspective: 'internal',
    quarter: 'Q4 2024',
    status: 'at_risk',
    progress: 65,
    owner: 'Võ Minh Tuấn',
    dueDate: '2024-12-31',
    keyResults: [
      { id: 'kr-6-1', title: 'Triển khai ERP cho 100% nhà máy', target: 100, current: 70, unit: '%' },
      { id: 'kr-6-2', title: 'Số hóa 80% quy trình', target: 80, current: 55, unit: '%' },
    ],
  },
  // Learning Perspective
  {
    id: 'okr-7',
    objective: 'Phát triển năng lực đội ngũ nhân sự',
    perspective: 'learning',
    quarter: 'Q4 2024',
    status: 'on_track',
    progress: 82,
    owner: 'Nguyễn Văn An',
    dueDate: '2024-12-31',
    keyResults: [
      { id: 'kr-7-1', title: 'Đào tạo 500 nhân sự về kỹ năng mới', target: 500, current: 420, unit: 'người' },
      { id: 'kr-7-2', title: 'Tỷ lệ giữ chân nhân tài đạt 90%', target: 90, current: 88, unit: '%' },
    ],
  },
  {
    id: 'okr-8',
    objective: 'Đẩy mạnh nghiên cứu và phát triển sản phẩm',
    perspective: 'learning',
    quarter: 'Q4 2024',
    status: 'on_track',
    progress: 75,
    owner: 'Phạm Thị Hoa',
    dueDate: '2024-12-31',
    keyResults: [
      { id: 'kr-8-1', title: 'Ra mắt 5 sản phẩm mới', target: 5, current: 4, unit: 'sản phẩm' },
      { id: 'kr-8-2', title: '20% doanh thu từ sản phẩm mới', target: 20, current: 15, unit: '%' },
    ],
  },
];

// KPIs Data
export const kpis: KPI[] = [
  // Financial KPIs
  {
    id: 'kpi-1',
    name: 'Doanh thu (tỷ VND)',
    perspective: 'financial',
    target: 8000,
    current: 6200,
    unit: 'tỷ VND',
    status: 'at_risk',
    trend: 'up',
    history: [
      { month: 'T1', value: 520 },
      { month: 'T2', value: 480 },
      { month: 'T3', value: 610 },
      { month: 'T4', value: 580 },
      { month: 'T5', value: 650 },
      { month: 'T6', value: 720 },
      { month: 'T7', value: 680 },
      { month: 'T8', value: 590 },
      { month: 'T9', value: 640 },
      { month: 'T10', value: 730 },
    ],
  },
  {
    id: 'kpi-2',
    name: 'Biên lợi nhuận gộp',
    perspective: 'financial',
    target: 26,
    current: 26.5,
    unit: '%',
    status: 'on_track',
    trend: 'up',
    history: [
      { month: 'T1', value: 24.5 },
      { month: 'T2', value: 24.8 },
      { month: 'T3', value: 25.1 },
      { month: 'T4', value: 25.3 },
      { month: 'T5', value: 25.5 },
      { month: 'T6', value: 25.8 },
      { month: 'T7', value: 26.0 },
      { month: 'T8', value: 26.2 },
      { month: 'T9', value: 26.3 },
      { month: 'T10', value: 26.5 },
    ],
  },
  {
    id: 'kpi-3',
    name: 'EBITDA',
    perspective: 'financial',
    target: 800,
    current: 720,
    unit: 'tỷ VND',
    status: 'on_track',
    trend: 'up',
    history: [
      { month: 'T1', value: 62 },
      { month: 'T2', value: 58 },
      { month: 'T3', value: 70 },
      { month: 'T4', value: 68 },
      { month: 'T5', value: 75 },
      { month: 'T6', value: 82 },
      { month: 'T7', value: 78 },
      { month: 'T8', value: 72 },
      { month: 'T9', value: 76 },
      { month: 'T10', value: 79 },
    ],
  },
  // External KPIs
  {
    id: 'kpi-4',
    name: 'Thị phần ngành kem',
    perspective: 'external',
    target: 45,
    current: 43,
    unit: '%',
    status: 'at_risk',
    trend: 'stable',
    history: [
      { month: 'T1', value: 42 },
      { month: 'T2', value: 42.2 },
      { month: 'T3', value: 42.5 },
      { month: 'T4', value: 42.3 },
      { month: 'T5', value: 42.8 },
      { month: 'T6', value: 43 },
      { month: 'T7', value: 42.8 },
      { month: 'T8', value: 43 },
      { month: 'T9', value: 43.2 },
      { month: 'T10', value: 43 },
    ],
  },
  {
    id: 'kpi-5',
    name: 'Điểm NPS (Net Promoter Score)',
    perspective: 'external',
    target: 70,
    current: 68,
    unit: 'điểm',
    status: 'on_track',
    trend: 'up',
    history: [
      { month: 'T1', value: 62 },
      { month: 'T2', value: 63 },
      { month: 'T3', value: 64 },
      { month: 'T4', value: 65 },
      { month: 'T5', value: 65 },
      { month: 'T6', value: 66 },
      { month: 'T7', value: 67 },
      { month: 'T8', value: 67 },
      { month: 'T9', value: 68 },
      { month: 'T10', value: 68 },
    ],
  },
  {
    id: 'kpi-6',
    name: 'Tỷ lệ hài lòng khách hàng',
    perspective: 'external',
    target: 92,
    current: 90,
    unit: '%',
    status: 'on_track',
    trend: 'up',
    history: [
      { month: 'T1', value: 86 },
      { month: 'T2', value: 87 },
      { month: 'T3', value: 87 },
      { month: 'T4', value: 88 },
      { month: 'T5', value: 88 },
      { month: 'T6', value: 89 },
      { month: 'T7', value: 89 },
      { month: 'T8', value: 90 },
      { month: 'T9', value: 90 },
      { month: 'T10', value: 90 },
    ],
  },
  // Internal KPIs
  {
    id: 'kpi-7',
    name: 'Hiệu suất sản xuất (OEE)',
    perspective: 'internal',
    target: 85,
    current: 82,
    unit: '%',
    status: 'on_track',
    trend: 'up',
    history: [
      { month: 'T1', value: 78 },
      { month: 'T2', value: 79 },
      { month: 'T3', value: 79 },
      { month: 'T4', value: 80 },
      { month: 'T5', value: 80 },
      { month: 'T6', value: 81 },
      { month: 'T7', value: 81 },
      { month: 'T8', value: 82 },
      { month: 'T9', value: 82 },
      { month: 'T10', value: 82 },
    ],
  },
  {
    id: 'kpi-8',
    name: 'Tỷ lệ sản phẩm đạt chuẩn',
    perspective: 'internal',
    target: 98,
    current: 97.5,
    unit: '%',
    status: 'on_track',
    trend: 'stable',
    history: [
      { month: 'T1', value: 96.8 },
      { month: 'T2', value: 97 },
      { month: 'T3', value: 97.1 },
      { month: 'T4', value: 97.2 },
      { month: 'T5', value: 97.3 },
      { month: 'T6', value: 97.3 },
      { month: 'T7', value: 97.4 },
      { month: 'T8', value: 97.4 },
      { month: 'T9', value: 97.5 },
      { month: 'T10', value: 97.5 },
    ],
  },
  {
    id: 'kpi-9',
    name: 'Số hóa quy trình',
    perspective: 'internal',
    target: 80,
    current: 55,
    unit: '%',
    status: 'off_track',
    trend: 'up',
    history: [
      { month: 'T1', value: 30 },
      { month: 'T2', value: 32 },
      { month: 'T3', value: 35 },
      { month: 'T4', value: 38 },
      { month: 'T5', value: 42 },
      { month: 'T6', value: 45 },
      { month: 'T7', value: 48 },
      { month: 'T8', value: 50 },
      { month: 'T9', value: 52 },
      { month: 'T10', value: 55 },
    ],
  },
  // Learning KPIs
  {
    id: 'kpi-10',
    name: 'Số nhân sự được đào tạo',
    perspective: 'learning',
    target: 500,
    current: 420,
    unit: 'người',
    status: 'on_track',
    trend: 'up',
    history: [
      { month: 'T1', value: 45 },
      { month: 'T2', value: 42 },
      { month: 'T3', value: 48 },
      { month: 'T4', value: 40 },
      { month: 'T5', value: 45 },
      { month: 'T6', value: 42 },
      { month: 'T7', value: 38 },
      { month: 'T8', value: 45 },
      { month: 'T9', value: 40 },
      { month: 'T10', value: 35 },
    ],
  },
  {
    id: 'kpi-11',
    name: 'Tỷ lệ giữ chân nhân tài',
    perspective: 'learning',
    target: 90,
    current: 88,
    unit: '%',
    status: 'on_track',
    trend: 'stable',
    history: [
      { month: 'T1', value: 87 },
      { month: 'T2', value: 87 },
      { month: 'T3', value: 87.5 },
      { month: 'T4', value: 88 },
      { month: 'T5', value: 88 },
      { month: 'T6', value: 88 },
      { month: 'T7', value: 88 },
      { month: 'T8', value: 88 },
      { month: 'T9', value: 88 },
      { month: 'T10', value: 88 },
    ],
  },
  {
    id: 'kpi-12',
    name: 'Sản phẩm mới ra mắt',
    perspective: 'learning',
    target: 5,
    current: 4,
    unit: 'sản phẩm',
    status: 'on_track',
    trend: 'up',
    history: [
      { month: 'T1', value: 0 },
      { month: 'T2', value: 1 },
      { month: 'T3', value: 1 },
      { month: 'T4', value: 2 },
      { month: 'T5', value: 2 },
      { month: 'T6', value: 3 },
      { month: 'T7', value: 3 },
      { month: 'T8', value: 3 },
      { month: 'T9', value: 4 },
      { month: 'T10', value: 4 },
    ],
  },
];

// CSFs Data
export const csfs: CSF[] = [
  {
    id: 'csf-1',
    title: 'Triển khai hệ thống ERP SAP',
    description: 'Triển khai và tích hợp hệ thống ERP SAP cho toàn bộ nhà máy để tối ưu quản lý sản xuất và kho vận.',
    status: 'in_progress',
    priority: 'critical',
    assignee: 'Võ Minh Tuấn',
    team: 'Công nghệ',
    dueDate: '2024-12-31',
    relatedOKRs: ['okr-6'],
    progress: 70,
  },
  {
    id: 'csf-2',
    title: 'Mở rộng mạng lưới phân phối',
    description: 'Thiết lập quan hệ đối tác và mở rộng mạng lưới đại lý tại các tỉnh miền Trung và miền Bắc.',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Phạm Thị Hoa',
    team: 'Kinh doanh',
    dueDate: '2024-11-30',
    relatedOKRs: ['okr-1'],
    progress: 76,
  },
  {
    id: 'csf-3',
    title: 'Nâng cấp dây chuyền sản xuất kem',
    description: 'Đầu tư và nâng cấp 2 dây chuyền sản xuất kem tự động hóa cao tại nhà máy Bình Dương.',
    status: 'not_started',
    priority: 'medium',
    assignee: 'Lê Hoàng Nam',
    team: 'Vận hành',
    dueDate: '2025-03-31',
    relatedOKRs: ['okr-5'],
    progress: 0,
  },
  {
    id: 'csf-4',
    title: 'Chương trình đào tạo kỹ năng số',
    description: 'Triển khai chương trình đào tạo chuyển đổi số cho 500 nhân viên các cấp.',
    status: 'completed',
    priority: 'high',
    assignee: 'Nguyễn Văn An',
    team: 'Nhân sự',
    dueDate: '2024-09-30',
    relatedOKRs: ['okr-7'],
    progress: 100,
  },
  {
    id: 'csf-5',
    title: 'Ra mắt dòng sản phẩm kem healthy',
    description: 'Phát triển và ra mắt 3 loại kem ít đường, ít béo phục vụ phân khúc khách hàng quan tâm sức khỏe.',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Phạm Thị Hoa',
    team: 'R&D',
    dueDate: '2024-12-15',
    relatedOKRs: ['okr-4', 'okr-8'],
    progress: 65,
  },
  {
    id: 'csf-6',
    title: 'Tối ưu chuỗi cung ứng lạnh',
    description: 'Cải thiện hệ thống cold chain để giảm hao hụt và đảm bảo chất lượng sản phẩm.',
    status: 'in_progress',
    priority: 'medium',
    assignee: 'Lê Hoàng Nam',
    team: 'Logistics',
    dueDate: '2024-12-31',
    relatedOKRs: ['okr-2', 'okr-5'],
    progress: 45,
  },
  {
    id: 'csf-7',
    title: 'Xây dựng nền tảng e-commerce',
    description: 'Phát triển website bán hàng trực tiếp và tích hợp với các sàn thương mại điện tử.',
    status: 'blocked',
    priority: 'high',
    assignee: 'Võ Minh Tuấn',
    team: 'Công nghệ',
    dueDate: '2024-11-30',
    relatedOKRs: ['okr-1'],
    progress: 30,
  },
  {
    id: 'csf-8',
    title: 'Chứng nhận FSSC 22000',
    description: 'Hoàn thành quy trình đánh giá và đạt chứng nhận an toàn thực phẩm FSSC 22000.',
    status: 'completed',
    priority: 'critical',
    assignee: 'Lê Hoàng Nam',
    team: 'Quản lý chất lượng',
    dueDate: '2024-08-31',
    relatedOKRs: ['okr-5'],
    progress: 100,
  },
];

// Perspective Labels
export const perspectiveLabels: Record<Perspective, string> = {
  financial: 'Tài chính',
  external: 'Khách hàng',
  internal: 'Quy trình nội bộ',
  learning: 'Học hỏi & Phát triển',
};

export const perspectiveColors: Record<Perspective, string> = {
  financial: 'bg-blue-500',
  external: 'bg-amber-500',
  internal: 'bg-emerald-500',
  learning: 'bg-purple-500',
};

export const statusLabels: Record<OKRStatus, string> = {
  on_track: 'Đúng tiến độ',
  at_risk: 'Có rủi ro',
  off_track: 'Chậm tiến độ',
  completed: 'Hoàn thành',
};

export const statusColors: Record<OKRStatus, string> = {
  on_track: 'bg-emerald-500',
  at_risk: 'bg-amber-500',
  off_track: 'bg-red-500',
  completed: 'bg-blue-500',
};

export const csfStatusLabels: Record<CSFStatus, string> = {
  not_started: 'Chưa bắt đầu',
  in_progress: 'Đang thực hiện',
  completed: 'Hoàn thành',
  blocked: 'Bị chặn',
};

export const csfStatusColors: Record<CSFStatus, string> = {
  not_started: 'bg-gray-400',
  in_progress: 'bg-blue-500',
  completed: 'bg-emerald-500',
  blocked: 'bg-red-500',
};

export const priorityLabels: Record<Priority, string> = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
  critical: 'Quan trọng',
};

export const priorityColors: Record<Priority, string> = {
  low: 'bg-gray-400',
  medium: 'bg-blue-400',
  high: 'bg-amber-500',
  critical: 'bg-red-500',
};

// Dashboard summary stats
export const dashboardStats = {
  totalOKRs: okrs.length,
  okrsOnTrack: okrs.filter(o => o.status === 'on_track').length,
  okrsAtRisk: okrs.filter(o => o.status === 'at_risk').length,
  okrsOffTrack: okrs.filter(o => o.status === 'off_track').length,
  averageProgress: Math.round(okrs.reduce((acc, o) => acc + o.progress, 0) / okrs.length),
  totalKPIs: kpis.length,
  kpisOnTrack: kpis.filter(k => k.status === 'on_track').length,
  kpisAtRisk: kpis.filter(k => k.status === 'at_risk').length,
  kpisOffTrack: kpis.filter(k => k.status === 'off_track').length,
  totalCSFs: csfs.length,
  csfsCompleted: csfs.filter(c => c.status === 'completed').length,
  csfsInProgress: csfs.filter(c => c.status === 'in_progress').length,
  csfsBlocked: csfs.filter(c => c.status === 'blocked').length,
};

// ============================================
// OGSM FRAMEWORK DATA
// ============================================

// OGSM Company Level
export interface OGSMObjective {
  id: string;
  name: string;
  description: string;
  perspective: Perspective;
}

export interface OGSMGoal {
  id: string;
  objectiveId: string;
  name: string;
  target: string;
  owner: string;
  progress: number;
}

export interface OGSMStrategy {
  id: string;
  goalId: string;
  name: string;
  measures: string[];
}

export const ogsmObjectives: OGSMObjective[] = [
  { id: 'obj-1', name: 'Tăng trưởng bền vững', description: 'Tăng trưởng doanh thu và thị phần', perspective: 'financial' },
  { id: 'obj-2', name: 'Trải nghiệm khách hàng', description: 'Nâng cao sự hài lòng và lòng trung thành', perspective: 'external' },
  { id: 'obj-3', name: 'Tối ưu vận hành', description: 'Hiệu quả chi phí và quy trình', perspective: 'internal' },
  { id: 'obj-4', name: 'Phát triển đội ngũ', description: 'Nâng cao năng lực và gắn kết', perspective: 'learning' },
];

export const ogsmGoals: OGSMGoal[] = [
  // Financial
  { id: 'goal-1', objectiveId: 'obj-1', name: 'Tăng trưởng doanh thu', target: '+30%', owner: 'CEO / Sales', progress: 72 },
  { id: 'goal-5', objectiveId: 'obj-1', name: 'Tối ưu chi phí (Cost Efficiency)', target: '-5%', owner: 'CFO + Ops', progress: 78 },

  // External
  { id: 'goal-2', objectiveId: 'obj-2', name: 'Mở rộng thị phần', target: '+10%', owner: 'Sales GT/MT', progress: 85 },
  { id: 'goal-3', objectiveId: 'obj-2', name: 'Phát triển sản phẩm mới', target: '+10%', owner: 'Marketing + R&D', progress: 65 },

  // Internal
  { id: 'goal-4', objectiveId: 'obj-3', name: 'Chuyển đổi số & Tự động hóa', target: '100% quy trình', owner: 'CTO / Ops', progress: 45 },

  // Learning
  { id: 'goal-6', objectiveId: 'obj-4', name: 'Đào tạo & Phát triển', target: '50h/người/năm', owner: 'HR Director', progress: 82 },
];

export const ogsmStrategies: OGSMStrategy[] = [
  { id: 'str-1', goalId: 'goal-2', name: 'Tăng độ phủ, forecast chuẩn', measures: ['Doanh thu', 'OOS rate'] },
  { id: 'str-2', goalId: 'goal-3', name: 'Push NPD', measures: ['Sell-out NPD'] },
  { id: 'str-3', goalId: 'goal-4', name: 'Mở rộng kênh online & xuất khẩu', measures: ['Doanh thu online', 'Doanh thu xuất khẩu'] },
  { id: 'str-4', goalId: 'goal-5', name: 'Tối ưu chi phí sản xuất', measures: ['Chi phí/đơn vị', 'Hiệu suất nhà máy'] },
];

// OGSM Department Level
export interface DepartmentOGSM {
  id: string;
  department: string;
  purpose: string;
  objective: string;
  strategy: string;
  measures: string[];
  owner: string;
  progress: number;
  linkedGoalId?: string; // Link to Company Goal
  kpiIds?: string[]; // IDs for data validation
}

export const departmentOGSMs: DepartmentOGSM[] = [
  { id: 'dept-1', department: 'Sales GT', purpose: 'Tăng trưởng', objective: '+10%', strategy: 'Tăng độ phủ, forecast chuẩn', measures: ['Doanh thu', 'OOS rate'], owner: 'Giám đốc Sales GT', progress: 85, linkedGoalId: 'goal-1', kpiIds: ['kpi-1'] },
  { id: 'dept-2', department: 'Sales MT', purpose: 'Tăng trưởng', objective: '+15%', strategy: 'Đẩy mạnh promotions', measures: ['Doanh số MT', 'Share of shelf'], owner: 'Giám đốc Sales MT', progress: 78, linkedGoalId: 'goal-2', kpiIds: ['kpi-4'] },
  { id: 'dept-3', department: 'Marketing', purpose: 'NPD', objective: '+10%', strategy: 'Push NPD', measures: ['Sell-out NPD', 'Brand awareness'], owner: 'CMO', progress: 65, linkedGoalId: 'goal-3', kpiIds: ['kpi-5'] },
  { id: 'dept-4', department: 'R&D', purpose: 'NPD', objective: '5 sản phẩm mới', strategy: 'Innovation pipeline', measures: ['Số SP mới', 'Time-to-market'], owner: 'Giám đốc R&D', progress: 80, linkedGoalId: 'goal-3', kpiIds: ['kpi-12'] },
  { id: 'dept-5', department: 'Operations', purpose: 'Chi phí', objective: '-5%', strategy: 'Lean manufacturing', measures: ['OEE', 'Waste reduction'], owner: 'COO', progress: 72, linkedGoalId: 'goal-5', kpiIds: ['kpi-7'] },
  { id: 'dept-6', department: 'Supply Chain', purpose: 'Chi phí', objective: '-3%', strategy: 'Tối ưu logistics', measures: ['Cost per delivery', 'Lead time'], owner: 'Giám đốc SCM', progress: 68, linkedGoalId: 'goal-5' },
  { id: 'dept-7', department: 'Technology', purpose: 'Hệ thống', objective: '100% ERP', strategy: 'SAP Rollout', measures: ['Progress', 'Uptime'], owner: 'CTO', progress: 45, linkedGoalId: 'goal-4', kpiIds: ['kpi-9'] },
  { id: 'dept-8', department: 'HR', purpose: 'Nhân sự', objective: 'Đào tạo', strategy: 'Skill matrix', measures: ['Training hours', 'Retention'], owner: 'HRD', progress: 82, linkedGoalId: 'goal-6', kpiIds: ['kpi-10', 'kpi-11'] },
];

// Fishbone Analysis
export type ActionStatus = 'pending' | 'done' | 'overdue';

export interface FishboneItem {
  id: string;
  factor: string;
  problem: string;
  action: string;
  owner: string;
  deadline: string;
  result: string;
  status: ActionStatus;
}

export const fishboneItems: FishboneItem[] = [
  { id: 'fb-1', factor: 'Forecast', problem: 'Sai 20%', action: 'Chuẩn hóa forecast tuần', owner: 'Sales Planning', deadline: 'Thứ 6 hàng tuần', result: 'Accuracy ≥ 80%', status: 'done' },
  { id: 'fb-2', factor: 'Kho', problem: 'Không có cảnh báo', action: 'Dashboard tuổi hàng', owner: 'Kho', deadline: 'Thứ 3', result: 'Báo cáo tuần', status: 'done' },
  { id: 'fb-3', factor: 'Trade', problem: 'Không push hàng', action: 'Mini-campaign đẩy hàng', owner: 'Trade', deadline: 'Hàng tháng', result: '+12% bán ra', status: 'pending' },
  { id: 'fb-4', factor: 'Sản xuất', problem: 'OEE thấp', action: 'Maintenance preventive', owner: 'Production', deadline: 'Hàng tuần', result: 'OEE ≥ 85%', status: 'pending' },
  { id: 'fb-5', factor: 'NPD', problem: 'Chậm ra mắt', action: 'Stage-gate review weekly', owner: 'R&D', deadline: 'Thứ 4', result: 'On-time launch', status: 'done' },
  { id: 'fb-6', factor: 'Logistics', problem: 'Chi phí cao', action: 'Route optimization', owner: 'Logistics', deadline: 'Tháng 12', result: '-10% chi phí', status: 'overdue' },
];

// Action Weekly Log
export interface WeeklyAction {
  id: string;
  week: string;
  linkedGoal: string;
  solution: string;
  activity: string;
  owner: string;
  status: ActionStatus;
  result: string;
}

export const weeklyActions: WeeklyAction[] = [
  { id: 'wa-1', week: 'Tuần 49', linkedGoal: 'Giảm tồn', solution: 'Tư duy "Cách làm nào mới" (Solution) để đạt được mục tiêu khó', activity: 'Rà SKU ≤ 60 ngày', owner: 'Kho', status: 'done', result: '28 SKU' },
  { id: 'wa-2', week: 'Tuần 49', linkedGoal: 'Forecast', solution: 'Chuẩn hóa quy trình', activity: 'Update forecast', owner: 'Sales Planning', status: 'pending', result: 'Accuracy 75%' },
  { id: 'wa-3', week: 'Tuần 49', linkedGoal: 'Tăng doanh thu', solution: 'Push activation', activity: 'Chạy campaign cuối năm', owner: 'Trade', status: 'pending', result: 'Target +15%' },
  { id: 'wa-4', week: 'Tuần 48', linkedGoal: 'NPD', solution: 'Speed up launch', activity: 'Hoàn thiện packaging Kem Healthy', owner: 'Marketing', status: 'done', result: 'Approved' },
  { id: 'wa-5', week: 'Tuần 48', linkedGoal: 'Chi phí', solution: 'Lean initiative', activity: 'Giảm waste line 2', owner: 'Production', status: 'done', result: '-8% waste' },
  { id: 'wa-6', week: 'Tuần 47', linkedGoal: 'OEE', solution: 'Preventive maintenance', activity: 'Bảo trì máy đóng gói', owner: 'Maintenance', status: 'done', result: 'OEE 83%' },
  { id: 'wa-7', week: 'Tuần 47', linkedGoal: 'Forecast', solution: 'Data accuracy', activity: 'Reconcile inventory', owner: 'Kho', status: 'done', result: '98% accurate' },
];

// Review Process
export interface ReviewItem {
  id: string;
  type: 'weekly' | 'monthly';
  checklist: string[];
  frequency: string;
  participants: string[];
  duration: string;
}

export const reviewItems: ReviewItem[] = [
  {
    id: 'rev-1',
    type: 'weekly',
    checklist: ['KPI tuần', 'Lệch ở đâu', 'Cập nhật fishbone', 'Hành động tuần sau'],
    frequency: 'Thứ 2 hàng tuần',
    participants: ['Department Heads', 'Team Leads'],
    duration: '1 giờ'
  },
  {
    id: 'rev-2',
    type: 'monthly',
    checklist: ['OGSM cập nhật', 'Khoảng lệch vs Target', 'Điều chỉnh chiến lược', 'Resource allocation'],
    frequency: 'Ngày 5 hàng tháng',
    participants: ['C-Level', 'Directors'],
    duration: '2 giờ'
  },
];

export const actionStatusLabels: Record<ActionStatus, string> = {
  pending: 'Đang chờ',
  done: 'Hoàn thành',
  overdue: 'Quá hạn',
};

export const actionStatusColors: Record<ActionStatus, string> = {
  pending: 'bg-amber-500',
  done: 'bg-emerald-500',
  overdue: 'bg-red-500',
};
