import "reflect-metadata";
import {expect} from 'chai';
import {
    between, chain, failure, first, gt, object, predicate, problem, problems, schema, Schema,
    schematize
} from "../src/schema";
import {ObjectSchema} from "../src/impl/schema";


describe('predicate schema', () => {
    it('Uses function body as failure message', () => {
        const isEven = predicate((x) => x % 2 === 0);

        expect(isEven.conform(1)).deep.equals(failure("(x) => x % 2 === 0"));
        expect(isEven.conform(2)).equals(2);
    });

    it('Accepts a failure message string', () => {
        const s = predicate((x) => x === 2, "!== 2");

        expect(s.conform(1)).deep.equals(failure("!== 2"));
        expect(s.conform(2)).equals(2);
    });

    it('Accepts a failure message function', () => {
        const s = predicate((x) => x === 2, (v) => `${v} !== 2`);

        expect(s.conform(1)).deep.equals(failure("1 !== 2"));
        expect(s.conform(2)).equals(2);
    })
});

describe('chain', () => {
    it('Passes result of first schema to second, and so on', () => {
        const s = chain(
            schema((x) => `${x} => first`),
            schema((x) => `${x} => second`));

        expect(s.conform("value")).equals("value => first => second");
    });
    it('Short circuits on first failure', () => {
        const s = chain(
            schema((x) => failure("short circuit")),
            schema((x) => "should never get here"));

        expect(s.conform("anything")).deep.equals(failure("short circuit"));
    });
    it('Returns value if no schemas are provided', () => {
        const s = chain();

        expect(s.conform("passthrough")).equals("passthrough");
    });
});

describe('first', () => {
    it('Returns the result of the first schema that passes, or all problems from all schemas', () => {
        const s = first(
            predicate(
                (x) => x === "passes first",
                "failed first predicate"),
            predicate(
                (x) => x === "passes second",
                "failed second predicate"));

        expect(s.conform("passes first")).equals("passes first");
        expect(s.conform("passes second")).equals("passes second");

        expect(s.conform("fails both")).deep.equals(problems(
            problem("failed first predicate"),
            problem("failed second predicate")
        ));
    });
});

describe('object schema', () => {
    it('Appends key to path in problems', () => {
        const s: Schema = object({a: gt(1)});

        expect(s.conform({a: 1})).deep.equals(failure(
            "must be greater than 1",
            ['a']));
        expect(s.conform({a: 2})).deep.equals({a: 2});
    });

    it('Can be nested', () => {
        const s: Schema = object({a: {b: gt(1)}});

        expect(s.conform({a: {b: 1}})).deep.equals(failure(
            "must be greater than 1",
            ['a', 'b']));
        expect(s.conform({a: {b: 2}})).deep.equals({a: {b: 2}});
    });
});


describe('schematize', () => {
    it('Treats functions as predicates, with function body as failure message', () => {
        const isEven = schematize((x) => x % 2 === 0);
        expect(isEven.conform(1)).deep.equals(failure("(x) => x % 2 === 0"));
    });

    it('Passthrough on anything that is already a schema', () => {
        const s: Schema = between(1, 2) as any as Schema;
        expect(schematize(s)).equals(s);
    });

    it('Turns plain objects into ObjectSchema', () => {
        const s: Schema = schematize({a: between(1, 2)});
        expect(s).instanceOf(ObjectSchema);
    });
});
