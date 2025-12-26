# KIDO OKR-BSC System - Specifications

## Overview

Thư mục này chứa các tài liệu specifications để implement hệ thống KIDO OKR-BSC. Các tài liệu được thiết kế để chia task cho AI Agents hoặc developers.

## Documents

| File | Description | Priority |
|------|-------------|----------|
| [01-database-schema.md](./01-database-schema.md) | Database schema cho Supabase (PostgreSQL) | HIGH |
| [02-data-model.md](./02-data-model.md) | TypeScript interfaces và data relationships | HIGH |
| [03-ui-components.md](./03-ui-components.md) | UI components và page layouts | HIGH |
| [04-implementation-roadmap.md](./04-implementation-roadmap.md) | Roadmap và task breakdown | HIGH |
| [05-mock-data-structure.md](./05-mock-data-structure.md) | Cách điều chỉnh mock data để liên kết | MEDIUM |

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           KIDO OKR-BSC SYSTEM                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │   Next.js   │────▶│  Supabase   │────▶│ PostgreSQL  │                   │
│  │   Frontend  │◀────│    Auth     │◀────│  Database   │                   │
│  └─────────────┘     └─────────────┘     └─────────────┘                   │
│        │                    │                                              │
│        │                    │                                              │
│        ▼                    ▼                                              │
│  ┌─────────────┐     ┌─────────────┐                                       │
│  │  React      │     │  Real-time  │                                       │
│  │  Components │     │  Subscriptions                                      │
│  └─────────────┘     └─────────────┘                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Core Concept: OGSM Framework

```
OGSM = Objectives, Goals, Strategies, Measures

Company Level:
├── O: Objectives (4 BSC Perspectives)
│   ├── Financial
│   ├── External/Customer
│   ├── Internal Process
│   └── Learning & Growth
│
├── G: Goals (Measurable targets)
│   └── Each links to an Objective
│
├── S: Strategies (How to achieve)
│   └── Each links to a Goal
│
└── M: Measures (KPIs to track)
    └── Each links to a Strategy/Goal

Department Level:
└── Cascade from Company Goals
    └── Department-specific KPIs and Actions
```

## Data Flow

```
Strategy Formulation          Execution              Analysis
─────────────────────     ─────────────────     ─────────────────
                                                        
OGSM Company      ────────▶    OKRs      ────────▶   Reviews
     │                          │                       │
     ▼                          ▼                       ▼
OGSM Department  ────────▶    KPIs       ────────▶  Fishbone
     │                          │                       │
     ▼                          ▼                       ▼
Strategy Map     ────────▶   Actions     ────────▶  Improvements
```

## Quick Start for AI Agents

### Agent 1: Data Layer
```bash
# Read these specs:
cat docs/specs/01-database-schema.md
cat docs/specs/02-data-model.md
cat docs/specs/05-mock-data-structure.md

# Tasks:
# 1. Setup Supabase project
# 2. Create TypeScript types
# 3. Update mock-data.ts with proper links
```

### Agent 2: UI Foundation
```bash
# Read these specs:
cat docs/specs/03-ui-components.md

# Focus on:
# - Design System section
# - Shared Components section
```

### Agent 3: OGSM Module
```bash
# Read these specs:
cat docs/specs/03-ui-components.md  # OGSM pages section
cat docs/specs/04-implementation-roadmap.md  # Phase 3

# Focus on:
# - OGSM Company Page
# - OGSM Department Page
# - Strategy Map
```

### Agent 4: Execution Module
```bash
# Read these specs:
cat docs/specs/03-ui-components.md  # OKRs, KPIs, CSFs sections
cat docs/specs/04-implementation-roadmap.md  # Phase 4

# Focus on:
# - OKRs Board
# - KPIs Dashboard
# - CSFs Board
```

### Agent 5: Analysis Module
```bash
# Read these specs:
cat docs/specs/03-ui-components.md  # Fishbone, Actions sections
cat docs/specs/04-implementation-roadmap.md  # Phase 5

# Focus on:
# - Fishbone Analysis
# - Weekly Actions
# - Reviews
```

## Key Linking Requirements

Every entity should be properly linked:

| Entity | Links To | Via |
|--------|----------|-----|
| Goal | Objective | `objectiveId` |
| Strategy | Goal | `goalId` |
| KPI | Goal | `linkedGoalId` |
| OKR | Goal | `linkedGoalId` |
| Department OGSM | Goal | `linkedGoalId` |
| CSF | OKRs | `relatedOKRs[]` |
| Fishbone | KPI | `kpiId` |
| Weekly Action | Goal, KPI | `linkedGoalId`, `linkedKpiId` |

## Definition of Done

Each implementation task is complete when:

1. ✅ Code matches spec
2. ✅ TypeScript compiles without errors
3. ✅ Data links work correctly
4. ✅ UI is responsive
5. ✅ Navigation between linked items works
6. ✅ No console errors

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State**: React Query, Zustand (optional)
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Diagrams**: React Flow
- **Drag & Drop**: @hello-pangea/dnd

## Getting Started

```bash
# Clone and install
git clone <repo>
cd kido-okr-bsc
pnpm install

# Setup environment
cp .env.example .env.local
# Add Supabase credentials

# Run development
pnpm dev
```

## Questions?

Refer to the specific spec document for detailed requirements.
