help: ## Shows help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## Installs dependencies
	npm install

start: ## Start the application
	docker-compose up

test: ## Runs tests
	npm run test

lint: ## Runs linter on codebase
	npm run lint

build: ## Builds the React app
	npm run build

clean: # Clean the build directory and docker images
	rm -rf dist
	docker-compose down -v

build-image: ## Builds Docker image locally
	docker build . -t local/nihongo-stats

run-local-image: ## Runs the local Docker image on port 8080
	docker run -it --rm -p 8081:80 local/nihongo-stats