// ═════════════════════════════════════════════════════════════════
// [CANDIDATO A MOVER PARA index.html NA CONSOLIDAÇÃO]
// Listeners globais de UX:
// - Bloqueia menu de contexto (mobile long-press)
// - Bloqueia seleção de texto
// - Cancela long-press se o dedo/mouse soltar fora do elemento
// Observação: onLPClear() é definida em sessão posterior (forward-ref).
// ═════════════════════════════════════════════════════════════════
document.addEventListener('contextmenu', e => e.preventDefault(), {passive:false});
document.addEventListener('selectstart', e => e.preventDefault(), {passive:false});
// Cancela long-press se soltar fora do elemento
document.addEventListener('mouseup',    () => onLPClear(), {passive:true});
document.addEventListener('touchend',   () => onLPClear(), {passive:true});
document.addEventListener('touchcancel',() => onLPClear(), {passive:true});

// ===================== DATA =====================
const SUITS = {
  hearts:   {sym:'♥', color:'var(--hearts)',  beats:'clubs'},
  clubs:    {sym:'♣', color:'var(--clubs)',   beats:'diamonds'},
  diamonds: {sym:'♦', color:'var(--diamonds)',beats:'spades'},
  spades:   {sym:'♠', color:'var(--spades)',  beats:'hearts'},
  neutral:  {sym:'◆', color:'var(--neutral)', beats:null},
};

const SUIT_ADV = {
  hearts:   {adv:'⚔ Atributo dobrado vs ♣ Paus', dis:'⚠ Vulnerável a ♠ Espadas'},
  clubs:    {adv:'⚔ Contra-ataca ♦ Ouro (ganha Furtivo 2t). Com Furtivo: contra-ataca qualquer ataque', dis:'⚠ Copas dobra atributos vs você'},
  diamonds: {adv:'⚔ +Rodada Extra vs ♠ Espadas (ataque e defesa)', dis:'⚠ Paus contra-ataca você'},
  spades:   {adv:'⚔ Dano duplo vs ♥ Copas',      dis:'⚠ Ouro ganha rodada extra (ao atacar e ao ser atacado)'},
  neutral:  {adv:'◆ Sem vantagem de naipe',       dis:'◆ Sem desvantagem'},
};

// ===================== SPRITE SYSTEM =====================
const SPRITE_MAP = {
  sam: 'sam', nyxa: 'nyxa', lori: 'lori', grim: 'grim', kuro: 'kuro', vanc: 'vanc',
  gora: 'gora', kane: 'kane', zeph: 'zeph', kael: 'kael', tyre: 'tyre',
  pt_aer: 'pt_aer', pt_cae: 'pt_cae', pt_elo: 'pt_elo', pt_zar: 'pt_zar', pt_var: 'pt_var',
  // Monstros — Tier 1 (Floresta Sombria)
  cria_t1_a: 'monstros/cria_t1_a', cria_t1_b: 'monstros/cria_t1_b', cria_t1_c: 'monstros/cria_t1_c',
  vespa_a: 'monstros/vespa_a', vespa_b: 'monstros/vespa_b', vespa_c: 'monstros/vespa_c',
  elfo_a: 'monstros/elfo_a', elfo_b: 'monstros/elfo_b', elfo_c: 'monstros/elfo_c',
  // Mini Boss — Tier 1
  xama_t1: 'monstros/xama_t1',
  // Boss — Tier 1
  boss_t1: 'monstros/boss_t1',
  // Monstros — Tier 2 (Cavernas de Gelo)
  urso_t2_a: 'monstros/urso_t2_a', urso_t2_b: 'monstros/urso_t2_b', urso_t2_c: 'monstros/urso_t2_c',
  nefilin_t2_a: 'monstros/nefilin_t2_a', nefilin_t2_b: 'monstros/nefilin_t2_b', nefilin_t2_c: 'monstros/nefilin_t2_c',
  troll_t2_a: 'monstros/troll_t2_a', troll_t2_b: 'monstros/troll_t2_b', troll_t2_c: 'monstros/troll_t2_c',
  // Mini Boss — Tier 2
  parede_t2: 'monstros/parede_t2',
};

const SPRITE_POSES = {
  sam: { idle: 'idle', atk1: 'atk1', atk2: 'atk2', recarga: 'recarga', hit: 'hit', passiva: 'passiva' },
  nyxa: { idle: 'idle', atk1: 'atk1', atk2: 'atk2', hit: 'hit', recarga: 'recarga' },
  lori: { idle: 'idle', atk1: 'atk1', atk2: 'atk2', hit: 'hit', recarga: 'recarga' },
  grim: { idle: 'idle', atk1: 'atk1', atk2: 'atk2', hit: 'hit', recarga: 'recarga' },
  kuro: { idle: 'idle', atk1: 'atk1', atk2: 'atk2', hit: 'hit', recarga: 'recarga' },
  vanc: { idle: 'idle', atk1: 'atk1', atk2: 'atk2', hit: 'hit', recarga: 'recarga' },
  gora: { idle: 'idle', atk1: 'atk1', atk2: 'atk2', hit: 'hit', recarga: 'recarga' },
  kane: { idle: 'idle', atk1: 'atk1', atk2: 'atk2', hit: 'hit', recarga: 'recarga' },
  zeph: { idle: 'idle', atk1: 'atk1', atk2: 'atk2', hit: 'hit', recarga: 'recarga' },
  kael: { idle: 'idle', atk1: 'atk1', atk2: 'atk2', hit: 'hit', recarga: 'recarga' },
  tyre: { idle: 'idle', atk1: 'atk1', atk2: 'atk2', hit: 'hit', recarga: 'recarga' },
  pt_aer: { idle: 'idle', atk1: 'atk1', atk2: 'atk2', hit: 'hit', recarga: 'recarga' },
  pt_cae: { idle: 'idle', atk1: 'atk1', atk2: 'atk2', hit: 'hit', recarga: 'recarga' },
  pt_zar: { idle: 'idle', atk1: 'atk1', atk2: 'atk2', hit: 'hit', recarga: 'recarga' },
  pt_var: { idle: 'idle', atk1: 'atk1', atk2: 'atk2', hit: 'hit', recarga: 'recarga' },
  pt_elo: { idle: 'idle', atk1: 'atk1', atk2: 'atk2', hit: 'hit', recarga: 'recarga' },
  // Monstros — Tier 1
  cria_t1_a: { idle: 'idle' }, cria_t1_b: { idle: 'idle' }, cria_t1_c: { idle: 'idle' },
  vespa_a:   { idle: 'idle' }, vespa_b:   { idle: 'idle' }, vespa_c:   { idle: 'idle' },
  elfo_a:    { idle: 'idle' }, elfo_b:    { idle: 'idle' }, elfo_c:    { idle: 'idle' },
  xama_t1:   { idle: 'idle' },
  boss_t1:   { idle: 'idle' },
  parede_t2: { idle: 'idle' },
  // Monstros — Tier 2
  urso_t2_a:    { idle: 'idle' }, urso_t2_b:    { idle: 'idle' }, urso_t2_c:    { idle: 'idle' },
  nefilin_t2_a: { idle: 'idle' }, nefilin_t2_b: { idle: 'idle' }, nefilin_t2_c: { idle: 'idle' },
  troll_t2_a:   { idle: 'idle' }, troll_t2_b:   { idle: 'idle' }, troll_t2_c:   { idle: 'idle' },
};

function getCharSprite(id, pose) {
  if (!(id in SPRITE_MAP)) return null;
  const poses = SPRITE_POSES[id];
  const actualPose = (poses && poses[pose]) ? pose : 'idle';
  const path = SPRITE_MAP[id];
  return path.startsWith('monstros/') ? 'sprites/' + path + '.png' : 'sprites/' + path + '/' + actualPose + '.png';
}

function hasCharSprite(id) { return id in SPRITE_MAP; }

function charAvatarHtml(id, s, sz, ch, owner) {
  if (!(id in SPRITE_MAP)) return '<span style="color:' + s.color + '">' + s.sym + '</span>';
  var pose = 'idle';
  if (ch && id === 'sam' && (ch._charge || 0) >= 5 && SPRITE_POSES.sam && SPRITE_POSES.sam.passiva) {
    pose = 'passiva';
  }
  var src = getCharSprite(id, pose);
  var flip = (owner === 'p2') ? ' style="transform:scaleX(-1)"' : '';
  return '<img class="sprite-img sprite-' + (sz||'slot') + '" src="' + src + '" alt="" draggable="false" data-char-id="' + id + '" data-pose="' + pose + '"' + flip + '>';
}

// ── SPRITE ANIMATION ENGINE ──

function _swapSpritePose(ch, pose) {
  if (!hasCharSprite(ch.id)) return;
  const poses = SPRITE_POSES[ch.id];
  if (!poses || !poses[pose]) return;
  const src = getCharSprite(ch.id, pose);
  document.querySelectorAll('.slot .sprite-img[data-char-id="' + ch.id + '"]').forEach(img => {
    img.src = src;
    img.dataset.pose = pose;
  });
}

function preloadSprites(id) {
  if (!hasCharSprite(id)) return;
  const poses = SPRITE_POSES[id];
  if (!poses) return;
  Object.keys(poses).forEach(pose => {
    const img = new Image();
    img.src = getCharSprite(id, pose);
  });
}

function _getIdlePose(ch) {
  if (ch.id === 'sam' && (ch._charge || 0) >= 5 && SPRITE_POSES.sam && SPRITE_POSES.sam.passiva) {
    return 'passiva';
  }
  return 'idle';
}

// Animação de ataque: idle -> atk1 (500ms) -> atk2 (600ms) -> recarga (500ms) -> idle (400ms) = ~2s total
function animSpriteAttack(ch) {
  return new Promise(resolve => {
    if (!hasCharSprite(ch.id) || !SPRITE_POSES[ch.id] || !SPRITE_POSES[ch.id].atk1) {
      resolve(); return;
    }
    _swapSpritePose(ch, 'atk1');
    setTimeout(() => {
      if (SPRITE_POSES[ch.id].atk2) { _swapSpritePose(ch, 'atk2'); }
      setTimeout(() => {
        if (SPRITE_POSES[ch.id].recarga) { _swapSpritePose(ch, 'recarga'); }
        setTimeout(() => {
          _swapSpritePose(ch, _getIdlePose(ch));
          setTimeout(() => resolve(), 400);
        }, 500);
      }, 600);
    }, 500);
  });
}

// Animação de hit: idle -> hit (600ms) -> idle (200ms) = ~0.8s total
function animSpriteHit(ch) {
  return new Promise(resolve => {
    if (!hasCharSprite(ch.id) || !SPRITE_POSES[ch.id] || !SPRITE_POSES[ch.id].hit) {
      resolve(); return;
    }
    _swapSpritePose(ch, 'hit');
    setTimeout(() => {
      _swapSpritePose(ch, _getIdlePose(ch));
      setTimeout(() => resolve(), 200);
    }, 600);
  });
}

// Atualiza pose idle/passiva quando estado muda
function updateIdlePose(ch) {
  if (!hasCharSprite(ch.id)) return;
  const currentPose = _getIdlePose(ch);
  document.querySelectorAll('.slot .sprite-img[data-char-id="' + ch.id + '"]').forEach(img => {
    const p = img.dataset.pose;
    if (p === 'idle' || p === 'passiva') {
      if (p !== currentPose) { _swapSpritePose(ch, currentPose); }
    }
  });
}

// ===================== SKILL NORMALIZER =====================
// Converte o formato antigo (recharge:true/false) usado no array CHARS
// (de chars-data/chars.js) para o formato novo (turno/recarga/acao).
// AI_CHARS já vem no formato novo — não precisa passar por aqui.
const RAPIDA = ['Sou Seu Amigo','SKAAAAARRRRR!!!','Roupas Encantadas','Instinto Reflexivo','Espírito do Guepardo'];
const TURNO_L = ['Prestidigitação','Bomba Ácida','Elixir da Cura','Feixe de Plasma','Feixe Congelante',
  'Bomba Radiação','Agora é Sério','Roupas Encantadas','Máscara de Faces','Azar ou Sorte',
  'Investida Unicórnio','Espírito do Grifo','Disparo Élfico','Corte Estático','Espírito do Guepardo',
  'Soco Brutal','Espírito do Gorila','Corte Gélido','Espírito do Urso Polar','Instinto Reflexivo',
  'Tiro Decisivo','Espírito da Salamandra','Espírito do Tigre','Punho Incendiário','Descarga Elétrica',
  'Bomba Ácida','Lança Granada','Corte Flamejante'];

CHARS.forEach(ch => {
  ch.skills.forEach(sk => {
    sk.turno = TURNO_L.includes(sk.name) ? 'L' : 'N';
    sk.recarga = sk.recharge ? 'L' : 'N';
    sk.acao = RAPIDA.includes(sk.name) ? 'Rápida' : 'N';
  });
});

// ===================== DECK =====================
function buildDeck() {
  const suits = ['hearts','spades','clubs','diamonds'];
  const vals = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  const nv = {'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'J':11,'Q':12,'K':13,'A':14};
  let d = [];
  for (let s of suits) for (let v of vals) d.push({suit:s,val:v,nv:nv[v]});
  d.push({suit:'joker',val:'★',nv:15});
  d.push({suit:'joker',val:'★',nv:15});
  return shuffle(d);
}
function shuffle(a) {
  a = [...a];
  for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}

// ═════════════════════════════════════════════════════════════════
// [CANDIDATO A MOVER PARA index.html NA CONSOLIDAÇÃO]
// ===================== VERSION CONTROL =====================
// IIFE: limpa preferências locais (música/vfx) quando a versão muda
// e atualiza os labels de versão na UI. Não toca em Firebase.
// ═════════════════════════════════════════════════════════════════
const GAME_VERSION = '2.87';
(function() {
  const savedVersion = localStorage.getItem('patf_version');
  if (savedVersion !== GAME_VERSION) {
    // Limpa só preferências do usuário (música, vfx) — não afeta Firebase
    localStorage.removeItem('patf_vol');
    localStorage.removeItem('patf_muted');
    localStorage.removeItem('patf_vfx');
    localStorage.removeItem('patf_pvpanim');
    sessionStorage.clear();
    localStorage.setItem('patf_version', GAME_VERSION);
    if (savedVersion !== null) {
      window.location.reload(true);
    }
  }
  // Atualiza labels de versão na tela
  var lbl = document.getElementById('version-label');
  if (lbl) lbl.textContent = 'v' + GAME_VERSION;
  var lblLoading = document.getElementById('version-label-loading');
  if (lblLoading) lblLoading.textContent = 'v' + GAME_VERSION;
})();

// ===================== STATE =====================
let G = {};
let selP1=[], selP2=[];

function makeChar(data, owner) {
  const ch = {
    ...data, owner,
    baseId: data.id, // ID original — usado para sprites, passivas e lógica de personagem
    skills: data.skills.map(s => ({...s})),
    hp: data.pvs, maxHp: data.pvs,
    curAtq: data.atq, curDef: data.def,
    alive: true, statuses: [],
    cooldowns: {},
    passiveBonuses: {},
    firstTurn: true,       // blocks Turno:L skills on first turn
    quickAction: false,    // set true after Ação Rápida used
    extraTurnUsed: false,  // strictly 1 extra turn per natural turn, any source
    _jointAttackUsed: false // strictly 1 joint attack per round, any source
  };
  // Nefilin: sorteia naipe 50% hearts / 50% spades ao entrar em campo (fixo na batalha)
  if (ch.passive === 'nefilin_suit') {
    ch.suit = Math.random() < 0.5 ? 'hearts' : 'spades';
    ch._nefilinComboStep = 'attack'; // começa atacando
  }
  // Kane: inicializa arma e sincroniza slot 2
  if(ch.id === 'kane' || ch.id === 'kane_ai') {
    ch._weapon = 'pistola';
    marcoUpdateWeaponSlot(ch);
  }
  // Kuro Isamu: inicializa Concentração Marcial e Dedicação Total
  if(ch.id === 'kuro' || ch.id === 'kuro_ai') {
    ch._satsui = 0;
    ch._ryuSuit = 'neutral';
    ch._ryuSuitTimer = 0;
  }
  // Comandante Vance: inicializa contador do Chamado da Tropa
  if(ch.id === 'vanc' || ch.id === 'vanc_ai') {
    ch._chamadoTurno = 0;
  }
  // ── Aplica bônus de equipamento (só p1, se equipLoaded) ──
  if (owner === 'p1' && _equipLoaded) {
    var ed = _equipData[ch.baseId];
    if (ed && ed.slot1 && ed.slot1.itemId) {
      var eqItem = ed.slot1._item || _playerItems.find(function(i) { return i.id === ed.slot1.itemId; });
      if (eqItem) {
        var eqLvl = _equipGetLevel(ed.slot1.xp || 0);
        var eqVal = eqItem.prefixVal + (eqLvl - 1);
        if (eqItem.prefix === 'ATQ') { ch.atq += eqVal; ch.curAtq += eqVal; }
        else if (eqItem.prefix === 'DEF') { ch.def += eqVal; ch.curDef += eqVal; }
        else if (eqItem.prefix === 'INC') { ch.inc += eqVal; }
        else if (eqItem.prefix === 'PVS') { ch.pvs += eqVal; ch.hp += eqVal; ch.maxHp += eqVal; }
      }
    }
  }
  return ch;
}

function initGame(p1c, p2c) {
  _logEvent('initGame — P1: ' + p1c.map(function(c){return c.name;}).join(', ') + ' | P2: ' + p2c.map(function(c){return c.name;}).join(', '), 'BATTLE');
  G = {
    turn:1, phase:'initiative',
    p1:{ chars: p1c.map(c=>makeChar(c,'p1')), deck:buildDeck(), hand:[], discard:[] },
    p2:{ chars: p2c.map(c=>makeChar(c,'p2')), deck:buildDeck(), hand:[], discard:[] },
    order:[], orderIdx:0,
    pendingSkill:null, pendingCardIdx:null, pendingAtkCard:null, pendingAttack:null, pendingDefCardIdx:null,
    _clubsFollowUp:null, _pendingClubsAtk:null, _pendingClubsFu:null, _pendingClubsCardIdx:null,
    _pendingVermelha:null, _pendingVermCard:null, _clubsAfterQuick:null,
    _areaDefQueue:[], _areaDefContext:null, _reactDelay:0,
    pendingExtraCards:[], pendingExtraCardsForTarget:[], pendingAllEnemyTargets:[],
    targeting:false, over:false
  };
  for(let i=0;i<10;i++){draw('p1');draw('p2');}
}

function draw(pl, n, animLabel) {
  if(n === undefined) n = 1;
  for(var _di=0;_di<n;_di++){
    const p=G[pl];
    if(!p.deck.length){checkWin();return;}
    if(p.hand.length>=10) return;
    p.hand.push(p.deck.shift());
    if(animLabel !== undefined) floatCardDrawCenter(pl, animLabel);
  }
}

function discard(pl, idx) {
  const p=G[pl], [c]=p.hand.splice(idx,1);
  p.discard.push(c); return c;
}

// ===================== INITIATIVE =====================
function rollInit() {
  const all=[];
  for(let o of ['p1','p2']) {
    const p=G[o];
    for(let ch of p.chars) {
      if(!ch.alive) continue;
      let ic;
      if(p.hand.length>0){
        let mi=0;
        p.hand.forEach((c,i)=>{if(c.nv<p.hand[mi].nv)mi=i;});
        ic=p.hand.splice(mi,1)[0]; p.discard.push(ic);
      } else {
        ic=p.deck.length?p.deck.shift():{suit:'neutral',val:'?',nv:0};
      }
      all.push({ch,o,ic,tot:ic.nv+ch.inc});
    }
  }
  all.sort((a,b)=>{
    if(b.tot!==a.tot) return b.tot-a.tot;
    if(b.ic.nv!==a.ic.nv) return b.ic.nv-a.ic.nv;
    const am=a.ic.suit===a.ch.suit?1:0, bm=b.ic.suit===b.ch.suit?1:0;
    if(bm!==am) return bm-am;
    return Math.random()-.5;
  });
  G.order=all; G.orderIdx=0;
}

// ===================== BATTLE INTRO SPLASH =====================
async function runBattleIntro() {
  const intro   = document.getElementById('battle-intro');
  const bg      = document.getElementById('bi-bg');
  const line    = document.getElementById('bi-line');
  const vsEl    = document.getElementById('bi-vs');
  const titleEl = document.getElementById('bi-title');
  const flash   = document.getElementById('bi-flash');
  const tp1     = document.getElementById('bi-team-p1');
  const tp2     = document.getElementById('bi-team-p2');

  // Build team HTML
  function teamHtml(chars) {
    return chars.map(ch => {
      const s = SUITS[ch.suit]||SUITS.neutral;
      return `<div class="bi-char">
        <div class="bi-char-inner">
          <span class="bi-char-suit" style="color:${s.color}">${s.sym}</span>
          <span class="bi-char-name">${ch.name.toUpperCase()}</span>
        </div>
      </div>`;
    }).join('');
  }
  tp1.innerHTML = teamHtml(G.p1.chars);
  tp2.innerHTML = teamHtml(G.p2.chars);

  // Reset
  vsEl.className = '';
  titleEl.className = '';
  bg.className = '';
  line.className = 'bi-line';
  flash.style.opacity = '0';
  // Reset arena profiles
  if (biProfiles) {
    biProfiles.style.display = 'none';
    var _bp1 = document.getElementById('bi-p1-profile');
    var _bp2 = document.getElementById('bi-p2-profile');
    if (_bp1) { _bp1.style.opacity = '0'; _bp1.style.transform = 'translateX(-30px)'; }
    if (_bp2) { _bp2.style.opacity = '0'; _bp2.style.transform = 'translateX(30px)'; }
  }
  _introRunning = false;
  if (_pendingInitiativeResult) {
    var _pir = _pendingInitiativeResult;
    _pendingInitiativeResult = null;
    _applyInitiativeResult(_pir);
  }
}
// ===================== CINEMATIC INITIATIVE =====================

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// Called AFTER confirmInitiative() has already computed G.order with real values
var _cinematicRunning = false;
var _pendingNextTurn = null;
var _introRunning = false;
var _pendingInitiativeResult = null;

async function runCinematicInitiative() {
  _cinematicRunning = true;
  const overlay = document.getElementById('cinematic-overlay');
  const titleEl = document.getElementById('cine-title');
  const listEl  = document.getElementById('cine-list');
  const divider = document.getElementById('cine-divider');

  // Reset
  overlay.classList.add('active');
  titleEl.className = '';
  titleEl.style.animation = '';
  titleEl.textContent = 'VERIFICANDO COMBATENTES...';
  listEl.innerHTML = '';
  divider.className = 'cine-divider';

  await delay(80);
  titleEl.classList.add('show');
  await delay(600);

  // All chars in original order (p1 then p2)
  const all = [
    ...G.p1.chars.map(ch=>({ch, o:'p1'})),
    ...G.p2.chars.map(ch=>({ch, o:'p2'})),
  ];

  // Step 1: show each combatant with checkmark
  const rows = [];
  for(const {ch, o} of all) {
    const s = SUITS[ch.suit]||SUITS.neutral;
    const row = document.createElement('div');
    row.className = `cine-row ${o}-row`;
    row.innerHTML = `
      <span class="cine-row-suit" style="color:${s.color}">${s.sym}</span>
      <span class="cine-row-name">${ch.name.toUpperCase()}</span>
      <span class="cine-row-right" id="cine-r-${ch.id}_${o}">—</span>`;
    listEl.appendChild(row);
    rows.push({row, ch, o});
    await delay(50);
    row.classList.add('show');
    await delay(200);
    const rr = document.getElementById('cine-r-'+ch.id+'_'+o);
    if(rr) { rr.textContent = '✔'; rr.classList.add('confirm'); }
    await delay(60);
  }

  await delay(300);

  // Step 2: PASSIVAS DE ENTRADA
  titleEl.classList.remove('show');
  await delay(250);
  titleEl.textContent = 'PASSIVAS DE ENTRADA';
  titleEl.classList.add('show');
  await delay(600);

  // Step 3: ROLANDO INICIATIVA — reveal real values from G.order
  titleEl.classList.remove('show');
  await delay(250);
  titleEl.textContent = 'ROLANDO INICIATIVA...';
  titleEl.classList.add('show');
  await delay(400);

  for(const {ch, o} of all) {
    const entry = G.order.find(e => e.ch === ch);
    if(!entry) continue;
    const rr = document.getElementById('cine-r-'+ch.id+'_'+o);
    if(!rr) continue;
    rr.classList.remove('confirm');
    rr.classList.add('roll');
    // Number rattle
    for(let i=0;i<5;i++) {
      rr.textContent = Math.floor(Math.random()*20)+1;
      await delay(55);
    }
    // Reveal real value
    rr.textContent = entry.tot;
    await delay(90);
  }

  await delay(450);

  // Step 4: Re-sort rows visually by real initiative order
  const sorted = [...G.order];
  sorted.forEach((entry, rank) => {
    const rowEl = rows.find(r => r.ch === entry.ch);
    if(!rowEl) return;
    listEl.appendChild(rowEl.row);
    if(rank === 0) {
      const rr = document.getElementById('cine-r-'+entry.ch.id+'_'+entry.o);
      if(rr) { rr.classList.remove('roll'); rr.classList.add('first'); }
      rowEl.row.style.borderColor = 'var(--gold)';
      rowEl.row.style.background = 'rgba(201,168,76,0.07)';
    }
    const badge = document.createElement('span');
    badge.className = 'cine-order-badge';
    badge.textContent = '#'+(rank+1);
    rowEl.row.appendChild(badge);
    setTimeout(()=>badge.classList.add('show'), 100*rank);
  });

  await delay(250);
  divider.classList.add('show');

  titleEl.classList.remove('show');
  await delay(280);
  titleEl.textContent = 'ORDEM DE TURNO DEFINIDA';
  titleEl.style.animation = 'cine-pulse-gold 2s infinite';
  titleEl.classList.add('show');

  await delay(1400);

  // Fade out
  overlay.style.transition = 'opacity 0.5s ease';
  overlay.style.opacity = '0';
  await delay(500);
  overlay.classList.remove('active');
  overlay.style.opacity = '';
  overlay.style.transition = '';
  titleEl.style.animation = '';

  _cinematicRunning = false;

  // Local/IA: inicia direto
  beginRound();
}
// ---- INITIATIVE ----
function showInitiativeChoiceScreen() {
  render();
  runBattleIntro().then(() => {
    G._initPicks = {};
    renderInitiativePanel();
  });
}


function renderInitiativePanel() {
  const p1 = G.p1;
  const chars = p1.chars;
  const hand = p1.hand;
  const picks = G._initPicks;

  // Which hand indices already picked
  const usedIdxs = new Set(Object.values(picks));

  const charRows = chars.filter(ch => ch.alive).map(ch => {
    const s = SUITS[ch.suit]||SUITS.neutral;
    const pickedIdx = picks[ch.id];
    const pickedCard = pickedIdx!==undefined ? hand[pickedIdx] : null;
    const cardDisplay = pickedCard
      ? `<span style="color:${(SUITS[pickedCard.suit]||SUITS.neutral).color};font-weight:700">${pickedCard.val}${(SUITS[pickedCard.suit]||SUITS.neutral).sym} (+${ch.inc}) = <b>${pickedCard.nv+ch.inc}</b></span>`
      : `<span style="color:var(--text2);font-size:11px">— escolha uma carta —</span>`;
    return `<div style="display:flex;align-items:center;gap:8px;padding:8px;background:var(--bg3);border-radius:8px;border:1px solid ${pickedCard?'var(--gold)':'var(--border)'}">
      <span style="font-size:18px">${s.sym}</span>
      <div style="flex:1">
        <div style="font-size:12px;font-weight:700;color:${s.color}">${ch.name}</div>
        <div style="font-size:10px;color:var(--text2)">INC: +${ch.inc}</div>
      </div>
      ${cardDisplay}
      ${pickedCard?`<button style="font-size:10px;padding:2px 6px;background:rgba(180,60,60,0.3);border:1px solid rgba(180,60,60,0.5);border-radius:4px;color:var(--text);cursor:pointer" onclick="clearInitPick('${ch.id}')">✕</button>`:''}
    </div>`;
  }).join('');

  const cardGrid = hand.map((card, i) => {
    const s = SUITS[card.suit]||SUITS.neutral;
    const used = usedIdxs.has(i);
    const isSpec = isSpecial(card);
    return `<div class="card s-${card.suit}" style="${used?'opacity:0.3;pointer-events:none':''};cursor:${used?'not-allowed':'pointer'}"
      onclick="${used?'':'pickInitCard('+i+')'}" >
      <div class="card-corner">${card.val}<br>${s.sym}</div>
      <div class="card-s">${s.sym}</div>
      <div class="card-v">${card.val}</div>
      ${isSpec?'<div style="font-size:8px;color:var(--gold);text-align:center">ESPEC</div>':''}
    </div>`;
  }).join('');

  const allPicked = chars.filter(ch => ch.alive).every(ch => picks[ch.id]!==undefined);

  document.getElementById('panel-title').textContent = '⚔ Escolha de Iniciativa';
  document.getElementById('panel-body').innerHTML = `
    <div style="font-size:11px;color:var(--text2);margin-bottom:8px">Atribua uma carta de iniciativa para cada personagem. Carta + INC determina a ordem de ação.</div>
    <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px" id="init-chars">${charRows}</div>
    <div style="font-size:11px;color:var(--text2);margin-bottom:4px">Selecione uma carta e depois toque no personagem para atribuir — ou clique na carta abaixo:</div>
    <div id="init-selected-char" style="font-size:11px;color:var(--gold);min-height:16px;margin-bottom:4px"></div>
    <div class="card-grid-panel" id="init-card-grid">${cardGrid}</div>
    <button class="btn-gold" style="width:100%;margin-top:10px;opacity:${allPicked?1:0.4};pointer-events:${allPicked?'auto':'none'}" onclick="confirmInitiative()">Confirmar Iniciativa →</button>`;
  openPanel();

  // State for two-step pick: select card → select char
  G._initPendingCardIdx = null;
}

function pickInitCard(cardIdx) {
  G._initPendingCardIdx = cardIdx;
  const card = G.p1.hand[cardIdx];
  const s = SUITS[card.suit]||SUITS.neutral;
  // Highlight selected card
  document.querySelectorAll('#init-card-grid .card').forEach((el,i)=>{
    el.classList.toggle('sel', i===cardIdx);
  });
  // Show prompt
  const el = document.getElementById('init-selected-char');
  if(el) el.textContent = `Carta ${card.val}${s.sym} selecionada — agora toque em um personagem acima para atribuir`;
  // Auto-assign to first unassigned char
  const picks = G._initPicks;
  const unassigned = G.p1.chars.find(ch => picks[ch.id]===undefined);
  if(unassigned) { assignInitCard(unassigned.id, cardIdx); }
}

function assignInitCard(charId, cardIdx) {
  // Remove any previous assignment of this card
  const picks = G._initPicks;
  for(const id in picks) { if(picks[id]===cardIdx) delete picks[id]; }
  picks[charId] = cardIdx;
  G._initPendingCardIdx = null;
  renderInitiativePanel();
}

function clearInitPick(charId) {
  delete G._initPicks[charId];
  renderInitiativePanel();
}

function confirmInitiative() {
  var el = document.getElementById('pvp-timer-display'); if(el) el.remove();
  const rb = document.getElementById('init-reopen-btn');
  if(rb) rb.style.display = 'none';
  const p1 = G.p1;
  const picks = G._initPicks;

  // Monta choices do jogador local (sempre p1 na visão local)
  const choices = p1.chars.map(ch => {
    const cardIdx = picks[ch.id];
    const ic = cardIdx!==undefined ? p1.hand[cardIdx] : {suit:'neutral',val:'?',nv:0};
    return { charId: ch.id, cardNv: ic.nv, cardSuit: ic.suit, inc: ch.inc };
  });

  // Log das escolhas de iniciativa
  choices.forEach(function(c) {
    var chObj = p1.chars.find(function(x){ return x.id === c.charId; });
    _logEvent('Iniciativa: ' + (chObj ? chObj.name : c.charId) + ' — carta ' + c.cardNv + ' (' + c.cardSuit + ') + INC ' + c.inc + ' = ' + (c.cardNv + c.inc), 'INIT');
  });

  // Remove picked cards from hand
  const pickedIdxsSorted = [...new Set(Object.values(picks))].sort((a,b)=>b-a);
  pickedIdxsSorted.forEach(i => { const [c]=p1.hand.splice(i,1); p1.discard.push(c); });

  G._initPicks = {};


  // ── Local/IA: calcula direto ──
  const all = [];
  p1.chars.forEach(ch => {
    const choice = choices.find(c => c.charId === ch.id);
    const ic = { nv: choice.cardNv, suit: choice.cardSuit };
    all.push({ch, o:'p1', ic, tot: choice.cardNv + ch.inc});
  });

  // AI chars — auto pick lowest card per char (boss picks highest, crias skip)
  const p2 = G.p2;
  p2.chars.forEach(ch => {
    // Crias não rolam iniciativa — usam INC herdado
    if (ch.isBossSpawn) {
      all.push({ch, o:'p2', ic: {nv:0, suit:'neutral'}, tot: ch.inc});
      return;
    }
    let ic;
    if(p2.hand.length>0) {
      // Yeti Glacial: carta alta se tem ♣ no time inimigo, senão qualquer
      if (ch.id === 'boss_t2') {
        var hasClubs = G.p1.chars.some(function(c) { return c.suit === 'clubs' && c.alive; });
        if (hasClubs) {
          let mi=0; p2.hand.forEach((c,i)=>{if(c.nv>p2.hand[mi].nv)mi=i;});
          ic=p2.hand.splice(mi,1)[0]; p2.discard.push(ic);
        } else {
          let mi=Math.floor(Math.random()*p2.hand.length);
          ic=p2.hand.splice(mi,1)[0]; p2.discard.push(ic);
        }
      // Boss genérico: pega carta mais alta
      } else if (ch.isBoss) {
        let mi=0; p2.hand.forEach((c,i)=>{if(c.nv>p2.hand[mi].nv)mi=i;});
        ic=p2.hand.splice(mi,1)[0]; p2.discard.push(ic);
      } else {
        let mi=0; p2.hand.forEach((c,i)=>{if(c.nv<p2.hand[mi].nv)mi=i;});
        ic=p2.hand.splice(mi,1)[0]; p2.discard.push(ic);
      }
    } else {
      ic=p2.deck.length?p2.deck.shift():{suit:'neutral',val:'?',nv:0};
    }
    all.push({ch, o:'p2', ic, tot:ic.nv+ch.inc});
  });

  // Sort by total (higher = faster)
  all.sort((a,b)=>{
    if(b.tot!==a.tot) return b.tot-a.tot;
    if(b.ic.nv!==a.ic.nv) return b.ic.nv-a.ic.nv;
    const am=a.ic.suit===a.ch.suit?1:0, bm=b.ic.suit===b.ch.suit?1:0;
    if(bm!==am) return bm-am;
    return Math.random()-.5;
  });
  G.order = all; G.orderIdx = 0;

  // ── JUIZ: verificar iniciativa ──
  var initErrors = [];
  if(all.length !== 6) initErrors.push('Esperado 6 personagens na ordem, encontrou '+all.length);
  all.forEach(function(e, i) {
    if(!e.ch) initErrors.push('Entrada '+i+' sem personagem');
    if(!e.ic || e.ic.nv === undefined) initErrors.push(e.ch.name+' não recebeu carta de iniciativa');
    if(e.tot !== (e.ic.nv + e.ch.inc)) initErrors.push(e.ch.name+': total '+e.tot+' não bate com carta('+e.ic.nv+') + INC('+e.ch.inc+') = '+(e.ic.nv+e.ch.inc));
    if(i > 0 && e.tot > all[i-1].tot) initErrors.push('Ordem errada: '+e.ch.name+'('+e.tot+') antes de '+all[i-1].ch.name+'('+all[i-1].tot+')');
  });
  if(initErrors.length > 0) {
    initErrors.forEach(function(err) {
      addLog('⚠ JUIZ (Iniciativa): '+err, 'dmg');
      console.error('[JUIZ]', err);
    });
  } else {
    addLog('✅ JUIZ: Iniciativa verificada — '+all.map(function(e){return e.ch.name+'('+e.tot+')';}).join(', '), 'sys');
  }

  G.phase = 'resolving';
  closePanel();
  runCinematicInitiative();
}
// ===================== MARCO — WEAPON SLOT =====================
const MARCO_WEAPONS = {
  pistola: {
    name:'Disparo — Pistola', power:4, type:'Distância', target:'enemy',
    turno:'N', recarga:'N', acao:'N',
    desc:'Crítico Alto: 50% de chance de dano dobrado.',
  },
  metralhadora: {
    name:'Disparo — Metralhadora', power:'2/2/2/2', type:'Distância', target:'enemy',
    turno:'N', recarga:'N', acao:'N',
    desc:'Ataque múltiplo: 1ª carta obrigatória + até 3 opcionais.',
  },
  shotgun: {
    name:'Disparo — Shotgun', power:5, type:'Distância', target:'all_enemy',
    turno:'N', recarga:'N', acao:'N',
    desc:'Ignora Armadura. Atinge todos os inimigos.',
  },
};

function marcoUpdateWeaponSlot(ch) {
  if(ch.id !== 'kane') return;
  const w = MARCO_WEAPONS[ch._weapon || 'pistola'];
  const sk = ch.skills[1]; // slot 2 — sempre 'wpn'
  sk.name   = w.name;
  sk.power  = w.power;
  sk.type   = w.type;
  sk.target = w.target;
  sk.desc   = w.desc;
  sk.turno  = w.turno;
  sk.recarga= w.recarga;
  sk.acao   = w.acao;
}
// ===================== COMBAT CORE =====================
function getPow(skill) {
  if(typeof skill.power==='string') return skill.power.split('/').reduce((a,b)=>a+parseInt(b),0);
  return skill.power;
}

function hpColor(pct) {
  if(pct>0.5) return '#3aaa5a';
  if(pct>0.25) return '#c9a020';
  return '#c93030';
}

function dmgChar(ch, dmg, attacker) {

  // Note: mirror dodge is handled in resolveAttack before this is called
  // Shield absorbs first
  const shieldSt = ch.statuses.find(s=>s.id==='shield');
  if(shieldSt && shieldSt.val > 0) {
    const absorbed = Math.min(shieldSt.val, dmg);
    shieldSt.val -= absorbed;
    dmg -= absorbed;
    floatArmor(ch, absorbed);
    addLog('🛡️ '+ch.name+': Escudo absorveu '+absorbed+'! ('+shieldSt.val+' restante)','info');
    if(shieldSt.val <= 0) {
      ch.statuses = ch.statuses.filter(s=>s.id!=='shield');
      addLog('🛡️ Escudo de '+ch.name+' quebrou!','info');
    }
    if(dmg <= 0) return;
  }
  // Escudo Barreira (sufixo s8_shield) absorve depois do shield normal
  const shieldSufSt = ch.statuses.find(s=>s.id==='shield_suf');
  if(shieldSufSt && shieldSufSt.val > 0) {
    const absorbed2 = Math.min(shieldSufSt.val, dmg);
    shieldSufSt.val -= absorbed2;
    dmg -= absorbed2;
    floatArmor(ch, absorbed2);
    addLog('🛡️ '+ch.name+': Barreira absorveu '+absorbed2+'! ('+shieldSufSt.val+' restante)','info');
    if(shieldSufSt.val <= 0) {
      ch.statuses = ch.statuses.filter(s=>s.id!=='shield_suf');
      addLog('🛡️ Barreira de '+ch.name+' quebrou!','info');
    }
    if(dmg <= 0) return;
  }
  // ── Artefato: Olhos Cósmicos de Vyr'Thas — Sorte: 1ª vez que recebe dano na rodada, 50% de reduzir pela metade ──
  if (!ch._dmgTakenThisTurn && dmg > 0) {
    var _olhosHasArt = false;
    if (ch.owner === 'p1' && _equipLoaded) {
      _olhosHasArt = _getCharArtefato(ch.id) === 'art_olhos_cosmicos';
    }
    if (ch.isBoss && window._survBossArtefato && window._survBossArtefato.id === 'art_olhos_cosmicos') {
      _olhosHasArt = true;
    }
    if (_olhosHasArt) {
      ch._dmgTakenThisTurn = true;
      if (Math.random() < 0.5) {
        var dmgAntes = dmg;
        dmg = Math.max(1, Math.floor(dmg / 2));
        floatStatus(ch, '🍀 Sorte!', '#40e080');
        addLog('🍀 [Sorte] Olhos Cósmicos de Vyr\'Thas: dano reduzido de ' + dmgAntes + ' para ' + dmg + '!', 'heal');
      } else {
        addLog('🌩️ [Azar] Olhos Cósmicos de Vyr\'Thas: sem proteção desta vez.', 'info');
      }
    }
  }

  ch.hp=Math.max(0,ch.hp-dmg);
  // Training Lab: Imortal — HP não desce de 1
  if(_tlabImmortal && ch.hp <= 0) { ch.hp = 1; }
  if(ch.hp<=0) killChar(ch, attacker);
  else {
    if((ch.id==='gora'||ch.id==='gora_ai')) {
      const pct=ch.hp/ch.maxHp;
      ch.curDef=ch.def+Math.floor((1-pct)*10);
      // Agora é Sério: acumula +4 poder em ATACARRRR por cada golpe recebido
      if(ch._agoraSerio) {
        ch._agoraSerioPow = (ch._agoraSerioPow||0) + 4;
        floatStatus(ch, '⚔️ +4 ATACARRRR!', '#ff4040');
        addLog('⚔️ Gorath: ATACARRRR acumulou +'+(ch._agoraSerioPow)+' de bônus!','info');
      }
    }
    if((ch.id==='kael'||ch.id==='kael_ai')) {
      const pct=ch.hp/ch.maxHp;
      const _kaelAtqAntes = ch.curAtq;
      ch.curAtq=ch.atq+Math.floor((1-pct)*10);
      judgeCheck('passive_start', { who: ch.name, passive: 'Espírito de Combate', charObj: ch, extra: false, noExtra: false });
      judgeCheck('passive_result', { who: ch.name, passive: 'Espírito de Combate', result: 'HP: '+ch.hp+'/'+ch.maxHp+' ('+Math.round((1-pct)*100)+'% perdido) → ATQ: '+_kaelAtqAntes+' → '+ch.curAtq });
    }
    // ── Passiva: Fúria Polar (Urso Polar das Cavernas) ──
    // Dispara a cada 20 de dano acumulado (20% do maxHp de 100), sem limite.
    // DEF pode ficar negativa; com DEF < 0 a dobra de DEF por naipe não ativa.
    if (ch.passive === 'furia_polar' && dmg > 0) {
      if (ch._furiaPolarDmgAcum === undefined) ch._furiaPolarDmgAcum = 0;
      const _fpThreshold = Math.round(ch.maxHp * 0.2);
      const _fpAntes = Math.floor(ch._furiaPolarDmgAcum / _fpThreshold);
      ch._furiaPolarDmgAcum += dmg;
      const _fpDepois = Math.floor(ch._furiaPolarDmgAcum / _fpThreshold);
      const _fpGatilhos = _fpDepois - _fpAntes;
      if (_fpGatilhos > 0) {
        const _fpAtqBonus = _fpGatilhos * 2;
        const _fpDefLoss  = _fpGatilhos * 1;
        ch.curAtq += _fpAtqBonus;
        ch.curDef -= _fpDefLoss;
        floatStatus(ch, '🐻 Fúria! +' + _fpAtqBonus + ' ATQ', '#ff8040');
        addLog('🐻 Fúria Polar: ' + ch.name + ' enraiveceu! +' + _fpAtqBonus + ' ATQ / -' + _fpDefLoss + ' DEF (ATQ:' + ch.curAtq + ' DEF:' + ch.curDef + ')', 'dmg');
        judgeCheck('passive_start',  { who: ch.name, passive: 'Fúria Polar', charObj: ch, extra: false, noExtra: false });
        judgeCheck('passive_result', { who: ch.name, passive: 'Fúria Polar', result: _fpGatilhos + ' gatilho(s) — +' + _fpAtqBonus + ' ATQ / -' + _fpDefLoss + ' DEF | ATQ:' + ch.curAtq + ' DEF:' + ch.curDef });
      }
    }
  }
}

function killChar(ch, attacker) {
  if(G&&G.trainingMode) {
    ch.hp=1; // immortal
    addLog(`☠️ [TREINO] ${ch.name} teria sido eliminado! (imortal)`, 'sys');
    floatStatus(ch,'☠️ IMORTAL','#ffff40');
    return;
  }
  // Anima o slot com fadeout antes de marcar como morto
  animDeath(ch);
  ch.alive=false; ch.hp=0;
  addLog(`💀 ${ch.name} foi eliminado!`,'dmg');
  // ── Boss: spawn crias ao morrer ──
  if (ch.isBoss && ch.onDeath === 'spawn_crias' && BOSS_SPAWNS[ch.id]) {
    var spawn = BOSS_SPAWNS[ch.id];
    var naipes = ['spades', 'hearts', 'clubs', 'diamonds'];
    var owner = ch.owner;
    var criaLabels = ['α', 'β', 'γ', 'δ', 'ε', 'ζ'];
    var newChars = [];
    for (var si = 0; si < spawn.count; si++) {
      var randomSuit = naipes[Math.floor(Math.random() * naipes.length)];
      var criaData = Object.assign({}, spawn.template, {
        suit: randomSuit,
        id: spawn.template.id + '_' + si,
        name: spawn.template.name + ' ' + criaLabels[si],
        skills: spawn.template.skills.map(function(s) { return Object.assign({}, s); })
      });
      var cria = makeChar(criaData, owner);
      cria.isBossSpawn = true;
      cria.firstTurn = false; // crias agem imediatamente
      newChars.push(cria);
    }
    // Substitui o boss morto pelas crias no array
    G[owner].chars = newChars;
    // Adiciona crias na fila de iniciativa (após o turno atual)
    var insertIdx = G.orderIdx + 1;
    newChars.forEach(function(cria, ci) {
      G.order.splice(insertIdx + ci, 0, { ch: cria, o: owner, ic: { nv: 0, suit: 'neutral' }, tot: cria.inc });
    });
    addLog('🩸 ' + ch.name + ' se divide em ' + spawn.count + ' Crias!', 'sys');
    floatStatus(ch, '🩸 SPAWN!', '#d04050');
    render();
    return; // não executa passivas de morte de outros chars
  }
  // Instinto Furioso (Kael Vorn): ally KO → Fúria + heal 20%
  for(let o of ['p1','p2']) {
    for(let ally of G[o].chars) {
      if(ally.alive && ally.id==='kael' && ally.owner===ch.owner) {
        judgeCheck('passive_start', { who: ally.name, passive: 'Instinto Furioso', charObj: ally, extra: false, noExtra: false });
        ally.hp=Math.min(ally.maxHp, ally.hp+Math.floor(ally.maxHp*0.2));
        addSt(ally,{id:'furia',icon:'😡',label:'Fúria',turns:999});
        addLog(`😡 Kael Vorn entra em Fúria! Recuperou 20% de vida.`,'info');
        judgeCheck('passive_result', { who: ally.name, passive: 'Instinto Furioso', result: 'Fúria ativada + 20% HP recuperado' });
      }
    }
  }
  // Grande Estrela (Lorien): qualquer aliado nocautear inimigo → Lorien compra 1 carta + turno extra
  // Apenas 1 disparo por morte, independente de quantos aliados existam
  for(let o of ['p1','p2']) {
    const lori = G[o].chars.find(c=>c.alive && (c.id==='lori'||c.id==='lori_ai') && c.owner!==ch.owner);
    if(lori) {
      judgeCheck('passive_start', { who: lori.name, passive: 'Grande Estrela', charObj: lori, extra: false, noExtra: false });
      draw(lori.owner, 1, '⭐ Grande Estrela');
      addLog(`⭐ Grande Estrela: ${ch.name} caiu! Lorien comprou 1 carta extra.`,'info');
      floatStatus(lori,'⭐ Grande Estrela!','var(--gold)');
      grantExtraTurn(lori, 'Grande Estrela');
      judgeCheck('passive_result', { who: lori.name, passive: 'Grande Estrela', result: '1 carta comprada + Rodada Extra concedida' });
      break; // 1 disparo apenas
    }
  }
  // Gladiadora (Lorien): só quando a própria Lorien matar → +1 ATQ/DEF permanente (cap: base+4)
  // Apenas 1 disparo por morte
  if(attacker && (attacker.id==='lori'||attacker.id==='lori_ai') && ch.owner!==attacker.owner) {
    judgeCheck('passive_start', { who: attacker.name, passive: 'Gladiadora', charObj: attacker, extra: false, noExtra: false });
    attacker.curAtq=Math.min(attacker.curAtq+1, attacker.atq+4);
    attacker.curDef=Math.min(attacker.curDef+1, attacker.def+4);
    addLog(`⚔️ Gladiadora: Lorien nocauteou ${ch.name}! (+1 ATQ/DEF perm.) ATQ${attacker.curAtq} DEF${attacker.curDef}`,'info');
    floatStatus(attacker,'⚔️ +1 ATQ/DEF','var(--green)');
    judgeCheck('passive_result', { who: attacker.name, passive: 'Gladiadora', result: '+1 ATQ/DEF permanente. ATQ:'+attacker.curAtq+' DEF:'+attacker.curDef });
  }
  // Inspirar Coragem (Zephyr): remover bônus dos aliados quando Zephyr é eliminado
  if((ch.id==='zeph'||ch.id==='zeph_ai')) {
    judgeCheck('passive_start', { who: ch.name, passive: 'Inspirar Coragem (morte)', charObj: ch, extra: false, noExtra: false });
    const allies = G[ch.owner].chars.filter(a=>a.id!=='zeph'&&a.id!=='zeph_ai'&&a.alive&&a._inspirado);
    allies.forEach(a=>{
      a.curAtq = Math.max(a.atq, a.curAtq - 1);
      a.curDef = Math.max(a.def, a.curDef - 1);
      a._inspirado = false;
      floatStatus(a,'💔 -Inspiração','#c06060');
      addLog(`💔 ${a.name} perde +1 ATQ e +1 DEF (Zephyr eliminado).`,'info');
    });
    judgeCheck('passive_result', { who: ch.name, passive: 'Inspirar Coragem (morte)', result: allies.length+' aliado(s) perderam +1 ATQ e +1 DEF' });
  }
  // Patrulheiro de Combate (Caeryn): remove bônus de DEF dos aliados quando Caeryn é eliminado
  if((ch.id==='pt_cae'||ch.id==='pt_cae_ai')) {
    judgeCheck('passive_start', { who: ch.name, passive: 'Patrulheiro de Combate Caeryn (morte)', charObj: ch, extra: false, noExtra: false });
    const owner = ch.owner;
    const allies = G[owner].chars.filter(a=>a.id!=='pt_cae'&&a.alive&&a._caerynDef);
    allies.forEach(a=>{
      a.curDef = Math.max(a.def, a.curDef - a._caerynDef);
      a.def    = Math.max(0, a.def - a._caerynDef);
      floatStatus(a,'💔 -DEF Caeryn','#c06060');
      addLog(`💔 ${a.name} perde +${a._caerynDef} DEF (Caeryn eliminado).`,'info');
      a._caerynDef = 0;
    });
    judgeCheck('passive_result', { who: ch.name, passive: 'Patrulheiro de Combate Caeryn (morte)', result: allies.length+' aliado(s) perderam bônus de DEF' });
  }
  // Patrulheiro de Combate (Varok): remove bônus de ATQ dos aliados quando Varok é eliminado
  if((ch.id==='pt_var'||ch.id==='pt_var_ai')) {
    judgeCheck('passive_start', { who: ch.name, passive: 'Patrulheiro de Combate Varok (morte)', charObj: ch, extra: false, noExtra: false });
    const owner = ch.owner;
    const allies = G[owner].chars.filter(a=>a.id!=='pt_var'&&a.alive&&a._varokAtq);
    allies.forEach(a=>{
      a.curAtq = Math.max(a.atq, a.curAtq - a._varokAtq);
      a.atq    = Math.max(0, a.atq - a._varokAtq);
      floatStatus(a,'💔 -ATQ Varok','#c06060');
      addLog(`💔 ${a.name} perde +${a._varokAtq} ATQ (Varok eliminado).`,'info');
      a._varokAtq = 0;
    });
    judgeCheck('passive_result', { who: ch.name, passive: 'Patrulheiro de Combate Varok (morte)', result: allies.length+' aliado(s) perderam bônus de ATQ' });
  }
  // Patrulheiro de Combate (Zarae): remove bônus de POW das skills dos aliados quando Zarae é eliminada
  if((ch.id==='pt_zar'||ch.id==='pt_zar_ai')) {
    judgeCheck('passive_start', { who: ch.name, passive: 'Patrulheiro de Combate Zarae (morte)', charObj: ch, extra: false, noExtra: false });
    const owner = ch.owner;
    const allies = G[owner].chars.filter(a=>a.id!=='pt_zar'&&a.alive&&a._zaraePow);
    allies.forEach(a=>{
      const lost = a._zaraePow;
      a.skills=a.skills.map(s=>({...s,power:typeof s.power==='string'
        ?s.power.split('/').map(n=>String(Math.max(0,parseInt(n)-lost))).join('/')
        :Math.max(0,s.power-lost)}));
      floatStatus(a,'💔 -POW Zarae','#c06060');
      addLog(`💔 ${a.name} perde +${lost} POW (Zarae eliminada).`,'info');
      a._zaraePow = 0;
    });
    judgeCheck('passive_result', { who: ch.name, passive: 'Patrulheiro de Combate Zarae (morte)', result: allies.length+' aliado(s) perderam bônus de POW nas skills' });
  }
  checkWin();
}

function checkWin() {
  if(G&&G.trainingMode) return; // immortal — no win condition
  if(G.over) return;
  const pa=G.p1.chars.some(c=>c.alive);
  const ea=G.p2.chars.some(c=>c.alive);
  const pd=G.p1.deck.length>0;
  const ed=G.p2.deck.length>0;
  if(!pa||!pd){endGame('p2');return;}
  if(!ea||!ed){endGame('p1');return;}
}
var _goCinTimers = [];
var _goCinDone = false;
function _goCinT(fn, ms) { _goCinTimers.push(setTimeout(fn, ms)); }
function _goCinClear() { _goCinTimers.forEach(clearTimeout); _goCinTimers = []; }

function _goCinSkip() {
  var ov = document.getElementById('go-cinematic');
  if (!ov) return;
  if (_goCinDone) {
    // Segunda vez: fecha e vai para tela normal
    ov.style.display = 'none';
    _goCinDone = false;
    // Survivor: processa resultado após cinemática
    if (window._survPendingResult !== undefined) {
      var wasWin = window._survPendingResult;
      delete window._survPendingResult;
      _survOnBattleResult(wasWin);
    }
    return;
  }
  _goCinClear();
  _goCinDone = true;
  // Pula direto para estado final
  var fallen  = document.getElementById('go-last-fallen');
  var bg      = document.getElementById('go-cin-bg');
  var titleEl = document.getElementById('go-cin-title');
  var teams   = document.getElementById('go-cin-teams');
  var subEl   = document.getElementById('go-cin-sub');
  var skipEl  = document.getElementById('go-cin-skip');
  if (fallen) { fallen.style.animation = 'none'; fallen.style.opacity = '0'; }
  if (bg) bg.style.opacity = '1';
  if (titleEl) { titleEl.style.animation = 'none'; titleEl.style.opacity = '1'; titleEl.style.transform = 'translateY(0)'; }
  if (teams) {
    teams.style.opacity = '1';
    document.querySelectorAll('.go-cin-char').forEach(function(el) {
      el.style.animation = 'none'; el.style.opacity = '1'; el.style.transform = 'translateX(0)';
    });
  }
  if (subEl) subEl.style.opacity = '1';
  if (skipEl) skipEl.style.opacity = '1';
  // Mostra drop se houver
  var dropEl = document.getElementById('go-cin-drop');
  if (dropEl && (window._survLastDrop || window._survLastArtefato)) {
    var dHtml = '';
    if (window._survLastDrop) {
      var di = window._survLastDrop;
      dHtml += '<div style="background:rgba(201,168,76,0.12);border:1px solid rgba(201,168,76,0.4);border-radius:8px;padding:8px 16px;display:inline-flex;align-items:center;gap:8px"><span style="font-size:14px">⚜</span><div style="text-align:left"><div style="font-family:Cinzel,serif;font-size:11px;color:var(--gold);letter-spacing:1px">' + (di.name || ('Tier ' + di.tier)) + ' DROPADO!</div><div style="font-size:9px;color:var(--text)">' + di.prefix + ' +' + di.prefixVal + '</div></div></div>';
    }
    if (window._survLastArtefato) {
      var da = window._survLastArtefato;
      dHtml += '<div style="background:rgba(144,96,208,0.12);border:1px solid rgba(144,96,208,0.4);border-radius:8px;padding:8px 16px;display:inline-flex;align-items:center;gap:8px;margin-top:6px"><span style="font-size:14px">🔮</span><div style="text-align:left"><div style="font-family:Cinzel,serif;font-size:11px;color:#9060d0;letter-spacing:1px">ARTEFATO DROPADO!</div><div style="font-size:9px;color:var(--text)">' + (da.name || '') + '</div></div></div>';
    }
    dropEl.innerHTML = dHtml;
    dropEl.style.display = 'flex';
    dropEl.style.flexDirection = 'column';
    dropEl.style.alignItems = 'center';
  } else if (dropEl && window._survivorMode) {
    dropEl.innerHTML = '<div style="font-family:Cinzel,serif;font-size:10px;letter-spacing:2px;color:var(--text2);opacity:0.5">Nenhum drop</div>';
    dropEl.style.display = 'flex';
    dropEl.style.alignItems = 'center';
    dropEl.style.justifyContent = 'center';
  }
  // Marca como done — próximo clique fecha
  _goCinT(function() { _goCinDone = true; }, 100);
}

function _showGoCinematic(isWin, subText) {
  if (!_vfxEnabled) return;

  var ov      = document.getElementById('go-cinematic');
  var fallen  = document.getElementById('go-last-fallen');
  var bg      = document.getElementById('go-cin-bg');
  var titleEl = document.getElementById('go-cin-title');
  var teams   = document.getElementById('go-cin-teams');
  var subEl   = document.getElementById('go-cin-sub');
  var skipEl  = document.getElementById('go-cin-skip');
  var winChars = document.getElementById('go-cin-win-chars');
  var loseChars = document.getElementById('go-cin-lose-chars');
  if (!ov) return;

  _goCinClear();
  _goCinDone = false;

  // Times
  var winTeam  = isWin ? G.p1.chars : G.p2.chars;
  var loseTeam = isWin ? G.p2.chars : G.p1.chars;

  // Último personagem morto (do time perdedor)
  var lastDead = loseTeam.find(function(c) { return !c.alive; }) || loseTeam[loseTeam.length-1];

  // Monta sprites só do time vencedor
  var isSurvivorCin = !!window._survivorMode;
  function makeCharEl(ch) {
    var div = document.createElement('div');
    div.className = 'go-cin-char victory-char';
    var isDead = !ch.alive;
    if (isSurvivorCin && isDead) {
      div.style.filter = 'grayscale(1)';
      div.style.opacity = '0.4';
    }
    var img = document.createElement('img');
    var pose = (SPRITE_POSES && SPRITE_POSES[ch.id] && SPRITE_POSES[ch.id].idle) ? SPRITE_POSES[ch.id].idle : 'idle';
    img.src = 'sprites/' + ch.id + '/' + pose + '.png';
    img.alt = ch.name;
    img.onerror = function() { this.style.display='none'; };
    var span = document.createElement('span');
    span.textContent = ch.name.toUpperCase();
    div.appendChild(img);
    div.appendChild(span);
    // Survivor: mostra HP abaixo do nome
    if (isSurvivorCin) {
      var hpLine = document.createElement('span');
      hpLine.style.cssText = 'font-size:10px;letter-spacing:1px;margin-top:2px;';
      if (isDead) {
        hpLine.textContent = '☠️ FORA DE BATALHA';
        hpLine.style.color = '#d04050';
      } else {
        hpLine.textContent = ch.hp + '/' + ch.maxHp + ' HP';
        hpLine.style.color = ch.hp > ch.maxHp * 0.6 ? '#5ac880' : ch.hp > ch.maxHp * 0.3 ? '#d0a040' : '#d04050';
      }
      div.appendChild(hpLine);
    }
    return div;
  }

  winChars.innerHTML = '';
  winTeam.forEach(function(ch) { winChars.appendChild(makeCharEl(ch)); });

  var labelEl = document.getElementById('go-cin-label-win');
  if (labelEl) labelEl.textContent = isWin ? 'SEU TIME' : 'VENCEDOR';

  titleEl.className = isWin ? 'victory' : 'defeat';
  titleEl.textContent = isWin ? 'VICTORY' : 'DEFEAT';
  titleEl.style.opacity = '0';
  titleEl.style.transform = 'translateY(-150px)';
  titleEl.style.animation = 'none';

  bg.className = isWin ? 'victory' : 'defeat';
  bg.style.opacity = '0';
  teams.style.opacity = '0';
  subEl.style.opacity = '0';
  subEl.textContent = subText;
  skipEl.style.opacity = '0';
  skipEl.textContent = 'TOQUE PARA PULAR ›';
  skipEl.style.color = 'rgba(255,255,255,0.35)';
  document.querySelectorAll('.go-cin-char').forEach(function(el) {
    el.style.opacity = '0'; el.style.animation = 'none';
  });

  if (fallen && lastDead) {
    var pose = (SPRITE_POSES && SPRITE_POSES[lastDead.id] && SPRITE_POSES[lastDead.id].hit)
      ? SPRITE_POSES[lastDead.id].hit : 'hit';
    fallen.src = 'sprites/' + lastDead.id + '/' + pose + '.png';
    fallen.style.opacity = '0';
    fallen.style.animation = 'none';
    fallen.style.filter = 'grayscale(1) brightness(0.45)';
    fallen.style.transform = 'translate(-50%,-50%)';
  }

  // Reset drop display
  var dropEl = document.getElementById('go-cin-drop');
  if (dropEl) { dropEl.style.display = 'none'; dropEl.innerHTML = ''; }

  ov.style.display = 'flex';

  // T=0.3s: ultimo cai
  _goCinT(function() {
    if (!fallen) return;
    fallen.style.opacity = '1';
    fallen.style.animation = 'go-fall-down 2.5s ease forwards';
  }, 300);

  // T=3.2s: fundo
  _goCinT(function() { bg.style.opacity = '1'; }, 3200);

  // T=4.2s: titulo bate
  _goCinT(function() {
    titleEl.style.animation = 'go-title-slam 0.7s cubic-bezier(0.2,1.2,0.4,1) forwards';
    var fl = document.getElementById('screen-flash-overlay');
    if (fl) {
      fl.style.background = isWin ? 'rgba(201,168,76,0.8)' : '#cc2222';
      fl.style.transition = 'none'; fl.style.opacity = '0.45';
      setTimeout(function() { fl.style.transition='opacity 0.6s ease'; fl.style.opacity='0'; fl.style.background='white'; }, 80);
    }
    _goCinT(function() { titleEl.style.animation = 'go-title-vib 0.5s ease'; }, 750);
  }, 4200);

  // T=5.8s: estrelas (vitoria)
  if (isWin) {
    _goCinT(function() {
      var cx = window.innerWidth/2, cy = window.innerHeight*0.35;
      for (var i=0;i<10;i++) { (function(i){ setTimeout(function(){ _spawnVfxStar(cx+(Math.random()-0.5)*280,cy+(Math.random()-0.5)*100,'var(--gold)',18+Math.random()*22,700); },i*100); })(i); }
      _spawnVfxParticles(cx, cy, 'var(--gold)', 14);
    }, 5800);
  }

  // T=7.0s: sprites entram um por um
  _goCinT(function() {
    teams.style.opacity = '1';
    var winEls = winChars.querySelectorAll('.go-cin-char');
    winEls.forEach(function(el, i) {
      setTimeout(function() {
        el.style.animation = 'go-char-in-left 0.6s ease forwards';
        setTimeout(function() {
          var img = el.querySelector('img');
          if (img) {
            img.style.transition = 'filter 0.6s ease';
            img.style.filter = isWin
              ? 'drop-shadow(0 0 12px var(--gold)) drop-shadow(0 0 30px var(--gold)) brightness(1.3)'
              : 'drop-shadow(0 0 12px #cc2222) drop-shadow(0 0 30px #cc2222) brightness(1.1)';
          }
          if (isWin) {
            var r = el.getBoundingClientRect();
            _spawnVfxStar(r.left+r.width/2, r.top+r.height/2, 'var(--gold)', 22, 600);
          }
        }, 500);
      }, i * 500);
    });
  }, 7000);

  // T=10.5s: subtitulo
  _goCinT(function() {
    subEl.style.opacity = '1';
    if (isWin) {
      var cx3 = window.innerWidth/2;
      for (var k=0;k<6;k++) { (function(k){ setTimeout(function(){ _spawnVfxStar(cx3+(Math.random()-0.5)*320,window.innerHeight*0.55+(Math.random()-0.5)*80,'var(--gold)',14+Math.random()*12,600); },k*200); })(k); }
    }
  }, 10500);

  // T=11.2s: mostra drop (se houver)
  _goCinT(function() {
    var dropEl = document.getElementById('go-cin-drop');
    if (!dropEl) return;
    var dropHtml = '';
    var droppedItem = window._survLastDrop;
    var droppedArtefato = window._survLastArtefato;
    if (droppedItem) {
      var valDisplay = droppedItem.prefix + ' +' + droppedItem.prefixVal;
      dropHtml += '<div style="background:rgba(201,168,76,0.12);border:1px solid rgba(201,168,76,0.4);border-radius:8px;padding:8px 16px;display:inline-flex;align-items:center;gap:8px;animation:go-char-in-left 0.5s ease forwards">' +
        '<span style="font-size:14px">⚜</span>' +
        '<div style="text-align:left">' +
          '<div style="font-family:Cinzel,serif;font-size:11px;color:var(--gold);letter-spacing:1px">' + (droppedItem.name || ('Tier ' + droppedItem.tier)) + ' DROPADO!</div>' +
          '<div style="font-size:9px;color:var(--text)">' + valDisplay + '</div>' +
        '</div>' +
      '</div>';
    }
    if (droppedArtefato) {
      dropHtml += '<div style="background:rgba(144,96,208,0.12);border:1px solid rgba(144,96,208,0.4);border-radius:8px;padding:8px 16px;display:inline-flex;align-items:center;gap:8px;margin-top:6px;animation:go-char-in-left 0.5s ease forwards">' +
        '<span style="font-size:14px">🔮</span>' +
        '<div style="text-align:left">' +
          '<div style="font-family:Cinzel,serif;font-size:11px;color:#9060d0;letter-spacing:1px">ARTEFATO DROPADO!</div>' +
          '<div style="font-size:9px;color:var(--text)">' + (droppedArtefato.name || '') + '</div>' +
        '</div>' +
      '</div>';
    }
    if (dropHtml) {
      dropEl.innerHTML = dropHtml;
      dropEl.style.display = 'flex';
      dropEl.style.flexDirection = 'column';
      dropEl.style.alignItems = 'center';
    } else if (window._survivorMode) {
      dropEl.innerHTML = '<div style="font-family:Cinzel,serif;font-size:10px;letter-spacing:2px;color:var(--text2);opacity:0.5">Nenhum drop</div>';
      dropEl.style.display = 'flex';
      dropEl.style.alignItems = 'center';
      dropEl.style.justifyContent = 'center';
    }
  }, 11200);

  // T=12s: skip visivel
  _goCinT(function() { skipEl.style.opacity = '1'; }, 12000);

  // T=14s: done
  _goCinT(function() {
    _goCinDone = true;
    skipEl.textContent = 'TOQUE PARA FECHAR ›';
    skipEl.style.color = 'rgba(255,255,255,0.65)';
  }, 14000);
}
function endGame(winner) {
  G.over=true;
  judgeWatchdogStop();
  // JUIZ: sela o fim da batalha e loga resultado + erros
  judgeCheck('game_over', { winner: winner });
  _logEvent('═══ FIM DE BATALHA — ' + (winner === 'p1' ? 'VITÓRIA' : 'DERROTA') + ' ═══', 'BATTLE');
  const isPlayerWin = winner === 'p1';
  document.getElementById('go-title').textContent = isPlayerWin ? 'VITÓRIA!' : 'DERROTA!';
  document.getElementById('go-sub').textContent   = isPlayerWin ? 'Seu time venceu!' : 'O oponente venceu.';

  // ── Arena assíncrono — salva resultado no Firebase ──
  if (window._arenaContext) {
    const { myUid, defensorUid } = window._arenaContext;
    window._arenaContext = null;

    // Conta heróis vivos do atacante
    const alivesCount = G.p1.chars.filter(c => c.alive).length;

    // Pontos: atacante vence → +alives coins e RP; perde → -1 RP
    const atkCoins = isPlayerWin ? alivesCount : 0;
    const atkRpDelta = isPlayerWin ? alivesCount : -1;
    // Defensor: perde → -1 RP; vence → +1 RP
    const defRpDelta = isPlayerWin ? -1 : 1;

    // Texto na tela de gameover
    document.getElementById('go-sub').textContent = isPlayerWin
      ? `Vitória! +${alivesCount} coins  +${alivesCount} RP (${alivesCount} herói${alivesCount!==1?'s':''} vivo${alivesCount!==1?'s':''})`
      : 'Derrota! -1 RP';

    // Salva atacante
    const atkRef = window._fbRef(window._fbDb, 'jogadores/' + myUid);
    window._fbGet(atkRef).then(snap => {
      const d = snap.exists() ? snap.val() : {};
      return window._fbSet(atkRef, {
        ...d,
        coins:        Math.max(0, (d.coins || 0) + atkCoins),
        rp:           Math.max(0, (d.rp || 0) + atkRpDelta),
        arenaWins:    (d.arenaWins || 0) + (isPlayerWin ? 1 : 0),
        arenaLosses:  (d.arenaLosses || 0) + (isPlayerWin ? 0 : 1)
      });
    }).then(() => {
      addLog('📊 Arena: ' + (isPlayerWin ? 'VITÓRIA' : 'DERROTA') + ' | coins ' + (atkCoins > 0 ? '+' + atkCoins : '0') + ' | RP ' + (atkRpDelta >= 0 ? '+' : '') + atkRpDelta, 'sys');
    });

    // Salva defensor (uid diferente)
    if (defensorUid) {
      const defRef = window._fbRef(window._fbDb, 'jogadores/' + defensorUid);
      window._fbGet(defRef).then(snap => {
        const d = snap.exists() ? snap.val() : {};
        return window._fbSet(defRef, {
          ...d,
          rp:              Math.max(0, (d.rp || 0) + defRpDelta),
          arenaDefWins:    (d.arenaDefWins || 0) + (isPlayerWin ? 0 : 1),
          arenaDefLosses:  (d.arenaDefLosses || 0) + (isPlayerWin ? 1 : 0)
        });
      });
    }
  }


  // ── PvP: XP de item por vitória (1-3 por chars vivos) ──
  if (isPlayerWin && !window._survivorMode && _equipLoaded) {
    var pvpAlives = G.p1.chars.filter(function(c) { return c.alive; }).length;
    _equipGrantBattleXp(Math.max(1, pvpAlives));
  }

  // ── Survivor: mostra cinemática com HP, depois processa resultado ──
  if (window._survivorMode) {
    // Grava HP atual de G no _survState (G ainda intacto aqui)
    G.p1.chars.forEach(function(ch) {
      if (_survState && _survState.hp[ch.id]) {
        _survState.hp[ch.id].cur = ch.alive ? ch.hp : 0;
        _survState.hp[ch.id].max = ch.maxHp;
      }
    });
    // Monta texto com HP de cada personagem
    var survVivos = G.p1.chars.filter(function(c) { return c.alive; }).length;
    var survMortos = G.p1.chars.filter(function(c) { return !c.alive; }).length;
    document.getElementById('go-sub').textContent = isPlayerWin
      ? survVivos + '/3 heróis sobreviveram!' + (survMortos > 0 ? ' (' + survMortos + ' fora de batalha)' : '')
      : 'Seu time foi derrotado!';

    // ── Rola drop antes da cinemática (pra mostrar na tela KOF) ──
    window._survLastDrop = null;
    window._survLastArtefato = null;
    if (isPlayerWin && _equipLoaded) {
      var battlePhase = window._survBattlePhase || _survState.phase;
      var faseNum = ((battlePhase - 1) * 10) + (window._survBattleStage || _survState.stage);
      // Boss: só dropa artefato (sem item Slot 1)
      if (window._survBossActive) {
        if (window._survBossArtefato) {
          window._survLastArtefato = window._survBossArtefato;
          addLog('🎲 Artefato Boss: drop garantido (boss equipado) ✅', 'info');
          addLog('🔮 Drop! ' + window._survLastArtefato.name + ' — ' + window._survLastArtefato.desc, 'info');
        } else {
          addLog('🎲 Artefato Boss: boss não estava equipado — nenhum artefato', 'info');
        }
        window._survBossArtefato = null;
      } else {
        // Etapa normal: rola item Slot 1
        window._survLastDrop = _rollSurvivorDrop(battlePhase, faseNum);
      }
    }

    window._survPendingResult = isPlayerWin;
    showScreen('gameover');
    var subText = document.getElementById('go-sub').textContent;
    _showGoCinematic(isPlayerWin, subText);
    return;
  }

  showScreen('gameover');
  // Guarda sub para a cinemática
  var subText = document.getElementById('go-sub').textContent;
  _showGoCinematic(isPlayerWin, subText);
}
function resolveMultiHit(attacker, skill, atkCard, extraCards, target, defCard, atkOwner) {
  const hits=getHits(skill);

  // Kuro Isamu Sanren Geri: se alvo Marcado → multiplica poder de cada golpe ×3
  if(((attacker.id==='kuro'||attacker.id==='kuro_ai')) && skill.id==='tat') {
    const marcado = target.statuses.find(s=>s.id==='marcado');
    if(marcado) {
      skill = {...skill, _ryuTatExplorou: true};
      addLog('🌀 Sanren Geri: Marca detectada → poder de cada golpe ×3!','info');
      floatStatus(attacker,'🌀 COMBO ×3!','#cc44ff');
      // Rebuild hits com multiplicador ×3
      const newHits = hits.map(h => h * 3);
      const firstSk={...skill, power:newHits[0]};
      resolveAttack(attacker, firstSk, atkCard, target, defCard, atkOwner);
      for(let i=1;i<newHits.length;i++){
        if(!target.alive) break;
        const card=extraCards[i-1]||{suit:'neutral',val:'—',nv:0};
        const hitSk={...skill, power:newHits[i], acao:'F'};
        resolveAttack(attacker, hitSk, card, target, null, atkOwner);
      }
      return;
    }
  }

  // First hit uses the main card
  const firstSk={...skill, power:hits[0]};
  resolveAttack(attacker, firstSk, atkCard, target, defCard, atkOwner);
  // Extra hits use extra cards (or value 1 if no card provided)
  for(let i=1;i<hits.length;i++){
    if(!target.alive) break;
    const card=extraCards[i-1]||{suit:'neutral',val:'—',nv:0};
    const hitSk={...skill, power:hits[i], acao:'F'}; // furtive — no chain triggers
    resolveAttack(attacker, hitSk, card, target, null, atkOwner);
  }
}

// ── ETAPA 2 — tickTarget ──
function tickTarget(attacker, skill, target) {
  // clubs_furtivo: ações normais viram Furtivas
  if (attacker.statuses.find(s => s.id === 'clubs_furtivo') && skill.acao === 'N') {
    skill = {...skill, acao: 'F'};
  }
  addLog('🔍 JUIZ (Target): ' + attacker.name + ' mira em ' + target.name + ' com ' + skill.name, 'sys');
  return { skill, target };
}

// ── ETAPA 2 — tickIntercept ──
function tickIntercept(attacker, skill, target) {
  const origTarget = target;

  // Aeryn: Patrulheiro Líder — entra na frente de aliado com ≤20% vida (alvo único)
  if (target.id !== 'pt_aer' && skill.target === 'enemy' && skill.acao !== 'F') {
    const _aerTeam = target.owner === 'p1' ? G.p1 : G.p2;
    const pt_aerLid = _aerTeam.chars.find(c => c.id === 'pt_aer' && c.alive && c !== target);
    if (pt_aerLid && (target.hp / target.maxHp) <= 0.20) {
      addLog('🤍 Patrulheiro Líder! Aeryn cobre ' + target.name + ' que está em baixa vida!', 'info');
      floatStatus(pt_aerLid, '🤍 LIDERA!', '#e0e0ff');
      showAdvTag(pt_aerLid, '🤍 Protege!', '#e0e0ff');
      animIntercept(pt_aerLid);
      target = pt_aerLid;
    }
  }

  // Roupa Azul — intercept attack on ally (not Tyren, not Rápida/Furtiva)
  if (target.id !== 'tyre' && skill.acao !== 'Rápida' && skill.acao !== 'F') {
    const _tyreTeam = target.owner === 'p1' ? G.p1 : G.p2;
    const link = _tyreTeam.chars.find(ch => ch.id === 'tyre' && ch.alive && ch.statuses.find(s => s.id === 'outfit_azul'));
    if (link) {
      addLog('🔵 Roupa Azul: Tyren entra na frente de ' + target.name + ' e toma o dano!', 'info');
      showAdvTag(link, '🔵 Na frente!', 'var(--blue)');
      animIntercept(link);
      target = link;
    }
  }

  // Gorath: Defender os Fracos — intercept attack on ally (not Gorath, not Rápida/Furtiva)
  if (target.id !== 'gora' && skill.target === 'enemy' && skill.acao !== 'Rápida' && skill.acao !== 'F') {
    const defTeam = target.owner === 'p1' ? G.p1 : G.p2;
    const gora = defTeam.chars.find(c => c.id === 'gora' && c.alive && c !== target);
    if (gora) {
      addLog('💪 Defender os Fracos! Gorath entra na frente de ' + target.name + '!', 'info');
      floatStatus(gora, '💪 DEFENDE!', '#ff8040');
      showAdvTag(gora, '💪 Na frente!', '#ff8040');
      animIntercept(gora);
      target = gora;
    }
  }

  // ── JUIZ: verificar intercepção ──
  if (origTarget !== target) {
    addLog('🔍 JUIZ (Intercepção): Alvo original ' + origTarget.name + ' → interceptado por ' + target.name, 'sys');
  }

  // Parede de Carne Congelada: Restringir Ataques — intercepta todos os ataques enquanto viva
  if (skill.target === 'enemy') {
    var _defTeamPar = target.owner === 'p1' ? G.p1 : G.p2;
    var _parede = _defTeamPar.chars.find(function(c) { return c.id === 'parede_t2' && c.alive && c !== target; });
    if (_parede) {
      addLog('🧱 Restringir Ataques! ' + target.name + ' está intangível — ' + _parede.name + ' absorve o ataque!', 'info');
      floatStatus(_parede, '🧱 INTERCEDE!', '#a0c8ff');
      animIntercept(_parede);
      target = _parede;
    }
  }

  return target;
}
// ── ETAPA 2 — tickDefense ──
// Retorna { defCard, totalDef, ignoreArmor, dodged }
// dodged=true = esquiva total (Valete), interrompe resolveAttack
function tickDefense(attacker, skill, target, defCard, totalDmg) {
  // Derreter Armadura: impede carta de defesa e Valete (DEF base continua valendo)
  const hasMelt = target.statuses.find(s => s.id === 'melt');
  if (hasMelt) {
    addLog('🧪 Armadura Derretida! ' + target.name + ' não pode usar cartas de defesa!', 'dmg');
    defCard = null;
  }

  // Valete: esquiva completa
  if (defCard && defCard.val === 'J') {
    addLog(`🃏 Valete! ${target.name} esquivou completamente do ataque!`, 'info');
    floatStatus(target, 'J ESQUIVA!', '#80ff80');
    showAdvTag(target, '🃏 Esquiva!', '#80ff80');
    floatEffectCardUsed(target, defCard);
    return { defCard, totalDef: 0, ignoreArmor: false, dodged: true };
  }

  const ignoreArmor = skill.desc.includes('Ignora Armadura') || skill.desc.includes('Catastrófico') || !!skill._ignoreArmor;
  let totalDef = target.curDef;

  if (ignoreArmor) {
    totalDef = 0;
    if (defCard) addLog('🔴 Ignora Armadura: defesa ignorada!', 'dmg');
  } else if (defCard) {
    let dv = isSpecial(defCard) ? 0 : defCard.nv;
    if (!isSpecial(defCard) && defCard.suit !== 'joker' &&
      (defCard.suit === target.suit || !!target.statuses.find(function(s) { return s.id === 'analise_tech'; }))) {
      dv = Math.floor(dv * 1.5);
      addLog(`✨ Especialidade! ${target.name}: carta ${defCard.val}${SUITS[defCard.suit] ? SUITS[defCard.suit].sym : ''} vale ${dv} na defesa (+50%).`, 'info');
      showAdvTag(target, `✨ Def. +${Math.floor(defCard.nv * 0.5)}`, 'var(--gold)');
    }
    totalDef += dv;
    addLog(`🛡 ${target.name} defende com ${defCard.val} (DEF total: ${totalDef})`, 'info');
  }

  addLog('🔍 JUIZ (Defesa): ignoreArmor=' + ignoreArmor + ' totalDef=' + totalDef + (hasMelt ? ' [Armadura Derretida]' : ''), 'sys');

  // ── Sufixo 4 — da Barreira/do Escudo: defender com carta concede Escudo ──
  if (defCard && !ignoreArmor && target.owner === 'p1' && _equipLoaded) {
    var _shEd = _equipData[target.id];
    var _shItem = _shEd && _shEd.slot1 && _shEd.slot1._item;
    if (_shItem && _shItem.suffix === 's8_shield') {
      var shDv = isSpecial(defCard) ? 0 : defCard.nv;
      if (shDv > 0) {
        target.statuses = target.statuses.filter(function(s) { return s.id !== 'shield_suf'; });
        addSt(target, {id:'shield_suf', icon:'🛡️', label:'Escudo Barreira (' + shDv + ')', turns:1, val:shDv});
        floatStatus(target, '🛡️ Barreira +' + shDv + '!', '#80c0ff');
        addLog('🛡️ [Sufixo] Barreira: ' + target.name + ' ganhou Escudo ' + shDv + ' até o próximo turno!', 'heal');
      }
    }
  }

  // ── Artefato: Elmo do Sopro Gélido — defender com carta aplica Resfriamento no atacante ──
  if (defCard && !ignoreArmor && attacker.alive) {
    var _chillHasArt = false;
    // Jogador: checa equipamento
    if (target.owner === 'p1' && _equipLoaded) {
      _chillHasArt = _getCharArtefato(target.id) === 'art_elmo_sopro_gelido';
    }
    // Boss: checa artefato da batalha
    if (target.isBoss && window._survBossArtefato && window._survBossArtefato.id === 'art_elmo_sopro_gelido') {
      _chillHasArt = true;
    }
    if (_chillHasArt) {
      _spawnStatusFx(attacker, 'chill');
      addSt(attacker, {id:'chill', icon:'🧊', label:'Resfriamento', turns:2});
      attacker.curAtq = Math.max(0, attacker.curAtq - 1);
      floatStatus(attacker, '🧊 Sopro Gélido!', '#60c0e0');
      addLog('🧊 [Artefato] Elmo do Sopro Gélido: ' + attacker.name + ' recebeu Resfriamento!', 'dmg');
    }
  }

  return { defCard, totalDef, ignoreArmor, dodged: false };
}
// ── ETAPA 2 — tickDamage ──
// Retorna o dano final aplicado
function tickDamage(attacker, skill, atkCard, target, totalDef) {
  let pow = getPow(skill);
  let cval = isSpecial(atkCard) ? 0 : atkCard.nv;

  // Especialidade — naipe da carta = naipe do personagem → valor dobrado
  // Análise Tecnológica (Vyr'Thas): todas as cartas contam como especialidade
  var _isSpecialty = !isSpecial(atkCard) && atkCard.suit !== 'joker' && attacker.suit !== 'neutral' &&
    (atkCard.suit === attacker.suit || !!attacker.statuses.find(function(s) { return s.id === 'analise_tech'; }));
  if (_isSpecialty) {
    cval = atkCard.nv * 2;
    addLog(`✨ Especialidade! ${attacker.name}: carta ${atkCard.val}${SUITS[atkCard.suit] ? SUITS[atkCard.suit].sym : ''} vale ${cval} (dobrado).`, 'info');
    showAdvTag(attacker, `✨ Esp. +${atkCard.nv}`, 'var(--gold)');
  }

  // Aeryn: Eliminar — explora Exposto (×2 + remove status)
  if (attacker.id === 'pt_aer' && skill.id === 'eli2') {
    const temExposto = target.statuses.find(s => s.id === 'exposed');
    if (temExposto) {
      pow = pow * 2;
      target.statuses = target.statuses.filter(s => s.id !== 'exposed');
      target.curDef = target.def;
      addLog('⚔️ Eliminar EXPLORA Exposto! Dano dobrado (POW ' + pow + ') — Exposto removido!', 'dmg');
      floatStatus(attacker, '⚔️ ELIMINA!', '#e0e0ff');
      floatStatus(target, '⬇️ Exposto→', '#e0a020');
    }
  }

  // Crítico Alto
  if (skill.desc.includes('Crítico Alto') && Math.random() < 0.5) {
    pow *= 2;
    addLog(`💥 CRÍTICO! Poder dobrado!`, 'info');
    if (_vfxEnabled) { _animCritico(target, false); target._nextDmgIsCritico = true; }
  }

  // Espírito do Urso Polar: +3 poder por debuff ativo no alvo
  if (skill.id === 'tcz') {
    const DEBUFFS_TCZ = new Set(['burn','bleed','exposed','weak','frozen','stun','chill','melt','static','slow','rad','encantado','marcado','lento','amaciado']);
    const nDebuffs = target.statuses.filter(s => DEBUFFS_TCZ.has(s.id)).length;
    if (nDebuffs > 0) {
      pow += nDebuffs * 3;
      addLog(`🐻 Espírito do Urso Polar: +${nDebuffs * 3} POW (${nDebuffs} debuffs em ${target.name})!`, 'info');
      floatStatus(attacker, `🦕 +${nDebuffs * 3} POW`, '#6090ff');
    }
  }

  // Corte Gélido: flag para +10 após dano normal
  if (skill.id === 'lzaz' && target.alive) {
    attacker._lazAzulBonus = true;
  }

  // REI bonus
  let kingBonus = 0;
  if (attacker._kingBonus) { kingBonus = attacker._kingBonus; attacker._kingBonus = 0; }
  if (kingBonus > 0) addLog(`👑 Rei amplificou: +${kingBonus} de poder!`, 'info');

  let totalDmg = attacker.curAtq + pow + cval + kingBonus;

  // ══ SUIT ADVANTAGE ══
  if (attacker.suit !== 'neutral' && target.suit !== 'neutral' && skill.acao !== 'F' && skill.acao !== 'Rápida') {
    // ♠ Espadas → ♥ Copas — dano dobrado
    if (attacker.suit === 'spades' && target.suit === 'hearts') {
      totalDmg = Math.floor(totalDmg * 2);
      showAdvTag(attacker, '⚡ ♠→♥ ×2!', 'var(--spades)');
      showAdvTag(target, '⚡ Vantagem Espadas!', 'var(--spades)');
      addLog(`⚡ [NAIPE] Espadas→Copas: dano dobrado (${totalDmg})!`, 'info');
      slotFlashSuit(attacker, 'spades'); slotFlashSuit(target, 'spades');
      if (_vfxEnabled) { _animCritico(target, true); target._nextDmgIsSpades = true; }
      setTimeout(() => showSuitAdvFlash('♠', 'VANTAGEM ESPADAS', attacker.name + ' → ' + target.name + ' ×2 DANO', '#6080ff'), 800);
    }
    // ♥ Copas ↔ ♣ Paus
    if (attacker.suit === 'hearts' && target.suit === 'clubs') applyHeartsAdv(attacker, target);
    if (attacker.suit === 'clubs' && target.suit === 'hearts') applyHeartsAdv(target, attacker);
    // ♦ Ouro → ♠ Espadas — rodada extra atacante
    if (attacker.suit === 'diamonds' && target.suit === 'spades' && skill.acao !== 'F') {
      if (grantExtraTurn(attacker, 'Ouro→Espadas')) {
        showAdvTag(attacker, '♦ +Rodada Extra!', 'var(--diamonds)');
        showAdvTag(target, '♦ Vantagem Ouro!', 'var(--diamonds)');
        slotFlashSuit(attacker, 'diamonds'); slotFlashSuit(target, 'diamonds');
        setTimeout(() => showSuitAdvFlash('♦', 'VANTAGEM OURO', attacker.name + ' GANHA RODADA EXTRA!', '#e0a020'), 800);
      }
    }
    // ♠ Espadas → ♦ Ouro — rodada extra defensor
    if (attacker.suit === 'spades' && target.suit === 'diamonds' && skill.acao !== 'F') {
      if (target.alive && grantExtraTurn(target, 'Ouro←Espadas')) {
        showAdvTag(target, '♦ +Rodada Extra!', 'var(--diamonds)');
        showAdvTag(attacker, '♦ Reação Ouro!', 'var(--diamonds)');
        slotFlashSuit(target, 'diamonds');
        setTimeout(() => showSuitAdvFlash('♦', 'REAÇÃO OURO', target.name + ' GANHA RODADA EXTRA!', '#e0a020'), 800);
        addLog('♦ [NAIPE] ' + target.name + ' reage ao ataque de Espadas — Rodada Extra!', 'info');
      }
    }

    // ── JUIZ: vantagem de naipe ──
    var _jSuitExp = 'nenhuma';
    if (attacker.suit === 'spades' && target.suit === 'hearts') _jSuitExp = '♠→♥ dano dobrado';
    else if (attacker.suit === 'hearts' && target.suit === 'clubs') _jSuitExp = '♥→♣ ATQ/DEF dobrado';
    else if (attacker.suit === 'clubs' && target.suit === 'hearts') _jSuitExp = '♣←♥ Copas buffa';
    else if (attacker.suit === 'diamonds' && target.suit === 'spades') _jSuitExp = '♦→♠ rodada extra atacante';
    else if (attacker.suit === 'spades' && target.suit === 'diamonds') _jSuitExp = '♠→♦ rodada extra defensor';
    addLog('🔍 JUIZ (Naipe): ' + attacker.name + '(' + attacker.suit + ') → ' + target.name + '(' + target.suit + ') = ' + _jSuitExp, 'sys');
  }

  // Amaciado: dobra dano de ataques Cortantes
  if (skill.type === 'Cortante' && target.statuses.find(s => s.id === 'amaciado')) {
    totalDmg = Math.floor(totalDmg * 2);
    addLog('🥩 Amaciado! Dano Cortante dobrado: ' + totalDmg, 'dmg');
    showAdvTag(attacker, '🥩 ×2 Cortante!', '#cc6020');
  }

  // Investida Unicórnio (Lorien): EXPLORA Exposto e/ou Enfraquecido
  if (skill.id === 'uni' && attacker.id === 'lori') {
    const temExposto = target.statuses.find(s => s.id === 'exposed');
    const temEnfraqu = target.statuses.find(s => s.id === 'weak');
    if (temExposto || temEnfraqu) {
      let mult = 1;
      if (temExposto) {
        mult *= 2;
        target.curDef = Math.min(target.def, target.curDef * 2);
        target.statuses = target.statuses.filter(s => s.id !== 'exposed');
        addLog(`🦄 Unicórnio EXPLORA Exposto em ${target.name}! (×2)`, 'dmg');
        floatStatus(target, '🦄 Exposto!', '#e0a020');
      }
      if (temEnfraqu) {
        mult *= 2;
        target.curAtq = Math.min(target.atq, target.curAtq * 2);
        target.statuses = target.statuses.filter(s => s.id !== 'weak');
        addLog(`🦄 Unicórnio EXPLORA Enfraquecido em ${target.name}! (×2)`, 'dmg');
        floatStatus(target, '🦄 Enfraq!', '#c040c0');
      }
      totalDmg = Math.floor(totalDmg * mult);
      addLog(`🦄 Investida Unicórnio: dano ${mult}x = ${totalDmg}!`, 'dmg');
      showAdvTag(attacker, `🦄 ×${mult} Explora!`, '#d060ff');
    }
  }

  const final = Math.max(0, totalDmg - totalDef);

  // ── JUIZ: cálculo de dano ──
  var _judgeDmgParts = 'ATQ:' + attacker.curAtq + ' POW:' + pow + ' CARTA:' + cval + ' REI:' + kingBonus + ' = totalDmg:' + totalDmg + ' | totalDef:' + totalDef + ' | final:' + final;
  addLog('🔍 JUIZ (Dano): ' + _judgeDmgParts, 'sys');

  // Aplica dano
  addLog(attacker.name + ' → ' + target.name + ' (' + skill.name + '): ATQ' + attacker.curAtq + '+POW' + pow + '+CARTA' + cval + '=' + totalDmg + ' − DEF' + totalDef + ' = ' + final + ' dano', 'dmg');
  dmgChar(target, final, attacker);
  applyEffects(skill, target);
  floatDmg(target, final);

  // ── Espancamento Congelante (Troll): 50% de aplicar congelamento ──
  if (skill.id === 'troll_esp' && target.alive && Math.random() < 0.5) {
    _spawnStatusFx(target, 'frozen');
    addSt(target, {id:'frozen', icon:'❄️', label:'Congelado (2t)', turns:2});
    floatStatus(target, '❄️ Congelado!', '#80d0ff');
    addLog('❄️ Espancamento Congelante: ' + target.name + ' foi Congelado! (50% de perder turno por 2 turnos)', 'dmg');
  }

  // ── Passiva: Veneno Reação (Enxame de Vespas) — ao sofrer dano, aplica 1 stack de veneno no atacante ──
  if (target.alive && target.passive === 'veneno_reacao' && final > 0 && attacker.alive) {
    addSt(attacker, {id:'poison', icon:'☠️', label:'Veneno', stacks:1});
    floatStatus(attacker, '☠️ Veneno!', '#60c040');
    addLog('☠️ Veneno Reação: ' + target.name + ' envenenou ' + attacker.name + '! (+1 stack)', 'dmg');
  }

  // Corte Gélido: +10 dano fixo (ignora armadura) após dano normal
  if (attacker._lazAzulBonus) {
    attacker._lazAzulBonus = false;
    if (target.alive) {
      dmgChar(target, 10, attacker);
      floatDmg(target, 10);
      addLog(`💙 Corte Gélido: +10 dano extra (ignora armadura)!`, 'dmg');
    }
  }

  // Van Carl Voss: Tiro Decisivo — dobra dano se alvo tem Lento
  if (attacker.id === 'voss' && skill.id === 'web' && target.statuses.find(s => s.id === 'slow')) {
    addLog('🕸️ Tiro Decisivo EXPLORA Lento! Dano dobrado: +' + final + ' extra!', 'dmg');
    floatStatus(attacker, '🕸️ ×2!', '#4080ff');
    dmgChar(target, final, attacker);
    floatDmg(target, final);
  }

  // Sam: reset charge after firing Feixe
  if (skill._samusCharge !== undefined && attacker.id === 'sam') {
    attacker._charge = 0;
    addLog('🔋 Sam: cargas resetadas após disparo.', 'info');
    floatStatus(attacker, '⚡ 0/5', '#80d0ff');
    refreshIcons(attacker);
  }

  return final;
}
// ── ETAPA 2 — tickOnHit ──
function tickOnHit(attacker, skill, target) {
  // Kuro Isamu: Seiken Tsuki — aplica ou renova Marca no alvo
  if ((attacker.id === 'kuro' || attacker.id === 'kuro_ai') && skill.id === 'sho') {
    const jaTemMarca = target.statuses.find(s => s.id === 'marcado');
    addSt(target, {id: 'marcado', icon: '🎯', label: 'Marcado (2t)', turns: 2});
    if (jaTemMarca || skill._ryuShoExplode) {
      addLog('🎯 Seiken Tsuki: Marca RENOVADA em ' + target.name + ' (2t).', 'info');
    } else {
      addLog('🎯 Seiken Tsuki: Marca aplicada em ' + target.name + ' (2t).', 'info');
      floatStatus(target, '🎯 Marcado!', '#ff8800');
    }
  }

  // Kuro Isamu: Sanren Geri — consome Marca
  if ((attacker.id === 'kuro' || attacker.id === 'kuro_ai') && skill.id === 'tat' && skill._ryuTatExplorou) {
    target.statuses = target.statuses.filter(s => s.id !== 'marcado');
    addLog('🌀 Sanren Geri: Marca CONSUMIDA em ' + target.name + '!', 'info');
    floatStatus(target, '🌀 Marca!', '#cc44ff');
    floatStatus(attacker, '🌀 ×3 COMBO!', '#cc44ff');
  }

  // Kuro Isamu: Kohouken — consome todas as cargas de Concentração Marcial
  if ((attacker.id === 'kuro' || attacker.id === 'kuro_ai') && skill.id === 'had' && skill._ryuHadCargas !== undefined) {
    attacker._satsui = 0;
    addLog('🔥 Concentração Marcial consumida! (' + skill._ryuHadCargas + ' cargas → 0)', 'info');
    floatStatus(attacker, '🔥 Conc. 0/10', '#ff6600');
    refreshIcons(attacker);
  }

  addLog('🔍 JUIZ (OnHit): efeitos pós-dano aplicados para ' + attacker.name + ' → ' + target.name, 'sys');

  // ── Efeitos de Sufixo (Slot 1) ──
  if (attacker.owner === 'p1' && _equipLoaded) {
    var _sufEd = _equipData[attacker.id];
    var _sufItem = _sufEd && _sufEd.slot1 && _sufEd.slot1._item;
    var _sufId = _sufItem && _sufItem.suffix;
    if (_sufId && target.alive) {
      // Sufixo 1 — da Hemorragia/do Sangue: ao causar dano, dispara Hemorragia
      if (_sufId === 's8_hemor') {
        var bleedSt = target.statuses.find(function(s) { return s.id === 'bleed'; });
        if (bleedSt) {
          var hStacks = bleedSt.stacks || 1;
          var hDmg = 3 * hStacks;
          dmgChar(target, hDmg, attacker);
          floatDmg(target, hDmg);
          floatStatus(target, '🩸💥 Hemorragia!', '#aa0000');
          addLog('🩸💥 [Sufixo] Hemorragia: ' + hDmg + ' dano em ' + target.name + ' (' + hStacks + ' stack(s))!', 'dmg');
        }
      }
      // Sufixo 2 — da Drenagem Vital/do Vigor: alvo único cura 3
      if (_sufId === 's8_cure' && skill.target === 'enemy') {
        var cureAmt = 3;
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + cureAmt);
        floatHeal(attacker, cureAmt);
        addLog('💚 [Sufixo] Drenagem Vital: ' + attacker.name + ' curou ' + cureAmt + ' de vida!', 'heal');
      }
      // Sufixo 3 — do Enfraquecimento/da Ruína: todos os inimigos ficam Enfraquecidos
      if (_sufId === 's8_weak' && skill.target === 'all_enemy') {
        var _sufEnemies = (attacker.owner === 'p1' ? G.p2 : G.p1).chars.filter(function(c) { return c.alive; });
        _sufEnemies.forEach(function(e) {
          _spawnStatusFx(e, 'weak');
          addSt(e, {id:'weak', icon:'💢', label:'Enfraquecido', turns:2});
          floatStatus(e, '💢 Enfraquecido!', '#c040c0');
        });
        addLog('💢 [Sufixo] Ruína: todos os inimigos ficaram Enfraquecidos!', 'dmg');
      }
      // Sufixo 5 — do Sangramento/da Lâmina: alvo único recebe Sangramento
      if (_sufId === 's8_bleed' && skill.target === 'enemy') {
        _spawnStatusFx(target, 'bleed');
        addSt(target, {id:'bleed', icon:'🩸', label:'Sangramento', turns:2, stacks:1, stackMax:3});
        var _bleedEx = target.statuses.find(function(s) { return s.id === 'bleed'; });
        floatStatus(target, '🩸 Sangramento' + (_bleedEx && _bleedEx.stacks > 1 ? ' x' + _bleedEx.stacks : '!'), '#cc2020');
        addLog('🩸 [Sufixo] Lamina: ' + target.name + ' recebeu Sangramento!', 'dmg');
      }
    }
  }

  // ── Artefato: Luvas de Urso Polar — ao causar dano, aliado aleatório ganha Fortificado ──
  var _glovesHasArt = false;
  if (attacker.owner === 'p1' && _equipLoaded) {
    _glovesHasArt = _getCharArtefato(attacker.id) === 'art_luvas_urso_polar';
  }
  if (attacker.isBoss && window._survBossArtefato && window._survBossArtefato.id === 'art_luvas_urso_polar') {
    _glovesHasArt = true;
  }
  if (_glovesHasArt) {
    var _glovesOwner = attacker.owner === 'p1' ? G.p1 : G.p2;
    var _glovesTeam = _glovesOwner.chars.filter(function(c) { return c.alive; });
    if (_glovesTeam.length > 0) {
      var _glovesTarget = _glovesTeam[Math.floor(Math.random() * _glovesTeam.length)];
      if (!_glovesTarget.statuses.find(function(s) { return s.id === 'fort_def'; })) {
        _glovesTarget.curDef = Math.floor(_glovesTarget.curDef * 1.5);
      }
      addSt(_glovesTarget, {id:'fort_def', icon:'🛡️', label:'Fortificado', turns:2});
      floatStatus(_glovesTarget, '🛡️ Fortificado!', '#60a0e0');
      addLog('🧤 [Artefato] Luvas de Urso Polar: ' + _glovesTarget.name + ' ficou Fortificado (+50% DEF)!', 'heal');
    }
  }
}
// ── ETAPA 2.5 — tickFollowUps ──
async function tickFollowUps(attacker, skill, target, atkOwner) {
  await new Promise(r => setTimeout(r, 700));

  // ── sub-tick 1: tickJointAttack ──
  tickJointAttack(attacker, skill, target, atkOwner);

  // ── sub-tick 2: tickCounter ──
  // tickCounter — Tyren Roupa Vermelha
  if (target.id === 'tyre' && target.alive && target.statuses.find(s => s.id === 'outfit_vermelha')) {
    if (skill.acao !== 'Rápida' && skill.acao !== 'F') {
      addLog('🔴 Tyren Roupa Vermelha: deseja contra-atacar com Avanco Escudo?', 'info');
      addLog('🔍 JUIZ (Contra-ataque): Tyren Roupa Vermelha → contra-ataca ' + attacker.name, 'sys');
      slotFlash(target, 'counter');
      showVermelhaPainel(target, attacker);
    }
  }

  // tickCounter — ♣ Paus: Ouro ataca Paus → Furtivo + contra-ataque
  if (target.alive && target.suit === 'clubs' && attacker.suit === 'diamonds' && skill.acao !== 'F' && skill.acao !== 'Rápida') {
    if (!target.statuses.find(s => s.id === 'clubs_furtivo')) {
      addSt(target, {id: 'clubs_furtivo', icon: '🌿', label: 'Paus: Furtivo (2t)', turns: 2});
      showAdvTag(target, '♣ Furtivo 2t!', 'var(--clubs)');
      addLog('♣ [NAIPE] ' + target.name + ' ficou Furtivo por 2 rodadas!', 'info');
    }
    const targetOwner = target.owner === 'p1' ? 'p1' : 'p2';
    G._pendingClubsAtk = {attacker: target, target: attacker, atkOwner: targetOwner, isCounter: true, isAllEnemy: false};
    slotFlash(target, 'clubs');
    showAdvTag(target, '♣ Contra-ataque!', 'var(--clubs)');
    addLog('♣ [NAIPE] ' + target.name + ' vai contra-atacar ' + attacker.name + ' com 1ª habilidade!', 'info');
  }

  // tickCounter — ♣ Paus com Furtivo ativo → contra-ataca qualquer atacante
  if (target.alive && target.suit === 'clubs' && attacker.suit !== 'diamonds' && skill.acao !== 'F' && skill.acao !== 'Rápida') {
    if (target.statuses.find(s => s.id === 'clubs_furtivo') && !G._pendingClubsAtk) {
      const targetOwner = target.owner === 'p1' ? 'p1' : 'p2';
      G._pendingClubsAtk = {attacker: target, target: attacker, atkOwner: targetOwner, isCounter: true, isAllEnemy: false};
      slotFlash(target, 'clubs');
      showAdvTag(target, '♣ Contra-ataque Furtivo!', 'var(--clubs)');
      addLog('♣ [NAIPE] ' + target.name + ' está Furtivo — contra-ataca ' + attacker.name + '!', 'info');
    }
  }

  // ♣ Paus follow-up panel
  if (G._pendingClubsAtk && G._pendingClubsAtk.attacker === attacker) {
    const fu = G._pendingClubsAtk;
    G._pendingClubsAtk = null;
    if (fu.target.alive) showClubsFollowUp(fu);
  }

  // tickCounter — Kael Vorn: Contra-Ataque de Fúria
  if (target.id === 'kael' && target.alive && skill.acao !== 'F' &&
      target.statuses.find(s => s.id === 'furia') &&
      attacker.statuses.find(s => s.id === 'bleed')) {
    const furSkill = target.skills.find(s => s.id === 'fur');
    if (furSkill && (target.cooldowns[furSkill.id] || 0) === 0) {
      if (!judgeCheck('counter_start', {who: target.name, target: attacker.name, skill: furSkill.name, owner: target.owner})) return;
      const caDmg = Math.max(0, target.curAtq + furSkill.power - attacker.curDef);
      addLog(`😡 Kael Vorn: Contra-Ataque de Fúria! ${attacker.name} tem Sangramento → ${caDmg} dano (sem carta)!`, 'dmg');
      floatStatus(target, '😡 CONTRA-ATAQUE!', '#ff4040');
      slotFlash(target, 'counter');
      dmgChar(attacker, caDmg, target);
      floatDmg(attacker, caDmg);
      judgeCheck('action_end');
      render();
    }
  }

  // tickCounter — Nyxar: Máscara Feliz (aliado atacado → Dee contra-ataca)
  if (!skill._deeMascara && target.alive && atkOwner) {
    const deeOwner = target.owner;
    const dee = G[deeOwner]?.chars.find(c => c.id === 'nyxa' && c.alive && c !== target);
    const masFeliz = dee?.statuses.find(s => s.id === 'masc_feliz');
    if (dee && masFeliz && skill.acao !== 'F') {
      const dadSk = dee.skills.find(s => s.id === 'dad');
      if (dadSk && (dee.cooldowns[dadSk.id] || 0) === 0) {
        const fakeCard = {suit: 'neutral', val: '—', nv: 0};
        addLog(`😊 Máscara Feliz! Nyxar contra-ataca ${attacker.name}!`, 'info');
        addLog('🔍 JUIZ (Contra-ataque): Nyxar Máscara Feliz → contra-ataca ' + attacker.name + ' (aliado ' + target.name + ' foi atacado)', 'sys');
        if (!judgeCheck('counter_start', {who: dee.name, target: attacker.name, skill: dadSk.name, owner: deeOwner})) return;
        floatStatus(dee, '😊 CONTRA!', 'var(--gold)');
        slotFlash(dee, 'counter');
        resolveAttack(dee, {...dadSk, _deeMascara: true}, fakeCard, attacker, null, deeOwner);
      }
    }
  }

  // tickCounter — Aeryn: Patrulheiro de Combate 2ª condição
  if (!skill._pt_aerContra && skill.acao !== 'F' && atkOwner) {
    const defOwner = atkOwner === 'p1' ? 'p2' : 'p1';
    const pt_aerC = G[defOwner].chars.find(c => c.id === 'pt_aer' && c.alive);
    if (pt_aerC && pt_aerC !== target) {
      const patrulheirosAliados2 = G[defOwner].chars.filter(c => c !== pt_aerC && c.alive && ['pt_cae','pt_elo','pt_zar','pt_var','pt_tha'].includes(c.id));
      if (patrulheirosAliados2.length >= 2 && Math.random() < 0.5) {
        const eli2sk = pt_aerC.skills.find(s => s.id === 'eli2');
        if (eli2sk) {
          const fakeCard = {suit: 'neutral', val: '—', nv: 0};
          addLog('🤍 Patrulheiro de Combate! Aeryn contra-ataca ' + attacker.name + ' (2+ Patrulheiros aliados)!', 'info');
          if (!judgeCheck('counter_start', {who: pt_aerC.name, target: attacker.name, skill: eli2sk.name, owner: defOwner})) return;
          floatStatus(pt_aerC, '🤍 CONTRA!', '#e0e0ff');
          slotFlash(pt_aerC, 'patrulheiro');
          animCounterMove(pt_aerC, attacker).then(() => {
            resolveAttack(pt_aerC, {...eli2sk, _pt_aerContra: true}, fakeCard, attacker, null, defOwner);
            judgeCheck('action_end');
            render();
          });
        }
      }
    }
  }

  // ── sub-tick 4: tickQuickAction ──
  if (skill.acao === 'Rápida') {
    addLog('🔍 JUIZ (tickQuickAction): ' + attacker.name + ' usou Ação Rápida — entregando para 1.5.', 'sys');
    if (atkOwner === 'p1') {
      const charIdx = G.p1.chars.indexOf(attacker);
      afterQuickAction(attacker, charIdx);
    }
  }

  // ── sub-tick 5: tickExtraRound ──
  if (attacker.extraTurnUsed) {
    const extraEntry = G.order[G.orderIdx + 1];
    if (extraEntry && extraEntry.ch === attacker && extraEntry.extra) {
      addLog('🔍 JUIZ (tickExtraRound): ' + attacker.name + ' tem Rodada Extra na fila — será entregue na 1.5 no próximo slot.', 'sys');
    }
  }

  addLog('🔍 JUIZ (FollowUps): fim da etapa 2.5 para ' + attacker.name, 'sys');

  await new Promise(r => setTimeout(r, 500));
}
function tickJointAttack(attacker, skill, target, atkOwner) {
  // Nyxar: Máscara Triste (aliado ataca → Dee ataca junto)
  if (!skill._deeMascara && target && target.alive && atkOwner) {
    const dee = G[atkOwner]?.chars.find(c => c.id === 'nyxa' && c.alive && c !== attacker);
    const masTriste = dee?.statuses.find(s => s.id === 'masc_triste');
    if (dee && masTriste && skill.acao !== 'F') {
      if (dee._jointAttackUsed) {
        addLog('🔍 JUIZ (tickJointAttack): Nyxar Máscara Triste — ataque conjunto já usado nesta rodada. Bloqueado.', 'sys');
      } else {
        const dadSk = dee.skills.find(s => s.id === 'dad');
        if (dadSk && (dee.cooldowns[dadSk.id] || 0) === 0) {
          const fakeCard = {suit: 'neutral', val: '—', nv: 0};
          const isArea = skill.target === 'all_enemy';
          const alvos = isArea
            ? (atkOwner === 'p1' ? G.p2.chars.filter(c => c.alive) : G.p1.chars.filter(c => c.alive))
            : [target];

          dee._jointAttackUsed = true;
          addLog('🔍 JUIZ (tickJointAttack): Nyxar Máscara Triste → ' + (isArea ? 'área (' + alvos.length + ' alvos)' : 'alvo único: ' + target.name), 'sys');

          floatStatus(dee, '😢 JUNTO!', '#8080ff');
          floatJointAttack(dee, '😢 JUNTO!', '#8080ff');
          slotFlash(dee, 'together');

          let chain = Promise.resolve();
          for (const alvo of alvos) {
            chain = chain.then(() => {
              if (!alvo.alive) return;
              addLog(`😢 Máscara Triste! Nyxar ataca junto: ${alvo.name}!`, 'info');
              addLog('🔍 JUIZ (tickJointAttack): Nyxar Máscara Triste → resolve alvo único: ' + alvo.name, 'sys');
              if (!judgeCheck('joint_start', {who: dee.name, target: alvo.name, skill: dadSk.name, owner: atkOwner})) return;
              return animCounterMove(dee, alvo).then(() => {
                resolveAttack(dee, {...dadSk, _deeMascara: true}, fakeCard, alvo, null, atkOwner);
                judgeCheck('action_end');
                render();
              });
            });
          }
        }
      }
    }
  }

  // Aeryn: Patrulheiro de Combate 1ª condição (aliado Patrulheiro ataca → Aeryn ataca junto)
  if (!skill._pt_aerJunto && attacker.id !== 'pt_aer' && atkOwner) {
    const pt_aerJ = G[atkOwner]?.chars.find(c => c.id === 'pt_aer' && c.alive);
    if (pt_aerJ) {
      const patrulheirosAliados = G[atkOwner].chars.filter(c => c !== pt_aerJ && c.alive && ['pt_cae','pt_elo','pt_zar','pt_var','pt_tha'].includes(c.id));
      const attackerEPatrulheiro = ['pt_cae','pt_elo','pt_zar','pt_var','pt_tha'].includes(attacker.id);
      if (attackerEPatrulheiro && patrulheirosAliados.length >= 1 && Math.random() < 0.5) {
        if (pt_aerJ._jointAttackUsed) {
          addLog('🔍 JUIZ (tickJointAttack): Aeryn Patrulheiro de Combate — ataque conjunto já usado nesta rodada. Bloqueado.', 'sys');
        } else {
          const eli2sk = pt_aerJ.skills.find(s => s.id === 'eli2');
          if (eli2sk) {
            const fakeCard = {suit: 'neutral', val: '—', nv: 0};
            const isArea = skill.target === 'all_enemy';
            const alvos = isArea
              ? (atkOwner === 'p1' ? G.p2.chars.filter(c => c.alive) : G.p1.chars.filter(c => c.alive))
              : [target];

            pt_aerJ._jointAttackUsed = true;
            addLog('🔍 JUIZ (tickJointAttack): Aeryn Patrulheiro de Combate → ' + (isArea ? 'área (' + alvos.length + ' alvos)' : 'alvo único: ' + target.name), 'sys');

            floatStatus(pt_aerJ, '🤍 JUNTO!', '#e0e0ff');
            floatJointAttack(pt_aerJ, '🤍 JUNTO!', '#e0e0ff');
            slotFlash(pt_aerJ, 'patrulheiro');

            let chain = Promise.resolve();
            for (const alvo of alvos) {
              chain = chain.then(() => {
                if (!alvo.alive) return;
                addLog('🤍 Patrulheiro de Combate! Aeryn ataca junto: ' + alvo.name + '!', 'info');
                addLog('🔍 JUIZ (tickJointAttack): Aeryn → resolve alvo único: ' + alvo.name, 'sys');
                if (!judgeCheck('joint_start', {who: pt_aerJ.name, target: alvo.name, skill: eli2sk.name, owner: atkOwner})) return;
                return animCounterMove(pt_aerJ, alvo).then(() => {
                  resolveAttack(pt_aerJ, {...eli2sk, _pt_aerJunto: true}, fakeCard, alvo, null, atkOwner);
                  judgeCheck('action_end');
                  render();
                });
              });
            }
          }
        }
      }
    }
  }
}
// ── ETAPA 2 — resolveAttack (orquestrador) ──
async function resolveAttack(attacker, skill, atkCard, target, defCard, atkOwner) {
  // tickTarget
  const _tgt = tickTarget(attacker, skill, target);
  skill  = _tgt.skill;
  target = _tgt.target;

  // tickIntercept
  target = tickIntercept(attacker, skill, target);

  // tickDefense
  const _def = tickDefense(attacker, skill, target, defCard, 0);

  // ── Passiva: Ódio Congelante (Yeti Glacial) ──
  // Quando Yeti usa Valete, absorve o dano e congela o atacante em vez de esquivar
  if (_def.dodged && target.id === 'boss_t2') {
    addLog('❄️ Ódio Congelante! O Yeti absorve o golpe e reage!', 'info');
    tickDamage(attacker, skill, atkCard, target, 0);
    if (attacker.alive) {
      _spawnStatusFx(attacker, 'frozen');
      addSt(attacker, {id:'frozen', icon:'❄️', label:'Congelado (2t)', turns:2});
      floatStatus(attacker, '❄️ Congelado!', '#80d0ff');
      addLog('❄️ ' + attacker.name + ' foi Congelado pelo Ódio Congelante!', 'dmg');
    }
    render();
    return;
  }
  if (_def.dodged) return; // esquiva total — encerra aqui
  defCard = _def.defCard;

  // tickDamage
  tickDamage(attacker, skill, atkCard, target, _def.totalDef);

  // tickOnHit
  if (target.alive) tickOnHit(attacker, skill, target);

  // tickFollowUps (Etapa 2.5)
  await tickFollowUps(attacker, skill, target, atkOwner);
}
var _STATUS_FX = {
  burn:     { color: '#ff6020', color2: '#ffaa20', count: 10, icon: '🔥' },
  bleed:    { color: '#cc2020', color2: '#ff4040', count: 8,  icon: '🩸' },
  frozen:   { color: '#80d0ff', color2: '#ffffff', count: 12, icon: '❄️' },
  stun:     { color: '#f0e060', color2: '#ffffff', count: 8,  icon: '💫' },
  chill:    { color: '#60c0e0', color2: '#c0f0ff', count: 8,  icon: '🧊' },
  static:   { color: '#f0f060', color2: '#ffffff', count: 10, icon: '⚡' },
  rad:      { color: '#a0e040', color2: '#e0ff80', count: 10, icon: '☢️' },
  slow:     { color: '#80a060', color2: '#c0d0a0', count: 6,  icon: '🐢' },
  exposed:  { color: '#e0a020', color2: '#ffd060', count: 8,  icon: '⬇️' },
  weak:     { color: '#c040c0', color2: '#e080e0', count: 8,  icon: '💢' },
  melt:     { color: '#80ff80', color2: '#c0ffc0', count: 8,  icon: '🧪' },
  amaciado: { color: '#cc6020', color2: '#ffaa60', count: 8,  icon: '🥩' },
  encantado:{ color: '#b060e0', color2: '#e0a0ff', count: 10, icon: '🎭' },
};

function _spawnStatusFx(ch, statusId) {
  if (!_vfxEnabled) return;
  var cfg = _STATUS_FX[statusId];
  if (!cfg) return;
  var sl = [...document.querySelectorAll('.slot')]
    .find(s => s.querySelector('[data-char-name]')?.dataset.charName === ch.name);
  if (!sl) return;
  var r = sl.getBoundingClientRect();
  var cx = r.left + r.width / 2;
  var cy = r.top  + r.height / 2;
  _spawnVfxParticles(cx, cy, cfg.color, cfg.count);
  setTimeout(function() {
    _spawnVfxParticles(cx, cy, cfg.color2, Math.floor(cfg.count * 0.5));
  }, 100);
  var layer = document.getElementById('vfx-layer');
  if (layer) {
    var ico = document.createElement('div');
    ico.style.cssText = 'position:absolute;left:'+cx+'px;top:'+(cy-20)+'px;font-size:24px;transform:translate(-50%,-50%) scale(0);pointer-events:none;z-index:310;animation:impact-icon-pop 0.4s ease forwards';
    ico.textContent = cfg.icon;
    layer.appendChild(ico);
    setTimeout(function(){ ico.remove(); }, 450);
  }
}
function applyEffects(skill, target) {
  const d=skill.desc.toLowerCase();
  if(d.includes('queimadura')) {
    judgeCheck('passive_start', { who: target.name, passive: 'applyEffects: Queimadura', charObj: target, extra: false, noExtra: false });
    _spawnStatusFx(target,'burn');
    addSt(target,{id:'burn',icon:'🔥',label:'Queimadura',turns:2});
    floatStatus(target,'🔥 Queimadura!','#ff6020');
    judgeCheck('passive_result', { who: target.name, passive: 'applyEffects: Queimadura', result: 'Queimadura aplicada (2t) — dano: 10/turno' });
  }
  if(d.includes('sangramento')) {
    judgeCheck('passive_start', { who: target.name, passive: 'applyEffects: Sangramento', charObj: target, extra: false, noExtra: false });
    _spawnStatusFx(target,'bleed');
    addSt(target,{id:'bleed',icon:'🩸',label:'Sangramento',turns:2,stacks:1,stackMax:3});
    const ex=target.statuses.find(s=>s.id==='bleed');
    floatStatus(target,'🩸 Sangramento'+(ex&&ex.stacks>1?' x'+ex.stacks:'!'),'#cc2020');
    judgeCheck('passive_result', { who: target.name, passive: 'applyEffects: Sangramento', result: 'Sangramento aplicado (2t) stacks:'+(ex?ex.stacks:1)+'/3 — dano: '+(3*(ex?ex.stacks:1))+'/turno' });
  }
  if(d.includes('amaciado')) {
    judgeCheck('passive_start', { who: target.name, passive: 'applyEffects: Amaciado', charObj: target, extra: false, noExtra: false });
    _spawnStatusFx(target,'amaciado');
    addSt(target,{id:'amaciado',icon:'🥩',label:'Amaciado: Cortante ×2 (2t)',turns:2});
    floatStatus(target,'🥩 Amaciado!','#cc6020');
    addLog('🥩 '+target.name+' está Amaciado! Ataques Cortantes causam o dobro por 2 turnos.','dmg');
    judgeCheck('passive_result', { who: target.name, passive: 'applyEffects: Amaciado', result: 'Amaciado aplicado (2t) — Cortante x2' });
  }
  if(d.includes('exposto')) {
    const _exExp = target.statuses.find(s=>s.id==='exposed');
    judgeCheck('passive_start', { who: target.name, passive: 'applyEffects: Exposto', charObj: target, extra: false, noExtra: false });
    _spawnStatusFx(target,'exposed');
    addSt(target,{id:'exposed',icon:'⬇️',label:'Exposto',turns:2});
    if(!_exExp) {
      const lost=target.curDef-Math.max(0,Math.ceil(target.curDef*0.5));
      target.curDef=Math.max(0,Math.ceil(target.curDef*0.5));
      floatArmor(target,lost,true);
    }
    floatStatus(target,'⬇️ Exposto!','#e0a020');
    judgeCheck('passive_result', { who: target.name, passive: 'applyEffects: Exposto', result: 'Exposto aplicado (2t) — DEF atual: '+target.curDef+(_exExp?' (já estava exposto, sem nova redução)':' (DEF reduzida 50%)') });
  }
  if(d.includes('enfraquecido')) {
    const _exWk = target.statuses.find(s=>s.id==='weak');
    judgeCheck('passive_start', { who: target.name, passive: 'applyEffects: Enfraquecido', charObj: target, extra: false, noExtra: false });
    _spawnStatusFx(target,'weak');
    addSt(target,{id:'weak',icon:'💢',label:'Enfraquecido',turns:2});
    if(!_exWk) {
      target.curAtq=Math.max(0,Math.ceil(target.curAtq*0.5));
    }
    floatStatus(target,'💢 Enfraquecido!','#c040c0');
    judgeCheck('passive_result', { who: target.name, passive: 'applyEffects: Enfraquecido', result: 'Enfraquecido aplicado (2t) — ATQ atual: '+target.curAtq+(_exWk?' (já estava enfraquecido, sem nova redução)':' (ATQ reduzido 50%)') });
  }
  if(d.includes('encantado')) {
    judgeCheck('passive_start', { who: target.name, passive: 'applyEffects: Encantado', charObj: target, extra: false, noExtra: false });
    _spawnStatusFx(target,'encantado');
    addSt(target,{id:'encantado',icon:'🎭',label:'Encantado: 50% ataca aliado (2t)',turns:2});
    floatStatus(target,'🎭 Encantado!','#b060e0');
    addLog('🎭 '+target.name+' está Encantado!','dmg');
    judgeCheck('passive_result', { who: target.name, passive: 'applyEffects: Encantado', result: 'Encantado aplicado (2t) — 50% chance de atacar aliado' });
  }
  if((d.includes('congela')&&Math.random()<0.5)){
    judgeCheck('passive_start', { who: target.name, passive: 'applyEffects: Congelado', charObj: target, extra: false, noExtra: false });
    _spawnStatusFx(target,'frozen');
    addSt(target,{id:'frozen',icon:'❄️',label:'Congelado (2t)',turns:2});
    floatStatus(target,'❄️ Congelado!','#80d0ff');
    addLog('❄️ '+target.name+' foi Congelado! (50% de perder turno por 2 turnos)','dmg');
    judgeCheck('passive_result', { who: target.name, passive: 'applyEffects: Congelado', result: 'Congelado aplicado (2t) — 50% perde turno' });
  }
  if(d.includes('atordoamento')&&Math.random()<0.5){
    judgeCheck('passive_start', { who: target.name, passive: 'applyEffects: Atordoado', charObj: target, extra: false, noExtra: false });
    _spawnStatusFx(target,'stun');
    addSt(target,{id:'stun',icon:'💫',label:'Atordoado (2t)',turns:2});
    floatStatus(target,'💫 Atordoado!','#f0e060');
    addLog('💫 '+target.name+' foi Atordoado! (50% de perder turno por 2 turnos)','dmg');
    judgeCheck('passive_result', { who: target.name, passive: 'applyEffects: Atordoado', result: 'Atordoado aplicado (2t) — 50% perde turno' });
  }
  if(d.includes('resfriamento')){
    const _exChill = target.statuses.find(s=>s.id==='chill');
    judgeCheck('passive_start', { who: target.name, passive: 'applyEffects: Resfriamento', charObj: target, extra: false, noExtra: false });
    _spawnStatusFx(target,'chill');
    addSt(target,{id:'chill',icon:'🧊',label:'Resfriamento',turns:2});
    if(!_exChill) {
      target.curAtq=Math.max(0,target.curAtq-1);
      floatStatus(target,'🧊 -1 ATQ!','#60c0e0');
    }
    floatStatus(target,'🧊 Resfriamento!','#60c0e0');
    judgeCheck('passive_result', { who: target.name, passive: 'applyEffects: Resfriamento', result: 'Resfriamento aplicado (2t) — ATQ atual: '+target.curAtq+(_exChill?' (já estava resfriado, sem nova redução)':' (-1 ATQ aplicado)') });
  }
  if(d.includes('derreter armadura')){
    judgeCheck('passive_start', { who: target.name, passive: 'applyEffects: Derreter Armadura', charObj: target, extra: false, noExtra: false });
    _spawnStatusFx(target,'melt');
    addSt(target,{id:'melt',icon:'🧪',label:'Armadura Derretida',turns:1});
    floatStatus(target,'🧪 Armadura Derretida!','#80ff80');
    judgeCheck('passive_result', { who: target.name, passive: 'applyEffects: Derreter Armadura', result: 'Armadura Derretida aplicada (1t)' });
  }
  if(d.includes('estática')){
    judgeCheck('passive_start', { who: target.name, passive: 'applyEffects: Estática', charObj: target, extra: false, noExtra: false });
    _spawnStatusFx(target,'static');
    addSt(target,{id:'static',icon:'⚡',label:'Estática',turns:2});
    floatStatus(target,'⚡ Estática!','#f0f060');
    judgeCheck('passive_result', { who: target.name, passive: 'applyEffects: Estática', result: 'Estática aplicada (2t) — dano: 5/turno' });
  }
  if(d.includes('lento')){
    if(!target.statuses.find(s=>s.id==='slow')){
      judgeCheck('passive_start', { who: target.name, passive: 'applyEffects: Lento', charObj: target, extra: false, noExtra: false });
      _spawnStatusFx(target,'slow');
      addSt(target,{id:'slow',icon:'🐢',label:'Lento',turns:2});
      floatStatus(target,'🐢 Lento!','#80a060');
      addLog('🐢 '+target.name+' ficou Lento! Recargas N viram L por 2 turnos.','info');
      judgeCheck('passive_result', { who: target.name, passive: 'applyEffects: Lento', result: 'Lento aplicado (2t) — recargas N→L' });
    }
  }
  if(d.includes('radiação')){
    judgeCheck('passive_start', { who: target.name, passive: 'applyEffects: Radiação', charObj: target, extra: false, noExtra: false });
    _spawnStatusFx(target,'rad');
    addSt(target,{id:'rad',icon:'☢️',label:'Radiação',turns:2,stacks:1,stackMax:4});
    const ex=target.statuses.find(s=>s.id==='rad');
    floatStatus(target,'☢️ Radiação'+(ex&&ex.stacks>1?' x'+ex.stacks:'!'),'#a0e040');
    judgeCheck('passive_result', { who: target.name, passive: 'applyEffects: Radiação', result: 'Radiação aplicada (2t) stacks:'+(ex?ex.stacks:1)+'/4 — dano: '+(4*(ex?ex.stacks:1))+'/turno' });
  }
  if(d.includes('envenenamento')){
    addSt(target,{id:'poison',icon:'☠️',label:'Veneno',stacks:1});
    const exP=target.statuses.find(s=>s.id==='poison');
    floatStatus(target,'☠️ Veneno'+(exP&&exP.stacks>1?' x'+exP.stacks:'!'),'#60c040');
    addLog('☠️ '+target.name+' foi Envenenado! ('+(exP?exP.stacks:1)+' stack(s))','dmg');
  }
  if(d.includes('hemorragia')){
    const _hemorOwner = target.owner;
    const _hemorEnemySide = (_hemorOwner === 'p1') ? G.p1 : G.p2;
    const _hemorTargets = _hemorEnemySide.chars.filter(function(c){ return c.alive; });
    let _hemorAny = false;
    _hemorTargets.forEach(function(e){
      const bleedSt = e.statuses.find(function(s){ return s.id==='bleed'; });
      if(!bleedSt) return;
      const hDmg = 3 * (bleedSt.stacks || 1);
      dmgChar(e, hDmg);
      floatDmg(e, hDmg);
      floatStatus(e,'🩸💥 Hemorragia!','#aa0000');
      addLog('🩸💥 Hemorragia: tick de Sangramento em '+e.name+' — '+hDmg+' dano ('+(bleedSt.stacks||1)+' stack(s))! Sangramento mantido.','dmg');
      _hemorAny = true;
    });
    if(!_hemorAny) addLog('🩸 Hemorragia: nenhum inimigo com Sangramento ativo.','info');
  }
}
// ── ETAPA 2 — tickApplyEffect ──
function tickApplyEffect(attacker, skill, target) {
  addLog(attacker.name + ' usa ' + skill.name + ' em ' + target.name + '!', 'info');
  applyEffects(skill, target);
  addLog('🔍 JUIZ (ApplyEffect): ' + attacker.name + ' → ' + target.name + ' — efeitos de ' + skill.name + ' aplicados.', 'sys');
}

// ── ETAPA 2 — tickDuration ──
function tickDuration(skill, target) {
  addLog('🔍 JUIZ (Duration): duração dos efeitos de ' + skill.name + ' em ' + target.name + ' registrada.', 'sys');
}

// ── ETAPA 2 — tickEffectLog ──
function tickEffectLog(attacker, skill, target) {
  addLog('🔍 JUIZ (EffectLog): ' + attacker.name + ' → ' + target.name + ' (' + skill.name + ') — efeito puro concluído.', 'sys');
}

// ── ETAPA 2 — resolveEffect (orquestrador) ──
async function resolveEffect(attacker, skill, atkCard, target, defCard, atkOwner) {
  const _tgt = tickTarget(attacker, skill, target);
  skill  = _tgt.skill;
  target = _tgt.target;

  if (skill.target === 'enemy') {
    target = tickIntercept(attacker, skill, target);
  }

  tickApplyEffect(attacker, skill, target);
  tickDuration(skill, target);
  tickEffectLog(attacker, skill, target);

  await tickFollowUps(attacker, skill, target, atkOwner);
}

// ── ETAPA 2 — tickMainAction ──
function tickMainAction(attacker, skill, atkCard, target, defCard, atkOwner) {
  const isPureEffect = getPow(skill) === 0 && (skill.type === 'Encanto' || skill.type === 'Melhoria' || skill.type === 'Suporte');
  addLog('🔍 JUIZ (MainAction): ' + attacker.name + ' — ' + skill.name + ' → ' + (isPureEffect ? 'resolveEffect' : 'resolveAttack'), 'sys');
  if (isPureEffect) {
    resolveEffect(attacker, skill, atkCard, target, defCard, atkOwner);
  } else {
    resolveAttack(attacker, skill, atkCard, target, defCard, atkOwner);
  }
}
function addSt(ch,st) {
  const ex = ch.statuses.find(s=>s.id===st.id);
  if(ex) {
    if(st.turns !== undefined) ex.turns = st.turns;
    if(st.stacks !== undefined && ex.stacks !== undefined) {
      if(st.stackMax !== undefined) {
        if(ex.stacks < st.stackMax) ex.stacks++;
      } else {
        ex.stacks++;
      }
    }
  } else {
    ch.statuses.push(st);
  }
  renderCharacterStatusIcons(ch);
  if(_charDetailOpen && _charDetailOpenId === ch.id) renderStatusPopup(ch);
}
// ===================== TURN FLOW =====================
// ===================== TURN BANNER =====================
function showTurnBanner(turnNum) {
  return new Promise(resolve => {
    const banner  = document.getElementById('turn-banner');
    const textEl  = document.getElementById('tb-text');
    const wm      = document.getElementById('turn-watermark');

    textEl.textContent = `TURNO  ${turnNum}`;
    wm.classList.remove('show');
    wm.textContent = `— TURNO ${turnNum} —`;

    banner.className = '';
    banner.style.opacity = '1';

    requestAnimationFrame(() => {
      banner.classList.add('active');

      const holdTime = 520;
      const t1 = setTimeout(() => {
        banner.classList.remove('active');
        banner.classList.add('out');
        wm.classList.add('show');

        const t2 = setTimeout(() => {
          banner.className = '';
          banner.style.opacity = '0';
          resolve();
        }, 300);
      }, holdTime);
    });
  });
}

    
