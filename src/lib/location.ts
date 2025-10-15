export type CountryCode =
  | 'AE' | 'SA' | 'EG' | 'JO' | 'BH' | 'OM' | 'KW'
  | 'US' | 'GB' | 'DE' | 'FR' | 'IN' | 'CA' | 'AU' | 'SG' | 'OTHER';

const noonCountries = new Set(['AE','SA','EG','JO','BH','OM','KW']);

export function detectCountryCode(): CountryCode {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale || '';
    const parts = locale.split('-');
    const cc = (parts[1] || '').toUpperCase();
    if (cc && cc.length === 2) {
      return (noonCountries.has(cc) ? (cc as CountryCode) : (cc as CountryCode)) || 'OTHER';
    }
  } catch {}
  return 'OTHER';
}

export function persistCountry(cc: CountryCode) {
  try { localStorage.setItem('fv_country', cc); } catch {}
}

export function getPersistedCountry(): CountryCode | null {
  try {
    const v = localStorage.getItem('fv_country');
    return (v as CountryCode) || null;
  } catch { return null; }
}

export function isNoonCountry(cc: CountryCode) {
  return noonCountries.has(cc);
}


