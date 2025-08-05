const fs = require('fs')
const path = require('path')

// Caminho base da pasta icons
const ICONS_DIR = path.join(__dirname, 'icons')
const OUTPUT_FILE = path.join(__dirname, 'index.ts')

// Converte nomes como "activo.bank" ou "my-icon_name" para "ActivoBankIcon"
const toPascalCase = (str) =>
  str
    .replace(/\.png$/i, '') // remove extensão
    .replace(/\./g, '-') // substitui pontos por hífen
    .split(/[-_\/\\]/) // separa por hífen, underscore, barra
    .filter(Boolean) // remove strings vazias
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Icon'

// Função recursiva para buscar todos os PNGs dentro de subpastas
const getAllPngFiles = (dir) => {
  let results = []
  const list = fs.readdirSync(dir)

  list.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      results = results.concat(getAllPngFiles(filePath))
    } else if (file.toLowerCase().endsWith('.png')) {
      results.push(filePath)
    }
  })

  return results
}

// Buscar todos os PNGs e gerar exports
const files = getAllPngFiles(ICONS_DIR)

const exportsContent = files
  .map((file) => {
    const relativePath =
      './' + path.relative(__dirname, file).replace(/\\/g, '/')
    const exportName = toPascalCase(path.relative(ICONS_DIR, file))
    return `export { default as ${exportName} } from '${relativePath}'`
  })
  .join('\n')

// Escrever no index.ts
fs.writeFileSync(OUTPUT_FILE, exportsContent, 'utf8')
console.log(`✅ Arquivo index.ts gerado com ${files.length} ícones!`)
