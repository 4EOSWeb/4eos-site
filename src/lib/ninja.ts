/** NinjaOne remote support. The code is appended; the base never comes from the client. */
export const NINJA_CONNECT_BASE = "https://4eos.rmmservices.net/connect/#/";

const CODE = /^[0-9]{1,32}$/;

/** A NinjaOne session URL, or null when the code is empty or not numeric. */
export function ninjaSessionUrl(raw: string): string | null {
  const code = raw.trim();
  if (!CODE.test(code)) return null;
  return NINJA_CONNECT_BASE + code;
}
