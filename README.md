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
- Search Bar and Docked Search layouts
- Docked, horizontal floating, and vertical floating Toolbars
- Date Picker with Calendar views
- Time Picker with Dial and Input views

All components are standalone Angular components and are exported by the
`ailabs-design-system` package.

## Documentation

- [Full technical documentation](docs/TECHNICAL_DOCUMENTATION.md) — setup, architecture, component APIs, tokens, accessibility, deployment, troubleshooting, and maintenance guidance.
- [Distributable PDF](output/pdf/AI_Labs_Design_System_Technical_Documentation.pdf)

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
  SearchBarComponent,
  ToolbarComponent,
} from 'ailabs-design-system'

@Component({
  standalone: true,
  imports: [ButtonComponent, CheckboxComponent, DatePickerComponent, SearchBarComponent, ToolbarComponent],
  template: `
    <button dsButton>Continue</button>
    <ds-checkbox>Remember me</ds-checkbox>
    <ds-date-picker label="Start date" />
    <ds-search-bar placeholder="Search projects" />
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
also creates `dist/ailabs-design-system-0.1.0.tgz`. Install that archive in
another Angular 22 project:

```bash
npm install /absolute/path/to/itsproject/dist/ailabs-design-system-0.1.0.tgz
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
