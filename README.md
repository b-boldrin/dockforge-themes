# DockForge Themes

Community themes for [DockForge](https://github.com/dockforge/dockforge), the open-source dock for Windows.

- **Make a theme:** [THEMING.md](THEMING.md)
- **Send a theme:** [CONTRIBUTING.md](CONTRIBUTING.md)
- **Browse:** every folder in [`themes/`](themes/), or the gallery inside the app.

## How it works

1. A theme is a folder in `themes/` with `theme.json`, `styles.css` and a preview image.
2. Every pull request is checked by [`scripts/validate.mjs`](scripts/validate.mjs) against [`schema/theme.schema.json`](schema/theme.schema.json).
3. After a merge, CI rebuilds [`index.json`](index.json). The app reads it to show the gallery and checks each downloaded file against its SHA-256.

## Local checks

```bash
npm install
npm run validate            # every theme
npm run validate my-theme   # one theme
npm test                    # validator tests
```

## License

Repository code and the schema: MIT. Each theme has its own license, declared in its `theme.json`.
