# SISTEMA — Solo Leveling Life System

Um **sistema de evolução pessoal gamificado** com interface cinematográfica
estilo anime AAA (Solo Leveling / Honkai Star Rail / Wuthering Waves).
Não é um app de hábitos comum — é uma experiência onde **você evolui como um
personagem**.

Construído com **React + TypeScript + Vite + Tailwind + Framer Motion** e
**Web Audio API**. Tudo persiste em `localStorage`.

## Rodar

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run preview  # servir o build
```

## Arquitetura visual (por tela)

Cada tela é montada em camadas full-screen:

```
ROOT
├── gradiente animado + grade em perspectiva  (parallax)
├── blooms de energia ambiente
├── névoa/fumaça rastejante
├── partículas (canvas, lighter blend)
├── camada do personagem (SVG animado + parallax)
├── aura + wisps de sombra
├── HUD holográfico (frames, scanlines, shimmer)
├── overlay de UI
└── bottom navigation premium
```

## Personagem

`src/components/character/Hunter.tsx` — SVG anime **layered e animado** (sem
PNG/placeholder). Anima: respiração, flutuação, piscar aleatório, balanço de
cabelo e casaco, pulso de aura, partículas de energia e wisps de sombra.

**Evolui com o rank:**

| Tier | Ranks | Visual |
|------|-------|--------|
| fraco | E–D | postura baixa, aura mínima, olhos escuros |
| firme | C–B | postura firme, olhos brilhando, aura ativa |
| dominante | A–S | energia intensa, mãos energizadas, partículas |
| transcendente | SS–SSS | terceiro olho, tendrils cósmicos, aura gigante |

## Telas

- **Status** — personagem ~70% da tela, rank badge com anéis rotativos, barra de
  EXP, 7 atributos holográficos (força, vitalidade, inteligência, disciplina,
  foco, energia, carisma) com números animados.
- **Quests** — hábitos cinematográficos com glow por raridade, borda animada,
  checkmark animado, XP popup. **CRUD completo de hábitos** (criar/editar/excluir,
  categoria, dificuldade, raridade, XP, atributos afetados, horário, repetição,
  recompensa, penalidade).
- **Caçador** — inventário RPG: slots de equipamento ao redor do corpo, aura
  configurável que muda os FX, poder total animado.
- **Masmorras** — portais animados, dificuldade, recompensas, botão ENTRAR.
- **Boss Fight** — boss colossal SVG, energia roxa intensa, HP enorme, screen
  shake e botão DESAFIAR.
- **Pecados** — tema de corrupção (vermelho). Sliders por pecado alimentam a
  **corrupção total**, que escurece a tela e a aura do personagem.
- **Rank** — badge gigante com anéis, escada E→SSS, progresso animado.
- **Perfil** — card do caçador, toggle de áudio, resetar dia.

## Sistema de XP / evolução

Concluir um hábito concede XP (escalado por raridade), sobe os **atributos
afetados**, e o XP total define o **nível** e o **rank** — que por sua vez muda a
aparência do personagem. Curva de XP em `src/data/game.ts`.

## Áudio (opcional)

`src/hooks/useAudio.ts` — drone ambiente dark + SFX (UI, XP, level up, desafio,
corrupção) sintetizados via Web Audio API. Ative no ícone 🔊 (topo) ou no Perfil.

## Estrutura

```
src/
├── data/        game.ts (ranks, atributos, XP), initial.ts (seed)
├── store/       useGame.ts (Zustand + persist)
├── hooks/       useParallax.ts, useAudio.ts
├── components/
│   ├── atmosphere/  Atmosphere.tsx, Particles.tsx
│   ├── character/   Hunter.tsx
│   ├── hud/         RankBadge.tsx, FxOverlay.tsx
│   ├── nav/         BottomNav.tsx
│   └── common/      ui.tsx, Screen.tsx, HabitEditor.tsx
└── screens/     Status, Quests, Hunter, Dungeons, Boss, Sins, Rank, Profile
```
