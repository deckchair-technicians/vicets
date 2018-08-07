import {DiscriminatedUnionSchema} from "./discriminated_union";

export function detectDiscriminator<T>(ctors: { new(...args: any[]): T }[]): keyof T {
  let discriminators = DiscriminatedUnionSchema.discriminatorValues(ctors);
  if (!discriminators)
    throw new Error(`No discriminating field is shared between: ${ctors.map(c => c.name).join(", ")}.`);

  if (Object.keys(discriminators).length > 1)
    throw new Error(`Multiple possible discriminators - pick one from [${Object.keys(discriminators).join(", ")}].`);

  return Object.keys(discriminators)[0] as keyof T;

}

export function buildPredicateMessageFunction(message: ((value: any) => string) | string | undefined, predicate: (x: any) => boolean): (value: any) => string {
  switch (typeof  message) {
    case 'string':
      return (value: any) => message as string;
    case 'function':
      return message as (value: any) => string;
    case 'undefined':
      return (value: any) => predicate.toString();
    default:
      throw new Error(`Not a valid message ${message}`);
  }
}

export function entries<T>(x: { [p: string]: T }): [string, T][] {
  let strings: string[] = Object.keys(x);
  return strings.map(k => [k, x[k]] as [string, T]);
}

export type primitive = string | number | boolean;

export function isPrimitive(value: any): boolean {
  return (typeof value !== 'object' && typeof value !== 'function') || value === null
}