export function parseAgent(userAgent: string | null) {
  const ua = userAgent ?? "";
  let browser = "Other";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = "Safari";

  let os = "Other";
  if (/Windows NT/.test(ua)) os = "Windows";
  else if (/iPhone|iPad/.test(ua)) os = "iOS";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/Linux/.test(ua)) os = "Linux";

  let device = "desktop";
  if (/iPad|Tablet/.test(ua)) device = "tablet";
  else if (/Mobi|iPhone|Android/.test(ua)) device = "mobile";

  return { browser, os, device };
}

export function cleanScreen(value: unknown) {
  if (typeof value !== "string") return null;
  return /^\d{3,4}x\d{3,4}$/.test(value) ? value : null;
}

export function cleanConnection(value: unknown) {
  if (typeof value !== "string") return null;
  return ["slow-2g", "2g", "3g", "4g"].includes(value) ? value : null;
}
