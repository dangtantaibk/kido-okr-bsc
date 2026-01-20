import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

export const getCSFs = async (
  supabase: SupabaseClient<Database>,
  organizationId: string,
  fiscalYear?: string
) => {
  let query = supabase
    .from('okr_csfs')
    .select(`
      *,
      assignee:okr_users(*),
      department:okr_departments(*),
      relatedOKRs:okr_csf_okr_relations(okr:okr_okrs(*))
    `)
    .eq('organization_id', organizationId)
    .order('priority', { ascending: false });

  if (fiscalYear) {
    query = query.eq('fiscal_year', fiscalYear);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
};
