import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

export const getCSFs = async (
  supabase: SupabaseClient<Database>,
  organizationId: string
) => {
  const { data, error } = await supabase
    .from('csfs')
    .select(`
      *,
      assignee:users(*),
      department:departments(*),
      relatedOKRs:csf_okr_relations(okr:okrs(*))
    `)
    .eq('organization_id', organizationId)
    .order('priority', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};
