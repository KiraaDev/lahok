export const QR_PREFIX = "lahok:";

export function encodeQrValue(token: string) {
  return `${QR_PREFIX}${token}`;
}

export function parseQrValue(raw: string) {
  const value = raw.trim().toLowerCase();
  if (!value.startsWith(QR_PREFIX)) return null;
  const token = value.slice(QR_PREFIX.length);
  return /^[a-f0-9]{32}$/.test(token) ? token : null;
}