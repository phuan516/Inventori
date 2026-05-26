# Inventori — Claude Code Instructions

## graphify

A knowledge graph of this codebase lives in `graphify-out/graph.json`. Use it when answering questions about architecture, dependencies, or how things connect.

**Before answering codebase questions**, query the graph:
```bash
/graphify query "<your question>"
```

**After making code changes**, rebuild incrementally (free — AST only, no LLM):
```bash
/graphify src/ --update
```

**To explore the graph visually**, open `graphify-out/graph.html` in a browser.

Key god nodes (highest betweenness): `showToast()`, `signIn()`, `signOut()`, `handleSignOut()`, `handleGoogleSignIn()`.
