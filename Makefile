all: unit func

tdd:
	./node_modules/.bin/mocha --watch

unit:
	./node_modules/.bin/mocha

func:
	./node_modules/.bin/jasmine-node --coffee --verbose ./test/frisby

debug:
	./node_modules/.bin/nodemon --debug launcher.js

start:
	./node_modules/.bin/forever start launcher.js

stop:
	./node_modules/.bin/forever stop launcher.js

run:
	./node_modules/.bin/nodemon launcher.js

.PHONY: test
