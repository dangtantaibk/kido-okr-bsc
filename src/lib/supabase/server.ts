import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const getServerEnv = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase env vars for server client');
  }

  return { url, serviceRoleKey };
};

export const createServerSupabaseClient = (accessToken?: string): SupabaseClient<Database> => {
  const { url, serviceRoleKey } = getServerEnv();

  return createClient<Database>(url, serviceRoleKey, {
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : {},
  });
};
