export interface ColorToken {
  readonly name: string
  readonly value: string
  readonly cssVariable: string
}

export interface ColorRamp {
  readonly name: string
  readonly description: string
  readonly tokens: readonly ColorToken[]
}

const token = (name: string, value: string, cssVariable: string): ColorToken => ({ name, value, cssVariable })

export const colorRamps: readonly ColorRamp[] = [
  { name: 'Brand colors', description: 'Exact IGT/Everi primary colors. Use IGT Purple for graphics and focus indicators; Iced Purple with Slate for readable controls.', tokens: [
    token('IGT Purple', '#B850FD', '--brand-igt-purple'),
    token('Iced Purple', '#BEACFE', '--brand-iced-purple'),
  ] },
  { name: 'Neutrals', description: 'White and Gray surfaces with Slate body text. Slate surfaces use White text.', tokens: [
    token('White', '#F7F7F7', '--brand-white'),
    token('Gray', '#E5E5E5', '--brand-gray'),
    token('Slate', '#292D3D', '--brand-slate'),
  ] },
  { name: 'Accent colors', description: 'Decorative accents only, not background fills or body text. Cyan and Magenta values come from the brand appendix.', tokens: [
    token('Cyan', '#00DCFA', '--brand-cyan'),
    token('Magenta', '#EE36E4', '--brand-magenta'),
  ] },
]

export const semanticColorGroups = [
  { name: 'Background', prefix: 'background', tokens: ['primary', 'secondary', 'tertiary', 'inverse', 'brand', 'brand-subtle'] },
  { name: 'Surface', prefix: 'surface', tokens: ['default', 'raised', 'overlay'] },
  { name: 'Text', prefix: 'text', tokens: ['primary', 'secondary', 'tertiary', 'disabled', 'inverse', 'link', 'brand'] },
  { name: 'Primary action', prefix: 'action-primary', tokens: ['default', 'hover', 'active', 'subtle', 'on-primary'] },
  { name: 'Secondary action', prefix: 'action-secondary', tokens: ['default', 'hover', 'active', 'subtle', 'on-secondary'] },
  { name: 'Accent', prefix: 'accent', tokens: ['default', 'hover', 'active', 'subtle', 'on-accent'] },
  { name: 'Feedback', prefix: 'feedback', tokens: ['success', 'success-subtle', 'warning', 'warning-subtle', 'error', 'error-subtle'] },
  { name: 'Icon', prefix: 'icon', tokens: ['primary', 'secondary', 'disabled', 'inverse', 'brand', 'accent'] },
  { name: 'Border', prefix: 'border', tokens: ['default', 'subtle', 'strong', 'focus', 'error', 'disabled', 'brand', 'accent'] },
] as const

export const spacing = [0, 1, 2, 3, 4, 6, 8, 10, 11, 12, 14, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 120, 160] as const

export const radii = {
  none: 0, '2xs': 1, xs: 2, sm: 4, default: 6, md: 8, 'md-lg': 10,
  lg: 12, xl: 16, '2xl': 20, '3xl': 24, pill: 100, full: 9999,
} as const

export const strokes = {
  none: 0,
  hairline: 0.6667,
  'extra-thin': 0.75,
  thin: 1,
  default: 1.5,
  medium: 2,
  thick: 3,
  heavy: 4,
} as const
