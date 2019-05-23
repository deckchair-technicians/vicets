import {BaseSchema} from "./index";
import {failure, problem, Problem, problems, ValidationResult} from "../problems";
import {typeDescription} from "./util/types";

export class UniqueSchema<T, V> extends BaseSchema<T[], T[]> {
  constructor(private readonly keyfn: (t: T) => V) {
    super()
  };

  conform(value: any): ValidationResult<T[]> {
    if (!(value instanceof Array))
      return failure(`${typeDescription(value)} was not an Array`);

    const countKeys = (m, t, i) => {
      const k: V = this.keyfn(t);
      if (!m.has(k))
        m.set(k, []);
      // @ts-ignore
      m.get(k).push(i);
      return m;
    };

    const keyCounts: Map<V, number[]> = value.reduce(countKeys, new Map<V, number[]>());
    const p: Problem[] = [];
    for (const [k, indexes] of keyCounts.entries()) {
      if (indexes.length === 1) continue;
      const message = `duplicate at indexes: [${indexes}]`;
      const map = indexes.map((i) => problem(message, [i]));
      p.push(...map)
    }
    return p.length > 0 ? problems(...p) : value;
  }

}