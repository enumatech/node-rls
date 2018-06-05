all: docs

docs:
	npx jsdoc -a all -r -c jsdoc.json -d doc --verbose --debug --pedantic . README.md

clean:
	rm -rf doc
