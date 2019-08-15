import {BaseSchema, failure, Problems, Schema, ValidationResult} from "./";

export class SelectSchema<T> extends BaseSchema<any, T> {
  constructor(private readonly path: string[],
              private readonly subschema: Schema<any, T>) {
    super()
  };

  conform(value: any): ValidationResult<T> {
    if (typeof value !== 'object')
      return failure("expected an object");

    let target: any = value;
    let atPath: string[] = [];
    for (const key of this.path) {
      atPath.push(key);
      if (!(key in target))
        return failure("no value", atPath);
      target = target[key];
    }
    const result = this.subschema.conform(target);
    return result instanceof Problems
      ? result.prefixPath(this.path)
      : result;
  }

  toJSON(): any {
    throw new Error("Not implemented");
  }
}