all:
	@echo "No target specified"
	exit 1

publish:
	npm run-script docs
	npm run-script test
	npm publish
