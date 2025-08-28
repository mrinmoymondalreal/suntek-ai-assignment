export const isEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const requireFields = (
  obj: Record<string, unknown>,
  fields: string[]
) => {
  const missing = fields.filter(
    (f) => obj[f] === undefined || obj[f] === null || obj[f] === ""
  );
  return { ok: missing.length === 0, missing };
};
