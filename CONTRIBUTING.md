# Sending a theme

Every theme reaches the gallery through a pull request. A bot checks it in a few seconds, and a maintainer reviews it.

## Option A: on the GitHub website (no Git needed)

1. Click **Fork** at the top of this page.
2. In your fork, open the `themes` folder → **Add file → Upload files**.
3. Drag your theme folder in. The path must be `themes/<your-theme-id>/theme.json` and so on.
4. Click **Commit changes**, then **Contribute → Open pull request**.
5. Fill in the template that appears and submit.

## Option B: with Git

```bash
git clone https://github.com/<you>/dockforge-themes
cd dockforge-themes
cp -r path/to/my-theme themes/my-theme
npm install && npm run validate my-theme   # optional, CI does it too
git checkout -b theme/my-theme
git add themes/my-theme && git commit -m "Add my-theme"
git push -u origin theme/my-theme
```

Then open the pull request on GitHub.

## Option C: from the DockForge app (coming later)

A *Publish theme* button will sign in to GitHub (optional), fork, upload and open the pull request for you.

## Updating your theme

Send a new pull request that changes only your theme's folder, and raise `version` in `theme.json`.

## What gets a theme rejected

- It fails the automatic check (the bot's comment says why).
- It uses images, logos or fonts the author cannot share.
- It is a copy of another theme with minimal changes.
- It contains offensive content.
