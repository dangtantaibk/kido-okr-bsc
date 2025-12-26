import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

export const getOKRsByQuarter = async (
  supabase: SupabaseClient<Database>,
  quarter: string,
  organizationId?: string
) => {
  let query = supabase
    .from('okrs')
    .select(`
      *,
      owner:users(*),
      key_results(*),
      linked_goal:goals (
        *,
        objective:objectives(*)
      )
    `)
    .eq('quarter', quarter)
    .order('perspective');

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
};
