const NEAR_ACCOUNT_RE = /^(?=.{2,64}$)(?:[a-z0-9]+(?:[-_\.][a-z0-9]+)*)$/;
const NEAR_IMPLICIT_RE = /^[a-f0-9]{64}$/;

export function sanitizeComponentName(value: string): string {
  return value.trim().replace(/[^a-zA-Z0-9_-]/g, "");
}

export function isValidNearAccountId(value: string): boolean {
  const accountId = value.trim().toLowerCase();
  return NEAR_ACCOUNT_RE.test(accountId) || NEAR_IMPLICIT_RE.test(accountId);
}

export function assertNearAccountId(value: string, fieldName = "account_id"): string {
  const normalized = value.trim().toLowerCase();
  if (!isValidNearAccountId(normalized)) {
    throw new Error(`${fieldName} is not a valid NEAR account id: ${value}`);
  }
  return normalized;
}

export function assertComponentName(value: string, fieldName = "component_name"): string {
  const sanitized = sanitizeComponentName(value);
  if (!sanitized) {
    throw new Error(`${fieldName} must contain at least one alphanumeric character`);
  }
  return sanitized;
}
