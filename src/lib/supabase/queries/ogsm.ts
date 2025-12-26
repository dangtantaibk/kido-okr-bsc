import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

export const getObjectivesWithCascade = async (
  supabase: SupabaseClient<Database>,
  organizationId: string,
  fiscalYear?: string
) => {
  let query = supabase
    .from('okr_objectives')
    .select(`
      *,
      goals:okr_goals (
        *,
        owner:okr_users(*),
        strategies:okr_strategies (
          *,
          measures:okr_strategy_measures (
            *,
            kpi:okr_kpis(*)
          )
        ),
        department_ogsms:okr_department_ogsm (
          *,
          department:okr_departments(*),
          owner:okr_users(*),
          measures:okr_department_measures (
            *,
            kpi:okr_kpis(*)
          )
        )
      )
    `)
    .eq('organization_id', organizationId)
    .eq('status', 'active');

  if (fiscalYear) {
    query = query.eq('fiscal_year', fiscalYear);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
};
