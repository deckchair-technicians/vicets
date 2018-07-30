import {isError, isSuccess, Problems, Schema, schematize, ValidationResult} from "../schema";

export abstract class BaseSchema<IN, OUT> implements Schema<IN, OUT> {
    constructor() {
    }

    or<NEWIN extends IN, NEWOUT>(this: this, s: Schema<NEWIN, NEWOUT>): Schema<IN, OUT | NEWOUT> {
        return new OrSchema(this, s)
    }

    and<NEWOUT>(this: this, s: Schema<OUT, NEWOUT>): Schema<IN, NEWOUT> {
        return new AndSchema(this, s)
    }

    def(this: this): OUT {
        return this as any as OUT;
    }

    abstract conform(value: IN): Problems | OUT;

}

export class AndSchema<IN, INTERMEDIATE, OUT> extends BaseSchema<IN, OUT> {
    constructor(private readonly first: Schema<IN, INTERMEDIATE>,
                private readonly second: Schema<INTERMEDIATE, OUT>) {
        super();
    }

    conform(value: IN): Problems | OUT {
        let intermediate = this.first.conform(value);

        if (intermediate instanceof Problems) return intermediate;

        return this.second.conform(intermediate)
    }
}

class OrSchema<IN, OUT1, OUT2> extends BaseSchema<IN, OUT1 | OUT2> {
    constructor(private readonly first: Schema<IN, OUT1>,
                private readonly second: Schema<IN, OUT2>) {
        super();
    }

    conform(value: IN): Problems | (OUT1 | OUT2) {
        const failures: Problems[] = [];
        for (let s of [this.first, this.second]) {
            let result = s.conform(value);

            if (isSuccess(result)) return result;

            failures.push(result as Problems);
        }
        return failures.reduce((a: Problems | null, ps: Problems) => a ? a.merge(ps) : ps);
    }

}

export class ObjectSchema extends BaseSchema<object, object> {
    private readonly schemas: { [a: string]: Schema<any, any> };

    constructor(object: object) {
        super();
        this.schemas = {};
        for (let k in object) {
            this.schemas[k] = schematize(object[k]);
        }
    }

    conform(value: any): ValidationResult {
        const result = {};
        let problems = new Problems([]);

        for (let k in this.schemas) {
            const s: Schema<any,any> = this.schemas[k];
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

export class DelegatingSchema<IN, OUT> extends BaseSchema<IN, OUT> {
    constructor(private readonly delegatedConform: (value: IN) => Problems | OUT) {
        super();
    }

    conform(value: IN): Problems | OUT {
        return this.delegatedConform(value);
    }
}