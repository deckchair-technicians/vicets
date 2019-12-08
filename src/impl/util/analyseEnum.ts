import {typeDescription} from "./types";

enum EntryType {
  StringMember,
  ReverseMapping,
  NumericMember,
  Invalid
}

export enum EnumType {
  InitializedStrings,
  InitializedIntegers,
  Mixed
}

export function analyseEnum<T>(e: T): { values: Set<any>, type: EnumType } {
  let allStringMembers = true;
  let someStringMembers = false;
  const values = new Set<any>();
  for (let [k, v] of Object.entries(e) as [string | number, any][]) {
    if (!isNaN(Number(k)))
      k = Number(k);

    const valueType: string = typeof v;
    const keyType: string = typeof k;

    const entryType: EntryType =
      (keyType === 'string' && valueType === 'string') ? EntryType.StringMember :
        (keyType === 'string' && valueType === 'number') ? EntryType.NumericMember :
          (keyType === 'number' && valueType === 'string') ? EntryType.ReverseMapping :
            EntryType.Invalid;

    if (entryType === EntryType.Invalid)
      throw new Error(
        `Entries must be string:number, number:string or string:string. Field '${k}' was ${typeDescription(k)}:${typeDescription(v)}.`);

    if (entryType !== EntryType.StringMember)
      allStringMembers = false;

    if (entryType !== EntryType.ReverseMapping)
      values.add(v);

    if (entryType === EntryType.StringMember)
      someStringMembers = true;
    else if (e[v.toString()] != k)
      throw new Error(`Not a proper enum. e["${k}"] = ${JSON.stringify(v)} but e["${v}"] = ${JSON.stringify(e[v])}`);
  }
  const type = allStringMembers ? EnumType.InitializedStrings :
    someStringMembers ? EnumType.Mixed :
      EnumType.InitializedIntegers;

  return {values, type};
}