import {BaseSchema} from "./index";
import {failure, Problems} from "../problems";
import {entries, typeDescription} from "./util";

enum EnumType {
  InitializedStrings,
  InitializedIntegers,
  Mixed
}

enum EntryType {
  StringMember,
  ReverseMapping,
  NumericMember,
  Invalid
}

export class EnumValueSchema<T extends object> extends BaseSchema<any, T[keyof T]> {
  private readonly enumValues: Set<any>;
  private readonly enumType: EnumType;
  private failureMessage: string;

  constructor(private readonly e: T) {
    super();
    let allStringMembers = true;
    let someStringMembers = false;

    this.enumValues = new Set<any>();
    for (let [k, v] of entries(this.e) as [string | number, any][]) {
      if(!isNaN(Number(k)))
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
        this.enumValues.add(v);

      if (entryType === EntryType.StringMember)
        someStringMembers = true;
      else if (this.e[v.toString()] != k)
        throw new Error(`Not a proper enum. e["${k}"] = ${JSON.stringify(v)} but e["${v}"] = ${JSON.stringify(this.e[v])}`);


    }
    this.enumType = allStringMembers ? EnumType.InitializedStrings :
      someStringMembers ? EnumType.Mixed :
        EnumType.InitializedIntegers;

    this.failureMessage = `expected one of [${Array.from(this.enumValues).map((v)=>JSON.stringify(v)).join(', ')}]`;
  }

  conform(value: any): Problems | T[keyof T] {
    if (this.enumValues.has(value))
      return value;

    return failure(this.failureMessage)
  }
}