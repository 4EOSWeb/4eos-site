import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "eos_command";
const HOURS = 12;

function envValue(name: string) {
  let value = process.env[name]?.replace(/^\uFEFF/, "").trim() || "";
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }
  return value;
}

function secret() {
  return envValue("ANALYTICS_PASSWORD");
}

export function analyticsConfigured() {
  return Boolean(envValue("ANALYTICS_USER") && secret());
}

export function credentialsMatch(user: string, password: string) {
  const expectedUser = envValue("ANALYTICS_USER");
  const expectedPass = secret();
  if (!expectedUser || !expectedPass) return false;
  const userOk = safeEqual(user, expectedUser);
  const passOk = safeEqual(password, expectedPass);
  return userOk && passOk;
}

function safeEqual(given: string, expected: string) {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function sessionToken() {
  const exp = Date.now() + HOURS * 3_600_000;
  const sig = createHmac("sha256", secret()).update(String(exp)).digest("base64url");
  return { value: `${exp}.${sig}`, maxAge: HOURS * 3600 };
}

export function tokenValid(value: string | undefined) {
  if (!value || !secret()) return false;
  const [exp, sig] = value.split(".");
  if (!exp || !sig) return false;
  const expires = Number(exp);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  const expected = createHmac("sha256", secret()).update(String(expires)).digest("base64url");
  return safeEqual(sig, expected);
}

export const COMMAND_COOKIE = COOKIE;
