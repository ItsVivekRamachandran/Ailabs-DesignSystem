# AI Labs Design System

A compact Angular design system for building thoughtful AI products. It includes
foundational tokens, reusable components, and an interactive showcase.

**Live demo:** [itsvivekramachandran.github.io/Ailabs-DesignSystem](https://itsvivekramachandran.github.io/Ailabs-DesignSystem/)

The token layer is synchronized with the AI Lab Design System Figma file:

- 58 primitive color variables across Primary, Secondary, Support Gold, Support Sand, and Neutral ramps
- 51 semantic color aliases for the Light mode
- Spacing, radius, stroke, and typography variables
- CSS custom properties and typed TypeScript token exports

The Angular component layer includes every family planned in Figma:

- Button, Checkbox, Chip, Switch, and Radio
- Text Field, Tab, Tooltip, Menu Item, and List Item
- Dropdown with option listing, keyboard navigation, and disabled options
- Docked, horizontal floating, and vertical floating Toolbars
- Material 3 Date Picker with docked/modal calendars, manual entry, and Cancel/OK
- Material 3 Time Picker with dial/keyboard entry, 12/24-hour support, and Cancel/OK
- Local Google Material Symbols SVG icons (`IconComponent`), bundled with the library

All components are standalone Angular components and are exported by the
`ailabs-design-system` package.

## Documentation

- [Full technical documentation](docs/TECHNICAL_DOCUMENTATION.md) — setup, architecture, component APIs, tokens, accessibility, deployment, troubleshooting, and maintenance guidance.
- [Technical reference PDF](output/pdf/AI_Labs_Design_System_Technical_Documentation.pdf)
- [Step-by-step guide](docs/STEP_BY_STEP_GUIDE.md) - Figma library setup, installation, component development, GitHub Pages, npm publishing, upgrades, and recovery.
- [Step-by-step guide PDF](output/pdf/AI_Labs_Design_System_Step_by_Step_Guide.pdf)

## Component usage

Install and configure the package with Angular CLI:

```bash
ng add ailabs-design-system
```

This installs the package and adds `ailabs-design-system/styles.css` to every
Angular application in the workspace. Restart a running development server
after installation.

```ts
import { Component } from '@angular/core'
import {
  ButtonComponent,
  CheckboxComponent,
  DatePickerComponent,
  DropdownComponent,
  ToolbarComponent,
} from 'ailabs-design-system'

@Component({
  standalone: true,
  imports: [ButtonComponent, CheckboxComponent, DatePickerComponent, DropdownComponent, ToolbarComponent],
  template: `
    <button dsButton>Continue</button>
    <ds-checkbox>Remember me</ds-checkbox>
    <ds-date-picker label="Start date" />
    <ds-dropdown label="Workspace" [options]="[{ value: 'design', label: 'Design' }, { value: 'engineering', label: 'Engineering' }]" />
    <ds-toolbar variant="floating-horizontal" tone="vibrant">
      <button dsButton [iconOnly]="true" aria-label="Bold">…</button>
      <button dsButton variant="ghost" [iconOnly]="true" aria-label="Italic">…</button>
      <button dsButton variant="ghost" [iconOnly]="true" aria-label="Underline">…</button>
    </ds-toolbar>
  `,
})
export class ExampleComponent {}
```

If the package was installed with `npm install` instead of `ng add`, load the
design-system styles once in the consuming application's `angular.json`:

```json
{
  "styles": [
    "ailabs-design-system/styles.css",
    "src/styles.css"
  ]
}
```

## Build and install the package

```bash
npm install
npm run build
npm run pack
```

The package build is written to `dist/ailabs-design-system`, and `npm run pack`
also creates `dist/ailabs-design-system-0.1.2.tgz`. Install that archive in
another Angular 22 project:

```bash
npm install /absolute/path/to/itsproject/dist/ailabs-design-system-0.1.2.tgz
```

For local iteration, you can install the unpacked output instead:

```bash
npm install /absolute/path/to/itsproject/dist/ailabs-design-system
```

## Commands

- `npm start` — start the local component playground
- `npm run build` — build the installable Angular library
- `npm run pack` — build and create an installable `.tgz` archive
- `npm run build:demo` — build the component playground
- `npm run build:pages` — build with the GitHub Pages base path
- `npm run watch` — rebuild the library continuously during development
- `npm run watch:demo` — rebuild the playground continuously during development

## Structure

```text
src/
├── app/
│   ├── design-system/  Reusable standalone Angular components
│   └── app.component.* Documentation playground
├── design-system/      Global tokens and component styles
├── public-api.ts       Installable package exports
├── main.ts             Angular bootstrap
└── styles.css          Playground layout and responsive styles
```

### Accessibility and Material comparison

Existing components contain the behavior improvements, and new components appear in the regular catalog. See [the component comparison](docs/ACCESSIBILITY_COMPARISON.md) for scope, migration notes, missing compositions, and verification commands.

`AlertComponent` (`ds-alert`) is a persistent inline notification with info/success/warning/error severities, optional actions and dismissal, and explicit announcement priority. Import it from the public library entry point. It never removes itself or moves focus automatically.

Picker references: [Material date pickers](https://m3.material.io/components/date-pickers/guidelines), [Material time pickers](https://m3.material.io/components/time-pickers/guidelines). The implementation uses AILab colors and fonts. Icons come from the official [Google Material Symbols repository](https://github.com/google/material-design-icons), licensed Apache-2.0; SVGs and the license are in `src/assets/icons/material`. Regenerate the inline SVG registry with `node scripts/generate-material-icons.mjs`.

Import `IconComponent` and use `<ds-icon name="calendar_month" />` inside a labelled control. Icons are decorative; place the accessible name on the control. No remote icon font or asset-copy configuration is needed. Source SVGs are also shipped under `icons/material` in the npm package.
