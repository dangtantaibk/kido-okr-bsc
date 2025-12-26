# Mock Data Unified Structure

## Overview

File này mô tả cách điều chỉnh mock-data.ts để liên kết tất cả các phần với nhau thành một hệ thống thống nhất.
> [!NOTE]
> **Database Mapping**: Dữ liệu mock này đại diện cho các thực thể logic trong ứng dụng. Khi import vào database (seeding), cần map vào các bảng có prefix `okr_` (ví dụ: `ogsmObjectives` -> `okr_objectives`).

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           OGSM COMPANY LEVEL                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  OBJECTIVES (ogsmObjectives)                                                │
│  ├── obj-fin: Tăng trưởng bền vững (Financial)                             │
│  ├── obj-ext: Trải nghiệm khách hàng (External)                            │
│  ├── obj-int: Tối ưu vận hành (Internal)                                   │
│  └── obj-lrn: Phát triển đội ngũ (Learning)                                │
│         │                                                                   │
│         ▼                                                                   │
│  GOALS (ogsmGoals)                                                          │
│  ├── goal-rev: Tăng trưởng doanh thu +30%    (objectiveId: obj-fin)        │
│  ├── goal-cost: Tối ưu chi phí -5%           (objectiveId: obj-fin)        │
│  ├── goal-market: Mở rộng thị phần +10%      (objectiveId: obj-ext)        │
│  ├── goal-npd: Phát triển sản phẩm mới +10%  (objectiveId: obj-ext)        │
│  ├── goal-digital: Chuyển đổi số 100%        (objectiveId: obj-int)        │
│  └── goal-train: Đào tạo 50h/người/năm       (objectiveId: obj-lrn)        │
│         │                                                                   │
│         ├─────────────────┬───────────────────┐                            │
│         ▼                 ▼                   ▼                            │
│  STRATEGIES           KPIs                 OKRs                            │
│  (ogsmStrategies)     (kpis)               (okrs)                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ CASCADE DOWN
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEPARTMENT LEVEL                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  DEPARTMENT_OGSM (departmentOGSMs)                                          │
│  Each links to a Company Goal via linkedGoalId                             │
│  ├── dept-1: Sales GT    → linkedGoalId: goal-rev                          │
│  ├── dept-2: Sales MT    → linkedGoalId: goal-market                       │
│  ├── dept-3: Marketing   → linkedGoalId: goal-npd                          │
│  ├── dept-4: R&D         → linkedGoalId: goal-npd                          │
│  ├── dept-5: Operations  → linkedGoalId: goal-cost                         │
│  ├── dept-6: Supply Chain→ linkedGoalId: goal-cost                         │
│  ├── dept-7: Technology  → linkedGoalId: goal-digital                      │
│  └── dept-8: HR          → linkedGoalId: goal-train                        │
│         │                                                                   │
│         ▼                                                                   │
│  Each has kpiIds linking to specific KPIs                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ EXECUTION
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXECUTION LEVEL                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  WEEKLY_ACTIONS (weeklyActions)                                             │
│  Each links to a Goal and/or KPI                                           │
│  ├── wa-1: linkedGoalId: goal-cost, linkedKpiId: null                      │
│  ├── wa-2: linkedGoalId: goal-rev,  linkedKpiId: kpi-rev                   │
│  └── ...                                                                   │
│                                                                             │
│  FISHBONE_ITEMS (fishboneItems)                                             │
│  Each links to an off-track KPI                                            │
│  ├── fb-1: kpiId: kpi-rev (when off-track)                                 │
│  ├── fb-2: kpiId: kpi-oee                                                  │
│  └── ...                                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## ID Conventions

```typescript
// Objectives
obj-fin      // Financial perspective objective
obj-ext      // External/Customer perspective objective
obj-int      // Internal perspective objective
obj-lrn      // Learning perspective objective

// Goals (linked to objectives)
goal-rev     // Revenue growth goal
goal-cost    // Cost optimization goal
goal-market  // Market expansion goal
goal-npd     // New product development goal
goal-digital // Digital transformation goal
goal-train   // Training goal

// Strategies (linked to goals)
str-1, str-2, str-3, str-4

// KPIs (linked to goals)
kpi-rev      // Revenue KPI
kpi-margin   // Gross margin KPI
kpi-ebitda   // EBITDA KPI
kpi-market   // Market share KPI
kpi-nps      // NPS KPI
kpi-csat     // Customer satisfaction KPI
kpi-oee      // OEE KPI
kpi-quality  // Quality rate KPI
kpi-digital  // Digitalization KPI
kpi-training // Training KPI
kpi-retention// Retention KPI
kpi-npd      // New products KPI

// OKRs (linked to goals)
okr-1 to okr-8

// CSFs (linked to OKRs)
csf-1 to csf-8

// Department OGSMs (linked to goals)
dept-1 to dept-8

// Fishbone items (linked to KPIs)
fb-1 to fb-6

// Weekly actions (linked to goals and KPIs)
wa-1 to wa-7
```

## Updated Mock Data Structure

```typescript
// ============================================
// 1. OGSM OBJECTIVES (Company Level)
// ============================================

export const ogsmObjectives: OGSMObjective[] = [
  {
    id: 'obj-fin',
    name: 'Tăng trưởng bền vững',
    description: 'Tăng trưởng doanh thu và thị phần',
    perspective: 'financial',
  },
  {
    id: 'obj-ext',
    name: 'Trải nghiệm khách hàng',
    description: 'Nâng cao sự hài lòng và lòng trung thành',
    perspective: 'external',
  },
  {
    id: 'obj-int',
    name: 'Tối ưu vận hành',
    description: 'Hiệu quả chi phí và quy trình',
    perspective: 'internal',
  },
  {
    id: 'obj-lrn',
    name: 'Phát triển đội ngũ',
    description: 'Nâng cao năng lực và gắn kết',
    perspective: 'learning',
  },
];

// ============================================
// 2. OGSM GOALS (Company Level)
// ============================================

export const ogsmGoals: OGSMGoal[] = [
  // Financial
  {
    id: 'goal-rev',
    objectiveId: 'obj-fin',
    name: 'Tăng trưởng doanh thu',
    target: '+30%',
    owner: 'CEO / Sales',
    progress: 72,
    linkedKpiIds: ['kpi-rev'],
  },
  {
    id: 'goal-cost',
    objectiveId: 'obj-fin',
    name: 'Tối ưu chi phí (Cost Efficiency)',
    target: '-5%',
    owner: 'CFO + Ops',
    progress: 78,
    linkedKpiIds: ['kpi-margin', 'kpi-ebitda'],
  },
  // External
  {
    id: 'goal-market',
    objectiveId: 'obj-ext',
    name: 'Mở rộng thị phần',
    target: '+10%',
    owner: 'Sales GT/MT',
    progress: 85,
    linkedKpiIds: ['kpi-market'],
  },
  {
    id: 'goal-npd',
    objectiveId: 'obj-ext',
    name: 'Phát triển sản phẩm mới',
    target: '+10%',
    owner: 'Marketing + R&D',
    progress: 65,
    linkedKpiIds: ['kpi-nps', 'kpi-csat', 'kpi-npd'],
  },
  // Internal
  {
    id: 'goal-digital',
    objectiveId: 'obj-int',
    name: 'Chuyển đổi số & Tự động hóa',
    target: '100% quy trình',
    owner: 'CTO / Ops',
    progress: 45,
    linkedKpiIds: ['kpi-oee', 'kpi-quality', 'kpi-digital'],
  },
  // Learning
  {
    id: 'goal-train',
    objectiveId: 'obj-lrn',
    name: 'Đào tạo & Phát triển',
    target: '50h/người/năm',
    owner: 'HR Director',
    progress: 82,
    linkedKpiIds: ['kpi-training', 'kpi-retention'],
  },
];

// ============================================
// 3. OGSM STRATEGIES (Linked to Goals)
// ============================================

export const ogsmStrategies: OGSMStrategy[] = [
  {
    id: 'str-1',
    goalId: 'goal-market',
    name: 'Tăng độ phủ, forecast chuẩn',
    measures: ['Doanh thu', 'OOS rate'],
    linkedKpiIds: ['kpi-rev', 'kpi-market'],
  },
  {
    id: 'str-2',
    goalId: 'goal-npd',
    name: 'Push NPD',
    measures: ['Sell-out NPD'],
    linkedKpiIds: ['kpi-npd'],
  },
  {
    id: 'str-3',
    goalId: 'goal-digital',
    name: 'Mở rộng kênh online & xuất khẩu',
    measures: ['Doanh thu online', 'Doanh thu xuất khẩu'],
    linkedKpiIds: ['kpi-digital'],
  },
  {
    id: 'str-4',
    goalId: 'goal-cost',
    name: 'Tối ưu chi phí sản xuất',
    measures: ['Chi phí/đơn vị', 'Hiệu suất nhà máy'],
    linkedKpiIds: ['kpi-oee', 'kpi-margin'],
  },
];

// ============================================
// 4. KPIs (Linked to Goals)
// ============================================

export const kpis: KPI[] = [
  // Financial KPIs
  {
    id: 'kpi-rev',
    name: 'Doanh thu (tỷ VND)',
    perspective: 'financial',
    target: 8000,
    current: 6200,
    unit: 'tỷ VND',
    status: 'at_risk',
    trend: 'up',
    linkedGoalId: 'goal-rev', // <-- NEW: Link to Goal
    history: [/* ... */],
  },
  {
    id: 'kpi-margin',
    name: 'Biên lợi nhuận gộp',
    perspective: 'financial',
    target: 26,
    current: 26.5,
    unit: '%',
    status: 'on_track',
    trend: 'up',
    linkedGoalId: 'goal-cost', // <-- Link to Goal
    history: [/* ... */],
  },
  {
    id: 'kpi-ebitda',
    name: 'EBITDA',
    perspective: 'financial',
    target: 800,
    current: 720,
    unit: 'tỷ VND',
    status: 'on_track',
    trend: 'up',
    linkedGoalId: 'goal-cost',
    history: [/* ... */],
  },
  // External KPIs
  {
    id: 'kpi-market',
    name: 'Thị phần ngành kem',
    perspective: 'external',
    target: 45,
    current: 43,
    unit: '%',
    status: 'at_risk',
    trend: 'stable',
    linkedGoalId: 'goal-market',
    history: [/* ... */],
  },
  {
    id: 'kpi-nps',
    name: 'Điểm NPS (Net Promoter Score)',
    perspective: 'external',
    target: 70,
    current: 68,
    unit: 'điểm',
    status: 'on_track',
    trend: 'up',
    linkedGoalId: 'goal-npd',
    history: [/* ... */],
  },
  {
    id: 'kpi-csat',
    name: 'Tỷ lệ hài lòng khách hàng',
    perspective: 'external',
    target: 92,
    current: 90,
    unit: '%',
    status: 'on_track',
    trend: 'up',
    linkedGoalId: 'goal-npd',
    history: [/* ... */],
  },
  // Internal KPIs
  {
    id: 'kpi-oee',
    name: 'Hiệu suất sản xuất (OEE)',
    perspective: 'internal',
    target: 85,
    current: 82,
    unit: '%',
    status: 'on_track',
    trend: 'up',
    linkedGoalId: 'goal-digital',
    history: [/* ... */],
  },
  {
    id: 'kpi-quality',
    name: 'Tỷ lệ sản phẩm đạt chuẩn',
    perspective: 'internal',
    target: 98,
    current: 97.5,
    unit: '%',
    status: 'on_track',
    trend: 'stable',
    linkedGoalId: 'goal-digital',
    history: [/* ... */],
  },
  {
    id: 'kpi-digital',
    name: 'Số hóa quy trình',
    perspective: 'internal',
    target: 80,
    current: 55,
    unit: '%',
    status: 'off_track', // <-- This triggers Fishbone
    trend: 'up',
    linkedGoalId: 'goal-digital',
    history: [/* ... */],
  },
  // Learning KPIs
  {
    id: 'kpi-training',
    name: 'Số nhân sự được đào tạo',
    perspective: 'learning',
    target: 500,
    current: 420,
    unit: 'người',
    status: 'on_track',
    trend: 'up',
    linkedGoalId: 'goal-train',
    history: [/* ... */],
  },
  {
    id: 'kpi-retention',
    name: 'Tỷ lệ giữ chân nhân tài',
    perspective: 'learning',
    target: 90,
    current: 88,
    unit: '%',
    status: 'on_track',
    trend: 'stable',
    linkedGoalId: 'goal-train',
    history: [/* ... */],
  },
  {
    id: 'kpi-npd',
    name: 'Sản phẩm mới ra mắt',
    perspective: 'learning',
    target: 5,
    current: 4,
    unit: 'sản phẩm',
    status: 'on_track',
    trend: 'up',
    linkedGoalId: 'goal-npd',
    history: [/* ... */],
  },
];

// ============================================
// 5. OKRs (Linked to Goals)
// ============================================

export const okrs: OKR[] = [
  {
    id: 'okr-1',
    objective: 'Tăng trưởng doanh thu 15% so với năm trước',
    perspective: 'financial',
    quarter: 'Q4 2024',
    status: 'at_risk',
    progress: 72,
    owner: 'Trần Thị Mai',
    dueDate: '2024-12-31',
    linkedGoalId: 'goal-rev', // <-- NEW: Link to Company Goal
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
    linkedGoalId: 'goal-cost', // <-- Link to Company Goal
    keyResults: [
      { id: 'kr-2-1', title: 'Giảm chi phí nguyên liệu 5%', target: 5, current: 4.8, unit: '%' },
      { id: 'kr-2-2', title: 'Tăng hiệu quả sản xuất 10%', target: 10, current: 9.5, unit: '%' },
    ],
  },
  {
    id: 'okr-3',
    objective: 'Nâng cao trải nghiệm và độ hài lòng khách hàng',
    perspective: 'external',
    quarter: 'Q4 2024',
    status: 'on_track',
    progress: 88,
    owner: 'Phạm Thị Hoa',
    dueDate: '2024-12-31',
    linkedGoalId: 'goal-npd', // <-- Link
    keyResults: [/* ... */],
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
    linkedGoalId: 'goal-market', // <-- Link
    keyResults: [/* ... */],
  },
  {
    id: 'okr-5',
    objective: 'Nâng cao hiệu suất và chất lượng sản xuất',
    perspective: 'internal',
    quarter: 'Q4 2024',
    status: 'on_track',
    progress: 85,
    owner: 'Lê Hoàng Nam',
    dueDate: '2024-12-31',
    linkedGoalId: 'goal-digital', // <-- Link
    keyResults: [/* ... */],
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
    linkedGoalId: 'goal-digital', // <-- Link
    keyResults: [/* ... */],
  },
  {
    id: 'okr-7',
    objective: 'Phát triển năng lực đội ngũ nhân sự',
    perspective: 'learning',
    quarter: 'Q4 2024',
    status: 'on_track',
    progress: 82,
    owner: 'Nguyễn Văn An',
    dueDate: '2024-12-31',
    linkedGoalId: 'goal-train', // <-- Link
    keyResults: [/* ... */],
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
    linkedGoalId: 'goal-npd', // <-- Link
    keyResults: [/* ... */],
  },
];

// ============================================
// 6. CSFs (Linked to OKRs)
// ============================================

export const csfs: CSF[] = [
  {
    id: 'csf-1',
    title: 'Triển khai hệ thống ERP SAP',
    description: '...',
    status: 'in_progress',
    priority: 'critical',
    assignee: 'Võ Minh Tuấn',
    team: 'Công nghệ',
    dueDate: '2024-12-31',
    relatedOKRs: ['okr-6'], // <-- Link to OKRs
    relatedGoalId: 'goal-digital', // <-- NEW: Also link to Goal
    progress: 70,
  },
  // ... more CSFs with proper links
];

// ============================================
// 7. DEPARTMENT OGSM (Cascade from Company Goals)
// ============================================

export const departmentOGSMs: DepartmentOGSM[] = [
  {
    id: 'dept-1',
    department: 'Sales GT',
    purpose: 'Tăng trưởng',
    objective: '+10%',
    strategy: 'Tăng độ phủ, forecast chuẩn',
    measures: ['Doanh thu', 'OOS rate'],
    owner: 'Giám đốc Sales GT',
    progress: 85,
    linkedGoalId: 'goal-rev', // <-- Link to Company Goal
    kpiIds: ['kpi-rev'],       // <-- Link to KPIs
  },
  {
    id: 'dept-2',
    department: 'Sales MT',
    purpose: 'Tăng trưởng',
    objective: '+15%',
    strategy: 'Đẩy mạnh promotions',
    measures: ['Doanh số MT', 'Share of shelf'],
    owner: 'Giám đốc Sales MT',
    progress: 78,
    linkedGoalId: 'goal-market',
    kpiIds: ['kpi-market'],
  },
  {
    id: 'dept-3',
    department: 'Marketing',
    purpose: 'NPD',
    objective: '+10%',
    strategy: 'Push NPD',
    measures: ['Sell-out NPD', 'Brand awareness'],
    owner: 'CMO',
    progress: 65,
    linkedGoalId: 'goal-npd',
    kpiIds: ['kpi-nps'],
  },
  {
    id: 'dept-4',
    department: 'R&D',
    purpose: 'NPD',
    objective: '5 sản phẩm mới',
    strategy: 'Innovation pipeline',
    measures: ['Số SP mới', 'Time-to-market'],
    owner: 'Giám đốc R&D',
    progress: 80,
    linkedGoalId: 'goal-npd',
    kpiIds: ['kpi-npd'],
  },
  {
    id: 'dept-5',
    department: 'Operations',
    purpose: 'Chi phí',
    objective: '-5%',
    strategy: 'Lean manufacturing',
    measures: ['OEE', 'Waste reduction'],
    owner: 'COO',
    progress: 72,
    linkedGoalId: 'goal-cost',
    kpiIds: ['kpi-oee'],
  },
  {
    id: 'dept-6',
    department: 'Supply Chain',
    purpose: 'Chi phí',
    objective: '-3%',
    strategy: 'Tối ưu logistics',
    measures: ['Cost per delivery', 'Lead time'],
    owner: 'Giám đốc SCM',
    progress: 68,
    linkedGoalId: 'goal-cost',
    kpiIds: [],
  },
  {
    id: 'dept-7',
    department: 'Technology',
    purpose: 'Hệ thống',
    objective: '100% ERP',
    strategy: 'SAP Rollout',
    measures: ['Progress', 'Uptime'],
    owner: 'CTO',
    progress: 45,
    linkedGoalId: 'goal-digital',
    kpiIds: ['kpi-digital'],
  },
  {
    id: 'dept-8',
    department: 'HR',
    purpose: 'Nhân sự',
    objective: 'Đào tạo',
    strategy: 'Skill matrix',
    measures: ['Training hours', 'Retention'],
    owner: 'HRD',
    progress: 82,
    linkedGoalId: 'goal-train',
    kpiIds: ['kpi-training', 'kpi-retention'],
  },
];

// ============================================
// 8. FISHBONE ITEMS (Linked to off-track KPIs)
// ============================================

export const fishboneItems: FishboneItem[] = [
  {
    id: 'fb-1',
    kpiId: 'kpi-digital', // <-- Link to off-track KPI
    factor: 'Forecast',
    problem: 'Sai 20%',
    action: 'Chuẩn hóa forecast tuần',
    owner: 'Sales Planning',
    deadline: 'Thứ 6 hàng tuần',
    result: 'Accuracy ≥ 80%',
    status: 'done',
  },
  {
    id: 'fb-2',
    kpiId: 'kpi-digital',
    factor: 'Kho',
    problem: 'Không có cảnh báo',
    action: 'Dashboard tuổi hàng',
    owner: 'Kho',
    deadline: 'Thứ 3',
    result: 'Báo cáo tuần',
    status: 'done',
  },
  {
    id: 'fb-3',
    kpiId: 'kpi-rev', // <-- Link to revenue KPI
    factor: 'Trade',
    problem: 'Không push hàng',
    action: 'Mini-campaign đẩy hàng',
    owner: 'Trade',
    deadline: 'Hàng tháng',
    result: '+12% bán ra',
    status: 'pending',
  },
  {
    id: 'fb-4',
    kpiId: 'kpi-oee', // <-- Link to OEE KPI
    factor: 'Sản xuất',
    problem: 'OEE thấp',
    action: 'Maintenance preventive',
    owner: 'Production',
    deadline: 'Hàng tuần',
    result: 'OEE ≥ 85%',
    status: 'pending',
  },
  {
    id: 'fb-5',
    kpiId: 'kpi-npd',
    factor: 'NPD',
    problem: 'Chậm ra mắt',
    action: 'Stage-gate review weekly',
    owner: 'R&D',
    deadline: 'Thứ 4',
    result: 'On-time launch',
    status: 'done',
  },
  {
    id: 'fb-6',
    kpiId: 'kpi-margin',
    factor: 'Logistics',
    problem: 'Chi phí cao',
    action: 'Route optimization',
    owner: 'Logistics',
    deadline: 'Tháng 12',
    result: '-10% chi phí',
    status: 'overdue',
  },
];

// ============================================
// 9. WEEKLY ACTIONS (Linked to Goals and KPIs)
// ============================================

export const weeklyActions: WeeklyAction[] = [
  {
    id: 'wa-1',
    week: 'Tuần 49',
    linkedGoalId: 'goal-cost', // <-- Link to Goal
    linkedKpiId: null,
    solution: 'Tư duy "Cách làm nào mới" (Solution) để đạt được mục tiêu khó',
    activity: 'Rà SKU ≤ 60 ngày',
    owner: 'Kho',
    status: 'done',
    result: '28 SKU',
  },
  {
    id: 'wa-2',
    week: 'Tuần 49',
    linkedGoalId: 'goal-rev',
    linkedKpiId: 'kpi-rev', // <-- Link to KPI
    solution: 'Chuẩn hóa quy trình',
    activity: 'Update forecast',
    owner: 'Sales Planning',
    status: 'pending',
    result: 'Accuracy 75%',
  },
  {
    id: 'wa-3',
    week: 'Tuần 49',
    linkedGoalId: 'goal-rev',
    linkedKpiId: 'kpi-rev',
    solution: 'Push activation',
    activity: 'Chạy campaign cuối năm',
    owner: 'Trade',
    status: 'pending',
    result: 'Target +15%',
  },
  {
    id: 'wa-4',
    week: 'Tuần 48',
    linkedGoalId: 'goal-npd',
    linkedKpiId: 'kpi-npd',
    solution: 'Speed up launch',
    activity: 'Hoàn thiện packaging Kem Healthy',
    owner: 'Marketing',
    status: 'done',
    result: 'Approved',
  },
  {
    id: 'wa-5',
    week: 'Tuần 48',
    linkedGoalId: 'goal-cost',
    linkedKpiId: 'kpi-margin',
    solution: 'Lean initiative',
    activity: 'Giảm waste line 2',
    owner: 'Production',
    status: 'done',
    result: '-8% waste',
  },
  {
    id: 'wa-6',
    week: 'Tuần 47',
    linkedGoalId: 'goal-digital',
    linkedKpiId: 'kpi-oee',
    solution: 'Preventive maintenance',
    activity: 'Bảo trì máy đóng gói',
    owner: 'Maintenance',
    status: 'done',
    result: 'OEE 83%',
  },
  {
    id: 'wa-7',
    week: 'Tuần 47',
    linkedGoalId: 'goal-rev',
    linkedKpiId: null,
    solution: 'Data accuracy',
    activity: 'Reconcile inventory',
    owner: 'Kho',
    status: 'done',
    result: '98% accurate',
  },
];
```

## Helper Functions for Navigation

```typescript
// Get all KPIs linked to a specific Goal
export function getKPIsForGoal(goalId: string): KPI[] {
  return kpis.filter(kpi => kpi.linkedGoalId === goalId);
}

// Get all OKRs linked to a specific Goal
export function getOKRsForGoal(goalId: string): OKR[] {
  return okrs.filter(okr => okr.linkedGoalId === goalId);
}

// Get Department OGSMs linked to a specific Goal
export function getDepartmentOGSMsForGoal(goalId: string): DepartmentOGSM[] {
  return departmentOGSMs.filter(dept => dept.linkedGoalId === goalId);
}

// Get Fishbone items for a specific KPI
export function getFishboneForKPI(kpiId: string): FishboneItem[] {
  return fishboneItems.filter(fb => fb.kpiId === kpiId);
}

// Get Weekly Actions for a specific Goal
export function getActionsForGoal(goalId: string): WeeklyAction[] {
  return weeklyActions.filter(wa => wa.linkedGoalId === goalId);
}

// Get the Goal for a specific KPI
export function getGoalForKPI(kpiId: string): OGSMGoal | undefined {
  const kpi = kpis.find(k => k.id === kpiId);
  if (!kpi?.linkedGoalId) return undefined;
  return ogsmGoals.find(g => g.id === kpi.linkedGoalId);
}

// Get the Objective for a specific Goal
export function getObjectiveForGoal(goalId: string): OGSMObjective | undefined {
  const goal = ogsmGoals.find(g => g.id === goalId);
  if (!goal) return undefined;
  return ogsmObjectives.find(o => o.id === goal.objectiveId);
}
```

## Visual Representation of Links

```
OGSM Objective: "Tăng trưởng bền vững" (obj-fin)
│
├── OGSM Goal: "Tăng trưởng doanh thu +30%" (goal-rev)
│   │
│   ├── KPIs:
│   │   └── kpi-rev: Doanh thu (6200/8000 tỷ VND) ⚠️
│   │
│   ├── OKRs:
│   │   └── okr-1: Tăng trưởng doanh thu 15% (72%)
│   │
│   ├── Department OGSM:
│   │   └── dept-1: Sales GT (+10%)
│   │
│   ├── Weekly Actions:
│   │   ├── wa-2: Update forecast
│   │   ├── wa-3: Chạy campaign cuối năm
│   │   └── wa-7: Reconcile inventory
│   │
│   └── Fishbone (when off-track):
│       └── fb-3: Trade - Không push hàng
│
└── OGSM Goal: "Tối ưu chi phí -5%" (goal-cost)
    │
    ├── KPIs:
    │   ├── kpi-margin: Biên lợi nhuận gộp (26.5/26%) ✅
    │   └── kpi-ebitda: EBITDA (720/800 tỷ) ✅
    │
    ├── OKRs:
    │   └── okr-2: Tối ưu hóa biên lợi nhuận (95%)
    │
    ├── Department OGSM:
    │   ├── dept-5: Operations (-5%)
    │   └── dept-6: Supply Chain (-3%)
    │
    ├── Weekly Actions:
    │   ├── wa-1: Rà SKU ≤ 60 ngày
    │   └── wa-5: Giảm waste line 2
    │
    └── Fishbone:
        └── fb-6: Logistics - Chi phí cao
```

## Next Steps

1. Update `src/data/mock-data.ts` với các ID và links mới
2. Add helper functions
3. Update UI components để sử dụng links
4. Test navigation flows
