# Data Model & Relationships Specification

## Overview

Tài liệu này mô tả data model, TypeScript interfaces, và các relationships giữa các entities trong hệ thống KIDO OKR-BSC.

> [!NOTE]
> **Database Mapping**: 
> Các TypeScript interfaces (e.g., `User`, `Goal`) sẽ map với các bảng trong database có prefix `okr_` (e.g., `okr_users`, `okr_goals`).
> Khi query bằng Supabase Client, cần sử dụng đúng tên bảng `okr_*` và dùng alias để map về đúng field name trong interface.

## Core Concept: OGSM Cascade

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           COMPANY LEVEL (OGSM)                              │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Financial │    │   External  │    │   Internal  │    │   Learning  │  │
│  │  Objectives │    │  Objectives │    │  Objectives │    │  Objectives │  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘  │
│         │                  │                  │                  │          │
│         ▼                  ▼                  ▼                  ▼          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                            GOALS                                     │   │
│  │  • Tăng trưởng doanh thu (+30%)                                     │   │
│  │  • Mở rộng thị phần (+10%)                                          │   │
│  │  • Chuyển đổi số (100% quy trình)                                   │   │
│  │  • Đào tạo (50h/người/năm)                                          │   │
│  └──────────────────────────┬──────────────────────────────────────────┘   │
│                             │                                               │
│         ┌───────────────────┼───────────────────┐                          │
│         ▼                   ▼                   ▼                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                     │
│  │  Strategies │    │    KPIs     │    │    OKRs     │                     │
│  │  (How)      │    │ (Measures)  │    │ (Quarterly) │                     │
│  └─────────────┘    └─────────────┘    └─────────────┘                     │
│                                                                             │
35: └────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ CASCADE
┌────────────────────────────────────────────────────────────────────────────┐
│                         DEPARTMENT LEVEL (OGSM)                             │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │  Sales GT   │  │  Sales MT   │  │  Marketing  │  │  Operations │  ...  │
│  │   OGSM      │  │   OGSM      │  │    OGSM     │  │    OGSM     │       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
│         │                │                │                │               │
│         ▼                ▼                ▼                ▼               │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                      DEPARTMENT KPIs                                 │  │
│  │  • Doanh thu GT (linked to Company Revenue)                         │  │
│  │  • OOS Rate (linked to Company Market Share)                        │  │
│  │  • OEE (linked to Company Efficiency)                               │  │
│  └──────────────────────────┬──────────────────────────────────────────┘  │
│                             │                                              │
│                             ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                      WEEKLY ACTIONS                                  │  │
│  │  • Solution thinking (Tư duy cách làm mới)                          │  │
│  │  • Activity (Hoạt động cụ thể)                                      │  │
│  │  • Owner & Status                                                   │  │
│  └──────────────────────────┬──────────────────────────────────────────┘  │
│                             │                                              │
│                             ▼ (When off-track)                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                      FISHBONE ANALYSIS                               │  │
│  │  Root cause → Action → Owner → Deadline → Result                    │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## TypeScript Interfaces

### Base Types

```typescript
// src/types/base.ts

export type Perspective = 'financial' | 'external' | 'internal' | 'learning';
export type OKRStatus = 'on_track' | 'at_risk' | 'off_track' | 'completed';
export type CSFStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type ActionStatus = 'pending' | 'done' | 'overdue';
export type ReviewType = 'weekly' | 'monthly' | 'quarterly';

// Base entity with common fields
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Organization & Users

```typescript
// src/types/organization.ts

export interface Organization extends BaseEntity {
  name: string;
  slogan?: string;
  logoUrl?: string;
  fiscalYear: string;
  currentQuarter: string;
}

export interface User extends BaseEntity {
  organizationId: string;
  departmentId?: string;
  email: string;
  fullName: string;
  role: string; // CEO, CFO, CMO, Director, Manager, Staff
  avatarUrl?: string;
  openprojectUserId?: number; // Link to OpenProject User ID
  
  // Relations (populated)
  organization?: Organization;
  department?: Department;
}

export interface Department extends BaseEntity {
  organizationId: string;
  name: string;
  code: string; // SALES_GT, SALES_MT, etc.
  parentId?: string;
  headUserId?: string;
  
  // Relations (populated)
  organization?: Organization;
  parent?: Department;
  children?: Department[];
  head?: User;
}

// src/types/integration.ts
export interface OpenProjectProject {
  id: number;
  identifier: string; // e.g. 'demo-project'
  name: string;
  description: { raw: string; html: string };
  // ... other OP fields
}

export interface OpenProjectWorkPackage {
  id: number;
  subject: string;
  startDate: string;
  dueDate: string;
  percentageDone: number;
  _links: {
    status: { href: string; title: string };
    priority: { href: string; title: string };
    assignee: { href: string; title: string };
  };
}
```

### OGSM Company Level

```typescript
// src/types/ogsm.ts

// Objective - BSC Level
export interface Objective extends BaseEntity {
  organizationId: string;
  name: string;
  description?: string;
  perspective: Perspective;
  priority: number;
  status: 'active' | 'archived';
  fiscalYear: string;
  
  // Relations (populated)
  goals?: Goal[];
}

// Goal - Company Level measurable target
export interface Goal extends BaseEntity {
  objectiveId: string;
  name: string;
  description?: string;
  targetValue?: number;
  targetUnit?: string; // '%', 'tỷ VND', etc.
  targetText: string; // '+30%', '-5%', '100% quy trình'
  currentValue: number;
  ownerId?: string;
  progress: number; // 0-100
  dueDate?: Date;
  status: 'active' | 'completed' | 'archived';
  
  // Relations (populated)
  objective?: Objective;
  owner?: User;
  strategies?: Strategy[];
  linkedOKRs?: OKR[];
  departmentOGSMs?: DepartmentOGSM[];
}

// Strategy - How to achieve Goals
export interface Strategy extends BaseEntity {
  goalId: string;
  name: string;
  description?: string;
  priority: number;
  openprojectProjectId?: string; // Link to OpenProject Project ID (e.g. "15", "demo-project")
  
  // Relations (populated)
  goal?: Goal;
  measures?: StrategyMeasure[];
}

// Strategy Measure - Link to KPIs
export interface StrategyMeasure extends BaseEntity {
  strategyId: string;
  name: string;
  kpiId?: string;
  
  // Relations (populated)
  strategy?: Strategy;
  kpi?: KPI;
}
```

### OGSM Department Level

```typescript
// src/types/department-ogsm.ts

export interface DepartmentOGSM extends BaseEntity {
  departmentId: string;
  linkedGoalId?: string; // Company goal this cascades from
  
  // OGSM Fields
  purpose: string; // Why - Tăng trưởng, NPD, Chi phí, etc.
  objective: string; // What - +10%, +15%, -5%, etc.
  strategy?: string; // How
  
  ownerId?: string;
  progress: number; // 0-100
  fiscalYear: string;
  
  // Relations (populated)
  department?: Department;
  linkedGoal?: Goal;
  owner?: User;
  measures?: DepartmentMeasure[];
}

export interface DepartmentMeasure extends BaseEntity {
  deptOgsmId: string;
  name: string;
  kpiId?: string;
  
  // Relations (populated)
  deptOgsm?: DepartmentOGSM;
  kpi?: KPI;
}
```

### KPIs

```typescript
// src/types/kpi.ts

export interface KPI extends BaseEntity {
  organizationId: string;
  name: string;
  description?: string;
  perspective: Perspective;
  
  // Targets
  targetValue: number;
  currentValue: number;
  unit: string; // 'tỷ VND', '%', 'điểm', 'người', 'sản phẩm'
  
  // Status
  status: OKRStatus;
  trend: 'up' | 'down' | 'stable';
  
  // Ownership
  ownerId?: string;
  departmentId?: string;
  
  // Frequency
  measurementFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  
  // Links
  linkedGoalId?: string;
  
  // Relations (populated)
  owner?: User;
  department?: Department;
  linkedGoal?: Goal;
  history?: KPIHistory[];
}

export interface KPIHistory extends BaseEntity {
  kpiId: string;
  period: string; // 'T1', 'T2', 'W49', 'Q1 2024'
  value: number;
  recordedAt: Date;
  notes?: string;
}

// Helper type for charts
export interface KPIWithHistory extends KPI {
  history: { month: string; value: number }[];
}
```

### OKRs

```typescript
// src/types/okr.ts

export interface OKR extends BaseEntity {
  organizationId: string;
  objective: string;
  perspective: Perspective;
  quarter: string; // 'Q4 2024'
  status: OKRStatus;
  progress: number; // 0-100
  ownerId?: string;
  departmentId?: string;
  linkedGoalId?: string; // Alignment to Company Goal
  dueDate?: Date;
  
  // Relations (populated)
  owner?: User;
  department?: Department;
  linkedGoal?: Goal;
  keyResults?: KeyResult[];
}

export interface KeyResult extends BaseEntity {
  okrId: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit?: string;
  weight: number; // For weighted progress calculation
  
  // Computed
  progress?: number; // (currentValue / targetValue) * 100
  
  // Relations (populated)
  okr?: OKR;
}
```

### CSFs (Critical Success Factors)

```typescript
// src/types/csf.ts

export interface CSF extends BaseEntity {
  organizationId: string;
  title: string;
  description?: string;
  status: CSFStatus;
  priority: Priority;
  
  assigneeId?: string;
  departmentId?: string;
  
  dueDate?: Date;
  progress: number; // 0-100
  
  // Relations (populated)
  assignee?: User;
  department?: Department;
  relatedOKRs?: OKR[];
}

export interface CSFOKRRelation {
  csfId: string;
  okrId: string;
}
```

### Fishbone Analysis

```typescript
// src/types/fishbone.ts

export type FishboneFactor = 
  | 'Forecast' 
  | 'Kho' 
  | 'Trade' 
  | 'Sản xuất' 
  | 'NPD' 
  | 'Logistics';

export interface FishboneItem extends BaseEntity {
  organizationId: string;
  kpiId?: string; // Which KPI is off-track
  
  factor: FishboneFactor;
  problem: string;
  action: string;
  
  ownerId?: string;
  deadline: string; // 'Thứ 6 hàng tuần', 'Hàng tháng', etc.
  
  expectedResult: string;
  actualResult?: string;
  status: ActionStatus;
  
  // Relations (populated)
  kpi?: KPI;
  owner?: User;
}
```

### Weekly Actions

```typescript
// src/types/weekly-actions.ts

export interface WeeklyAction extends BaseEntity {
  organizationId: string;
  week: string; // 'Tuần 49', 'Tuần 48'
  
  linkedGoalId?: string;
  linkedKpiId?: string;
  
  // Solution thinking
  solution: string; // Tư duy "Cách làm nào mới"
  activity: string; // Hoạt động cụ thể
  
  ownerId?: string;
  status: ActionStatus;
  result?: string;
  
  // Relations (populated)
  linkedGoal?: Goal;
  linkedKpi?: KPI;
  owner?: User;
}
```

### Reviews

```typescript
// src/types/review.ts

export interface ReviewChecklist {
  item: string;
  completed: boolean;
}

export interface Review extends BaseEntity {
  organizationId: string;
  type: ReviewType;
  title: string;
  scheduledDate: Date;
  completedAt?: Date;
  
  departmentId?: string;
  facilitatorId?: string;
  
  checklist: ReviewChecklist[];
  participants: string[]; // User IDs
  durationMinutes: number;
  
  notes?: string;
  actionItems: { task: string; assignee: string; dueDate: Date }[];
  
  // Relations (populated)
  department?: Department;
  facilitator?: User;
}
```

### Strategy Map

```typescript
// src/types/strategy-map.ts

export interface StrategyNodeGoal {
  label: string;
  current: string;
  target: string;
  isCompleted: boolean;
}

export interface StrategyNode extends BaseEntity {
  organizationId: string;
  
  label: string;
  category: Perspective;
  code: string; // 'F1.0', 'C2.1', 'P3.1', 'L4.1'
  
  linkedGoalId?: string;
  
  // Visual position
  positionX: number;
  positionY: number;
  
  // Status
  status: OKRStatus;
  progress: number;
  
  ownerId?: string;
  
  // Additional data
  goals?: StrategyNodeGoal[];
  strategies?: string[];
  
  // Relations (populated)
  linkedGoal?: Goal;
  owner?: User;
}

export interface StrategyEdge extends BaseEntity {
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
}
```

---

## Relationship Matrix

| From | To | Relationship | Type |
|------|-----|--------------|------|
| Organization | Users | Has Many | 1:N |
| Organization | Departments | Has Many | 1:N |
| Organization | Objectives | Has Many | 1:N |
| Organization | KPIs | Has Many | 1:N |
| Organization | OKRs | Has Many | 1:N |
| Department | Users | Has Many | 1:N |
| Department | Department (parent) | Belongs To | N:1 |
| Department | DepartmentOGSM | Has Many | 1:N |
| Objective | Goals | Has Many | 1:N |
| Goal | Strategies | Has Many | 1:N |
| Goal | OKRs | Has Many | 1:N |
| Goal | DepartmentOGSM | Has Many | 1:N |
| Goal | WeeklyActions | Has Many | 1:N |
| Strategy | StrategyMeasures | Has Many | 1:N |
| StrategyMeasure | KPI | Belongs To | N:1 |
| DepartmentOGSM | DepartmentMeasures | Has Many | 1:N |
| DepartmentMeasure | KPI | Belongs To | N:1 |
| KPI | KPIHistory | Has Many | 1:N |
| KPI | FishboneItems | Has Many | 1:N |
| OKR | KeyResults | Has Many | 1:N |
| CSF | OKRs | Many to Many | M:N |
| User | Goals (owner) | Has Many | 1:N |
| User | OKRs (owner) | Has Many | 1:N |
| User | KPIs (owner) | Has Many | 1:N |

---

## Data Linking Examples

### 1. Linking OGSM Goals to Department OGSM

```typescript
// Company Goal
const companyGoal: Goal = {
  id: 'goal-revenue',
  name: 'Tăng trưởng doanh thu',
  targetText: '+30%',
  progress: 72,
  // ...
};

// Department OGSM links to Company Goal
const salesGTOgsm: DepartmentOGSM = {
  id: 'dept-ogsm-1',
  departmentId: 'dept-sales-gt',
  linkedGoalId: 'goal-revenue', // <-- Link to Company Goal
  purpose: 'Tăng trưởng',
  objective: '+10%',
  strategy: 'Tăng độ phủ, forecast chuẩn',
  progress: 85,
  // ...
};
```

### 2. Linking Strategy Measures to KPIs

```typescript
// Strategy
const strategy: Strategy = {
  id: 'str-1',
  goalId: 'goal-2',
  name: 'Tăng độ phủ, forecast chuẩn',
  // ...
};

// Strategy Measures link to KPIs
const measures: StrategyMeasure[] = [
  { strategyId: 'str-1', name: 'Doanh thu', kpiId: 'kpi-revenue' },
  { strategyId: 'str-1', name: 'OOS rate', kpiId: 'kpi-oos-rate' },
];
```

### 3. Linking OKRs to Company Goals

```typescript
// OKR links to Company Goal for alignment
const okr: OKR = {
  id: 'okr-1',
  objective: 'Tăng trưởng doanh thu 15% so với năm trước',
  perspective: 'financial',
  quarter: 'Q4 2024',
  linkedGoalId: 'goal-revenue', // <-- Alignment to Company Goal
  // ...
};
```

### 4. Linking Fishbone to off-track KPI

```typescript
// When KPI is off-track, create Fishbone analysis
const offTrackKpi: KPI = {
  id: 'kpi-digitalization',
  name: 'Số hóa quy trình',
  status: 'off_track',
  currentValue: 55,
  targetValue: 80,
  // ...
};

// Fishbone items link to the off-track KPI
const fishboneItem: FishboneItem = {
  id: 'fb-1',
  kpiId: 'kpi-digitalization', // <-- Link to off-track KPI
  factor: 'Sản xuất',
  problem: 'OEE thấp',
  action: 'Maintenance preventive',
  // ...
};
```

### 5. Linking Weekly Actions to Goals and KPIs

```typescript
const weeklyAction: WeeklyAction = {
  id: 'wa-1',
  week: 'Tuần 49',
  linkedGoalId: 'goal-inventory', // <-- Link to Goal
  linkedKpiId: 'kpi-inventory-days', // <-- Link to KPI
  solution: 'Tư duy mới về quản lý tồn kho',
  activity: 'Rà SKU ≤ 60 ngày',
  // ...
};
```

---

## Query Examples with Supabase

### Get Full OGSM Cascade

```typescript
// Fetch Objectives with Goals, Strategies, and Measures
const { data: objectives } = await supabase
  .from('okr_objectives')
  .select(`
    *,
    goals:okr_goals (
      *,
      owner:okr_users(*),
      strategies:okr_strategies (
        *,
        measures:okr_strategy_measures (
          *,
          kpi:okr_kpis(*)
        )
      ),
      department_ogsms:okr_department_ogsm (
        *,
        department:okr_departments(*),
        measures:okr_department_measures (
          *,
          kpi:okr_kpis(*)
        )
      )
    )
  `)
  .eq('organization_id', orgId)
  .eq('status', 'active');
```

### Get OKRs with Key Results and Goal Alignment

```typescript
const { data: okrs } = await supabase
  .from('okr_okrs')
  .select(`
    *,
    owner:okr_users(*),
    key_results:okr_key_results(*),
    linked_goal:okr_goals (
      *,
      objective:okr_objectives(*)
    )
  `)
  .eq('quarter', 'Q4 2024')
  .order('perspective');
```

### Get KPI with History for Charts

```typescript
const { data: kpi } = await supabase
  .from('okr_kpis')
  .select(`
    *,
    history:okr_kpi_history(*)
  `)
  .eq('id', kpiId)
  .single();

// Transform for Recharts
const chartData = kpi.history.map(h => ({
  month: h.period,
  value: h.value,
}));
```

---

## Validation Rules

1. **Goal.progress** should be calculated from linked OKRs or manually set
2. **KPI.status** should be auto-calculated based on current vs target
3. **OKR.progress** should be calculated from weighted KeyResults
4. **DepartmentOGSM.linkedGoalId** must reference an existing Goal
5. **StrategyMeasure.kpiId** should reference an existing KPI
6. **WeeklyAction.week** should follow format "Tuần XX"
7. **FishboneItem** should only be created for off-track KPIs

---

## Next Steps

- [ ] Create Zod schemas for validation
- [ ] Generate Supabase types from schema
- [ ] Create React Query hooks for data fetching
- [ ] Implement real-time subscriptions
