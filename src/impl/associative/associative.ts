import {Schema} from "../../schema";
import {BaseSchema} from "../index";
import {failure, isError, Problems, ValidationResult} from "../../problems";

export interface HasUnexpectedItemBehaviour {
  changeBehaviour(unexpectedItemBehaviour: UnexpectedItemBehaviour) : this;
}

export interface Associative<K, V> {
  set(k: K, v: V): this;

  delete(k: K): boolean;

  has(k: K): boolean;

  get(k: K): any;

  keys(): Iterable<K>;
}

export enum UnexpectedItemBehaviour {
  DELETE="delete",
  IGNORE="ignore",
  PROBLEM="problem"
}

const strictnessOrder : UnexpectedItemBehaviour[] = [UnexpectedItemBehaviour.IGNORE, UnexpectedItemBehaviour.DELETE, UnexpectedItemBehaviour.PROBLEM];

export function strictest(a:UnexpectedItemBehaviour, b:UnexpectedItemBehaviour) : UnexpectedItemBehaviour {
  const aPrecedent = strictnessOrder.indexOf(a);
  const bPrecedent = strictnessOrder.indexOf(b);
  if(aPrecedent < 0) throw new Error(`Strictness of '${a}' is not specified`);
  if(bPrecedent < 0) throw new Error(`Strictness of '${b}' is not specified`);
  return aPrecedent > bPrecedent ? a : b;
}

export function conformInPlace<K, V>(unexpectedItems: UnexpectedItemBehaviour,
                                     thing: Associative<K, V>,
                                     itemSchemas: Iterable<[K, Schema]>): Problems | undefined {

  let problems = new Problems([]);
  const unmatchedThingKeys = new Set(thing.keys());
  for (const [k, s] of itemSchemas) {
    if (!(thing.has(k))) {
      if (s[isOptional] !== true)
        problems = problems.merge(failure("No value", [k]));
      continue;
    }
    unmatchedThingKeys.delete(k);

    const v: ValidationResult<any> = s.conform(thing.get(k));

    if (isError(v)) {
      problems = problems.merge((v as Problems).prefixPath([k]));
    }
    else
      thing.set(k, v);
  }

  for (const k of unmatchedThingKeys) {
    switch (unexpectedItems) {
      case UnexpectedItemBehaviour.IGNORE:
        break;
      case UnexpectedItemBehaviour.DELETE:
        thing.delete(k);
        break;
      case UnexpectedItemBehaviour.PROBLEM:
        problems = problems.merge(failure("Unexpected item", [k]));
        break;
      default:
        throw new Error(`Not implemented- ${unexpectedItems}`);
    }
  }

  return problems.length > 0 ? problems : undefined;
}

const isOptional = Symbol("isOptional");

export class TagSchemaAsOptional<IN, OUT> extends BaseSchema<IN, OUT | undefined> {
  [isOptional] = true;

  constructor(private readonly subschema: Schema<IN, OUT>) {
    super();
  }

  conform(value: IN): Problems | OUT | undefined {
    return value === undefined ? undefined : this.subschema.conform(value);
  }

}

