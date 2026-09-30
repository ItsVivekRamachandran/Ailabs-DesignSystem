import { readdir, readFile, writeFile } from 'node:fs/promises'
const directory = new URL('../src/assets/icons/material/', import.meta.url)
const icons = {}
for (const name of (await readdir(directory)).filter(name => name.endsWith('.svg')).sort()) {
  const svg = await readFile(new URL(name, directory), 'utf8')
  icons[name.slice(0, -4)] = { viewBox: svg.match(/viewBox="([^"]+)"/)?.[1] || '0 0 24 24', paths: [...svg.matchAll(/<path[^>]* d="([^"]+)"/g)].map(match => match[1]) }
}
await writeFile(new URL('../src/app/design-system/material-icons.ts', import.meta.url), '// Generated from the local official Google Material Symbols SVG assets. Apache-2.0.\nexport const materialIcons = ' + JSON.stringify(icons, null, 2) + ' as const\nexport type MaterialIconName = keyof typeof materialIcons\n')
console.log(`Generated ${Object.keys(icons).length} local SVG definitions`)
