import { CountryCode, isNoonCountry } from './location';

function encode(q: string) {
  return encodeURIComponent(q.trim());
}

export function buildGroceryUrls(country: CountryCode, ingredients: string[]) {
  const queries = ingredients.filter(Boolean).map(i => encode(i));
  if (queries.length === 0) return [] as string[];
  if (isNoonCountry(country)) {
    // Noon supports query param ?q= for search
    const cc = country.toLowerCase();
    return queries.map(q => `https://www.noon.com/${cc}-en/search/?q=${q}`);
  }
  // Default to Amazon with country-specific tld best effort
  const tld = country === 'US' ? 'com' : country === 'GB' ? 'co.uk' : country === 'IN' ? 'in' : country === 'DE' ? 'de' : country === 'FR' ? 'fr' : 'com';
  return queries.map(q => `https://www.amazon.${tld}/s?k=${q}`);
}


