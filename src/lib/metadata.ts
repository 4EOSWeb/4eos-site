import type { Metadata } from "next";

/**
 * Relative canonical path. The root layout's metadataBase resolves it
 * to the public site origin. Analytics and the signal lab stay noindex
 * and do not use this helper.
 */
export function withCanonical(path: string, metadata: Metadata = {}): Metadata {
  return {
    ...metadata,
    alternates: { canonical: path },
  };
}
