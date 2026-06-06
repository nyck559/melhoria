import type { Reward, Sin, Task } from '../types'

// weekday sets (0=Dom … 6=Sáb)
const SEG_SEX = [1, 2, 3, 4, 5]
const SEG_SAB = [1, 2, 3, 4, 5, 6]
const TODOS = [0, 1, 2, 3, 4, 5, 6]
const ACADEMIA = [1, 3, 5] // 3x na semana
const SABADO = [6]

export const INITIAL_TASKS: Task[] = [
  { id: 't-acordar', nome: 'Acordar 05:20 e levantar', icone: '⏰', moedas: 15, dias: SEG_SAB, ordem: 0 },
  { id: 't-arrumar', nome: 'Me arrumar e organizar p/ o serviço', icone: '🎒', moedas: 8, dias: SEG_SAB, ordem: 1 },
  { id: 't-leitura1', nome: 'Ler 2 páginas de um livro (manhã)', icone: '📖', moedas: 8, dias: TODOS, ordem: 2 },
  { id: 't-pod-vendas', nome: 'Ouvir podcast de vendas', icone: '🎧', moedas: 8, dias: SEG_SAB, ordem: 3 },
  { id: 't-trab-manha', nome: 'Trabalhar (manhã)', icone: '💼', moedas: 20, dias: SEG_SAB, ordem: 4 },
  { id: 't-pod-motiv', nome: 'Podcast de motivação no almoço', icone: '🔊', moedas: 6, dias: SEG_SAB, ordem: 5 },
  { id: 't-prosp-almoco', nome: 'Prospecção no almoço', icone: '📞', moedas: 12, dias: SEG_SAB, ordem: 6 },
  { id: 't-trab-tarde', nome: 'Trabalhar (tarde)', icone: '🏢', moedas: 20, dias: SEG_SAB, ordem: 7 },
  { id: 't-academia', nome: 'Academia', icone: '🏋️', moedas: 20, dias: ACADEMIA, ordem: 8 },
  { id: 't-prospectar', nome: 'Prospectar', icone: '🎯', moedas: 12, dias: SEG_SEX, ordem: 9 },
  { id: 't-escola', nome: 'Escola', icone: '🏫', moedas: 18, dias: SEG_SEX, ordem: 10 },
  { id: 't-financas', nome: 'Estudar educação financeira', icone: '📊', moedas: 10, dias: SEG_SEX, ordem: 11 },
  { id: 't-leitura2', nome: 'Ler 2 páginas de um livro (noite)', icone: '📚', moedas: 8, dias: TODOS, ordem: 12 },
  { id: 't-creatina', nome: 'Tomar creatina', icone: '💊', moedas: 4, dias: TODOS, ordem: 13 },
  { id: 't-amendoim', nome: 'Colher de pasta de amendoim', icone: '🥜', moedas: 4, dias: TODOS, ordem: 14 },
  { id: 't-postagens', nome: '5 postagens para a semana', icone: '📸', moedas: 25, dias: SABADO, ordem: 15 },
  { id: 't-jarvis', nome: 'Trabalhar no Jarvis', icone: '🤖', moedas: 25, dias: SABADO, ordem: 16 },
]

export const INITIAL_SINS: Sin[] = [
  { id: 's-luxuria', nome: 'Luxúria', icone: '🔥', descricao: 'Impulso e distração', corrupcao: 0 },
  { id: 's-preguica', nome: 'Preguiça', icone: '🦥', descricao: 'Adiar o que importa', corrupcao: 0 },
  { id: 's-gula', nome: 'Gula', icone: '🍔', descricao: 'Escapadas da dieta', corrupcao: 0 },
  { id: 's-ira', nome: 'Ira', icone: '⚡', descricao: 'Frustração descontrolada', corrupcao: 0 },
  { id: 's-inveja', nome: 'Inveja', icone: '🌀', descricao: 'Comparação constante', corrupcao: 0 },
  { id: 's-orgulho', nome: 'Orgulho', icone: '👁', descricao: 'Ego acima do progresso', corrupcao: 0 },
]

const money = (valor: number): Reward => ({
  id: `r-gastar-${valor}`,
  nome: `Gastar R$${valor.toLocaleString('pt-BR')}`,
  icone: '💵',
  custo: valor,
  categoria: 'dinheiro',
  resgatadosHoje: 0,
})

export const INITIAL_REWARDS: Reward[] = [
  { id: 'r-doce', nome: 'Comer um doce', icone: '🍫', custo: 60, categoria: 'doce', limitePorDia: 1, resgatadosHoje: 0 },
  { id: 'r-serie', nome: 'Assistir série no domingo', icone: '📺', custo: 120, categoria: 'lazer', limitePorDia: 1, resgatadosHoje: 0 },
  { id: 'r-jogar', nome: 'Jogar no domingo', icone: '🎮', custo: 150, categoria: 'lazer', limitePorDia: 1, resgatadosHoje: 0 },
  { id: 'r-sabado', nome: 'Sábado livre', icone: '🌴', custo: 400, categoria: 'descanso', resgatadosHoje: 0 },
  money(100), money(200), money(300), money(400), money(500), money(600), money(700),
  money(800), money(900), money(1000), money(1500), money(2000), money(3000), money(5000), money(10000),
]
