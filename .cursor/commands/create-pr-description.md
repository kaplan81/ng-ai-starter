# /create-pr-description

Generate a PR description based on branch changes. This command is used by `/create-pr` but can also be invoked standalone.

## Usage

Type `/create-pr-description` in the chat.

## Prerequisites

- **Git**: Must be in a git repository
- **Feature Branch**: Must be on a feature branch (not master)

## What this command does

1. Validates you're on a feature branch (not master)
2. Fetches latest master for comparison
3. Compares feature branch with master to analyze changes
4. Generates a PR description based on:
   - Git diff between branches
   - Conversation context from the current session
   - Changed files and their nature
5. Outputs the generated description

## PR Description Template

The generated PR description follows this structure:

### Mandatory Sections

These sections are **always included**:

```markdown
## ℹ️ What's this PR do?

- Description of changes

## 👀 Where should the reviewer start?

- Key files or areas to review first

## 📸 Screenshots (if appropriate)

(Include if UI changes, otherwise note "N/A - No UI changes")
```

### Optional Sections

These sections are included **only if relevant** to the changes:

```markdown
## 📱 How should this be tested?

### Unit tests

- Happy path
- Corner cases

### E2E tests

- Happy path
- Corner cases

### Devices

- Check feature in Desktop Chrome
- Check feature in Desktop Safari
- Check feature in Tablet Chrome
- Check feature in Tablet Safari
- Check feature in Mobile Android
- Check feature in Mobile IOS - Chrome
- Check feature in Mobile IOS - Safari

### Multi-currency

- Check multi-currency

### Multi-timezone

- Check multi-timezone

### Authorization

- Roles with permissions
- Roles without permissions
```

**Section inclusion criteria:**

| Section        | Include when...                                         |
| -------------- | ------------------------------------------------------- |
| Unit tests     | Code logic changes that should have unit test coverage  |
| E2E tests      | Feature changes that require end-to-end testing         |
| Devices        | UI/visual changes that need cross-device testing        |
| Multi-currency | Changes affecting currency display or calculations      |
| Multi-timezone | Changes affecting dates, times, or timezone handling    |
| Authorization  | Changes to routes, guards, or permission-based features |

## Implementation Steps

### Step 1: Validate Current Branch

```
CHECK: Is current branch "master"?
  - YES → EXIT with error: "You must be on a feature branch, not master"
  - NO → CONTINUE
STORE current branch as {feature_branch}
```

### Step 2: Fetch Latest Master

```
RUN: git fetch origin master
INFORM: "Fetching latest master..."
CONTINUE (master reference is now up to date for comparison)
```

### Step 3: Analyze Changes

```
RUN: git diff origin/master...HEAD --stat
RUN: git diff origin/master...HEAD --name-only
RUN: git log origin/master..HEAD --oneline
STORE changed files list
STORE commit messages
```

### Step 4: Generate PR Description

Based on:

1. **Changed files**: Analyze file paths to determine feature areas
2. **Commit messages**: Extract intent and scope of changes
3. **Session context**: Use any prior conversation context about the task
4. **Code diff**: Understand the nature of changes (UI, logic, tests, etc.)

Generate a PR description with:

- Mandatory sections (always included)
- Relevant optional sections based on change analysis

### Step 5: Output Description

```
DISPLAY: "Here's the generated PR description:"
OUTPUT: {generated_description}
```

## Example

### Input

```
Current branch: feature/B2BP-1234_add-export-button
Changed files:
  - src/app/modules/reports/components/export-button/...
  - src/app/modules/reports/services/export.service.ts
  - src/app/modules/reports/components/export-button/export-button.component.spec.ts
Commits:
  - feat: add export button to reports
  - test: add unit tests for export button
```

### Output

```markdown
## ℹ️ What's this PR do?

- Adds an export button to the reports module that allows users to download report data
- Implements the ExportService to handle data formatting and file generation
- Includes unit tests for the new component and service

## 👀 Where should the reviewer start?

- Start with `src/app/modules/reports/components/export-button/export-button.component.ts` for the main component logic
- Then review `src/app/modules/reports/services/export.service.ts` for the export functionality

## 📱 How should this be tested?

### Unit tests

- Happy path
- Corner cases

### Devices

- Check feature in Desktop Chrome
- Check feature in Desktop Safari
- Check feature in Tablet Chrome
- Check feature in Tablet Safari
- Check feature in Mobile Android
- Check feature in Mobile IOS - Chrome
- Check feature in Mobile IOS - Safari

## 📸 Screenshots (if appropriate)

(Add screenshots of the export button in the UI)
```

## Error Handling

The command handles various error scenarios:

- **On master branch**: Exits with clear message to switch to feature branch
- **Fetch fails**: Displays error (network issue or remote not available)
- **No commits on branch**: Warns that there are no changes to describe

## Related Commands

- `/create-pr`: Full PR creation workflow (uses this command internally)
- `/start-task`: Create Jira ticket and feature branch
