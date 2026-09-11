---
name: screenshot-styler
description: Style an existing screenshot with the light or dark Air background from nitk.me/ss and return a PNG or self-contained SVG. Use when asked to add Air styling to a screenshot; this does not capture webpages.
---

# Screenshot Styler

Read the [agent guide](https://nitk.me/ss/agents/guide.md) for installation and the helper contract.
The [release manifest](https://nitk.me/ss/agents/manifest.json) identifies the current helper archive and its checksum.

Use the user's local PNG/JPEG or direct image URL. Default to the light background and native PNG
unless the user specifies otherwise. Run the helper locally; do not upload screenshots to the studio.
Reuse an installed helper and its cached backgrounds. Dependency installation is a setup step,
not something to repeat for each render. Follow the agent environment's existing execution permissions.

```sh
node render.mjs --input /absolute/path/screenshot.png --background light --output /absolute/path/styled.png
```

Read the single JSON result on stdout. On success, return the actual generated file to the user;
do not substitute an editor screenshot or merely report the output path when attachments are available.
On failure, use its error code and guide instructions. Do not retry invalid inputs or exceed the
documented retry limits. `--force` replaces an existing output only when that is intended.

If local execution is unavailable, browser tools may upload the source to the editor and download
the PNG locally. Agents with HTTP access alone cannot render; explain the missing capability.
Webpage URLs are not image inputs: use an already-authorized screenshot capture tool first if requested.
