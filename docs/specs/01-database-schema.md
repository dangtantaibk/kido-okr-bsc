# Database Schema Specification

## Overview

Database schema cho KIDO OKR-BSC System, thiết kế cho Supabase (PostgreSQL).

> [!NOTE]
> **Namespace**: Tất cả các bảng và enum types được thêm prefix `okr_` để phân biệt với các project khác trong cùng database schema `public`.

## Entity Relationship Diagram

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│  okr_organizations  │────<│      okr_users       │>────│   okr_departments   │
└─────────────────────┘     └──────────────────────┘     └─────────────────────┘
          │                                                         │
          │                                                         │
          ▼                                                         ▼
┌─────────────────────┐                              ┌─────────────────────┐
│    okr_objectives   │                              │ okr_department_ogsm │
│     (BSC Level)     │                              │   (Cascade from     │
└─────────────────────┘                              │   Company Goals)    │
          │                                          └─────────────────────┘
          │                                                   │
          ▼                                                   │
┌─────────────────────┐                                       │
│      okr_goals      │<──────────────────────────────────────┘
│   (Company Level)   │
└─────────────────────┘
          │
          ├──────────────────────────────┐
          ▼                              ▼
┌─────────────────────┐            ┌─────────────────────┐
│    okr_strategies   │            │      okr_okrs       │
└─────────────────────┘            │    (Quarterly)      │
          │                        └─────────────────────┘
          │                                  │
          ▼                                  ▼
┌─────────────────────┐            ┌─────────────────────┐
│okr_strategy_measures│            │   okr_key_results   │
└─────────────────────┘            └─────────────────────┘
          │
          ▼
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│      okr_kpis       │────>│   okr_kpi_history   │     │      okr_csfs       │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
          │                                                     │
          ▼                                                     │
┌─────────────────────┐     ┌─────────────────────┐             │
│ okr_fishbone_items  │     │ okr_weekly_actions  │<────────────┘
│    (Root Cause)     │     │        (Log)        │
└─────────────────────┘     └─────────────────────┘
          │
          ▼
┌─────────────────────┐
│     okr_reviews     │
│  (Weekly/Monthly)   │
└─────────────────────┘
```

## Data Flow (Cascade Strategy)

```
OGSM Company Level
├── Objectives (okr_objectives - 4 BSC Perspectives)
│   └── Goals (okr_goals - Measurable targets with owners)
│       ├── Strategies (okr_strategies - How to achieve goals)
│       │   └── Measures/KPIs (okr_kpis - What metrics to track)
│       │
│       └── Department OGSM (okr_department_ogsm - Cascade down to departments)
│           ├── Department-specific objectives
│           └── Department KPIs (linked to company KPIs)
│               └── Actions/Initiatives
│                   └── Weekly Actions Log (okr_weekly_actions)
│                       └── Fishbone Analysis (okr_fishbone_items) (when off-track)
│
└── OKRs (okr_okrs - Quarterly execution of Goals)
    └── Key Results (okr_key_results - Measurable outcomes)
```

---

## Tables

### 1. okr_organizations

Thông tin tổ chức/công ty.

```sql
CREATE TABLE okr_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slogan TEXT,
  logo_url TEXT,
  fiscal_year TEXT,
  current_quarter TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example data
INSERT INTO okr_organizations (name, slogan, fiscal_year, current_quarter) VALUES
('KIDO Group', 'Tập đoàn FMCG hàng đầu Việt Nam', '2024', 'Q4 2024');
```

### 2. okr_departments

Phòng ban với cấu trúc cây (parent-child).

```sql
CREATE TABLE okr_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES okr_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT UNIQUE, -- 'SALES_GT', 'SALES_MT', 'MARKETING', etc.
  parent_id UUID REFERENCES okr_departments(id), -- For hierarchy
  head_user_id UUID, -- Will reference okr_users(id)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example data
INSERT INTO okr_departments (organization_id, name, code) VALUES
('org-id', 'Sales GT', 'SALES_GT'),
('org-id', 'Sales MT', 'SALES_MT'),
('org-id', 'Marketing', 'MARKETING'),
('org-id', 'R&D', 'RND'),
('org-id', 'Operations', 'OPS'),
('org-id', 'Supply Chain', 'SCM'),
('org-id', 'Technology', 'TECH'),
('org-id', 'HR', 'HR');
```

### 3. okr_users

Người dùng hệ thống.

```sql
CREATE TABLE okr_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES okr_organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES okr_departments(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL, -- 'CEO', 'CFO', 'CMO', 'Director', 'Manager', 'Staff'
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK to departments after users table exists
ALTER TABLE okr_departments 
ADD CONSTRAINT fk_head_user 
FOREIGN KEY (head_user_id) REFERENCES okr_users(id);
```

### 4. okr_perspective_type (Enum Type)

```sql
CREATE TYPE okr_perspective_type AS ENUM (
  'financial',   -- Tài chính
  'external',    -- Khách hàng
  'internal',    -- Quy trình nội bộ
  'learning'     -- Học hỏi & Phát triển
);
```

### 5. okr_objectives (BSC Level - Company)

Mục tiêu chiến lược theo 4 góc nhìn BSC.

```sql
CREATE TABLE okr_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES okr_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  perspective okr_perspective_type NOT NULL,
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active', 'archived'
  fiscal_year TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example: OGSM Objectives
INSERT INTO okr_objectives (organization_id, name, description, perspective) VALUES
('org-id', 'Tăng trưởng bền vững', 'Tăng trưởng doanh thu và thị phần', 'financial'),
('org-id', 'Trải nghiệm khách hàng', 'Nâng cao sự hài lòng và lòng trung thành', 'external'),
('org-id', 'Tối ưu vận hành', 'Hiệu quả chi phí và quy trình', 'internal'),
('org-id', 'Phát triển đội ngũ', 'Nâng cao năng lực và gắn kết', 'learning');
```

### 6. okr_goals (Company Level Goals)

Mục tiêu cụ thể, đo lường được.

```sql
CREATE TABLE okr_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID REFERENCES okr_objectives(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC,
  target_unit TEXT, -- '%', 'tỷ VND', 'sản phẩm', etc.
  target_text TEXT, -- '+30%', '-5%', '100% quy trình'
  current_value NUMERIC DEFAULT 0,
  owner_id UUID REFERENCES okr_users(id),
  progress NUMERIC DEFAULT 0, -- 0-100
  due_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example: OGSM Goals
INSERT INTO okr_goals (objective_id, name, target_text, owner_id, progress) VALUES
('obj-1', 'Tăng trưởng doanh thu', '+30%', 'user-ceo', 72),
('obj-1', 'Tối ưu chi phí (Cost Efficiency)', '-5%', 'user-cfo', 78),
('obj-2', 'Mở rộng thị phần', '+10%', 'user-sales', 85),
('obj-2', 'Phát triển sản phẩm mới', '+10%', 'user-cmo', 65),
('obj-3', 'Chuyển đổi số & Tự động hóa', '100% quy trình', 'user-cto', 45),
('obj-4', 'Đào tạo & Phát triển', '50h/người/năm', 'user-hr', 82);
```

### 7. okr_strategies

Chiến lược để đạt Goals.

```sql
CREATE TABLE okr_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES okr_goals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example
INSERT INTO okr_strategies (goal_id, name) VALUES
('goal-2', 'Tăng độ phủ, forecast chuẩn'),
('goal-3', 'Push NPD'),
('goal-4', 'Mở rộng kênh online & xuất khẩu'),
('goal-5', 'Tối ưu chi phí sản xuất');
```

### 8. okr_strategy_measures

Liên kết Strategies với KPIs.

```sql
CREATE TABLE okr_strategy_measures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID REFERENCES okr_strategies(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Display name
  kpi_id UUID REFERENCES okr_kpis(id), -- Link to actual KPI
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 9. okr_department_ogsm

OGSM cascade xuống cấp Phòng ban.

```sql
CREATE TABLE okr_department_ogsm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES okr_departments(id) ON DELETE CASCADE,
  linked_goal_id UUID REFERENCES okr_goals(id), -- Company goal this cascades from
  
  -- OGSM Fields
  purpose TEXT, -- Why (Tăng trưởng, NPD, Chi phí, etc.)
  objective TEXT NOT NULL, -- What (+10%, +15%, -5%, etc.)
  strategy TEXT, -- How
  
  owner_id UUID REFERENCES okr_users(id),
  progress NUMERIC DEFAULT 0,
  fiscal_year TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example
INSERT INTO okr_department_ogsm (department_id, linked_goal_id, purpose, objective, strategy, progress) VALUES
('dept-sales-gt', 'goal-1', 'Tăng trưởng', '+10%', 'Tăng độ phủ, forecast chuẩn', 85),
('dept-sales-mt', 'goal-2', 'Tăng trưởng', '+15%', 'Đẩy mạnh promotions', 78),
('dept-marketing', 'goal-3', 'NPD', '+10%', 'Push NPD', 65);
```

### 10. okr_department_measures

KPIs cho từng Department OGSM.

```sql
CREATE TABLE okr_department_measures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dept_ogsm_id UUID REFERENCES okr_department_ogsm(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kpi_id UUID REFERENCES okr_kpis(id), -- Link to KPI
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 11. okr_kpis

Key Performance Indicators.

```sql
CREATE TYPE okr_status_type AS ENUM ('on_track', 'at_risk', 'off_track', 'completed');

CREATE TABLE okr_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES okr_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  perspective okr_perspective_type NOT NULL,
  
  -- Targets
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT NOT NULL, -- 'tỷ VND', '%', 'điểm', 'người', 'sản phẩm'
  
  -- Status
  status okr_status_type DEFAULT 'on_track',
  trend TEXT DEFAULT 'stable', -- 'up', 'down', 'stable'
  
  -- Ownership
  owner_id UUID REFERENCES okr_users(id),
  department_id UUID REFERENCES okr_departments(id),
  
  -- Frequency
  measurement_frequency TEXT DEFAULT 'monthly', -- 'daily', 'weekly', 'monthly', 'quarterly'
  
  -- Links
  linked_goal_id UUID REFERENCES okr_goals(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example KPIs
INSERT INTO okr_kpis (name, perspective, target_value, current_value, unit, status, trend) VALUES
('Doanh thu', 'financial', 8000, 6200, 'tỷ VND', 'at_risk', 'up'),
('Biên lợi nhuận gộp', 'financial', 26, 26.5, '%', 'on_track', 'up'),
('EBITDA', 'financial', 800, 720, 'tỷ VND', 'on_track', 'up'),
('Thị phần ngành kem', 'external', 45, 43, '%', 'at_risk', 'stable'),
('Điểm NPS', 'external', 70, 68, 'điểm', 'on_track', 'up'),
('Tỷ lệ hài lòng khách hàng', 'external', 92, 90, '%', 'on_track', 'up'),
('Hiệu suất sản xuất (OEE)', 'internal', 85, 82, '%', 'on_track', 'up'),
('Tỷ lệ sản phẩm đạt chuẩn', 'internal', 98, 97.5, '%', 'on_track', 'stable'),
('Số hóa quy trình', 'internal', 80, 55, '%', 'off_track', 'up'),
('Số nhân sự được đào tạo', 'learning', 500, 420, 'người', 'on_track', 'up'),
('Tỷ lệ giữ chân nhân tài', 'learning', 90, 88, '%', 'on_track', 'stable'),
('Sản phẩm mới ra mắt', 'learning', 5, 4, 'sản phẩm', 'on_track', 'up');
```

### 12. okr_kpi_history

Lịch sử giá trị KPI theo thời gian.

```sql
CREATE TABLE okr_kpi_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id UUID REFERENCES okr_kpis(id) ON DELETE CASCADE,
  period TEXT NOT NULL, -- 'T1', 'T2', 'W49', 'Q1 2024'
  value NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(kpi_id, period)
);

-- Example: Monthly history for Revenue KPI
INSERT INTO okr_kpi_history (kpi_id, period, value) VALUES
('kpi-revenue', 'T1', 520),
('kpi-revenue', 'T2', 480),
('kpi-revenue', 'T3', 610),
('kpi-revenue', 'T4', 580),
('kpi-revenue', 'T5', 650),
('kpi-revenue', 'T6', 720),
('kpi-revenue', 'T7', 680),
('kpi-revenue', 'T8', 590),
('kpi-revenue', 'T9', 640),
('kpi-revenue', 'T10', 730);
```

### 13. okr_okrs

OKRs (Quarterly execution).

```sql
CREATE TABLE okr_okrs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES okr_organizations(id) ON DELETE CASCADE,
  objective TEXT NOT NULL,
  perspective okr_perspective_type NOT NULL,
  quarter TEXT NOT NULL, -- 'Q4 2024'
  status okr_status_type DEFAULT 'on_track',
  progress NUMERIC DEFAULT 0,
  owner_id UUID REFERENCES okr_users(id),
  department_id UUID REFERENCES okr_departments(id),
  linked_goal_id UUID REFERENCES okr_goals(id), -- Alignment to Company Goal
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 14. okr_key_results

Key Results cho OKRs.

```sql
CREATE TABLE okr_key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  okr_id UUID REFERENCES okr_okrs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  weight NUMERIC DEFAULT 1.0, -- For weighted progress
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 15. okr_csfs

Critical Success Factors.

```sql
CREATE TYPE okr_csf_status_type AS ENUM ('not_started', 'in_progress', 'completed', 'blocked');
CREATE TYPE okr_priority_type AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE okr_csfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES okr_organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status okr_csf_status_type DEFAULT 'not_started',
  priority okr_priority_type DEFAULT 'medium',
  
  assignee_id UUID REFERENCES okr_users(id),
  department_id UUID REFERENCES okr_departments(id),
  
  due_date DATE,
  progress NUMERIC DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 16. okr_csf_okr_relations

Many-to-Many relationship giữa CSFs và OKRs.

```sql
CREATE TABLE okr_csf_okr_relations (
  csf_id UUID REFERENCES okr_csfs(id) ON DELETE CASCADE,
  okr_id UUID REFERENCES okr_okrs(id) ON DELETE CASCADE,
  PRIMARY KEY (csf_id, okr_id)
);
```

### 17. okr_fishbone_items

Fishbone analysis cho Root Cause.

```sql
CREATE TYPE okr_action_status_type AS ENUM ('pending', 'done', 'overdue');

CREATE TABLE okr_fishbone_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES okr_organizations(id) ON DELETE CASCADE,
  kpi_id UUID REFERENCES okr_kpis(id), -- Which KPI is off-track
  
  factor TEXT NOT NULL, -- 'Forecast', 'Kho', 'Trade', 'Sản xuất', 'NPD', 'Logistics'
  problem TEXT NOT NULL,
  action TEXT NOT NULL,
  
  owner_id UUID REFERENCES okr_users(id),
  deadline TEXT, -- 'Thứ 6 hàng tuần', 'Hàng tháng', etc.
  
  expected_result TEXT,
  actual_result TEXT,
  status okr_action_status_type DEFAULT 'pending',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 18. okr_weekly_actions

Weekly Action Log.

```sql
CREATE TABLE okr_weekly_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES okr_organizations(id) ON DELETE CASCADE,
  week TEXT NOT NULL, -- 'Tuần 49', 'Tuần 48'
  
  linked_goal_id UUID REFERENCES okr_goals(id),
  linked_kpi_id UUID REFERENCES okr_kpis(id),
  
  solution TEXT, -- Tư duy "Cách làm nào mới"
  activity TEXT NOT NULL,
  
  owner_id UUID REFERENCES okr_users(id),
  status okr_action_status_type DEFAULT 'pending',
  result TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 19. okr_reviews

Review meetings (Weekly/Monthly).

```sql
CREATE TYPE okr_review_type AS ENUM ('weekly', 'monthly', 'quarterly');

CREATE TABLE okr_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES okr_organizations(id) ON DELETE CASCADE,
  type okr_review_type NOT NULL,
  title TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  
  department_id UUID REFERENCES okr_departments(id),
  facilitator_id UUID REFERENCES okr_users(id),
  
  checklist JSONB, -- Array of checklist items
  participants JSONB, -- Array of user IDs
  duration_minutes INTEGER,
  
  notes TEXT,
  action_items JSONB, -- Array of action items
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 20. okr_strategy_nodes (Strategy Map Visualization)

```sql
CREATE TABLE okr_strategy_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES okr_organizations(id) ON DELETE CASCADE,
  
  label TEXT NOT NULL,
  category okr_perspective_type NOT NULL,
  code TEXT, -- 'F1.0', 'C2.1', 'P3.1', 'L4.1'
  
  -- Link to actual goal
  linked_goal_id UUID REFERENCES okr_goals(id),
  
  -- Visual position
  position_x NUMERIC,
  position_y NUMERIC,
  
  -- Status
  status okr_status_type DEFAULT 'on_track',
  progress NUMERIC DEFAULT 0,
  
  owner_id UUID REFERENCES okr_users(id),
  
  -- Additional data (JSON)
  goals_data JSONB, -- [{label, current, target, isCompleted}]
  strategies_data JSONB, -- [strategy strings]
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 21. okr_strategy_edges

Edges cho Strategy Map.

```sql
CREATE TABLE okr_strategy_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id UUID REFERENCES okr_strategy_nodes(id) ON DELETE CASCADE,
  target_node_id UUID REFERENCES okr_strategy_nodes(id) ON DELETE CASCADE,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_okr_objectives_org ON okr_objectives(organization_id);
CREATE INDEX idx_okr_objectives_perspective ON okr_objectives(perspective);
CREATE INDEX idx_okr_goals_objective ON okr_goals(objective_id);
CREATE INDEX idx_okr_goals_owner ON okr_goals(owner_id);
CREATE INDEX idx_okr_strategies_goal ON okr_strategies(goal_id);
CREATE INDEX idx_okr_kpis_org ON okr_kpis(organization_id);
CREATE INDEX idx_okr_kpis_perspective ON okr_kpis(perspective);
CREATE INDEX idx_okr_kpis_department ON okr_kpis(department_id);
CREATE INDEX idx_okr_kpis_status ON okr_kpis(status);
CREATE INDEX idx_okr_kpi_history_kpi ON okr_kpi_history(kpi_id);
CREATE INDEX idx_okr_kpi_history_period ON okr_kpi_history(period);
CREATE INDEX idx_okr_okrs_org ON okr_okrs(organization_id);
CREATE INDEX idx_okr_okrs_quarter ON okr_okrs(quarter);
CREATE INDEX idx_okr_okrs_owner ON okr_okrs(owner_id);
CREATE INDEX idx_okr_okrs_status ON okr_okrs(status);
CREATE INDEX idx_okr_csfs_org ON okr_csfs(organization_id);
CREATE INDEX idx_okr_csfs_status ON okr_csfs(status);
CREATE INDEX idx_okr_weekly_actions_week ON okr_weekly_actions(week);
CREATE INDEX idx_okr_fishbone_kpi ON okr_fishbone_items(kpi_id);
```

---

## Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE okr_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_okrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_kpis ENABLE ROW LEVEL SECURITY;

-- Example Policy: Users can only access their organization's data
CREATE POLICY "org_isolation" ON okr_objectives
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM okr_users WHERE id = auth.uid()
    )
  );

-- Apply similar policies to all tables...
```

---

## Migration Order

1. `okr_organizations`
2. `okr_departments` (without FK to users)
3. `okr_users`
4. Add FK `head_user_id` to okr_departments
5. `okr_perspective_type`
6. `okr_objectives`
7. `okr_goals`
8. `okr_strategies`
9. `okr_status_type`
10. `okr_kpis`
11. `okr_strategy_measures`
12. `okr_kpi_history`
13. `okr_department_ogsm`
14. `okr_department_measures`
15. `okr_okrs`
16. `okr_key_results`
17. `okr_csf_status_type`, `okr_priority_type`
18. `okr_csfs`
19. `okr_csf_okr_relations`
20. `okr_action_status_type`
21. `okr_fishbone_items`
22. `okr_weekly_actions`
23. `okr_review_type`
24. `okr_reviews`
25. `okr_strategy_nodes`
26. `okr_strategy_edges`

---

## Next Steps

- [ ] Create Supabase project
- [ ] Run migration SQL with new prefixes
- [ ] Seed initial data
- [ ] Generate TypeScript types with Supabase CLI
- [ ] Create API helpers
