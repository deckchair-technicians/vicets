import {Constructor, first, isPrimitive, mapKeyValue, PrimitiveValue, unsafeCast} from "../util";
import {fieldSchemas} from "../../data";
import {EqualsSchema} from "../eq";
import * as os from "os";

class CandidateDiscriminators<T> {

  private readonly constructors: Constructor<T>[] = [];
  private readonly fields = new Map<keyof T, Map<PrimitiveValue, Constructor<T>[]>>();

  keys() : IterableIterator<keyof T>{
    return this.fields.keys();
  }

  get(field: keyof T): Map<PrimitiveValue, Constructor<T>[]> | undefined {
    return this.fields.get(field);
  }

  problemWithDiscriminator(field: keyof T): string | undefined {
    const values = this.fields.get(field)!;
    for (let [value, ctors] of values) {
      if (ctors.length > 1)
        return `value '${value}' is repeated in: ${ctors.map((c) => c.name).join(", ")}`;
    }
    if (values.size !== this.constructors.length)
      return 'field is not present in all classes';
  }

  addConstructor(ctor: Constructor<T>): CandidateDiscriminators<T> {
    this.constructors.push(ctor);
    let fieldsWithPrimitiveEquals = CandidateDiscriminators.fieldsWithPrimitiveEquals(ctor);
    for (let [fieldName, value] of fieldsWithPrimitiveEquals) {
      const result = this.fields.get(fieldName) || new Map();
      result.set(value, (result.get(value) || []).concat([ctor]));
      this.fields.set(fieldName, result)
    }
    return this;
  }

  private static fieldsWithPrimitiveEquals<T>(ctor: Constructor<T>): [keyof T, PrimitiveValue][] {
    let fieldSchemas2 = fieldSchemas(ctor);
    return fieldSchemas2
      .map(([field, schema]) => schema instanceof EqualsSchema && isPrimitive(schema.expected) ? [field, schema.expected] : undefined)
      .filter((x) => x)
      .map((x) => unsafeCast(x))
  }
}

class DiscriminatorReport<T> {
  public readonly problems = new Map<keyof T, string>();
  public readonly validFields = new Map<keyof T, Map<PrimitiveValue, Constructor<T>>>();

  reject(k: keyof T, problem: string): this {
    this.problems.set(k, problem);
    return this;
  }

  accept(k: keyof T, mappings: Map<PrimitiveValue, Constructor<T>>): this {
    this.validFields.set(k, mappings);
    return this;
  }
}

export function detectDiscriminator<T>(ctors: Constructor<T>[]): keyof T {
  const report = discriminatorReports(ctors);

  if (report.validFields.size > 1)
    throw new Error(`Multiple possible discriminator fields: [${Array.from(report.validFields.keys()).join(', ')}]`);

  if (report.validFields.size === 0 && report.problems.size === 0)
    throw new Error(`No discriminator fields found in: [${ctors.map((c) => c.name).join(', ')}]`);

  let k = first(report.validFields.keys());
  if (k !== undefined) {
    return k;
  }

  let listOfFieldProblems = Array.from(report.problems.entries()).map(([k,problem]) => `${k}: ${problem}`);
  throw new Error(`No discriminator field found. Considered:${os.EOL}${listOfFieldProblems.join(os.EOL)}`);
}

export function discriminatorReports<T>(ctors: Constructor<T>[]): DiscriminatorReport<T> {
  const candidates = new CandidateDiscriminators<T>();
  for (let c of ctors) {
    candidates.addConstructor(c);
  }
  const report = new DiscriminatorReport<T>();
  for (const k of candidates.keys()) {
    const problem = candidates.problemWithDiscriminator(k);
    if (problem !== undefined)
      report.reject(k, problem);
    else
      report.accept(k, mapKeyValue((k: PrimitiveValue, v: Constructor<T>[]) => [k, v[0]], candidates.get(k)!))
  }
  return report;
}