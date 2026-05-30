import type { Habit, Reward, Sin } from '../types'

// Rotina real do usuário (acordar 5h, oração/café/banho gelado antes das 6h,
// trabalho, academia 3x/semana, escola, agência de marketing).
export const INITIAL_HABITS: Habit[] = [
  {
    id: 'h-acordar', nome: 'Acordar 05:00', descricao: 'Levantar às 5h, sem soneca',
    categoria: 'disciplina', dificuldade: 'raro', xp: 120, atributos: ['disciplina', 'energia'],
    streak: 0, horario: '05:00', repeticao: 'Seg a Sáb', raridade: 'raro', icone: '⏰',
    penalidade: 30, recompensa: '+120 XP', concluidoHoje: false,
  },
  {
    id: 'h-rezar', nome: 'Rezar', descricao: 'Oração antes das 6h',
    categoria: 'espiritual', dificuldade: 'comum', xp: 70, atributos: ['foco', 'energia'],
    streak: 0, horario: '05:10', repeticao: 'Diário', raridade: 'comum', icone: '🙏',
    penalidade: 10, recompensa: '+70 XP', concluidoHoje: false,
  },
  {
    id: 'h-banho', nome: 'Banho gelado', descricao: 'Banho frio antes das 6h',
    categoria: 'disciplina', dificuldade: 'raro', xp: 110, atributos: ['vitalidade', 'disciplina'],
    streak: 0, horario: '05:25', repeticao: 'Seg a Sáb', raridade: 'raro', icone: '🚿',
    penalidade: 25, recompensa: '+110 XP', concluidoHoje: false,
  },
  {
    id: 'h-cafe', nome: 'Café da manhã', descricao: 'Tomar café antes das 6h',
    categoria: 'corpo', dificuldade: 'comum', xp: 50, atributos: ['vitalidade'],
    streak: 0, horario: '05:40', repeticao: 'Diário', raridade: 'comum', icone: '☕',
    penalidade: 5, recompensa: '+50 XP', concluidoHoje: false,
  },
  {
    id: 'h-trab-manha', nome: 'Trabalho (manhã)', descricao: 'Serviço 07:00 – 11:30',
    categoria: 'riqueza', dificuldade: 'epico', xp: 200, atributos: ['disciplina', 'foco'],
    streak: 0, horario: '07:00', repeticao: 'Seg a Sáb', raridade: 'epico', icone: '💼',
    penalidade: 35, recompensa: '+200 XP · ⬡ extra', concluidoHoje: false,
  },
  {
    id: 'h-trab-tarde', nome: 'Trabalho (tarde)', descricao: 'Volta 12:30 – 15:20',
    categoria: 'riqueza', dificuldade: 'raro', xp: 150, atributos: ['disciplina', 'foco'],
    streak: 0, horario: '12:30', repeticao: 'Seg a Sáb', raridade: 'raro', icone: '🏢',
    penalidade: 25, recompensa: '+150 XP', concluidoHoje: false,
  },
  {
    id: 'h-academia', nome: 'Academia', descricao: 'Treino 17:00 – 18:00',
    categoria: 'corpo', dificuldade: 'epico', xp: 220, atributos: ['forca', 'vitalidade'],
    streak: 0, horario: '17:00', repeticao: '3x na semana', raridade: 'epico', icone: '🏋',
    penalidade: 40, recompensa: '+220 XP · ◆ x1', concluidoHoje: false,
  },
  {
    id: 'h-escola', nome: 'Escola', descricao: 'Aula 18:30 – 23:10',
    categoria: 'mente', dificuldade: 'epico', xp: 200, atributos: ['inteligencia', 'foco'],
    streak: 0, horario: '18:30', repeticao: 'Seg a Sex', raridade: 'epico', icone: '📚',
    penalidade: 35, recompensa: '+200 XP', concluidoHoje: false,
  },
  {
    id: 'h-agencia', nome: 'Agência de Marketing', descricao: 'Investir tempo na agência',
    categoria: 'produtividade', dificuldade: 'epico', xp: 180, atributos: ['disciplina', 'inteligencia', 'carisma'],
    streak: 0, horario: '21:30', repeticao: 'Diário', raridade: 'epico', icone: '📈',
    penalidade: 30, recompensa: '+180 XP · ⬡ extra', concluidoHoje: false,
  },
]

export const INITIAL_SINS: Sin[] = [
  { id: 's-preguica', nome: 'Preguiça', icone: '🦥', descricao: 'Adiar o que importa', nivel: 1, corrupcao: 0, resistidoHoje: false, caiuHoje: false },
  { id: 's-gula',     nome: 'Gula',     icone: '🍖', descricao: 'Escapadas da dieta',  nivel: 1, corrupcao: 0, resistidoHoje: false, caiuHoje: false },
  { id: 's-luxuria',  nome: 'Luxúria',  icone: '🔥', descricao: 'Distração e impulso',  nivel: 1, corrupcao: 0, resistidoHoje: false, caiuHoje: false },
  { id: 's-ira',      nome: 'Ira',      icone: '⚡', descricao: 'Frustração descontrolada', nivel: 1, corrupcao: 0, resistidoHoje: false, caiuHoje: false },
  { id: 's-inveja',   nome: 'Inveja',   icone: '🌀', descricao: 'Comparação constante', nivel: 1, corrupcao: 0, resistidoHoje: false, caiuHoje: false },
  { id: 's-orgulho',  nome: 'Orgulho',  icone: '👁', descricao: 'Ego acima do progresso', nivel: 1, corrupcao: 0, resistidoHoje: false, caiuHoje: false },
]

export const INITIAL_REWARDS: Reward[] = [
  { id: 'r-social', nome: 'Rede social 30 min', descricao: 'Scroll sem culpa', icone: '📱', custo: 120, moeda: 'coins', categoria: 'social', limitePorDia: 2, resgatadosHoje: 0 },
  { id: 'r-doce', nome: 'Doce', descricao: 'Uma sobremesa', icone: '🍫', custo: 80, moeda: 'coins', categoria: 'doce', limitePorDia: 1, resgatadosHoje: 0 },
  { id: 'r-serie', nome: '1 episódio de série', descricao: 'Um episódio', icone: '📺', custo: 200, moeda: 'coins', categoria: 'lazer', resgatadosHoje: 0 },
  { id: 'r-jogo', nome: '1h de videogame', descricao: 'Sessão de jogo', icone: '🎮', custo: 260, moeda: 'coins', categoria: 'lazer', limitePorDia: 1, resgatadosHoje: 0 },
  { id: 'r-dinheiro', nome: 'R$20 para gastar', descricao: 'Liberar R$20', icone: '💵', custo: 900, moeda: 'coins', categoria: 'dinheiro', resgatadosHoje: 0 },
  { id: 'r-folga', nome: 'Manhã de descanso', descricao: 'Dormir até tarde (domingo)', icone: '🛌', custo: 3, moeda: 'crystals', categoria: 'descanso', limitePorDia: 1, resgatadosHoje: 0 },
]

export const INITIAL_ATTRS = {
  forca: 0,
  vitalidade: 0,
  inteligencia: 0,
  disciplina: 0,
  foco: 0,
  energia: 0,
  carisma: 0,
}
