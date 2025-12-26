import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

export const getOKRsByQuarter = async (
  supabase: SupabaseClient<Database>,
  quarter: string,
  organizationId?: string,
  fiscalYear?: string
) => {
  let query = supabase
    .from('okr_okrs')
    .select(`
      *,
      owner:okr_users(*),
      key_results:okr_key_results(*),
      linked_goal:okr_goals (
        *,
        objective:okr_objectives(*)
      )
    `)
    .eq('quarter', quarter)
    .order('perspective');

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  if (fiscalYear) {
    query = query.eq('fiscal_year', fiscalYear);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
};
