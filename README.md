## Nihongo Stats

Nihongo Stats is a statistics aggregation tool for Japanese learning platforms like Anki, BunPro, and Wanikani

## Bugs and Feature Requests

If you have a feature request or bug you would like to report please
use [GitHub Issues](https://github.com/ranger-ross/nihongo-stats/issues) to report them.

When opening an issue please do you best to include as much information as possible.

### Bugs

If you are reporting a bug please include a description of the bug and a screenshot of the issue if possible.

### Feature Requests

If you are requesting a new feature, please include why it is important and use cases. Also feel free to include ideas
and possible ways to implement the feature.

## Contributing

This project is open source, and you are welcome to contribute to it.

### Pull Requests

Before submitting a pull request, make sure that there is an Open GitHub issue for the bug/feature. Be sure to reference
the issue in your pull request to make it easy to find for code reviewers.

When introducing UI changes, be sure include screenshots of the new UI in the pull request description.

#### Tests

Writing new tests for you changes are preferred but not required for UI changes. However, if you have a utility method
or other piece of code that can be easily tested, tests maybe be requested before your pull request is accepted.

Be sure that your changes do not break any existing tests. If you need to remove a test please explain why that test is
no longer needed in the pull request description.

### Development

#### Prerequisites

- Docker + Docker Compose
- NodeJS
- (Optional) GNU Make

#### Installing Dependencies

Run `make install` to install NPM dependencies

#### Starting the Application

Run `make start` to start application in Docker and serve it on `localhost:3000`

#### Running Tests

Run `make test` to run the Jest tests

#### Help

For a full list of useful commands, run `make help`
