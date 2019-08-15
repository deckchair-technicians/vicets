export function toJSON(value: any): any {
  if (Array.isArray(value))
    return value.map(v => toJSON(v));
  if (typeof value === "object")
    return typeof value['toJSON'] === 'function' ? value.toJSON() : value;
  return value;
}