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
├── camada do personagem (arte ilustrada + parallax)
├── aura + wisps de sombra
├── HUD holográfico (frames, scanlines, shimmer)
├── overlay de UI
└── bottom navigation premium
```

## Personagem & arte

A arte (personagem, boss e portais) é **ilustração flat-art / anime gerada**,
otimizada para WebP em `public/art/` — sem SVG desenhado na mão.
`src/components/character/Hunter.tsx` exibe o splash ilustrado e o mantém
"vivo": flutuação, breathing (escala), parallax, aura pulsante, wash de energia
e embers subindo nos ranks altos.

**A arte do personagem troca com o rank (evolução visual):**

| Tier | Ranks | Arte | Visual |
|------|-------|------|--------|
| fraco | E–D | `hunter_weak` | postura baixa, aura mínima |
| firme / dominante | C–S | `hunter_dominant` | pose imponente, aura ativa |
| transcendente | SS–SSS | `hunter_transcendent` | monarca divino, aura gigante |

O boss usa `boss_iron`; as masmorras usam `portal_gate` (tingido por matiz por
masmorra). Para trocar a arte, basta substituir os arquivos em `public/art/`.

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
