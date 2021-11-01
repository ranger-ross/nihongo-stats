help: ## Shows help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## Installs dependencies
	npm install

start: ## Start the application
	npm run dev

build: ## Builds the React app
	npm run build

clean: # Clean the build directory
	rm -rf dist