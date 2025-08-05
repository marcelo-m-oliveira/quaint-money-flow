const fs = require('fs');
const path = require('path');

// Diretório dos ícones de bancos
const banksDir = path.join(__dirname, '..', 'apps', 'web', 'public', 'icons', 'banks');
const outputFile = path.join(__dirname, '..', 'apps', 'web', 'lib', 'data', 'banks.ts');

// Função para converter nome do arquivo para ID
function fileNameToId(fileName) {
  return fileName
    .replace(/\.png$/, '') // Remove extensão
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-') // Substitui caracteres especiais por hífen
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, ''); // Remove hífens do início e fim
}

// Função para converter ID para nome legível
function idToName(id) {
  return id
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\b(Bank|Pay|Card)\b/g, match => match) // Manter palavras específicas
    .replace(/\bBb\b/g, 'BB') // Casos especiais
    .replace(/\bC6\b/g, 'C6')
    .replace(/\bB3\b/g, 'B3')
    .replace(/\bPj\b/g, 'PJ');
}

// Função para gerar termos de busca
function generateSearchTerms(id, name) {
  const terms = new Set();
  
  // Adicionar o nome completo
  terms.add(name.toLowerCase());
  
  // Adicionar palavras individuais do nome
  name.toLowerCase().split(' ').forEach(word => {
    if (word.length > 2) {
      terms.add(word);
    }
  });
  
  // Adicionar o ID
  terms.add(id);
  
  // Adicionar variações do ID
  id.split('-').forEach(part => {
    if (part.length > 2) {
      terms.add(part);
    }
  });
  
  // Casos especiais para bancos brasileiros
  const specialCases = {
    'nubank': ['nu', 'roxinho', 'nubank'],
    'santander': ['santander', 'banco santander'],
    'itau': ['itaú', 'itau', 'banco itau'],
    'bradesco': ['bradesco', 'banco bradesco'],
    'bb': ['banco do brasil', 'bb', 'brasil'],
    'caixa': ['caixa', 'caixa econômica', 'cef'],
    'c6-bank': ['c6', 'c6 bank', 'banco c6'],
    'picpay': ['picpay', 'pic pay'],
    'mercadopago': ['mercado pago', 'mercadopago', 'mp'],
    'inter': ['banco inter', 'inter'],
    'interpj': ['banco inter', 'inter', 'inter pj', 'banco inter pj'],
    'btg': ['btg', 'btg pactual'],
    'btgpactual': ['btg', 'btg pactual', 'btg pactual'],
    'original': ['banco original', 'original'],
    'safra': ['banco safra', 'safra'],
    'pan': ['banco pan', 'pan'],
    'next': ['next', 'banco next'],
    'neon': ['neon', 'banco neon'],
    'digio': ['digio', 'banco digio'],
    'bs2': ['bs2', 'banco bs2'],
    'bv': ['bv', 'banco bv'],
    'daycoval': ['daycoval', 'banco daycoval'],
    'bmg': ['bmg', 'banco bmg'],
    'sicoob': ['sicoob', 'cooperativa sicoob'],
    'sicredi': ['sicredi', 'cooperativa sicredi'],
    'banrisul': ['banrisul', 'banco do estado do rs'],
    'banestes': ['banestes', 'banco do estado do es'],
    'brb': ['brb', 'banco de brasília'],
    'banese': ['banese', 'banco do estado de sergipe']
  };
  
  if (specialCases[id]) {
    specialCases[id].forEach(term => terms.add(term));
  }
  
  return Array.from(terms);
}

// Função principal
function generateBankIcons() {
  try {
    // Ler arquivos do diretório
    const files = fs.readdirSync(banksDir)
      .filter(file => file.endsWith('.png'))
      .sort();
    
    console.log(`Encontrados ${files.length} arquivos PNG`);
    
    // Gerar dados dos bancos
    const bankIcons = files.map(file => {
      const id = fileNameToId(file);
      const name = idToName(id);
      const searchTerms = generateSearchTerms(id, name);
      
      return {
        id,
        name,
        logo: `/icons/banks/${file}`,
        icon: `/icons/banks/${file}`,
        searchTerms
      };
    });
    
    // Gerar conteúdo do arquivo TypeScript
    const tsContent = `import { BankIcon } from '../types'

export const BANK_ICONS: BankIcon[] = [
${bankIcons.map(bank => `  {
    id: '${bank.id}',
    name: '${bank.name}',
    logo: '${bank.logo}',
    icon: '${bank.icon}',
    searchTerms: [${bank.searchTerms.map(term => `'${term}'`).join(', ')}],
  }`).join(',\n')}
]

export function searchBanks(query: string): BankIcon[] {
  if (!query.trim()) {
    return BANK_ICONS
  }

  const searchTerm = query.toLowerCase().trim()
  return BANK_ICONS.filter(
    (bank) =>
      bank.searchTerms.some((term) => term.includes(searchTerm)) ||
      bank.name.toLowerCase().includes(searchTerm),
  )
}

export function findBankByName(name: string): BankIcon | undefined {
  const searchTerm = name.toLowerCase().trim()
  return BANK_ICONS.find(
    (bank) =>
      bank.searchTerms.some((term) => term.includes(searchTerm)) ||
      bank.name.toLowerCase().includes(searchTerm),
  )
}

export function getBankIcon(
  bankId: string,
  type: 'logo' | 'icon' = 'logo',
): string | undefined {
  const bank = BANK_ICONS.find((bank) => bank.id === bankId)
  return bank ? bank[type] : undefined
}
`;
    
    // Escrever arquivo
    fs.writeFileSync(outputFile, tsContent, 'utf8');
    
    console.log(`✅ Arquivo gerado com sucesso: ${outputFile}`);
    console.log(`📊 ${bankIcons.length} bancos processados`);
    
    // Mostrar alguns exemplos
    console.log('\n📋 Exemplos de bancos gerados:');
    bankIcons.slice(0, 5).forEach(bank => {
      console.log(`  - ${bank.name} (${bank.id})`);
    });
    
    return bankIcons;
    
  } catch (error) {
    console.error('❌ Erro ao gerar ícones de bancos:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  generateBankIcons();
}

module.exports = { generateBankIcons };