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
      ),
      department:okr_departments(id, name)
    `)
    .eq('quarter', quarter)
    .order('perspective')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });

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

export type OKRPositionUpdate = {
  id: string;
  perspective: string;
  sort_order: number;
};

export const updateOKRPositions = async (
  supabase: SupabaseClient<Database>,
  updates: OKRPositionUpdate[]
) => {
  if (updates.length === 0) {
    return;
  }

  const { error } = await supabase
    .from('okr_okrs')
    .upsert(updates, { onConflict: 'id' });

  if (error) {
    throw error;
  }
};
