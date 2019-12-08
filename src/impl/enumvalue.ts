import {BaseSchema, failure, ValidationResult} from "./";
import {analyseEnum, EnumType} from "./util/analyseEnum";


export class EnumValueSchema<T extends object> extends BaseSchema<any, T[keyof T]> {
  private readonly enumValues: Set<any>;
  private readonly enumType: EnumType;
  private failureMessage: string;

  constructor(private readonly e: T) {
    super();
    const {values, type} = analyseEnum(this.e);

    this.enumValues = values;
    this.enumType = type

    this.failureMessage = `expected one of [${Array.from(this.enumValues).map((v) => JSON.stringify(v)).join(', ')}]`;
  }

  conform(value: any): ValidationResult<T[keyof T]> {
    if (this.enumValues.has(value))
      return value;

    return failure(this.failureMessage)
  }

  toJSON(): any {
    switch (this.enumType) {
      case EnumType.InitializedIntegers:
        return {
          type: "number",
          enum: [...this.enumValues]
        };
      case EnumType.InitializedStrings:
        return {
          type: "string",
          enum: [...this.enumValues]
        };
      case EnumType.Mixed:
        return {
          type: ["string", "number"],
          enum: [...this.enumValues]
        };
      default:
        throw new Error(`Enum type ${JSON.stringify(this.enumType)} not supported`);
    }
  }
}