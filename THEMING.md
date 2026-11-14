# Making a DockForge theme

A theme is a folder with three files. You do not need to know how to program: if you can edit a few colors in CSS, you can make a theme.

```text
themes/my-theme/
  theme.json     name, author, license, tags
  styles.css     your look
  preview.png    a screenshot for the gallery (1280×720 recommended)
  assets/        optional: images (png, jpg, webp) and fonts (woff2)
```

## 1. Try it locally

1. Open `%APPDATA%\DockForge\themes\` (tray icon → *Open themes folder*).
2. Copy one of the themes from this repository into it and rename the folder.
3. Change `id` in `theme.json` to the new folder name.
4. Pick it from the tray icon → *Themes*. DockForge reloads the theme every time you save `styles.css`.

## 2. Variables

Most themes only change variables on `.df-dock`. Every variable has a default, so set only what you want to change.

| Variable | Default | What it controls |
| --- | --- | --- |
| `--df-icon-size` | `48px` | Icon size at rest |
| `--df-gap` | `8px` | Space between icons |
| `--df-padding` | `10px` | Space between icons and the dock edge |
| `--df-radius` | `22px` | Corner radius of the dock (`999px` = pill) |
| `--df-bg` | dark translucent | Dock background (any CSS background: color, gradient, `url(assets/…)`) |
| `--df-border` | thin white line | Dock border |
| `--df-shadow` | soft drop shadow | Dock shadow (`box-shadow` syntax) |
| `--df-hover-scale` | `1.3` | How much an icon grows on hover |
| `--df-hover-lift` | `-8px` | How far an icon moves up on hover |
| `--df-transition` | `160ms ease` | Animation timing |
| `--df-indicator-color` | white 55% | Dot under running apps |
| `--df-indicator-active-color` | light blue | Dot under the focused app |
| `--df-indicator-offset` | `-7px` | Distance of the dot from the bottom of the icon (negative = below) |
| `--df-tooltip-bg` | dark | App name bubble background |
| `--df-tooltip-color` | white | App name bubble text |
| `--df-font` | system UI font | Font of the app name bubble |
| `--df-separator-color` | white 18% | Line between pinned and open apps, and the group dots |
| `--df-widget-bg` | white 7% | Background of widgets (now playing) |
| `--df-widget-color` | same as tooltip text | Text of widgets (now playing, clock) |

People can also change the icon size, the hover zoom, the accent color, the corners and the
opacity in the settings window. Those choices are applied on top of your theme, so build it with
variables (as above) and it will keep working when someone tweaks it.

## 3. Classes (for advanced themes)

```html
<div class="df-dock" data-position="bottom" data-layout="float">
  <span class="df-group">                          <!-- only when groups are on -->
    <span class="df-group-dot is-current"></span> … 4 dots
  </span>
  <button class="df-item is-running is-active is-pinned">
    <img class="df-icon" />                      <!-- or <span class="df-icon df-icon--fallback">A</span> -->
    <span class="df-indicator"></span>
    <span class="df-tooltip">App name</span>
  </button>
  <span class="df-separator"></span>             <!-- between pinned and other open apps -->
  …
  <span class="df-spacer"></span>                 <!-- grows in the edge-to-edge layout -->
  <div class="df-widget df-media">                <!-- "now playing", when turned on -->
    <img class="df-media-cover" />
    <span class="df-media-text"><span class="df-media-title"></span><span class="df-media-artist"></span></span>
    <span class="df-media-buttons"><button class="df-media-button"></button> …</span>
  </div>
  <div class="df-widget df-clock"><span class="df-clock-time"></span><span class="df-clock-date"></span></div>
</div>
```

- `.is-running`: the app has at least one open window.
- `.is-active`: the app was in front before you clicked the dock.
- `.is-pinned`: the user pinned the app. A pinned app without `.is-running` is closed.
- `data-position`: `bottom`, `top`, `left` or `right`, the screen edge the dock is on. Side docks
  are vertical (`flex-direction: column`).
- `data-layout`: `float` (sized to its icons) or `bar` (from one end of the screen to the other).
- `.df-item:hover`, `::before`, `::after`, animations and `@keyframes` all work.

## 4. Rules

These are checked automatically on every pull request:

- Only `theme.json`, `styles.css`, the preview, an optional `README.md`, and images/fonts inside `assets/`.
- No `@import` and no `url()` pointing to the internet. Use files in `assets/`.
- Up to 5 MB per file and 20 MB per theme.
- One theme per pull request.
- Only share images and fonts you are allowed to share.

## 5. Send it

Follow [CONTRIBUTING.md](CONTRIBUTING.md).
