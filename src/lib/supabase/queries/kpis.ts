import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

export const getKPIWithHistory = async (
  supabase: SupabaseClient<Database>,
  kpiId: string
) => {
  const { data, error } = await supabase
    .from('okr_kpis')
    .select(`*, history:okr_kpi_history(*)`)
    .eq('id', kpiId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getKPIsByOrg = async (
  supabase: SupabaseClient<Database>,
  organizationId: string,
  fiscalYear?: string,
  perspective?: string,
  status?: string,
  withHistory: boolean = false
) => {
  let query = supabase
    .from('okr_kpis')
    .select(
      withHistory
        ? `*, owner:okr_users(*), department:okr_departments(*), linked_goal:okr_goals(*), history:okr_kpi_history(*)`
        : `*, owner:okr_users(*), department:okr_departments(*), linked_goal:okr_goals(*)`
    )
    .eq('organization_id', organizationId);

  if (fiscalYear) {
    query = query.eq('fiscal_year', fiscalYear);
  }

  if (perspective) {
    query = query.eq('perspective', perspective);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('name');

  if (error) {
    throw error;
  }

  return data;
};
