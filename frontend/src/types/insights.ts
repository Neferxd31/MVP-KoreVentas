export interface Insights {
  champion: ChampionInsight | null
  slowMover: SlowMoverInsight | null
  bundle: BundleInsight | null
}

export interface ChampionInsight {
  itemType: 'PRODUCT' | 'SERVICE'
  itemId: string | null
  name: string
  quantity: number
  revenue: number
}

export interface SlowMoverInsight {
  id: string
  name: string
  stock: number
  price: number
  cost: number | null
}

export interface BundleInsight {
  first: string
  second: string
  timesTogether: number
}

export interface ProfitabilityRow {
  id: string
  name: string
  price: number
  cost: number
  quantity: number
  revenue: number
  grossProfit: number
  marginPct: number
}
