'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getFirstOrganization } from '@/lib/supabase/queries/organizations';
import { buildYearOptions, parseQuarterLabel } from '@/lib/period';
import { useAuth } from '@/contexts/auth-context';

type OrganizationRecord = {
  id: string;
  name: string;
  slogan?: string | null;
  fiscal_year?: string | null;
  current_quarter?: string | null;
  logo_url?: string | null;
};

type OrganizationContextValue = {
  organization: OrganizationRecord | null;
  isLoading: boolean;
  activeFiscalYear: string;
  activeQuarter: string;
  setActiveFiscalYear: (year: string) => void;
  setActiveQuarter: (quarter: string) => void;
  refreshOrganization: () => Promise<void>;
  updateOrganization: (updates: Partial<OrganizationRecord>) => Promise<OrganizationRecord | null>;
  yearOptions: string[];
};

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  fiscalYear: 'okr.activeFiscalYear',
  quarter: 'okr.activeQuarter',
};

const getStoredValue = (key: string) => {
  if (typeof window === 'undefined') {
    return '';
  }
  return window.localStorage.getItem(key) ?? '';
};

const storeValue = (key: string, value: string) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(key, value);
};

const resolvePeriod = (organization: OrganizationRecord | null) => {
  const parsed = parseQuarterLabel(organization?.current_quarter ?? '');
  const fiscalYear = organization?.fiscal_year || parsed.fiscalYear || '';
  const quarter = parsed.quarter || 'Q4';

  return { fiscalYear, quarter };
};

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [organization, setOrganization] = useState<OrganizationRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFiscalYear, setActiveFiscalYear] = useState(() => getStoredValue(STORAGE_KEYS.fiscalYear));
  const [activeQuarter, setActiveQuarter] = useState(() => getStoredValue(STORAGE_KEYS.quarter));
  const initialized = useRef(false);
  const { session, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (!session) {
      initialized.current = false;
    }
  }, [session]);

  const refreshOrganization = useCallback(async () => {
    if (!session) {
      setOrganization(null);
      return;
    }
    const supabase = getSupabaseBrowserClient();
    const org = await getFirstOrganization(supabase);
    setOrganization(org);

    if (!initialized.current) {
      const { fiscalYear, quarter } = resolvePeriod(org);
      setActiveFiscalYear((prev) => prev || fiscalYear || String(new Date().getFullYear()));
      setActiveQuarter((prev) => prev || quarter);
      initialized.current = true;
    }
  }, [session]);

  useEffect(() => {
    let isActive = true;

    const loadOrganization = async () => {
      if (isAuthLoading) {
        return;
      }
      if (!session) {
        setOrganization(null);
        setIsLoading(false);
        return;
      }
      try {
        await refreshOrganization();
      } catch (error) {
        console.error('Failed to load organization', error);
        if (isActive) {
          setOrganization(null);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadOrganization();

    return () => {
      isActive = false;
    };
  }, [refreshOrganization, isAuthLoading, session]);

  useEffect(() => {
    if (activeFiscalYear) {
      storeValue(STORAGE_KEYS.fiscalYear, activeFiscalYear);
    }
  }, [activeFiscalYear]);

  useEffect(() => {
    if (activeQuarter) {
      storeValue(STORAGE_KEYS.quarter, activeQuarter);
    }
  }, [activeQuarter]);

  const updateOrganization = useCallback(
    async (updates: Partial<OrganizationRecord>) => {
      if (!session) {
        return null;
      }
      if (!organization?.id) {
        return null;
      }

      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('okr_organizations')
        .update(updates)
        .eq('id', organization.id)
        .select('*')
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setOrganization(data as OrganizationRecord);

        const previousPeriod = resolvePeriod(organization);
        const nextPeriod = resolvePeriod(data as OrganizationRecord);

        if (updates.fiscal_year && activeFiscalYear === previousPeriod.fiscalYear) {
          setActiveFiscalYear(nextPeriod.fiscalYear || activeFiscalYear);
        }

        if (updates.current_quarter && activeQuarter === previousPeriod.quarter) {
          setActiveQuarter(nextPeriod.quarter || activeQuarter);
        }
      }

      return data as OrganizationRecord | null;
    },
    [organization, activeFiscalYear, activeQuarter]
  );

  const yearOptions = useMemo(
    () => buildYearOptions(activeFiscalYear || organization?.fiscal_year),
    [activeFiscalYear, organization?.fiscal_year]
  );

  const value = useMemo(
    () => ({
      organization,
      isLoading,
      activeFiscalYear,
      activeQuarter,
      setActiveFiscalYear,
      setActiveQuarter,
      refreshOrganization,
      updateOrganization,
      yearOptions,
    }),
    [
      organization,
      isLoading,
      activeFiscalYear,
      activeQuarter,
      refreshOrganization,
      updateOrganization,
      yearOptions,
    ]
  );

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
};
