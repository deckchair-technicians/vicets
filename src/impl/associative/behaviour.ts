import {conform} from "../../helpers";
import {ValidationResult} from "../../problems";
import {Schema} from "../../schema";
import {BaseSchema} from "../core";
import {subSchemaJson} from "../../jsonSchema";

export enum UnexpectedItemBehaviour {
  DELETE = "delete",
  IGNORE = "ignore",
  PROBLEM = "problem"
}

export enum MissingItemBehaviour {
  IGNORE = "ignore",
  PROBLEM = "problem"
}

export interface Behaviour {
  readonly unexpected: UnexpectedItemBehaviour;
  readonly missing: MissingItemBehaviour;
  readonly leakActualValuesInError: boolean;
}

let BEHAVIOUR: Behaviour = {
  unexpected: UnexpectedItemBehaviour.PROBLEM,
  missing: MissingItemBehaviour.PROBLEM,
  leakActualValuesInError: false,
};

export function behaviour(): Behaviour {
  return BEHAVIOUR;
}

export function usingBehaviour<T>(behaviour: Partial<Behaviour>, fn: () => T): T {
  const old = BEHAVIOUR;
  BEHAVIOUR = Object.assign({}, old, behaviour);
  try {
    return fn();
  }
  finally {
    BEHAVIOUR = old;
  }
}

export class BehaviourSchema<IN, OUT> extends BaseSchema<IN, OUT> {
  constructor(
    private readonly behaviour: Partial<Behaviour>,
    private readonly subSchema: Schema<IN, OUT>) {
    super();
  }

  conform(value: IN): ValidationResult<OUT> {
    return usingBehaviour(
      this.behaviour,
      () => conform(this.subSchema, value));
  }

  toJSON(toJson?: (s: Schema) => any): any {
    return {
      ...subSchemaJson(this.subSchema, toJson),
      additionalProperties: this.behaviour.unexpected !== UnexpectedItemBehaviour.PROBLEM
    };
  }
}