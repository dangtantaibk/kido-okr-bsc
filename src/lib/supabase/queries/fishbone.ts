import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

export const getFishboneItemsByKpi = async (
  supabase: SupabaseClient<Database>,
  kpiId: string
) => {
  const { data, error } = await supabase
    .from('okr_fishbone_items')
    .select(`*, owner:okr_users(*), kpi:okr_kpis(*)`)
    .eq('kpi_id', kpiId);

  if (error) {
    throw error;
  }

  return data;
};

export const getFishboneItemsByOrg = async (
  supabase: SupabaseClient<Database>,
  organizationId: string
) => {
  const { data, error } = await supabase
    .from('okr_fishbone_items')
    .select(`*, owner:okr_users(*), kpi:okr_kpis(*)`)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};
