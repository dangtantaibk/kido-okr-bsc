import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

export const getReviews = async (
  supabase: SupabaseClient<Database>,
  organizationId: string,
  type?: string
) => {
  let query = supabase
    .from('reviews')
    .select(`*, department:departments(*), facilitator:users(*)`)
    .eq('organization_id', organizationId)
    .order('scheduled_date', { ascending: false });

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
};
