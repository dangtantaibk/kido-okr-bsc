# UI Components & Pages Specification

## Overview

Tài liệu này mô tả UI components và pages cần implement theo OGSM framework từ slide KIDO Group.

## Design System

### Color Palette (BSC Perspectives)

```typescript
// Perspective colors - consistent across all pages
const perspectiveThemes = {
  financial: {
    primary: 'blue-500',
    light: 'blue-50',
    dark: 'blue-700',
    gradient: 'from-blue-500 to-blue-600',
    icon: DollarSign,
    label: 'Tài chính',
  },
  external: {
    primary: 'amber-500',
    light: 'amber-50',
    dark: 'amber-700',
    gradient: 'from-amber-500 to-amber-600',
    icon: Users,
    label: 'Khách hàng',
  },
  internal: {
    primary: 'emerald-500',
    light: 'emerald-50',
    dark: 'emerald-700',
    gradient: 'from-emerald-500 to-emerald-600',
    icon: Settings2,
    label: 'Quy trình nội bộ',
  },
  learning: {
    primary: 'purple-500',
    light: 'purple-50',
    dark: 'purple-700',
    gradient: 'from-purple-500 to-purple-600',
    icon: BookOpen,
    label: 'Học hỏi & Phát triển',
  },
};

// Status colors
const statusColors = {
  on_track: { bg: 'emerald-500', text: 'Đúng tiến độ' },
  at_risk: { bg: 'amber-500', text: 'Có rủi ro' },
  off_track: { bg: 'red-500', text: 'Chậm tiến độ' },
  completed: { bg: 'blue-500', text: 'Hoàn thành' },
};
```

---

## Page Structure

```
/                          → Dashboard (Overview)
├── /ogsm                  → OGSM Company Level
│   ├── List View
│   ├── Graph Tree View
│   └── /ogsm/department   → OGSM Department Level
├── /strategy-map          → Strategy Map (Visual)
├── /okrs                  → OKRs Board
│   └── /okrs/[id]         → OKR Detail
├── /kpis                  → KPIs Dashboard
│   └── /kpis/[id]         → KPI Detail with Chart
├── /csfs                  → CSFs Board
│   └── /csfs/[id]         → CSF Detail
├── /fishbone              → Fishbone Analysis
├── /actions               → Weekly Actions Log
├── /reviews               → Review Schedule
└── /settings              → Settings
```

---

## Page Specifications

### 1. Dashboard Page (`/`)

**Purpose:** Tổng quan tình hình thực thi chiến lược.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ Header: Dashboard - Tổng quan                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐│
│  │  OKRs Stats  │ │  KPIs Stats  │ │  CSFs Stats  │ │   Actions    ││
│  │  8 total     │ │  12 total    │ │  8 total     │ │  7 pending   ││
│  │  6 on track  │ │  9 on track  │ │  5 done      │ │              ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘│
│                                                                     │
│  ┌────────────────────────────────────┐ ┌──────────────────────────┐│
│  │  Tiến độ theo Perspective (Chart)  │ │  Quick Actions           ││
│  │  [Bar/Radar Chart]                 │ │  - Fishbone alerts       ││
│  │                                    │ │  - Upcoming reviews      ││
│  │                                    │ │  - Off-track items       ││
│  └────────────────────────────────────┘ └──────────────────────────┘│
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────────┐│
│  │  OKRs by Perspective (4 columns - Kanban style)                 ││
│  │  Financial | External | Internal | Learning                     ││
│  └──────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

**Components:**
- `StatsCard` - Summary statistics
- `PerspectiveProgressChart` - Bar/Radar chart
- `QuickActions` - Alerts and upcoming items
- `OKRKanbanMini` - Simplified kanban view

---

### 2. OGSM Company Page (`/ogsm`)

**Purpose:** Hiển thị OGSM framework cấp công ty với 4 góc nhìn BSC.

**Layout (List View):**
```
┌─────────────────────────────────────────────────────────────────────┐
│ Header: Bản đồ chiến lược - Tổng công ty                            │
│ Subtitle: Objectives, Goals, Strategies, Measures                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Hero Card: KIDO Group - Chiến lược 2025-2026                    ││
│  │ [Xem theo Phòng ban →]                                          ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─────────────────────────────┬───────────────────────────────────┐│
│  │ Tabs: [List View] [Graph]  │ OGSM Flow: O → G → S → M          ││
│  └─────────────────────────────┴───────────────────────────────────┘│
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ OBJECTIVE: Tăng trưởng bền vững (Financial)         [Badge]   │  │
│  │ ├── GOAL: Tăng trưởng doanh thu +30%     ████████░░ 72%       │  │
│  │ │   ├── Strategy: Tăng độ phủ, forecast chuẩn                 │  │
│  │ │   │   └── Measures: [Doanh thu] [OOS rate]                  │  │
│  │ │   └── Strategy: ...                                         │  │
│  │ └── GOAL: Tối ưu chi phí -5%             █████████░ 78%       │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ OBJECTIVE: Trải nghiệm khách hàng (External)        [Badge]   │  │
│  │ ... similar structure                                         │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

**Layout (Graph Tree View):**
```
┌─────────────────────────────────────────────────────────────────────┐
│  Interactive React Flow Diagram                                     │
│                                                                     │
│         ┌─────────────┐                                             │
│         │  Objective  │                                             │
│         │  (Root)     │                                             │
│         └──────┬──────┘                                             │
│                │                                                    │
│    ┌───────────┼───────────┐                                        │
│    ▼           ▼           ▼                                        │
│  ┌─────┐   ┌─────┐     ┌─────┐                                      │
│  │Goal │   │Goal │     │Goal │                                      │
│  └──┬──┘   └──┬──┘     └──┬──┘                                      │
│     │         │           │                                         │
│     ▼         ▼           ▼                                         │
│  ┌─────┐   ┌─────┐     ┌─────┐                                      │
│  │Strat│   │Strat│     │Strat│                                      │
│  └─────┘   └─────┘     └─────┘                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Components:**
- `OGSMHeroCard` - Introduction card
- `OGSMFlowIndicator` - O → G → S → M flow
- `ObjectiveCard` - Expandable objective
- `GoalItem` - Goal with progress
- `StrategyItem` - Strategy with measures
- `MeasureBadge` - Clickable badge linking to KPI
- `InteractiveGraph` - React Flow diagram

---

### 3. OGSM Department Page (`/ogsm/department`)

**Purpose:** OGSM cascade xuống cấp Phòng ban, hiển thị alignment với Company Goals.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ Header: OGSM - Cấp Phòng ban                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Filter: [All Departments ▼] [Purpose: All ▼]                       │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Table View                                                     │  │
│  ├─────────┬─────────┬─────────┬────────────┬──────────┬────────┤  │
│  │ Phòng   │ Purpose │ Objective│ Strategy   │ Measures │Progress│  │
│  ├─────────┼─────────┼─────────┼────────────┼──────────┼────────┤  │
│  │Sales GT │Tăng     │ +10%    │Tăng độ phủ │Doanh thu │████ 85%│  │
│  │         │trưởng   │         │forecast    │OOS rate  │        │  │
│  │         │         │         │            │          │        │  │
│  │         │         │ ↳ Linked to: Tăng trưởng doanh thu +30%  │  │
│  ├─────────┼─────────┼─────────┼────────────┼──────────┼────────┤  │
│  │Sales MT │Tăng     │ +15%    │Push promo  │Doanh số  │████ 78%│  │
│  │         │trưởng   │         │            │Share     │        │  │
│  └─────────┴─────────┴─────────┴────────────┴──────────┴────────┘  │
│                                                                     │
│  Legend: ↳ = Linked to Company Goal                                │
└─────────────────────────────────────────────────────────────────────┘
```

**Components:**
- `DepartmentFilter` - Filter dropdowns
- `DepartmentOGSMTable` - Table with expandable rows
- `LinkedGoalIndicator` - Shows connection to company goal
- `DepartmentOGSMCard` - Card view alternative

---

### 4. Strategy Map Page (`/strategy-map`)

**Purpose:** Visual strategy map theo BSC với 4 layers, shows cause-effect relationships.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ Header: Strategy Map - Bản đồ chiến lược                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ LAYER: TÀI CHÍNH (Financial) - Blue                            ││
│  │   ┌──────────────┐                                              ││
│  │   │ F1.0         │                                              ││
│  │   │ Tăng trưởng  │                                              ││
│  │   │ doanh thu    │                                              ││
│  │   └───────┬──────┘                                              ││
│  └───────────│─────────────────────────────────────────────────────┘│
│              │                                                      │
│  ┌───────────▼─────────────────────────────────────────────────────┐│
│  │ LAYER: KHÁCH HÀNG (External) - Amber                           ││
│  │   ┌──────────────┐        ┌──────────────┐                      ││
│  │   │ C2.1         │        │ C2.2         │                      ││
│  │   │ Trải nghiệm  │        │ Mở rộng      │                      ││
│  │   │ khách hàng   │        │ thị phần     │                      ││
│  │   └───────┬──────┘        └───────┬──────┘                      ││
│  └───────────│───────────────────────│─────────────────────────────┘│
│              │                       │                              │
│  ┌───────────▼───────────────────────▼─────────────────────────────┐│
│  │ LAYER: QUY TRÌNH NỘI BỘ (Internal) - Emerald                   ││
│  │   ┌──────────────┐        ┌──────────────┐                      ││
│  │   │ P3.1         │        │ P3.2         │                      ││
│  │   │ Tối ưu       │        │ Số hóa       │                      ││
│  │   │ giao hàng    │        │ quản trị kho │                      ││
│  │   └───────┬──────┘        └───────┬──────┘                      ││
│  └───────────│───────────────────────│─────────────────────────────┘│
│              │                       │                              │
│  ┌───────────▼───────────────────────▼─────────────────────────────┐│
│  │ LAYER: HỌC HỎI & PHÁT TRIỂN (Learning) - Purple                ││
│  │   ┌──────────────┐        ┌──────────────┐                      ││
│  │   │ L4.1         │        │ L4.2         │                      ││
│  │   │ Đào tạo      │        │ Văn hóa      │                      ││
│  │   │ kỹ năng số   │        │ cải tiến     │                      ││
│  │   └──────────────┘        └──────────────┘                      ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  [Detail Panel on click - Slide in from right]                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Components:**
- `StrategyMapCanvas` - React Flow canvas
- `GoalNode` - Custom node for goals
- `CauseEffectEdge` - Arrow connections
- `PerspectiveLayer` - Grouped layer background
- `DetailPanel` - Sheet/Drawer for node details

---

### 5. OKRs Page (`/okrs`)

**Purpose:** OKRs board theo quarter, có thể drag-drop giữa perspectives.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ Header: OKRs - Objectives & Key Results                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Actions: [Filter: All ▼] [Quarter: Q4 2024 ▼]   [+ Tạo OKR mới]   │
│                                                                     │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐      │
│  │ TÀI CHÍNH   │ KHÁCH HÀNG   │ QUY TRÌNH    │ HỌC HỎI      │      │
│  │ (2 OKRs)    │ (2 OKRs)     │ (2 OKRs)     │ (2 OKRs)     │      │
│  ├──────────────┼──────────────┼──────────────┼──────────────┤      │
│  │┌────────────┐│┌────────────┐│┌────────────┐│┌────────────┐│      │
│  ││ OKR Card   │││ OKR Card   │││ OKR Card   │││ OKR Card   ││      │
│  ││            │││            │││            │││            ││      │
│  ││ Objective  │││ Objective  │││ Objective  │││ Objective  ││      │
│  ││ ████░ 72%  │││ ████░ 88%  │││ ████░ 85%  │││ ████░ 82%  ││      │
│  ││            │││            │││            │││            ││      │
│  ││ 3 KRs      │││ 3 KRs      │││ 3 KRs      │││ 2 KRs      ││      │
│  │└────────────┘│└────────────┘│└────────────┘│└────────────┘│      │
│  │              │              │              │              │      │
│  │┌────────────┐│┌────────────┐│┌────────────┐│┌────────────┐│      │
│  ││ OKR Card 2 │││ OKR Card 2 │││ OKR Card 2 │││ OKR Card 2 ││      │
│  │└────────────┘│└────────────┘│└────────────┘│└────────────┘│      │
│  └──────────────┴──────────────┴──────────────┴──────────────┘      │
│                                                                     │
│  [OKR Detail Sheet - slides in from right on card click]            │
└─────────────────────────────────────────────────────────────────────┘
```

**Components:**
- `OKRKanban` - Drag-drop kanban board
- `OKRCard` - Expandable card with KRs
- `KeyResultItem` - Progress bar for each KR
- `OKRCreateDialog` - Modal for creating new OKR
- `OKRDetailSheet` - Sheet for full details
- `GoalAlignmentBadge` - Shows linked company goal

---

### 6. KPIs Page (`/kpis`)

**Purpose:** KPIs dashboard với charts và drill-down.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ Header: KPIs - Key Performance Indicators                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                 │
│  │ ✓ Đúng tiến  │ │ ⚠ Có rủi ro  │ │ ✗ Chậm tiến  │                 │
│  │   độ: 9      │ │   2          │ │   độ: 1      │                 │
│  └──────────────┘ └──────────────┘ └──────────────┘                 │
│                                                                     │
│  Filter: [Perspective: All ▼] [Status: All ▼]                       │
│                                                                     │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐      │
│  │ TÀI CHÍNH   │ KHÁCH HÀNG   │ QUY TRÌNH    │ HỌC HỎI      │      │
│  ├──────────────┼──────────────┼──────────────┼──────────────┤      │
│  │┌────────────┐│┌────────────┐│┌────────────┐│┌────────────┐│      │
│  ││ KPI Card   │││ KPI Card   │││ KPI Card   │││ KPI Card   ││      │
│  ││            │││            │││            │││            ││      │
│  ││ Doanh thu  │││ Thị phần   │││ OEE        │││ Đào tạo    ││      │
│  ││ 6200/8000  │││ 43%/45%    │││ 82%/85%    │││ 420/500    ││      │
│  ││ ███████░░  │││ █████████░ │││ █████████░ │││ ████████░  ││      │
│  ││ ↑ trending │││ → stable   │││ ↑ trending │││ ↑ trending ││      │
│  │└────────────┘│└────────────┘│└────────────┘│└────────────┘│      │
│  └──────────────┴──────────────┴──────────────┴──────────────┘      │
│                                                                     │
│  [KPI Detail Sheet with Area Chart on click]                        │
└─────────────────────────────────────────────────────────────────────┘
```

**KPI Detail View (`/kpis/[id]`):**
```
┌─────────────────────────────────────────────────────────────────────┐
│  KPI: Doanh thu                           Status: ⚠ At Risk         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────────────────────┐  ┌──────────────────┐   │
│  │  Area Chart (History)                  │  │  Current: 6,200  │   │
│  │                                        │  │  Target:  8,000  │   │
│  │      ▲                                 │  │  Gap:     1,800  │   │
│  │     ╱ ╲    ╱╲                          │  │                  │   │
│  │    ╱   ╲  ╱  ╲                         │  │  Trend: ↑ Up     │   │
│  │   ╱     ╲╱    ╲                        │  │                  │   │
│  │  ╱              ╲                      │  │  Owner: CFO      │   │
│  │ ────────────────────────               │  │                  │   │
│  │ T1 T2 T3 T4 T5 T6 T7 T8 T9 T10         │  │  [View Fishbone] │   │
│  └────────────────────────────────────────┘  └──────────────────┘   │
│                                                                     │
│  Linked To:                                                         │
│  • Goal: Tăng trưởng doanh thu +30%                                │
│  • OKR: Tăng trưởng doanh thu 15% so với năm trước                 │
│  • Dept OGSM: Sales GT (+10%)                                       │
│                                                                     │
│  Actions:                                                           │
│  [Edit KPI] [Update Value] [View History]                           │
└─────────────────────────────────────────────────────────────────────┘
```

**Components:**
- `KPIStatusSummary` - Stats cards
- `KPIKanban` - Drag-drop board
- `KPICard` - Mini card with progress
- `KPIDetailSheet` - Full details
- `KPIChart` - Recharts Area/Line chart
- `TrendIndicator` - Up/Down/Stable icon
- `LinkedItemsList` - Shows connections

---

### 7. CSFs Page (`/csfs`)

**Purpose:** Critical Success Factors tracking board.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ Header: CSFs - Critical Success Factors                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐      │
│  │ NOT STARTED │ IN PROGRESS  │ COMPLETED    │ BLOCKED      │      │
│  │     (1)     │     (4)      │     (2)      │     (1)      │      │
│  ├──────────────┼──────────────┼──────────────┼──────────────┤      │
│  │┌────────────┐│┌────────────┐│┌────────────┐│┌────────────┐│      │
│  ││ CSF Card   │││ CSF Card   │││ CSF Card   │││ CSF Card   ││      │
│  ││            │││ ERP SAP    │││ Đào tạo    │││ E-commerce ││      │
│  ││ Nâng cấp   │││ ████░ 70%  │││ ██████ 100%│││ ███░ 30%   ││      │
│  ││ dây chuyền │││            │││            │││            ││      │
│  ││            │││ Critical   │││ High       │││ High       ││      │
│  │└────────────┘│└────────────┘│└────────────┘│└────────────┘│      │
│  │              │┌────────────┐│┌────────────┐│              │      │
│  │              ││ CSF Card   │││ CSF Card   ││              │      │
│  │              ││ Mạng lưới  │││ FSSC 22000 ││              │      │
│  │              │└────────────┘│└────────────┘│              │      │
│  └──────────────┴──────────────┴──────────────┴──────────────┘      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Components:**
- `CSFKanban` - Status-based kanban
- `CSFCard` - Card with priority badge
- `CSFDetailSheet` - Full details
- `RelatedOKRsList` - Linked OKRs
- `PriorityBadge` - Priority indicator

---

### 8. Fishbone Page (`/fishbone`)

**Purpose:** Root cause analysis cho các KPI off-track.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ Header: Fishbone Analysis - Phân tích nguyên nhân gốc rễ            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                 │
│  │ ✓ Hoàn thành │ │ ⏳ Đang chờ  │ │ ⚠ Quá hạn   │                 │
│  │     3        │ │     2        │ │     1        │                 │
│  └──────────────┘ └──────────────┘ └──────────────┘                 │
│                                                                     │
│  Filter: [All Factors ▼]                                            │
│  Factors: [Tất cả] [Forecast] [Kho] [Trade] [Sản xuất] [NPD] [Log] │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  Fishbone Diagram (React Flow)                                  ││
│  │                                                                 ││
│  │     Forecast ──┐                                                ││
│  │        Kho ────┤                                                ││
│  │      Trade ────┼───────────────→ [Root Problem: Doanh thu thấp] ││
│  │   Sản xuất ────┤                                                ││
│  │        NPD ────┤                                                ││
│  │  Logistics ────┘                                                ││
│  │                                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Action Items Table                                              ││
│  ├─────────┬──────────┬────────────┬─────────┬─────────┬──────────┤│
│  │ Yếu tố  │ Vấn đề   │ Hành động  │ Owner   │ Deadline│ Status   ││
│  ├─────────┼──────────┼────────────┼─────────┼─────────┼──────────┤│
│  │Forecast │Sai 20%   │Chuẩn hóa   │Planning │Hàng tuần│✓ Done    ││
│  │Kho      │Không báo │Dashboard   │Kho      │Thứ 3    │✓ Done    ││
│  │Trade    │Ko push   │Campaign    │Trade    │Hàng thg │⏳ Pending││
│  └─────────┴──────────┴────────────┴─────────┴─────────┴──────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

**Components:**
- `FishboneStatusCards` - Status summary
- `FactorFilter` - Factor buttons
- `FishboneDiagram` - React Flow diagram
- `FishboneNode` - Custom factor node
- `ActionItemsTable` - Table with status
- `ActionStatusBadge` - Status indicator

---

### 9. Project Execution (OpenProject Integration) (`/projects`)

**Purpose:** Quản lý thực thi dự án chi tiết thông qua tích hợp OpenProject.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ Header: Project Execution - Quản lý dự án (OpenProject)             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [View in OpenProject ↗]                                            │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Iframe Embed: OpenProject Gantt / Work Packages                 ││
│  │                                                                 ││
│  │  ┌───────────────────────────────────────────────────────────┐  ││
│  │  │ Project: Tăng trưởng kênh GT                              │  ││
│  │  ├─────────────┬─────────────┬─────────────┬─────────────────┤  ││
│  │  │ Subject     │ Status      │ Assignee    │ Gantt Timeline  │  ││
│  │  ├─────────────┼─────────────┼─────────────┼─────────────────┤  ││
│  │  │ ► Task 1    │ In Progress │ User A      │ [======]        │  ││
│  │  │   Task 1.1  │ New         │ User B      │    [==]         │  ││
│  │  │ ► Task 2    │ Done        │ User A      │ [===]           │  ││
│  │  └─────────────┴─────────────┴─────────────┴─────────────────┘  ││
│  │                                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Deep Integration:**
- **Strategy Link**: Mỗi Strategy trong OGSM sẽ có nút "Create/View Project".
- **Embed View**: Sử dụng `OpenProjectEmbed` component để hiển thị Gantt chart ngay trong KIDO app.
- **SSO**: (Future) Single Sign-On giữa KIDO và OpenProject.

**Components:**
- `OpenProjectEmbed` - Safe iframe wrapper with auth handling
- `ProjectLinkButton` - Button to open project in new tab
- `TaskSummaryCard` - Summary of OpenProject tasks (fetched via API)

---

### 10. Reviews Page (`/reviews`)

**Purpose:** Lịch review tuần/tháng với checklist.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ Header: Review Schedule - Lịch họp review                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Tabs: [Weekly Reviews] [Monthly Reviews]                           │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ WEEKLY REVIEW                                                   ││
│  │ Thứ 2 hàng tuần | Duration: 1 giờ                               ││
│  │                                                                 ││
│  │ Participants: Department Heads, Team Leads                      ││
│  │                                                                 ││
│  │ Checklist:                                                      ││
│  │ □ KPI tuần                                                      ││
│  │ □ Lệch ở đâu                                                    ││
│  │ □ Cập nhật fishbone                                             ││
│  │ □ Hành động tuần sau                                            ││
│  │                                                                 ││
│  │ Next: Monday, Dec 23, 2024                          [Start →]   ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ MONTHLY REVIEW                                                  ││
│  │ Ngày 5 hàng tháng | Duration: 2 giờ                            ││
│  │ ...                                                             ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  Past Reviews: [December 16] [December 9] [December 2] ...          │
└─────────────────────────────────────────────────────────────────────┘
```

**Components:**
- `ReviewTypeTab` - Weekly/Monthly tabs
- `ReviewCard` - Review schedule card
- `ChecklistItem` - Checkbox item
- `ParticipantsList` - Participants avatars
- `PastReviewsList` - History of reviews
- `ReviewStartButton` - Starts review session

---

## Shared Components

### Navigation

```typescript
// Sidebar items
const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Target, label: 'OGSM', href: '/ogsm', badge: null },
  { icon: Map, label: 'Strategy Map', href: '/strategy-map' },
  { icon: ListChecks, label: 'OKRs', href: '/okrs', badge: '8' },
  { icon: BarChart3, label: 'KPIs', href: '/kpis', badge: '12' },
  { icon: Shield, label: 'CSFs', href: '/csfs' },
  { icon: GitBranch, label: 'Fishbone', href: '/fishbone' },
  { icon: FolderKanban, label: 'Projects', href: '/projects' },
  { icon: Calendar, label: 'Reviews', href: '/reviews' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];
```

### Common UI Components

- `Header` - Page header with title/subtitle
- `Card` / `CardContent` / `CardHeader` - Card container
- `Badge` - Status/Priority badges
- `Progress` - Progress bar
- `Button` - Action buttons
- `Dialog` / `Sheet` - Modals and drawers
- `Select` - Dropdown selects
- `Tabs` - Tab navigation
- `Avatar` - User avatars
- `Tooltip` - Hover tooltips

---

## Responsive Design

```typescript
// Breakpoints
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
};

// Layout rules
// - Sidebar: Hidden on mobile, collapsed on tablet, full on desktop
// - Kanban: Scrollable horizontal on mobile
// - Cards: 1 col mobile, 2 col tablet, 4 col desktop
// - Sheets: Full screen on mobile, drawer on desktop
```

---

## Component File Structure

```
src/components/
├── layout/
│   ├── header.tsx
│   ├── sidebar.tsx
│   └── main-content.tsx
├── ui/
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── progress.tsx
│   ├── dialog.tsx
│   ├── sheet.tsx
│   ├── tabs.tsx
│   └── ...
├── ogsm/
│   ├── objective-card.tsx
│   ├── goal-item.tsx
│   ├── strategy-item.tsx
│   ├── measure-badge.tsx
│   ├── ogsm-flow-indicator.tsx
│   └── interactive-graph.tsx
├── strategy-map/
│   ├── strategy-canvas.tsx
│   ├── goal-node.tsx
│   ├── cause-effect-edge.tsx
│   ├── perspective-layer.tsx
│   └── detail-panel.tsx
├── okrs/
│   ├── okr-kanban.tsx
│   ├── okr-card.tsx
│   ├── key-result-item.tsx
│   ├── okr-create-dialog.tsx
│   └── okr-detail-sheet.tsx
├── kpis/
│   ├── kpi-kanban.tsx
│   ├── kpi-card.tsx
│   ├── kpi-chart.tsx
│   ├── trend-indicator.tsx
│   └── kpi-detail-sheet.tsx
├── csfs/
│   ├── csf-kanban.tsx
│   ├── csf-card.tsx
│   └── csf-detail-sheet.tsx
├── fishbone/
│   ├── fishbone-diagram.tsx
│   ├── fishbone-node.tsx
│   ├── action-items-table.tsx
│   └── factor-filter.tsx
├── actions/
│   ├── action-card.tsx
│   ├── week-group.tsx
│   └── action-create-dialog.tsx
├── reviews/
│   ├── review-card.tsx
│   └── checklist-item.tsx
└── shared/
    ├── perspective-badge.tsx
    ├── status-badge.tsx
    ├── linked-item.tsx
    └── user-avatar.tsx
```

---

## Next Steps

- [ ] Create component stubs
- [ ] Implement design tokens
- [ ] Build shared components
- [ ] Implement each page
- [ ] Add animations and transitions
- [ ] Test responsive design
