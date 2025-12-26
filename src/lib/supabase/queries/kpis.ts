import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

export const getKPIWithHistory = async (
  supabase: SupabaseClient<Database>,
  kpiId: string
) => {
  const { data, error } = await supabase
    .from('kpis')
    .select(`*, history:kpi_history(*)`)
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
  perspective?: string,
  status?: string
) => {
  let query = supabase
    .from('kpis')
    .select(`*, owner:users(*), department:departments(*), linked_goal:goals(*)`)
    .eq('organization_id', organizationId);

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
