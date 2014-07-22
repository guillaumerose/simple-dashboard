all: unit func

tdd:
	./node_modules/.bin/mocha --watch

unit:
	./node_modules/.bin/mocha

func:
	./node_modules/.bin/jasmine-node --coffee --verbose ./test/frisby

debug:
	./node_modules/.bin/nodemon --debug app/launcher.js

start:
	pm2 start processes.json

stop:
	pm2 stop processes.json

restart:
	pm2 restart processes.json

run:
	./node_modules/.bin/nodemon app/launcher.js

.PHONY: test
