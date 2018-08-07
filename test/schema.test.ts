import "reflect-metadata";
import {expect} from 'chai';
import {
  eq,
  failure,
  isin,
  isurl,
  matches,
  object,
  predicate,
  problem,
  problems,
  schema,
  Schema,
  schematize
} from "../src/";
import {fail} from "assert";
import {ObjectSchema} from "../src/impl/obj";
import {EqualsSchema} from "../src/impl/eq";


describe('predicate', () => {
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

describe('or', () => {
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

describe('object', () => {
    it('Appends key to path in problems', () => {
        const s: Schema<object, object> = object({a: eq(1)});

        expect(s.conform({a: 2})).deep.equals(failure(
            "expected 1 but got 2",
            ['a']));
        expect(s.conform({a: 1})).deep.equals({a: 1});
    });

    it('Can be nested', () => {
        const s: Schema<object,object> = object({a: {b: eq(1)}});

        expect(s.conform({a: {b: 2}})).deep.equals(failure(
            "expected 1 but got 2",
            ['a', 'b']));
        expect(s.conform({a: {b: 1}})).deep.equals({a: {b: 1}});
    });
});

describe('isin', () => {
  let s :Schema<any,string>= isin('a', 'b', 'c');
    it('passes through valid values', ()=>{
        expect(s.conform("a")).to.equal('a');
        expect(s.conform("b")).to.equal('b');
        expect(s.conform("c")).to.equal('c');
    });
    it('fails if value not in set', ()=>{
      expect(s.conform("not in set")).deep.equals({problems:[{message:'expected one of [a, b, c]', path: []}]});
    })
});

describe('matches', () => {
  let s :Schema<any,string>= matches(/.*abc.*/);
    it('passes through valid values', ()=>{
        expect(s.conform("123abc456")).to.equal('123abc456');
        expect(s.conform("abcabc")).to.equal('abcabc');
    });
    it('fails if value doesnt match pattern', ()=>{
        expect(s.conform("does not match")).deep.equals({problems:[{message:'did not match /.*abc.*/', path: []}]});
    });
});

describe('isurl', () => {
  const s: Schema<any, string> = isurl();
  it('passes through valid values', () => {
    expect(s.conform("http://google.com")).to.equal("http://google.com");
    expect(s.conform("http://google.com/test.html")).to.equal("http://google.com/test.html");
  });
  it('fails if value doesnt match pattern', () => {
    expect(s.conform("http://?google.com/test.html"))
      .deep.equals({problems: [{message: 'not a valid url: http://?google.com/test.html', path: []}]});

    expect(s.conform("http://localhost"))
      .deep.equals({problems: [{message: 'not a valid url: http://localhost', path: []}]});
  });
  it('passes through options', () => {
    let s: Schema<any, string> = isurl({require_tld:false});
    expect(s.conform("http://localhost/test.html")).to.equal("http://localhost/test.html");
  });
});

describe('schematize', () => {
    it('Treats functions as predicates, with function body as failure message', () => {
        const isEven = schematize((x) => x % 2 === 0);
        expect(isEven.conform(1)).deep.equals(failure("(x) => x % 2 === 0"));
    });

    xit('Returns EnumSchema for enums', ()=>{fail('Not implemented')});
    xit('Returns InstanceOfSchema for classes', ()=>{fail('Not implemented')});

    it('Passthrough on anything that is already a schema', () => {
        const s = eq(1) as any as Schema<number, number>;
        expect(schematize(s)).equals(s);
    });

    it('Turns plain objects into ObjectSchema', () => {
        const s = schematize({a: eq(1)});
        expect(s).instanceOf(ObjectSchema);
    });

    it('Turns primitives into EqualsSchema', () => {
        expect(schematize(1)).instanceOf(EqualsSchema);
        expect(schematize('something')).instanceOf(EqualsSchema);
        expect(schematize(true)).instanceOf(EqualsSchema);
    });
});
