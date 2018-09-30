export interface HasUnexpectedItemBehaviour {
  onUnexpected(behaviour: UnexpectedItemBehaviour): this;
}

export enum UnexpectedItemBehaviour {
  DELETE = "delete",
  IGNORE = "ignore",
  PROBLEM = "problem"
}

const strictnessOrder: UnexpectedItemBehaviour[] = [UnexpectedItemBehaviour.IGNORE, UnexpectedItemBehaviour.DELETE, UnexpectedItemBehaviour.PROBLEM];

export function strictest(a: UnexpectedItemBehaviour, b: UnexpectedItemBehaviour): UnexpectedItemBehaviour {
  const aPrecedent = strictnessOrder.indexOf(a);
  const bPrecedent = strictnessOrder.indexOf(b);
  if (aPrecedent < 0) throw new Error(`Strictness of '${a}' is not specified`);
  if (bPrecedent < 0) throw new Error(`Strictness of '${b}' is not specified`);
  return aPrecedent > bPrecedent ? a : b;
}