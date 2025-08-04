import { BankIcon } from '../types'

export const BANK_ICONS: BankIcon[] = [
  {
    id: 'nubank',
    name: 'Nubank',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nubank/nubank-original.svg',
    searchTerms: ['nubank', 'nu', 'roxinho'],
  },
  {
    id: 'itau',
    name: 'Itaú',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Ita%C3%BA_logo.svg/200px-Ita%C3%BA_logo.svg.png',
    searchTerms: ['itau', 'itaú', 'banco itau', 'banco itaú'],
  },
  {
    id: 'bradesco',
    name: 'Bradesco',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Bradesco_logo.svg/200px-Bradesco_logo.svg.png',
    searchTerms: ['bradesco', 'banco bradesco'],
  },
  {
    id: 'santander',
    name: 'Santander',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Banco_Santander_Logotipo.svg/200px-Banco_Santander_Logotipo.svg.png',
    searchTerms: ['santander', 'banco santander'],
  },
  {
    id: 'bb',
    name: 'Banco do Brasil',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Banco_do_Brasil_Logo.svg/200px-Banco_do_Brasil_Logo.svg.png',
    searchTerms: ['banco do brasil', 'bb', 'brasil'],
  },
  {
    id: 'caixa',
    name: 'Caixa Econômica Federal',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Caixa_Econ%C3%B4mica_Federal_logo.svg/200px-Caixa_Econ%C3%B4mica_Federal_logo.svg.png',
    searchTerms: ['caixa', 'caixa economica', 'caixa econômica', 'cef'],
  },
  {
    id: 'inter',
    name: 'Banco Inter',
    logo: 'https://logoeps.com/wp-content/uploads/2013/03/banco-inter-vector-logo.png',
    searchTerms: ['inter', 'banco inter', 'laranja'],
  },
  {
    id: 'c6',
    name: 'C6 Bank',
    logo: 'https://logoeps.com/wp-content/uploads/2013/03/c6-bank-vector-logo.png',
    searchTerms: ['c6', 'c6 bank', 'banco c6'],
  },
  {
    id: 'original',
    name: 'Banco Original',
    logo: 'https://logoeps.com/wp-content/uploads/2013/03/banco-original-vector-logo.png',
    searchTerms: ['original', 'banco original'],
  },
  {
    id: 'next',
    name: 'Next',
    logo: 'https://logoeps.com/wp-content/uploads/2013/03/next-vector-logo.png',
    searchTerms: ['next', 'banco next'],
  },
  {
    id: 'picpay',
    name: 'PicPay',
    logo: 'https://logoeps.com/wp-content/uploads/2013/03/picpay-vector-logo.png',
    searchTerms: ['picpay', 'pic pay'],
  },
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    logo: 'https://logoeps.com/wp-content/uploads/2013/03/mercado-pago-vector-logo.png',
    searchTerms: ['mercado pago', 'mercadopago', 'mp'],
  },
  {
    id: 'stone',
    name: 'Stone',
    logo: 'https://logoeps.com/wp-content/uploads/2013/03/stone-vector-logo.png',
    searchTerms: ['stone', 'banco stone'],
  },
  {
    id: 'neon',
    name: 'Neon',
    logo: 'https://logoeps.com/wp-content/uploads/2013/03/neon-vector-logo.png',
    searchTerms: ['neon', 'banco neon'],
  },
  {
    id: 'will',
    name: 'Will Bank',
    logo: 'https://logoeps.com/wp-content/uploads/2013/03/will-bank-vector-logo.png',
    searchTerms: ['will', 'will bank', 'banco will'],
  },
  {
    id: 'safra',
    name: 'Safra',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Banco_Safra_logo.svg/200px-Banco_Safra_logo.svg.png',
    searchTerms: ['safra', 'banco safra'],
  },
  {
    id: 'sicredi',
    name: 'Sicredi',
    logo: 'https://logoeps.com/wp-content/uploads/2013/03/sicredi-vector-logo.png',
    searchTerms: ['sicredi', 'banco sicredi'],
  },
  {
    id: 'sicoob',
    name: 'Sicoob',
    logo: 'https://logoeps.com/wp-content/uploads/2013/03/sicoob-vector-logo.png',
    searchTerms: ['sicoob', 'banco sicoob'],
  },
  {
    id: 'btg',
    name: 'BTG Pactual',
    logo: 'https://logoeps.com/wp-content/uploads/2013/03/btg-pactual-vector-logo.png',
    searchTerms: ['btg', 'btg pactual', 'banco btg'],
  },
  {
    id: 'xp',
    name: 'XP Investimentos',
    logo: 'https://logoeps.com/wp-content/uploads/2013/03/xp-investimentos-vector-logo.png',
    searchTerms: ['xp', 'xp investimentos'],
  },
]

// Função para buscar bancos por nome
export function searchBanks(query: string): BankIcon[] {
  if (!query.trim()) return BANK_ICONS

  const normalizedQuery = query.toLowerCase().trim()

  return BANK_ICONS.filter((bank) =>
    bank.searchTerms.some((term) =>
      term.toLowerCase().includes(normalizedQuery),
    ),
  )
}

// Função para encontrar banco automaticamente pelo nome
export function findBankByName(name: string): BankIcon | null {
  if (!name.trim()) return null

  const normalizedName = name.toLowerCase().trim()

  return (
    BANK_ICONS.find((bank) =>
      bank.searchTerms.some(
        (term) =>
          term.toLowerCase() === normalizedName ||
          normalizedName.includes(term.toLowerCase()),
      ),
    ) || null
  )
}
