# Git Commit Command

## Git Identity

Before committing, confirm which git identity to use:
1. **Use default** - Use the git identity already configured in `git config user.name` and `git config user.email`
2. **Specify custom** - Ask the user to provide a username and email for this commit

If the user specifies a custom identity, set it for this repository:
```bash
git config user.name "<username>"
git config user.email "<email>"
```


## Commit Process

1. Run `git status && git diff HEAD && git status --porcelain` to see uncommitted changes
2. Add untracked and changed files appropriately
3. Create an atomic commit with a descriptive message
4. Use a conventional commit tag: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`, etc.

## Commit Message Format

```
<tag>: <short description>

<optional body with more details>
```

Examples:
- `feat: add cultivar search with alias matching`
- `fix: correct image gallery sort order`
- `docs: update README with setup instructions`
- `chore: configure eslint and prettier`
