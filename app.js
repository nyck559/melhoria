/* ============================================================
   SISTEMA — app logic
   particles · navigation · data render · char art · gallery
   ============================================================ */
(() => {
  'use strict';

  /* ---------- SVG character art (data URIs) ---------- */
  const svg = (s) => `url("data:image/svg+xml;utf8,${encodeURIComponent(s)}")`;

  const HUNTER = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">
    <defs>
      <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1a1030"/><stop offset="1" stop-color="#05030c"/>
      </linearGradient>
      <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#b98bff"/><stop offset="1" stop-color="#3b82f6"/>
      </linearGradient>
      <radialGradient id="eye" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#fff"/><stop offset="0.5" stop-color="#46e0ff"/><stop offset="1" stop-color="#6a00ff"/>
      </radialGradient>
    </defs>
    <g stroke="url(#edge)" stroke-width="1.4" fill="url(#body)">
      <path d="M100 28 C112 28 122 40 122 56 C122 70 116 80 100 84 C84 80 78 70 78 56 C78 40 88 28 100 28Z"/>
      <path d="M70 60 C60 52 58 38 66 30 C70 46 82 54 82 60Z"/>
      <path d="M130 60 C140 52 142 38 134 30 C130 46 118 54 118 60Z"/>
      <path d="M64 96 C70 84 88 80 100 80 C112 80 130 84 136 96 L150 180 C150 200 140 210 132 214 L120 300 L108 300 L106 220 L94 220 L92 300 L80 300 L68 214 C60 210 50 200 50 180Z"/>
      <path d="M64 100 L40 150 L46 200 L60 196 L58 150 Z"/>
      <path d="M136 100 L160 150 L154 200 L140 196 L142 150 Z"/>
    </g>
    <path d="M92 58 L100 64 L108 58" fill="none" stroke="url(#eye)" stroke-width="3" stroke-linecap="round"/>
    <circle cx="90" cy="56" r="3.4" fill="url(#eye)"/>
    <circle cx="110" cy="56" r="3.4" fill="url(#eye)"/>
    <path d="M150 150 L186 120 L182 132 L156 168Z" fill="url(#body)" stroke="url(#edge)" stroke-width="1.2"/>
    <line x1="156" y1="160" x2="184" y2="124" stroke="#46e0ff" stroke-width="1.5" opacity="0.8"/>
  </svg>`;

  const BOSS = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 300">
    <defs>
      <linearGradient id="bbody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#241024"/><stop offset="1" stop-color="#070309"/>
      </linearGradient>
      <linearGradient id="bedge" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ff5a7d"/><stop offset="0.6" stop-color="#b98bff"/><stop offset="1" stop-color="#3b82f6"/>
      </linearGradient>
      <radialGradient id="beye" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#fff"/><stop offset="0.4" stop-color="#ff5a7d"/><stop offset="1" stop-color="#6a00ff"/>
      </radialGradient>
    </defs>
    <g stroke="url(#bedge)" stroke-width="1.6" fill="url(#bbody)">
      <path d="M120 30 C150 30 170 56 170 86 C170 110 150 124 120 128 C90 124 70 110 70 86 C70 56 90 30 120 30Z"/>
      <path d="M70 78 C40 50 34 26 50 14 C54 44 78 60 86 74Z"/>
      <path d="M170 78 C200 50 206 26 190 14 C186 44 162 60 154 74Z"/>
      <path d="M84 122 C96 108 108 104 120 104 C132 104 144 108 156 122 L184 200 C188 230 172 244 160 250 L150 300 L132 300 L128 230 L112 230 L108 300 L90 300 L80 250 C68 244 52 230 56 200Z"/>
      <path d="M84 128 L36 180 L30 250 L54 244 L70 180Z"/>
      <path d="M156 128 L204 180 L210 250 L186 244 L170 180Z"/>
      <path d="M40 200 L18 250 L34 246 L48 214Z"/>
      <path d="M200 200 L222 250 L206 246 L192 214Z"/>
    </g>
    <circle cx="104" cy="84" r="6" fill="url(#beye)"/>
    <circle cx="136" cy="84" r="6" fill="url(#beye)"/>
    <path d="M104 104 L120 112 L136 104" fill="none" stroke="url(#beye)" stroke-width="2.4"/>
  </svg>`;

  document.querySelectorAll('[data-char="status"],[data-char="hunter"]').forEach(el => el.style.backgroundImage = svg(HUNTER));
  document.querySelectorAll('[data-char="boss"]').forEach(el => el.style.backgroundImage = svg(BOSS));
  // profile avatar uses a contained version
  document.querySelectorAll('.profile-card__avatar').forEach(el => { el.style.backgroundImage = svg(HUNTER); el.style.backgroundSize='contain'; el.style.backgroundRepeat='no-repeat'; el.style.backgroundPosition='center bottom'; });

  /* ---------- DATA ---------- */
  const attrs = [
    { name:'Força',        ico:'💪', val:28, pct:62, c:'#ff5a7d' },
    { name:'Velocidade',   ico:'⚡', val:34, pct:74, c:'#ffcb57' },
    { name:'Percepção',    ico:'👁', val:22, pct:48, c:'#46e0ff' },
    { name:'Mana',         ico:'✦', val:41, pct:88, c:'#8b3bff' },
    { name:'Resistência',  ico:'🛡', val:26, pct:56, c:'#43ffb0' },
    { name:'Inteligência', ico:'🧠', val:30, pct:66, c:'#3b82f6' },
  ];

  const quests = [
    { ico:'🏋', title:'Treinar por 60 minutos',   cur:42, max:60, rew:'+150 XP', done:false },
    { ico:'📖', title:'Estudar por 90 minutos',   cur:90, max:90, rew:'+200 XP', done:true },
    { ico:'📚', title:'Ler 20 páginas',           cur:20, max:20, rew:'+120 XP', done:true, claim:true },
    { ico:'💧', title:'Beber 3L de água',         cur:1.6, max:3, rew:'+80 XP',  done:false },
    { ico:'🧘', title:'Meditar 15 minutos',       cur:0,  max:15, rew:'+90 XP',  done:false },
    { ico:'🌙', title:'Dormir antes das 23:00',   cur:0,  max:1,  rew:'+100 XP', done:false },
  ];

  const rewards = [
    { ico:'◆', txt:'CRISTAL' }, { ico:'⬡', txt:'OURO' }, { ico:'🗝', txt:'CHAVE' },
    { ico:'🔮', txt:'ESSÊNCIA' }, { ico:'🎁', txt:'?', locked:true },
  ];

  const slots = [
    { ico:'⚔', tier:'A', cls:'tl' }, { ico:'🛡', tier:'B', cls:'tr' },
    { ico:'💍', tier:'S', cls:'ml' }, { ico:'👑', tier:'A', cls:'mr' },
    { ico:'🧪', tier:'C', cls:'bl' }, { ico:'📿', tier:'B', cls:'br' },
  ];

  const dungeons = [
    { name:'Masmorra de Ferro', diff:'C', lv:'Lv. 18-24', tags:['HORDA','30 min'], rew:'◆ x2  +1.2k XP', p1:'#9a6bff', p2:'#7a3bff' },
    { name:'Caverna dos Goblins', diff:'D', lv:'Lv. 12-16', tags:['SWARM','20 min'], rew:'⬡ x500  +800 XP', p1:'#46e0ff', p2:'#2a6bff' },
    { name:'Portão de Cristal', diff:'B', lv:'Lv. 26-32', tags:['ELITE','45 min'], rew:'◆ x4  +2.4k XP', p1:'#b98bff', p2:'#6a00ff' },
    { name:'Torre das Almas', diff:'A', lv:'Lv. 40+', tags:['BOSS','60 min'], rew:'BLOQUEADO', locked:true, p1:'#ff5a7d', p2:'#7a0a86' },
  ];

  const detailRewards = [
    { ico:'◆', txt:'x2' }, { ico:'⚔', txt:'ARMA' }, { ico:'🔮', txt:'ESSÊNCIA' }, { ico:'⬡', txt:'800' },
  ];

  const sins = [
    { name:'Preguiça', ico:'🦥', lvl:'NÍVEL 3', desc:'Você venceu o sono hoje', pct:34, c:'#8b3bff' },
    { name:'Gula',     ico:'🍖', lvl:'NÍVEL 2', desc:'2 escapadas da dieta', pct:55, c:'#ff5a7d' },
    { name:'Luxúria',  ico:'🔥', lvl:'NÍVEL 1', desc:'Distrações sob controle', pct:18, c:'#ffcb57' },
    { name:'Ira',      ico:'⚡', lvl:'NÍVEL 4', desc:'Domine a frustração', pct:72, c:'#ff2d5e' },
    { name:'Inveja',   ico:'🌀', lvl:'NÍVEL 1', desc:'Foco no próprio caminho', pct:12, c:'#43ffb0' },
  ];

  const ranks = [
    { l:'E', name:'Iniciante', sub:'Despertos recentes', cnt:'8.2M', pct:100 },
    { l:'D', name:'Aprendiz',  sub:'Caçadores ativos', cnt:'2.1M', pct:62 },
    { l:'C', name:'Veterano',  sub:'Combatentes', cnt:'640K', pct:48 },
    { l:'B', name:'Elite',     sub:'Linha de frente', cnt:'120K', pct:36 },
    { l:'A', name:'Mestre',    sub:'Guildas de topo', cnt:'18K', pct:24 },
    { l:'S', name:'Lendário',  sub:'Monarcas em ascensão', cnt:'940', pct:14, mod:'s' },
    { l:'SS', name:'Soberano', sub:'O ápice do sistema', cnt:'7', pct:6, mod:'ss' },
  ];

  const settings = [
    { ico:'👤', name:'Personalização', sub:'Avatar, título, aura', arrow:true },
    { ico:'🔔', name:'Notificações', sub:'Quests e alertas', toggle:true, on:true },
    { ico:'🔊', name:'Som & Vibração', sub:'Efeitos do sistema', toggle:true, on:true },
    { ico:'🌐', name:'Idioma', sub:'Português (BR)', arrow:true },
    { ico:'🛡', name:'Privacidade & Dados', sub:'Conta e segurança', arrow:true },
    { ico:'⚙', name:'Ajuda & Suporte', sub:'Central do caçador', arrow:true },
  ];

  /* ---------- RENDER ---------- */
  const $ = (s, r=document) => r.querySelector(s);
  const el = (tag, cls, html) => { const n=document.createElement(tag); if(cls)n.className=cls; if(html!=null)n.innerHTML=html; return n; };

  // attributes
  const attrWrap = $('#attrs');
  attrs.forEach(a => {
    const n = el('div','attr');
    n.style.setProperty('--c', a.c);
    n.innerHTML = `
      <div class="attr__ico">${a.ico}</div>
      <div class="attr__body">
        <div class="attr__name">${a.name}</div>
        <div class="attr__row"><span class="attr__val">${a.val}</span></div>
        <div class="attr__mini"><i style="width:${a.pct}%"></i></div>
      </div>`;
    attrWrap.appendChild(n);
  });

  // quests
  const qList = $('#questList');
  let doneCount = 0;
  quests.forEach(q => {
    if (q.done) doneCount++;
    const pct = Math.min(100, Math.round((q.cur/q.max)*100));
    const n = el('div', 'quest'+(q.done?' is-done':''));
    n.innerHTML = `
      <div class="quest__ico">${q.done?'✓':q.ico}</div>
      <div class="quest__body">
        <div class="quest__title">${q.title}</div>
        <div class="quest__meta">
          <div class="quest__bar"><i style="width:${pct}%"></i></div>
          <span class="quest__num">${q.cur}/${q.max}</span>
        </div>
      </div>
      ${q.claim ? '<button class="quest__claim">RESGATAR</button>' : `<span class="quest__rew">${q.rew}</span>`}`;
    qList.appendChild(n);
  });
  $('#questCount').textContent = `${doneCount}/${quests.length} concluídas`;

  // rewards
  const renderRewards = (host, data) => {
    data.forEach(r => {
      const n = el('div','reward'+(r.locked?' is-locked':''));
      n.innerHTML = `<span class="reward__ico">${r.ico}</span><span class="reward__txt">${r.txt}</span>`;
      host.appendChild(n);
    });
  };
  renderRewards($('#rewardStrip'), rewards);
  renderRewards($('#detailRewards'), detailRewards);

  // slots
  document.querySelectorAll('.slot').forEach((s, i) => {
    const d = slots[i]; if(!d) return;
    s.textContent = d.ico;
    s.setAttribute('data-tier', d.tier);
  });

  // dungeons
  const dList = $('#dungeonList');
  dungeons.forEach(d => {
    const n = el('div','dungeon'+(d.locked?' is-locked':''));
    n.innerHTML = `
      <div class="dungeon__art"><div class="portal" style="--p1:${d.p1};--p2:${d.p2}"></div></div>
      <div class="dungeon__body">
        <div class="dungeon__name">${d.name}</div>
        <div class="dungeon__tags">
          <span class="tag tag--diff" style="color:${d.p1}">RANK ${d.diff}</span>
          ${d.tags.map(t=>`<span class="tag">${t}</span>`).join('')}
        </div>
        <div class="dungeon__reward">${d.lv}</div>
      </div>
      <div class="dungeon__cta">
        ${d.locked
          ? `<span class="lock-pill">🔒 Lv. 40</span>`
          : `<button class="btn btn--primary btn--sm" data-nav="detail">ENTRAR</button>
             <span class="dungeon__reward" style="font-size:9px">${d.rew}</span>`}
      </div>`;
    dList.appendChild(n);
  });

  // sins
  const sList = $('#sinList');
  sins.forEach(s => {
    const n = el('div','sin');
    n.style.setProperty('--c', s.c);
    n.innerHTML = `
      <div class="sin__ico">${s.ico}</div>
      <div class="sin__body">
        <div class="sin__head"><span class="sin__name">${s.name}</span><span class="sin__lvl">${s.lvl}</span></div>
        <div class="sin__desc">${s.desc}</div>
        <div class="sin__bar"><i style="width:${s.pct}%"></i></div>
      </div>`;
    sList.appendChild(n);
  });

  // rank ladder
  const rLad = $('#rankLadder');
  ranks.forEach(r => {
    const cur = r.l === 'E';
    const n = el('div','rrow'+(cur?' is-current':'')+(r.mod?` rrow--${r.mod}`:''));
    n.innerHTML = `
      <div class="rrow__letter">${r.l}</div>
      <div class="rrow__bar">
        <div class="rrow__name">${r.name}</div>
        <div class="rrow__sub">${r.sub}</div>
        <div class="bar bar--thin" style="margin-top:6px"><i class="bar__fill" style="--to:${r.pct}%"></i></div>
      </div>
      <div class="rrow__cnt">${r.cnt}</div>`;
    rLad.appendChild(n);
  });

  // settings
  const setList = $('#settingsList');
  settings.forEach(s => {
    const n = el('div','setrow');
    n.innerHTML = `
      <div class="setrow__ico">${s.ico}</div>
      <div class="setrow__txt"><div class="setrow__name">${s.name}</div><div class="setrow__sub">${s.sub}</div></div>
      ${s.toggle ? `<div class="toggle${s.on?' is-on':''}"></div>` : '<span class="setrow__arrow">›</span>'}`;
    if (s.toggle) n.querySelector('.toggle').addEventListener('click', e => e.currentTarget.classList.toggle('is-on'));
    setList.appendChild(n);
  });

  /* ---------- NAVIGATION ---------- */
  const screens = document.querySelectorAll('.scr');
  const navbtns = document.querySelectorAll('.navbar .navbtn');

  function goto(name) {
    let found = false;
    screens.forEach(s => {
      const on = s.dataset.screen === name;
      s.classList.toggle('is-active', on);
      if (on) { found = true; s.scrollTop = 0; replayAnims(s); }
    });
    navbtns.forEach(b => b.classList.toggle('is-active', b.dataset.nav === name));
    return found;
  }

  function replayAnims(scope){
    scope.querySelectorAll('.bar__fill, .attr__mini i, .quest__bar i, .sin__bar i').forEach(node => {
      node.style.animation = 'none'; void node.offsetWidth; node.style.animation = '';
    });
  }

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-nav]');
    if (!t) return;
    goto(t.dataset.nav);
  });

  /* ---------- COUNT-UP ---------- */
  document.querySelectorAll('[data-count]').forEach(node => {
    const target = +node.dataset.count;
    let cur = 0;
    const step = Math.max(1, Math.round(target/60));
    const iv = setInterval(() => {
      cur += step;
      if (cur >= target) { cur = target; clearInterval(iv); }
      node.textContent = cur.toLocaleString('pt-BR');
    }, 18);
  });

  /* ---------- VIEW TOGGLE + GALLERY ---------- */
  const stage = $('#stage');
  function buildGallery() {
    const gal = el('div','gallery');
    const labels = {
      status:'STATUS', quests:'QUESTS DIÁRIAS', hunter:'CAÇADOR',
      dungeons:'MASMORRAS', detail:'MASMORRA · DETALHE', boss:'BOSS FIGHT',
      sins:'PECADOS', rank:'RANK GLOBAL', profile:'PERFIL'
    };
    Object.keys(labels).forEach(key => {
      const src = document.querySelector(`.scr[data-screen="${key}"]`);
      if (!src) return;
      const card = el('div','gcard');
      card.innerHTML = `<div class="gcard__label">${labels[key]}</div>
        <div class="gframe"><div class="gframe__inner"></div></div>`;
      const clone = src.cloneNode(true);
      clone.classList.add('is-active');
      clone.style.cssText = 'position:relative;opacity:1;visibility:visible;transform:none;';
      card.querySelector('.gframe__inner').appendChild(clone);
      gal.appendChild(card);
    });
    stage.appendChild(gal);
  }
  buildGallery();

  document.querySelectorAll('.vt-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.vt-btn').forEach(x => x.classList.remove('is-active'));
      b.classList.add('is-active');
      stage.classList.toggle('is-gallery', b.dataset.view === 'gallery');
    });
  });

  /* ---------- PARTICLES ---------- */
  const canvas = $('#particles');
  const ctx = canvas.getContext('2d');
  let W, H, parts = [];
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const count = Math.min(90, Math.floor(W*H/16000));
    parts = Array.from({length:count}, () => spawn());
  }
  function spawn() {
    return {
      x: Math.random()*W, y: Math.random()*H,
      r: Math.random()*2 + .4,
      vx: (Math.random()-.5)*.25, vy: -Math.random()*.55 - .12,
      a: Math.random()*.6 + .15,
      hue: Math.random() > .35 ? 265 : 215
    };
  }
  function tick() {
    ctx.clearRect(0,0,W,H);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -10 || p.x < -10 || p.x > W+10) Object.assign(p, spawn(), { y: H+10 });
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `hsla(${p.hue},100%,70%,${p.a})`;
      ctx.shadowBlur = 8; ctx.shadowColor = `hsla(${p.hue},100%,60%,.9)`;
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  window.addEventListener('resize', resize);
  resize(); tick();

  // boot
  goto('status');
})();
