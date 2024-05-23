Develop
=======

We have a rather standard pipeline for contributing new code:

1. You create a new branch and start developing.
2. You create a new pull request.
3. You wait for CI to pass and a code review.
4. We merge the pull request.

Atomicity of Pull Request
-------------------------

Each pull request should land the code in a functioning state. When we, from the future, try to locate a bug introduced in the past, we do not want to have commits, at which point, the code itself is broken. It would make debugging a nightmare.

Therefore, we should:

1. Keep each pull request as small as possible.
2. Use squash merge whenever possible.
3. Fast-forward merge is okay if all commits passed CI.
4. No rebasing, since we do not know if middle commits passed CI.
5. Definitely no merge commits.

Branch
------

We use prefixes to categorize branches, such as ``feature/``, ``bugfix/``, or ``refactor/``.

A branch should be deleted if merged.

We only actively developing branches and experimental ones. Nevertheless, we should strive to "archive" experimental branches whenever possible, as soon as possible. We do not want branches to pile up.

CI
--

Our CI does the following things:

- Perform style check.
- Perform linting and type checking.
- Run all tests.

Style check is performed at a global repo level. For the rest, we run the job for each package. We use a script to determine which package is impacted by a pull request, based on the paths of changed files. If a package has changed, CI will be executed against it and all of its dependents.

CD
--

We do not use continuous deployment at this moment. All deployments are done manually.