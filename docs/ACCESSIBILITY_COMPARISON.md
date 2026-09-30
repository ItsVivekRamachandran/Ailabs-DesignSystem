# AILab component behavior and accessibility comparison

Audit/update: 30 September 2026. Target: WCAG 2.2 AA. Source: [AILab Figma](https://www.figma.com/design/FZDQAzD6Q44OMCeYDKdfp8/AILab-Design-System?node-id=13-2). New [Alert component](https://www.figma.com/design/FZDQAzD6Q44OMCeYDKdfp8/AILab-Design-System?node-id=120-13).

This is a targeted reconciliation, not certification or complete Material parity. The existing Figma components are updated in place, with behavior/accessibility guidance in their component descriptions. The separate review frames and app comparison section were removed at the user’s request; Alert remains on its dedicated component page and in the regular app catalog. Existing component IDs are preserved. Figma is a visual specification; it cannot implement DOM semantics, screen-reader announcements, or browser focus behavior.

| Component | Before | Material / ARIA reference | Updated code and design information |
|---|---|---|---|
| **Alert — added** | No reusable inline banner | Material 2 persistent banner; ARIA alert/status | 4 severities; 8 Figma desktop/mobile variants; editable title/message/action; optional action/dismiss; off/polite/assertive announcements; no timeout or autofocus |
| Button | Small targets, faint focus, implicit submit | Native Enter/Space activation | 48px target, visible focus, default `type=button`; explicit submit supported |
| Checkbox | Mixed presentation without native indeterminate | Material clears mixed on user toggle | Native indeterminate binding, 48px labelled target, clear focus/boundary |
| Switch / radio | Small targets and pale unchecked boundaries | Native on/off and same-name exclusive radio group | 48px labelled targets and clearer boundaries; radio group state remains consumer-owned |
| Chip / list item | Visual selection only | Expose toggle/selection state | `aria-pressed`; native button activation; no nested interactive content in button list items |
| Text field | Pale placeholder; limited label/form metadata | Label, help/error text, validation | Stronger text/border, `ariaLabel`, `required`, `autocomplete`; existing error description preserved |
| Tabs | All tab stops, no keyboard navigation | Material arrows/Home/End; Enter/Space activates | Selected tab stop, arrow navigation, `panelId`; consumer owns selection and linked panels |
| Tooltip | Description on wrapper; Escape ineffective; bubble not hoverable | Description on trigger; keyboard parity | Trigger association, hover/focus, Escape dismissal, hoverable bubble |
| Menu item | `menuitem` without a managed parent | Material supplies menu popup and keyboard/focus handling | Native standalone command row; role is opt-in for a managed menu |
| Dropdown — added | No reusable single-select list | Material select / ARIA combobox | Labelled field; top-layer list; keyboard/typeahead; disabled options; error association; 48px rows |
| Search — removed | Separate Search family | User-requested removal | Removed from exports, demo, and Figma |
| Toolbar | Toolbar role without composite navigation | APG one Tab stop and orientation-aware arrows | Roving button focus, Home/End, disabled skipping. Material toolbar itself is a layout container |
| Date picker / calendar | Fixed March grid; inert month buttons | Date-aware navigation and date labels | Click-to-open modal; date selection commits; Escape/Cancel/outside dismiss; focus return; real dates and month/year navigation |
| Time picker / clock | Inert input mode, static hand, no outputs | Keyboard entry and accessible choices | Click-to-open modal; dial/keyboard entry; Apply/Cancel; focus return; validated numeric entry and AM/PM outputs |
| Tokens / badge | Low-contrast tertiary/warning text, faint focus | WCAG contrast and visible focus | Accessible semantic aliases and opaque focus; dark secondary active fixed |

## Accessibility decisions

- Light `text/tertiary` and `border/strong` now alias `neutral/600`; warning foreground aliases `support-gold/800`, preserving the brand's existing warning/error palette. Error and warning are also distinguished by explicit text and symbols, never by color alone.
- Code contrast checks: tertiary text on white **6.41:1**, warning text on its subtle surface **6.79:1**, error text on its subtle surface **4.74:1**. Thirty semantic pairs are tested in light/dark modes, including action default/hover/active states. Figma primitive RGB values have small pre-existing rounding differences from CSS; ratios quoted here apply to code.
- Normal text target is 4.5:1; non-text control boundary/focus target is 3:1. Inactive controls are exempt from those WCAG contrast criteria.
- AILab uses 48 CSS px for primary control targets. Material's common 48dp recommendation is distinct from WCAG 2.2 AA's 24 CSS px minimum (with exceptions). Compact calendar and clock dial buttons remain 30px/26px; they are not claimed to meet Material's preferred 48dp size.
- Reduced-motion and forced-colors rules are included. No timed dismissal; the alert's consumer controls lifetime and focus after removal.
- Figma's existing semantic collection has Light only. The code also has a Dark theme; this update does not invent a full Figma dark-theme library.

## Alert API and usage

```ts
import { AlertComponent } from 'ailabs-design-system'
// Add AlertComponent to the standalone component imports.
```

```html
<ds-alert severity="warning" heading="Memory usage is high"
  actionLabel="Review status" [dismissible]="true"
  (action)="reviewStatus()" (dismiss)="dismissWarning()">
  Review the kiosk before restarting services.
</ds-alert>
```

Inputs: `severity`, `heading`, `actionLabel`, `dismissible`, `dismissLabel`, `announcement` (`off` default, `polite`, `assertive`). Outputs: `action`, `dismiss`. For dynamic routine feedback choose polite; reserve assertive for urgent changes. Keep a live region mounted before updating its message when reliable announcement is required. Initial page-load content is not guaranteed to announce. When removing a focused banner, move focus to a sensible surviving control; the demo shows this explicitly.

## Migration and integration notes

- Buttons now default to `type=button`. Specify `type=submit` for form submission.
- Controls are taller. Review dense layouts and downstream overrides.
- `dsMenuItem` defaults to native button semantics. A consumer opting into `role=menuitem` must implement a labelled parent menu, navigation, Escape and focus restoration.
- Search exports are removed. Migrate downstream Search imports before upgrading.
- Tabs require a labelled `role=tablist`, exactly one active tab, stable IDs, `panelId`, and matching `role=tabpanel` / `aria-labelledby`. The component moves focus; the consumer click handler changes active state.
- Radios require a shared `name` and synchronized checked bindings in a labelled fieldset. Checkbox/radio/switch need descriptive projected labels.
- The controls are input/output APIs, not Angular Forms ControlValueAccessors. No automatic form-model integration is claimed.
- Tooltip requires a focusable projected trigger. Long-press, RTL before/after positioning and viewport collision handling remain unsupported.
- Date/time fields open native modal dialogs with focus containment, Escape/outside dismissal, and focus return. Date selection commits immediately; time uses Apply/Cancel. Typed-value validation/localization remains consumer-owned. Calendar uses a roving date tab stop with arrow and month navigation, rather than claiming a full ARIA grid implementation.

## Remaining compositions from the XE monitoring audit

The new alert closes one gap. The following are still missing as complete reusable compositions in AILab/itsproject: data table/row/cell family; responsive kiosk list item; filter panel; searchable multi-select; compact sort control; breadcrumb trail; alert-count summary; hardware/status item; HUD panel shell; kiosk quick-details panel; rich error/transaction popover; responsive navigation drawer; trend-chart panel. Existing inputs, buttons, list items and tooltips are building blocks, not proof those larger compositions exist.

## Verification

```sh
npm run build
npm run build:demo
node tests/token-contrast.mjs
# Serve dist/playground/browser on localhost:4173; install Playwright/browser in your test environment.
node tests/accessibility-browser.mjs
```

The browser test supports `PLAYWRIGHT_MODULE`, `CHROMIUM_EXECUTABLE`, and `TEST_URL` overrides. It checks native mixed state, keyboard tab activation, toolbar roving focus, tooltip dismissal, alert action/dismiss/focus return, calendar navigation, numeric time entry, responsive alert bounds, and browser errors. Screenshots are written to `output/accessibility-*.png`.

These checks do not replace manual screen-reader testing (NVDA/JAWS/VoiceOver), 200–400% zoom/reflow testing in consuming apps, forced-colors inspection, or a full automated accessibility audit.

## Primary references

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum), [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)
- [Material checkbox behavior](https://github.com/angular/components/blob/main/src/material/checkbox/checkbox.md), [tabs](https://github.com/angular/components/blob/main/src/material/tabs/tabs.md), [tooltip](https://github.com/angular/components/blob/main/src/material/tooltip/tooltip.md), [toolbar](https://github.com/angular/components/blob/main/src/material/toolbar/toolbar.md)
- [Material 2 banners](https://m2.material.io/components/banners) (persistent banner reference, not an M3 equivalence claim)
- [ARIA toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/), [ARIA alert](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)

Picker/Dropdown update verification: browser coverage includes overlay opening, date commit, cancelled month reset, numeric time Apply, Cancel, focus return, disabled Dropdown options, keyboard selection, outside dismissal, and mobile overlay bounds. Figma uses interactive open/selected variants; it does not reproduce native DOM focus behavior.
