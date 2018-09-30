import {BaseSchema} from "./index";
import {failure, Problems, ValidationResult} from "../problems";
import {Schema} from "../schema";
import {typeDescription} from "./util";

export class SetOfSchema<T> extends BaseSchema<any, Set<T>> {
  constructor(private readonly itemSchema: Schema<any, T>) {
    super();
  }

  conform(value: any): ValidationResult<Set<T>> {
    if (!(value instanceof Set || value instanceof Array))
      return failure(`${typeDescription(value)} was not an Array or a Set`);

    const entries: Iterable<[any,any]> = value instanceof Set ? value.entries() : value.map((v, i)=>[i,v] as [any,any]);

    const conformed = new Set<T>();
    let problems = new Problems([]);
    for (const [k, v] of entries) {
      const c = this.itemSchema.conform(v);
      if (c instanceof Problems)
        problems = problems.merge(c.prefixPath([k]));
      else
        conformed.add(c);
    }
    if (problems.length > 0)
      return problems;

    return conformed;
  }

}