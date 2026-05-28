# SISTEMA — Solo Leveling Mobile UI

Interface de aplicativo mobile inspirada em **Solo Leveling**, com estética
premium, sombria e neon roxa. Construída com HTML, CSS e JavaScript puros — sem
build, sem dependências. Basta abrir no navegador.

## Como rodar

```bash
# qualquer servidor estático, por exemplo:
python3 -m http.server 8080
# depois abra http://localhost:8080
```

Ou simplesmente abra o arquivo `index.html` direto no navegador.

## Telas

Use a **navegação inferior** (STATUS · QUESTS · CAÇADOR · MASMORRAS · PECADOS)
e os atalhos abaixo do dispositivo (Detalhe · Boss · Rank · Perfil). Há também
um botão **GALERIA** no topo que mostra todas as telas lado a lado.

1. **Status** — personagem com aura roxa, rank gigante, barra de EXP e atributos
   (Força, Velocidade, Percepção, Mana, Resistência, Inteligência).
2. **Quests Diárias** — cards glassmorphism com barras de progresso, recompensas
   em cristal e botão de resgate luminoso.
3. **Caçador / Equipamentos** — personagem central com slots de equipamento ao
   redor do corpo, poder total e abas de habilidades.
4. **Masmorras** — lista de portais neon com dificuldade, recompensas e botões
   "ENTRAR" (uma masmorra bloqueada).
5. **Masmorra · Detalhe** — portal cinematográfico, inimigos, boss e recompensas.
6. **Boss Fight** — chefe colossal, HP enorme e botão "DESAFIAR".
7. **Pecados** — fraquezas internas (Preguiça, Gula, Luxúria, Ira, Inveja).
8. **Rank Global** — escada de ranks E · D · C · B · A · S · SS holográfica.
9. **Perfil / Configurações** — card do caçador e lista de ajustes.

## Design

- Paleta: preto absoluto `#050505`, roxo neon `#6A00FF`, azul elétrico `#3B82F6`,
  branco frio.
- Glassmorphism, glows neon, partículas animadas, fumaça e grade em perspectiva.
- Tipografia futurista (Orbitron / Chakra Petch / Rajdhani).

## Arquivos

- `index.html` — estrutura de todas as telas + shell do dispositivo.
- `styles.css` — sistema de design completo.
- `app.js` — navegação, dados, arte SVG dos personagens, partículas e galeria.
