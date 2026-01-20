import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_CSV = path.resolve(__dirname, '../docs/ban-do-chien-luoc-examples.csv');

const requiredEnv = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`Missing env: ${missingEnv.join(', ')}`);
  console.error('Example: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-ogsm-csv.mjs');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const normalizeLabel = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();

const resolvePerspective = (section) => {
  const normalized = normalizeLabel(section);
  if (normalized.includes('tai chinh')) return 'financial';
  if (normalized.includes('khach hang')) return 'external';
  if (normalized.includes('van hanh')) return 'internal';
  if (normalized.includes('phat trien')) return 'learning';
  return 'financial';
};

const getLinkedClusterCode = (code) => {
  if (!code) return null;
  const match = code.match(/([A-Z]\d*)$/);
  if (!match) return null;
  const suffix = match[1];
  if (code.startsWith(suffix)) return null;
  return suffix;
};

const parseCsv = (content) => {
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(';').map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(';');
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index]?.trim() ?? '';
      return acc;
    }, {});
  });
};

const getYearFromDate = (value) => {
  const match = value?.match(/\d{4}/);
  return match?.[0];
};

const getOrganizationId = async () => {
  if (process.env.SUPABASE_ORG_ID) {
    return process.env.SUPABASE_ORG_ID;
  }

  const { data, error } = await supabase
    .from('okr_organizations')
    .select('id, name')
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.id) {
    throw new Error('Không tìm thấy organization. Vui lòng set SUPABASE_ORG_ID.');
  }

  console.log(`Using organization: ${data.name} (${data.id})`);
  return data.id;
};

const getOrCreateUser = async (ownerName, orgId, userCache) => {
  if (!ownerName) return null;
  const normalized = normalizeLabel(ownerName);
  if (userCache.has(normalized)) {
    return userCache.get(normalized);
  }

  const email = `import+${normalized.replace(/[^a-z0-9]+/g, '-') || 'owner'}@local.kido`;
  const payload = {
    organization_id: orgId,
    full_name: ownerName,
    email,
    role: 'Owner',
  };

  const { data, error } = await supabase
    .from('okr_users')
    .upsert(payload, { onConflict: 'email' })
    .select('id, full_name')
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.id) {
    throw new Error(`Không tạo được user cho ${ownerName}`);
  }

  userCache.set(normalized, data.id);
  return data.id;
};

const getOrCreateObjective = async (payload, objectiveCache) => {
  if (payload.cluster_code && objectiveCache.has(payload.cluster_code)) {
    return objectiveCache.get(payload.cluster_code);
  }

  if (payload.cluster_code) {
    const { data } = await supabase
      .from('okr_objectives')
      .select('id')
      .eq('organization_id', payload.organization_id)
      .eq('cluster_code', payload.cluster_code)
      .maybeSingle();

    if (data?.id) {
      const updates = {};
      if (payload.cluster_group) updates.cluster_group = payload.cluster_group;
      if (payload.linked_cluster_code) updates.linked_cluster_code = payload.linked_cluster_code;
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('okr_objectives')
          .update(updates)
          .eq('id', data.id);
        if (error) {
          throw error;
        }
      }

      objectiveCache.set(payload.cluster_code, data.id);
      return data.id;
    }
  }

  const { data, error } = await supabase
    .from('okr_objectives')
    .insert(payload)
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  if (payload.cluster_code) {
    objectiveCache.set(payload.cluster_code, data.id);
  }

  return data.id;
};

const getOrCreateGoal = async (payload, goalCache) => {
  const cacheKey = `${payload.objective_id}:${payload.name}`;
  if (goalCache.has(cacheKey)) {
    return goalCache.get(cacheKey);
  }

  const { data: existing } = await supabase
    .from('okr_goals')
    .select('id')
    .eq('objective_id', payload.objective_id)
    .eq('name', payload.name)
    .maybeSingle();

  if (existing?.id) {
    goalCache.set(cacheKey, existing.id);
    return existing.id;
  }

  const { data, error } = await supabase
    .from('okr_goals')
    .insert(payload)
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  goalCache.set(cacheKey, data.id);
  return data.id;
};

const getOrCreateStrategy = async (payload, strategyCache) => {
  const cacheKey = `${payload.goal_id}:${payload.name}`;
  if (strategyCache.has(cacheKey)) {
    return strategyCache.get(cacheKey);
  }

  const { data: existing } = await supabase
    .from('okr_strategies')
    .select('id')
    .eq('goal_id', payload.goal_id)
    .eq('name', payload.name)
    .maybeSingle();

  if (existing?.id) {
    strategyCache.set(cacheKey, existing.id);
    return existing.id;
  }

  const { data, error } = await supabase
    .from('okr_strategies')
    .insert(payload)
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  strategyCache.set(cacheKey, data.id);
  return data.id;
};

const getOrCreateMeasure = async (payload, measureCache) => {
  const cacheKey = `${payload.strategy_id}:${payload.name}`;
  if (measureCache.has(cacheKey)) {
    return measureCache.get(cacheKey);
  }

  const { data: existing } = await supabase
    .from('okr_strategy_measures')
    .select('id')
    .eq('strategy_id', payload.strategy_id)
    .eq('name', payload.name)
    .maybeSingle();

  if (existing?.id) {
    measureCache.set(cacheKey, existing.id);
    return existing.id;
  }

  const { data, error } = await supabase
    .from('okr_strategy_measures')
    .insert(payload)
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  measureCache.set(cacheKey, data.id);
  return data.id;
};

const main = async () => {
  const csvPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_CSV;
  const content = await fs.readFile(csvPath, 'utf-8');
  const rows = parseCsv(content);

  if (rows.length === 0) {
    console.error('CSV không có dữ liệu.');
    process.exit(1);
  }

  const orgId = await getOrganizationId();
  const fiscalYear =
    process.env.SUPABASE_FISCAL_YEAR ||
    getYearFromDate(rows[0]?.Start) ||
    getYearFromDate(rows[0]?.End) ||
    String(new Date().getFullYear());

  const userCache = new Map();
  const objectiveCache = new Map();
  const goalCache = new Map();
  const strategyCache = new Map();
  const measureCache = new Map();

  for (const row of rows) {
    const section = row.Section || '';
    const group = row.Group || '';
    const code = row.Code || '';
    const purpose = row.Muc_dich || '';
    const goalName = row.Muc_tieu || '';
    const strategyName = row.Cach_lam || '';
    const measureName = row.Do_luong || '';
    const ownerName = row.Owner || '';
    const resourceNote = row.Nguon_luc || '';
    const startDate = row.Start || null;
    const endDate = row.End || null;

    if (!group && !purpose && !goalName) {
      continue;
    }

    const ownerId = await getOrCreateUser(ownerName, orgId, userCache);

    const objectivePayload = {
      organization_id: orgId,
      name: group || purpose || code || 'Objective',
      description: purpose || null,
      perspective: resolvePerspective(section),
      cluster_code: code || null,
      cluster_group: group || null,
      linked_cluster_code: getLinkedClusterCode(code),
      purpose: purpose || null,
      objective_text: group || code || purpose || 'Objective',
      resource_note: resourceNote || null,
      start_date: startDate || null,
      end_date: endDate || null,
      status: 'active',
      fiscal_year: fiscalYear,
    };

    const objectiveId = await getOrCreateObjective(objectivePayload, objectiveCache);

    if (!goalName) {
      continue;
    }

    const goalPayload = {
      objective_id: objectiveId,
      name: goalName,
      target_text: null,
      owner_id: ownerId,
      progress: 0,
      status: 'active',
    };

    const goalId = await getOrCreateGoal(goalPayload, goalCache);

    if (!strategyName) {
      continue;
    }

    const strategyPayload = {
      goal_id: goalId,
      name: strategyName,
      description: null,
      priority: 0,
    };

    const strategyId = await getOrCreateStrategy(strategyPayload, strategyCache);

    if (!measureName) {
      continue;
    }

    const measurePayload = {
      strategy_id: strategyId,
      name: measureName,
      kpi_id: null,
    };

    await getOrCreateMeasure(measurePayload, measureCache);
  }

  console.log('Import completed.');
  console.log({
    objectives: objectiveCache.size,
    goals: goalCache.size,
    strategies: strategyCache.size,
    measures: measureCache.size,
    fiscalYear,
  });
};

main().catch((error) => {
  console.error('Import failed:', error);
  process.exit(1);
});
