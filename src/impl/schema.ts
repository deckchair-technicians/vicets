import {failure, isError, isSuccess, problems, Problems, Schema, schematize, ValidationResult} from "../schema";

export class AndSchema implements Schema {
    constructor(private readonly schemas: Schema[]) {
    }

    conform(value: any): ValidationResult {
        let result = value;
        for (let s of this.schemas) {
            result = s.conform(result);
            if (isError(result)) return result;
        }
        return result;
    }

}

export class OrSchema implements Schema {
    constructor(private readonly schemas: Schema[]) {
    }

    conform(value: any): ValidationResult {
        const failures: Problems[] = [];
        for (let s of this.schemas) {
            let result = s.conform(value);

            if (isSuccess(result)) return result;

            failures.push(result);
        }
        return problems().merge(...failures);
    }

}

export class NumberSchema implements Schema {
    conform(value: any): ValidationResult {
        switch (typeof value) {
            case 'number':
                return value;
            case 'string':
                let parsed = Number.parseFloat(value);
                if (Number.isNaN(parsed)) return failure("must be a number");
                return parsed;
            default:
                return failure("must be a number");
        }
    }
}

export class BetweenSchema implements Schema {
    constructor(private readonly lower: number,
                private readonly upper: number) {
    }

    conform(value: any): ValidationResult {
        if (typeof value != 'number') return failure(`${value} is not a number`);
        if (value < this.lower) return failure(`${value} should be greater or equal to ${this.lower}`);
        if (value >= this.upper) return failure(`${value} should be less than ${this.upper}`);
        return value;
    }

    toString(): string {
        return `between ${this.lower} and ${this.upper}`
    }
}

export class ObjectSchema implements Schema {
    private readonly schemas: { [a: string]: Schema };

    constructor(object: object) {
        this.schemas = {};
        for (let k in object) {
            this.schemas[k] = schematize(object[k]);
        }
    }

    conform(value: any): ValidationResult {
        const result = {};
        let problems = new Problems([]);

        for (let k in this.schemas) {
            const s: Schema = this.schemas[k];
            const v: ValidationResult = s.conform(value[k]);
            if (isError(v))
                problems = problems.merge((v as Problems).prefixPath([k]));
            result[k] = v;
        }

        if (problems.problems.length > 0)
            return problems;

        return result;
    }

    toString(): string {
        return this.schemas.toString();
    }
}

export class DelegatingSchema implements Schema {
    constructor(public readonly conform: (value: any) => ValidationResult) {
    }
}