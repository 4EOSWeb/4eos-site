/**
 * Organization lookup stays off until COMPANY_ENRICHMENT_KEY is set.
 * A future provider implements this and returns a company name only.
 * The raw address used for the lookup is never stored.
 */
export type Organization = { name: string; location: string | null };

export function companyLookupEnabled() {
  return Boolean(process.env.COMPANY_ENRICHMENT_KEY?.trim());
}

export async function lookupOrganization(): Promise<Organization | null> {
  if (!companyLookupEnabled()) return null;
  return null;
}
