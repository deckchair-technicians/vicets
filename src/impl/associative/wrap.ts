import {Associative} from "./associative";
import {ObjectStrategies} from "./obj";
import {TupleStrategies} from "./tuple";

export function wrapAssociative(actual: any): Associative<any, any> {
  if (actual instanceof Array)
    return new TupleStrategies(actual);
  if (typeof actual === 'object')
    return new ObjectStrategies(actual);
  throw new Error(`Not supported: ${typeof actual}`);
}

export function empty(actual: any): any {
  if (actual instanceof Array)
    return [];
  if (typeof actual === 'object')
    return {};
  throw new Error(`Not supported: ${typeof actual}`);
}