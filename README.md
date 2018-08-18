[![build status](https://circleci.com/gh/deckchair-technicians/vicets.svg?style=shield&circle-token=4c1dca1339ec95af57915dfc0db864c3ff5a0ab8)](https://circleci.com/gh/deckchair-technicians/vicets)
[![npm version](https://badge.fury.io/js/%40deckchair-technicians%2Fvice.svg)](https://badge.fury.io/js/%40deckchair-technicians%2Fvice)


# Why?


* Schema and class are defined in the same place
* Less noisy and verbose that field decorators
* Schema can be separated from the class, and created without a class
* Type safety ensure schema output matches intended field type
* Provide some reassurance that if `x instanceof SomeDataClass`, then x conforms to the schema of SomeClass. Removes the need to consider whether `x` needs to be validated again.