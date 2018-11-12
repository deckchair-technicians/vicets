export interface HasItemBehaviour {
  onUnexpected(behaviour: UnexpectedItemBehaviour): this;
  onMissing(behaviour: MissingItemBehaviour): this;
}

export enum UnexpectedItemBehaviour {
  DELETE = "delete",
  IGNORE = "ignore",
  PROBLEM = "problem"
}

export enum MissingItemBehaviour {
  IGNORE = "ignore",
  PROBLEM = "problem"
}

const unexpectedStrictnessOrder: UnexpectedItemBehaviour[] = [UnexpectedItemBehaviour.IGNORE, UnexpectedItemBehaviour.DELETE, UnexpectedItemBehaviour.PROBLEM];
const missingStrictnessOrder: MissingItemBehaviour[] = [MissingItemBehaviour.IGNORE, MissingItemBehaviour.PROBLEM];

export function greatest<T>(order:T[], a: T, b: T) {
  const aPrecedent = order.indexOf(a);
  const bPrecedent = order.indexOf(b);
  if (aPrecedent < 0) throw new Error(`Strictness of '${a}' is not specified`);
  if (bPrecedent < 0) throw new Error(`Strictness of '${b}' is not specified`);
  return aPrecedent > bPrecedent ? a : b;
}

export function strictestUnexpected(a: UnexpectedItemBehaviour, b: UnexpectedItemBehaviour): UnexpectedItemBehaviour {
  return greatest(unexpectedStrictnessOrder, a, b);
}

export function strictestMissing(a: MissingItemBehaviour, b: MissingItemBehaviour): MissingItemBehaviour {
  return greatest(missingStrictnessOrder, a, b);
}

