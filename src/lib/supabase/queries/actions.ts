import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

export const getWeeklyActions = async (
  supabase: SupabaseClient<Database>,
  organizationId: string,
  week?: string
) => {
  let query = supabase
    .from('okr_weekly_actions')
    .select(`*, owner:okr_users(*), linked_goal:okr_goals(*), linked_kpi:okr_kpis(*)`)
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
