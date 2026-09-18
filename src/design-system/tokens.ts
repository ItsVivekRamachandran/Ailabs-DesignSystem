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
  { name: 'Primary', description: 'Core brand ramp anchored at deep teal-green.', tokens: [
    token('50', '#F3F5F5', '--primitive-primary-50'), token('100', '#E3E8E7', '--primitive-primary-100'), token('200', '#C4CFCD', '--primitive-primary-200'), token('300', '#94A9A5', '--primitive-primary-300'), token('400', '#597972', '--primitive-primary-400'), token('500', '#123F36', '--primitive-primary-500'), token('600', '#0F362E', '--primitive-primary-600'), token('700', '#0D2C26', '--primitive-primary-700'), token('800', '#0A231E', '--primitive-primary-800'), token('900', '#071916', '--primitive-primary-900'), token('950', '#040E0C', '--primitive-primary-950'),
  ] },
  { name: 'Secondary', description: 'Complementary green for secondary actions and surfaces.', tokens: [
    token('50', '#F4F8F7', '--primitive-secondary-50'), token('100', '#E5EDEB', '--primitive-secondary-100'), token('200', '#CADAD6', '--primitive-secondary-200'), token('300', '#9FBCB6', '--primitive-secondary-300'), token('400', '#6A978D', '--primitive-secondary-400'), token('500', '#2A6B5C', '--primitive-secondary-500'), token('600', '#245B4E', '--primitive-secondary-600'), token('700', '#1D4B40', '--primitive-secondary-700'), token('800', '#173B33', '--primitive-secondary-800'), token('900', '#112B25', '--primitive-secondary-900'), token('950', '#091814', '--primitive-secondary-950'),
  ] },
  { name: 'Support Gold', description: 'Warm accent ramp for highlights, badges, and premium features.', tokens: [
    token('50', '#FCFAF6', '--primitive-support-gold-50'), token('100', '#F8F3E9', '--primitive-support-gold-100'), token('200', '#F0E6D0', '--primitive-support-gold-200'), token('300', '#E4D2AB', '--primitive-support-gold-300'), token('400', '#D6B87D', '--primitive-support-gold-400'), token('500', '#C49A45', '--primitive-support-gold-500'), token('600', '#A7833B', '--primitive-support-gold-600'), token('700', '#896C30', '--primitive-support-gold-700'), token('800', '#6C5526', '--primitive-support-gold-800'), token('900', '#4E3E1C', '--primitive-support-gold-900'), token('950', '#2B220F', '--primitive-support-gold-950'),
  ] },
  { name: 'Support Sand', description: 'Earthy neutral-warm palette for layering and soft backgrounds.', tokens: [
    token('50', '#FEFDFC', '--primitive-support-sand-50'), token('100', '#FCFBF8', '--primitive-support-sand-100'), token('200', '#F9F6F0', '--primitive-support-sand-200'), token('300', '#F5EFE4', '--primitive-support-sand-300'), token('400', '#EFE6D6', '--primitive-support-sand-400'), token('500', '#E8DCC4', '--primitive-support-sand-500'), token('600', '#C5BBA7', '--primitive-support-sand-600'), token('700', '#A29A89', '--primitive-support-sand-700'), token('800', '#80796C', '--primitive-support-sand-800'), token('900', '#5D584E', '--primitive-support-sand-900'), token('950', '#33302B', '--primitive-support-sand-950'),
  ] },
  { name: 'Neutral', description: 'Accessible grayscale for text, borders, dividers, and disabled states.', tokens: [
    token('0', '#FFFFFF', '--primitive-neutral-0'), token('50', '#F7FAF7', '--primitive-neutral-50'), token('100', '#F0F2F2', '--primitive-neutral-100'), token('200', '#E0E5E3', '--primitive-neutral-200'), token('300', '#C9D1CF', '--primitive-neutral-300'), token('400', '#9CA6A3', '--primitive-neutral-400'), token('500', '#73807A', '--primitive-neutral-500'), token('600', '#57615E', '--primitive-neutral-600'), token('700', '#424A47', '--primitive-neutral-700'), token('800', '#2B3330', '--primitive-neutral-800'), token('900', '#1C2121', '--primitive-neutral-900'), token('950', '#0D120F', '--primitive-neutral-950'),
  ] },
  { name: 'Black & White', description: 'Pure values for overlays, shadows, and absolute contrast.', tokens: [
    token('Black', '#000000', '--primitive-black'), token('White', '#FFFFFF', '--primitive-white'),
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
