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
    if (_bp2) { _bp2.s
    
