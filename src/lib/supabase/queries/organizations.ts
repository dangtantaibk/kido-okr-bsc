import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

export const getOrganizationByName = async (
  supabase: SupabaseClient<Database>,
  name: string
) => {
  const { data, error } = await supabase
    .from('okr_organizations')
    .select('*')
    .eq('name', name)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const getFirstOrganization = async (
  supabase: SupabaseClient<Database>
) => {
  const { data, error } = await supabase
    .from('okr_organizations')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};
