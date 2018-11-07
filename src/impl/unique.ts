import {BaseSchema} from "./index";
import {failure, problem, Problem, problems, ValidationResult} from "../problems";
import {typeDescription} from "./util";

export class UniqueSchema<T, V> extends BaseSchema<any, T[]> {
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
    const ps = problems(...p);
    return ps !== undefined ? ps : value;
  }

}