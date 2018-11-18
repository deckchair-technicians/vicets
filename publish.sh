#!/usr/bin/env bash
set -x

./node_modules/.bin/tsc
rm -rf dist && \
cp -r src dist && \
cp package.json tsconfig.json README.md .npmrc dist && \
pushd dist && \
npm publish && \
popd
