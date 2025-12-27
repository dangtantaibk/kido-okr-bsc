-- KIDO OKR-BSC full schema + seed (okr_ prefix)
-- Run in Supabase (PostgreSQL)

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================
-- Enum Types
-- =====================
DO $$ BEGIN
  CREATE TYPE okr_perspective_type AS ENUM ('financial', 'external', 'internal', 'learning');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE okr_status_type AS ENUM ('on_track', 'at_risk', 'off_track', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE okr_csf_status_type AS ENUM ('not_started', 'in_progress', 'completed', 'blocked');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE okr_priority_type AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE okr_action_status_type AS ENUM ('pending', 'done', 'overdue');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE okr_review_type AS ENUM ('weekly', 'monthly', 'quarterly');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================
-- Tables
-- =====================
CREATE TABLE IF NOT EXISTS okr_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slogan TEXT,
  logo_url TEXT,
  fiscal_year TEXT,
  current_quarter TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS okr_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES okr_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  parent_id UUID REFERENCES okr_departments(id),
  head_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS okr_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,
  organization_id UUID REFERENCES okr_organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES okr_departments(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE okr_departments
  ADD CONSTRAINT fk_head_user
  FOREIGN KEY (head_user_id) REFERENCES okr_users(id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE okr_users ADD COLUMN IF NOT EXISTS auth_user_id UUID;

DO $$ BEGIN
  ALTER TABLE okr_users
  ADD CONSTRAINT fk_okr_users_auth_user
  FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS okr_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES okr_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  perspective okr_perspective_type NOT NULL,
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  fiscal_year TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS okr_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID REFERENCES okr_objectives(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC,
  target_unit TEXT,
  target_text TEXT,
  current_value NUMERIC DEFAULT 0,
  owner_id UUID REFERENCES okr_users(id),
  progress NUMERIC DEFAULT 0,
  due_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS okr_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES okr_goals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS okr_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES okr_organizations(id) ON DELETE CASCADE,
  fiscal_year TEXT DEFAULT TO_CHAR(NOW(), 'YYYY'),
  name TEXT NOT NULL,
  description TEXT,
  perspective okr_perspective_type NOT NULL,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT NOT NULL,
  status okr_status_type DEFAULT 'on_track',
  trend TEXT DEFAULT 'stable',
  owner_id UUID REFERENCES okr_users(id),
  department_id UUID REFERENCES okr_departments(id),
  measurement_frequency TEXT DEFAULT 'monthly',
  linked_goal_id UUID REFERENCES okr_goals(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS okr_strategy_measures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID REFERENCES okr_strategies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kpi_id UUID REFERENCES okr_kpis(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS okr_kpi_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id UUID REFERENCES okr_kpis(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  value NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(kpi_id, period)
);

CREATE TABLE IF NOT EXISTS okr_department_ogsm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES okr_departments(id) ON DELETE CASCADE,
  linked_goal_id UUID REFERENCES okr_goals(id),
  purpose TEXT,
  objective TEXT NOT NULL,
  strategy TEXT,
  owner_id UUID REFERENCES okr_users(id),
  progress NUMERIC DEFAULT 0,
  fiscal_year TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS okr_department_measures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dept_ogsm_id UUID REFERENCES okr_department_ogsm(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kpi_id UUID REFERENCES okr_kpis(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS okr_okrs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES okr_organizations(id) ON DELETE CASCADE,
  objective TEXT NOT NULL,
  perspective okr_perspective_type NOT NULL,
  fiscal_year TEXT DEFAULT TO_CHAR(NOW(), 'YYYY'),
  quarter TEXT NOT NULL,
  status okr_status_type DEFAULT 'on_track',
  progress NUMERIC DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  owner_id UUID REFERENCES okr_users(id),
  department_id UUID REFERENCES okr_departments(id),
  linked_goal_id UUID REFERENCES okr_goals(id),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE okr_okrs
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS okr_key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  okr_id UUID REFERENCES okr_okrs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  weight NUMERIC DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS okr_csfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES okr_organizations(id) ON DELETE CASCADE,
  fiscal_year TEXT DEFAULT TO_CHAR(NOW(), 'YYYY'),
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

CREATE TABLE IF NOT EXISTS okr_csf_okr_relations (
  csf_id UUID REFERENCES okr_csfs(id) ON DELETE CASCADE,
  okr_id UUID REFERENCES okr_okrs(id) ON DELETE CASCADE,
  PRIMARY KEY (csf_id, okr_id)
);

CREATE TABLE IF NOT EXISTS okr_fishbone_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES okr_organizations(id) ON DELETE CASCADE,
  kpi_id UUID REFERENCES okr_kpis(id),
  factor TEXT NOT NULL,
  problem TEXT NOT NULL,
  action TEXT NOT NULL,
  owner_id UUID REFERENCES okr_users(id),
  deadline TEXT,
  expected_result TEXT,
  actual_result TEXT,
  status okr_action_status_type DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS okr_weekly_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES okr_organizations(id) ON DELETE CASCADE,
  week TEXT NOT NULL,
  linked_goal_id UUID REFERENCES okr_goals(id),
  linked_kpi_id UUID REFERENCES okr_kpis(id),
  solution TEXT,
  activity TEXT NOT NULL,
  owner_id UUID REFERENCES okr_users(id),
  status okr_action_status_type DEFAULT 'pending',
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS okr_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES okr_organizations(id) ON DELETE CASCADE,
  type okr_review_type NOT NULL,
  title TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  department_id UUID REFERENCES okr_departments(id),
  facilitator_id UUID REFERENCES okr_users(id),
  checklist JSONB,
  participants JSONB,
  duration_minutes INTEGER,
  notes TEXT,
  action_items JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS okr_strategy_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES okr_organizations(id) ON DELETE CASCADE,
  fiscal_year TEXT DEFAULT TO_CHAR(NOW(), 'YYYY'),
  label TEXT NOT NULL,
  category okr_perspective_type NOT NULL,
  code TEXT,
  linked_goal_id UUID REFERENCES okr_goals(id),
  position_x NUMERIC,
  position_y NUMERIC,
  status okr_status_type DEFAULT 'on_track',
  progress NUMERIC DEFAULT 0,
  owner_id UUID REFERENCES okr_users(id),
  goals_data JSONB,
  strategies_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS okr_strategy_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id UUID REFERENCES okr_strategy_nodes(id) ON DELETE CASCADE,
  target_node_id UUID REFERENCES okr_strategy_nodes(id) ON DELETE CASCADE,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- Seed Data (IDs generated by database)
-- =====================
INSERT INTO okr_organizations (name, slogan, fiscal_year, current_quarter)
SELECT 'KIDO Group', 'Tập đoàn FMCG hàng đầu Việt Nam', '2024', 'Q4 2024'
WHERE NOT EXISTS (
  SELECT 1 FROM okr_organizations WHERE name = 'KIDO Group'
);

-- Departments
INSERT INTO okr_departments (organization_id, name, code)
SELECT o.id, 'Sales GT', 'SALES_GT'
FROM okr_organizations o
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_departments WHERE code = 'SALES_GT');

INSERT INTO okr_departments (organization_id, name, code)
SELECT o.id, 'Sales MT', 'SALES_MT'
FROM okr_organizations o
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_departments WHERE code = 'SALES_MT');

INSERT INTO okr_departments (organization_id, name, code)
SELECT o.id, 'Marketing', 'MARKETING'
FROM okr_organizations o
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_departments WHERE code = 'MARKETING');

INSERT INTO okr_departments (organization_id, name, code)
SELECT o.id, 'R&D', 'RND'
FROM okr_organizations o
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_departments WHERE code = 'RND');

INSERT INTO okr_departments (organization_id, name, code)
SELECT o.id, 'Operations', 'OPS'
FROM okr_organizations o
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_departments WHERE code = 'OPS');

INSERT INTO okr_departments (organization_id, name, code)
SELECT o.id, 'Supply Chain', 'SCM'
FROM okr_organizations o
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_departments WHERE code = 'SCM');

INSERT INTO okr_departments (organization_id, name, code)
SELECT o.id, 'Technology', 'TECH'
FROM okr_organizations o
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_departments WHERE code = 'TECH');

INSERT INTO okr_departments (organization_id, name, code)
SELECT o.id, 'HR', 'HR'
FROM okr_organizations o
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_departments WHERE code = 'HR');

INSERT INTO okr_departments (organization_id, name, code)
SELECT o.id, 'Finance', 'FIN'
FROM okr_organizations o
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_departments WHERE code = 'FIN');

-- Users
INSERT INTO okr_users (organization_id, department_id, email, full_name, role)
SELECT o.id, NULL, 'ceo@kido.vn', 'Nguyễn Văn An', 'CEO'
FROM okr_organizations o
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_users WHERE email = 'ceo@kido.vn');

INSERT INTO okr_users (organization_id, department_id, email, full_name, role)
SELECT o.id, d.id, 'cfo@kido.vn', 'Trần Thị Mai', 'CFO'
FROM okr_organizations o
JOIN okr_departments d ON d.code = 'FIN'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_users WHERE email = 'cfo@kido.vn');

INSERT INTO okr_users (organization_id, department_id, email, full_name, role)
SELECT o.id, d.id, 'coo@kido.vn', 'Lê Hoàng Nam', 'COO'
FROM okr_organizations o
JOIN okr_departments d ON d.code = 'OPS'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_users WHERE email = 'coo@kido.vn');

INSERT INTO okr_users (organization_id, department_id, email, full_name, role)
SELECT o.id, d.id, 'cmo@kido.vn', 'Phạm Thị Hoa', 'CMO'
FROM okr_organizations o
JOIN okr_departments d ON d.code = 'MARKETING'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_users WHERE email = 'cmo@kido.vn');

INSERT INTO okr_users (organization_id, department_id, email, full_name, role)
SELECT o.id, d.id, 'cto@kido.vn', 'Võ Minh Tuấn', 'CTO'
FROM okr_organizations o
JOIN okr_departments d ON d.code = 'TECH'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_users WHERE email = 'cto@kido.vn');

INSERT INTO okr_users (organization_id, department_id, email, full_name, role)
SELECT o.id, d.id, 'hr@kido.vn', 'Nguyễn Thị Lan', 'HRD'
FROM okr_organizations o
JOIN okr_departments d ON d.code = 'HR'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_users WHERE email = 'hr@kido.vn');

INSERT INTO okr_users (organization_id, department_id, email, full_name, role)
SELECT o.id, d.id, 'sales@kido.vn', 'Trương Minh Khang', 'Director'
FROM okr_organizations o
JOIN okr_departments d ON d.code = 'SALES_GT'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_users WHERE email = 'sales@kido.vn');

-- Department heads
UPDATE okr_departments SET head_user_id = (SELECT id FROM okr_users WHERE email = 'sales@kido.vn') WHERE code = 'SALES_GT';
UPDATE okr_departments SET head_user_id = (SELECT id FROM okr_users WHERE email = 'sales@kido.vn') WHERE code = 'SALES_MT';
UPDATE okr_departments SET head_user_id = (SELECT id FROM okr_users WHERE email = 'cmo@kido.vn') WHERE code = 'MARKETING';
UPDATE okr_departments SET head_user_id = (SELECT id FROM okr_users WHERE email = 'cmo@kido.vn') WHERE code = 'RND';
UPDATE okr_departments SET head_user_id = (SELECT id FROM okr_users WHERE email = 'coo@kido.vn') WHERE code = 'OPS';
UPDATE okr_departments SET head_user_id = (SELECT id FROM okr_users WHERE email = 'coo@kido.vn') WHERE code = 'SCM';
UPDATE okr_departments SET head_user_id = (SELECT id FROM okr_users WHERE email = 'cto@kido.vn') WHERE code = 'TECH';
UPDATE okr_departments SET head_user_id = (SELECT id FROM okr_users WHERE email = 'hr@kido.vn') WHERE code = 'HR';
UPDATE okr_departments SET head_user_id = (SELECT id FROM okr_users WHERE email = 'cfo@kido.vn') WHERE code = 'FIN';

-- Objectives
INSERT INTO okr_objectives (organization_id, name, description, perspective, fiscal_year)
SELECT o.id, 'Tăng trưởng bền vững', 'Tăng trưởng doanh thu và thị phần', 'financial', '2024'
FROM okr_organizations o
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_objectives WHERE name = 'Tăng trưởng bền vững');

INSERT INTO okr_objectives (organization_id, name, description, perspective, fiscal_year)
SELECT o.id, 'Trải nghiệm khách hàng', 'Nâng cao sự hài lòng và lòng trung thành', 'external', '2024'
FROM okr_organizations o
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_objectives WHERE name = 'Trải nghiệm khách hàng');

INSERT INTO okr_objectives (organization_id, name, description, perspective, fiscal_year)
SELECT o.id, 'Tối ưu vận hành', 'Hiệu quả chi phí và quy trình', 'internal', '2024'
FROM okr_organizations o
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_objectives WHERE name = 'Tối ưu vận hành');

INSERT INTO okr_objectives (organization_id, name, description, perspective, fiscal_year)
SELECT o.id, 'Phát triển đội ngũ', 'Nâng cao năng lực và gắn kết', 'learning', '2024'
FROM okr_organizations o
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_objectives WHERE name = 'Phát triển đội ngũ');

-- Goals
INSERT INTO okr_goals (objective_id, name, target_text, owner_id, progress)
SELECT obj.id, 'Tăng trưởng doanh thu', '+30%', u.id, 72
FROM okr_objectives obj
JOIN okr_users u ON u.email = 'ceo@kido.vn'
WHERE obj.name = 'Tăng trưởng bền vững'
  AND NOT EXISTS (SELECT 1 FROM okr_goals WHERE name = 'Tăng trưởng doanh thu');

INSERT INTO okr_goals (objective_id, name, target_text, owner_id, progress)
SELECT obj.id, 'Tối ưu chi phí (Cost Efficiency)', '-5%', u.id, 78
FROM okr_objectives obj
JOIN okr_users u ON u.email = 'cfo@kido.vn'
WHERE obj.name = 'Tăng trưởng bền vững'
  AND NOT EXISTS (SELECT 1 FROM okr_goals WHERE name = 'Tối ưu chi phí (Cost Efficiency)');

INSERT INTO okr_goals (objective_id, name, target_text, owner_id, progress)
SELECT obj.id, 'Mở rộng thị phần', '+10%', u.id, 85
FROM okr_objectives obj
JOIN okr_users u ON u.email = 'sales@kido.vn'
WHERE obj.name = 'Trải nghiệm khách hàng'
  AND NOT EXISTS (SELECT 1 FROM okr_goals WHERE name = 'Mở rộng thị phần');

INSERT INTO okr_goals (objective_id, name, target_text, owner_id, progress)
SELECT obj.id, 'Phát triển sản phẩm mới', '+10%', u.id, 65
FROM okr_objectives obj
JOIN okr_users u ON u.email = 'cmo@kido.vn'
WHERE obj.name = 'Trải nghiệm khách hàng'
  AND NOT EXISTS (SELECT 1 FROM okr_goals WHERE name = 'Phát triển sản phẩm mới');

INSERT INTO okr_goals (objective_id, name, target_text, owner_id, progress)
SELECT obj.id, 'Chuyển đổi số & Tự động hóa', '100% quy trình', u.id, 45
FROM okr_objectives obj
JOIN okr_users u ON u.email = 'cto@kido.vn'
WHERE obj.name = 'Tối ưu vận hành'
  AND NOT EXISTS (SELECT 1 FROM okr_goals WHERE name = 'Chuyển đổi số & Tự động hóa');

INSERT INTO okr_goals (objective_id, name, target_text, owner_id, progress)
SELECT obj.id, 'Đào tạo & Phát triển', '50h/người/năm', u.id, 82
FROM okr_objectives obj
JOIN okr_users u ON u.email = 'hr@kido.vn'
WHERE obj.name = 'Phát triển đội ngũ'
  AND NOT EXISTS (SELECT 1 FROM okr_goals WHERE name = 'Đào tạo & Phát triển');

-- Strategies
INSERT INTO okr_strategies (goal_id, name)
SELECT g.id, 'Tăng độ phủ, forecast chuẩn'
FROM okr_goals g
WHERE g.name = 'Mở rộng thị phần'
  AND NOT EXISTS (SELECT 1 FROM okr_strategies WHERE name = 'Tăng độ phủ, forecast chuẩn');

INSERT INTO okr_strategies (goal_id, name)
SELECT g.id, 'Push NPD'
FROM okr_goals g
WHERE g.name = 'Phát triển sản phẩm mới'
  AND NOT EXISTS (SELECT 1 FROM okr_strategies WHERE name = 'Push NPD');

INSERT INTO okr_strategies (goal_id, name)
SELECT g.id, 'Mở rộng kênh online & xuất khẩu'
FROM okr_goals g
WHERE g.name = 'Chuyển đổi số & Tự động hóa'
  AND NOT EXISTS (SELECT 1 FROM okr_strategies WHERE name = 'Mở rộng kênh online & xuất khẩu');

INSERT INTO okr_strategies (goal_id, name)
SELECT g.id, 'Tối ưu chi phí sản xuất'
FROM okr_goals g
WHERE g.name = 'Tối ưu chi phí (Cost Efficiency)'
  AND NOT EXISTS (SELECT 1 FROM okr_strategies WHERE name = 'Tối ưu chi phí sản xuất');

-- KPIs
INSERT INTO okr_kpis (organization_id, name, perspective, target_value, current_value, unit, status, trend, linked_goal_id)
SELECT o.id, 'Doanh thu', 'financial', 8000, 6200, 'tỷ VND', 'at_risk', 'up', g.id
FROM okr_organizations o
JOIN okr_goals g ON g.name = 'Tăng trưởng doanh thu'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_kpis WHERE name = 'Doanh thu');

INSERT INTO okr_kpis (organization_id, name, perspective, target_value, current_value, unit, status, trend, linked_goal_id)
SELECT o.id, 'Biên lợi nhuận gộp', 'financial', 26, 26.5, '%', 'on_track', 'up', g.id
FROM okr_organizations o
JOIN okr_goals g ON g.name = 'Tối ưu chi phí (Cost Efficiency)'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_kpis WHERE name = 'Biên lợi nhuận gộp');

INSERT INTO okr_kpis (organization_id, name, perspective, target_value, current_value, unit, status, trend, linked_goal_id)
SELECT o.id, 'EBITDA', 'financial', 800, 720, 'tỷ VND', 'on_track', 'up', g.id
FROM okr_organizations o
JOIN okr_goals g ON g.name = 'Tối ưu chi phí (Cost Efficiency)'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_kpis WHERE name = 'EBITDA');

INSERT INTO okr_kpis (organization_id, name, perspective, target_value, current_value, unit, status, trend, linked_goal_id)
SELECT o.id, 'Thị phần ngành kem', 'external', 45, 43, '%', 'at_risk', 'stable', g.id
FROM okr_organizations o
JOIN okr_goals g ON g.name = 'Mở rộng thị phần'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_kpis WHERE name = 'Thị phần ngành kem');

INSERT INTO okr_kpis (organization_id, name, perspective, target_value, current_value, unit, status, trend, linked_goal_id)
SELECT o.id, 'Điểm NPS', 'external', 70, 68, 'điểm', 'on_track', 'up', g.id
FROM okr_organizations o
JOIN okr_goals g ON g.name = 'Phát triển sản phẩm mới'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_kpis WHERE name = 'Điểm NPS');

INSERT INTO okr_kpis (organization_id, name, perspective, target_value, current_value, unit, status, trend, linked_goal_id)
SELECT o.id, 'Tỷ lệ hài lòng khách hàng', 'external', 92, 90, '%', 'on_track', 'up', g.id
FROM okr_organizations o
JOIN okr_goals g ON g.name = 'Phát triển sản phẩm mới'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_kpis WHERE name = 'Tỷ lệ hài lòng khách hàng');

INSERT INTO okr_kpis (organization_id, name, perspective, target_value, current_value, unit, status, trend, linked_goal_id)
SELECT o.id, 'Hiệu suất sản xuất (OEE)', 'internal', 85, 82, '%', 'on_track', 'up', g.id
FROM okr_organizations o
JOIN okr_goals g ON g.name = 'Chuyển đổi số & Tự động hóa'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_kpis WHERE name = 'Hiệu suất sản xuất (OEE)');

INSERT INTO okr_kpis (organization_id, name, perspective, target_value, current_value, unit, status, trend, linked_goal_id)
SELECT o.id, 'Tỷ lệ sản phẩm đạt chuẩn', 'internal', 98, 97.5, '%', 'on_track', 'stable', g.id
FROM okr_organizations o
JOIN okr_goals g ON g.name = 'Chuyển đổi số & Tự động hóa'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_kpis WHERE name = 'Tỷ lệ sản phẩm đạt chuẩn');

INSERT INTO okr_kpis (organization_id, name, perspective, target_value, current_value, unit, status, trend, linked_goal_id)
SELECT o.id, 'Số hóa quy trình', 'internal', 80, 55, '%', 'off_track', 'up', g.id
FROM okr_organizations o
JOIN okr_goals g ON g.name = 'Chuyển đổi số & Tự động hóa'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_kpis WHERE name = 'Số hóa quy trình');

INSERT INTO okr_kpis (organization_id, name, perspective, target_value, current_value, unit, status, trend, linked_goal_id)
SELECT o.id, 'Số nhân sự được đào tạo', 'learning', 500, 420, 'người', 'on_track', 'up', g.id
FROM okr_organizations o
JOIN okr_goals g ON g.name = 'Đào tạo & Phát triển'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_kpis WHERE name = 'Số nhân sự được đào tạo');

INSERT INTO okr_kpis (organization_id, name, perspective, target_value, current_value, unit, status, trend, linked_goal_id)
SELECT o.id, 'Tỷ lệ giữ chân nhân tài', 'learning', 90, 88, '%', 'on_track', 'stable', g.id
FROM okr_organizations o
JOIN okr_goals g ON g.name = 'Đào tạo & Phát triển'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_kpis WHERE name = 'Tỷ lệ giữ chân nhân tài');

INSERT INTO okr_kpis (organization_id, name, perspective, target_value, current_value, unit, status, trend, linked_goal_id)
SELECT o.id, 'Sản phẩm mới ra mắt', 'learning', 5, 4, 'sản phẩm', 'on_track', 'up', g.id
FROM okr_organizations o
JOIN okr_goals g ON g.name = 'Phát triển sản phẩm mới'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_kpis WHERE name = 'Sản phẩm mới ra mắt');

-- Strategy Measures
INSERT INTO okr_strategy_measures (strategy_id, name, kpi_id)
SELECT s.id, 'Doanh thu', k.id
FROM okr_strategies s
JOIN okr_kpis k ON k.name = 'Doanh thu'
WHERE s.name = 'Tăng độ phủ, forecast chuẩn';

INSERT INTO okr_strategy_measures (strategy_id, name, kpi_id)
SELECT s.id, 'OOS rate', k.id
FROM okr_strategies s
JOIN okr_kpis k ON k.name = 'Thị phần ngành kem'
WHERE s.name = 'Tăng độ phủ, forecast chuẩn';

INSERT INTO okr_strategy_measures (strategy_id, name, kpi_id)
SELECT s.id, 'Sell-out NPD', k.id
FROM okr_strategies s
JOIN okr_kpis k ON k.name = 'Sản phẩm mới ra mắt'
WHERE s.name = 'Push NPD';

INSERT INTO okr_strategy_measures (strategy_id, name, kpi_id)
SELECT s.id, 'Doanh thu online', k.id
FROM okr_strategies s
JOIN okr_kpis k ON k.name = 'Số hóa quy trình'
WHERE s.name = 'Mở rộng kênh online & xuất khẩu';

INSERT INTO okr_strategy_measures (strategy_id, name, kpi_id)
SELECT s.id, 'Chi phí/đơn vị', k.id
FROM okr_strategies s
JOIN okr_kpis k ON k.name = 'Biên lợi nhuận gộp'
WHERE s.name = 'Tối ưu chi phí sản xuất';

INSERT INTO okr_strategy_measures (strategy_id, name, kpi_id)
SELECT s.id, 'Hiệu suất nhà máy', k.id
FROM okr_strategies s
JOIN okr_kpis k ON k.name = 'Hiệu suất sản xuất (OEE)'
WHERE s.name = 'Tối ưu chi phí sản xuất';

-- KPI History
INSERT INTO okr_kpi_history (kpi_id, period, value)
VALUES
  ((SELECT id FROM okr_kpis WHERE name = 'Doanh thu' LIMIT 1), 'T1', 520),
  ((SELECT id FROM okr_kpis WHERE name = 'Doanh thu' LIMIT 1), 'T2', 480),
  ((SELECT id FROM okr_kpis WHERE name = 'Doanh thu' LIMIT 1), 'T3', 610),
  ((SELECT id FROM okr_kpis WHERE name = 'Doanh thu' LIMIT 1), 'T4', 580),
  ((SELECT id FROM okr_kpis WHERE name = 'Doanh thu' LIMIT 1), 'T5', 650),
  ((SELECT id FROM okr_kpis WHERE name = 'Doanh thu' LIMIT 1), 'T6', 720),
  ((SELECT id FROM okr_kpis WHERE name = 'Doanh thu' LIMIT 1), 'T7', 680),
  ((SELECT id FROM okr_kpis WHERE name = 'Doanh thu' LIMIT 1), 'T8', 590),
  ((SELECT id FROM okr_kpis WHERE name = 'Doanh thu' LIMIT 1), 'T9', 640),
  ((SELECT id FROM okr_kpis WHERE name = 'Doanh thu' LIMIT 1), 'T10', 730)
ON CONFLICT (kpi_id, period) DO NOTHING;

-- Department OGSM
INSERT INTO okr_department_ogsm (department_id, linked_goal_id, purpose, objective, strategy, owner_id, progress, fiscal_year)
SELECT d.id, g.id, 'Tăng trưởng', '+10%', 'Tăng độ phủ, forecast chuẩn', u.id, 85, '2024'
FROM okr_departments d
JOIN okr_goals g ON g.name = 'Tăng trưởng doanh thu'
JOIN okr_users u ON u.email = 'sales@kido.vn'
WHERE d.code = 'SALES_GT';

INSERT INTO okr_department_ogsm (department_id, linked_goal_id, purpose, objective, strategy, owner_id, progress, fiscal_year)
SELECT d.id, g.id, 'Tăng trưởng', '+15%', 'Đẩy mạnh promotions', u.id, 78, '2024'
FROM okr_departments d
JOIN okr_goals g ON g.name = 'Mở rộng thị phần'
JOIN okr_users u ON u.email = 'sales@kido.vn'
WHERE d.code = 'SALES_MT';

INSERT INTO okr_department_ogsm (department_id, linked_goal_id, purpose, objective, strategy, owner_id, progress, fiscal_year)
SELECT d.id, g.id, 'NPD', '+10%', 'Push NPD', u.id, 65, '2024'
FROM okr_departments d
JOIN okr_goals g ON g.name = 'Phát triển sản phẩm mới'
JOIN okr_users u ON u.email = 'cmo@kido.vn'
WHERE d.code = 'MARKETING';

INSERT INTO okr_department_ogsm (department_id, linked_goal_id, purpose, objective, strategy, owner_id, progress, fiscal_year)
SELECT d.id, g.id, 'NPD', '5 sản phẩm mới', 'Innovation pipeline', u.id, 80, '2024'
FROM okr_departments d
JOIN okr_goals g ON g.name = 'Phát triển sản phẩm mới'
JOIN okr_users u ON u.email = 'cmo@kido.vn'
WHERE d.code = 'RND';

INSERT INTO okr_department_ogsm (department_id, linked_goal_id, purpose, objective, strategy, owner_id, progress, fiscal_year)
SELECT d.id, g.id, 'Chi phí', '-5%', 'Lean manufacturing', u.id, 72, '2024'
FROM okr_departments d
JOIN okr_goals g ON g.name = 'Tối ưu chi phí (Cost Efficiency)'
JOIN okr_users u ON u.email = 'coo@kido.vn'
WHERE d.code = 'OPS';

INSERT INTO okr_department_ogsm (department_id, linked_goal_id, purpose, objective, strategy, owner_id, progress, fiscal_year)
SELECT d.id, g.id, 'Chi phí', '-3%', 'Tối ưu logistics', u.id, 68, '2024'
FROM okr_departments d
JOIN okr_goals g ON g.name = 'Tối ưu chi phí (Cost Efficiency)'
JOIN okr_users u ON u.email = 'coo@kido.vn'
WHERE d.code = 'SCM';

INSERT INTO okr_department_ogsm (department_id, linked_goal_id, purpose, objective, strategy, owner_id, progress, fiscal_year)
SELECT d.id, g.id, 'Hệ thống', '100% ERP', 'SAP Rollout', u.id, 45, '2024'
FROM okr_departments d
JOIN okr_goals g ON g.name = 'Chuyển đổi số & Tự động hóa'
JOIN okr_users u ON u.email = 'cto@kido.vn'
WHERE d.code = 'TECH';

INSERT INTO okr_department_ogsm (department_id, linked_goal_id, purpose, objective, strategy, owner_id, progress, fiscal_year)
SELECT d.id, g.id, 'Nhân sự', 'Đào tạo', 'Skill matrix', u.id, 82, '2024'
FROM okr_departments d
JOIN okr_goals g ON g.name = 'Đào tạo & Phát triển'
JOIN okr_users u ON u.email = 'hr@kido.vn'
WHERE d.code = 'HR';

-- Department Measures
INSERT INTO okr_department_measures (dept_ogsm_id, name, kpi_id)
SELECT o.id, 'Doanh thu', k.id
FROM okr_department_ogsm o
JOIN okr_departments d ON d.id = o.department_id
JOIN okr_kpis k ON k.name = 'Doanh thu'
WHERE d.code = 'SALES_GT';

INSERT INTO okr_department_measures (dept_ogsm_id, name, kpi_id)
SELECT o.id, 'Thị phần', k.id
FROM okr_department_ogsm o
JOIN okr_departments d ON d.id = o.department_id
JOIN okr_kpis k ON k.name = 'Thị phần ngành kem'
WHERE d.code = 'SALES_MT';

INSERT INTO okr_department_measures (dept_ogsm_id, name, kpi_id)
SELECT o.id, 'NPS', k.id
FROM okr_department_ogsm o
JOIN okr_departments d ON d.id = o.department_id
JOIN okr_kpis k ON k.name = 'Điểm NPS'
WHERE d.code = 'MARKETING';

INSERT INTO okr_department_measures (dept_ogsm_id, name, kpi_id)
SELECT o.id, 'NPD', k.id
FROM okr_department_ogsm o
JOIN okr_departments d ON d.id = o.department_id
JOIN okr_kpis k ON k.name = 'Sản phẩm mới ra mắt'
WHERE d.code = 'RND';

INSERT INTO okr_department_measures (dept_ogsm_id, name, kpi_id)
SELECT o.id, 'OEE', k.id
FROM okr_department_ogsm o
JOIN okr_departments d ON d.id = o.department_id
JOIN okr_kpis k ON k.name = 'Hiệu suất sản xuất (OEE)'
WHERE d.code = 'OPS';

INSERT INTO okr_department_measures (dept_ogsm_id, name, kpi_id)
SELECT o.id, 'Số hóa', k.id
FROM okr_department_ogsm o
JOIN okr_departments d ON d.id = o.department_id
JOIN okr_kpis k ON k.name = 'Số hóa quy trình'
WHERE d.code = 'TECH';

INSERT INTO okr_department_measures (dept_ogsm_id, name, kpi_id)
SELECT o.id, 'Đào tạo', k.id
FROM okr_department_ogsm o
JOIN okr_departments d ON d.id = o.department_id
JOIN okr_kpis k ON k.name = 'Số nhân sự được đào tạo'
WHERE d.code = 'HR';

-- OKRs
INSERT INTO okr_okrs (organization_id, objective, perspective, quarter, status, progress, owner_id, linked_goal_id, due_date)
SELECT o.id, 'Tăng trưởng doanh thu 15% so với năm trước', 'financial', 'Q4 2024', 'at_risk', 72, u.id, g.id, '2024-12-31'
FROM okr_organizations o
JOIN okr_users u ON u.email = 'cfo@kido.vn'
JOIN okr_goals g ON g.name = 'Tăng trưởng doanh thu'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_okrs WHERE objective = 'Tăng trưởng doanh thu 15% so với năm trước' AND quarter = 'Q4 2024');

INSERT INTO okr_okrs (organization_id, objective, perspective, quarter, status, progress, owner_id, linked_goal_id, due_date)
SELECT o.id, 'Tối ưu hóa biên lợi nhuận gộp đạt 26%', 'financial', 'Q4 2024', 'on_track', 95, u.id, g.id, '2024-12-31'
FROM okr_organizations o
JOIN okr_users u ON u.email = 'cfo@kido.vn'
JOIN okr_goals g ON g.name = 'Tối ưu chi phí (Cost Efficiency)'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_okrs WHERE objective = 'Tối ưu hóa biên lợi nhuận gộp đạt 26%' AND quarter = 'Q4 2024');

INSERT INTO okr_okrs (organization_id, objective, perspective, quarter, status, progress, owner_id, linked_goal_id, due_date)
SELECT o.id, 'Nâng cao trải nghiệm và độ hài lòng khách hàng', 'external', 'Q4 2024', 'on_track', 88, u.id, g.id, '2024-12-31'
FROM okr_organizations o
JOIN okr_users u ON u.email = 'cmo@kido.vn'
JOIN okr_goals g ON g.name = 'Phát triển sản phẩm mới'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_okrs WHERE objective = 'Nâng cao trải nghiệm và độ hài lòng khách hàng' AND quarter = 'Q4 2024');

INSERT INTO okr_okrs (organization_id, objective, perspective, quarter, status, progress, owner_id, linked_goal_id, due_date)
SELECT o.id, 'Mở rộng thị phần ngành kem lên 45%', 'external', 'Q4 2024', 'at_risk', 78, u.id, g.id, '2024-12-31'
FROM okr_organizations o
JOIN okr_users u ON u.email = 'cmo@kido.vn'
JOIN okr_goals g ON g.name = 'Mở rộng thị phần'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_okrs WHERE objective = 'Mở rộng thị phần ngành kem lên 45%' AND quarter = 'Q4 2024');

INSERT INTO okr_okrs (organization_id, objective, perspective, quarter, status, progress, owner_id, linked_goal_id, due_date)
SELECT o.id, 'Nâng cao hiệu suất và chất lượng sản xuất', 'internal', 'Q4 2024', 'on_track', 85, u.id, g.id, '2024-12-31'
FROM okr_organizations o
JOIN okr_users u ON u.email = 'coo@kido.vn'
JOIN okr_goals g ON g.name = 'Chuyển đổi số & Tự động hóa'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_okrs WHERE objective = 'Nâng cao hiệu suất và chất lượng sản xuất' AND quarter = 'Q4 2024');

INSERT INTO okr_okrs (organization_id, objective, perspective, quarter, status, progress, owner_id, linked_goal_id, due_date)
SELECT o.id, 'Chuyển đổi số quy trình vận hành', 'internal', 'Q4 2024', 'at_risk', 65, u.id, g.id, '2024-12-31'
FROM okr_organizations o
JOIN okr_users u ON u.email = 'cto@kido.vn'
JOIN okr_goals g ON g.name = 'Chuyển đổi số & Tự động hóa'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_okrs WHERE objective = 'Chuyển đổi số quy trình vận hành' AND quarter = 'Q4 2024');

INSERT INTO okr_okrs (organization_id, objective, perspective, quarter, status, progress, owner_id, linked_goal_id, due_date)
SELECT o.id, 'Phát triển năng lực đội ngũ nhân sự', 'learning', 'Q4 2024', 'on_track', 82, u.id, g.id, '2024-12-31'
FROM okr_organizations o
JOIN okr_users u ON u.email = 'hr@kido.vn'
JOIN okr_goals g ON g.name = 'Đào tạo & Phát triển'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_okrs WHERE objective = 'Phát triển năng lực đội ngũ nhân sự' AND quarter = 'Q4 2024');

INSERT INTO okr_okrs (organization_id, objective, perspective, quarter, status, progress, owner_id, linked_goal_id, due_date)
SELECT o.id, 'Đẩy mạnh nghiên cứu và phát triển sản phẩm', 'learning', 'Q4 2024', 'on_track', 75, u.id, g.id, '2024-12-31'
FROM okr_organizations o
JOIN okr_users u ON u.email = 'cmo@kido.vn'
JOIN okr_goals g ON g.name = 'Phát triển sản phẩm mới'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_okrs WHERE objective = 'Đẩy mạnh nghiên cứu và phát triển sản phẩm' AND quarter = 'Q4 2024');

-- Key Results
INSERT INTO okr_key_results (okr_id, title, target_value, current_value, unit, weight)
SELECT okr.id, 'Đạt 8,000 tỷ VND doanh thu', 8000, 6200, 'tỷ VND', 0.4
FROM okr_okrs okr
WHERE okr.objective = 'Tăng trưởng doanh thu 15% so với năm trước';

INSERT INTO okr_key_results (okr_id, title, target_value, current_value, unit, weight)
SELECT okr.id, 'Mở rộng 50 đại lý phân phối mới', 50, 38, 'đại lý', 0.3
FROM okr_okrs okr
WHERE okr.objective = 'Tăng trưởng doanh thu 15% so với năm trước';

INSERT INTO okr_key_results (okr_id, title, target_value, current_value, unit, weight)
SELECT okr.id, 'Tăng doanh thu online 30%', 30, 25, '%', 0.3
FROM okr_okrs okr
WHERE okr.objective = 'Tăng trưởng doanh thu 15% so với năm trước';

INSERT INTO okr_key_results (okr_id, title, target_value, current_value, unit, weight)
SELECT okr.id, 'Giảm chi phí nguyên liệu 5%', 5, 4.8, '%', 0.5
FROM okr_okrs okr
WHERE okr.objective = 'Tối ưu hóa biên lợi nhuận gộp đạt 26%';

INSERT INTO okr_key_results (okr_id, title, target_value, current_value, unit, weight)
SELECT okr.id, 'Tăng hiệu quả sản xuất 10%', 10, 9.5, '%', 0.5
FROM okr_okrs okr
WHERE okr.objective = 'Tối ưu hóa biên lợi nhuận gộp đạt 26%';

INSERT INTO okr_key_results (okr_id, title, target_value, current_value, unit, weight)
SELECT okr.id, 'Đạt NPS 70+', 70, 68, 'điểm', 0.4
FROM okr_okrs okr
WHERE okr.objective = 'Nâng cao trải nghiệm và độ hài lòng khách hàng';

INSERT INTO okr_key_results (okr_id, title, target_value, current_value, unit, weight)
SELECT okr.id, 'Giảm thời gian phản hồi xuống <2h', 2, 1.8, 'giờ', 0.3
FROM okr_okrs okr
WHERE okr.objective = 'Nâng cao trải nghiệm và độ hài lòng khách hàng';

INSERT INTO okr_key_results (okr_id, title, target_value, current_value, unit, weight)
SELECT okr.id, 'Tỷ lệ hài lòng đạt 92%', 92, 90, '%', 0.3
FROM okr_okrs okr
WHERE okr.objective = 'Nâng cao trải nghiệm và độ hài lòng khách hàng';

INSERT INTO okr_key_results (okr_id, title, target_value, current_value, unit, weight)
SELECT okr.id, 'Tăng thị phần kem lên 45%', 45, 43, '%', 0.6
FROM okr_okrs okr
WHERE okr.objective = 'Mở rộng thị phần ngành kem lên 45%';

INSERT INTO okr_key_results (okr_id, title, target_value, current_value, unit, weight)
SELECT okr.id, 'Ra mắt 3 hương vị kem mới', 3, 2, 'sản phẩm', 0.4
FROM okr_okrs okr
WHERE okr.objective = 'Mở rộng thị phần ngành kem lên 45%';

INSERT INTO okr_key_results (okr_id, title, target_value, current_value, unit, weight)
SELECT okr.id, 'Đạt 98% sản phẩm đạt chuẩn', 98, 97.5, '%', 0.5
FROM okr_okrs okr
WHERE okr.objective = 'Nâng cao hiệu suất và chất lượng sản xuất';

INSERT INTO okr_key_results (okr_id, title, target_value, current_value, unit, weight)
SELECT okr.id, 'Tăng OEE lên 85%', 85, 82, '%', 0.5
FROM okr_okrs okr
WHERE okr.objective = 'Nâng cao hiệu suất và chất lượng sản xuất';

INSERT INTO okr_key_results (okr_id, title, target_value, current_value, unit, weight)
SELECT okr.id, 'Triển khai ERP cho 100% nhà máy', 100, 70, '%', 0.5
FROM okr_okrs okr
WHERE okr.objective = 'Chuyển đổi số quy trình vận hành';

INSERT INTO okr_key_results (okr_id, title, target_value, current_value, unit, weight)
SELECT okr.id, 'Số hóa 80% quy trình', 80, 55, '%', 0.5
FROM okr_okrs okr
WHERE okr.objective = 'Chuyển đổi số quy trình vận hành';

INSERT INTO okr_key_results (okr_id, title, target_value, current_value, unit, weight)
SELECT okr.id, 'Đào tạo 500 nhân sự về kỹ năng mới', 500, 420, 'người', 0.6
FROM okr_okrs okr
WHERE okr.objective = 'Phát triển năng lực đội ngũ nhân sự';

INSERT INTO okr_key_results (okr_id, title, target_value, current_value, unit, weight)
SELECT okr.id, 'Tỷ lệ giữ chân nhân tài đạt 90%', 90, 88, '%', 0.4
FROM okr_okrs okr
WHERE okr.objective = 'Phát triển năng lực đội ngũ nhân sự';

INSERT INTO okr_key_results (okr_id, title, target_value, current_value, unit, weight)
SELECT okr.id, 'Ra mắt 5 sản phẩm mới', 5, 4, 'sản phẩm', 0.5
FROM okr_okrs okr
WHERE okr.objective = 'Đẩy mạnh nghiên cứu và phát triển sản phẩm';

INSERT INTO okr_key_results (okr_id, title, target_value, current_value, unit, weight)
SELECT okr.id, '20% doanh thu từ sản phẩm mới', 20, 15, '%', 0.5
FROM okr_okrs okr
WHERE okr.objective = 'Đẩy mạnh nghiên cứu và phát triển sản phẩm';

-- CSFs
INSERT INTO okr_csfs (organization_id, title, description, status, priority, assignee_id, department_id, due_date, progress)
SELECT o.id, 'Triển khai hệ thống ERP SAP', 'Triển khai và tích hợp hệ thống ERP SAP cho toàn bộ nhà máy.', 'in_progress', 'critical', u.id, d.id, '2024-12-31', 70
FROM okr_organizations o
JOIN okr_users u ON u.email = 'cto@kido.vn'
JOIN okr_departments d ON d.code = 'TECH'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_csfs WHERE title = 'Triển khai hệ thống ERP SAP');

INSERT INTO okr_csfs (organization_id, title, description, status, priority, assignee_id, department_id, due_date, progress)
SELECT o.id, 'Mở rộng mạng lưới phân phối', 'Thiết lập quan hệ đối tác và mở rộng mạng lưới đại lý.', 'in_progress', 'high', u.id, d.id, '2024-11-30', 76
FROM okr_organizations o
JOIN okr_users u ON u.email = 'sales@kido.vn'
JOIN okr_departments d ON d.code = 'SALES_GT'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_csfs WHERE title = 'Mở rộng mạng lưới phân phối');

INSERT INTO okr_csfs (organization_id, title, description, status, priority, assignee_id, department_id, due_date, progress)
SELECT o.id, 'Nâng cấp dây chuyền sản xuất kem', 'Đầu tư nâng cấp 2 dây chuyền sản xuất kem tự động hóa.', 'not_started', 'medium', u.id, d.id, '2025-03-31', 0
FROM okr_organizations o
JOIN okr_users u ON u.email = 'coo@kido.vn'
JOIN okr_departments d ON d.code = 'OPS'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_csfs WHERE title = 'Nâng cấp dây chuyền sản xuất kem');

INSERT INTO okr_csfs (organization_id, title, description, status, priority, assignee_id, department_id, due_date, progress)
SELECT o.id, 'Chương trình đào tạo kỹ năng số', 'Đào tạo chuyển đổi số cho 500 nhân viên.', 'completed', 'high', u.id, d.id, '2024-09-30', 100
FROM okr_organizations o
JOIN okr_users u ON u.email = 'hr@kido.vn'
JOIN okr_departments d ON d.code = 'HR'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_csfs WHERE title = 'Chương trình đào tạo kỹ năng số');

INSERT INTO okr_csfs (organization_id, title, description, status, priority, assignee_id, department_id, due_date, progress)
SELECT o.id, 'Ra mắt dòng sản phẩm kem healthy', 'Phát triển và ra mắt 3 loại kem ít đường.', 'in_progress', 'high', u.id, d.id, '2024-12-15', 65
FROM okr_organizations o
JOIN okr_users u ON u.email = 'cmo@kido.vn'
JOIN okr_departments d ON d.code = 'MARKETING'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_csfs WHERE title = 'Ra mắt dòng sản phẩm kem healthy');

INSERT INTO okr_csfs (organization_id, title, description, status, priority, assignee_id, department_id, due_date, progress)
SELECT o.id, 'Tối ưu chuỗi cung ứng lạnh', 'Cải thiện hệ thống cold chain.', 'in_progress', 'medium', u.id, d.id, '2024-12-31', 45
FROM okr_organizations o
JOIN okr_users u ON u.email = 'coo@kido.vn'
JOIN okr_departments d ON d.code = 'SCM'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_csfs WHERE title = 'Tối ưu chuỗi cung ứng lạnh');

INSERT INTO okr_csfs (organization_id, title, description, status, priority, assignee_id, department_id, due_date, progress)
SELECT o.id, 'Xây dựng nền tảng e-commerce', 'Phát triển website bán hàng trực tiếp.', 'blocked', 'high', u.id, d.id, '2024-11-30', 30
FROM okr_organizations o
JOIN okr_users u ON u.email = 'cto@kido.vn'
JOIN okr_departments d ON d.code = 'TECH'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_csfs WHERE title = 'Xây dựng nền tảng e-commerce');

INSERT INTO okr_csfs (organization_id, title, description, status, priority, assignee_id, department_id, due_date, progress)
SELECT o.id, 'Chứng nhận FSSC 22000', 'Hoàn thành chứng nhận an toàn thực phẩm.', 'completed', 'critical', u.id, d.id, '2024-08-31', 100
FROM okr_organizations o
JOIN okr_users u ON u.email = 'coo@kido.vn'
JOIN okr_departments d ON d.code = 'OPS'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_csfs WHERE title = 'Chứng nhận FSSC 22000');

-- CSF-OKR Relations
INSERT INTO okr_csf_okr_relations (csf_id, okr_id)
SELECT c.id, o.id
FROM okr_csfs c
JOIN okr_okrs o ON o.objective = 'Chuyển đổi số quy trình vận hành'
WHERE c.title = 'Triển khai hệ thống ERP SAP'
ON CONFLICT DO NOTHING;

INSERT INTO okr_csf_okr_relations (csf_id, okr_id)
SELECT c.id, o.id
FROM okr_csfs c
JOIN okr_okrs o ON o.objective = 'Tăng trưởng doanh thu 15% so với năm trước'
WHERE c.title = 'Mở rộng mạng lưới phân phối'
ON CONFLICT DO NOTHING;

INSERT INTO okr_csf_okr_relations (csf_id, okr_id)
SELECT c.id, o.id
FROM okr_csfs c
JOIN okr_okrs o ON o.objective = 'Nâng cao hiệu suất và chất lượng sản xuất'
WHERE c.title = 'Nâng cấp dây chuyền sản xuất kem'
ON CONFLICT DO NOTHING;

INSERT INTO okr_csf_okr_relations (csf_id, okr_id)
SELECT c.id, o.id
FROM okr_csfs c
JOIN okr_okrs o ON o.objective = 'Phát triển năng lực đội ngũ nhân sự'
WHERE c.title = 'Chương trình đào tạo kỹ năng số'
ON CONFLICT DO NOTHING;

INSERT INTO okr_csf_okr_relations (csf_id, okr_id)
SELECT c.id, o.id
FROM okr_csfs c
JOIN okr_okrs o ON o.objective = 'Mở rộng thị phần ngành kem lên 45%'
WHERE c.title = 'Ra mắt dòng sản phẩm kem healthy'
ON CONFLICT DO NOTHING;

INSERT INTO okr_csf_okr_relations (csf_id, okr_id)
SELECT c.id, o.id
FROM okr_csfs c
JOIN okr_okrs o ON o.objective = 'Đẩy mạnh nghiên cứu và phát triển sản phẩm'
WHERE c.title = 'Ra mắt dòng sản phẩm kem healthy'
ON CONFLICT DO NOTHING;

INSERT INTO okr_csf_okr_relations (csf_id, okr_id)
SELECT c.id, o.id
FROM okr_csfs c
JOIN okr_okrs o ON o.objective = 'Nâng cao hiệu suất và chất lượng sản xuất'
WHERE c.title = 'Tối ưu chuỗi cung ứng lạnh'
ON CONFLICT DO NOTHING;

INSERT INTO okr_csf_okr_relations (csf_id, okr_id)
SELECT c.id, o.id
FROM okr_csfs c
JOIN okr_okrs o ON o.objective = 'Tăng trưởng doanh thu 15% so với năm trước'
WHERE c.title = 'Xây dựng nền tảng e-commerce'
ON CONFLICT DO NOTHING;

INSERT INTO okr_csf_okr_relations (csf_id, okr_id)
SELECT c.id, o.id
FROM okr_csfs c
JOIN okr_okrs o ON o.objective = 'Nâng cao hiệu suất và chất lượng sản xuất'
WHERE c.title = 'Chứng nhận FSSC 22000'
ON CONFLICT DO NOTHING;

-- Fishbone Items
INSERT INTO okr_fishbone_items (organization_id, kpi_id, factor, problem, action, owner_id, deadline, expected_result, status)
SELECT o.id, k.id, 'Forecast', 'Sai 20%', 'Chuẩn hóa forecast tuần', u.id, 'Thứ 6 hàng tuần', 'Accuracy ≥ 80%', 'done'
FROM okr_organizations o
JOIN okr_kpis k ON k.name = 'Số hóa quy trình'
JOIN okr_users u ON u.email = 'sales@kido.vn'
WHERE o.name = 'KIDO Group';

INSERT INTO okr_fishbone_items (organization_id, kpi_id, factor, problem, action, owner_id, deadline, expected_result, status)
SELECT o.id, k.id, 'Kho', 'Không có cảnh báo', 'Dashboard tuổi hàng', u.id, 'Thứ 3', 'Báo cáo tuần', 'done'
FROM okr_organizations o
JOIN okr_kpis k ON k.name = 'Số hóa quy trình'
JOIN okr_users u ON u.email = 'coo@kido.vn'
WHERE o.name = 'KIDO Group';

INSERT INTO okr_fishbone_items (organization_id, kpi_id, factor, problem, action, owner_id, deadline, expected_result, status)
SELECT o.id, k.id, 'Trade', 'Không push hàng', 'Mini-campaign đẩy hàng', u.id, 'Hàng tháng', '+12% bán ra', 'pending'
FROM okr_organizations o
JOIN okr_kpis k ON k.name = 'Doanh thu'
JOIN okr_users u ON u.email = 'sales@kido.vn'
WHERE o.name = 'KIDO Group';

INSERT INTO okr_fishbone_items (organization_id, kpi_id, factor, problem, action, owner_id, deadline, expected_result, status)
SELECT o.id, k.id, 'Sản xuất', 'OEE thấp', 'Maintenance preventive', u.id, 'Hàng tuần', 'OEE ≥ 85%', 'pending'
FROM okr_organizations o
JOIN okr_kpis k ON k.name = 'Hiệu suất sản xuất (OEE)'
JOIN okr_users u ON u.email = 'coo@kido.vn'
WHERE o.name = 'KIDO Group';

INSERT INTO okr_fishbone_items (organization_id, kpi_id, factor, problem, action, owner_id, deadline, expected_result, status)
SELECT o.id, k.id, 'NPD', 'Chậm ra mắt', 'Stage-gate review weekly', u.id, 'Thứ 4', 'On-time launch', 'done'
FROM okr_organizations o
JOIN okr_kpis k ON k.name = 'Sản phẩm mới ra mắt'
JOIN okr_users u ON u.email = 'cmo@kido.vn'
WHERE o.name = 'KIDO Group';

INSERT INTO okr_fishbone_items (organization_id, kpi_id, factor, problem, action, owner_id, deadline, expected_result, status)
SELECT o.id, k.id, 'Logistics', 'Chi phí cao', 'Route optimization', u.id, 'Tháng 12', '-10% chi phí', 'overdue'
FROM okr_organizations o
JOIN okr_kpis k ON k.name = 'Biên lợi nhuận gộp'
JOIN okr_users u ON u.email = 'coo@kido.vn'
WHERE o.name = 'KIDO Group';

-- Weekly Actions
INSERT INTO okr_weekly_actions (organization_id, week, linked_goal_id, linked_kpi_id, solution, activity, owner_id, status, result)
SELECT o.id, 'Tuần 49', g.id, NULL, 'Tư duy "Cách làm nào mới" để đạt mục tiêu khó', 'Rà SKU ≤ 60 ngày', u.id, 'done', '28 SKU'
FROM okr_organizations o
JOIN okr_goals g ON g.name = 'Tối ưu chi phí (Cost Efficiency)'
JOIN okr_users u ON u.email = 'coo@kido.vn'
WHERE o.name = 'KIDO Group';

INSERT INTO okr_weekly_actions (organization_id, week, linked_goal_id, linked_kpi_id, solution, activity, owner_id, status, result)
SELECT o.id, 'Tuần 49', g.id, k.id, 'Chuẩn hóa quy trình', 'Update forecast', u.id, 'pending', 'Accuracy 75%'
FROM okr_organizations o
JOIN okr_goals g ON g.name = 'Tăng trưởng doanh thu'
JOIN okr_kpis k ON k.name = 'Doanh thu'
JOIN okr_users u ON u.email = 'sales@kido.vn'
WHERE o.name = 'KIDO Group';

INSERT INTO okr_weekly_actions (organization_id, week, linked_goal_id, linked_kpi_id, solution, activity, owner_id, status, result)
SELECT o.id, 'Tuần 49', g.id, k.id, 'Push activation', 'Chạy campaign cuối năm', u.id, 'pending', 'Target +15%'
FROM okr_organizations o
JOIN okr_goals g ON g.name = 'Tăng trưởng doanh thu'
JOIN okr_kpis k ON k.name = 'Doanh thu'
JOIN okr_users u ON u.email = 'sales@kido.vn'
WHERE o.name = 'KIDO Group';

INSERT INTO okr_weekly_actions (organization_id, week, linked_goal_id, linked_kpi_id, solution, activity, owner_id, status, result)
SELECT o.id, 'Tuần 48', g.id, k.id, 'Speed up launch', 'Hoàn thiện packaging Kem Healthy', u.id, 'done', 'Approved'
FROM okr_organizations o
JOIN okr_goals g ON g.name = 'Phát triển sản phẩm mới'
JOIN okr_kpis k ON k.name = 'Sản phẩm mới ra mắt'
JOIN okr_users u ON u.email = 'cmo@kido.vn'
WHERE o.name = 'KIDO Group';

INSERT INTO okr_weekly_actions (organization_id, week, linked_goal_id, linked_kpi_id, solution, activity, owner_id, status, result)
SELECT o.id, 'Tuần 48', g.id, k.id, 'Lean initiative', 'Giảm waste line 2', u.id, 'done', '-8% waste'
FROM okr_organizations o
JOIN okr_goals g ON g.name = 'Tối ưu chi phí (Cost Efficiency)'
JOIN okr_kpis k ON k.name = 'Biên lợi nhuận gộp'
JOIN okr_users u ON u.email = 'coo@kido.vn'
WHERE o.name = 'KIDO Group';

INSERT INTO okr_weekly_actions (organization_id, week, linked_goal_id, linked_kpi_id, solution, activity, owner_id, status, result)
SELECT o.id, 'Tuần 47', g.id, k.id, 'Preventive maintenance', 'Bảo trì máy đóng gói', u.id, 'done', 'OEE 83%'
FROM okr_organizations o
JOIN okr_goals g ON g.name = 'Chuyển đổi số & Tự động hóa'
JOIN okr_kpis k ON k.name = 'Hiệu suất sản xuất (OEE)'
JOIN okr_users u ON u.email = 'coo@kido.vn'
WHERE o.name = 'KIDO Group';

INSERT INTO okr_weekly_actions (organization_id, week, linked_goal_id, linked_kpi_id, solution, activity, owner_id, status, result)
SELECT o.id, 'Tuần 47', g.id, NULL, 'Data accuracy', 'Reconcile inventory', u.id, 'done', '98% accurate'
FROM okr_organizations o
JOIN okr_goals g ON g.name = 'Tăng trưởng doanh thu'
JOIN okr_users u ON u.email = 'sales@kido.vn'
WHERE o.name = 'KIDO Group';

-- Reviews
INSERT INTO okr_reviews (organization_id, type, title, scheduled_date, checklist, participants, duration_minutes)
SELECT o.id, 'weekly', 'Weekly Review', '2024-12-23', '["KPI tuần","Lệch ở đâu","Cập nhật fishbone","Hành động tuần sau"]', '["Department Heads","Team Leads"]', 60
FROM okr_organizations o
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_reviews WHERE title = 'Weekly Review');

INSERT INTO okr_reviews (organization_id, type, title, scheduled_date, checklist, participants, duration_minutes)
SELECT o.id, 'monthly', 'Monthly Review', '2024-12-05', '["OGSM cập nhật","Khoảng lệch vs Target","Điều chỉnh chiến lược","Resource allocation"]', '["C-Level","Directors"]', 120
FROM okr_organizations o
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_reviews WHERE title = 'Monthly Review');

-- Strategy Map Nodes
INSERT INTO okr_strategy_nodes (organization_id, label, category, code, linked_goal_id, position_x, position_y, status, progress, owner_id, goals_data, strategies_data)
SELECT o.id, 'Tăng trưởng doanh thu', 'financial', 'F1.0', g.id, 100, 80, 'at_risk', 72, u.id,
  '[{"label":"Doanh thu","current":"6200","target":"8000","isCompleted":false}]',
  '["Tăng độ phủ","Tối ưu kênh bán"]'
FROM okr_organizations o
JOIN okr_goals g ON g.name = 'Tăng trưởng doanh thu'
JOIN okr_users u ON u.email = 'ceo@kido.vn'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_strategy_nodes WHERE code = 'F1.0');

INSERT INTO okr_strategy_nodes (organization_id, label, category, code, linked_goal_id, position_x, position_y, status, progress, owner_id, goals_data, strategies_data)
SELECT o.id, 'Mở rộng thị phần', 'external', 'C2.1', g.id, 220, 200, 'at_risk', 78, u.id,
  '[{"label":"Thị phần","current":"43","target":"45","isCompleted":false}]',
  '["Push promo","Tăng độ phủ"]'
FROM okr_organizations o
JOIN okr_goals g ON g.name = 'Mở rộng thị phần'
JOIN okr_users u ON u.email = 'sales@kido.vn'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_strategy_nodes WHERE code = 'C2.1');

INSERT INTO okr_strategy_nodes (organization_id, label, category, code, linked_goal_id, position_x, position_y, status, progress, owner_id, goals_data, strategies_data)
SELECT o.id, 'Tối ưu vận hành', 'internal', 'P3.1', g.id, 180, 320, 'on_track', 85, u.id,
  '[{"label":"OEE","current":"82","target":"85","isCompleted":false}]',
  '["Lean manufacturing"]'
FROM okr_organizations o
JOIN okr_goals g ON g.name = 'Chuyển đổi số & Tự động hóa'
JOIN okr_users u ON u.email = 'coo@kido.vn'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_strategy_nodes WHERE code = 'P3.1');

INSERT INTO okr_strategy_nodes (organization_id, label, category, code, linked_goal_id, position_x, position_y, status, progress, owner_id, goals_data, strategies_data)
SELECT o.id, 'Phát triển đội ngũ', 'learning', 'L4.1', g.id, 140, 440, 'on_track', 82, u.id,
  '[{"label":"Đào tạo","current":"420","target":"500","isCompleted":false}]',
  '["Skill matrix"]'
FROM okr_organizations o
JOIN okr_goals g ON g.name = 'Đào tạo & Phát triển'
JOIN okr_users u ON u.email = 'hr@kido.vn'
WHERE o.name = 'KIDO Group'
  AND NOT EXISTS (SELECT 1 FROM okr_strategy_nodes WHERE code = 'L4.1');

-- Strategy Map Edges
INSERT INTO okr_strategy_edges (source_node_id, target_node_id, label)
SELECT s.id, t.id, 'Nâng năng lực'
FROM okr_strategy_nodes s
JOIN okr_strategy_nodes t ON t.code = 'P3.1'
WHERE s.code = 'L4.1';

INSERT INTO okr_strategy_edges (source_node_id, target_node_id, label)
SELECT s.id, t.id, 'Tối ưu quy trình'
FROM okr_strategy_nodes s
JOIN okr_strategy_nodes t ON t.code = 'C2.1'
WHERE s.code = 'P3.1';

INSERT INTO okr_strategy_edges (source_node_id, target_node_id, label)
SELECT s.id, t.id, 'Tăng doanh thu'
FROM okr_strategy_nodes s
JOIN okr_strategy_nodes t ON t.code = 'F1.0'
WHERE s.code = 'C2.1';

-- =====================
-- KIDO GROUP 2026 STRATEGIC DATA SEED (FIXED ENUM ERROR)
-- Context: Post-Ice Cream Divestment, Focus on Thọ Phát & Spices (Gia vị)
-- =====================
DO $$
DECLARE
  -- Variables for IDs
  v_org_id UUID;

  -- Users
  v_ceo_id UUID; v_cfo_id UUID; v_cmo_id UUID; v_cto_id UUID;
  v_sales_gt_head UUID; v_sales_mt_head UUID; v_rnd_head UUID; v_scm_head UUID;

  -- Departments
  v_dept_sales_gt UUID; v_dept_mkt UUID; v_dept_rnd UUID; v_dept_scm UUID; v_dept_it UUID;

  -- Objectives
  v_obj_growth UUID; v_obj_customer UUID; v_obj_ops UUID; v_obj_people UUID;

  -- Goals
  v_goal_revenue UUID; v_goal_thophat UUID; v_goal_export UUID; v_goal_digital UUID;

  -- KPIs (for linking)
  v_kpi_thophat_cov UUID; v_kpi_export_vol UUID; v_kpi_forecast_acc UUID;

  -- OKRs
  v_okr_sales_1 UUID; v_okr_mkt_1 UUID;

BEGIN
  -- 1. SETUP CONTEXT
  SELECT id INTO v_org_id FROM okr_organizations WHERE name = 'KIDO Group' LIMIT 1;

  IF v_org_id IS NULL THEN
    RAISE NOTICE 'Organization KIDO Group not found. Skipping 2026 seed.';
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM okr_objectives
    WHERE organization_id = v_org_id
      AND fiscal_year = '2026'
      AND name = 'Động cơ tăng trưởng mới (Post-Ice Cream)'
  ) THEN
    RAISE NOTICE '2026 seed already applied. Skipping.';
    RETURN;
  END IF;

  -- Update Fiscal Year
  UPDATE okr_organizations SET fiscal_year = '2026', current_quarter = 'Q1 2026' WHERE id = v_org_id;

  -- Get Users (Reuse existing)
  SELECT id INTO v_ceo_id FROM okr_users WHERE email = 'ceo@kido.vn';
  SELECT id INTO v_sales_gt_head FROM okr_users WHERE email = 'sales@kido.vn';
  SELECT id INTO v_cmo_id FROM okr_users WHERE email = 'cmo@kido.vn';
  SELECT id INTO v_scm_head FROM okr_users WHERE email = 'coo@kido.vn'; -- Reuse COO as SCM Head for demo
  SELECT id INTO v_cto_id FROM okr_users WHERE email = 'cto@kido.vn';
  SELECT id INTO v_rnd_head FROM okr_users WHERE role = 'Director' LIMIT 1; -- Placeholder

  -- Get Departments
  SELECT id INTO v_dept_sales_gt FROM okr_departments WHERE code = 'SALES_GT';
  SELECT id INTO v_dept_mkt FROM okr_departments WHERE code = 'MARKETING';
  SELECT id INTO v_dept_rnd FROM okr_departments WHERE code = 'RND';
  SELECT id INTO v_dept_scm FROM okr_departments WHERE code = 'SCM';
  SELECT id INTO v_dept_it FROM okr_departments WHERE code = 'TECH';

  -- ====================================================
  -- 2. CORPORATE OBJECTIVES & GOALS 2026
  -- ====================================================

  -- Objective 1: Financial - "New Growth Engine"
  INSERT INTO okr_objectives (organization_id, name, description, perspective, fiscal_year)
  VALUES (v_org_id, 'Động cơ tăng trưởng mới (Post-Ice Cream)', 'Tối ưu hóa doanh thu từ Thọ Phát và Gia vị', 'financial', '2026')
  RETURNING id INTO v_obj_growth;

  -- Goal 1.1: Revenue 18k billion
  INSERT INTO okr_goals (objective_id, name, target_text, owner_id, status)
  VALUES (v_obj_growth, 'Doanh thu 18,000 Tỷ VND', '18k Bil', v_ceo_id, 'active')
  RETURNING id INTO v_goal_revenue;

  -- Goal 1.2: Thọ Phát National Expansion
  INSERT INTO okr_goals (objective_id, name, target_text, owner_id, status)
  VALUES (v_obj_growth, 'Bánh bao Thọ Phát: Bắc tiến', 'Phủ 100% tỉnh phía Bắc', v_sales_gt_head, 'active')
  RETURNING id INTO v_goal_thophat;

  -- Goal 1.3: Export Spices
  INSERT INTO okr_goals (objective_id, name, target_text, owner_id, status)
  VALUES (v_obj_growth, 'Xuất khẩu Gia vị & Dầu', '+25% Vol', v_sales_gt_head, 'active')
  RETURNING id INTO v_goal_export;

  -- Objective 2: Internal - "Data Driven Supply Chain"
  INSERT INTO okr_objectives (organization_id, name, description, perspective, fiscal_year)
  VALUES (v_org_id, 'Chuỗi cung ứng thông minh', 'Giảm hao hụt hàng tươi sống (Fresh food)', 'internal', '2026')
  RETURNING id INTO v_obj_ops;

  -- Goal 2.1: Digital Forecast
  INSERT INTO okr_goals (objective_id, name, target_text, owner_id, status)
  VALUES (v_obj_ops, 'Dự báo cầu tự động (AI)', 'Accuracy > 90%', v_cto_id, 'active')
  RETURNING id INTO v_goal_digital;

  -- ====================================================
  -- 3. DEPARTMENT OKRs & KPIs (Deep Dive)
  -- ====================================================

  -------------------------------------------------------
  -- DEPT 1: SALES GT (Tập trung phủ Thọ Phát & Gia vị)
  -------------------------------------------------------

  -- OKR 1
  INSERT INTO okr_okrs (organization_id, department_id, objective, perspective, quarter, owner_id, linked_goal_id)
  VALUES (v_org_id, v_dept_sales_gt, 'Phủ kín thị trường miền Bắc với sản phẩm Thọ Phát', 'financial', 'Q1 2026', v_sales_gt_head, v_goal_thophat)
  RETURNING id INTO v_okr_sales_1;

  INSERT INTO okr_key_results (okr_id, title, target_value, current_value, unit, weight) VALUES
  (v_okr_sales_1, 'Mở mới 50 NPP chuyên doanh thực phẩm mát tại miền Bắc', 50, 12, 'NPP', 0.4),
  (v_okr_sales_1, 'Lắp đặt 2,000 tủ hấp bánh bao tại điểm bán', 2000, 450, 'tủ', 0.3),
  (v_okr_sales_1, 'Doanh số Thọ Phát miền Bắc đạt 200 tỷ/quý', 200, 45, 'tỷ', 0.3);

  -- OKR 2
  INSERT INTO okr_okrs (organization_id, department_id, objective, perspective, quarter, owner_id)
  VALUES (v_org_id, v_dept_sales_gt, 'Tăng hiện diện ngành hàng Gia vị (Nước mắm, Hạt nêm)', 'financial', 'Q1 2026', v_sales_gt_head);
  INSERT INTO okr_key_results (okr_id, title, target_value, current_value, unit, weight) VALUES
  (v_okr_sales_1, 'Đạt 80% điểm bán có trưng bày combo Dầu + Nước mắm', 80, 60, '%', 0.5),
  (v_okr_sales_1, 'Doanh số ngành gia vị tăng trưởng 30% vs Q1 2025', 30, 10, '%', 0.5);

  -- OKR 3, 4, 5 for Sales GT...
  INSERT INTO okr_okrs (organization_id, department_id, objective, perspective, quarter, owner_id) VALUES
  (v_org_id, v_dept_sales_gt, 'Tối ưu hóa đội ngũ bán hàng (Sales Force Effectiveness)', 'internal', 'Q1 2026', v_sales_gt_head),
  (v_org_id, v_dept_sales_gt, 'Triển khai DMS App cho 100% nhân viên bán hàng mới', 'internal', 'Q1 2026', v_sales_gt_head),
  (v_org_id, v_dept_sales_gt, 'Giảm tỷ lệ hàng trả về (Return rate) ngành bánh tươi', 'financial', 'Q1 2026', v_sales_gt_head);

  -- KPIs for Sales GT
  INSERT INTO okr_kpis (organization_id, department_id, name, perspective, target_value, current_value, unit, status, linked_goal_id)
  VALUES
  (v_org_id, v_dept_sales_gt, 'Độ phủ Thọ Phát (Numeric Distribution)', 'external', 60000, 42000, 'điểm', 'at_risk', v_goal_thophat) RETURNING id INTO v_kpi_thophat_cov;

  -------------------------------------------------------
  -- DEPT 2: MARKETING (Rebranding & New Launch)
  -------------------------------------------------------

  -- OKR 1
  INSERT INTO okr_okrs (organization_id, department_id, objective, perspective, quarter, owner_id, linked_goal_id)
  VALUES (v_org_id, v_dept_mkt, 'Tái định vị thương hiệu: KIDO - Bếp ăn quốc dân', 'external', 'Q1 2026', v_cmo_id, v_goal_revenue)
  RETURNING id INTO v_okr_mkt_1;

  INSERT INTO okr_key_results (okr_id, title, target_value, current_value, unit, weight) VALUES
  (v_okr_mkt_1, 'Đạt 10 triệu view cho chiến dịch "Vị ngon gian bếp Việt"', 10, 8.5, 'triệu', 0.5),
  (v_okr_mkt_1, 'Tăng chỉ số Brand Love ngành Gia vị lên Top 3', 3, 5, 'rank', 0.5);

  -- 4 More OKRs for Marketing
  INSERT INTO okr_okrs (organization_id, department_id, objective, perspective, quarter, owner_id) VALUES
  (v_org_id, v_dept_mkt, 'Ra mắt thành công dòng Bánh bao nhân sầu riêng', 'external', 'Q1 2026', v_cmo_id),
  (v_org_id, v_dept_mkt, 'Tối ưu chi phí Trade Marketing/Revenue', 'financial', 'Q1 2026', v_cmo_id),
  (v_org_id, v_dept_mkt, 'Xây dựng cộng đồng KIDO Kitchen trên TikTok', 'learning', 'Q1 2026', v_cmo_id),
  (v_org_id, v_dept_mkt, 'Hỗ trợ Sales GT mở điểm bán mới qua Activation', 'internal', 'Q1 2026', v_cmo_id);

  -------------------------------------------------------
  -- DEPT 3: SUPPLY CHAIN (Cold Chain & Logistics)
  -------------------------------------------------------

  -- OKR 1
  INSERT INTO okr_okrs (organization_id, department_id, objective, perspective, quarter, owner_id)
  VALUES (v_org_id, v_dept_scm, 'Thiết lập Cold Chain vận chuyển Bánh bao ra Bắc', 'internal', 'Q1 2026', v_scm_head);

  -- OKR 2
  INSERT INTO okr_okrs (organization_id, department_id, objective, perspective, quarter, owner_id)
  VALUES (v_org_id, v_dept_scm, 'Giảm chi phí Logistics trên mỗi đơn vị sản phẩm', 'financial', 'Q1 2026', v_scm_head);

  -- 3 More OKRs
  INSERT INTO okr_okrs (organization_id, department_id, objective, perspective, quarter, owner_id) VALUES
  (v_org_id, v_dept_scm, 'Tối ưu tồn kho nguyên liệu Dầu (Inventory Days)', 'internal', 'Q1 2026', v_scm_head),
  (v_org_id, v_dept_scm, 'Đạt chứng nhận Green Logistics cho đội xe', 'learning', 'Q1 2026', v_scm_head),
  (v_org_id, v_dept_scm, 'Đảm bảo tỷ lệ Fill Rate cho kênh MT đạt 98%', 'external', 'Q1 2026', v_scm_head);

  -- KPIs for SCM
  INSERT INTO okr_kpis (organization_id, department_id, name, perspective, target_value, current_value, unit, status)
  VALUES
  (v_org_id, v_dept_scm, 'Tỷ lệ hư hỏng hàng mát (Bánh bao)', 'internal', 2, 4.5, '%', 'off_track'); -- Fishbone candidate

  -------------------------------------------------------
  -- DEPT 4: R&D (Product Localization)
  -------------------------------------------------------
  -- 5 OKRs
  INSERT INTO okr_okrs (organization_id, department_id, objective, perspective, quarter, owner_id) VALUES
  (v_org_id, v_dept_rnd, 'Phát triển công thức Bánh bao vị Bắc (ít ngọt)', 'internal', 'Q1 2026', v_rnd_head),
  (v_org_id, v_dept_rnd, 'Cải tiến bao bì Dầu ăn giảm nhựa 15%', 'internal', 'Q1 2026', v_rnd_head),
  (v_org_id, v_dept_rnd, 'Nghiên cứu dòng nước mắm cao đạm xuất khẩu', 'financial', 'Q1 2026', v_rnd_head),
  (v_org_id, v_dept_rnd, 'Đạt chuẩn FDA cho dòng bánh tươi', 'learning', 'Q1 2026', v_rnd_head),
  (v_org_id, v_dept_rnd, 'Tối ưu cost nguyên liệu thay thế cho Bơ thực vật', 'financial', 'Q1 2026', v_rnd_head);

  -------------------------------------------------------
  -- DEPT 5: IT / TECHNOLOGY (AI & Digital)
  -------------------------------------------------------
  -- 5 OKRs
  INSERT INTO okr_okrs (organization_id, department_id, objective, perspective, quarter, owner_id, linked_goal_id) VALUES
  (v_org_id, v_dept_it, 'Triển khai module AI Forecast cho ngành hàng Dầu', 'internal', 'Q1 2026', v_cto_id, v_goal_digital),
  (v_org_id, v_dept_it, 'Nâng cấp hạ tầng Cloud phục vụ D-Office', 'internal', 'Q1 2026', v_cto_id, NULL),
  (v_org_id, v_dept_it, 'Bảo mật dữ liệu: Zero Trust Architecture', 'learning', 'Q1 2026', v_cto_id, NULL),
  (v_org_id, v_dept_it, 'Số hóa quy trình duyệt giá (Pricing Approval)', 'internal', 'Q1 2026', v_cto_id, NULL),
  (v_org_id, v_dept_it, 'Tích hợp hệ thống DMS với đối tác Logistic 3PL', 'internal', 'Q1 2026', v_cto_id, NULL);

  -- KPIs for IT
  INSERT INTO okr_kpis (organization_id, department_id, name, perspective, target_value, current_value, unit, status)
  VALUES
  (v_org_id, v_dept_it, 'Độ chính xác dự báo (Forecast Accuracy)', 'internal', 90, 75, '%', 'at_risk') RETURNING id INTO v_kpi_forecast_acc;

  -- ====================================================
  -- 4. CRITICAL SUCCESS FACTORS (CSFs)
  -- ====================================================

  INSERT INTO okr_csfs (organization_id, title, status, priority, department_id, progress) VALUES
  (v_org_id, 'Tìm kiếm đối tác kho lạnh tại Hà Nội', 'in_progress', 'critical', v_dept_scm, 60),
  (v_org_id, 'Giấy phép FDA cho lô hàng xuất khẩu Mỹ đầu tiên', 'completed', 'high', v_dept_rnd, 100),
  (v_org_id, 'Tuyển dụng GĐ Kinh doanh miền Bắc (ngành hàng mát)', 'blocked', 'critical', v_dept_sales_gt, 20),
  (v_org_id, 'Golive hệ thống AI Demand Planning phase 1', 'in_progress', 'high', v_dept_it, 85);

  -- ====================================================
  -- 5. REVIEWS & MEETINGS (Weekly/Monthly)
  -- ====================================================

  -- Monthly Review: Strategy Check
  INSERT INTO okr_reviews (organization_id, type, title, scheduled_date, department_id, notes)
  VALUES (v_org_id, 'monthly', 'Review Chiến lược Bắc tiến T1/2026', '2026-02-05', NULL, 'Tiến độ mở NPP chậm do thiếu nhân sự key');

  -- Weekly Review: SCM & Sales
  INSERT INTO okr_reviews (organization_id, type, title, scheduled_date, department_id, notes)
  VALUES (v_org_id, 'weekly', 'Giao ban SCM - Sales Tuần 3', '2026-01-20', v_dept_scm, 'Vấn đề xe lạnh không đủ tải trọng cho đơn hàng Tết');

  -- Weekly Review: Marketing
  INSERT INTO okr_reviews (organization_id, type, title, scheduled_date, department_id, notes)
  VALUES (v_org_id, 'weekly', 'Duyệt campaign Tết 2026', '2026-01-15', v_dept_mkt, 'Đã chốt TVC, chờ duyệt ngân sách digital');

  -- ====================================================
  -- 6. FISHBONE (Vấn đề thực tế)
  -- ====================================================

  -- Issue 1: Hư hỏng bánh bao khi vận chuyển ra Bắc (KPI off-track)
  DECLARE
    v_kpi_waste UUID;
  BEGIN
    SELECT id INTO v_kpi_waste FROM okr_kpis WHERE name = 'Tỷ lệ hư hỏng hàng mát (Bánh bao)' LIMIT 1;

    INSERT INTO okr_fishbone_items (organization_id, kpi_id, factor, problem, action, owner_id, status) VALUES
    (v_org_id, v_kpi_waste, 'Logistics', 'Xe lạnh không ổn định nhiệt', 'Lắp cảm biến nhiệt IoT real-time', v_scm_head, 'pending'),
    (v_org_id, v_kpi_waste, 'Kho', 'Xếp dỡ không đúng quy cách', 'Training quy trình xếp hàng mát', v_scm_head, 'done'),
    (v_org_id, v_kpi_waste, 'Sản xuất', 'Bao bì dễ rách', 'Test loại bao bì 3 lớp mới', v_rnd_head, 'pending'); -- FIXED HERE
  END;

  -- Issue 2: Dự báo sai lệch (KPI at-risk)
  INSERT INTO okr_fishbone_items (organization_id, kpi_id, factor, problem, action, owner_id, status) VALUES
  (v_org_id, v_kpi_forecast_acc, 'Sales', 'Nhập liệu đơn hàng ảo', 'Khóa đơn hàng ảo trên DMS', v_sales_gt_head, 'done'),
  (v_org_id, v_kpi_forecast_acc, 'Marketing', 'Không báo trước promo', 'Quy trình S&OP tích hợp lịch promo', v_cmo_id, 'pending'); -- FIXED HERE

END $$;

-- =====================
-- Backfill Fiscal Year
-- =====================
UPDATE okr_organizations
SET current_quarter = split_part(current_quarter, ' ', 1)
WHERE current_quarter LIKE 'Q% %';

UPDATE okr_okrs
SET fiscal_year = split_part(quarter, ' ', 2)
WHERE fiscal_year IS NULL
  AND quarter LIKE 'Q% %';

UPDATE okr_okrs
SET quarter = split_part(quarter, ' ', 1)
WHERE quarter LIKE 'Q% %';

UPDATE okr_okrs o
SET fiscal_year = org.fiscal_year
FROM okr_organizations org
WHERE o.organization_id = org.id
  AND o.fiscal_year IS NULL;

UPDATE okr_kpis k
SET fiscal_year = org.fiscal_year
FROM okr_organizations org
WHERE k.organization_id = org.id
  AND k.fiscal_year IS NULL;

UPDATE okr_csfs c
SET fiscal_year = org.fiscal_year
FROM okr_organizations org
WHERE c.organization_id = org.id
  AND c.fiscal_year IS NULL;

UPDATE okr_strategy_nodes n
SET fiscal_year = org.fiscal_year
FROM okr_organizations org
WHERE n.organization_id = org.id
  AND n.fiscal_year IS NULL;

-- =====================
-- Indexes
-- =====================
CREATE INDEX IF NOT EXISTS idx_okr_objectives_org ON okr_objectives(organization_id);
CREATE INDEX IF NOT EXISTS idx_okr_objectives_perspective ON okr_objectives(perspective);
CREATE INDEX IF NOT EXISTS idx_okr_goals_objective ON okr_goals(objective_id);
CREATE INDEX IF NOT EXISTS idx_okr_goals_owner ON okr_goals(owner_id);
CREATE INDEX IF NOT EXISTS idx_okr_strategies_goal ON okr_strategies(goal_id);
CREATE INDEX IF NOT EXISTS idx_okr_kpis_org ON okr_kpis(organization_id);
CREATE INDEX IF NOT EXISTS idx_okr_kpis_perspective ON okr_kpis(perspective);
CREATE INDEX IF NOT EXISTS idx_okr_kpis_department ON okr_kpis(department_id);
CREATE INDEX IF NOT EXISTS idx_okr_kpis_status ON okr_kpis(status);
CREATE INDEX IF NOT EXISTS idx_okr_kpis_fiscal_year ON okr_kpis(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_okr_kpi_history_kpi ON okr_kpi_history(kpi_id);
CREATE INDEX IF NOT EXISTS idx_okr_kpi_history_period ON okr_kpi_history(period);
CREATE INDEX IF NOT EXISTS idx_okr_okrs_org ON okr_okrs(organization_id);
CREATE INDEX IF NOT EXISTS idx_okr_okrs_quarter ON okr_okrs(quarter);
CREATE INDEX IF NOT EXISTS idx_okr_okrs_fiscal_year ON okr_okrs(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_okr_okrs_owner ON okr_okrs(owner_id);
CREATE INDEX IF NOT EXISTS idx_okr_okrs_status ON okr_okrs(status);
CREATE INDEX IF NOT EXISTS idx_okr_csfs_org ON okr_csfs(organization_id);
CREATE INDEX IF NOT EXISTS idx_okr_csfs_status ON okr_csfs(status);
CREATE INDEX IF NOT EXISTS idx_okr_csfs_fiscal_year ON okr_csfs(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_okr_strategy_nodes_fiscal_year ON okr_strategy_nodes(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_okr_weekly_actions_week ON okr_weekly_actions(week);
CREATE INDEX IF NOT EXISTS idx_okr_fishbone_kpi ON okr_fishbone_items(kpi_id);

-- =====================
-- RLS (optional)
-- =====================
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT (auth.jwt() ->> 'email')::text;
$$;

CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM okr_users u
    WHERE u.organization_id = org_id
      AND (
        u.auth_user_id = auth.uid()
        OR u.email = public.current_user_email()
      )
  );
$$;

ALTER TABLE okr_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_strategy_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_department_ogsm ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_department_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_okrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_kpi_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_csfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_fishbone_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_weekly_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_strategy_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_strategy_edges ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "organizations_member_access" ON okr_organizations
    FOR ALL USING (public.is_org_member(id))
    WITH CHECK (public.is_org_member(id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "okr_users_org_read" ON okr_users
    FOR SELECT USING (public.is_org_member(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "okr_users_self_write" ON okr_users
    FOR INSERT WITH CHECK (email = public.current_user_email())
    ;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "okr_users_self_update" ON okr_users
    FOR UPDATE USING (email = public.current_user_email())
    WITH CHECK (email = public.current_user_email());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "okr_departments_org_access" ON okr_departments
    FOR ALL USING (public.is_org_member(organization_id))
    WITH CHECK (public.is_org_member(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "okr_objectives_org_access" ON okr_objectives
    FOR ALL USING (public.is_org_member(organization_id))
    WITH CHECK (public.is_org_member(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "okr_goals_org_access" ON okr_goals
    FOR ALL USING (
      EXISTS (
        SELECT 1
        FROM okr_objectives o
        WHERE o.id = objective_id
          AND public.is_org_member(o.organization_id)
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM okr_objectives o
        WHERE o.id = objective_id
          AND public.is_org_member(o.organization_id)
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "okr_strategies_org_access" ON okr_strategies
    FOR ALL USING (
      EXISTS (
        SELECT 1
        FROM okr_goals g
        JOIN okr_objectives o ON o.id = g.objective_id
        WHERE g.id = goal_id
          AND public.is_org_member(o.organization_id)
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM okr_goals g
        JOIN okr_objectives o ON o.id = g.objective_id
        WHERE g.id = goal_id
          AND public.is_org_member(o.organization_id)
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "okr_strategy_measures_org_access" ON okr_strategy_measures
    FOR ALL USING (
      EXISTS (
        SELECT 1
        FROM okr_strategies s
        JOIN okr_goals g ON g.id = s.goal_id
        JOIN okr_objectives o ON o.id = g.objective_id
        WHERE s.id = strategy_id
          AND public.is_org_member(o.organization_id)
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM okr_strategies s
        JOIN okr_goals g ON g.id = s.goal_id
        JOIN okr_objectives o ON o.id = g.objective_id
        WHERE s.id = strategy_id
          AND public.is_org_member(o.organization_id)
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "okr_department_ogsm_org_access" ON okr_department_ogsm
    FOR ALL USING (
      EXISTS (
        SELECT 1
        FROM okr_departments d
        WHERE d.id = department_id
          AND public.is_org_member(d.organization_id)
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM okr_departments d
        WHERE d.id = department_id
          AND public.is_org_member(d.organization_id)
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "okr_department_measures_org_access" ON okr_department_measures
    FOR ALL USING (
      EXISTS (
        SELECT 1
        FROM okr_department_ogsm og
        JOIN okr_departments d ON d.id = og.department_id
        WHERE og.id = dept_ogsm_id
          AND public.is_org_member(d.organization_id)
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM okr_department_ogsm og
        JOIN okr_departments d ON d.id = og.department_id
        WHERE og.id = dept_ogsm_id
          AND public.is_org_member(d.organization_id)
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "okr_kpis_org_access" ON okr_kpis
    FOR ALL USING (public.is_org_member(organization_id))
    WITH CHECK (public.is_org_member(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "okr_kpi_history_org_access" ON okr_kpi_history
    FOR ALL USING (
      EXISTS (
        SELECT 1
        FROM okr_kpis k
        WHERE k.id = kpi_id
          AND public.is_org_member(k.organization_id)
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM okr_kpis k
        WHERE k.id = kpi_id
          AND public.is_org_member(k.organization_id)
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "okr_okrs_org_access" ON okr_okrs
    FOR ALL USING (public.is_org_member(organization_id))
    WITH CHECK (public.is_org_member(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "okr_csfs_org_access" ON okr_csfs
    FOR ALL USING (public.is_org_member(organization_id))
    WITH CHECK (public.is_org_member(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "okr_fishbone_org_access" ON okr_fishbone_items
    FOR ALL USING (public.is_org_member(organization_id))
    WITH CHECK (public.is_org_member(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "okr_weekly_actions_org_access" ON okr_weekly_actions
    FOR ALL USING (public.is_org_member(organization_id))
    WITH CHECK (public.is_org_member(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "okr_reviews_org_access" ON okr_reviews
    FOR ALL USING (public.is_org_member(organization_id))
    WITH CHECK (public.is_org_member(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "okr_strategy_nodes_org_access" ON okr_strategy_nodes
    FOR ALL USING (public.is_org_member(organization_id))
    WITH CHECK (public.is_org_member(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "okr_strategy_edges_org_access" ON okr_strategy_edges
    FOR ALL USING (
      EXISTS (
        SELECT 1
        FROM okr_strategy_nodes s
        JOIN okr_strategy_nodes t ON t.id = target_node_id
        WHERE s.id = source_node_id
          AND s.organization_id = t.organization_id
          AND public.is_org_member(s.organization_id)
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM okr_strategy_nodes s
        JOIN okr_strategy_nodes t ON t.id = target_node_id
        WHERE s.id = source_node_id
          AND s.organization_id = t.organization_id
          AND public.is_org_member(s.organization_id)
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMIT;
