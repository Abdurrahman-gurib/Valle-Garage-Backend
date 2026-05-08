export function normalizeRole(role: any) {
  if (!role) return role;
  const r = String(role).toLowerCase();
  if (r === 'admin') return 'ADMIN';
  if (r === 'mechanic') return 'MECHANIC';
  if (r === 'store' || r === 'store_keeper') return 'STORE_KEEPER';
  return role;
}
export function toDate(value: any) { return value ? new Date(value) : undefined; }
export function cleanUndefined<T extends object>(obj: T): T {
  Object.keys(obj).forEach(k => (obj as any)[k] === undefined && delete (obj as any)[k]);
  return obj;
}
