import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

export const getWeeklyActions = async (
  supabase: SupabaseClient<Database>,
  organizationId: string,
  week?: string
) => {
  let query = supabase
    .from('weekly_actions')
    .select(`*, owner:users(*), linked_goal:goals(*), linked_kpi:kpis(*)`)
    .eq('organization_id', organizationId);

  if (week) {
    query = query.eq('week', week);
  }

  const { data, error } = await query.order('week', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};
