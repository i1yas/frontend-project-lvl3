install:
	npm ci

start-dev:
	npx webpack serve

build:
	rm -rf dist
	NODE_ENV=production npx webpack

lint:
	npm run lint

test:
	npm test

.PHONY: test
