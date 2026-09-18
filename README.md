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
- Date Picker with Calendar views
- Time Picker with Dial and Input views

All components are standalone Angular components and are exported from
`src/app/design-system/index.ts`.

## Component usage

```ts
import {
  ButtonComponent,
  CheckboxComponent,
  DatePickerComponent,
} from './design-system'

@Component({
  standalone: true,
  imports: [ButtonComponent, CheckboxComponent, DatePickerComponent],
  template: `
    <button dsButton>Continue</button>
    <ds-checkbox>Remember me</ds-checkbox>
    <ds-date-picker label="Start date" />
  `,
})
export class ExampleComponent {}
```

## Getting started

```bash
npm install
npm start
```

## Commands

- `npm start` — start the local component playground
- `npm run build` — type-check and build for production
- `npm run build:pages` — build with the GitHub Pages base path
- `npm run watch` — rebuild continuously during development

## Structure

```text
src/
├── app/
│   ├── design-system/  Reusable standalone Angular components
│   └── app.component.* Documentation playground
├── design-system/      Global tokens and component styles
├── main.ts             Angular bootstrap
└── styles.css          Playground layout and responsive styles
```
