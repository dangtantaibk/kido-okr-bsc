export const quarterOptions = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

export const parseQuarterLabel = (value?: string | null) => {
  const normalized = (value ?? '').trim();
  if (!normalized) {
    return { quarter: '', fiscalYear: '' };
  }

  const match = normalized.match(/^(Q[1-4])(?:\s+(\d{4}))?$/i);
  if (!match) {
    return { quarter: normalized, fiscalYear: '' };
  }

  return {
    quarter: match[1].toUpperCase(),
    fiscalYear: match[2] ?? '',
  };
};

export const formatQuarterLabel = (
  quarter?: string | null,
  fiscalYear?: string | null
) => {
  const quarterValue = (quarter ?? '').trim();
  if (!quarterValue) {
    return '';
  }

  const yearValue = (fiscalYear ?? '').trim();
  if (!yearValue || quarterValue.includes(yearValue)) {
    return quarterValue;
  }

  return `${quarterValue} ${yearValue}`;
};

export const buildYearOptions = (
  fiscalYear?: string | null,
  span: number = 2
) => {
  const parsedYear = Number.parseInt((fiscalYear ?? '').trim(), 10);
  const baseYear = Number.isFinite(parsedYear) ? parsedYear : new Date().getFullYear();
  const years: string[] = [];

  for (let offset = span; offset >= 1; offset -= 1) {
    years.push(String(baseYear - offset));
  }

  years.push(String(baseYear));

  for (let offset = 1; offset <= span; offset += 1) {
    years.push(String(baseYear + offset));
  }

  return Array.from(new Set(years));
};
