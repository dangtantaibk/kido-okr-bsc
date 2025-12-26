import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

export const getObjectivesWithCascade = async (
  supabase: SupabaseClient<Database>,
  organizationId: string
) => {
  const { data, error } = await supabase
    .from('objectives')
    .select(`
      *,
      goals (
        *,
        owner:users(*),
        strategies (
          *,
          measures:strategy_measures (
            *,
            kpi:kpis(*)
          )
        ),
        department_ogsms:department_ogsm (
          *,
          department:departments(*),
          measures:department_measures (
            *,
            kpi:kpis(*)
          )
        )
      )
    `)
    .eq('organization_id', organizationId)
    .eq('status', 'active');

  if (error) {
    throw error;
  }

  return data;
};
