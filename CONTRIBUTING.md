# Contributing

Small, plain changes are the best ones.

- Bug or idea: open an issue. Say what you saw and what you expected.
- Code: fork, make a branch, open a pull request. Keep it vanilla JS with no build step and no external requests.
- Check before you open the PR: the page loads from `file://` and from a local server, no horizontal scroll at 390px wide, focus rings still show, and `prefers-reduced-motion` is still respected.
- Adding a ship: use the "Add a ship" issue template, or edit `days.json` and run `node tools/sync.mjs`.
- Text: short sentences, plain words.

By contributing you agree your work is released under the MIT license.
