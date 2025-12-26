import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

export const getFishboneItemsByKpi = async (
  supabase: SupabaseClient<Database>,
  kpiId: string
) => {
  const { data, error } = await supabase
    .from('fishbone_items')
    .select(`*, owner:users(*), kpi:kpis(*)`)
    .eq('kpi_id', kpiId);

  if (error) {
    throw error;
  }

  return data;
};
