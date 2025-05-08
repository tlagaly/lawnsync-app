# LawnSync Git Workflow

## Branch Structure

- `master` - Production branch containing stable releases
- `development` - Main development branch where features are integrated
- `feature/*` - Feature branches for new functionality
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Urgent fixes for production

## Workflow for New Features

1. Always create new feature branches from the `development` branch:
   ```
   git checkout development
   git pull origin development
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them with descriptive messages:
   ```
   git add .
   git commit -m "Feature: Descriptive message about the change"
   ```

3. Push your feature branch to the remote repository:
   ```
   git push -u origin feature/your-feature-name
   ```

4. Create a pull request to merge your changes into the `development` branch

## Workflow for Bug Fixes

1. Create bug fix branches from the `development` branch:
   ```
   git checkout development
   git pull origin development
   git checkout -b bugfix/bug-description
   ```

2. For critical production issues, create hotfix branches from `master`:
   ```
   git checkout master
   git pull origin master
   git checkout -b hotfix/critical-issue-description
   ```

3. After fixing, commit with descriptive messages:
   ```
   git add .
   git commit -m "Fix: Description of the bug fix"
   ```

4. Push your branch and create a pull request

## Pull Request Process

1. Ensure your code follows project coding standards
2. Update documentation as needed
3. Include a clear description of changes in the PR
4. Request review from at least one team member
5. Address feedback and make requested changes

## Code Review Guidelines

1. Focus on code quality, readability, and maintainability
2. Check for potential bugs or performance issues
3. Verify that the code meets requirements
4. Provide constructive feedback

## Merging Strategy

1. Feature branches merge into `development`
2. `development` is periodically merged into `master` for releases
3. Hotfixes merge into both `master` and `development`
4. Always use pull requests for merging

## Complete Branch Lifecycle Management

1. **After a PR is approved and merged**, always clean up the feature branch:
   ```
   # Delete the local branch
   git checkout development
   git branch -d feature/your-feature-name
   
   # Delete the remote branch
   git push origin --delete feature/your-feature-name
   ```

2. **Important:** Both local and remote branches must be deleted to prevent repository clutter and confusion.

## Branch Synchronization Procedure

1. **Daily Synchronization Routine**:
   ```
   # Update your local copy of all remote branches
   git fetch --all --prune
   
   # Sync master branch
   git checkout master
   git pull origin master
   
   # Sync development with master to ensure it's not behind
   git checkout development
   git pull origin development
   
   # If development is behind master, merge master into development
   git merge master
   git push origin development
   ```

2. **After pulling from remote**, check if your branch needs updating:
   ```
   git branch -vv
   ```
   Look for `[behind]` indicators and resolve them by merging from the source branch.

3. **Before starting new work**, always ensure your local branches are up-to-date with remote:
   ```
   git fetch --all
   git checkout development
   git pull origin development
   ```

## Repository Health Checks

Perform these checks weekly to ensure repository health:

1. **Clean up stale references**:
   ```
   git fetch --all --prune
   ```

2. **Identify branch sync status**:
   ```
   git branch -vv
   ```
   Look for `[ahead]`, `[behind]`, or `[gone]` indicators.

3. **Find and clean up stale local branches**:
   ```
   # List merged branches that can be safely deleted
   git branch --merged
   
   # Delete a merged branch
   git branch -d branch-name
   ```

4. **Update all tracking branches**:
   ```
   git pull --all
   ```

## Release Process

1. Create a release branch from `development` when ready:
   ```
   git checkout development
   git pull origin development
   git checkout -b release/v1.x.x
   ```

2. Test thoroughly and fix any issues directly in the release branch
3. Once stable, merge to `master` and tag the release:
   ```
   git checkout master
   git pull origin master
   git merge release/v1.x.x
   git tag -a v1.x.x -m "Version 1.x.x"
   git push origin master --tags
   ```

4. Merge the release branch back to `development`:
   ```
   git checkout development
   git pull origin development
   git merge release/v1.x.x
   git push origin development
   ```

5. Delete the release branch both locally and remotely:
   ```
   git branch -d release/v1.x.x
   git push origin --delete release/v1.x.x
   ```

## Commit Message Guidelines

Use semantic commit messages for clarity:

- `Feature:` - New functionality
- `Fix:` - Bug fixes
- `Docs:` - Documentation changes
- `Style:` - Formatting changes (not affecting code behavior)
- `Refactor:` - Code changes that don't fix bugs or add features
- `Test:` - Adding or updating tests
- `Chore:` - Maintenance tasks, dependency updates, etc.

Example: `Feature: Add weather forecast display to dashboard`

## Automation Scripts

The following scripts are available in the `scripts/git/` directory to automate Git workflow tasks:

- `git-sync.sh` - Daily branch synchronization
- `git-cleanup.sh` - Branch cleanup after merges
- `git-health-check.sh` - Repository health monitoring

Run these scripts regularly to maintain repository health and branch alignment.

## Git Hooks

Git hooks are installed in `.git/hooks/` to enforce good practices:

- `pre-push` - Prevents pushing to master directly and warns if branches are out of sync
- `post-merge` - Notifies of any branches that need updating after a merge

These hooks help prevent synchronization issues automatically.