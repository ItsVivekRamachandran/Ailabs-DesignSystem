import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const css = readFileSync('src/design-system/tokens.css', 'utf8')
const [light, dark] = css.split(":root[data-theme='dark']")
const parse = s => Object.fromEntries([...s.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]))
const base = parse(light)
const resolve = (name, tokens) => {
 let value = tokens[name]
 for (let i = 0; value?.startsWith('var(') && i < 12; i++) value = tokens[value.slice(4, -1)]
 assert.match(value, /^#[0-9a-f]{6}$/i, name)
 return value
}
const luminance = hex => {
 const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4)
 return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722
}
const checks = []
for (const [theme, tokens] of [['light', base], ['dark', { ...base, ...parse(dark) }]]) {
 const pairs = [
  ['--text-primary', '--surface-default', 4.5], ['--text-secondary', '--surface-default', 4.5], ['--text-tertiary', '--surface-default', 4.5],
  ['--feedback-warning', '--feedback-warning-subtle', 4.5], ['--feedback-error', '--feedback-error-subtle', 4.5], ['--feedback-success', '--feedback-success-subtle', 4.5],
  ['--text-brand', '--background-brand-subtle', 4.5], ['--border-strong', '--surface-default', 3], ['--border-focus', '--surface-default', 3],
  ...['primary', 'secondary'].flatMap(tone => ['default', 'hover', 'active'].map(state => [`--action-${tone}-on-${tone}`, `--action-${tone}-${state}`, 4.5]))
 ]
 for (const [fg,bg,min] of pairs) {
  const a = luminance(resolve(fg,tokens)), b = luminance(resolve(bg,tokens)), ratio = (Math.max(a,b)+.05)/(Math.min(a,b)+.05)
  checks.push({theme,fg,bg,ratio:Number(ratio.toFixed(2)),minimum:min})
  assert.ok(ratio >= min, `${theme} ${fg}/${bg}: ${ratio}`)
 }
}
console.log(JSON.stringify(checks,null,2))
