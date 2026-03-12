# /start-task

Interactive command to start a new task by creating a Jira ticket and feature branch.

## Usage

Type `/start-task` in the chat and follow the prompts.

## Prerequisites

- **Git**: Must be in a git repository
- **Atlassian MCP** (optional but recommended): For automatic Jira ticket creation
  - If not installed, you'll be guided through manual ticket creation

## What this command does

1. Ensures master branch is up to date (checkout + pull)
2. Checks for Atlassian MCP availability
3. Gathers task information interactively
4. Creates a Jira ticket (automatically if MCP available, or guides manual creation)
5. Creates a feature branch with proper naming
6. Moves uncommitted changes to the new branch

## Important: Uncommitted Changes

If you have uncommitted changes when running this command:

- They will be temporarily stashed
- Master will be updated
- A new branch will be created
- Your changes will be restored on the new branch

Your work is safe throughout this process!

## MCP Detection

The command first checks if you have the Atlassian MCP installed:

- **If available**: Automatic Jira ticket creation
- **If not available**: Guided manual ticket creation with fallback

To install Atlassian MCP:
https://github.com/modelcontextprotocol/servers/tree/main/src/atlassian

## Questions you'll be asked

**With MCP (Automatic Ticket Creation)**:

1. Jira project space (e.g., B2BP)
2. Ticket type (infra/docs/feat/fix/test/uitest/devops/style)
3. Ticket title (e.g., "Update NG Bootstrap to v15")

**Note**: The MCP creates a basic ticket with the title formatted as `[FE][TYPE] {title}`. After creation, you should manually add in Jira:

- Labels (e.g., `b2b_platform`)
- Component (e.g., `Front`)
- Parent epic (if applicable)
- Detailed description

**Without MCP (Manual Ticket Creation)**:
You'll be asked for the ticket number after you create it manually in Jira.

## Output

- Jira ticket with format: [FE][TYPE] Title
- Branch with format: `(hotfix|feature)/PROJECT-123_description`
  - `hotfix/` prefix for `fix` type
  - `feature/` prefix for all other types
- All uncommitted changes moved to new branch
- Suggestion to add labels, component, and other fields manually in Jira

## Ticket Type Mapping

| Type   | Branch Prefix | Jira Issue Type | Description                               |
| ------ | ------------- | --------------- | ----------------------------------------- |
| infra  | feature/      | Task            | Infrastructure, dependencies, config      |
| docs   | feature/      | Task            | Documentation (markdown, README)          |
| feat   | feature/      | Story           | Business feature                          |
| fix    | hotfix/       | Bug             | Bug fix (runtime/compilation errors)      |
| test   | feature/      | Task            | Unit testing only                         |
| uitest | feature/      | Task            | Playwright or Cypress                     |
| devops | feature/      | Task            | Cloud/CI/CD (GitHub Actions, Jenkinsfile) |
| style  | feature/      | Task            | CSS/SCSS changes                          |

## Example

Input:

- Current branch: master (with uncommitted changes)
- MCP Status: Available ✅
- Project: B2BP
- Type: infra
- Title: Update NG Bootstrap to v15

Output:

```
✓ Master branch updated
✓ Jira ticket created: B2BP-1234
   [FE][INFRA] Update NG Bootstrap to v15

🔗 https://feverup.atlassian.net/browse/B2BP-1234

✓ Branch created: feature/B2BP-1234_update-ng-bootstrap-to-v15
✓ Uncommitted changes moved to new branch
```

**Next steps**:

- Open the ticket in Jira and add:
  - Labels: `b2b_platform` (and others as needed)
  - Component: `Front` (or appropriate component)
  - Parent epic: Link if applicable
  - Description: Replace placeholder with detailed description

## Example (Manual Fallback)

Input:

- Current branch: feature/old-work (with uncommitted changes)
- MCP Status: Not available ❌
- Project: B2BP
- Type: infra
- Title: Update NG Bootstrap to v15
- (Creates ticket manually)
- Ticket Number: B2BP-1234

Output:

```
✓ Master branch updated
✓ Branch created: feature/B2BP-1234_update-ng-bootstrap-to-v15
✓ Uncommitted changes moved to new branch

💡 Reminder: Complete the ticket details in Jira
🔗 https://feverup.atlassian.net/browse/B2BP-1234
```

## Implementation Notes

This command is implemented as a Cursor AI agent workflow. When you type `/start-task`, the AI agent will:

1. **Execute pre-flight checks**: Check for uncommitted changes, switch to master, pull latest
2. **Check MCP availability**: Detect if Atlassian MCP is installed
3. **Gather information**: Ask you a series of questions about the task
4. **Create Jira ticket**: Either automatically via MCP or guide manual creation
5. **Execute `/create-branch`**: Pass the ticket type, reference, and ticket title as parameters:
   ```
   /create-branch {ticket_type} {ticket_ref} {ticket_title}
   ```
   Example: `/create-branch infra B2BP-1234 update-ng-bootstrap-to-v15`
   - All parameters are passed, so `/create-branch` runs without prompts
   - Ticket title is converted to kebab-case before passing
6. **Move changes**: Restore any uncommitted changes to the new branch

The agent handles all error cases and ensures your uncommitted work is never lost.

### Output Formatting Requirements

**CRITICAL**: When displaying the success message, the Jira ticket link MUST be formatted as a clickable URL:

✅ **Correct** (clickable):

```
Ticket: https://feverup.atlassian.net/browse/B2BP-1234
```

❌ **Incorrect** (not clickable):

```
Link: https://feverup.atlassian.net/browse/B2BP-1234
Ticket: [FE][INFRA] Title (B2BP-1234) - https://feverup.atlassian.net/browse/B2BP-1234
```

The URL should be on its own line or clearly separated so Cursor can make it clickable.

## Error Handling

The command handles various error scenarios:

- **Git checkout fails**: Stashes changes first, then retries
- **Git pull fails**: Displays error and exits (suggests resolving conflicts)
- **MCP not available**: Falls back to manual ticket creation
- **MCP authentication fails**: Falls back to manual ticket creation (see troubleshooting below)
- **MCP ticket creation fails**: Falls back to manual ticket creation
- **Branch already exists**: Asks if you want to checkout existing or create with different name
- **Stash pop conflicts**: Displays conflict message, suggests manual resolution

**Critical**: The command always ensures stashed changes are recovered, even if the command exits early or fails.

## Troubleshooting

### MCP Authentication Error

If you get an error like:

```
{"error":true,"message":"Authentication failed: {\"code\":401,\"message\":\"Unauthorized\"}"}
```

**Solution**: Toggle the Atlassian MCP off and on again in Cursor settings:

1. Open Cursor Settings
2. Go to MCP section
3. Disable the Atlassian MCP
4. Re-enable the Atlassian MCP
5. Try the command again

This refreshes the authentication token with Atlassian.

### Manual Post-Creation Steps

After the ticket is created via MCP, you should manually add in Jira:

- **Labels**: Add `b2b_platform` and any other relevant labels
- **Component**: Set to `Front` or appropriate component
- **Parent Epic**: Link to parent epic if applicable
- **Description**: Add detailed description of the task

The command will remind you to add these fields after ticket creation.

## Testing Checklist

- [ ] Test from master with uncommitted changes
- [ ] Test from master without uncommitted changes
- [ ] Test from feature branch with uncommitted changes
- [ ] Test with MCP installed
- [ ] Test without MCP installed
- [ ] Test with various ticket types
- [ ] Test error cases (pull conflicts, stash conflicts, invalid inputs)
- [ ] Test branch naming with various titles
- [ ] Test branch already exists scenario
- [ ] Verify reminder to add labels/component/epic manually is shown

## Related Commands

- `/create-branch`: Create feature branch only (called internally via `/create-branch {ticket_type} {ticket_ref} {ticket_title}`)
- `/create-pr`: Create draft pull request for the branch
