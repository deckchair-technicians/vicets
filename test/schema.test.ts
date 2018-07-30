import "reflect-metadata";
import {expect} from 'chai';
import {eq, failure, object, predicate, problem, problems, schema, Schema, schematize} from "../src/schema";
import {ObjectSchema} from "../src/impl/schema";


describe('predicate schema', () => {
    it('Uses function body as failure message', () => {
        const isEven = predicate<number>((x) => x % 2 === 0);

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

describe('and', () => {
    it('Passes result of first schema to second, and so on', () => {
        const s = schema((x) => `${x} => first`)
            .and(schema((x) => `${x} => second`));

        expect(s.conform("value")).equals("value => first => second");
    });
    it('Short circuits on first failure', () => {
        const s =
            schema((x) => failure("short circuit"))
                .and(schema((x) => "should never get here"));

        expect(s.conform("anything")).deep.equals(failure("short circuit"));
    });
});

describe('first', () => {
    it('Returns the result of the first schema that passes, or all problems from all schemas', () => {
        const s =
            predicate(
                (x) => x === "passes first",
                "failed first predicate")
                .or(predicate(
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
        const s: Schema<object, object> = object({a: eq(1)});

        expect(s.conform({a: 2})).deep.equals(failure(
            "expected 1 but got 2",
            ['a']));
        expect(s.conform({a: 1})).deep.equals({a: 1});
    });

    it('Can be nested', () => {
        const s: ObjectSchema = object({a: {b: eq(1)}});

        expect(s.conform({a: {b: 2}})).deep.equals(failure(
            "expected 1 but got 2",
            ['a', 'b']));
        expect(s.conform({a: {b: 1}})).deep.equals({a: {b: 1}});
    });
});


describe('schematize', () => {
    it('Treats functions as predicates, with function body as failure message', () => {
        const isEven = schematize((x) => x % 2 === 0);
        expect(isEven.conform(1)).deep.equals(failure("(x) => x % 2 === 0"));
    });

    it('Passthrough on anything that is already a schema', () => {
        const s = eq(1) as any as Schema<number, number>;
        expect(schematize(s)).equals(s);
    });

    it('Turns plain objects into ObjectSchema', () => {
        const s = schematize({a: eq(1)});
        expect(s).instanceOf(ObjectSchema);
    });
});
