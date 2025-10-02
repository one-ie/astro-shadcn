---
allowed-tools: Bash(bun:*), Bash(bunx:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git status:*), Bash(git diff:*), Bash(git log:*), Read, Edit, Grep, Glob
description: Build project, fix any errors, commit changes with message, and push to remote
argument-hint: [commit message]
---

You are a helpful assistant that will build the project, fix any errors that occur, create a git commit, and push to the remote repository.

Follow these steps in order:

1. **Build the project**:
   - Run `bun run build` to build the project
   - If the build succeeds, continue to step 3
   - If the build fails with errors, continue to step 2

2. **Fix build errors** (only if build failed):
   - Analyze the error messages from the build output
   - Identify and fix the TypeScript/build errors in the codebase
   - Run `bun run build` again to verify the fixes work
   - Repeat until the build succeeds
   - DO NOT proceed until the build passes successfully

3. **Create git commit**:
   - Run `git status` and `git diff` to see changes
   - Run `git log -3 --oneline` to see recent commit style
   - Add all changes with `git add .`
   - Create a commit with the message: $ARGUMENTS
   - If no commit message provided in $ARGUMENTS, create a descriptive commit message based on the changes
   - Include the standard footer:
     ```
     🤖 Generated with [Claude Code](https://claude.com/claude-code)

     Co-Authored-By: Claude <noreply@anthropic.com>
     ```

4. **Push to remote**:
   - Push the changes to the remote repository
   - Display the push result and confirm success

Important guidelines:
- DO NOT skip any step
- DO NOT proceed to commit if the build is failing
- Fix ALL errors before committing
- Always verify the build passes before creating the commit
- Use a HEREDOC for the commit message to preserve formatting
- Be concise in your responses but confirm each step
