# /create-pr

Interactive command to generate a PR description and optionally create a Pull Request via GitHub MCP.

## Usage

Type `/create-pr` in the chat and follow the prompts.

## Prerequisites

- **Git**: Must be in a git repository
- **Feature Branch**: Must be on a feature branch (not master)
- **Master Up-to-date**: Master branch must be fully updated
- **GitHub MCP** (optional): For automatic PR creation
  - If not installed, you'll receive the PR description to copy-paste manually

## What this command does

1. Validates you're on a feature branch (not master)
2. Fetches latest master for comparison
3. Informs user this will create a **Draft PR**
4. Asks if user wants to generate a description now or use the template
5. Generates a PR title from the branch name (e.g., `[WIP] - B2BP-123 - Feature name`)
6. Asks user to confirm or refine the suggested title
7. If description requested: executes `/create-pr-description` to generate it
8. If description skipped: uses the full template as placeholder
9. Creates a draft PR via GitHub MCP or provides the title and description for manual creation

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

**Section inclusion criteria** (when generating description):

| Section        | Include when...                                         |
| -------------- | ------------------------------------------------------- |
| Unit tests     | Code logic changes that should have unit test coverage  |
| E2E tests      | Feature changes that require end-to-end testing         |
| Devices        | UI/visual changes that need cross-device testing        |
| Multi-currency | Changes affecting currency display or calculations      |
| Multi-timezone | Changes affecting dates, times, or timezone handling    |
| Authorization  | Changes to routes, guards, or permission-based features |

### Full Template (when skipping description)

When the user chooses not to generate a description, use this full template as the PR body:

```markdown
## ℹ️ What's this PR do?

-

## 👀 Where should the reviewer start?

-

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

## 📸 Screenshots (if appropriate)
```

## Repository Information

- **Repository**: https://github.com/Feverup/feverzoneclient
- **Target Branch**: `master`

## PR Title Format

All PRs are created as **drafts** with the `[WIP]` prefix to indicate work in progress.

### Format

```
[WIP] - {ticket_ref} - {ticket_title}
```

### Components

| Component        | Description                                      | Example             |
| ---------------- | ------------------------------------------------ | ------------------- |
| `[WIP]`          | Fixed prefix indicating work in progress         | `[WIP]`             |
| `{ticket_ref}`   | Jira ticket reference extracted from branch name | `B2BP-349`          |
| `{ticket_title}` | Human-readable description of the changes        | `Remove commitlint` |

### Title Extraction from Branch Name

The ticket reference and initial title suggestion are inferred from the branch name:

```
Branch: feature/B2BP-349_remove-commitlint
         ↓
Ticket:  B2BP-349
Title:   Remove commitlint (inferred from "remove-commitlint")
         ↓
PR Title: [WIP] - B2BP-349 - Remove commitlint
```

**Inference rules:**

1. Extract ticket reference: Match pattern `{PROJECT}-{NUMBER}` (e.g., `B2BP-349`)
2. Extract title slug: Text after the underscore `_` in the branch name
3. Transform slug to title: Replace dashes with spaces, capitalize first letter

**Examples:**

| Branch Name                                  | Suggested PR Title                             |
| -------------------------------------------- | ---------------------------------------------- |
| `feature/B2BP-349_remove-commitlint`         | `[WIP] - B2BP-349 - Remove commitlint`         |
| `hotfix/B2BP-500_fix-login-redirect`         | `[WIP] - B2BP-500 - Fix login redirect`        |
| `feature/B2BP-123_add-export-button-reports` | `[WIP] - B2BP-123 - Add export button reports` |

The user is always asked to **confirm or refine** the suggested title before PR creation.

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

### Step 3: Ask About Description

```
INFORM: "This will create a Draft PR for your changes."
ASK: "Would you like me to generate a description based on your changes? (yes/no)"
  - YES → STORE {generate_description} = true
  - NO → STORE {generate_description} = false
```

### Step 4: Analyze Changes

```
RUN: git diff origin/master...HEAD --stat
RUN: git diff origin/master...HEAD --name-only
RUN: git log origin/master..HEAD --oneline
STORE changed files list
STORE commit messages
```

### Step 5: Generate or Use Template Description

```
IF {generate_description} = true:
  EXECUTE: /create-pr-description
    - See create-pr-description.md for full details
  STORE result as {pr_description}
ELSE:
  USE full template as {pr_description}:
    - Include all mandatory sections with placeholders
    - Include all optional sections with placeholders
    - User will fill in details later
```

### Step 6: Check GitHub MCP Availability

```
CHECK: Is GitHub MCP available and authenticated?
  - YES → CONTINUE to Step 7a (Automatic PR Creation)
  - NO → CONTINUE to Step 7b (Manual PR Creation)
```

### Step 7a: Create PR via GitHub MCP

```
EXTRACT from {feature_branch}:
  - {ticket_ref}: Match pattern like "B2BP-123" from branch name
  - {title_slug}: Text after underscore, e.g., "remove-commitlint"
  - {suggested_title}: Transform slug → "Remove commitlint"

COMPUTE {default_pr_title}: "[WIP] - {ticket_ref} - {suggested_title}"

DISPLAY: "Based on your branch name and changes, I suggest this PR title:"
DISPLAY: {default_pr_title}

ASK: "Would you like to use this title, or provide a different one?"
  - User confirms → USE {default_pr_title}
  - User provides alternative → USE user's title (ensure [WIP] prefix is kept)

ASK: "Ready to create the draft PR? (yes/no)"
  - YES →
    CREATE PR using GitHub MCP with:
      - owner: "Feverup"
      - repo: "feverzoneclient"
      - title: {pr_title}
      - body: {pr_description}
      - head: {feature_branch}
      - base: "master"
      - draft: true (ALWAYS create as draft)
    DISPLAY: PR URL
  - NO → DISPLAY: Title and description for manual use
```

### Step 7b: Provide for Manual Creation

```
EXTRACT from {feature_branch}:
  - {ticket_ref}: Match pattern like "B2BP-123" from branch name
  - {title_slug}: Text after underscore, e.g., "remove-commitlint"
  - {suggested_title}: Transform slug → "Remove commitlint"

COMPUTE {default_pr_title}: "[WIP] - {ticket_ref} - {suggested_title}"

DISPLAY: "GitHub MCP not available. Here's your PR title and description to copy:"
OUTPUT: "Title: {default_pr_title}"
OUTPUT: {generated_description}
PROVIDE: Link to create PR manually:
  https://github.com/Feverup/feverzoneclient/compare/master...{feature_branch}
REMIND: "Remember to create the PR as a Draft and use the [WIP] prefix in the title"
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

### Output (Suggested PR Title)

```
[WIP] - B2BP-1234 - Add export button
```

The agent asks: "Would you like to use this title, or provide a different one?"

User might refine to: `[WIP] - B2BP-1234 - Add export button to reports module`

### Output (Generated Description)

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
- **No commits on branch**: Warns that there are no changes to create a PR for
- **GitHub MCP not available**: Falls back to manual description output
- **GitHub MCP authentication fails**: Falls back to manual description output
- **PR creation fails**: Displays error and provides description for manual creation

## GitHub MCP Information

If you don't have GitHub MCP installed, you can install it from:
https://github.com/modelcontextprotocol/servers/tree/main/src/github

The MCP enables automatic PR creation directly from the Cursor chat.

## Output Formatting Requirements

**CRITICAL**: When displaying URLs, format them as clickable links:

✅ **Correct** (clickable):

```
PR Created: https://github.com/Feverup/feverzoneclient/pull/1234
```

❌ **Incorrect** (not clickable):

```
PR #1234 created - [Link](https://github.com/Feverup/feverzoneclient/pull/1234)
```

## Testing Checklist

- [ ] Test from master branch (should fail with clear message)
- [ ] Test from feature branch with commits
- [ ] Test with GitHub MCP installed
- [ ] Test without GitHub MCP installed
- [ ] Test with description generation (yes)
- [ ] Test without description generation (no) - should use full template
- [ ] Test with UI changes (should include Devices section when generating)
- [ ] Test with service/logic changes only
- [ ] Test with timezone-related changes
- [ ] Test with authorization-related changes
- [ ] Verify all mandatory sections are present when generating
- [ ] Verify optional sections only appear when relevant (when generating)
- [ ] Verify full template is used when skipping description
- [ ] Verify PR title suggestion is correctly extracted from branch name
- [ ] Verify user can confirm or refine the suggested title
- [ ] Verify PR is always created as draft

## Related Commands

- `/create-pr-description`: Generate PR description only
- `/start-task`: Create Jira ticket and feature branch
