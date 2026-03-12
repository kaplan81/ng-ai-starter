# /create-branch

Create a feature branch following the project's branch naming conventions.

## Usage

### Standalone (interactive)

```
/create-branch
```

You'll be prompted for ticket type, ticket reference, and ticket title.

### With all parameters (from /start-task)

```
/create-branch {ticket_type} {ticket_ref} {ticket_title}
```

Example: `/create-branch infra B2BP-1234 update-ng-bootstrap-to-v15`

When all parameters are provided, the command runs without any prompts. This is how `/start-task` calls it after creating the Jira ticket (ticket title is already converted to kebab-case).

## Prerequisites

- **Git**: Must be in a git repository
- **Ticket Reference**: Must have a Jira ticket number (e.g., `B2BP-1234`)

## What this command does

1. Checks for uncommitted changes (stashes them if present)
2. Ensures master branch is up to date
3. Gathers branch information interactively (ticket type, ticket reference, description)
4. Creates a feature branch with proper naming convention
5. Restores uncommitted changes to the new branch

## Branch Naming Convention

### Format

```
{prefix}/{ticket_ref}_{description}
```

### Components

| Component        | Description                             | Example                      |
| ---------------- | --------------------------------------- | ---------------------------- |
| `{prefix}`       | Branch type prefix based on ticket type | `feature/` or `hotfix/`      |
| `{ticket_ref}`   | Jira ticket reference                   | `B2BP-1234`                  |
| `{ticket_title}` | Kebab-case version of the ticket title  | `update-ng-bootstrap-to-v15` |

### Prefix Rules

| Ticket Type | Branch Prefix | Description                               |
| ----------- | ------------- | ----------------------------------------- |
| `infra`     | `feature/`    | Infrastructure, dependencies, config      |
| `docs`      | `feature/`    | Documentation (markdown, README)          |
| `feat`      | `feature/`    | Business feature                          |
| `fix`       | `hotfix/`     | Bug fix (runtime/compilation errors)      |
| `test`      | `feature/`    | Unit testing only                         |
| `uitest`    | `feature/`    | Playwright or Cypress                     |
| `devops`    | `feature/`    | Cloud/CI/CD (GitHub Actions, Jenkinsfile) |
| `style`     | `feature/`    | CSS/SCSS changes                          |

**Rule**: Only `fix` type uses `hotfix/` prefix. All other types use `feature/`.

### Examples

| Ticket Type | Ticket Ref  | Description                | Branch Name                                    |
| ----------- | ----------- | -------------------------- | ---------------------------------------------- |
| `infra`     | `B2BP-1234` | Update NG Bootstrap to v15 | `feature/B2BP-1234_update-ng-bootstrap-to-v15` |
| `fix`       | `B2BP-500`  | Fix login redirect         | `hotfix/B2BP-500_fix-login-redirect`           |
| `feat`      | `B2BP-789`  | Add export button          | `feature/B2BP-789_add-export-button`           |
| `docs`      | `B2BP-100`  | Update README              | `feature/B2BP-100_update-readme`               |

## Implementation Steps

### Step 1: Check for Uncommitted Changes

```
RUN: git status --porcelain
CHECK: Are there uncommitted changes?
  - YES →
    INFORM: "You have uncommitted changes. They will be stashed and restored on the new branch."
    RUN: git stash push -m "create-branch: stashing changes"
    STORE {has_stash} = true
  - NO →
    STORE {has_stash} = false
```

### Step 2: Update Master Branch

```
RUN: git checkout master
RUN: git pull origin master
INFORM: "Master branch updated."
```

### Step 3: Gather Branch Information

**Note**: Either all 3 parameters are passed via `/create-branch {ticket_type} {ticket_ref} {ticket_title}` (from `/start-task`), or none are passed and all are asked interactively.

```
CHECK: Were ALL parameters provided?
  - YES (from /start-task) →
    USE {ticket_type}, {ticket_ref}, {ticket_title} as provided
    (ticket_title is already in kebab-case)
  - NO (standalone mode) →
    ASK: "What is the ticket type? (infra/docs/feat/fix/test/uitest/devops/style)"
    STORE response as {ticket_type}

    ASK: "What is the Jira ticket reference? (e.g., B2BP-1234)"
    STORE response as {ticket_ref}
    VALIDATE: Must match pattern like "ABC-123" or "ABCD-1234"

    ASK: "What is the ticket title? (will be converted to kebab-case)"
    STORE response as {ticket_title_raw}
    COMPUTE {ticket_title}: Convert to kebab-case (lowercase, spaces/underscores → dashes)

COMPUTE {prefix}:
  - IF {ticket_type} = "fix" → {prefix} = "hotfix"
  - ELSE → {prefix} = "feature"
```

### Step 4: Create Branch

```
COMPUTE {branch_name}: "{prefix}/{ticket_ref}_{ticket_title}"

DISPLAY: "Creating branch: {branch_name}"

RUN: git checkout -b {branch_name}
CHECK: Did branch creation succeed?
  - YES → CONTINUE
  - NO (branch exists) →
    ASK: "Branch already exists. Would you like to checkout the existing branch? (yes/no)"
      - YES → RUN: git checkout {branch_name}
      - NO → ASK for different ticket title and retry
```

### Step 5: Restore Stashed Changes

```
IF {has_stash} = true:
  RUN: git stash pop
  CHECK: Did stash pop succeed?
    - YES → INFORM: "Uncommitted changes restored."
    - NO (conflicts) →
      WARN: "There were conflicts restoring your changes. Please resolve them manually."
      INFORM: "Your changes are still in the stash. Use 'git stash show' to see them."
```

### Step 6: Display Success

```
DISPLAY: "✓ Branch created: {branch_name}"
DISPLAY: "✓ You are now on branch: {branch_name}"
IF {has_stash} = true:
  DISPLAY: "✓ Uncommitted changes restored"
```

## Example

### Input

```
Current branch: master (with uncommitted changes)
Ticket type: infra
Ticket reference: B2BP-1234
Description: Update NG Bootstrap to v15
```

### Output

```
✓ Changes stashed
✓ Master branch updated
✓ Branch created: feature/B2BP-1234_update-ng-bootstrap-to-v15
✓ Uncommitted changes restored
```

## Error Handling

The command handles various error scenarios:

- **Git checkout fails**: Stashes changes first, then retries
- **Git pull fails**: Displays error and exits (suggests resolving conflicts)
- **Invalid ticket reference**: Asks user to provide valid format
- **Branch already exists**: Offers to checkout existing or create with different name
- **Stash pop conflicts**: Warns user and suggests manual resolution

**Critical**: The command always ensures stashed changes are recovered, even if the command exits early or fails.

## Invocation Modes

This command supports two invocation modes:

### 1. Standalone Mode (no parameters)

```
/create-branch
```

The command will ask for all information interactively:

- Ticket type
- Ticket reference
- Ticket title

Use standalone mode when:

- You created the ticket manually in Jira
- You're picking up an existing ticket
- You need to create a branch without creating a new ticket

### 2. Full Parameters (from /start-task)

```
/create-branch {ticket_type} {ticket_ref} {ticket_title}
```

Example: `/create-branch infra B2BP-1234 update-ng-bootstrap-to-v15`

When all parameters are provided:

- **Ticket type**: Used from parameter
- **Ticket reference**: Used from parameter
- **Ticket title**: Used from parameter (already in kebab-case)

This is how `/start-task` calls this command after creating the Jira ticket - fully automated with no prompts.

## Testing Checklist

- [ ] Test standalone mode (no parameters) - should ask for all 3 inputs
- [ ] Test with all parameters (from /start-task) - should run without prompts
- [ ] Test from master with uncommitted changes
- [ ] Test from master without uncommitted changes
- [ ] Test from feature branch (should checkout master first)
- [ ] Test with each ticket type (verify correct prefix)
- [ ] Test with valid ticket reference formats
- [ ] Test with invalid ticket reference (should reject)
- [ ] Test branch already exists scenario
- [ ] Test stash pop conflicts scenario
- [ ] Test ticket title with spaces (should convert to kebab-case)
- [ ] Test ticket title with underscores (should convert to dashes)

## Related Commands

- `/start-task`: Create Jira ticket AND feature branch (uses this command internally)
- `/create-pr`: Create draft pull request for the current branch
