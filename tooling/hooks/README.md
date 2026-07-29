# Git hooks

## pre-commit — ai-tell-lint

Flags AI-tell copy (em-dashes, generic phrases like "seamless", "delve", "elevate your") in staged files, and blocks the commit on a hit.

**Install (once per clone, after `git init`):**

```bash
cp tooling/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

Or set a hooks path: `git config core.hooksPath tooling/hooks`.

**Run manually any time:**

```bash
npm run lint:ai-tell -- path/to/copy.tsx     # specific files
npm run lint:ai-tell                          # staged files (inside a git repo)
```

It's mechanical hygiene — it makes copy *less obviously generic*, not *good*. The real anti-AI-look work is tokens-before-UI + distinctive type/colour; see `docs/modules/anti-ai-look.md`.
