import type { EquipItem, EquipSlot } from '../types'

/** Equipment catalog — v1 has one item per slot; equipping toggles it on/off. */
export const EQUIPMENT: EquipItem[] = [
  { id: 'e-blade', slot: 'arma', nome: 'Lâmina Sombria', icone: '⚔', tier: 'S', power: 180, attrBonus: { forca: 6 } },
  { id: 'e-aegis', slot: 'escudo', nome: 'Égide do Vazio', icone: '🛡', tier: 'A', power: 120, attrBonus: { vitalidade: 5, disciplina: 3 } },
  { id: 'e-crown', slot: 'coroa', nome: 'Coroa do Monarca', icone: '👑', tier: 'S', power: 200, attrBonus: { carisma: 6 }, aura: '#ffcb57' },
  { id: 'e-ring', slot: 'anel', nome: 'Anel Arcano', icone: '💍', tier: 'B', power: 90, attrBonus: { inteligencia: 4 }, aura: '#46e0ff' },
  { id: 'e-elixir', slot: 'elixir', nome: 'Elixir', icone: '🧪', tier: 'C', power: 60, attrBonus: { energia: 4 } },
  { id: 'e-amulet', slot: 'amuleto', nome: 'Amuleto Espectral', icone: '📿', tier: 'A', power: 130, attrBonus: { foco: 4, energia: 2 }, aura: '#8b3bff' },
]

export const SLOT_ORDER: EquipSlot[] = ['arma', 'escudo', 'coroa', 'anel', 'elixir', 'amuleto']

export const SLOT_LABEL: Record<EquipSlot, string> = {
  arma: 'Arma',
  escudo: 'Escudo',
  coroa: 'Coroa',
  anel: 'Anel',
  elixir: 'Elixir',
  amuleto: 'Amuleto',
}

export const itemById = (id?: string) => EQUIPMENT.find((e) => e.id === id)
export const itemForSlot = (slot: EquipSlot) => EQUIPMENT.find((e) => e.slot === slot)
