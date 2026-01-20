import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

export const getOKRsByQuarter = async (
  supabase: SupabaseClient<Database>,
  quarter: string,
  organizationId?: string,
  fiscalYear?: string
) => {
  const buildQuery = (includeSortOrder: boolean) => {
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
      .order('perspective');

    if (includeSortOrder) {
      query = query.order('sort_order', { ascending: true, nullsFirst: false });
    }

    query = query.order('created_at', { ascending: true });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (fiscalYear) {
      query = query.eq('fiscal_year', fiscalYear);
    }

    return query;
  };

  const { data, error } = await buildQuery(true);

  if (error?.code === '42703') {
    const fallback = await buildQuery(false);
    if (fallback.error) {
      throw fallback.error;
    }
    return fallback.data;
  }

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

  if (error?.code === '42703') {
    return;
  }

  if (error) {
    throw error;
  }
};
