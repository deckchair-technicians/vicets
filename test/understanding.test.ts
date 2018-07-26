import {expect} from "chai";

class Animal {
    public name: string = "Uberdog";

    constructor(name: string) {
        this.name = name;
    }
}

class Dog extends Animal {
    public bark(): string {
        return "woof";
    }
}

describe('Iterating keys', () => {
    it('Works as expected', () => {
        const instance: Dog = new Dog("Steve");

        const iterated: string[] = [];
        for (let k in instance) {
            iterated.push(k);
        }
        const expected = ['name'];

        expect(Object.keys(instance)).deep.equals(expected);
        expect(iterated).deep.equals(expected);
    })
});

function classDecorator<T extends { new(...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
        constructor(...args: any[]) {
            super(...args);
        }
    }
}


@classDecorator
class BigDog extends Dog {
    size: string = "very big";

    constructor(name: string) {
        super(name);
    }

}
function renameFunction(name, fn) {
    let function2 = new Function("return function (call) { return function " + name +
        " () { return call(this, arguments) }; };");
    return (function2())(Function.apply.bind(fn));
}

function data<T extends { new(plainObject:object): {} }>(constructor: T) {
    let newConstructor = function (plainObject: object) {
        let result = new constructor(plainObject);
        for (let k in plainObject) {
            this[k] = plainObject[k];
        }
        return this;
    };

    const decorated = renameFunction(constructor.name, newConstructor);
    decorated.prototype = constructor.prototype;
    return decorated as any as T;
}

class Data {
    constructor(plainObject:object){

    }
}

@data
class SomeData extends Data {
    test: number = 123;
}

let x = data(SomeData);


class P {
    constructor(private parent){
        this.parent = "parent" + parent;
    }
}
class C extends P {
    child = "child";
    constructor(value){
        super(value);
    }
}
let asf=C;
let c = new C("test");
describe('Class decorators', () => {
    it("Something", () => {
        let dog = new BigDog("Jeff");
        expect(dog).deep.equals({name: 'Jeff', size: 'very big'})
    });

    it("Something else", () => {
        let x = new SomeData({test: 'value'});
        expect(x).deep.equals({test: 'value'});
        expect(x).instanceOf(SomeData);
        expect(x instanceof SomeData).to.equal(true);
        expect(SomeData.name).to.equal('SomeData');
    });

    it("Can reverse prototype order", () => {
    });
});


class Parent {

}

class Child extends Parent {

}
console.log("name " + Object.getPrototypeOf(Child).name);