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

// Animacao de ataque: idle -> atk1 (500ms) -> atk2 (600ms) -> idle (400ms) = ~2s total
function animSpriteAttack(ch) {
  return new Promise(resolve => {
    if (!hasCharSprite(ch.id) || !SPRITE_POSES[ch.id] || !SPRITE_POSES[ch.id].atk1) {
      resolve(); return;
    }
    // Fase 1: idle -> atk1 (preparar arma — 500ms)
    _swapSpritePose(ch, 'atk1');
    setTimeout(() => {
      // Fase 2: atk1 -> atk2 (disparo — 600ms)
      if (SPRITE_POSES[ch.id].atk2) {
        _swapSpritePose(ch, 'atk2');
      }
      setTimeout(() => {
        // Fase 3: atk2 -> recarga (voltando — 500ms)
        if (SPRITE_POSES[ch.id].recarga) {
          _swapSpritePose(ch, 'recarga');
        }
        setTimeout(() => {
          // Fase 4: recarga -> idle (400ms)
          _swapSpritePose(ch, _getIdlePose(ch));
          setTimeout(() => resolve(), 400);
        }, 500);
      }, 600);
    }, 500);
  });
}

// Animacao de hit: idle -> hit (600ms) -> idle (200ms) = ~0.8s total
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
      if (p !== currentPose) {
        _swapSpritePose(ch, currentPose);
      }
    }
  });
}

// ===================== SKILL NORMALIZER =====================
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

// ===================== VERSION CONTROL =====================
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
    firstTurn: true,    // blocks Turno:L skills on first turn
    quickAction: false, // set true after Ação Rápida used
    extraTurnUsed: false, // strictly 1 extra turn per natural turn, any source
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
  // Spider: nenhum estado inicial especial necessário

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
    pendingSkill:null, pendingCardIdx:null, pendingAtkCard:null, pendingAttack:null, pendingDefCardIdx:null, _clubsFollowUp:null, _pendingClubsAtk:null, _pendingClubsFu:null, _pendingClubsCardIdx:null, _pendingVermelha:null, _pendingVermCard:null, _clubsAfterQuick:null, _areaDefQueue:[], _areaDefContext:null, _reactDelay:0, pendingExtraCards:[], pendingExtraCardsForTarget:[], pendingAllEnemyTargets:[],
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
  tp1.querySelectorAll('.bi-char').forEach(el => { el.className='bi-char'; });
  tp2.querySelectorAll('.bi-char').forEach(el => { el.className='bi-char'; });

  intro.classList.add('active');
  await delay(80);

  // Arena profiles — show player accounts if PvP Arena
  const biProfiles = document.getElementById('bi-profiles');
  if (window._arenaContext && biProfiles) {
    var ctx = window._arenaContext;
    document.getElementById('bi-p1-photo').src = ctx.myPhoto || '';
    document.getElementById('bi-p1-name').textContent = ctx.myName || 'Jogador';
    document.getElementById('bi-p2-photo').src = ctx.defensorPhoto || '';
    document.getElementById('bi-p2-name').textContent = ctx.defensorName || 'Oponente';
    biProfiles.style.display = 'flex';
    await delay(200);
    document.getElementById('bi-p1-profile').style.opacity = '1';
    document.getElementById('bi-p1-profile').style.transform = 'translateX(0)';
    document.getElementById('bi-p2-profile').style.opacity = '1';
    document.getElementById('bi-p2-profile').style.transform = 'translateX(0)';
    await delay(500);
  } else if (biProfiles) {
    biProfiles.style.display = 'none';
  }

  // BG glow in
  bg.classList.add('show');
  await delay(200);

  // Separator line sweeps across
  line.classList.add('show');
  await delay(300);

  // Teams slide in simultaneously, staggered per char
  const p1chars = [...tp1.querySelectorAll('.bi-char')];
  const p2chars = [...tp2.querySelectorAll('.bi-char')];
  p1chars.forEach((el,i) => setTimeout(()=>el.classList.add('show'), i*120));
  p2chars.forEach((el,i) => setTimeout(()=>el.classList.add('show'), i*120));
  await delay(p1chars.length * 120 + 200);

  // VS crashes in
  vsEl.classList.add('show');
  await delay(150);

  // Flash on VS impact
  flash.style.transition = 'opacity 0.08s ease';
  flash.style.opacity = '0.18';
  await delay(80);
  flash.style.transition = 'opacity 0.3s ease';
  flash.style.opacity = '0';
  await delay(200);

  // Title rises
  titleEl.classList.add('show');
  titleEl.style.animation = 'bi-clash 0.5s ease forwards';
  await delay(900);

  // Fade out whole intro
  intro.style.transition = 'opacity 0.45s ease';
  intro.style.opacity = '0';
  await delay(450);
  intro.classList.remove('active');
  intro.style.opacity = '';
  intro.style.transition = '';
  titleEl.style.animation = '';
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

  // PvP: pede pro servidor o primeiro turno — só o host
  if (_pvpSocket && _pvpSocket.readyState === WebSocket.OPEN) {
    if (_pendingNextTurn) {
      var pending = _pendingNextTurn;
      _pendingNextTurn = null;
      processPvpNextTurn(pending);
      return;
    }
    if (_isHost) {
      pvpSend('request_next_turn', {});
    }
    addLog('⏳ [Railway] Aguardando servidor iniciar turno...', 'sys');
    return;
  }
  // Local/IA: inicia direto
  beginRound();
}

// ---- INITIATIVE ----
function showInitiativeChoiceScreen() {
  render();
  runBattleIntro().then(() => {
    G._initPicks = {};
    renderInitiativePanel();
    // Timer PvP de 30s — auto-pick carta mais baixa e confirma
    if (_pvpSocket && _pvpSocket.readyState === WebSocket.OPEN) {
      _startInitiativeTimer();
    }
  });
}

var _pvpInitTimer = null;
function _startInitiativeTimer() {
  if (_pvpInitTimer) clearInterval(_pvpInitTimer);
  var secs = 30;
  _updateTimerDisplay(secs, 'init');
  _pvpInitTimer = setInterval(function() {
    secs--;
    _updateTimerDisplay(secs, 'init');
    if (secs <= 0) {
      clearInterval(_pvpInitTimer);
      _pvpInitTimer = null;
      addLog('⏰ Tempo da iniciativa esgotado! Auto-pick da carta mais baixa.', 'sys');
      // Auto-pick carta mais baixa pra cada personagem que não escolheu
      var p1 = G.p1;
      p1.chars.forEach(function(ch) {
        if (!ch.alive) return;
        if (G._initPicks[ch.id] === undefined) {
          // Achar carta mais baixa disponível
          var usedIdxs = new Set(Object.values(G._initPicks));
          var minIdx = -1, minNv = 999;
          p1.hand.forEach(function(card, i) {
            if (!usedIdxs.has(i) && card.nv < minNv) {
              minNv = card.nv; minIdx = i;
            }
          });
          if (minIdx !== -1) G._initPicks[ch.id] = minIdx;
        }
      });
      confirmInitiative();
    }
  }, 1000);
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
  // Limpa timer de iniciativa se confirmou manualmente
  if (_pvpInitTimer) { clearInterval(_pvpInitTimer); _pvpInitTimer = null; }
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

  // ── PvP: manda pro servidor e espera ──
  if (_pvpSocket && _pvpSocket.readyState === WebSocket.OPEN) {
    pvpSend('submit_initiative', { choices: choices });
    // Mostra aguardando oponente
    document.getElementById('panel-body').innerHTML = `
      <div style="text-align:center;padding:20px">
        <div style="font-size:24px;margin-bottom:12px">⏳</div>
        <div style="font-size:14px;color:var(--gold);font-family:'Cinzel',serif">Aguardando oponente...</div>
        <div style="font-size:11px;color:var(--text2);margin-top:8px">Iniciativa enviada ao servidor</div>
      </div>`;
    addLog('📋 [Railway] Iniciativa enviada! Aguardando oponente...', 'sys');
    return;
  }

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

  // ── PvP Railway (legado) — mantido mas não usado no Arena ──
  if (window._pvpContext) {
    const { salaId, myUid, isRanked } = window._pvpContext;
    window._pvpContext = null;
    const alivesCount = isPlayerWin ? G.p1.chars.filter(c => c.alive).length : 0;
    const rpGained = isPlayerWin ? alivesCount : 0;
    document.getElementById('go-sub').textContent = isPlayerWin
      ? `Seu time venceu! +${rpGained} RP`
      : 'O oponente venceu. +0 RP';
    window._fbGet(window._fbRef(window._fbDb, 'jogadores/' + myUid)).then(snap => {
      const d = snap.exists() ? snap.val() : {};
      window._fbSet(window._fbRef(window._fbDb, 'jogadores/' + myUid), {
        ...d,
        rp: (d.rp || 0) + rpGained,
        vitorias: (d.vitorias || 0) + (isPlayerWin ? 1 : 0),
        derrotas: (d.derrotas || 0) + (isPlayerWin ? 0 : 1)
      });
    });
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
  // Jogador: checa equipamento
  if (attacker.owner === 'p1' && _equipLoaded) {
    _glovesHasArt = _getCharArtefato(attacker.id) === 'art_luvas_urso_polar';
  }
  // Boss: checa artefato da batalha
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
  // delay inicial — respiro após ação principal, antes dos follow-ups
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
  // Verifica se a ação foi Rápida e o personagem ainda não ganhou rodada extra.
  // Se sim, reabre painel (jogador) ou executa 2ª ação (IA) via afterQuickAction.
  // Bloqueio mútuo: se extraTurnUsed, ação rápida pode acontecer dentro da rodada extra,
  // mas não gera nova rodada extra (grantExtraTurn já bloqueia por si).
  if (skill.acao === 'Rápida') {
    addLog('🔍 JUIZ (tickQuickAction): ' + attacker.name + ' usou Ação Rápida — entregando para 1.5.', 'sys');
    if (atkOwner === 'p1') {
      const charIdx = G.p1.chars.indexOf(attacker);
      afterQuickAction(attacker, charIdx);
    }
    // IA: o caminho de ação rápida da IA já é tratado pelos afterQuickAction espalhados
    // no executeAction — este tick é apenas o registro formal e caminho do jogador.
  }

  // ── sub-tick 5: tickExtraRound ──
  // Verifica se foi concedida rodada extra durante esta rodada (por qualquer fonte:
  // Lorien Grande Estrela, ♦→♠, ♠→♦, Coringa).
  // A entrada extra já foi injetada na fila por grantExtraTurn —
  // este tick apenas loga formalmente que a rodada extra foi detectada no 2.5.
  // O applyTurnStart chamará tickActionBlock (1.5) naturalmente quando chegar a vez.
  if (attacker.extraTurnUsed) {
    const extraEntry = G.order[G.orderIdx + 1];
    if (extraEntry && extraEntry.ch === attacker && extraEntry.extra) {
      addLog('🔍 JUIZ (tickExtraRound): ' + attacker.name + ' tem Rodada Extra na fila — será entregue na 1.5 no próximo slot.', 'sys');
    }
  }

  addLog('🔍 JUIZ (FollowUps): fim da etapa 2.5 para ' + attacker.name, 'sys');

  // delay final — respiro antes da Etapa 3
  await new Promise(r => setTimeout(r, 500));
}

// ── tickJointAttack — orquestrador de ataques em conjunto ──
// Alvo único: resolve direto para aquele alvo.
// Área: acumula todos os alvos da área e resolve um por um em sequência via resolveAttack (alvo único).
// Flag _jointAttackUsed: impede cadeia infinita entre dois personagens com ataque conjunto.
function tickJointAttack(attacker, skill, target, atkOwner) {
  // Nyxar: Máscara Triste (aliado ataca → Dee ataca junto)
  if (!skill._deeMascara && target && target.alive && atkOwner) {
    const dee = G[atkOwner]?.chars.find(c => c.id === 'nyxa' && c.alive && c !== attacker);
    const masTriste = dee?.statuses.find(s => s.id === 'masc_triste');
    if (dee && masTriste && skill.acao !== 'F') {
      // Bloqueio: Dee já usou ataque conjunto nesta rodada?
      if (dee._jointAttackUsed) {
        addLog('🔍 JUIZ (tickJointAttack): Nyxar Máscara Triste — ataque conjunto já usado nesta rodada. Bloqueado.', 'sys');
      } else {
        const dadSk = dee.skills.find(s => s.id === 'dad');
        if (dadSk && (dee.cooldowns[dadSk.id] || 0) === 0) {
          const fakeCard = {suit: 'neutral', val: '—', nv: 0};
          // Detecta se foi ataque em área
          const isArea = skill.target === 'all_enemy';
          const alvos = isArea
            ? (atkOwner === 'p1' ? G.p2.chars.filter(c => c.alive) : G.p1.chars.filter(c => c.alive))
            : [target];

          dee._jointAttackUsed = true;
          addLog('🔍 JUIZ (tickJointAttack): Nyxar Máscara Triste → ' + (isArea ? 'área (' + alvos.length + ' alvos)' : 'alvo único: ' + target.name), 'sys');

          floatStatus(dee, '😢 JUNTO!', '#8080ff');
          floatJointAttack(dee, '😢 JUNTO!', '#8080ff');
          slotFlash(dee, 'together');

          // Resolve cada alvo em sequência como alvo único
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
        // Bloqueio: Aeryn já usou ataque conjunto nesta rodada?
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

            // Resolve cada alvo em sequência como alvo único
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

  // tickDeath — tratado dentro de dmgChar (já existente)

  // tickFollowUps (Etapa 2.5)
  await tickFollowUps(attacker, skill, target, atkOwner);
}

// Efeito visual de partículas ao aplicar status no alvo
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
  // Ícone do status popando no slot
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
    if(!_exExp) { // só aplica redução de DEF na primeira aplicação
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
    if(!_exWk) { // só aplica redução de ATQ na primeira aplicação
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
    if(!_exChill) { // só reduz ATQ na primeira aplicação
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
    addLog('☠️ '+target.name+' foi Envenenado! ('+( exP?exP.stacks:1)+' stack(s))','dmg');
  }
  if(d.includes('hemorragia')){
    // Hemorragia: debuff instantâneo — ativa tick de Sangramento em TODOS os inimigos do alvo
    // Não remove nem reduz duração do Sangramento. Se não tiver Sangramento, não faz nada.
    const _hemorOwner = target.owner;
    const _hemorEnemySide = (_hemorOwner === 'p1') ? G.p1 : G.p2;
    const _hemorTargets = _hemorEnemySide.chars.filter(function(c){ return c.alive; });
    let _hemorAny = false;
    _hemorTargets.forEach(function(e){
      const bleedSt = e.statuses.find(function(s){ return s.id==='bleed'; });
      if(!bleedSt) return; // sem Sangramento, ignora
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
// Aplica efeitos puros da skill no alvo (wraps applyEffects com log do Juiz)
function tickApplyEffect(attacker, skill, target) {
  addLog(attacker.name + ' usa ' + skill.name + ' em ' + target.name + '!', 'info');
  applyEffects(skill, target);
  addLog('🔍 JUIZ (ApplyEffect): ' + attacker.name + ' → ' + target.name + ' — efeitos de ' + skill.name + ' aplicados.', 'sys');
}

// ── ETAPA 2 — tickDuration ──
// Duração já é definida dentro de applyEffects via addSt (turns por status).
// Este tick existe como ponto formal de orquestração para extensões futuras.
function tickDuration(skill, target) {
  addLog('🔍 JUIZ (Duration): duração dos efeitos de ' + skill.name + ' em ' + target.name + ' registrada.', 'sys');
}

// ── ETAPA 2 — tickEffectLog ──
function tickEffectLog(attacker, skill, target) {
  addLog('🔍 JUIZ (EffectLog): ' + attacker.name + ' → ' + target.name + ' (' + skill.name + ') — efeito puro concluído.', 'sys');
}

// ── ETAPA 2 — resolveEffect (orquestrador) ──
async function resolveEffect(attacker, skill, atkCard, target, defCard, atkOwner) {
  // tickTarget
  const _tgt = tickTarget(attacker, skill, target);
  skill  = _tgt.skill;
  target = _tgt.target;

  // tickIntercept — efeitos de aliado não interceptam, apenas de inimigo
  if (skill.target === 'enemy') {
    target = tickIntercept(attacker, skill, target);
  }

  // tickApplyEffect
  tickApplyEffect(attacker, skill, target);

  // tickDuration
  tickDuration(skill, target);

  // tickEffectLog
  tickEffectLog(attacker, skill, target);

  // tickFollowUps (Etapa 2.5) — mesmo fluxo que resolveAttack
  await tickFollowUps(attacker, skill, target, atkOwner);
}

// ── ETAPA 2 — tickMainAction ──
// Bifurca entre resolveAttack (skill com dano) e resolveEffect (skill puro)
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
        // Com limite: só incrementa se não atingiu o máximo
        if(ex.stacks < st.stackMax) ex.stacks++;
      } else {
        // Sem limite (ex: Veneno): sempre incrementa
        ex.stacks++;
      }
    }
  } else {
    ch.statuses.push(st);
  }
  // Atualiza ícones visuais sem recriar o slot inteiro
  renderCharacterStatusIcons(ch);
  // Atualiza popup se estiver aberto para este personagem
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

    // Reset
    banner.className = '';
    banner.style.opacity = '1';

    // Trigger entrance
    requestAnimationFrame(() => {
      banner.classList.add('active');

      // Hold then exit
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

// ══════════════════════════════════════════════════════════════════
// TURNO NOVO — campo limpo
// Responsabilidade: organizar, draw, iniciativa, firstTurn, banner.
// Nada de tick, status, cooldown ou passiva de personagem aqui.
// ══════════════════════════════════════════════════════════════════
// ── tickJudgeStart — Reseta o Juiz e inicia o watchdog ──────────────────────
function tickJudgeStart() {
  judgeWatchdogStart();
  judgeReset();
  addLog(`🔍 JUIZ (tickJudgeStart): Turno ${G.turn + 1} — watchdog iniciado, campo limpo.`, 'sys');
}

// ── tickTurnDraw — Compra de cartas para ambos os lados ─────────────────────
function tickTurnDraw() {
  draw('p1'); draw('p2');
  floatTurnDraw('p1');
  floatTurnDraw('p2');
  addLog(`🔍 JUIZ (tickTurnDraw): Draw realizado — P1: ${G.p1.hand.length} cartas | P2: ${G.p2.hand.length} cartas.`, 'sys');
}

// ── tickInitiative — Monta a fila de iniciativa do turno ────────────────────
// Retorna false se não há ninguém vivo (fim de jogo).
function tickInitiative() {
  G.orderIdx = 0;
  G.order = G.order.filter(e => e.ch.alive && !e.extra);
  if(!G.order.length) { checkWin(); return false; }
  const ordemLog = G.order.map((e,i) => `#${i+1} ${e.ch.name}`).join(', ');
  addLog(`🔍 JUIZ (tickInitiative): Ordem — ${ordemLog}`, 'sys');
  return true;
}

// ── tickGlobalFlags — Incrementa turno e limpa flags globais ────────────────
function tickGlobalFlags() {
  G.turn++;
  addLog(`═══ Turno ${G.turn} ═══`, 'sys');
  addLog(`🔍 JUIZ (tickGlobalFlags): Turno ${G.turn} — firstTurn desativado para todos.`, 'sys');
  [...G.p1.chars, ...G.p2.chars].forEach(ch => { ch.firstTurn = false; });
}

// ── startTurnNew — Orquestrador do turno ────────────────────────────────────
function startTurnNew() {
  if(G.over) { judgeWatchdogStop(); return; }

  tickJudgeStart();
  tickTurnDraw();
  tickGlobalFlags();
  if(!tickInitiative()) return; // sem atores vivos — checkWin já chamado

  // Banner e passa para a rodada do primeiro ator
  showTurnBanner(G.turn).then(() => {
    if(!G.over) {
      render();
      setTimeout(() => { if(!G.over) applyTurnStart(actor()); }, 80);
    }
  });
}

// ── Frozen / Stun — teste unificado ──────────────────────────────────────────
// Contexto: 'turn' = início de turno normal/extra | 'quick' = após ação rápida
// Retorna: 'lost' (sucesso: perde turno) | 'ok' (falha: age normalmente) | null (sem status)
function checkFrozenStun(ch, a, ctx) {
  const s = ch.statuses.find(s => s.id==='frozen' || s.id==='stun');
  if(!s) return null;
  const isFrozen = s.id==='frozen';
  const icon  = isFrozen ? '❄️' : '💫';
  const label = isFrozen ? 'Congelado' : 'Atordoado';
  const color = isFrozen ? '#80d0ff' : '#f0e060';
  const sucesso = Math.random() < 0.5;
  if(sucesso) {
    // Remove status — saiu do efeito mas perde o turno/ação
    ch.statuses = ch.statuses.filter(s2=>s2.id!==s.id);
    if(ctx==='quick') {
      // Ação Rápida: executa a habilidade e DEPOIS encerra o turno
      // (sinaliza para o chamador encerrar após execução)
      addLog(icon+' '+ch.name+' '+label+' — status removido! Turno encerrado após esta ação.','dmg');
      floatStatus(ch, icon+' Último ato!', color);
      return 'lost_after'; // encerra após executar
    } else {
      // Turno normal/extra: encerra imediatamente
      addLog(icon+' '+ch.name+' '+label+' — perde o turno! Status removido.','dmg');
      floatStatus(ch, icon+' Perdeu turno!', color);
      render();
      setTimeout(()=>{ if(!G.over){ nextActor(); render(); } }, 1200);
      return 'lost';
    }
  } else {
    // Falha: age normalmente, status permanece
    addLog(icon+' '+ch.name+' '+label+' — resistiu. Age normalmente. (status permanece)','info');
    floatStatus(ch, icon+' Resistiu!', color);
    return 'ok';
  }
}


// ── CHAMADO DA TROPA (Comandante Vance) ──
// Dispara nos turnos 3, 6, 9... Sorteia 1 de 3 aliados:
// Jennet (33%): Sangramento em todos inimigos + Hemorragia dispara tick de Sangramento sem remover
// Hoover  (33%): 10 dano fixo Ignora Armadura em todos os inimigos
// Guinzu  (33%): Imagem Espelhada em todos os aliados (50% esquiva 1 ataque)
function chamadoDoComando(ch) {
  const enemies = (ch.owner==='p1' ? G.p2 : G.p1).chars.filter(e=>e.alive);
  const allies  = G[ch.owner].chars.filter(a=>a.alive && a!==ch);
  const r = Math.random();

  if(r < 0.3333) {
    // JENNET
    addLog('🩸 Chamado da Tropa — INFILTRAÇÃO: Sangramento + Hemorragia em todos os inimigos!','dmg');
    floatStatus(ch,'🩸 Jennet!','#cc2020');
    for(const e of enemies) {
      // 1. Sangramento entra primeiro
      addSt(e,{id:'bleed',icon:'🩸',label:'Sangramento',turns:2,stacks:1,stackMax:3});
      addLog(`  🩸 ${e.name}: Sangramento aplicado.`,'dmg');
      // 2. Hemorragia dispara tick de Sangramento sem remover
      const bleedSt = e.statuses.find(s=>s.id==='bleed');
      const stacks = bleedSt ? (bleedSt.stacks||1) : 1;
      const hDmg = 3 * stacks;
      dmgChar(e, hDmg, ch);
      floatDmg(e, hDmg);
      floatStatus(e,'🩸💥 Hemorragia!','#aa0000');
      addLog(`  🩸💥 Hemorragia: ${hDmg} dano instantâneo em ${e.name} (${stacks} stack(s))! Sangramento mantido.`,'dmg');
    }
  } else if(r < 0.6666) {
    // HOOVER
    addLog('💥 Chamado da Tropa — INFANTARIA: 10 dano Ignora Armadura em todos os inimigos!','dmg');
    floatStatus(ch,'💥 Hoover!','#ff8020');
    for(const e of enemies) {
      dmgChar(e, 10, ch);
      floatDmg(e, 10);
      floatStatus(e,'💥 Hoover!','#ff8020');
      addLog(`  💥 Hoover → ${e.name}: 10 dano [Ignora Armadura]`,'dmg');
    }
  } else {
    // GUINZU
    addLog('🧸 Chamado da Tropa — RESGATE: Imagem Espelhada em todos os aliados!','info');
    floatStatus(ch,'🧸 Guinzu!','#80c0ff');
    const targets = allies.length ? allies : [ch]; // no 1x1 aplica no próprio Cap
    for(const a of targets) {
      addSt(a,{id:'mirror',icon:'🧸',label:'Imagem Espelhada',turns:2});
      floatStatus(a,'🧸 Espelhada!','#80c0ff');
      addLog(`  🧸 Imagem Espelhada em ${a.name}!`,'info');
    }
  }
  render();
}

// Helper: retorna o id do artefato equipado no personagem, ou null
function _getCharArtefato(charId) {
  if (!_equipData[charId] || !_equipData[charId].slot2) return null;
  return _equipData[charId].slot2.artefatoId || null;
}

// ══ CAPACETE DA VISÃO CÓSMICA — lógica do popup ══
var _capaceteCallback = null;
var _capaceteSelectedIdx = null;

function _capaceteHasArt(ch) {
  if (ch.owner === 'p1' && _equipLoaded) {
    if (_getCharArtefato(ch.id) === 'art_capacete_visao_cosmica') return true;
  }
  if (ch.isBoss && window._survBossArtefato && window._survBossArtefato.id === 'art_capacete_visao_cosmica') return true;
  return false;
}

// Abre popup pro jogador (p1) escolher carta a descartar
function _capaceteOpenPopup(a, onDone) {
  _capaceteCallback = onDone;
  _capaceteSelectedIdx = null;
  var hand = G.p1.hand;
  var container = document.getElementById('capacete-cards');
  var btn = document.getElementById('capacete-confirm-btn');
  btn.disabled = true;
  btn.style.opacity = '0.5';
  btn.style.cursor = 'not-allowed';

  container.innerHTML = hand.map(function(c, i) {
    var suitIcon = {spades:'♠',hearts:'♥',clubs:'♣',diamonds:'♦',neutral:'★'}[c.suit] || '?';
    var suitColor = (c.suit==='hearts'||c.suit==='diamonds') ? '#e04040' : (c.suit==='neutral' ? '#c9a84c' : 'var(--text)');
    return '<div id="cap-card-' + i + '" onclick="_capaceteSelectCard(' + i + ')" style="' +
      'width:52px;height:72px;border-radius:8px;border:2px solid var(--border);background:var(--bg3);' +
      'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;' +
      'transition:border-color 0.15s,transform 0.15s;user-select:none">' +
      '<div style="font-size:18px;color:' + suitColor + '">' + suitIcon + '</div>' +
      '<div style="font-family:\'Cinzel\',serif;font-size:13px;color:var(--gold)">' + c.val + '</div>' +
    '</div>';
  }).join('');

  var ov = document.getElementById('capacete-overlay');
  ov.style.display = 'flex';
}

function _capaceteSelectCard(idx) {
  _capaceteSelectedIdx = idx;
  // Atualiza visual de seleção
  var hand = G.p1.hand;
  hand.forEach(function(_, i) {
    var el = document.getElementById('cap-card-' + i);
    if (!el) return;
    el.style.borderColor = (i === idx) ? '#9060d0' : 'var(--border)';
    el.style.transform = (i === idx) ? 'scale(1.08)' : 'scale(1)';
    el.style.background = (i === idx) ? 'rgba(144,96,208,0.2)' : 'var(--bg3)';
  });
  var btn = document.getElementById('capacete-confirm-btn');
  btn.disabled = false;
  btn.style.opacity = '1';
  btn.style.cursor = 'pointer';
}

function _capaceteConfirm() {
  if (_capaceteSelectedIdx === null) return;
  var ov = document.getElementById('capacete-overlay');
  ov.style.display = 'none';
  var ch = G.order[G.orderIdx].ch;
  addLog('🌌 Capacete da Visão Cósmica: ' + ch.name + ' descartou carta [' + G.p1.hand[_capaceteSelectedIdx].val + '] e compra 2!', 'info');
  floatStatus(ch, '🌌 Visão Cósmica!', '#9060d0');
  discard('p1', _capaceteSelectedIdx);
  draw('p1', 2, '🌌 Visão Cósmica');
  render();
  var cb = _capaceteCallback;
  _capaceteCallback = null;
  _capaceteSelectedIdx = null;
  if (cb) cb();
}

function _capacetePular() {
  var ov = document.getElementById('capacete-overlay');
  ov.style.display = 'none';
  addLog('🌌 Capacete da Visão Cósmica: efeito ignorado.', 'info');
  var cb = _capaceteCallback;
  _capaceteCallback = null;
  _capaceteSelectedIdx = null;
  if (cb) cb();
}


// ══════════════════════════════════════════════════════════════════
// RODADA — 3 ETAPAS
// Chamadas em sequência por applyTurnStart.
// Cada etapa tem responsabilidade clara e registra no Juiz.
// ══════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════
// ETAPA 1 — SUB-TICKS
// Chamados em sequência por tickRoundStart (= rodadaEtapa1).
// Não rodam em Rodada Extra.
// ══════════════════════════════════════════════════════════════════

// ── 1. tickDots — DoTs disparam (apenas offline) ─────────────────
// Retorna false se o personagem morreu por DoT.
function tickDots(ch) {
  if(_pvpSocket && _pvpSocket.readyState===WebSocket.OPEN) return true;
  for(let s of ch.statuses) {
    if(s.id==='burn') {
      judgeCheck('dot_apply', { who: ch.name, dot: 'Queimadura', charObj: ch, expected: 10, actual: 10 });
      dmgChar(ch,10); ch.curDef=Math.max(0,ch.curDef-1);
      floatStatus(ch,'🔥','#ff6020'); floatDmg(ch,10);
      addLog('🔥 '+ch.name+' Queimadura: 10 dano (-1 DEF)','dmg');
    }
    if(s.id==='bleed') {
      const bd=3*(s.stacks||1);
      judgeCheck('dot_apply', { who: ch.name, dot: 'Sangramento', charObj: ch, expected: bd, actual: bd });
      dmgChar(ch,bd);
      floatStatus(ch,'🩸','#cc2020'); floatDmg(ch,bd);
      addLog('🩸 '+ch.name+' Sangramento: '+bd+' dano','dmg');

      // Artefato: Dentes Devoradores de Sanguessuga — cura 1 de vida para quem tiver equipado
      var _allCombatChars = (G.p1 ? G.p1.chars : []).concat(G.p2 ? G.p2.chars : []);
      _allCombatChars.forEach(function(ally) {
        if(!ally.alive) return;
        var _dentesHasArt = _getCharArtefato(ally.id) === 'art_dentes_sanguessuga';
        if (!_dentesHasArt && ally.isBoss && window._survBossArtefato && window._survBossArtefato.id === 'art_dentes_sanguessuga') {
          _dentesHasArt = true;
        }
        if(_dentesHasArt) {
          ally.hp = Math.min(ally.maxHp, ally.hp + 1);
          floatStatus(ally,'🩸+1','#cc2020');
          addLog('🩸 Dentes Devoradores: ' + ally.name + ' recupera 1 de vida!','info');
        }
      });
    }
    if(s.id==='rad') {
      const rd=4*(s.stacks||1);
      judgeCheck('dot_apply', { who: ch.name, dot: 'Radiacao', charObj: ch, expected: rd, actual: rd });
      dmgChar(ch,rd);
      floatStatus(ch,'☢️','#a0e040'); floatDmg(ch,rd);
      addLog('☢️ '+ch.name+' Radiação: '+rd+' dano','dmg');
    }
    if(s.id==='static') {
      judgeCheck('dot_apply', { who: ch.name, dot: 'Estatica', charObj: ch, expected: 5, actual: 5 });
      dmgChar(ch,5);
      floatStatus(ch,'⚡','#f0f060'); floatDmg(ch,5);
      addLog('⚡ '+ch.name+' Estática: 5 dano','dmg');
    }
    if(s.id==='chill') {
      judgeCheck('dot_apply', { who: ch.name, dot: 'Resfriamento', charObj: ch, expected: 10, actual: 10 });
      dmgChar(ch,10); ch.curAtq=Math.max(0,ch.curAtq-1);
      floatStatus(ch,'🧊','#60c0e0'); floatDmg(ch,10);
      addLog('🧊 '+ch.name+' Resfriamento: 10 dano (-1 ATQ)','dmg');
    }
    if(s.id==='poison') {
      const pd = s.stacks || 1;
      judgeCheck('dot_apply', { who: ch.name, dot: 'Veneno', charObj: ch, expected: pd, actual: pd });
      dmgChar(ch, pd);
      floatStatus(ch,'☠️','#60c040'); floatDmg(ch, pd);
      addLog('☠️ '+ch.name+' Veneno: '+pd+' dano ('+pd+' stack'+(pd>1?'s':'')+')','dmg');
    }
  }
  if(G.over) return false;
  if(!ch.alive) {
    addLog(`🔍 JUIZ (tickDots): ${ch.name} — morreu por DoT.`, 'sys');
    G._reactDelay = 0; nextActor(); render();
    return false;
  }
  return true;
}

// ── 2. tickCooldowns — Decrementa cooldowns das habilidades ──────
function tickCooldowns(ch) {
  for(let sk in ch.cooldowns) {
    if(ch.cooldowns[sk] > 0) ch.cooldowns[sk]--;
  }
  const _cdsAtivos = Object.entries(ch.cooldowns).filter(([,v])=>v>0).map(([k,v])=>{
    const skObj = ch.skills.find(s=>s.id===k);
    return (skObj?skObj.name:k)+'('+v+'t)';
  });
  if(_cdsAtivos.length > 0) {
    addLog(`🔍 JUIZ (tickCooldowns): ${ch.name} — ${_cdsAtivos.join(', ')}.`, 'sys');
  }
}

// ── 3. tickStatusDuration — Decrementa duração dos status ────────
function tickStatusDuration(ch) {
  const _antes = ch.statuses.map(s=>s.id);
  ch.statuses = ch.statuses.filter(s=>{
    if(s.turns!==undefined) s.turns--;
    return s.turns===undefined||s.turns>0;
  });
  const _expirados = _antes.filter(id=>!ch.statuses.find(s=>s.id===id));
  if(_expirados.length > 0) {
    addLog(`🔍 JUIZ (tickStatusDuration): ${ch.name} — expirados: ${_expirados.join(', ')}.`, 'sys');
  }
}

// ── 4. tickRoundPassives — Passivas de início de rodada natural ──
// Recebe (a) para acessar a.extra e a.o.
// Não dispara em Rodada Extra.
function tickRoundPassives(a) {
  const ch = a.ch;

  // Kuro Isamu: Concentração Marcial +1 auto
  if(((ch.id==='kuro'||ch.id==='kuro_ai')) && ch.alive) {
    const _satsuiAntes = ch._satsui||0;
    ch._satsui = Math.min(10, _satsuiAntes + 1);
    addLog(`🔍 JUIZ (tickRoundPassives): ${ch.name} Concentração Marcial: ${_satsuiAntes} → ${ch._satsui}/10 (auto).`, 'sys');
  }

  // Tyren: limpa _lingersUntilNextLinkTurn e Roupa Verde regen
  if((ch.id==='tyre'||ch.id==='tyre_ai')) {
    ch.statuses = ch.statuses.filter(s => !s._lingersUntilNextLinkTurn);
    if(ch.statuses.find(s=>s.id==='outfit_verde')) {
      judgeCheck('passive_start', { who: ch.name, passive: 'Roupa Verde Regen', charObj: ch, extra: false, noExtra: true });
      const regen=3;
      ch.hp=Math.min(ch.maxHp,ch.hp+regen);
      floatAccum(ch,'🟢 +'+regen+' PVS','var(--green)');
      floatHeal(ch,regen);
      addLog('🟢 Tyren Roupa Verde: +'+regen+' PVS no início da rodada.','heal');
    }
  }

  // Kuro Isamu: Dedicação Total
  if((ch.id==='kuro'||ch.id==='kuro_ai')) {
    judgeCheck('passive_start', { who: ch.name, passive: 'Dedicacao Total', charObj: ch, extra: a.extra, noExtra: true });
    var isPvpDT = _pvpSocket && _pvpSocket.readyState === WebSocket.OPEN;
    if(isPvpDT && a.o !== 'p1') {
      // nada — aguarda kuro_suit do servidor
    } else if((ch._ryuSuitTimer||0) > 0) {
      ch._ryuSuitTimer--;
      const suitSym = SUITS[ch._ryuSuit]?.sym || ch._ryuSuit;
      if(ch._ryuSuitTimer > 0) {
        addLog(`🥋 Dedicação Total: naipe ${ch._ryuSuit} ainda ativo (${ch._ryuSuitTimer}t restantes).`,'info');
        floatStatus(ch, `🥋 ${suitSym} ${ch._ryuSuitTimer}t`, '#ff8040');
      } else {
        addLog(`🥋 Dedicação Total: naipe ${ch._ryuSuit} expira ao final deste turno.`,'info');
        floatStatus(ch, `🥋 ${suitSym} Expira`, '#808080');
      }
    } else {
      if(!isPvpDT) {
        if(a.o === 'p1') { ryuAbrirDedicacaoTotal(ch); }
        else { ryuIADedicacaoTotal(ch, G.p1.chars.filter(c=>c.alive)); }
      } else {
        ryuAbrirDedicacaoTotal(ch);
      }
    }
  }

  // Lorien: Gladiadora Frenesi
  if((ch.id==='lori'||ch.id==='lori_ai')) {
    judgeCheck('passive_start', { who: ch.name, passive: 'Gladiadora Frenesi', charObj: ch, extra: a.extra, noExtra: true });
    const threshold = ch.maxHp * 0.2;
    const jaTemFrenesi = ch.statuses.find(s=>s.id==='gladiadora_frenesi');
    if(ch.hp <= threshold) {
      if(!jaTemFrenesi) {
        addSt(ch,{id:'gladiadora_frenesi',icon:'⚔️',label:'Gladiadora: Frenesi',turns:999});
        ch.curAtq = Math.min(ch.curAtq+1, ch.atq+4);
        ch.curDef = Math.min(ch.curDef+1, ch.def+4);
        addLog(`⚔️ Gladiadora Frenesi: Lorien luta com fúria! (+1 ATQ/DEF)`,'dmg');
        floatStatus(ch,'⚔️ FRENESI!','#ff4040');
      }
    } else {
      if(jaTemFrenesi) {
        ch.statuses = ch.statuses.filter(s=>s.id!=='gladiadora_frenesi');
        ch.curAtq = Math.max(ch.atq, ch.curAtq - 1);
        ch.curDef = Math.max(ch.def, ch.curDef - 1);
        addLog(`⚔️ Gladiadora: Lorien recuperou o fôlego. (Frenesi removido)`,'info');
      }
    }
  }

  // Comandante Vance: Chamado da Tropa
  if(((ch.id==='vanc'||ch.id==='vanc_ai')) && !(_pvpSocket && _pvpSocket.readyState===WebSocket.OPEN)) {
    judgeCheck('passive_start', { who: ch.name, passive: 'Chamado da Tropa', charObj: ch, extra: a.extra, noExtra: true });
    ch._chamadoTurno = (ch._chamadoTurno||0) + 1;
    addLog(`⭐ Comandante Vance — turno ${ch._chamadoTurno}${ch._chamadoTurno%3===0?' → CHAMADO DA TROPA!':'.'}`, 'info');
    if(ch._chamadoTurno % 3 === 0) {
      floatStatus(ch,'⭐ CHAMADO!','var(--gold)');
      chamadoDoComando(ch);
    } else {
      floatAccum(ch, '⭐ ' + (ch._chamadoTurno%3) + '/3');
    }
  }

  // Nyxar: Presença de Nimb
  if((ch.id==='nyxa'||ch.id==='nyxa_ai') && !(_pvpSocket && _pvpSocket.readyState===WebSocket.OPEN)) {
    judgeCheck('passive_start', { who: ch.name, passive: 'Presenca de Nimb', charObj: ch, extra: a.extra, noExtra: true });
    ch._nimb = Math.random() < 0.5;
    ch._nimbUsedThisTurn = false;
    if(ch._nimb) {
      ch._nimbUsedThisTurn = true;
      addSt(ch,{id:'nimb_ativo',icon:'🪙',label:'Presença de Nimb: próxima ação é Rápida',turns:1});
      addLog(`🪙 Presença de Nimb! Primeira ação de ${ch.name} será Rápida.`,'info');
      floatStatus(ch,'🪙 Nimb!','#b060e0');
    } else {
      addLog(`🪙 Presença de Nimb: falhou.`,'info');
    }
  }

  // Gorath: Agora é Sério — expira
  if((ch.id==='gora'||ch.id==='gora_ai') && ch._agoraSerio) {
    judgeCheck('passive_start', { who: ch.name, passive: 'Agora e Serio', charObj: ch, extra: a.extra, noExtra: true });
    ch._agoraSerioCooldown = (ch._agoraSerioCooldown||0) - 1;
    if(ch._agoraSerioCooldown <= 0) {
      ch._agoraSerio = false;
      ch._agoraSerioPow = 0;
      ch.statuses = ch.statuses.filter(s=>s.id!=='agora_serio');
      addLog('⚔️ Agora é Sério expirou — bônus de ATACARRRR removido.','info');
      floatStatus(ch,'⚔️ Sério: Expirou','#808080');
    } else {
      addLog('⚔️ Agora é Sério ativo! Bônus: +'+(ch._agoraSerioPow||0)+' (expira em '+ch._agoraSerioCooldown+'t).','info');
    }
  }

  // Zephyr: Sorte Grande
  if(((ch.id==='zeph'||ch.id==='zeph_ai')) && ch.alive && !(_pvpSocket && _pvpSocket.readyState===WebSocket.OPEN)) {
    judgeCheck('passive_start', { who: ch.name, passive: 'Sorte Grande', charObj: ch, extra: a.extra, noExtra: true });
    const _owner = ch.owner;
    floatStatus(ch, '🪙 Girando...', 'var(--gold)');
    addLog('🪙 Zephyr: Sorte Grande — girando moeda...', 'info');
    render();
    setTimeout(()=>{
      const heads = Math.random() < 0.5;
      if(heads) {
        draw(_owner, 1, '+1 carta');
        addLog('🍀 CARA! Zephyr: Sorte Grande! Carta extra comprada.', 'info');
        floatStatus(ch, '🍀 CARA! +1', '#50e080');
        floatPassiveDraw(ch, 1, '🍀');
      } else {
        addLog('🪙 COROA! Zephyr: Sem sorte desta vez.', 'info');
        floatStatus(ch, '🪙 COROA', '#a08040');
      }
      render();
    }, 800);
  }

  // ── Xamã do Culto Sangrento: Pacto de Sangue ──
  if (ch.passive === 'pacto_sangue' && ch.alive) {
    var _xamaAllies = (ch.owner === 'p1' ? G.p1 : G.p2).chars;
    var _elfosVivos = _xamaAllies.filter(function(c) { return c.alive && c.id !== ch.id && (c.id.startsWith('elfo_')); });
    var _elfosMortos = _xamaAllies.filter(function(c) { return !c.alive && (c.id.startsWith('elfo_')); });

    if (_elfosMortos.length > 0) {
      // Calcula chance: base 10%, +40% se buff reviver_morto ativo
      var _xamaChance = 0.10;
      if (ch.statuses.find(function(s) { return s.id === 'reviver_morto_buff'; })) {
        _xamaChance += 0.40;
      }
      addLog('💀 Pacto de Sangue: ' + ch.name + ' tenta reviver elfo (' + Math.round(_xamaChance * 100) + '% chance)...', 'info');
      if (Math.random() < _xamaChance) {
        var _elfoRevivido = _elfosMortos[Math.floor(Math.random() * _elfosMortos.length)];
        _elfoRevivido.alive = true;
        _elfoRevivido.hp = Math.floor(_elfoRevivido.maxHp * 0.30); // revive com 30% HP
        floatStatus(_elfoRevivido, '💀 Reanimado!', '#cc2020');
        floatStatus(ch, '💀 Pacto!', '#9060d0');
        addLog('💀 Pacto de Sangue: ' + _elfoRevivido.name + ' foi reanimado com ' + _elfoRevivido.hp + ' PVS!', 'dmg');
        render();
      } else {
        addLog('💀 Pacto de Sangue: falhou.', 'info');
      }
    }
  }

  // ── Troll das Terras Nevadas: Recuperação de Vida ──
  if (ch.passive === 'troll_regen' && ch.alive) {
    var _trollHeal = 5;
    if (ch.hp < ch.maxHp) {
      ch.hp = Math.min(ch.maxHp, ch.hp + _trollHeal);
      floatStatus(ch, '💚 +' + _trollHeal, '#40c040');
      addLog('💚 Recuperação de Vida: ' + ch.name + ' regenera ' + _trollHeal + ' PVS.', 'heal');
      render();
    }
  }

  // Elfo do Culto Sangrento: Exposição ao Sangue — 40% de tirar 8 de si e causar 8 no alvo sem defesa
  if (ch.passive === 'exposicao_sangue' && ch.alive) {
    if (Math.random() < 0.40) {
      var _elfEnemies = (ch.owner === 'p1' ? G.p2 : G.p1).chars.filter(function(e) { return e.alive; });
      // Prioriza alvo de naipe ♥ (vantagem do ♠)
      var _elfTarget = _elfEnemies.find(function(e) { return e.suit === 'hearts'; }) ||
                       _elfEnemies[Math.floor(Math.random() * _elfEnemies.length)];
      if (_elfTarget) {
        var _elfDmg = Math.floor(ch.maxHp * 0.10); // sempre 8 (10% de 80)
        ch.hp = Math.max(1, ch.hp - _elfDmg);
        floatStatus(ch, '🩸 Sacrifício!', '#cc2020');
        floatDmg(ch, _elfDmg);
        addLog('🩸 Exposição ao Sangue: ' + ch.name + ' sacrifica ' + _elfDmg + ' PVS e causa ' + _elfDmg + ' de dano verdadeiro em ' + _elfTarget.name + '!', 'dmg');
        dmgChar(_elfTarget, _elfDmg); // ignora defesa pois é DoT direto
        floatDmg(_elfTarget, _elfDmg);
        render();
      }
    } else {
      addLog('🩸 Exposição ao Sangue: ' + ch.name + ' resistiu ao impulso.', 'info');
    }
  }

  // ── Parede de Carne Congelada: Aura de Resfriamento ──
  if (ch.passive === 'parede_restricao' && ch.alive) {
    var _paredeEnemies = (ch.owner === 'p1' ? G.p2 : G.p1).chars.filter(function(e) { return e.alive; });
    _paredeEnemies.forEach(function(e) {
      var _existFrozen = e.statuses.find(function(s) { return s.id === 'frozen'; });
      if (_existFrozen) {
        _existFrozen.turns = 2; // renova duração
      } else {
        addSt(e, { id: 'frozen', icon: '❄️', label: 'Congelado (2t)', turns: 2 });
        _spawnStatusFx(e, 'frozen');
      }
    });
    if (_paredeEnemies.length > 0) {
      addLog('❄️ Aura de Resfriamento: ' + ch.name + ' congela todos os inimigos!', 'info');
      floatStatus(ch, '❄️ AURA', '#80d0ff');
      render();
    }
  }
}

// ── 5. tickRestoreStats — Restaura ATQ/DEF base ──────────────────
function tickRestoreStats(ch) {
  const _inspBase = ch._inspirado ? 1 : 0;
  const _atqAntes = ch.curAtq, _defAntes = ch.curDef;
  if(!ch.statuses.find(s=>s.id==='weak') && !ch.statuses.find(s=>s.id==='hearts_adv') && !ch.statuses.find(s=>s.id==='fort_atq')) ch.curAtq = ch.atq + _inspBase;
  if(!ch.statuses.find(s=>s.id==='exposed') && !ch.statuses.find(s=>s.id==='chill') && !ch.statuses.find(s=>s.id==='hearts_adv') && !ch.statuses.find(s=>s.id==='fort_def')) ch.curDef = ch.def + _inspBase;
  if(ch.curAtq !== _atqAntes || ch.curDef !== _defAntes) {
    addLog(`🔍 JUIZ (tickRestoreStats): ${ch.name} — ATQ: ${_atqAntes}→${ch.curAtq} DEF: ${_defAntes}→${ch.curDef}.`, 'sys');
  }
}

// ── 6. tickRoundFlags — Reset de flags de rodada ─────────────────
function tickRoundFlags(ch) {
  ch.extraTurnUsed = false;
  ch._jointAttackUsed = false;
  if((ch.id==='nyxa'||ch.id==='nyxa_ai')) ch._nimbUsedThisTurn = false;
  // Reset flags de controle da IA
  ch._iaBlockQuick = false;
  ch._iaBlockExtraTurn = false;
  ch._iaActionPending = false;

  // ── tickJointAttack: libera ataque conjunto de todos os aliados a cada nova rodada ──
  const owner = ch.owner;
  if (owner && G[owner] && G[owner].chars) {
    G[owner].chars.forEach(ally => {
      if (ally !== ch) ally._jointAttackUsed = false;
    });
    addLog(`🔍 JUIZ (tickRoundFlags): ataque conjunto liberado para aliados de ${ch.name}.`, 'sys');
  }
}

// ── tickRoundStart (= rodadaEtapa1) — Orquestrador da Etapa 1 ────
// Não roda em Rodada Extra (a.extra === true).
// Retorna false se o personagem morreu por DoT.
function rodadaEtapa1(a) {
  const ch = a.ch;
  addLog(`🔍 JUIZ (Rodada Etapa 1): ${ch.name} — Início da Rodada.`, 'sys');

  // Reseta flag do Olhos Cósmicos (primeira vez que recebe dano nesta rodada)
  ch._dmgTakenThisTurn = false;

  tickRoundFlags(ch);
  tickCooldowns(ch);
  tickStatusDuration(ch);
  tickRoundPassives(a);
  tickRestoreStats(ch);
  if(!tickDots(ch)) return false; // morreu por DoT

  addLog(`🔍 JUIZ (Rodada Etapa 1): ${ch.name} — Etapa 1 concluída.`, 'sys');
  return true;
}

// ── ETAPA 2: AÇÃO ─────────────────────────────────────────────────
// Responsabilidade: passivas de início de ação, liberar o personagem
// para agir (jogador abre painel, IA age). Controla bifurcações de
// Ação Rápida e Rodada Extra.
// Roda em rodada natural E em Rodada Extra (sem reiniciar Etapa 1).
// ── ETAPA 2: AÇÃO ─────────────────────────────────────────────────
// Responsabilidade: liberar o personagem para agir.
// Passivas de início de rodada já foram disparadas em tickRoundPassives.
// Roda em rodada natural E em Rodada Extra.
function rodadaEtapa2(a) {
  const ch = a.ch;
  addLog(`🔍 JUIZ (Rodada Etapa 2): ${ch.name} — Ação.`, 'sys');
  addLog(`🔍 JUIZ (Rodada Etapa 2): ${ch.name} — liberado para agir.`, 'sys');

  // ── Libera para agir ──
  if(a.o==='p1') {
    if(a.extra) addLog('⚡ Rodada Extra de '+ch.name,'info');
    else addLog('Vez de '+ch.name,'info');
    render();
  } else {
    if(!_pvpSocket || _pvpSocket.readyState !== WebSocket.OPEN) setTimeout(()=>enemyAI(a),1500);
  }
}

// ── ETAPA 3: FIM DA RODADA ────────────────────────────────────────
// Responsabilidade: passivas de "ao passar", verificações pós-ação,
// ataques em conjunto, contra-ataques, passagem para o próximo.
// Sempre alcançada, independente do caminho da Etapa 2.
// passou=true quando o personagem passou a rodada (não agiu).
function rodadaEtapa3(a, passou) {
  const ch = a.ch;
  addLog(`🔍 JUIZ (Rodada Etapa 3): ${ch.name} — Fim da Rodada${passou?' (passou)':''}.`, 'sys');

  // ── Passivas de "ao passar" ──
  // Disparam quando o personagem passa a rodada (natural ou extra).
  if(passou) {
    draw(a.o, 1, '+1 carta'); // compra carta ao passar sempre

    // Kane: Resgate dos Prisioneiros
    if((ch.id==='kane'||ch.id==='kane_ai')) {
      const r=Math.random();
      const prev=ch._weapon||'pistola';
      if(r<0.25){
        ch._weapon='pistola';
        addLog('🔫 Kane: Pistola — arma mantida.','info');
        floatAccum(ch,'🔫 Pistola');
      } else if(r<0.5){
        ch._weapon='metralhadora';
        addLog('💥 Kane: Metralhadora equipada!','info');
        floatAccum(ch,'💥 Metralhadora');
      } else if(r<0.75){
        ch._weapon='shotgun';
        addLog('💥 Kane: Shotgun equipada!','info');
        floatAccum(ch,'💥 Shotgun');
      } else {
        ch._weapon=prev;
        draw(a.o, 1, '🃏 Resgate');
        addLog('🃏 Kane: Prisioneiro resgatado — carta extra! (arma: '+prev+')','info');
        floatAccum(ch,'🃏 +1 '+prev);
        floatPassiveDraw(ch, 1, '🃏');
      }
      marcoUpdateWeaponSlot(ch);
      refreshIcons(ch);
    }

    // Grimbol: Grande Gênio — +1 carta ao passar
    if((ch.id==='grim'||ch.id==='grim_ai')) {
      judgeCheck('passive_start', { who: ch.name, passive: 'Grande Gênio (skip)', charObj: ch, extra: a.extra, noExtra: false });
      draw(a.o, 1, '🔧 Grande Gênio');
      addLog('🔧 Grimbol: carta extra!','info');
      floatPassiveDraw(ch, 1, '🔧');
    }

    // Sam: Super Velocidade — acumula carga e causa dano em todos
    if((ch.id==='sam'||ch.id==='sam_ai')) {
      judgeCheck('passive_start', { who: ch.name, passive: 'Super Velocidade (skip)', charObj: ch, extra: a.extra, noExtra: false });
      ch._charge = Math.min(5, (ch._charge||0) + 1);
      const sdmg = (ch._charge||0) + 2;
      const svTargets = (ch.owner===a.o ? (a.o==='p1'?G.p2:G.p1) : G[a.o]).chars.filter(e=>e.alive);
      addLog('🔍 JUIZ (Passiva skip): '+ch.name+' Super Velocidade Lv'+ch._charge+' — dano: '+sdmg+' em '+svTargets.length+' alvo(s)', 'sys');
      animSamusZap(ch);
      floatSeq(svTargets, svTarget => {
        dmgChar(svTarget, sdmg);
        floatDmg(svTarget, sdmg);
        floatStatus(svTarget, '⚡ Vel.!', '#00dfff');
      });
      if(svTargets.length) addLog('⚡ Super Velocidade Lv'+ch._charge+': '+sdmg+' dano verdadeiro em TODOS os inimigos! (ignora DEF)','dmg');
      addLog('🔋 Sam: '+ch._charge+'/5 cargas.','info');
      floatStatus(ch, '⚡'+ch._charge+'/5', ch._charge>=5?'#00ffff':'#80d0ff');
      refreshIcons(ch);
      render();
    }

    // Kuro Isamu: Concentração Marcial +2 ao passar
    if((ch.id==='kuro'||ch.id==='kuro_ai')) {
      judgeCheck('passive_start', { who: ch.name, passive: 'Concentração Marcial (skip +2)', charObj: ch, extra: a.extra, noExtra: false });
      const _satsuiSkipAntes = ch._satsui||0;
      ch._satsui = Math.min(10, _satsuiSkipAntes + 2);
      addLog('🔍 JUIZ (Passiva skip): '+ch.name+' Concentração Marcial: '+_satsuiSkipAntes+' → '+ch._satsui+'/10 (+2 skip)', 'sys');
      addLog(`🔥 Kuro Isamu: Concentração Marcial ${ch._satsui}/10.`,'info');
      floatAccum(ch, `🔥${ch._satsui}/10`);
      refreshIcons(ch);
    }

    // Tyren: Acúmulo de Poder ao passar
    if((ch.id==='tyre'||ch.id==='tyre_ai')) {
      judgeCheck('passive_start', { who: ch.name, passive: 'Acúmulo de Poder (skip)', charObj: ch, extra: a.extra, noExtra: false });
      if((ch._linkAccum||0) < 2) {
        ch._linkAccum = (ch._linkAccum||0) + 1;
      }
      addLog('🔍 JUIZ (Passiva skip): '+ch.name+' Acúmulo de Poder → '+ch._linkAccum+'/2', 'sys');
      if(ch._linkAccum===1) addLog('🗡️ Tyren: Avanço Espada ganha Ignora Armadura! (1/2)','info');
      if(ch._linkAccum>=2) addLog('🗡️ Tyren: Avanço Espada atinge TODOS os inimigos! (2/2)','info');
      floatAccum(ch, `🗡️ ${ch._linkAccum}/2`);
      refreshIcons(ch);
    }

    // Elowen: +1 carta por patrulheiro aliado ao passar
    if((ch.id==='pt_elo'||ch.id==='pt_elo_ai')) {
      judgeCheck('passive_start', { who: ch.name, passive: 'Patrulheiro de Combate (skip)', charObj: ch, extra: a.extra, noExtra: false });
      const patrulheiros = G[a.o].chars.filter(c=>c!==ch&&c.alive&&['pt_cae','pt_zar','pt_var','pt_tha','pt_aer'].includes(c.id));
      addLog('🔍 JUIZ (Passiva skip): '+ch.name+' Elowen — '+patrulheiros.length+' patrulheiro(s) → +'+patrulheiros.length+' carta(s)', 'sys');
      patrulheiros.forEach(()=>draw(a.o, 1, '🌸 Elowen'));
      if(patrulheiros.length) {
        addLog(`🌸 Elowen: +${patrulheiros.length} cartas!`,'info');
        floatPassiveDraw(ch, patrulheiros.length, '🌸');
      }
    }

    // Artefato: Manto da Laceração — ao passar rodada, 50% de aplicar Sangramento em todos os inimigos
    var _mantoHasArt = _getCharArtefato(ch.id) === 'art_manto_laceracao';
    if (!_mantoHasArt && ch.isBoss && window._survBossArtefato && window._survBossArtefato.id === 'art_manto_laceracao') {
      _mantoHasArt = true;
    }
    if(_mantoHasArt) {
      if(Math.random() < 0.5) {
        const enemies = (a.o==='p1' ? G.p2 : G.p1).chars.filter(e=>e.alive);
        enemies.forEach(function(e) {
          addSt(e,{id:'bleed',icon:'🩸',label:'Sangramento',turns:2,stacks:1,stackMax:3});
          floatStatus(e,'🩸','#cc2020');
        });
        addLog('🩸 Manto da Laceração: Sangramento aplicado em todos os inimigos!','dmg');
      } else {
        addLog('🩸 Manto da Laceração: sem efeito desta vez.','info');
      }
    }

    // PvP: manda skip pro servidor
    if(_pvpSocket && _pvpSocket.readyState === WebSocket.OPEN) {
      _clearPvpTimers();
      _pvpSkipCount = _pvpSkipCount || 0;
      pvpSend('skip_turn', { skipCount: _pvpSkipCount, charId: ch.id });
      render();
      return;
    }
  }

  // ── Verificações pós-ação, contra-ataques e ataques em conjunto ──
  // já resolvidos antes de chegar aqui (via resolveAttack/executeAction).
  // Esta etapa apenas finaliza e passa para o próximo.

  addLog(`🔍 JUIZ (Rodada Etapa 3): ${ch.name} — Etapa 3 concluída. Passando para o próximo.`, 'sys');
  nextActor();
  render();
}

// ══════════════════════════════════════════════════════════════════
// ETAPA 1.5 — tickActionBlock
// Responsabilidade: verificar se o personagem pode agir.
// Roda em rodada natural E em Rodada Extra.
// Se bloqueado → rodadaEtapa3 (pula ação).
// Se livre     → rodadaEtapa2 (age normalmente).
// ══════════════════════════════════════════════════════════════════
function tickActionBlock(a) {
  const ch = a.ch;
  addLog(`🔍 JUIZ (Etapa 1.5): ${ch.name} — verificando bloqueio.`, 'sys');

  // ── Frozen / Stun (apenas offline — servidor controla no PvP) ──
  if(!(_pvpSocket && _pvpSocket.readyState===WebSocket.OPEN)) {
    const result = checkFrozenStun(ch, a);
    if(result === 'lost') {
      // Bloqueado: rodadaEtapa3 já foi chamada por checkFrozenStun via nextActor
      addLog(`🔍 JUIZ (Etapa 1.5): ${ch.name} — BLOQUEADO. Ação pulada.`, 'sys');
      return;
    }
  }

  // ── Livre: passa para Etapa 2 ──
  addLog(`🔍 JUIZ (Etapa 1.5): ${ch.name} — livre para agir.`, 'sys');
  rodadaEtapa2(a);
}

// ══════════════════════════════════════════════════════════════════
// ETAPA 2.5 — tickFollowUps
// Responsabilidade: resolver tudo que acontece APÓS a ação principal.
// Ordem: joint attack → counter → combo stacks → quick action → extra round.
// Chamado por executeAction e playerSkill após resolveAttack/resolveEffect.
// A lógica de cada sub-tick ainda vive em resolveAttack/executeAction —
// esta função é o ponto de orquestração formal da etapa 2.5.
// ══════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════
// applyTurnStart — ORQUESTRADOR DAS ETAPAS DA RODADA
// Chamado por nextActor para cada personagem na ordem de iniciativa.
// Fluxo: Etapa 1 → Etapa 1.5 → Etapa 2 → (2.5 via resolveAttack) → Etapa 3
// Etapa 3 é chamada por playerPass ou _nextAfterDelay após a ação.
// ══════════════════════════════════════════════════════════════════
function applyTurnStart(a) {
  const ch = a.ch;

  // ── Juiz: registra início da rodada ──
  judgeCheck('turn_start', { who: ch.name });
  addLog(`🔍 JUIZ (Rodada): ${ch.name} — rodada${a.extra?' extra':''} iniciada.`, 'sys');

  // ── Capacete da Visão Cósmica: só em rodada natural ──
  if (!a.extra && _capaceteHasArt(ch)) {
    if (ch.owner === 'p1') {
      // Jogador: abre popup de seleção
      if (G.p1.hand.length > 0) {
        _capaceteOpenPopup(a, function() {
          _applyTurnStartContinue(a);
        });
        return; // aguarda resposta do popup
      }
    } else {
      // IA (boss_t3): descarta automaticamente por prioridade
      _capaceteIaDiscard(ch, 'p2');
      // Continua o fluxo normalmente abaixo
    }
  }

  _applyTurnStartContinue(a);
}

function _applyTurnStartContinue(a) {
  const ch = a.ch;

  // ── Etapa 1: Início da Rodada (não roda em Rodada Extra) ──
  if(!a.extra) {
    const etapa1ok = rodadaEtapa1(a);
    if(!etapa1ok) return; // morreu por DoT
  } else {
    addLog(`🔍 JUIZ (Rodada): ${ch.name} — Rodada Extra, Etapa 1 ignorada.`, 'sys');
  }

  // ── Etapa 1.5: Bloqueio (roda em natural e extra) ──
  tickActionBlock(a);
  // Etapa 2 é chamada por tickActionBlock se livre.
  // Etapa 3 será chamada após a ação do personagem via:
  // - playerPass → rodadaEtapa3(a, true)
  // - _nextAfterDelay / nextActor → rodadaEtapa3(a, false) (implícito via nextActor)
}

function actor() { return G.order[G.orderIdx]; }

// Helper: avança o turno respeitando G._reactDelay (setado pela contagem de floats)
function _nextAfterDelay(extraMs = 0) {
  const d = Math.max(G._reactDelay || 0, extraMs);
  G._reactDelay = 0;
  if (d > 0) setTimeout(() => { if (!G.over) { nextActor(); render(); } }, d);
  else { if (!G.over) { nextActor(); render(); } }
}

function nextActor() {
  if(G&&G.trainingMode) scheduleTrainingFullReset();
  if(G.over) return;
  judgeReset(); // Juiz: reseta estado para próximo personagem
  G.orderIdx++;
  if(G.orderIdx>=G.order.length){ startTurnNew(); return; }
  const a=actor();
  if(!a.ch.alive){nextActor();return;}

  applyTurnStart(a);
}


// ===================== PLAYER ACTIONS =====================
function playerPass(charIdx) {
  const a=actor();
  if(!a||a.o!=='p1') return;
  const ch=G.p1.chars[charIdx];
  if(ch!==a.ch) return;
  closePanel();
  _logEvent(ch.name + ' passa a rodada (mão: ' + G.p1.hand.length + ' cartas)', 'ACTION');
  addLog(`${ch.name} passa a rodada.`,'info');

  // Animação de recuperação
  if (_vfxEnabled) { _animPassTurn(ch); }

  // ── Etapa 3: Fim de Rodada com passou=true ──
  // As passivas de "ao passar" e nextActor são chamados dentro da Etapa 3.
  rodadaEtapa3(a, true);
}

// Após executar uma Ação Rápida do jogador:
// testa frozen/stun. Se 'lost_after' → encerra turno. Senão → abre painel de novo.
function afterQuickAction(ch, charIdx) {
  const result = checkFrozenStun(ch, null, 'quick');
  if(result === 'lost_after') {
    render(); nextActor(); return;
  }
  addLog(`⚡ Ação Rápida! ${ch.name} ainda pode agir.`,'info');
  render();
  openActionsPanel(ch, charIdx);
}

function playerSkill(charIdx, skillIdx) {
  const a=actor();
  if(!a||a.o!=='p1') return;
  const ch=G.p1.chars[charIdx];
  if(ch!==a.ch||!G.p1.hand.length) return;

  const sk=ch.skills[skillIdx];

  // Check Turno:L — blocked on first turn
  if(sk.turno==='L' && ch.firstTurn) {
    addLog(`⛔ ${sk.name} não pode ser usada no primeiro turno! (Turno: L)`,'dmg');
    return;
  }
  // Check Recarga:L — cooldown
  if(ch.cooldowns[sk.id] && ch.cooldowns[sk.id] > 0) {
    addLog(`⏳ ${sk.name} em recarga por mais ${ch.cooldowns[sk.id]} turno(s)!`,'dmg');
    return;
  }



  G.pendingSkill={charIdx,skillIdx,ch,sk};
  G.pendingCardIdx=null;
  closePanel();
  showCardPanel();
}

function applyLentoToPlayer(ch, sk) {
  // Se ch tem Lento e a skill tem recarga N → cooldown vira L (2 turnos)
  if(ch.statuses.find(s=>s.id==='slow') && sk.recarga==='N') {
    judgeCheck('passive_start', { who: ch.name, passive: 'Lento (recarga N→L jogador)', charObj: ch, extra: false, noExtra: false });
    ch.cooldowns[sk.id] = 2;
    addLog('🐢 Lento: '+sk.name+' ganhou recarga L por '+ch.name+' estar Lento!','info');
    judgeCheck('passive_result', { who: ch.name, passive: 'Lento (recarga N→L jogador)', result: sk.name+' cooldown: N → L (2t)' });
  }
}

function isMultiHit(sk) {
  return typeof sk.power === 'string' && sk.power.includes('/');
}

function getHits(sk) {
  if(typeof sk.power === 'string') return sk.power.split('/').map(Number);
  return [sk.power];
}

function cardHtml(card, i, ch, idPrefix, onclick, blocked=false) {
  const s=SUITS[card.suit]||SUITS.neutral;
  const isEspec=card.suit===ch.suit&&card.suit!=='joker'&&ch.suit!=='neutral'&&!isSpecial(card);
  const isEff=isEffectCard(card);
  const glow=isEspec&&!blocked?`box-shadow:0 0 10px 2px ${s.color};border-color:${s.color};`:'';
  const dimStyle=blocked?'opacity:0.28;pointer-events:none;filter:grayscale(0.7);':'';
  const especLbl=isEspec&&!blocked?`<div style="font-size:8px;color:${s.color};text-align:center;font-weight:700">★ESP</div>`:'';
  const effLbl=isEff?`<div style="font-size:7px;color:var(--gold);text-align:center;font-weight:700;letter-spacing:0.5px">EFEITO</div>`:'';
  return `<div class="card s-${card.suit}" id="${idPrefix}${i}" style="${glow}${dimStyle}" onclick="${blocked?'':onclick}">
    <div class="card-corner">${card.val}<br>${s.sym}</div>
    <div class="card-s">${s.sym}</div>
    <div class="card-v">${card.val}</div>
    ${especLbl}${effLbl}
  </div>`;
}

function showCardPanel() {
  const {ch,sk}=G.pendingSkill;
  const hand=G.p1.hand;
  const multi=isMultiHit(sk);
  const hits=getHits(sk);
  G.pendingExtraCards=[];

  const tgtLabel=sk.target==='enemy'?'1 Inimigo':sk.target==='all_enemy'?'Todos Inimigos':sk.target==='all_ally'?'Todos Aliados':sk.target==='all'?'Todos':'Si mesmo';

  // Block special/effect cards in all skills except pure effect skills (power=0 + Encanto/Melhoria/Suporte)
  const isEffectPure = getPow(sk) === 0 && (sk.type === 'Encanto' || sk.type === 'Melhoria' || sk.type === 'Suporte');
  const blockSpecials = !isEffectPure;
  const mainGrid=hand.map((card,i)=>{
    const blocked = blockSpecials && isEffectCard(card);
    return cardHtml(card,i,ch,'pc','pickCard('+i+')',blocked);
  }).join('');
  const hasUsableCards = hand.some((card,i)=>!(blockSpecials&&isEffectCard(card)));

  let multiSection='';
  if(multi && hits.length>1) {
    // Show hit breakdown: 1º golpe + N extras opcionais
    const breakdown=hits.map((p,i)=>`<span style="background:rgba(201,168,76,0.15);border:1px solid rgba(201,168,76,0.4);border-radius:4px;padding:2px 6px;font-size:10px">${i===0?'1º':'+'+(i)+'º'} Golpe: Poder ${p}</span>`).join(' ');
    multiSection=`
    <div style="margin:6px 0;display:flex;gap:4px;flex-wrap:wrap;justify-content:center">${breakdown}</div>
    <div style="font-size:11px;color:var(--text2);margin:4px 0" id="extra-label">Cartas extras opcionais para golpes adicionais (0/${hits.length-1}):</div>
    <div class="card-grid-panel" id="extra-grid"></div>`;
  }

  document.getElementById('panel-title').textContent=multi?`⚔ ${sk.name} — ${hits.length} Golpes`:'Escolha uma Carta';
  document.getElementById('panel-body').innerHTML=`
    <div class="card-panel-info">
      <strong>${sk.name}</strong> — Poder: ${sk.power}<br>
      Tipo: ${sk.type} | Alvo: ${tgtLabel}<br>
      <span style="color:var(--text2)">${sk.desc||'—'}</span>
    </div>
    <div style="font-size:11px;color:var(--text2);margin:4px 0">${multi?'Carta para o 1º golpe (obrigatória):':'Escolha uma carta:'}</div>
    ${blockSpecials?'<div style="font-size:10px;color:var(--gold);margin:2px 0 4px">⚠ Cartas de Efeito (J/Q/K/A/★) não somam dano — use as cartas de valor (2–10).</div>':''}
    <div class="card-grid-panel" id="card-grid">${mainGrid}</div>
    ${multiSection}
    <div class="confirm-row">
      <button class="btn-cancel" onclick="cancelSkill()">Cancelar</button>
      <button class="btn-confirm" id="btn-conf" disabled onclick="confirmSkill()">Confirmar</button>
    </div>`;
  openPanel();
}

function pickCard(idx) {
  if(isCharDetailOpen()) return;
  G.pendingCardIdx=idx;
  // Update main card grid visuals
  document.querySelectorAll('#card-grid .card').forEach(c=>c.classList.remove('sel'));
  const el=document.getElementById('pc'+idx);
  if(el) el.classList.add('sel');
  (()=>{const _el_btn_conf=document.getElementById('btn-conf');if(_el_btn_conf){_el_btn_conf.disabled=false;}})()
  // If multi-hit, rebuild extra card grid excluding selected
  const sk=G.pendingSkill.sk;
  if(isMultiHit(sk)) rebuildExtraGrid();
}

function rebuildExtraGrid() {
  const {ch,sk}=G.pendingSkill;
  const hits=getHits(sk);
  const maxExtra=hits.length-1;
  const extraGrid=document.getElementById('extra-grid');
  const extraLabel=document.getElementById('extra-label');
  if(!extraGrid) return;
  const hand=G.p1.hand;
  const blockSpecialsExtra = isAttackSkill(sk);
  extraGrid.innerHTML=hand.map((card,i)=>{
    if(i===G.pendingCardIdx) return ''; // skip main card
    const s=SUITS[card.suit]||SUITS.neutral;
    const isEspec=card.suit===ch.suit&&card.suit!=='joker'&&ch.suit!=='neutral'&&!isSpecial(card);
    const glow=isEspec?`box-shadow:0 0 8px ${s.color};border-color:${s.color};`:'';
    const especLbl=isEspec?`<div style="font-size:8px;color:${s.color};font-weight:700">★ESP</div>`:'';
    const isExtra=G.pendingExtraCards.includes(i);
    const isBlocked=blockSpecialsExtra && isEffectCard(card);
    const maxed=(G.pendingExtraCards.length>=maxExtra && !isExtra) || isBlocked;
    const hitNum=isExtra?G.pendingExtraCards.indexOf(i)+2:null;
    const effLbl=isEffectCard(card)?`<div style="font-size:7px;color:var(--gold);font-weight:700">EFEITO</div>`:'';
    return `<div class="card s-${card.suit} ${isExtra?'sel':''}"
      onclick="${maxed?'':'toggleExtraCard('+i+')'}"
      style="${glow}${maxed?'opacity:'+(isBlocked?'0.25':'0.35')+';':''}cursor:${maxed?'not-allowed':'pointer'}">
      <div class="card-corner">${card.val}<br>${s.sym}</div>
      <div class="card-s">${s.sym}</div>
      <div class="card-v">${card.val}</div>
      ${especLbl}${effLbl}
      ${hitNum?`<div style="font-size:9px;color:var(--gold);text-align:center;font-weight:700">${hitNum}º golpe</div>`:''}
    </div>`;
  }).join('');
  if(extraLabel) extraLabel.textContent=`Cartas extras opcionais para golpes adicionais (${G.pendingExtraCards.length}/${maxExtra}):`;
}

function toggleExtraCard(idx) {
  const sk=G.pendingSkill.sk;
  const hits=getHits(sk);
  const maxExtra=hits.length-1;
  const pos=G.pendingExtraCards.indexOf(idx);
  if(pos>=0) G.pendingExtraCards.splice(pos,1);
  else if(G.pendingExtraCards.length<maxExtra) G.pendingExtraCards.push(idx);
  rebuildExtraGrid();
}

function confirmSkill() {
  if(G.pendingCardIdx===null) return;
  closePanel();
  let {charIdx,ch,sk}=G.pendingSkill;
  var atkC = G.p1.hand[G.pendingCardIdx];
  _logEvent(ch.name + ' confirma skill: ' + sk.name + ' (POW:' + sk.power + ') com carta ' + (atkC ? atkC.val + ' ' + atkC.suit : '?'), 'ACTION');

  // Sam: inject charge into Feixe skills before resolving
  if((ch.id==='sam'||ch.id==='sam_ai') && (sk.id==='fpl'||sk.id==='ffr')) {
    const charges = ch._charge||0;
    const ignoreArmor = sk.id==='fpl'; // Plasma ignores armor
    sk = {...sk, power: charges, _samusCharge: charges, _ignoreArmor: ignoreArmor};
    // Max charges: upgrade to all_enemy
    if(charges>=5) {
      sk = {...sk, target:'all_enemy'};
      addLog('⚡ SAMUS CARGA MÁXIMA! Feixe atinge TODOS os inimigos!','info');
      floatStatus(ch, '⚡ MÁXIMO!', '#00ffff');
    }
    G.pendingSkill = {...G.pendingSkill, sk};
  }

  // Discard extra cards first (sort descending to not shift indices)
  const extraIdxsSorted = [...(G.pendingExtraCards||[])].sort((a,b)=>b-a);
  const extraCards = [];
  extraIdxsSorted.forEach(i => extraCards.unshift(discard('p1', i)));

  // Adjust main card index if extras were at lower positions
  let mainIdx = G.pendingCardIdx;
  extraIdxsSorted.forEach(i => { if(i < mainIdx) mainIdx--; });
  const atkCard = discard('p1', mainIdx);

  G.pendingAtkCard = atkCard;
  G.pendingExtraCards = [];

  // Apply skill tags
  // Presença de Nimb (Dee): se _nimb ativo, esta ação é Rápida e consome o buff
  if((ch.id==='nyxa'||ch.id==='nyxa_ai') && ch._nimb) {
    sk = {...sk, acao:'Rápida', _nimbRapida:true};
    ch._nimb = false;
    ch.statuses = ch.statuses.filter(s=>s.id!=='nimb_ativo');
    G.pendingSkill = {...G.pendingSkill, sk}; // propaga acao:'Rápida' para selectTarget
    addLog(`🪙 Nimb: ${sk.name} age como Ação Rápida!`,'info');
    floatStatus(ch,'🪙 Rápida!','#b060e0');
  }
  const isQuick=sk.acao==='Rápida';
  const isExtra=!!(actor().extra);
  // firstTurn é consumido apenas quando o ataque é efetivamente resolvido (selectTarget)
  // Aqui apenas registramos se deve ser consumido, para o cancelSkill não afetar
  // Cooldown ao usar habilidades — regras:
  // Recarga L (qualquer ação)  → cooldown=2 → pula 1 rodada, disponível na 2ª
  // Recarga N + Ação Rápida    → cooldown=1 → disponível apenas na próxima rodada (evita loop)
  // Recarga N + Ação Normal    → sem cooldown (comportamento padrão)
  // Cooldown será aplicado em selectTarget, após confirmar o alvo.
  // Assim cancelar a seleção não aplica recarga prematuramente.
  // (Exceção: self e all_ally aplicam imediatamente pois não passam por targeting)
  const _pendingCooldown = () => {
    if(sk.recarga==='L') {
      ch.cooldowns[sk.id]=2;
      addLog(`⏳ ${sk.name} entra em recarga por 2 turnos.`,'info');
    } else if(isQuick && !sk._nimbRapida) {
      ch.cooldowns[sk.id]=1;
      addLog(`⏳ ${sk.name} (Ação Rápida) bloqueada até a próxima rodada.`,'info');
    }
    applyLentoToPlayer(ch, sk);
  };

  // Arcabuz: habilidade simples com recarga, sem efeito especial

  // Gorath: ATACARRRR — injeta bônus acumulado de Agora é Sério
  if((ch.id==='gora'||ch.id==='gora_ai') && sk.id==='atc' && ch._agoraSerio && (ch._agoraSerioPow||0) > 0) {
    const bonus = ch._agoraSerioPow;
    sk = {...sk, power: sk.power + bonus};
    G.pendingSkill = {...G.pendingSkill, sk};
    addLog('⚔️ ATACARRRR potencializado! +'+bonus+' de bônus (Agora é Sério). Poder total: '+sk.power,'info');
    floatStatus(ch,'⚔️ +'+bonus+' ATAQUE!','#ff4040');
  }

  // Kuro Isamu: Seiken Tsuki — verifica Marca e dobra poder se já marcado
  if(((ch.id==='kuro'||ch.id==='kuro_ai')) && sk.id==='sho') {
    const alvo = G.p2.chars.filter(c=>c.alive)[0]; // preview — alvo real vem no targeting
    ch._ryuShoMarcado = alvo ? !!alvo.statuses.find(s=>s.id==='marcado') : false;
    if(ch._ryuShoMarcado) {
      sk = {...sk, power: sk.power * 2, _ryuShoExplode: true};
      G.pendingSkill = {...G.pendingSkill, sk};
      addLog('🎯 Seiken Tsuki: alvo JÁ Marcado → Poder ×2! Marca renovada.','info');
      floatStatus(ch,'🎯 ×2 COMBO!','#ff8800');
    }
  }

  // Kuro Isamu: Kohouken — injeta poder das cargas de Concentração Marcial
  if(((ch.id==='kuro'||ch.id==='kuro_ai')) && sk.id==='had') {
    const cargas = ch._satsui || 0;
    const bonus = cargas * 2;
    sk = {...sk, power: 5 + bonus, _ryuHadCargas: cargas};
    G.pendingSkill = {...G.pendingSkill, sk};
    addLog(`🔥 Kohouken: POW 5 + Conc.(${cargas}×2=${bonus}) = POW ${sk.power}`,'info');
    floatStatus(ch,`🔥 POW${sk.power}`,'#ff6600');
  }

  if(sk.target==='self'){
    _pendingCooldown();
    addLog(`${ch.name} usa ${sk.name}.`,'info');
    _showSkillFlash(sk, ch).then(() => {
      const held = selfSkillEffect(ch,sk,atkCard);
      if(held) return;
      G.pendingSkill=null; G.pendingCardIdx=null;
      // PvP: se pvpSend foi disparado dentro de selfSkillEffect (rou, sen, ago),
      // não avança turno local — servidor manda next_turn de volta
      if (_pvpSocket && _pvpSocket.readyState === WebSocket.OPEN &&
          (sk.id === 'rou' || sk.id === 'sen')) {
        render();
        return;
      }
      if(isQuick){afterQuickAction(ch,charIdx);}
      else nextActor();
      render();
    });
    return;
  }
  if(sk.target==='all_ally'){
    _pendingCooldown();
    addLog(`${ch.name} usa ${sk.name} em todos os aliados!`,'info');
    const allies=G.p1.chars.filter(c=>c.alive);
    const _cardNvSupport = (!isSpecial(atkCard) && atkCard.suit===ch.suit && atkCard.suit!=='joker' && ch.suit!=='neutral') ? atkCard.nv*2 : atkCard.nv;
    if(_cardNvSupport > atkCard.nv) { addLog(`✨ Especialidade! ${ch.name}: carta ${atkCard.val}${SUITS[atkCard.suit]?SUITS[atkCard.suit].sym:''} vale ${_cardNvSupport} (dobrado).`,'info'); showAdvTag(ch,`✨ Esp. +${atkCard.nv}`,'var(--gold)'); }
    const pow=getPow(sk), total=ch.curAtq+pow+_cardNvSupport;
    const d=sk.desc.toLowerCase();
    // PvP: manda pro servidor e aguarda action_result isAlly:true — não processa local
    if (_pvpSocket && _pvpSocket.readyState === WebSocket.OPEN) {
      _clearPvpTimers();
      G.pendingSkill=null; G.pendingCardIdx=null;
      pvpSend('action', {
        charId: ch.id, skillId: sk.id,
        atkCardNv: _cardNvSupport, atkCardSuit: atkCard.suit,
        targetId: (G.p2.chars.find(function(c){return c.alive;})||G.p1.chars.find(function(c){return c.alive&&c.id!==ch.id;})||ch).id,
        isQuickAction: isQuick
      });
      addLog('⚔ [Railway] ' + ch.name + ' usa ' + sk.name + ' em todos os aliados...', 'sys');
      render();
      return;
    }
    _showSkillFlash(sk, ch).then(() => {
      floatSeq(allies, t => {
        if(d.includes('cura')){t.hp=Math.min(t.maxHp,t.hp+total);floatHeal(t,total);addLog('💚 '+t.name+' curado: +'+total+' PVS','heal');}
        else if(d.includes('escudo')){addSt(t,{id:'shield',icon:'🛡️',label:'Escudo('+total+')',turns:2,val:total});floatArmor(t,total);addLog('🛡️ '+t.name+' recebe Escudo '+total,'heal');}
        else if(d.includes('fortalecido')){t.curAtq=Math.floor(t.curAtq*1.5);addSt(t,{id:'fort_atq',icon:'⬆️',label:'Fortalecido',turns:2});floatStatus(t,'⬆️ ATQ+','#60e060');addLog('⬆️ '+t.name+' Fortalecido!','heal');}
        else if(d.includes('imagem espelhada')){addSt(t,{id:'mirror',icon:'🪞',label:'Im. Espelhada',turns:2});floatStatus(t,'🪞 Espelho!','#a0c0ff');addLog('🪞 '+t.name+' Imagem Espelhada!','heal');}
      }).then(() => {
        G.pendingSkill=null; G.pendingCardIdx=null;
        
        if(isQuick){afterQuickAction(ch,charIdx);}
        else nextActor();
        render();
      });
    });
    return;
  }
  if(sk.target==='all_enemy'){
    G.pendingAllEnemyTargets = G.p2.chars.filter(t=>t.alive);
    G.pendingExtraCardsForTarget = extraCards;
    G.phase = 'targeting_all';
    (()=>{const _tb2=document.getElementById('target-banner'); if(_tb2) _tb2.textContent='Confirme — Atinge TODOS os inimigos';})();
    (()=>{const _tb3=document.getElementById('target-banner'); if(_tb3){_tb3.classList.add('on');} document.getElementById('target-cancel-btn').style.display='block';})();
    addLog('Toque em qualquer inimigo para confirmar o ataque em todos.','info');
    render();
    return;
  }

  if(sk.target==='all'){
    _pendingCooldown();
    addLog(`${ch.name} usa ${sk.name} em TODOS!`,'info');
    floatStatus(ch,'🎲 Azar ou Sorte!','var(--gold)');
    const all=[...G.p1.chars,...G.p2.chars].filter(c=>c.alive);
    const _cardNvAll = (!isSpecial(atkCard) && atkCard.suit===ch.suit && atkCard.suit!=='joker' && ch.suit!=='neutral') ? atkCard.nv*2 : atkCard.nv;
    if(_cardNvAll > atkCard.nv) { addLog(`✨ Especialidade! ${ch.name}: carta ${atkCard.val}${SUITS[atkCard.suit]?SUITS[atkCard.suit].sym:''} vale ${_cardNvAll} (dobrado).`,'info'); showAdvTag(ch,`✨ Esp. +${atkCard.nv}`,'var(--gold)'); }
    const pow=getPow(sk), base=ch.curAtq+pow+_cardNvAll;
    floatSeq(all, t => {
      if(Math.random()<0.5){
        const final=Math.max(0,base-t.curDef);
        addLog(`🎲 ${t.name}: FALHA → ${final} dano (base ${base} - DEF ${t.curDef})`,'dmg');
        floatStatus(t,'💀 Dano!','#ff4040');
        dmgChar(t,final);
      } else {
        const prev=t.hp;
        t.hp=Math.min(t.maxHp,t.hp+base);
        addLog(`🎲 ${t.name}: SUCESSO → +${t.hp-prev} cura`,'heal');
        floatHeal(t,t.hp-prev);
      }
    }).then(() => {
      G.pendingSkill=null; G.pendingCardIdx=null;
      if(!G.over){
        if(isQuick){afterQuickAction(ch,charIdx);}
        else nextActor();
        render();
      }
    });
    return;
  }

  // Tyren Avanco Espada upgrade













  // Tyren Avanco Espada upgrade
  let effectiveSk = sk;
  if((ch.id==='tyre'||ch.id==='tyre_ai') && sk.id==='aes' && ch._linkAccum) {
    if(ch._linkAccum>=2) {
      effectiveSk = {...sk, target:'all_enemy', _linkUpgraded:true};
      addLog('Avanco Espada NIVEL 2: atinge TODOS os inimigos!','info');
    } else {
      effectiveSk = {...sk, _ignoreArmor:true, _linkUpgraded:true};
      addLog('Avanco Espada NIVEL 1: Ignora Armadura!','info');
    }
    G.pendingSkill = {...G.pendingSkill, sk:effectiveSk};
  }
  if(effectiveSk.target==='all_enemy') {
    G.pendingAllEnemyTargets = G.p2.chars.filter(t=>t.alive);
    G.pendingExtraCardsForTarget = extraCards;
    G.phase = 'targeting_all';
    document.getElementById('target-banner').textContent = 'Avanco Espada — Confirme ataque em TODOS';
    document.getElementById('target-banner').classList.add('on'); document.getElementById('target-cancel-btn').style.display='block';
    render();
    return;
  }
  G.pendingExtraCardsForTarget = extraCards;
  G.phase='targeting';
  document.getElementById('target-banner').classList.add('on'); document.getElementById('target-cancel-btn').style.display='block';
  addLog('Toque em um inimigo para atacar com ' + effectiveSk.name + '.','info');
  render();
}

function selfSkillEffect(ch,sk,card) {
  addLog(ch.name+' usa '+sk.name+'.','info');

  // Agora é Sério (Gorath): ativa modo de acumulação — cada ataque recebido +4 no ATACARRRR
  if((ch.id==='gora'||ch.id==='gora_ai') && sk.id==='ago') {
    judgeCheck('passive_start', { who: ch.name, passive: 'Agora é Sério (ativação)', charObj: ch, extra: false, noExtra: false });
    ch._agoraSerio = true;
    ch._agoraSerioPow = 0; // bonus acumulado até agora
    // Flag: expira no FINAL do próximo turno de Gorath (não início)
    ch._agoraSerioCooldown = 2; // conta: 2 = "este turno + próximo turno completo"
    addLog('⚔️ AGORA É SÉRIO! Gorath acumulará +4 poder em ATACARRRR a cada golpe recebido!','info');
    floatStatus(ch,'⚔️ SÉRIO!','#ff4040');
    addSt(ch,{id:'agora_serio',icon:'⚔️',label:'Agora é Sério: +4 ATACARRRR/golpe',turns:999});
    judgeCheck('passive_result', { who: ch.name, passive: 'Agora é Sério (ativação)', result: 'Modo ativado — +4 ATACARRRR por golpe recebido. Expira em 2 turnos.' });
    // PvP: notifica servidor para setar _agoraSerio no state
    // usa primeiro inimigo vivo como targetId (servidor trata ago como efeito puro, alvo não importa)
    const _agoFakeTarget = G.p2.chars.find(c=>c.alive);
    if(_agoFakeTarget) pvpSend('action', { charId: ch.id, skillId: sk.id, targetId: _agoFakeTarget.id, isQuickAction: false, atkCardNv: 0, atkCardSuit: 'neutral' });
  }

  // Roupas Encantadas do Tyren
  if((ch.id==='tyre'||ch.id==='tyre_ai') && sk.id==='rou') {
    // Ciclo: sem roupa → verde → azul → vermelha → verde
    const current = ch._outfit || null;
    const next = !current?'verde':current==='verde'?'azul':current==='azul'?'vermelha':'verde';
    judgeCheck('passive_start', { who: ch.name, passive: 'Roupas Encantadas (ciclo)', charObj: ch, extra: false, noExtra: false });

    // Mark previous outfit(s) to linger until end of Tyren's next natural turn
    ch.statuses.forEach(s => {
      if(['outfit_verde','outfit_azul','outfit_vermelha'].includes(s.id)) {
        s._lingersUntilNextLinkTurn = true;
        s.label += ' (até próx. rodada)';
      }
    });

    ch._outfit = next; // track for cycle

    // Apply new outfit status alongside the lingering one
    addSt(ch,{
      id: 'outfit_'+next,
      icon: next==='verde'?'🟢':next==='azul'?'🔵':'🔴',
      label: next==='verde'?'Roupa Verde: regen 3/turno':
             next==='azul' ?'Roupa Azul: bloqueia ataques':
                            'Roupa Vermelha: contra-ataca',
      turns:999
    });

    if(next==='verde')    addLog('🟢 Tyren: Roupa Verde! Regenera 3 PVS por turno.','heal');
    else if(next==='azul') addLog('🔵 Tyren: Roupa Azul! Entra na frente de ataques em aliados (nao Rapidos/Furtivos), tomando o dano no lugar.','info');
    else                  addLog('🔴 Tyren: Roupa Vermelha! Contra-ataca com Avanco Escudo.','info');
    judgeCheck('passive_result', { who: ch.name, passive: 'Roupas Encantadas (ciclo)', result: 'Roupa anterior: '+(current||'nenhuma')+' → nova: '+next });
    // PvP: notifica servidor da troca de roupa (targetId = inimigo para passar validação)
    if (_pvpSocket && _pvpSocket.readyState === WebSocket.OPEN) {
      const _rouMySide = G.p1.chars.find(c=>c.id===ch.id) ? 'p2' : 'p1';
      const _rouFakeTarget = G[_rouMySide].chars.find(c=>c.alive);
      if (_rouFakeTarget) pvpSend('action', {
        charId: ch.id, skillId: sk.id,
        targetId: _rouFakeTarget.id,
        atkCardNv: 0, atkCardSuit: 'neutral',
        isQuickAction: true,
        outfitNext: next
      });
    }
  }

  // Instinto Reflexivo (Van Carl Voss): aplica esquiva do próximo ataque + marca rodada extra
  if((ch.id==='voss'||ch.id==='voss_ai') && sk.id==='sen') {
    judgeCheck('passive_start', { who: ch.name, passive: 'Instinto Reflexivo (ativação)', charObj: ch, extra: false, noExtra: false });
    addSt(ch,{id:'mirror',icon:'🕷️',label:'Instinto Reflexivo: Esquiva',turns:1});
    ch._spiderExtraTurn = true; // se esquivar, ganha rodada extra
    addLog('🕷️ Instinto Reflexivo ativo! Próximo ataque único será esquivado — se funcionar, ganha rodada extra.','info');
    floatStatus(ch,'🕷️ ESQUIVA!','#4080ff');
    judgeCheck('passive_result', { who: ch.name, passive: 'Instinto Reflexivo (ativação)', result: 'Esquiva ativada (1t) — se esquivar, ganha Rodada Extra' });
    return;
  }

  // Máscara de Faces (Dee): abre painel de escolha visual — não aplica automaticamente
  if((ch.id==='nyxa'||ch.id==='nyxa_ai') && sk.id==='mas') {
    judgeCheck('passive_start', { who: ch.name, passive: 'Máscara de Faces (escolha)', charObj: ch, extra: false, noExtra: false });
    ch.statuses = ch.statuses.filter(s=>s.id!=='masc_feliz'&&s.id!=='masc_triste');
    // Salva contexto para deeMascaraEscolha continuar o turno corretamente
    G._deeMascaraCtx = { isQuick: sk.acao==='Rápida', charIdx: G.pendingSkill ? G.pendingSkill.charIdx : null };
    G.pendingSkill=null; G.pendingCardIdx=null;
    // Bloqueia o X do painel durante a escolha
    const panelX = document.querySelector('.panel-x');
    if(panelX) panelX.style.display='none';
    document.getElementById('panel-title').textContent='😊 Máscara de Faces — Escolha a Condição';
    document.getElementById('panel-body').innerHTML=`
      <div style="font-size:12px;color:var(--text2);text-align:center;padding:4px 0 8px">Escolha a condição que permanecerá por 2 turnos:</div>
      <button class="btn-gold" style="width:100%;font-size:14px;padding:14px" onclick="deeMascaraEscolha('feliz')">
        😊 Feliz<br><span style="font-size:10px;font-family:sans-serif;letter-spacing:0;font-weight:normal">Contra-ataca quando um aliado for atacado</span>
      </button>
      <button class="btn-gold" style="width:100%;font-size:14px;padding:14px;background:linear-gradient(135deg,#4455aa,#223388)" onclick="deeMascaraEscolha('triste')">
        😢 Triste<br><span style="font-size:10px;font-family:sans-serif;letter-spacing:0;font-weight:normal">Ataca junto quando um aliado atacar</span>
      </button>`;
    judgeCheck('passive_result', { who: ch.name, passive: 'Máscara de Faces (escolha)', result: 'Painel de escolha aberto — aguardando seleção do jogador' });
    openPanel();
    return true; // sinaliza para confirmSkill não avançar o turno
  }
}

function selectTarget(charIdx) {
  if(isCharDetailOpen()) return;
  if(isSkillAnimLocked()) return;
  if(G.phase==='targeting_all') {
    document.getElementById('target-banner').classList.remove('on'); document.getElementById('target-cancel-btn').style.display='none';
    document.getElementById('target-banner').textContent = 'Toque em um inimigo para atacar';
    G.phase='player_action';
    const {ch,sk,charIdx:charIdx2}=G.pendingSkill;
    const atkCard=G.pendingAtkCard;
    const extraCards=G.pendingExtraCardsForTarget||[];
    const targets=G.pendingAllEnemyTargets||[];
    addLog(ch.name+' usa '+sk.name+' em todos os inimigos! Cada um pode defender.','info');
    if(sk._linkUpgraded && (ch.id==='tyre'||ch.id==='tyre_ai')) { ch._linkAccum=0; }
    const isQuick2=sk.acao==='Rápida';
    // Aplica cooldown agora que o alvo foi confirmado
    if(sk.recarga==='L') { ch.cooldowns[sk.id]=2; addLog(`⏳ ${sk.name} entra em recarga.`,'info'); }
    else if(isQuick2 && !sk._nimbRapida) { ch.cooldowns[sk.id]=1; }
    applyLentoToPlayer(ch, sk);
    const savedCh=ch, savedIdx2=charIdx2;
    const _isExtra2=!!(actor()&&actor().extra);
    
    G.pendingSkill=null; G.pendingCardIdx=null; G.pendingAtkCard=null;
    G.pendingExtraCardsForTarget=[]; G.pendingAllEnemyTargets=[];
    render();

    // PvP: manda pro servidor antes da animação
    if (_pvpSocket && _pvpSocket.readyState === WebSocket.OPEN) {
      _clearPvpTimers();
      var _areaTargetIdsPvp = targets.filter(function(c) { return c.alive; }).map(function(c) { return c.id; });
      pvpSend('action', {
        charId: ch.id,
        skillId: sk.id,
        atkCardNv: atkCard ? atkCard.nv : 0,
        atkCardSuit: atkCard ? atkCard.suit : 'neutral',
        targetIds: _areaTargetIdsPvp,
        isArea: true
      });
      addLog('⚔ [Railway] ' + ch.name + ' usa ' + sk.name + ' em área...', 'sys');
    }

    // Animação: avança até cada alvo em sequência, impacto ao chegar
    playSkillAnimation(ch, sk, targets, (tgt) => {
      showAreaTargetedAnim();
    }).then(() => {
      // PvP: não processa área localmente — servidor controla
      if (_pvpSocket && _pvpSocket.readyState === WebSocket.OPEN) return;
      startAreaDefense(ch, sk, atkCard, extraCards, targets, 'p1', ()=>{
        if(G._pendingClubsAtk) {
          const fu=G._pendingClubsAtk; G._pendingClubsAtk=null;
          G._clubsAfterQuick = isQuick2?{ch:savedCh,idx:savedIdx2}:null;
          if(fu.target.alive||fu.isAllEnemy) showClubsFollowUp(fu);
          else afterClubsFu(isQuick2,savedCh,savedIdx2);
        } else if(isQuick2){
          addLog('Acao Rapida! '+savedCh.name+' ainda pode agir.','info');
          render(); openActionsPanel(savedCh,savedIdx2);
        } else { nextActor(); render(); }
      });
    });
    return;
  }
  if(G.phase!=='targeting') return;
  let t=G.p2.chars[charIdx];
  if(!t.alive) return;
  _logEvent('Alvo selecionado: ' + t.name, 'ACTION');
  showTargetedAnim(t);
  document.getElementById('target-banner').classList.remove('on'); document.getElementById('target-cancel-btn').style.display='none';
  G.phase='player_action';

  const {ch,sk,charIdx:charIdx2}=G.pendingSkill;
  const atkCard=G.pendingAtkCard; // stored during confirmSkill

  // Encantado: 50% de chance do jogador atacar aliado próprio
  if(sk.acao!=='F' && ch.statuses.find(s=>s.id==='encantado') && Math.random()<0.5) {
    const ownAllies = G.p1.chars.filter(c2=>c2.alive&&c2!==ch);
    if(ownAllies.length) {
      const redirTarget = ownAllies[Math.floor(Math.random()*ownAllies.length)];
      ch.statuses = ch.statuses.filter(s=>s.id!=='encantado');
      addLog('🎭 '+ch.name+' está Encantado! Ataque redirecionado para '+redirTarget.name+'!','dmg');
      floatStatus(ch,'🎭 Encantado!','#b060e0');
      floatStatus(redirTarget,'🎭 ALVO!','#c060ff');
      showTargetedAnim(redirTarget);
      // Resolve ataque no aliado direto (sem defesa)
      const _isQuickEnc = sk.acao==='Rápida';
      if(sk.recarga==='L') { ch.cooldowns[sk.id]=2; }
      else if(_isQuickEnc && !sk._nimbRapida) { ch.cooldowns[sk.id]=1; }
      G.pendingSkill=null; G.pendingCardIdx=null; G.pendingAtkCard=null;
      G.pendingExtraCardsForTarget=[];
      playSkillAnimation(ch, sk, [redirTarget], ()=>{
        resolveMultiHit(ch, sk, atkCard, [], redirTarget, null, 'p1');
      }).then(()=>{
        if(!G.over) {
          if(_isQuickEnc) { afterQuickAction(ch, charIdx2); }
          else { nextActor(); render(); }
        }
      });
      return;
    }
  }
  // Encantado falhou (50%) ou sem aliados — remove e loga
  if(ch.statuses.find(s=>s.id==='encantado')) {
    ch.statuses = ch.statuses.filter(s=>s.id!=='encantado');
    addLog('🎭 '+ch.name+' resistiu ao Encantamento! Ataque segue normal.','info');
    floatStatus(ch,'🎭 Resistiu!','#80ff80');
  }

  // Aplica cooldown agora que o alvo foi confirmado
  const _isQuickSel = sk.acao==='Rápida';
  if(sk.recarga==='L') { ch.cooldowns[sk.id]=2; addLog(`⏳ ${sk.name} entra em recarga.`,'info'); }
  else if(_isQuickSel && !sk._nimbRapida) { ch.cooldowns[sk.id]=1; }
  applyLentoToPlayer(ch, sk);

  // ── PvP: manda pro servidor e aguarda (ataque 1x1) ──
  if (_pvpSocket && _pvpSocket.readyState === WebSocket.OPEN) {
    _clearPvpTimers();
    const _pvpAtkCard = atkCard;
    G.pendingSkill=null; G.pendingCardIdx=null; G.pendingAtkCard=null;
    G.pendingExtraCardsForTarget=[];
    pvpSend('action', {
      charId: ch.id,
      skillId: sk.id,
      atkCardNv: _pvpAtkCard ? _pvpAtkCard.nv : 0,
      atkCardSuit: _pvpAtkCard ? _pvpAtkCard.suit : 'neutral',
      extraCardNvs: (G.pendingExtraCardsForTarget||[]).map(function(c){return c.nv;}),
      targetId: t.id,
      isQuickAction: _isQuickSel
    });
    addLog('⚔ [Railway] ' + ch.name + ' usa ' + sk.name + ' em ' + t.name + (_isQuickSel ? ' [Ação Rápida]' : '') + '...', 'sys');
    render();
    return;
  }

  // ── Intercepções P2: mudam o alvo ANTES da defesa da IA ──
  var _judgeOrigTargetST = t;
  // Aeryn Patrulheiro Líder — entra na frente se aliado ≤20% HP
  if(t.id!=='pt_aer' && sk.target==='enemy' && sk.acao!=='F') {
    const _aerLidS = G.p2.chars.find(c=>(c.id==='pt_aer'||c.id==='pt_aer_ai')&&c.alive&&c!==t);
    if(_aerLidS && (t.hp/t.maxHp) <= 0.20) {
      addLog('🤍 Patrulheiro Líder! Aeryn cobre '+t.name+' (baixa vida)!','info');
      floatStatus(_aerLidS,'🤍 LIDERA!','#e0e0ff');
      animIntercept(_aerLidS);
      t = _aerLidS;
    }
  }
  // Tyren Roupa Azul — entra na frente
  if(t.id!=='tyre' && sk.acao!=='Rápida' && sk.acao!=='F') {
    const _tyrS = G.p2.chars.find(c=>(c.id==='tyre'||c.id==='tyre_ai')&&c.alive&&c.statuses.find(s=>s.id==='outfit_azul'));
    if(_tyrS) {
      addLog('🔵 Roupa Azul: Tyren entra na frente de '+t.name+'!','info');
      animIntercept(_tyrS);
      t = _tyrS;
    }
  }
  // Gorath Defender os Fracos — entra na frente
  if(t.id!=='gora' && sk.target==='enemy' && sk.acao!=='Rápida' && sk.acao!=='F') {
    const _goraS = G.p2.chars.find(c=>(c.id==='gora'||c.id==='gora_ai')&&c.alive&&c!==t);
    if(_goraS) {
      addLog('💪 Defender os Fracos! Gorath entra na frente de '+t.name+'!','info');
      floatStatus(_goraS,'💪 DEFENDE!','#ff8040');
      animIntercept(_goraS);
      t = _goraS;
    }
  }
  // Voss Protetor Instintivo — 50% entra na frente
  if(t.id!=='voss' && sk.acao!=='F') {
    const _vossS = G.p2.chars.find(c=>(c.id==='voss'||c.id==='voss_ai')&&c.alive&&c!==t);
    if(_vossS && Math.random()<0.5) {
      addLog('🕷️ Protetor Instintivo! Voss intercede por '+t.name+'!','info');
      floatStatus(_vossS,'🕷️ INTERCEDE!','#4080ff');
      animIntercept(_vossS);
      t = _vossS;
    }
  }
  // ── JUIZ: verificar intercepção (selectTarget) ──
  if(_judgeOrigTargetST !== t) {
    addLog('🔍 JUIZ (Intercepção): Alvo original '+_judgeOrigTargetST.name+' → interceptado por '+t.name, 'sys');
  }

  // Mirror check for AI target (single) — before defense decision
  const _singleMirror = t.statuses.find(s=>s.id==='mirror');
  if(_singleMirror && sk.acao!=='F' && Math.random()<0.5) {
    t.statuses = t.statuses.filter(s=>s.id!=='mirror');
    addLog('🪞 '+t.name+' usou Imagem Espelhada — esquivou do ataque de '+ch.name+'!','heal');
    floatStatus(t,'🪞 ESQUIVOU!','#a0c0ff');
    showAdvTag(t,'🪞 ESQUIVA!','#a0c0ff');
    G.pendingSkill=null; G.pendingCardIdx=null; G.pendingAtkCard=null;
    G.pendingExtraCardsForTarget=[];
    render();
    if(_isQuickSel) {
      afterQuickAction(ch, charIdx2);
    } else { nextActor(); render(); }
    return;
  }

  // Encantado check for AI target — AI cannot defend when encantado
  const _singleEncantado = t.statuses.find(s=>s.id==='encantado');
  if(_singleEncantado) {
    addLog('🎭 '+t.name+' está Encantado — sem carta de defesa!','info');
    floatStatus(t,'🎭 Sem Defesa!','#b060e0');
  }

  // ── EFEITO PURO (player): power=0 + Encanto/Melhoria/Suporte → sem defesa, sem dano ──
  if(getPow(sk)===0 && (sk.type==='Encanto'||sk.type==='Melhoria'||sk.type==='Suporte')) {
    const _eff_ch = ch, _eff_sk = sk, _eff_card = atkCard, _eff_t = t;
    const _effQuick = sk.acao==='Rápida';
    const _effIdx = charIdx2;
    G.pendingSkill=null; G.pendingCardIdx=null; G.pendingAtkCard=null;
    G.pendingExtraCardsForTarget=[];
    addLog(_eff_ch.name+' usa '+_eff_sk.name+' em '+_eff_t.name+'!','info');
    playSkillAnimation(_eff_ch, _eff_sk, [_eff_t], null).then(function() {
      resolveEffect(_eff_ch, _eff_sk, _eff_card, _eff_t, null, 'p1').then(function() {
        render();
        if(!G.over) {
          if(_effQuick) { afterQuickAction(_eff_ch, _effIdx); }
          else { nextActor(); render(); }
        }
      });
    });
    return;
  }

  // AI smart defense using aiShouldDefend
  let defCard=null;
  if(G.p2.hand.length>0 && !_singleEncantado) {
    const _pow = getPow(sk);
    const _estDmg = Math.max(0, (ch.curAtq + _pow) - t.curDef);
    const _def = aiShouldDefend(G.p2.hand, _estDmg, t);
    if(_def.useCard && _def.cardIdx!==null) {
      if(_def.useJack) {
        addLog('🛡️ IA: '+t.name+' usa Valete — ESQUIVA total!','info');
        floatStatus(t, 'J ESQUIVA!', '#80ff80');
      } else {
        addLog('🛡️ IA: '+t.name+' defende com carta ('+G.p2.hand[_def.cardIdx].val+').','info');
        floatStatus(t, '🛡️ Defende!', '#a0c0ff');
      }
      defCard=G.p2.hand[_def.cardIdx]; discard('p2',_def.cardIdx);
    }
  }

  // ── Animação JRPG antes de resolver o dano ──
  {
    const _sk_anim = sk;
    const _t_anim  = t;
    const _ch_anim = ch;
    const _df_anim = defCard;
    const _atkCard = atkCard;
    const _wasQuick = sk.acao==='Rápida';
    const _savedIdx = charIdx2;
    const _isExtra3 = !!(actor()&&actor().extra);
    
    const _extraCards = G.pendingExtraCardsForTarget||[];
    G.pendingExtraCardsForTarget=[];
    G.pendingSkill=null; G.pendingCardIdx=null; G.pendingAtkCard=null;
    render();

    playSkillAnimation(_ch_anim, _sk_anim, [_t_anim], () => {
      resolveMultiHit(_ch_anim, _sk_anim, _atkCard, _extraCards, _t_anim, _df_anim, 'p1');
    }).then(() => {
      if(_sk_anim._linkUpgraded && _ch_anim.id==='tyre') { _ch_anim._linkAccum=0; addLog('Acumulo de Poder resetado.','info'); }
      if(!G.over){
        if(G._pendingClubsAtk) {
          const fu=G._pendingClubsAtk; G._pendingClubsAtk=null;
          G._clubsAfterQuick = _wasQuick ? {ch:_ch_anim,idx:_savedIdx} : null;
          if(fu.target.alive || fu.isAllEnemy) showClubsFollowUp(fu);
          else afterClubsFu(_wasQuick,_ch_anim,_savedIdx);
        } else if(_wasQuick){
          addLog('Acao Rapida! '+_ch_anim.name+' ainda pode agir.','info');
          render(); openActionsPanel(_ch_anim,_savedIdx);
        } else {
          nextActor(); render();
        }
      }
    });
  }
  return;
}

// ===================== DEFENSE PANEL =====================
// ============================================================
// AREA DEFENSE QUEUE — each target defends individually
// ============================================================
function startAreaDefense(attacker, sk, atkCard, extraCards, targets, atkOwner, onComplete) {
  G._areaDefQueue = targets.filter(t=>t.alive).map(t=>({t, defCard:null}));
  G._areaDefContext = {attacker, sk, atkCard, extraCards, atkOwner, onComplete, idx:0};
  processNextAreaDef();
}

function processNextAreaDef() {
  const ctx = G._areaDefContext;
  if(!ctx) return;
  // Skip dead targets
  while(ctx.idx < G._areaDefQueue.length && !G._areaDefQueue[ctx.idx].t.alive) ctx.idx++;
  if(ctx.idx >= G._areaDefQueue.length) {
    // All done — resolve attacks in sequence with 550ms interval
    G._reactDelay = 0;
    const aliveEntries = G._areaDefQueue.filter(e => e.t.alive || e._mirrorDodge);
    // JUIZ: verificar que todos os alvos foram processados
    var totalAlvos = G._areaDefQueue.length;
    var processados = ctx.idx;
    if(processados < totalAlvos) {
      addLog('⚠ JUIZ (Área): Processou '+processados+'/'+totalAlvos+' alvos — algum foi pulado!', 'dmg');
    } else {
      addLog('🔍 JUIZ (Área): Defesa completa — '+processados+'/'+totalAlvos+' alvos processados', 'sys');
    }
    // Salva referências antes de zerar o contexto
    const {attacker, sk, atkCard, extraCards, atkOwner, onComplete: cb} = ctx;
    G._areaDefQueue = [];
    G._areaDefContext = null;

    floatSeq(aliveEntries, entry => {
      if(entry._mirrorDodge) {
        addLog('🪞 '+entry.t.name+' (área): dano ignorado por Imagem Espelhada.','heal');
      } else if(entry.t.alive) {
        resolveMultiHit(attacker, sk, atkCard, extraCards, entry.t, entry.defCard, atkOwner);
      }
    }).then(() => {
      if(!G.over && cb) {
        const d = G._reactDelay || 0; G._reactDelay = 0;
        if(d > 0) setTimeout(cb, d);
        else cb();
      }
      render();
    });
    return;
  }
  const entry = G._areaDefQueue[ctx.idx];
  const target = entry.t;
  // If AI owns the target, check mirror/encantado first, then use smart defense
  if(target.owner==='p2') {
    // Mirror check for AI targets
    const _aiAreaMirror = target.statuses.find(s=>s.id==='mirror');
    if(_aiAreaMirror && ctx.sk.acao!=='F' && Math.random()<0.5) {
      target.statuses = target.statuses.filter(s=>s.id!=='mirror');
      addLog('🪞 '+target.name+' usou Imagem Espelhada — esquivou do ataque em área!','heal');
      floatStatus(target,'🪞 ESQUIVOU!','#a0c0ff');
      entry._mirrorDodge = true;
      ctx.idx++;
      processNextAreaDef();
      return;
    }
    const hand = G.p2.hand;
    if(hand.length>0) {
      const pow = getPow(ctx.sk);
      const estDmg = Math.max(0, (ctx.attacker.curAtq + pow) - target.curDef);
      const def = aiShouldDefend(hand, estDmg, target);
      if(def.useCard && def.cardIdx!==null) {
        if(def.useJack) {
          addLog('🛡️ IA: '+target.name+' usa Valete — ESQUIVA do ataque em área!','info');
          floatStatus(target, 'J ESQUIVA!', '#80ff80');
        } else {
          addLog('🛡️ IA: '+target.name+' defende com carta ('+hand[def.cardIdx].val+').','info');
        }
        entry.defCard = hand[def.cardIdx];
        discard('p2', def.cardIdx);
      } else {
        addLog('🛡️ IA: '+target.name+' não defende (dano estimado baixo).','info');
      }
    }
    ctx.idx++;
    processNextAreaDef();
    return;
  }
  // Player target — checar Imagem Espelhada ANTES do painel
  const _areaMirror = target.statuses.find(s=>s.id==='mirror');
  if(_areaMirror && ctx.sk.acao!=='F' && Math.random()<0.5) {
    target.statuses = target.statuses.filter(s=>s.id!=='mirror');
    addLog('🪞 '+target.name+' usou Imagem Espelhada — esquivou do ataque em área de '+ctx.attacker.name+'!','heal');
    floatStatus(target,'🪞 ESQUIVOU!','#a0c0ff');
    showAdvTag(target,'🪞 ESQUIVA!','#a0c0ff');
    render();
    // Marcar entrada como esquivada (sem dano, sem painel)
    entry._mirrorDodge = true;
    ctx.idx++;
    processNextAreaDef();
    return;
  }

  // Player target — show defense panel (normal)
  showAreaDefensePanel(ctx.attacker, ctx.sk, ctx.atkCard, target, ctx.idx+1, G._areaDefQueue.filter(e=>e.t.alive).length);
}

function showAreaDefensePanel(attacker, sk, atkCard, target, current, total) {
  addLog('🛡 Defesa ('+current+'/'+total+'): '+target.name+' contra '+sk.name+' de '+attacker.name, 'info');
  const pow = getPow(sk);
  const estDmg = attacker.curAtq + pow + atkCard.nv;
  (()=>{const _def_info=document.getElementById('def-info');if(_def_info){_def_info.innerHTML =
    '<strong>⚔ ÁREA ('+current+'/'+total+')</strong> — <strong>'+attacker.name+'</strong> usa <strong>'+sk.name+'</strong><br>' +
    'Alvo: <strong>'+target.name+'</strong> | Dano estimado: ~'+estDmg+'<br>' +
    '<span style="color:var(--text2)">Escolha uma carta para defender ou passe sem defesa.</span>';}})()
  const hand = G.p1.hand;
  G.pendingDefCardIdx = null;
  document.getElementById('btn-yes-def').disabled = true;
  const _def_cards=document.getElementById('def-cards');
  if(_def_cards) _def_cards.innerHTML = hand.map((card,i) => {
    const s=SUITS[card.suit]||SUITS.neutral;
    return '<div class="card s-'+card.suit+'" id="dcard'+i+'" onclick="pickDefCard('+i+')">' +
      '<div class="card-corner">'+card.val+'<br>'+s.sym+'</div>' +
      '<div class="card-s">'+s.sym+'</div>' +
      '<div class="card-v">'+card.val+'</div></div>';
  }).join('');
  document.getElementById('def-panel').classList.add('open');
  showTargetedAnim(target);
  // Always bind buttons to area flow — prevents resolveDefense firing with null pendingAttack
  G._defMode = 'area';
  G.pendingAttack = null; // ensure resolveDefense can never run during area flow
  const btnYes = document.getElementById('btn-yes-def');
  const btnNo  = document.getElementById('btn-no-def');
  if(btnYes) btnYes.onclick = () => { _clearPvpTimers(); confirmAreaDef(true); };
  if(btnNo)  btnNo.onclick  = () => { _clearPvpTimers(); confirmAreaDef(false); };
  // Timer PvP de 30s — auto-defende sem carta
  if (_pvpSocket && _pvpSocket.readyState === WebSocket.OPEN) {
    _startDefTimer(function() { confirmAreaDef(false); });
  }
}

function confirmAreaDef(useDef) {
  document.getElementById('def-panel').classList.remove('open');
  const ctx = G._areaDefContext;
  if(!ctx) return;
  const entry = G._areaDefQueue[ctx.idx];
  if(useDef && G.pendingDefCardIdx !== null) {
    entry.defCard = discard('p1', G.pendingDefCardIdx);
    addLog('🛡 '+entry.t.name+' defende com carta '+entry.defCard.val+' ('+entry.defCard.suit+')', 'info');
    G.pendingDefCardIdx = null;
  } else {
    addLog('🛡 '+entry.t.name+' não defendeu', 'info');
  }
  // PvP área: captura defCard antes da fila ser zerada
  if (_pvpSocket && _pvpSocket.readyState === WebSocket.OPEN) {
    try { _pvpAreaDefCard = entry.defCard || null; } catch(e) {}
  }
  ctx.idx++;
  render();
  setTimeout(processNextAreaDef, 200);
}

function showDefensePanelPvP(attacker, sk, atkCard, target) {
  // Painel de defesa PvP — resultado vai pro servidor
  const pow = sk.power || sk.poder || 0;
  const estDmg = (attacker.curAtq || attacker.atq || 0) + pow + (atkCard.nv || 0);
  const _def_info = document.getElementById('def-info');
  if (_def_info) {
    var _areaLabel = (sk._areaCurrent && sk._areaTotal) ? ' <span style="color:var(--gold)">⚔ ÁREA (' + sk._areaCurrent + '/' + sk._areaTotal + ')</span>' : '';
    _def_info.innerHTML = `<strong>${attacker.name}</strong> usa <strong>${sk.name}</strong> em <strong>${target.name}</strong>${_areaLabel}<br>
    Carta: ${atkCard.val} | Poder: ${pow} | Dano estimado: ~${estDmg}<br>
    <span style="color:var(--text2)">Escolha uma carta para defender ou passe sem defesa.</span>`;
  }

  const hand = G.p1.hand;
  G.pendingDefCardIdx = null;
  document.getElementById('btn-yes-def').disabled = true;

  const _def_cards = document.getElementById('def-cards');
  if (_def_cards) _def_cards.innerHTML = hand.map((card, i) => {
    const s = SUITS[card.suit] || SUITS.neutral;
    const isJ = card.val === 'J';
    const isOtherSpec = isEffectCard(card) && !isJ;
    const dimDef = isOtherSpec ? 'opacity:0.3;pointer-events:none;' : '';
    const defLbl = isJ ? `<div style="font-size:7px;color:#80ff80;font-weight:700;text-align:center">ESQUIVA</div>` :
                   isOtherSpec ? `<div style="font-size:7px;color:#888;font-weight:700;text-align:center">SEM EFEITO</div>` : '';
    return `<div class="card s-${card.suit}" id="dcard${i}" style="${dimDef}" onclick="${isOtherSpec ? '' : ('pickDefCard(' + i + ')')}">
      <div class="card-corner">${card.val}<br>${s.sym}</div>
      <div class="card-s">${s.sym}</div>
      <div class="card-v">${card.val}</div>
      ${defLbl}
    </div>`;
  }).join('');

  document.getElementById('def-panel').classList.add('open');
  showTargetedAnim(target);
  G._defMode = 'pvp';

  const _byd = document.getElementById('btn-yes-def');
  const _bnd = document.getElementById('btn-no-def');
  if (_byd) _byd.onclick = () => { _clearPvpTimers(); resolveDefensePvP(true); };
  if (_bnd) _bnd.onclick = () => { _clearPvpTimers(); resolveDefensePvP(false); };

  // Timer 30s — auto passa sem defesa
  _startDefTimer(function() { resolveDefensePvP(false); });
}

function resolveDefensePvP(useCard) {
  document.getElementById('def-panel').classList.remove('open');
  var defCardNv = 0;
  var defCardSuit = 'neutral';
  var isJack = false;

  if (useCard && G.pendingDefCardIdx !== null) {
    var defCard = G.p1.hand[G.pendingDefCardIdx];
    if (defCard) {
      defCardNv = defCard.nv;
      defCardSuit = defCard.suit;
      isJack = defCard.val === 'J';
      discard('p1', G.pendingDefCardIdx);
    }
  }

  G.pendingDefCardIdx = null;
  _logEvent('Defesa PvP: carta=' + defCardNv + ' (' + defCardSuit + ')' + (isJack ? ' VALETE' : '') + (useCard ? '' : ' — sem carta'), 'ACTION');
  addLog('🛡 [Railway] Defesa enviada ao servidor...', 'sys');

  pvpSend('defense_response', {
    defCardNv: defCardNv,
    defCardSuit: defCardSuit,
    isJack: isJack
  });
  render();
}

function showDefensePanel(attacker, sk, atkCard, target) {
  addLog('🛡 Defesa: '+target.name+' contra '+sk.name+' de '+attacker.name, 'info');
  const pow=getPow(sk);
  const estDmg=attacker.curAtq+pow+atkCard.nv;
  (()=>{const _def_info=document.getElementById('def-info');if(_def_info){_def_info.innerHTML=
    `<strong>${attacker.name}</strong> usa <strong>${sk.name}</strong> em <strong>${target.name}</strong><br>
    Carta: ${atkCard.val} | Poder: ${pow} | Dano estimado: ~${estDmg}<br>
    <span style="color:var(--text2)">Escolha uma carta para defender ou passe sem defesa.</span>`;}})()

  const hand=G.p1.hand;
  G.pendingDefCardIdx=null;
  document.getElementById('btn-yes-def').disabled=true;

  const _def_cards2=document.getElementById('def-cards');
  if(_def_cards2) _def_cards2.innerHTML=hand.map((card,i)=>{
    const s=SUITS[card.suit]||SUITS.neutral;
    const isJ=card.val==='J';
    const isOtherSpec=isEffectCard(card)&&!isJ;
    const dimDef=isOtherSpec?'opacity:0.3;pointer-events:none;':'';
    const defLbl=isJ?`<div style="font-size:7px;color:#80ff80;font-weight:700;text-align:center">ESQUIVA</div>`:
                 isOtherSpec?`<div style="font-size:7px;color:#888;font-weight:700;text-align:center">SEM EFEITO</div>`:'';
    return `<div class="card s-${card.suit}" id="dcard${i}" style="${dimDef}" onclick="${isOtherSpec?'':('pickDefCard('+i+')')}">
      <div class="card-corner">${card.val}<br>${s.sym}</div>
      <div class="card-s">${s.sym}</div>
      <div class="card-v">${card.val}</div>
      ${defLbl}
    </div>`;
  }).join('');

  // Add note about J special dodge rule
  const _dgrid = document.getElementById('def-cards');
  const _dnote = document.getElementById('def-special-note');
  if(!_dnote && _dgrid) {
    const note = document.createElement('div');
    note.id = 'def-special-note';
    note.style.cssText = 'font-size:10px;color:var(--gold);margin:4px 0;text-align:center';
    note.textContent = '★ Valete (J) = Esquiva total | Outros especiais = sem efeito defensivo';
    _dgrid.parentNode.insertBefore(note, _dgrid);
  }
  document.getElementById('def-panel').classList.add('open');
  showTargetedAnim(target);
  // Ensure buttons point to SINGLE-target defense flow
  G._defMode = 'single';
  const _byd=document.getElementById('btn-yes-def');
  const _bnd=document.getElementById('btn-no-def');
  if(_byd) _byd.onclick = () => { _clearPvpTimers(); resolveDefense(true); };
  if(_bnd) _bnd.onclick = () => { _clearPvpTimers(); resolveDefense(false); };
  // Timer PvP de 30s — auto-defende sem carta
  if (_pvpSocket && _pvpSocket.readyState === WebSocket.OPEN) {
    _startDefTimer(function() { resolveDefense(false); });
  }
}

function pickDefCard(idx) {
  if(_judge) _judge.lastActivity = Date.now();
  G.pendingDefCardIdx=idx;
  document.querySelectorAll('#def-cards .card').forEach(c=>c.classList.remove('sel'));
  const el=document.getElementById('dcard'+idx);
  if(el) el.classList.add('sel');
  document.getElementById('btn-yes-def').disabled=false;
}

function resolveDefense(useCard) {
  if(!G.pendingAttack) return; // safety: area flow may have already handled this
  document.getElementById('def-panel').classList.remove('open');
  const {attacker,sk,atkCard,target,atkOwner,_isQuickAction,_onComplete}=G.pendingAttack;
  let defCard=null;
  if(useCard&&G.pendingDefCardIdx!==null){
    defCard=discard('p1',G.pendingDefCardIdx);
    // Valete = esquiva completa!
    if(defCard.val==='J'){
      addLog(`ℹ️ Valete! ${target.name} esquivou completamente do ataque!`,'info');
      floatStatus(target, 'J ESQUIVA!', '#80ff80');
      floatEffectCardUsed(target, defCard);
      G.pendingAttack=null; G.pendingDefCardIdx=null;
      if(!G.over){
        // Se era Ação Rápida da IA, continua para 2ª ação
        if(_isQuickAction && atkOwner==='p2') {
          judgeCheck('action_end');
          if(_onComplete) { setTimeout(function(){ _onComplete(); }, 600); }
          else { setTimeout(()=>{ if(!G.over) _iaQuickSecondAction(attacker); }, 600); }
        } else { judgeCheck('action_end'); nextActor(); render(); }
      }
      return;
    }
  }
  G.pendingAttack=null; G.pendingDefCardIdx=null;
  G._reactDelay=0;
  resolveAttack(attacker,sk,atkCard,target,defCard,atkOwner);
  if(!G.over){
    // Verifica contra-ataque Paus pendente antes de avançar turno
    if(G._pendingClubsAtk) {
      const fu = G._pendingClubsAtk;
      G._pendingClubsAtk = null;
      G._clubsAfterQuick = null;
      setTimeout(()=>{
        if(fu.target && fu.target.alive) { showClubsFollowUp(fu); render(); }
        else {
          judgeCheck('action_end');
          if(_isQuickAction && atkOwner==='p2') {
            if(_onComplete) { _onComplete(); }
            else { _iaQuickSecondAction(attacker); }
          }
          else { nextActor(); render(); }
        }
      }, 400);
      return;
    }
    const d=G._reactDelay||0; G._reactDelay=0;
    // Se era Ação Rápida da IA, continua para 2ª ação
    if(_isQuickAction && atkOwner==='p2') {
      judgeCheck('action_end');
      if(_onComplete) { setTimeout(function(){ if(!G.over) _onComplete(); }, Math.max(d, 600)); }
      else { setTimeout(()=>{ if(!G.over) _iaQuickSecondAction(attacker); }, Math.max(d, 600)); }
    } else {
      judgeCheck('action_end');
      if(d>0) setTimeout(()=>{ nextActor(); render(); }, d);
      else { nextActor(); render(); }
    }
  }
}

// Executa a 2ª ação da IA após Ação Rápida com defesa do jogador
function _iaQuickSecondAction(ch) {
  const p = G.p2;
  const sk2pool = ch.skills.filter(s=>{
    if(s.acao==='Rápida') return false;
    if((ch.cooldowns[s.id]||0)>0) return false;
    if(s.turno==='L' && ch.firstTurn) return false;
    return true;
  });
  if(sk2pool.length > 0 && p.hand.length > 0) {
    const sk2 = sk2pool.sort((a,b)=>getPow(b)-getPow(a))[0];
    addLog('⚡ '+ch.name+' usa '+sk2.name+' como 2ª ação!','info');
    floatStatus(ch,'⚡ 2ª AÇÃO!','var(--gold)');
    if(sk2.recarga==='L') { ch.cooldowns[sk2.id]=2; }
    // Dispara como turno normal da IA com a 2ª skill
    setTimeout(()=>{ if(!G.over) enemyAI({ch:ch, o:'p2', _forceSk:sk2}); }, 400);
  } else {
    addLog('⚡ '+ch.name+' — sem 2ª ação disponível.','info');
    nextActor(); render();
  }
}

function cancelSkill() {
  // Return card to hand if it was already discarded (pending atk card)
  if(G.pendingAtkCard) {
    G.p1.hand.unshift(G.pendingAtkCard);
    G.p1.discard.pop();
  }
  G.pendingSkill=null; G.pendingCardIdx=null; G.pendingAtkCard=null;
  G.phase='player_action';
  document.getElementById('target-banner').classList.remove('on');
  document.getElementById('target-cancel-btn').style.display='none';
  closePanel();
  const a=actor();
  if(a&&a.o==='p1') openActionsPanel(a.ch, G.p1.chars.indexOf(a.ch));
}

// ===================== ACTION PANEL =====================
let panelCharIdx=null;

function handlePlayerTap(i) {
  if(isCharDetailOpen()) return;
  if(isSkillAnimLocked()) return;
  const a=actor();
  if(!a||a.o!=='p1') return;
  const ch=G.p1.chars[i];
  if(ch!==a.ch) return;
  openActionsPanel(ch, i);
}

function openActionsPanel(ch, charIdx) {
  panelCharIdx=charIdx;
  if((ch.id==='kane'||ch.id==='kane_ai')) marcoUpdateWeaponSlot(ch);
  document.getElementById('panel-title').textContent=ch.name;

  const tgtLabel = t =>
    t==='enemy'       ? '1 Inimigo'    :
    t==='all_enemy'   ? 'Todos Inim.'  :
    t==='all_ally'    ? 'Todos Aliados':
    t==='all'         ? 'Todos'        : 'Si mesmo';

  const colsHtml = ch.skills.map((sk, i) => {
    const onCd    = ch.cooldowns && ch.cooldowns[sk.id] > 0;
    const blocked = sk.turno === 'L' && ch.firstTurn;
    const disabled = onCd || blocked;

    const linkAccum = (ch.id==='tyre'||ch.id==='tyre_ai') && sk.id==='aes' ? (ch._linkAccum||0) : 0;
    const linkTag   = linkAccum>=2 ? ' ×Todos' : linkAccum>=1 ? ' ×Ign.Arm.' : '';

    const nimbActive = (ch.id==='nyxa'||ch.id==='nyxa_ai') && ch._nimb;
    const acoTag = nimbActive ? 'Rápida' : (sk.acao||'N');
    const btnLabel = onCd    ? `⏳ ${ch.cooldowns[sk.id]}t`
                   : blocked ? '🚫 1º Turno'
                   : nimbActive ? `⚡ Rápida!`
                   : `⚔ Usar${linkTag}`;

    // Long-press handlers — só start e end/cancel, sem mouseleave
    const lp = `onLPStart(event,${charIdx},${i})`;
    const lc = `onLPClear()`;

    return `<div class="sk-col${disabled?' sk-disabled':''}"
        ontouchstart="${lp}" ontouchend="${lc}" ontouchcancel="${lc}"
        onmousedown="${lp}" onmouseup="${lc}">
      <div class="sk-name">${sk.name}</div>
      <div class="sk-line2">
        <span class="sk-pow">POW ${sk.power}</span>
        <span>${sk.type}</span>
        <span>${tgtLabel(sk.target)}</span>
      </div>
      <div class="sk-line3">
        <span class="sk-tag">T:${sk.turno||'N'}</span>
        <span class="sk-tag${onCd?' sk-tag-cd':''}">R:${onCd?ch.cooldowns[sk.id]+'t':(sk.recarga||'N')}</span>
        <span class="sk-tag">A:${sk.acao||'N'}</span>
      </div>
      <button class="sk-use-btn" ${disabled?'disabled':''}
        onmousedown="event.stopPropagation()" ontouchstart="event.stopPropagation()"
        onclick="${disabled?'':('playerSkill('+charIdx+','+i+')')}">
        ${btnLabel}
      </button>
    </div>`;
  }).join('');

  document.getElementById('panel-body').innerHTML=`
    <div class="skills-grid">${colsHtml}</div>
    <button class="pass-btn-panel" onclick="playerPass(${charIdx})">↩ PASSAR RODADA (compra 1 carta)</button>`;
  openPanel();
}

// ── Long-press para abrir detalhe da habilidade ──
let _lpTimer = null;
let _lpFired  = false;

function onLPStart(e, charIdx, skIdx) {
  _lpFired = false;
  onLPClear();
  _lpTimer = setTimeout(() => {
    _lpFired = true;
    const ch = G.p1.chars[charIdx];
    if(!ch) return;
    const sk = ch.skills[skIdx];
    if(!sk) return;
    const sl = [...document.querySelectorAll('.slot')]
      .find(s => s.querySelector('[data-char-name]')?.dataset.charName === ch.name);
    openSkDetail(sk, sl);
  }, 1500);
}

function onLPClear() {
  if(_lpTimer) { clearTimeout(_lpTimer); _lpTimer = null; }
}

function openSkDetail(sk, anchorEl) {
  const tgtLabel = t =>
    t==='enemy'      ? '1 Inimigo'     :
    t==='all_enemy'  ? 'Todos Inim.'   :
    t==='all_ally'   ? 'Todos Aliados' :
    t==='all'        ? 'Todos'         : 'Si mesmo';

  document.getElementById('sk-det-name').textContent = sk.name;
  document.getElementById('sk-det-stats').innerHTML = [
    `<span class="sk-det-stat">POW <b>${sk.power}</b></span>`,
    `<span class="sk-det-stat">Tipo <b>${sk.type}</b></span>`,
    `<span class="sk-det-stat">Alvo <b>${tgtLabel(sk.target)}</b></span>`,
    `<span class="sk-det-stat">T:<b>${sk.turno||'N'}</b></span>`,
    `<span class="sk-det-stat">R:<b>${sk.recarga||'—'}</b></span>`,
    `<span class="sk-det-stat">A:<b>${sk.acao||'N'}</b></span>`,
  ].join('');
  document.getElementById('sk-det-desc').textContent = sk.desc || 'Sem descrição.';

  const overlay = document.getElementById('sk-detail-overlay');
  const box     = document.getElementById('sk-detail-box');

  // Reseta posição antes de abrir para medir corretamente
  box.style.left = '-9999px';
  box.style.top  = '-9999px';
  overlay.classList.add('open');

  // Dois rAF: 1º para o browser pintar, 2º para medir e posicionar
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const bw = box.offsetWidth;
    const bh = box.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Posição padrão: centro da tela na frente
    let cx = vw / 2;
    let cy = vh / 2;

    if(anchorEl) {
      const r = anchorEl.getBoundingClientRect();
      cx = r.left + r.width  / 2; // centro horizontal do slot
      cy = r.top  + r.height / 2; // centro vertical do slot
    }

    // Popup centralizado em cima do avatar (na frente, não acima)
    let left = cx - bw / 2;
    let top  = cy - bh / 2;

    // Clamp para não sair da tela
    left = Math.max(8, Math.min(left, vw - bw - 8));
    top  = Math.max(8, Math.min(top,  vh - bh - 8));

    box.style.left = left + 'px';
    box.style.top  = top  + 'px';
  }));
}

function closeSkDetail() {
  document.getElementById('sk-detail-overlay').classList.remove('open');
}

function openPanel() {
  document.getElementById('bottom-panel').classList.add('open');
  // Esconde botão flutuante quando painel está aberto
  const rb = document.getElementById('init-reopen-btn');
  if(rb) rb.style.display = 'none';
}
function closePanel() {
  document.getElementById('bottom-panel').classList.remove('open');
  // Se estava na fase de iniciativa, mostra botão flutuante para reabrir
  if(G && G.phase === 'initiative') {
    const rb = document.getElementById('init-reopen-btn');
    if(rb) rb.style.display = 'block';
  }
}
function reopenInitPanel() {
  const rb = document.getElementById('init-reopen-btn');
  if(rb) rb.style.display = 'none';
  renderInitiativePanel();
}

// ===================== INIT MODAL (inline) =====================
function showInitModal() {
  const order=G.order;
  let rows=order.map((e,i)=>{
    const s=SUITS[e.ch.suit]||SUITS.neutral;
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 10px;background:var(--bg3);border-radius:6px;border:1px solid ${i===0?'var(--gold)':'var(--border)'}">
      <span style="color:${s.color}">${s.sym}</span>
      <span style="font-size:12px">${e.ch.name}</span>
      <span style="font-size:11px;color:var(--text2)">${e.o==='p1'?'Você':'CPU'}</span>
      <span style="color:var(--gold);font-size:11px">${e.ic.val}+${e.ch.inc}=<b>${e.tot}</b></span>
    </div>`;
  }).join('');
  document.getElementById('panel-title').textContent='✅ Ordem de Iniciativa Definida';
  document.getElementById('panel-body').innerHTML=`
    <div style="display:flex;flex-direction:column;gap:6px">${rows}</div>
    <button class="btn-gold" style="width:100%" onclick="beginRound()">Iniciar Rodada</button>`;
  openPanel();
}

function deeMascaraEscolha(opcao) {
  const a = actor();
  const ch = a ? a.ch : null;
  if(!ch) return;
  // Restaura o X do painel
  const panelX = document.querySelector('.panel-x');
  if(panelX) panelX.style.display='';
  closePanel();
  if(opcao==='feliz') {
    addSt(ch,{id:'masc_feliz',icon:'😊',label:'Máscara Feliz: contra-ataca aliados atacados',turns:2});
    addLog('😊 Nyxar: Máscara Feliz! Contra-ataca quando um aliado for atacado (gaste 1 carta).','info');
    floatStatus(ch,'😊 Feliz!','var(--gold)');
  } else {
    addSt(ch,{id:'masc_triste',icon:'😢',label:'Máscara Triste: ataque conjunto em inimigos atacados',turns:2});
    addLog('😢 Nyxar: Máscara Triste! Ataca junto quando um aliado atacar (gaste 1 carta).','info');
    floatStatus(ch,'😢 Triste!','#8080ff');
  }
  // Continua o turno corretamente — Ação Rápida reabre painel, ação normal avança
  const ctx = G._deeMascaraCtx || {};
  G._deeMascaraCtx = null;
  render();
  if(ctx.isQuick) {
    afterQuickAction(ch, ctx.charIdx);
  } else {
    nextActor();
    render();
  }
}

function beginRound() {
  _clearPvpTimers(); // limpa timer ao iniciar ação
  closePanel();
  const a=actor();
  if(!a) return;
  showTurnBanner(G.turn).then(() => {
    if(G.over) return;
    render(); // garante DOM atualizado antes dos floats de applyTurnStart
    setTimeout(() => {
      if(G.over) return;
      judgeReset(); // Juiz: reseta estado para primeiro turno
      applyTurnStart(a);
      if(a.o==='p1'){
        if(a.extra) addLog(`⚡ Rodada Extra de ${a.ch.name}`,'info');
        else addLog(`⚔ Vez de ${a.ch.name}`,'info');
        render();
      }
      // IA é chamada pelo applyTurnStart — não chamar aqui de novo
    }, 80); // pequeno delay para o layout estabilizar
  });
}

// ===================== RENDER =====================
function render() {
  if(G.over) return;
  const a=actor();
  const _tp1=document.getElementById('tb-p1'); if(_tp1) _tp1.textContent=`Você: ${G.p1.deck.length}`;
  const _tp2=document.getElementById('tb-p2'); if(_tp2) _tp2.textContent=`CPU: ${G.p2.deck.length}`;

  const _re=document.getElementById('row-enemy');  if(_re) _re.innerHTML=G.p2.chars.map((ch,i)=>renderSlot(ch,i,'p2',a)).join('');
  const _rp=document.getElementById('row-player'); if(_rp) _rp.innerHTML=G.p1.chars.map((ch,i)=>renderSlot(ch,i,'p1',a)).join('');
  renderHand();
  renderInitQueue();
  positionSlotsJRPG();
}

// ── JRPG FIXED SLOT POSITIONS ─────────────────────────────────────────────
// Coordenadas fixas estilo Marvel Avengers Alliance.
// Cada slot recebe: left (% do field), top (% do field),
// transform: translate(-50%,-50%) para pivot central,
// width máx 90px, z-index dinâmico (maior no ativo).
//
// PLAYER (esquerdo):
//   slot 0 → left 22%  top 38%
//   slot 1 → left 14%  top 55%
//   slot 2 → left 26%  top 72%
//
// ENEMY (direito):
//   slot 0 → left 78%  top 38%
//   slot 1 → left 86%  top 55%
//   slot 2 → left 74%  top 72%

const JRPG_SLOTS = {
  player: [
    { left: '24%', top: '22%', scale: 0.85 },
    { left: '16%', top: '52%', scale: 0.93 },
    { left: '28%', top: '82%', scale: 1.00 },
  ],
  enemy: [
    { left: '76%', top: '22%', scale: 0.85 },
    { left: '84%', top: '52%', scale: 0.93 },
    { left: '72%', top: '82%', scale: 1.00 },
  ],
};

function positionSlotsJRPG() {
  const a = (G && G.order) ? actor() : null;

  // Detecta se tem boss ou crias no campo
  var hasBoss = G && G.p2 && G.p2.chars.some(function(c) { return c.isBoss && c.alive; });
  var hasCrias = G && G.p2 && G.p2.chars.some(function(c) { return c.isBossSpawn && c.alive; });

  // Posições especiais pra boss (1 centralizado) e crias (3 horizontal)
  var bossPositions = [{ left: '80%', top: '50%', scale: 1.1 }];
  var criaPositions = [
    { left: '85%', top: '22%', scale: 0.85 },
    { left: '80%', top: '50%', scale: 0.85 },
    { left: '85%', top: '78%', scale: 0.85 }
  ];

  var enemyPos = hasBoss ? bossPositions : hasCrias ? criaPositions : JRPG_SLOTS.enemy;

  function apply(colId, positions) {
    const col = document.getElementById(colId);
    if (!col) return;
    const slots = col.querySelectorAll('.slot');
    slots.forEach((slot) => {
      const i   = parseInt(slot.dataset.slotIdx ?? 0, 10);
      const pos = positions[i] || positions[positions.length - 1];

      slot.style.setProperty('position', 'absolute', 'important');
      slot.style.setProperty('left',     pos.left,   'important');
      slot.style.setProperty('top',      pos.top,    'important');
      slot.style.setProperty('right',    'auto',     'important');
      slot.style.setProperty('bottom',   'auto',     'important');
      // Boss/Cria: largura maior
      var slotWidth = slot.classList.contains('slot-boss') ? '100px' : slot.classList.contains('slot-cria') ? '65px' : '60px';
      slot.style.setProperty('width',    slotWidth,  'important');
      slot.style.setProperty('max-width',slotWidth,  'important');

      slot.style.zIndex = a && slot.querySelector('[data-char-name]')?.dataset.charName === a.ch.name ? 10 : (i + 1);

      // .slot: APENAS translate(-50%,-50%) — nunca scale, nunca filter.
      // translate puro não cria stacking context → ícones de .char-icons-back
      // permanecem atrás de .char-avatar em ambos os times.
      slot.style.transform = `translate(-50%, -50%)`;

      // Scale de profundidade vai para .char-avatar (irmão de .char-icons-back)
      slot.style.setProperty('--slot-scale', pos.scale);
      const avatar = slot.querySelector('.char-avatar');
      if(avatar && !slot.classList.contains('myturn')) {
        avatar.style.transform = `scale(${pos.scale})`;
      }
    });
  }

  apply('row-player', JRPG_SLOTS.player);
  apply('row-enemy',  enemyPos);
}

// ── Initiative Queue Bar ─────────────────────────────────────────────────────
function renderInitQueue() {
  const bar = document.getElementById('init-queue');
  if(!bar || !G.order || !G.order.length) return;

  // Esconde apenas quando a partida acabou
  if (G.over) {
    bar.classList.remove('visible');
    return;
  }

  bar.classList.add('visible');

  const SUIT_EMOJI = {
    spades:'♠', hearts:'♥', clubs:'♣', diamonds:'♦', neutral:'◆'
  };
  const SUIT_COLOR = {
    spades: 'var(--spades)', hearts: 'var(--hearts)',
    clubs: 'var(--clubs)', diamonds: 'var(--diamonds)', neutral: '#aaa'
  };

  // Split: done (already acted this turn) vs upcoming
  const done     = G.order.slice(0, G.orderIdx);
  const upcoming = G.order.slice(G.orderIdx); // upcoming[0] = active

  function slotHTML(entry, state, pos) {
    const ch  = entry.ch;
    const o   = entry.o;
    const sym = SUIT_EMOJI[ch.suit] || '◆';
    const col = SUIT_COLOR[ch.suit] || '#aaa';
    const shortName = ch.name.split(' ')[0].toUpperCase();
    const extraBadge = entry.extra ? '<span class="iq-extra">★</span>' : '';
    const deadStyle = !ch.alive ? 'filter:grayscale(1);opacity:0.2;' : '';

    return `<div class="iq-slot iq-${state} iq-${o}" style="${deadStyle}">
      <div class="iq-avatar">
        <span style="color:${col};font-size:17px;line-height:1">${sym}</span>
        <span class="iq-pos">${pos}</span>
        ${extraBadge}
      </div>
      <div class="iq-name">${shortName}</div>
    </div>`;
  }

  let html = '';

  // Upcoming: active first, then next in line
  upcoming.forEach((entry, i) => {
    const state = i === 0 ? 'active' : 'next';
    html += slotHTML(entry, state, G.orderIdx + i + 1);
  });

  // Separator between upcoming and done
  if(done.length > 0 && upcoming.length > 0) {
    html += '<div class="iq-separator"></div>';
  }

  // Done (greyed out, reversed so most recent is closest to separator)
  [...done].reverse().forEach((entry, i) => {
    html += slotHTML(entry, 'done', G.orderIdx - i);
  });

  bar.innerHTML = `<div class="iq-inner">${html}</div>`;

  // Scroll active into view (first item = active)
  const firstSlot = bar.querySelector('.iq-active');
  if(firstSlot) firstSlot.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
}

// ══════════════════════════════════════════════════════════════════
// SISTEMA DE ÍCONES DE STATUS — arquitetura baseada em estado
// ══════════════════════════════════════════════════════════════════

// Categorias de status para o popup
const DEBUFF_IDS = new Set(['burn','bleed','exposed','weak','frozen','stun','chill','melt','static','slow','rad','encantado','marcado','lento','amaciado']);
const BUFF_IDS   = new Set(['hearts_adv','clubs_furtivo','shield','mirror','agora_serio','nimb_ativo','outfit_verde','outfit_azul','outfit_vermelha','masc_feliz','masc_triste','gladiadora_frenesi','fortalecido','fort_def','analise_tech']);

// Gera o HTML dos ícones acima do avatar a partir do estado do personagem.
// Inclui: acumuladores especiais + statuses ativos. SEM passivas (só aparecem no popup).
function buildStatusIconsHtml(ch) {
  const items = [];

  // Acumuladores especiais (⚡ Sam, 🔥 Conc. Marcial, 🗡️ Tyren, 🔧 Arcabuz, 🔫 Kane)
  if (ch._charge)    items.push({ icon: '⚡', cat: 'cib-buff' });
  if (ch._satsui)    items.push({ icon: '🔥', cat: 'cib-buff' });
  if (ch._linkAccum) items.push({ icon: '🗡️', cat: 'cib-buff' });
  if (ch._arcabuz)   items.push({ icon: '🔧', cat: 'cib-buff' });
  if (ch._weapon)    items.push({ icon: '🔫', cat: 'cib-buff' });

  // Outfit icons (Tyren)
  const hasOutfitVerde = ch.statuses.find(s => s.id === 'outfit_verde');
  const hasOutfitAzul  = ch.statuses.find(s => s.id === 'outfit_azul');
  const hasOutfitVerm  = ch.statuses.find(s => s.id === 'outfit_vermelha');
  if (hasOutfitVerde) items.push({ icon: '🟢', cat: 'cib-buff' });
  if (hasOutfitAzul)  items.push({ icon: '🔵', cat: 'cib-buff' });
  if (hasOutfitVerm)  items.push({ icon: '🔴', cat: 'cib-buff' });

  // Statuses ativos (buffs/debuffs), exceto outfits já mostrados acima
  const skipIds = new Set(['outfit_verde', 'outfit_azul', 'outfit_vermelha']);
  (ch.statuses || []).forEach(st => {
    if (skipIds.has(st.id)) return;
    const cat = DEBUFF_IDS.has(st.id) ? 'cib-debuff' : 'cib-buff';
    items.push({ icon: st.icon, cat });
  });

  if (items.length === 0) return '';

  return items.map(item =>
    `<span class="cib-icon ${item.cat}">${item.icon}</span>`
  ).join('');
}

// Atualiza APENAS os ícones de um personagem já renderizado no DOM.
// ❌ NÃO recria o slot inteiro — só atualiza .char-icons-back
function renderCharacterStatusIcons(ch) {
  const el = document.querySelector(`.char-icons-back[data-chid="${ch.id}"]`);
  if(!el) return;
  el.innerHTML = buildStatusIconsHtml(ch);
}
function refreshIcons(ch) { renderCharacterStatusIcons(ch); }

// Constrói a lista de efeitos estruturados para o popup.
// Lê SOMENTE do estado do personagem, nunca do DOM.
function buildEffectList(ch) {
  const det = CHAR_DETAILS[ch.id] || { passives: [] };
  const effects = [];

  // 1) Passivas (sempre presentes)
  det.passives.forEach(p => {
    effects.push({ id: p.id || ('passive_'+p.name), name: p.name, description: p.desc, icon: '⬡', type: 'passive', stacks: null, duration: null });
  });

  // 2) Statuses ativos (buffs/debuffs)
  (ch.statuses || []).forEach(st => {
    const type = DEBUFF_IDS.has(st.id) ? 'debuff' : BUFF_IDS.has(st.id) ? 'buff' : 'buff';
    const parts = (st.label || '').split(':');
    effects.push({
      id: st.id,
      name: parts[0] || st.id,
      description: parts.slice(1).join(':').trim() || '—',
      icon: st.icon || '●',
      type,
      stacks: st.stacks || null,
      duration: (st.turns !== undefined && st.turns < 900) ? st.turns : null
    });
  });

  // 3) Acumuladores especiais (como efeitos numéricos)
  if(ch._charge)        effects.push({ id:'_charge',   name:'Cargas Sam',      description:`Feixe: Poder +${ch._charge}. Com 5 atinge todos.`,      icon:'⚡', type:'buff', stacks:ch._charge, duration:null });
  if(ch._satsui)        effects.push({ id:'_satsui',   name:'Concentração Marcial',    description:`Kohouken +${ch._satsui*2} poder (${ch._satsui} cargas ×2).`, icon:'🔥', type:'buff', stacks:ch._satsui, duration:null });
  if(ch._linkAccum)     effects.push({ id:'_link',     name:'Acúmulo Link',       description:`Nv${ch._linkAccum}: ${ch._linkAccum>=2?'Atinge TODOS':'Ignora Armadura'}.`, icon:'🗡️', type:'buff', stacks:ch._linkAccum, duration:null });
  if(ch._arcabuz)       effects.push({ id:'_arcabuz',  name:'Cargas Arcabuz',     description:`Poder extra +${ch._arcabuz} no próximo disparo.`,          icon:'🔧', type:'buff', stacks:ch._arcabuz, duration:null });
  if(ch._agoraSerio && ch._agoraSerioPow) effects.push({ id:'_agora', name:'Agora é Sério', description:`ATACARRRR acumulou +${ch._agoraSerioPow} de poder.`, icon:'⚔️', type:'buff', stacks:null, duration:null });
  if(ch._weapon)        effects.push({ id:'_weapon',   name:`Arma: ${ch._weapon}`, description:'Kane usa esta arma no ataque principal.',                icon:'🔫', type:'buff', stacks:null, duration:null });
  if(((ch.id==='vanc'||ch.id==='vanc_ai')) && ch._chamadoTurno !== undefined) {
    const prog = ch._chamadoTurno % 3 || 3;
    effects.push({ id:'_chamado', name:'Chamado da Tropa', description:`Progresso: ${prog}/3 turnos. No 3º turno a Tropa entra em ação.`, icon:'⭐', type:'passive', stacks:null, duration:null });
  }

  return effects;
}

// Renderiza o popup de status lendo SOMENTE o estado do personagem.
// Chamado por openCharDetail() e toda vez que addSt() modifica o personagem
// enquanto o popup estiver aberto para ele.
function renderStatusPopup(ch) {
  const liveDiv = document.getElementById('cdm-live-statuses');
  const section = document.getElementById('cdm-status-section-title');
  if(!liveDiv || !section) return;

  const effects = buildEffectList(ch);
  section.style.display = '';

  liveDiv.innerHTML = effects.map(ef => {
    const catCss = ef.type === 'debuff' ? 'lss-debuff' : ef.type === 'passive' ? 'lss-passive' : 'lss-buff';
    const stackBadge = ef.stacks ? `<div class="cdm-live-status-turns">${ef.stacks}${ef.duration?'':''}</div>` : '';
    const turnBadge  = ef.duration ? `<div class="cdm-live-status-turns">${ef.duration}t</div>` : '';
    return `<div class="cdm-live-status ${catCss}">
      <div class="cdm-live-status-icon">${ef.icon}</div>
      <div class="cdm-live-status-body">
        <div class="cdm-live-status-name">${ef.name}</div>
        <div class="cdm-live-status-desc">${ef.description}</div>
      </div>
      ${stackBadge}${turnBadge}
    </div>`;
  }).join('') || '<div style="font-size:10px;color:var(--text2);padding:6px 0">Nenhum efeito ativo.</div>';
}

// ══════════════════════════════════════════════════════════════════

function renderSlot(ch, i, o, a) {
  if (!ch.alive) return ''; // mortos são removidos do DOM — fadeout gerenciado via animDeath
  const isActor  = a && a.ch === ch && a.o === o;
  const isTarget = (G.phase === 'targeting' || G.phase === 'targeting_all') && o === 'p2' && ch.alive;
  const s   = SUITS[ch.suit] || SUITS.neutral;
  const pct = Math.max(0, ch.hp / ch.maxHp);

  // ── Boss: carta grande centralizada ──
  if (ch.isBoss) {
    const click = isTarget ? `selectTarget(${i})` : '';
    const targetGlow = isTarget ? 'border-color:#ff4040;box-shadow:0 0 16px rgba(255,64,64,0.6);' : '';
    const hasSpr = hasCharSprite(ch.id);
    const bossAtqCls = ch.curAtq > ch.atq ? 'sss-val sss-up' : ch.curAtq < ch.atq ? 'sss-val sss-down' : 'sss-val';
    const bossDefCls = ch.curDef > ch.def ? 'sss-val sss-up' : ch.curDef < ch.def ? 'sss-val sss-down' : 'sss-val';
    const bossShieldSt  = ch.statuses.find(s => s.id === 'shield');
    const bossShieldBar = bossShieldSt && bossShieldSt.val > 0
      ? `<div class="hp-shield-layer" style="width:${Math.min(100, bossShieldSt.val/ch.maxHp*100)}%"></div>` : '';
    const bossShieldVal = bossShieldSt && bossShieldSt.val > 0
      ? `<div class="slot-shield-val">🛡${bossShieldSt.val}</div>` : '';
    const bossBodyStyle = hasSpr
      ? 'background:none;border:none;box-shadow:none;border-radius:0'
      : `border:2px solid #d04050;background:linear-gradient(165deg,rgba(208,64,80,0.12) 0%,rgba(20,28,50,0.60) 55%,rgba(0,0,0,0.50) 100%);border-radius:10px;${targetGlow}`;
    const bossBodyClick = hasSpr ? `border-radius:0;${targetGlow}` : '';
    return `<div class="slot slot-boss${hasSpr ? ' has-sprite' : ''}" data-slot-idx="${i}" style="overflow:visible!important"
      onmousedown="charDetailStart('${ch.id}')" onmouseup="charDetailCancel()" onmouseleave="charDetailCancel()"
      ontouchstart="charDetailStart('${ch.id}')" ontouchend="charDetailCancel()" ontouchcancel="charDetailCancel()">

      <div class="char-root">
        <div class="char-icons-back" data-chid="${ch.id}">${buildStatusIconsHtml(ch)}</div>

        <div class="char-avatar">
          <div class="slot-body" onclick="${click}" style="${bossBodyStyle}">
            <div class="slot-suit" style="color:${s.color};position:relative;z-index:2">
              ${hasSpr
                ? `<img class="sprite-img sprite-slot" src="${getCharSprite(ch.id,'idle')}" alt="" draggable="false" data-char-id="${ch.id}" data-pose="idle" style="transform:scaleX(-1)">`
                : `<div style="font-size:14px">👑</div><div style="font-size:clamp(26px,7vw,38px);color:${s.color};line-height:1;filter:drop-shadow(0 3px 12px ${s.color})">${s.sym}</div>`
              }
            </div>
            <div class="slot-name" data-char-name="${ch.name}" style="z-index:2">
              ${hasSpr
                ? `<span style="font-size:11px;color:${s.color};filter:drop-shadow(0 0 5px ${s.color});flex-shrink:0">${s.sym}</span><span style="font-size:8px;color:rgba(255,255,255,0.9);text-shadow:0 1px 4px rgba(0,0,0,1);letter-spacing:0.3px">${ch.name}</span>`
                : ch.name
              }
            </div>
          </div>
        </div>
      </div>

      <div class="slot-hp-row">
        <div class="hp-wrap">
          <div class="hp-bar">
            <div class="hp-fill hp-num" style="width:${pct*100}%;background:${hpColor(pct)}"></div>
            ${bossShieldBar}
          </div>
          <div class="hp-txt">
            <span class="hp-cur" style="color:${hpColor(pct)}">${ch.hp}</span>
            <span style="color:#888">/ ${ch.maxHp}</span>
          </div>
        </div>
        ${bossShieldVal}
      </div>
      <div class="slot-stats-strip">
        <div class="sss-item"><span class="sss-lbl">ATQ</span><span class="${bossAtqCls}">${ch.curAtq}</span></div>
        <div class="sss-item"><span class="sss-lbl">DEF</span><span class="${bossDefCls}">${ch.curDef}</span></div>
        <div class="sss-item"><span class="sss-lbl">HP</span><span class="sss-val sss-hp">${ch.hp}</span></div>
      </div>
    </div>`;
  }

  // ── Cria de Boss: carta pequena estilo card ──
  if (ch.isBossSpawn) {
    const click = isTarget ? `selectTarget(${i})` : '';
    const targetGlow = isTarget ? 'border-color:#ff4040;box-shadow:0 0 12px rgba(255,64,64,0.6);' : '';
    return `<div class="slot slot-cria" data-slot-idx="${i}" style="overflow:visible!important"
      onmousedown="charDetailStart('${ch.id}')" onmouseup="charDetailCancel()" onmouseleave="charDetailCancel()"
      ontouchstart="charDetailStart('${ch.id}')" ontouchend="charDetailCancel()" ontouchcancel="charDetailCancel()">
      <div style="display:flex;flex-direction:column;align-items:center">
        <div class="char-icons-back" data-chid="${ch.id}" style="position:absolute;top:-6px;left:50%;transform:translateX(-50%);z-index:1">${buildStatusIconsHtml(ch)}</div>
        <div onclick="${click}" style="width:50px;height:68px;border-radius:8px;border:2px solid ${s.color};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;position:relative;background:linear-gradient(165deg,rgba(208,64,80,0.08) 0%,rgba(20,28,50,0.60) 55%,rgba(0,0,0,0.50) 100%);${targetGlow}">
          <div style="font-size:clamp(18px,5vw,24px);color:${s.color};line-height:1;filter:drop-shadow(0 2px 8px ${s.color})">${s.sym}</div>
          <div data-char-name="${ch.name}" style="font-family:'Cinzel',serif;font-size:6px;color:var(--text2);text-align:center">CRIA</div>
        </div>
        <div style="width:50px;margin-top:3px">
          <div class="hp-wrap">
            <div class="hp-bar"><div class="hp-fill hp-num" style="width:${pct*100}%;background:${hpColor(pct)}"></div></div>
            <div class="hp-txt"><span class="hp-cur" style="color:${hpColor(pct)}">${ch.hp}</span><span style="color:#888">/ ${ch.maxHp}</span></div>
          </div>
        </div>
        <div class="slot-stats-strip" style="width:50px">
          <div class="sss-item"><span class="sss-lbl">ATQ</span><span class="sss-val">${ch.curAtq}</span></div>
          <div class="sss-item"><span class="sss-lbl">DEF</span><span class="sss-val">${ch.curDef}</span></div>
          <div class="sss-item"><span class="sss-lbl">HP</span><span class="sss-val sss-hp">${ch.hp}</span></div>
        </div>
      </div>
    </div>`;
  }

  let cls = 'slot';
  if (isTarget)            cls += ' target';
  else if (isActor && o==='p1') cls += ' myturn';
  if (ch.id === 'sam' && (ch._charge||0) >= 5) cls += ' samus-charged';
  if (getCharSprite(ch.id, 'idle')) cls += ' has-sprite';

  const hasEncantado   = ch.statuses.find(s => s.id === 'encantado');
  const hasMirror      = ch.statuses.find(s => s.id === 'mirror');
  const hasOutfitAzul  = ch.statuses.find(s => s.id === 'outfit_azul');
  const hasOutfitVerde = ch.statuses.find(s => s.id === 'outfit_verde');
  const hasOutfitVerm  = ch.statuses.find(s => s.id === 'outfit_vermelha');
  const bodyGlow =
    hasEncantado   ? 'border-color:#b060e0;box-shadow:0 0 12px rgba(176,96,224,0.7)' :
    hasMirror      ? 'border-color:#a0a0d0;box-shadow:0 0 10px rgba(160,160,208,0.7)' :
    hasOutfitAzul  ? 'border-color:#4080ff;box-shadow:0 0 12px rgba(64,128,255,0.8)'  :
    hasOutfitVerde ? 'border-color:#50c850;box-shadow:0 0 10px rgba(80,200,80,0.6)'   :
    hasOutfitVerm  ? 'border-color:#ff5050;box-shadow:0 0 12px rgba(255,80,80,0.7)'   : '';
  const slotBodyStyle = getCharSprite(ch.id, 'idle') ? 'background:none;border:none;box-shadow:none;border-radius:0' : bodyGlow;



  // HP shield
  const shieldSt  = ch.statuses.find(s => s.id === 'shield');
  const shieldBar = shieldSt && shieldSt.val > 0
    ? `<div class="hp-shield-layer" style="width:${Math.min(100, shieldSt.val/ch.maxHp*100)}%"></div>` : '';
  const shieldVal = shieldSt && shieldSt.val > 0
    ? `<div class="slot-shield-val">🛡${shieldSt.val}</div>` : '';

  // Tap hint
  const hint = isActor && o === 'p1'
    ? `<div style="position:absolute;bottom:14px;left:0;right:0;font-size:7px;color:var(--gold);text-align:center;animation:blink 1s infinite;z-index:3">▼</div>` : '';

  const click = isTarget
    ? `selectTarget(${i})`
    : isActor && o === 'p1' ? `handlePlayerTap(${i})` : '';

  // Stats strip
  const atqCls = ch.curAtq > ch.atq ? 'sss-val sss-up' : ch.curAtq < ch.atq ? 'sss-val sss-down' : 'sss-val';
  const defCls = ch.curDef > ch.def ? 'sss-val sss-up' : ch.curDef < ch.def ? 'sss-val sss-down' : 'sss-val';

  const statsStrip = `<div class="slot-stats-strip">
    <div class="sss-item"><span class="sss-lbl">ATQ</span><span class="${atqCls}">${ch.curAtq}</span></div>
    <div class="sss-item"><span class="sss-lbl">DEF</span><span class="${defCls}">${ch.curDef}</span></div>
    <div class="sss-item"><span class="sss-lbl">HP</span><span class="sss-val sss-hp">${ch.hp}</span></div>
  </div>`;

  // Ícones de status: gerados a partir do estado
  const iconsHtml = buildStatusIconsHtml(ch);

  return `<div class="${cls}" data-slot-idx="${i}"
    onmousedown="charDetailStart('${ch.id}')" onmouseup="charDetailCancel()" onmouseleave="charDetailCancel()"
    ontouchstart="charDetailStart('${ch.id}')" ontouchend="charDetailCancel()" ontouchcancel="charDetailCancel()">

    <!-- char-root: âncora de posicionamento — SEM filter/opacity/transform -->
    <div class="char-root">
      <!-- CAMADA 1 (z:1): ícones atrás do avatar -->
      <div class="char-icons-back" data-chid="${ch.id}">${iconsHtml}</div>

      <!-- CAMADA 2 (z:2): avatar do personagem — filter/opacity aqui se necessário -->
      <div class="char-avatar">
        <div class="slot-body" onclick="${click}" style="${slotBodyStyle}">
          <div class="slot-suit" style="color:${s.color};position:relative;z-index:2">${getCharSprite(ch.id,"idle") ? charAvatarHtml(ch.id,s,"slot",ch,o) : s.sym}</div>
          <div class="slot-name" data-char-name="${ch.name}" style="z-index:2">${getCharSprite(ch.id,"idle") ? `<span style="font-size:11px;color:${s.color};filter:drop-shadow(0 0 5px ${s.color});flex-shrink:0">${s.sym}</span><span style="font-size:8px;color:rgba(255,255,255,0.9);text-shadow:0 1px 4px rgba(0,0,0,1);letter-spacing:0.3px">${ch.name}</span>` : ch.name}</div>
          ${hint}
        </div>
      </div>
    </div>

    <!-- HP bar -->
    <div class="slot-hp-row">
      <div class="hp-wrap">
        <div class="hp-bar">
          <div class="hp-fill hp-num" style="width:${pct*100}%;background:${hpColor(pct)}"></div>
          ${shieldBar}
        </div>
        <div class="hp-txt">
          <span class="hp-cur" style="color:${hpColor(pct)}">${ch.hp}</span>
          <span style="color:#888">/ ${ch.maxHp}</span>
        </div>
      </div>
      ${shieldVal}
    </div>
    ${statsStrip}
  </div>`;
}


function isSpecial(card) { return ['J','Q','K','A','★'].includes(card.val); }
function isEffectCard(card) { return isSpecial(card); } // alias — Cartas de Efeito (J/Q/K/A/★)
function isAttackSkill(sk) {
  // Skills that deal damage — specials blocked in card selection
  if(!sk) return false;
  if(sk.type==='Encanto'||sk.type==='Melhoria'||sk.type==='Suporte') return false;
  if(sk.target==='self') return false;
  return true;
}

function specialLabel(card) {
  if(card.val==='J') return '🛡 Esquivar';
  if(card.val==='Q') return '✨ Limpar';
  if(card.val==='K') return '⚡ Amplif.';
  if(card.val==='A') return '🃏 Comprar';
  if(card.val==='★') return '⭐ Extra';
  return '';
}

function renderHand() {
  const hand=G.p1.hand;
  document.getElementById('hand-cnt').textContent=hand.length;
  const actorEntry=G&&G.order?G.order[G.orderIdx]:null;
  const actorCh=actorEntry&&actorEntry.o==='p1'?actorEntry.ch:null;
  const _hand=document.getElementById('hand'); if(!_hand) return;
  _hand.innerHTML=hand.map((card,i)=>{
    const s=SUITS[card.suit]||SUITS.neutral;
    const spec=isSpecial(card);
    const isEspec=actorCh&&!spec&&card.suit===actorCh.suit&&card.suit!=='joker'&&actorCh.suit!=='neutral';
    const sColor=s.color;
    const specLbl=spec?`<div style="font-size:8px;color:var(--gold);text-align:center;line-height:1;margin-top:2px">${specialLabel(card)}</div>`:'';
    const especHandLbl=isEspec?`<div style="font-size:8px;color:${sColor};text-align:center;font-weight:700;line-height:1">★ESP</div>`:'';
    const border=spec?'border-color:var(--gold);box-shadow:0 0 8px rgba(201,168,76,0.4)':
                 isEspec?`border-color:${sColor};box-shadow:0 0 8px ${sColor};`:'';
    return `<div class="card s-${card.suit}" style="${border}" onclick="handleCardTap(${i})" id="hcard${i}">
      <div class="card-corner">${card.val}<br>${s.sym}</div>
      <div class="card-s">${s.sym}</div>
      <div class="card-v">${card.val}</div>
      ${specLbl}${especHandLbl}
    </div>`;
  }).join('');
}

function handleCardTap(idx) {
  if(isCharDetailOpen()) return;
  const card=G.p1.hand[idx];
  if(!isSpecial(card)) return; // only special cards are tappable outside skill selection
  const a=actor();
  if(!a||a.o!=='p1') return;
  useSpecialCard(idx, card, a);
}

function useSpecialCard(idx, card, actor) {
  const ch=actor.ch;
  const charIdx=G.p1.chars.indexOf(ch);

  if(card.val==='Q') {
    // Dama: remove all statuses from chosen ally — show picker
    showQueenPicker(idx);
    return;
  }
  if(card.val==='A') {
    // Ás: draw a card (Quick Action — doesn't end turn)
    discard('p1',idx);
    draw('p1', 1, '🃏 Ás');
    floatEffectCardUsed(ch, card);
    addLog(`🃏 Ás usado! ${ch.name} comprou uma carta. (Ação Rápida)`,'info');
    render();
    return; // quick, no nextActor
  }
  if(card.val==='★') {
    discard('p1',idx);
    floatEffectCardUsed(ch, card);
    if(!grantExtraTurn(ch, 'Coringa')) {
      addLog('Coringa: '+ch.name+' já tem rodada extra nesta rodada!','info');
    }
    render();
    return;
  }
  if(card.val==='K') {
    // Rei: next skill used gets +card.nv power bonus
    ch._kingBonus=card.nv;
    discard('p1',idx);
    floatEffectCardUsed(ch, card);
    addLog(`👑 Rei! Próxima habilidade de ${ch.name} +${card.nv} de poder!`,'info');
    render();
    return; // quick
  }
  // J (Valete) is handled in defense — show info
  if(card.val==='J') {
    addLog(`ℹ️ Valete: use como carta de defesa para esquivar completamente um ataque!`,'info');
    return;
  }
}

function showQueenPicker(cardIdx) {
  const allies=G.p1.chars.filter(c=>c.alive&&c.statuses.length>0);
  if(!allies.length){
    addLog('✨ Nenhum aliado com status para limpar!','info');
    return;
  }
  const btns=allies.map(a=>`
    <button onclick="applyQueen(${G.p1.chars.indexOf(a)},${cardIdx})" 
      style="background:var(--bg3);border:1px solid var(--border);color:var(--text);
      padding:10px;border-radius:6px;font-family:'Cinzel',serif;font-size:12px;cursor:pointer;width:100%">
      ${a.name} — ${a.statuses.map(s=>s.icon).join(' ')}
    </button>`).join('');
  document.getElementById('panel-title').textContent='✨ Dama — Limpar Status';
  document.getElementById('panel-body').innerHTML=`
    <div style="font-size:12px;color:var(--text2);margin-bottom:8px">Escolha um aliado para remover todos os status negativos:</div>
    <div style="display:flex;flex-direction:column;gap:6px">${btns}</div>
    <button class="btn-cancel" style="margin-top:8px;width:100%" onclick="closePanel()">Cancelar</button>`;
  openPanel();
}

function applyQueen(charIdx, cardIdx) {
  const ch=G.p1.chars[charIdx];
  const queenCard = G.p1.hand[cardIdx];
  const removed=ch.statuses.filter(s=>['burn','bleed','exposed','weak','frozen','stun','chill','melt','static','slow','rad','poison'].includes(s.id));
  ch.statuses=ch.statuses.filter(s=>!['burn','bleed','exposed','weak','frozen','stun','chill','melt','static','slow','rad','poison'].includes(s.id));
  if(removed.find(s=>s.id==='exposed')) ch.curDef=ch.def;
  if(removed.find(s=>s.id==='weak')) ch.curAtq=ch.atq;
  discard('p1',cardIdx);
  floatEffectCardUsed(ch, queenCard);
  addLog(`✨ Dama! Todos os status de ${ch.name} removidos!`,'info');
  closePanel();
  render();
}

// ===================== LOG =====================
// ══ LOG GLOBAL — registra tudo desde a seleção ══
var _gameLog = [];
function _logEvent(msg, category) {
  var now = new Date();
  var ts = now.toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
  _gameLog.push('[' + ts + '] [' + (category || 'SYS') + '] ' + msg);
}
function _downloadLog() {
  if (_gameLog.length === 0) { alert('Log vazio.'); return; }
  var header = '═══ PATF TCG — LOG DE PARTIDA ═══\n';
  header += 'Data: ' + new Date().toLocaleDateString('pt-BR') + '\n';
  header += 'Versão: ' + (typeof GAME_VERSION !== 'undefined' ? GAME_VERSION : '?') + '\n';
  header += 'Total de eventos: ' + _gameLog.length + '\n';
  header += '════════════════════════════════\n\n';
  var content = header + _gameLog.join('\n');
  var blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'PATF_Log_' + new Date().toISOString().slice(0,10) + '_' + Date.now() + '.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  addLog('⬇ Log baixado: ' + a.download, 'sys');
}
function _clearGameLog() { _gameLog = []; _logEvent('Log limpo', 'SYS'); }

function addLog(msg,type='') {
  const el=document.getElementById('log');
  if(el) {
    const d=document.createElement('div');
    d.className='log-line '+type; d.textContent=msg;
    el.appendChild(d); el.scrollTop=el.scrollHeight;
  }
  _logEvent(msg, type || 'game');
}

// ===================== FLOAT DMG =====================
function showVermelhaPainel(link, attacker) {
  // If AI owns Tyren, auto counter 50%
  if(link.owner==='p2') {
    if(Math.random()<0.5) {
      const aecSk = link.skills.find(s=>s.id==='aec')||link.skills[1];
      const card = G.p2.hand.length>0?G.p2.hand[Math.floor(Math.random()*G.p2.hand.length)]:{suit:'neutral',val:'—',nv:0};
      if(G.p2.hand.length>0){const ci=G.p2.hand.indexOf(card);if(ci>=0)discard('p2',ci);}
      const sk={...aecSk,acao:'F'};
      addLog('🔴 Tyren IA usa Avanco Escudo!','info');
      // JUIZ: contra-ataque entra no servidor
      if(!judgeCheck('counter_start', { who: link.name, target: attacker.name, skill: aecSk.name||'Avanço Escudo', owner: 'p2' })) return;
      floatCounterAttack(link, '🔴 CONTRA!', '#ff5050');
      animCounterMove(link, attacker).then(() => {
        resolveAttack(link, sk, card, attacker, null, 'p2');
        judgeCheck('action_end');
      });
    }
    return;
  }

  // Player — show panel
  G._pendingVermelha = {link, attacker};
  const hand = G.p1.hand;
  const aecSk = link.skills.find(s=>s.id==='aec')||link.skills[1];

  const cardsHtml = hand.map((card,i)=>{
    const s=SUITS[card.suit]||SUITS.neutral;
    const isEspec=card.suit===link.suit&&card.suit!=='joker'&&link.suit!=='neutral'&&!isSpecial(card);
    const glow=isEspec?'box-shadow:0 0 10px '+s.color+';border-color:'+s.color+';':'';
    const especLbl=isEspec?'<div style="font-size:8px;color:'+s.color+';font-weight:700">★ESP</div>':'';
    return '<div class="card s-'+card.suit+'" id="vc'+i+'" style="'+glow+'" onclick="pickVermelhaCard('+i+')">'
      +'<div class="card-corner">'+card.val+'<br>'+s.sym+'</div>'
      +'<div class="card-s">'+s.sym+'</div>'
      +'<div class="card-v">'+card.val+'</div>'
      +especLbl+'</div>';
  }).join('');

  document.getElementById('panel-title').textContent = '🔴 Roupa Vermelha — Contra-atacar?';
  document.getElementById('panel-body').innerHTML =
    '<div class="card-panel-info">'
    +'<strong>'+aecSk.name+'</strong> — Poder: '+aecSk.power+'<br>'
    +'Alvo: <strong>'+attacker.name+'</strong><br>'
    +'<span style="color:var(--text2)">Escolha uma carta para contra-atacar, ou segure.</span>'
    +'</div>'
    +'<div class="card-grid-panel" id="vermelha-grid">'+cardsHtml+'</div>'
    +'<div class="confirm-row">'
    +'<button class="btn-cancel" onclick="executeVermelha(false)">🛡 Segurar</button>'
    +'<button class="btn-confirm" id="btn-verm-conf" disabled onclick="executeVermelha(true)">🔴 Contra-atacar</button>'
    +'</div>';
  openPanel();
}

function pickVermelhaCard(idx) {
  G._pendingVermCard = idx;
  document.querySelectorAll('#vermelha-grid .card').forEach(c=>c.classList.remove('sel'));
  const el=document.getElementById('vc'+idx);
  if(el) el.classList.add('sel');
  (()=>{const _el_btn_verm_conf=document.getElementById('btn-verm-conf');if(_el_btn_verm_conf){_el_btn_verm_conf.disabled=false;}})()
}

function executeVermelha(doCounter) {
  closePanel();
  const fu=G._pendingVermelha;
  G._pendingVermelha=null;
  if(!fu||!doCounter) { G._pendingVermCard=null; return; }
  const {link, attacker}=fu;
  const aecSk=link.skills.find(s=>s.id==='aec')||link.skills[1];
  const sk={...aecSk, acao:'F'};
  let card={suit:'neutral',val:'—',nv:0};
  if(G._pendingVermCard!==null) {
    card=discard('p1',G._pendingVermCard);
  }
  G._pendingVermCard=null;
  addLog('🔴 Tyren contra-ataca '+attacker.name+' com '+aecSk.name+'!','info');
  // JUIZ: contra-ataque entra no servidor
  if(!judgeCheck('counter_start', { who: link.name, target: attacker.name, skill: aecSk.name, owner: 'p1' })) return;
  floatCounterAttack(link, '🔴 CONTRA!', '#ff5050');
  animCounterMove(link, attacker).then(() => {
    resolveAttack(link, sk, card, attacker, null, 'p1');
    judgeCheck('action_end');
    if(!G.over) render();
  });
}

// ── Fase 8j Sub-C: Tyre/Roupa Vermelha PvP ──
function showVermelhaPainelPvP(link) {
  var myOwner = G.localPlayer === 0 ? 'p1' : 'p2';
  var hand = G[myOwner].hand;
  var avsSkill = link.skills.find(function(s) { return s.id === 'avs'; }) || link.skills[0];
  var cardsHtml = hand.map(function(card, i) {
    var s = SUITS[card.suit] || SUITS.neutral;
    return '<div class="card s-' + card.suit + '" id="vcp' + i + '" onclick="pickVermelhaPvPCard(' + i + ')">'
      + '<div class="card-corner">' + card.val + '<br>' + s.sym + '</div>'
      + '<div class="card-s">' + s.sym + '</div>'
      + '<div class="card-v">' + card.val + '</div>'
      + '</div>';
  }).join('');
  G._pendingVermelha = { link: link };
  document.getElementById('panel-title').textContent = '🔴 Roupa Vermelha — Contra-atacar?';
  document.getElementById('panel-body').innerHTML =
    '<div class="card-panel-info">'
    + '<strong>' + (avsSkill ? avsSkill.name : 'Avanço Escudo') + '</strong><br>'
    + '<span style="color:var(--text2)">Escolha uma carta para contra-atacar, ou segure.</span>'
    + '</div>'
    + '<div class="card-grid-panel" id="vermelha-pvp-grid">' + cardsHtml + '</div>'
    + '<div class="confirm-row">'
    + '<button class="btn-cancel" onclick="executeVermelhaPvP(false)">🛡 Segurar</button>'
    + '<button class="btn-confirm" id="btn-verm-pvp-conf" disabled onclick="executeVermelhaPvP(true)">🔴 Contra-atacar</button>'
    + '</div>';
  openPanel();
}

function pickVermelhaPvPCard(idx) {
  G._pendingVermCard = idx;
  document.querySelectorAll('#vermelha-pvp-grid .card').forEach(function(c) { c.classList.remove('sel'); });
  var el = document.getElementById('vcp' + idx);
  if (el) el.classList.add('sel');
  var btn = document.getElementById('btn-verm-pvp-conf');
  if (btn) btn.disabled = false;
}

function executeVermelhaPvP(doCounter) {
  closePanel();
  var myOwner = G.localPlayer === 0 ? 'p1' : 'p2';
  var cardNv = 0;
  if (doCounter && G._pendingVermCard !== null) {
    var card = G[myOwner].hand[G._pendingVermCard];
    if (card) {
      cardNv = card.nv || 0;
      G[myOwner].hand.splice(G._pendingVermCard, 1);
    }
  }
  G._pendingVermCard = null;
  G._pendingVermelha = null;
  pvpSend('counter_response', { counterCardNv: doCounter ? cardNv : 0 });
}

function showClubsFollowUp(fu) {
  const {attacker, target, atkOwner} = fu;
  const sk0 = {...attacker.skills[0], acao:'F'};
  // JUIZ: contra-ataque entra no servidor
  if(!judgeCheck('counter_start', { who: attacker.name, target: target.name, skill: sk0.name, owner: atkOwner })) return;
  addLog('🔍 JUIZ (Contra-ataque): '+attacker.name+'('+attacker.suit+') contra-ataca '+target.name+' com '+sk0.name+' [Furtivo]', 'sys');

  // AI: automático sem carta
  if(atkOwner === 'p2') {
    const nullCard = {suit:'neutral', val:'—', nv:0};
    addLog('♣ (f) '+attacker.name+' contra-ataca '+target.name+' com '+sk0.name+'! [ATQ+POD, Furtivo]','info');
    showAdvTag(attacker, '♣ Contra-ataque! (f)', 'var(--clubs)');
    floatCounterAttack(attacker, '♣ CONTRA!', 'var(--clubs)');
    slotFlash(attacker, 'clubs');
    showTargetedAnim(target);
    animCounterMove(attacker, target).then(() => {
      resolveAttack(attacker, sk0, nullCard, target, null, atkOwner);
      judgeCheck('action_end');
      if(!G.over) {
        const qa = G._clubsAfterQuick; G._clubsAfterQuick = null;
        if(qa) { afterQuickAction(qa.ch, qa.idx); }
        else { nextActor(); render(); }
      }
    });
    return;
  }

  // Jogador: painel inline — contra-ataque automático garantido,
  // carta é opcional para potencializar
  G._pendingClubsFu = fu;
  G._pendingClubsCardIdx = null;
  const hand = G.p1.hand;
  const pow = typeof sk0.power==='string' ? parseInt(sk0.power.split('/')[0]) : sk0.power;
  const baseDmg = attacker.curAtq + pow;

  const cardsHtml = hand.length ? hand.map((card,i) => {
    const s = SUITS[card.suit]||SUITS.neutral;
    const isEspec = card.suit===attacker.suit && card.suit!=='joker' && attacker.suit!=='neutral' && !isSpecial(card);
    const glow = isEspec ? `box-shadow:0 0 10px 2px ${s.color};border-color:${s.color};` : '';
    const especLbl = isEspec ? `<div style="font-size:8px;color:${s.color};font-weight:700">★ESP</div>` : '';
    const bonus = isSpecial(card) ? 0 : (isEspec ? card.nv*2 : card.nv);
    return `<div class="card s-${card.suit}" id="cfu${i}" style="${glow}" onclick="pickClubsCard(${i},${bonus})">
      <div class="card-corner">${card.val}<br>${s.sym}</div>
      <div class="card-s">${s.sym}</div>
      <div class="card-v">${card.val}</div>
      ${especLbl}
    </div>`;
  }).join('') : '<span style="color:var(--text2);font-size:11px">Sem cartas na mão</span>';

  document.getElementById('panel-title').textContent = '♣ Contra-ataque Furtivo!';
  document.getElementById('panel-body').innerHTML = `
    <div class="card-panel-info" style="border-left:3px solid var(--clubs)">
      <div style="font-size:12px;font-weight:700;color:var(--clubs)">♣ ${attacker.name} → ${target.name}</div>
      <div style="font-size:11px;margin:4px 0">Habilidade: <b>${sk0.name}</b> (Furtivo)</div>
      <div style="font-size:11px">Dano base garantido: <b style="color:var(--red)">${baseDmg}</b> (ATQ ${attacker.curAtq} + POD ${pow})</div>
      <div style="font-size:10px;color:var(--text2);margin-top:4px">Adicione uma carta para potencializar o dano — ou confirme sem carta.</div>
    </div>
    <div id="clubs-card-preview" style="font-size:11px;color:var(--gold);min-height:16px;margin:6px 0;text-align:center"></div>
    <div class="card-grid-panel" id="clubs-grid">${cardsHtml}</div>
    <div class="confirm-row" style="margin-top:8px">
      <button class="btn-gold" style="flex:1" onclick="executeClubsFu(false)">⚔ Atacar sem carta (${baseDmg})</button>
      <button class="btn-confirm" id="btn-clubs-conf" disabled onclick="executeClubsFu(true)">⚔ + Carta</button>
    </div>`;
  openPanel();
}

function pickClubsCard(idx, bonus) {
  G._pendingClubsCardIdx = idx;
  document.querySelectorAll('#clubs-grid .card').forEach((el,i) => el.classList.toggle('sel', i===idx));
  const fu = G._pendingClubsFu;
  const sk0 = fu.attacker.skills[0];
  const pow = typeof sk0.power==='string' ? parseInt(sk0.power.split('/')[0]) : sk0.power;
  const total = fu.attacker.curAtq + pow + bonus;
  const preview = document.getElementById('clubs-card-preview');
  if(preview) preview.textContent = `Com carta: dano estimado ~${total}`;
  const btn = document.getElementById('btn-clubs-conf');
  if(btn) btn.disabled = false;
}

function executeClubsFu(useCard) {
  closePanel();
  const fu = G._pendingClubsFu;
  G._pendingClubsFu = null;
  if(!fu) return;
  const {attacker, target, atkOwner} = fu;
  const sk0 = {...attacker.skills[0], acao:'F'};
  let card = {suit:'neutral', val:'—', nv:0};
  if(useCard && G._pendingClubsCardIdx !== null) {
    card = discard('p1', G._pendingClubsCardIdx);
  }
  G._pendingClubsCardIdx = null;
  addLog('♣ (f) '+attacker.name+' contra-ataca '+target.name+' com '+sk0.name+(useCard?' +carta':'')+'! [Furtivo]','info');
  showAdvTag(attacker, '♣ Contra-ataque! (f)', 'var(--clubs)');
  floatCounterAttack(attacker, '♣ CONTRA!', 'var(--clubs)');
  slotFlash(attacker, 'clubs');
  showTargetedAnim(target);
  animCounterMove(attacker, target).then(() => {
    resolveAttack(attacker, sk0, card, target, null, atkOwner);
    judgeCheck('action_end');
    if(!G.over) {
      const qa = G._clubsAfterQuick; G._clubsAfterQuick = null;
      if(qa) { afterQuickAction(qa.ch, qa.idx); }
      else { nextActor(); render(); }
    }
  });
}
function afterClubsFu(wasQuick, ch, idx) {
  if(wasQuick) { afterQuickAction(ch,idx); }
  else { nextActor(); render(); }
}

function applyHeartsAdv(heartsChar, clubsChar) {
  // Fúria Polar: se DEF atual for negativa, a dobra de DEF não ativa (só ATQ dobra)
  const _fpDefNeg = heartsChar.passive === 'furia_polar' && heartsChar.curDef < 0;
  const existing = heartsChar.statuses.find(s=>s.id==='hearts_adv');
  if(existing) {
    judgeCheck('passive_start', { who: heartsChar.name, passive: 'Vantagem Copas (renovação)', charObj: heartsChar, extra: false, noExtra: false });
    existing.turns = 2;
    existing.label = 'Bônus Copas: ATQ/DEF×2 (2t)';
    heartsChar.curAtq = heartsChar.atq * 2;
    if (!_fpDefNeg) heartsChar.curDef = heartsChar.def * 2;
    showAdvTag(heartsChar, '❤️ Renovado!', 'var(--hearts)');
    addLog('❤️ '+heartsChar.name+' manteve a vantagem de Copas! Duração renovada.' + (_fpDefNeg ? ' (DEF negativa — dobra de DEF bloqueada)' : ''), 'info');
    floatStatus(heartsChar, '❤️ ×2 Renovado!', 'var(--hearts)');
    judgeCheck('passive_result', { who: heartsChar.name, passive: 'Vantagem Copas (renovação)', result: 'Duração renovada (2t) — ATQ:'+heartsChar.curAtq+' DEF:'+heartsChar.curDef+(_fpDefNeg?' (DEF neg — sem dobra)':'') });
  } else {
    judgeCheck('passive_start', { who: heartsChar.name, passive: 'Vantagem Copas (nova ativação)', charObj: heartsChar, extra: false, noExtra: false });
    heartsChar.curAtq = heartsChar.atq * 2;
    if (!_fpDefNeg) heartsChar.curDef = heartsChar.def * 2;
    addSt(heartsChar, {id:'hearts_adv', icon:'❤️', label:'Bônus Copas: ATQ/DEF×2 (2t)', turns:2});
    showAdvTag(heartsChar, '❤️ ♥→♣ ATQ×2!', 'var(--hearts)');
    showAdvTag(clubsChar, '❤️ Vantagem Copas!', 'var(--hearts)');
    addLog('❤️ [NAIPE] Copas→Paus: ATQ' + (_fpDefNeg ? '' : ' e DEF') + ' de '+heartsChar.name+' dobrados por 2 turnos!' + (_fpDefNeg ? ' (DEF negativa — dobra de DEF bloqueada)' : ''), 'info');
    floatStatus(heartsChar, '❤️ ATQ×2!', 'var(--hearts)');
    slotFlashSuit(heartsChar, 'hearts'); slotFlashSuit(clubsChar, 'clubs');
    setTimeout(() => showSuitAdvFlash('♥', 'VANTAGEM COPAS', heartsChar.name + ' ATQ' + (_fpDefNeg ? '' : '/DEF') + ' ×2 por 2 turnos!', '#e04060'), 800);
    judgeCheck('passive_result', { who: heartsChar.name, passive: 'Vantagem Copas (nova ativação)', result: 'ATQ' + (_fpDefNeg?'':'/ DEF') + ' dobrados (2t) — ATQ:'+heartsChar.curAtq+' DEF:'+heartsChar.curDef+(_fpDefNeg?' (DEF neg — sem dobra)':'')+' | vs '+clubsChar.name+' (Paus)' });
  }
}

// Fontes validas de Rodada Extra
var _JUDGE_EXTRA_TURN_SOURCES = [
  'Coringa',
  'Coringa IA',
  'Ouro→Espadas',
  'Ouro←Espadas',
  'Grande Estrela',
];

function grantExtraTurn(ch, source, extraData={}) {
  // JUIZ: verificar fonte
  var _sourceValida = _JUDGE_EXTRA_TURN_SOURCES.indexOf(source) >= 0;
  if(!_sourceValida) {
    var errET = '⚠ JUIZ (Rodada Extra): Fonte desconhecida "' + source + '" para ' + ch.name + ' — nao esta nas regras!';
    _judge.errors.push(errET);
    addLog(errET, 'dmg');
    console.error('[JUIZ]', errET);
  }

  // JUIZ: verificar se ja usou
  if(ch.extraTurnUsed) {
    addLog('🔍 JUIZ (Rodada Extra): ' + ch.name + ' ja usou Rodada Extra — bloqueado. Regra: 1 por turno. (Fonte: ' + source + ')', 'sys');
    addLog(ch.name+' ja tem rodada extra nesta rodada.','info');
    return false;
  }

  // JUIZ: verificar conflito Nimb
  if((ch.id==='nyxa'||ch.id==='nyxa_ai') && ch._nimbUsedThisTurn) {
    addLog('🔍 JUIZ (Rodada Extra): Nyxar — Nimb ativo bloqueia Rodada Extra. Regra: evitar 3 acoes no mesmo turno. (Fonte: ' + source + ')', 'sys');
    addLog('🪙 Nyxar: Nimb ativo — rodada extra bloqueada para evitar conflito.','info');
    return false;
  }

  // JUIZ: verificar ator atual vs quem recebe
  var atorAtual = G.order[G.orderIdx];
  var atorNome = atorAtual ? atorAtual.ch.name : '?';
  if(atorAtual && atorAtual.ch !== ch) {
    addLog('🔍 JUIZ (Rodada Extra): ATENCAO — ' + ch.name + ' recebe Rodada Extra mas ator atual e ' + atorNome + '! Verifique a fonte. (Fonte: ' + source + ')', 'sys');
    console.warn('[JUIZ] Rodada Extra concedida a', ch.name, 'mas ator atual e', atorNome, '| Fonte:', source);
  } else {
    addLog('🔍 JUIZ (Rodada Extra): ' + ch.name + ' recebe Rodada Extra. Fonte: ' + source + ' | Ator: ' + atorNome + ' OK', 'sys');
  }

  ch.extraTurnUsed = true;
  if(_judge) _judge.lastActivity = Date.now();

  const chEntry = G.order.find(e => e.ch === ch && !e.extra) || {ch, o: ch.owner||G.order[G.orderIdx].o};
  G.order = G.order.filter((e,i) => i<=G.orderIdx || !(e.ch===ch && e.extra));
  G.order.splice(G.orderIdx+1, 0, {...chEntry, extra:true, ...extraData});
  addLog('['+source+'] '+ch.name+' ganha rodada extra!','info');
  showAdvTag(ch, '+1 Rodada Extra!', 'var(--gold)');
  return true;
}

function showTargetedAnim(ch) {
  document.querySelectorAll('.slot').forEach(sl => {
    if(sl.querySelector('[data-char-name]')?.dataset.charName === ch.name) {
      sl.classList.add('targeted');
      setTimeout(()=>sl.classList.remove('targeted'), 1800);
    }
  });
}

function pulseAttackerTarget(attacker, target, duration=1000) {
  // Highlight attacker (green pulse) and target (red pulse) simultaneously
  [attacker, target].forEach((ch, idx) => {
    const color = idx===0 ? 'attacking' : 'targeted';
    document.querySelectorAll('.slot').forEach(sl => {
      if(sl.querySelector('[data-char-name]')?.dataset.charName === ch.name) {
        sl.classList.add(color);
        setTimeout(()=>sl.classList.remove(color), duration);
      }
    });
  });
}

function showAreaTargetedAnim() {
  return new Promise(resolve => {
    document.querySelectorAll('.slot').forEach(sl => {
      sl.classList.add('area-targeted');
      setTimeout(()=>sl.classList.remove('area-targeted'), 1600);
    });
    setTimeout(resolve, 400);
  });
}

// ═══════════════════════════════════════════════════════════════════
// SKILL ANIMATION SYSTEM — flash de nome + movimento JRPG do avatar
// ═══════════════════════════════════════════════════════════════════

// Trava input durante animação
let _skillAnimLock = false;

function isSkillAnimLocked() { return _skillAnimLock; }

// Encontra o elemento .slot de um personagem pelo nome
function _findSlotEl(ch) {
  return [...document.querySelectorAll('.slot')]
    .find(sl => sl.querySelector('[data-char-name]')?.dataset.charName === ch.name) || null;
}

// Retorna o centro absoluto (px) de um elemento na tela
function _elCenter(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

// Retorna a posição base (translate já aplicado) do slot no field
// O slot está posicionado com left/top em % + translate(-50%,-50%)
// Precisamos do centro absoluto da posição "em casa"
function _slotHomeCenter(sl) {
  const r = sl.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

// Flash centralizado com nome da habilidade — estilo Vampire Survivors
function _showSkillFlash(sk, ch) {
  return new Promise(resolve => {
    const overlay = document.getElementById('skill-flash-overlay');
    const nameEl  = document.getElementById('skill-flash-name');
    const subEl   = document.getElementById('skill-flash-sub');
    if (!overlay || !nameEl) { resolve(); return; }

    const typeColors = {
      'Fogo'      : '#ff6030',
      'Elétrico'  : '#60c0ff',
      'Frio'      : '#80e8ff',
      'Energia'   : '#c080ff',
      'Corporal'  : '#e8c04c',
      'Cortante'  : '#e8e8e8',
      'Perfurante': '#c0e860',
      'Distância' : '#80c0ff',
      'Invocação' : '#a060e0',
      'Químico'   : '#80e880',
      'Mágico'    : '#e080ff',
      'Cura'      : '#60e8a0',
      'Encanto'   : '#e060c0',
      'Melhoria'  : '#c0c060',
      'Suporte'   : '#c0c060',
      'Terrestre' : '#c08040',
    };
    const color = typeColors[sk.type] || 'var(--gold)';

    nameEl.textContent = sk.name;
    nameEl.style.color = color;
    nameEl.style.textShadow = `0 0 20px ${color}, 0 0 50px ${color}, 0 0 90px ${color}cc, 0 0 140px ${color}66, 0 3px 12px rgba(0,0,0,1)`;
    subEl.textContent  = ch.name.toUpperCase() + ' — ' + (sk.type || '');
    subEl.style.color  = color;

    // CSS var para as linhas laterais
    overlay.style.setProperty('--sf-color', color);

    // Entra
    overlay.style.opacity = '0';
    overlay.style.animation = '';
    overlay.classList.add('active');
    overlay.style.transition = 'opacity 0ms';

    const content = document.getElementById('skill-flash-content');
    content.style.animation = 'none';
    void content.offsetWidth;

    requestAnimationFrame(() => {
      overlay.style.transition = 'opacity 200ms ease';
      overlay.style.opacity    = '1';
      content.style.animation  = 'skill-flash-in 350ms cubic-bezier(0.2,1.4,0.4,1) forwards';
    });

    // Spawna estrelas ao redor do nome
    var layer = document.getElementById('vfx-layer');
    if (layer && _vfxEnabled) {
      var cx = window.innerWidth / 2;
      var cy = window.innerHeight / 2;
      var stars = ['★','✦','✧','✨','⚡','💥'];
      for (var i = 0; i < 8; i++) {
        (function(i) {
          setTimeout(function() {
            var el = document.createElement('div');
            var angle = (i / 8) * Math.PI * 2;
            var dist  = 80 + Math.random() * 100;
            var sx = cx + Math.cos(angle) * dist;
            var sy = cy + Math.sin(angle) * dist;
            var sz = 16 + Math.random() * 22;
            el.style.cssText = 'position:absolute;left:'+sx+'px;top:'+sy+'px;font-size:'+sz+'px;color:'+color+';text-shadow:0 0 12px '+color+',0 0 24px '+color+';transform:translate(-50%,-50%);animation:skill-flash-star 700ms ease forwards;pointer-events:none;z-index:9997';
            el.textContent = stars[Math.floor(Math.random() * stars.length)];
            layer.appendChild(el);
            setTimeout(function(){ el.remove(); }, 800);
          }, i * 40 + 100);
        })(i);
      }
      // Raios horizontais
      for (var r = 0; r < 3; r++) {
        (function(r) {
          setTimeout(function() {
            var el = document.createElement('div');
            var ry = cy + (r - 1) * 30;
            var w  = 60 + Math.random() * 120;
            var side = Math.random() > 0.5 ? 1 : -1;
            var rx = cx + side * (150 + Math.random() * 100);
            el.style.cssText = 'position:absolute;left:'+rx+'px;top:'+ry+'px;width:'+w+'px;height:3px;background:linear-gradient(90deg,transparent,'+color+',transparent);box-shadow:0 0 8px '+color+';transform:translate(-50%,-50%);animation:skill-flash-ray 500ms ease forwards;pointer-events:none;z-index:9997';
            layer.appendChild(el);
            setTimeout(function(){ el.remove(); }, 600);
          }, r * 80 + 50);
        })(r);
      }
    }

    // Hold 900ms → fade out 250ms → resolve
    setTimeout(() => {
      content.style.animation = 'skill-flash-out 250ms ease forwards';
      overlay.style.transition = 'opacity 250ms ease';
      overlay.style.opacity    = '0';
      setTimeout(() => {
        overlay.classList.remove('active');
        overlay.style.opacity = '';
        resolve();
      }, 250);
    }, 900);
  });
}

// Spawna o flash de impacto no field
// Cores e ícones por tipo de skill
var _IMPACT_TYPES = {
  'Fogo'      : { color: '#ff6030', color2: '#ffaa20', icon: '🔥', particles: 14, ring: true },
  'Elétrico'  : { color: '#60c0ff', color2: '#ffffff', icon: '⚡', particles: 12, ring: true },
  'Frio'      : { color: '#80e8ff', color2: '#c0f8ff', icon: '❄️', particles: 10, ring: true },
  'Energia'   : { color: '#c080ff', color2: '#e0b0ff', icon: '✨', particles: 12, ring: true },
  'Corporal'  : { color: '#e8c04c', color2: '#ffffff', icon: '💥', particles: 10, ring: true },
  'Cortante'  : { color: '#e8e8e8', color2: '#c0c0c0', icon: '🗡️', particles: 8,  ring: false },
  'Perfurante': { color: '#c0e860', color2: '#e0ff80', icon: '💚', particles: 8,  ring: false },
  'Distância' : { color: '#80c0ff', color2: '#c0e0ff', icon: '🎯', particles: 8,  ring: false },
  'Invocação' : { color: '#a060e0', color2: '#e080ff', icon: '⭐', particles: 16, ring: true },
  'Químico'   : { color: '#80e880', color2: '#c0ffc0', icon: '☢️', particles: 10, ring: true },
  'Terrestre' : { color: '#c08040', color2: '#e0a060', icon: '💥', particles: 12, ring: true },
};

function _spawnImpactFx(targetSlot, skType) {
  const field = document.querySelector('.field');
  if (!field || !targetSlot) return;

  const fr   = field.getBoundingClientRect();
  const tr   = targetSlot.getBoundingClientRect();
  const cx   = tr.left + tr.width  / 2 - fr.left;
  const cy   = tr.top  + tr.height / 2 - fr.top;
  const pctX = (cx / fr.width  * 100).toFixed(1) + '%';
  const pctY = (cy / fr.height * 100).toFixed(1) + '%';

  // Config do tipo — fallback genérico
  var cfg = _IMPACT_TYPES[skType] || { color: '#ffffff', color2: '#ffdd88', icon: '💥', particles: 10, ring: true };

  // Flash de área colorido
  const flash = document.createElement('div');
  flash.className = 'field-impact-flash';
  flash.style.setProperty('--ix', pctX);
  flash.style.setProperty('--iy', pctY);
  flash.style.setProperty('--if-color', cfg.color);
  field.appendChild(flash);
  setTimeout(() => flash.remove(), 400);

  // Anel expansivo colorido
  if (cfg.ring) {
    const ring = document.createElement('div');
    ring.className = 'impact-ring';
    ring.style.left = cx + 'px';
    ring.style.top  = cy + 'px';
    ring.style.borderColor = cfg.color;
    ring.style.boxShadow = '0 0 12px ' + cfg.color + ', 0 0 24px ' + cfg.color + '88';
    field.appendChild(ring);
    setTimeout(() => ring.remove(), 400);
  }

  if (!_vfxEnabled) return;

  // Ícone de impacto explodindo do centro
  var layer = document.getElementById('vfx-layer');
  if (layer) {
    var ico = document.createElement('div');
    var absCx = tr.left + tr.width / 2;
    var absCy = tr.top  + tr.height / 2;
    ico.style.cssText = 'position:absolute;left:'+absCx+'px;top:'+absCy+'px;font-size:32px;transform:translate(-50%,-50%) scale(0);pointer-events:none;z-index:310;animation:impact-icon-pop 0.45s ease forwards';
    ico.textContent = cfg.icon;
    layer.appendChild(ico);
    setTimeout(() => ico.remove(), 500);
  }

  // Partículas coloridas
  _spawnVfxParticles(tr.left + tr.width/2, tr.top + tr.height/2, cfg.color, cfg.particles);
  setTimeout(() => {
    _spawnVfxParticles(tr.left + tr.width/2, tr.top + tr.height/2, cfg.color2, Math.floor(cfg.particles * 0.6));
  }, 80);
}

// Move um slot do seu centro atual até próximo do alvo (para antes de encostar)
// Retorna Promise que resolve quando o movimento terminar
function _moveSlotTo(attackerSlot, targetSlot, duration=350) {
  return new Promise(resolve => {
    if (!attackerSlot || !targetSlot) { resolve(); return; }

    const ac = _elCenter(attackerSlot);
    const tc = _elCenter(targetSlot);

    // Vetor da direção
    const dx = tc.x - ac.x;
    const dy = tc.y - ac.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    // Para a 18px antes de encostar (gap visual)
    const stopDist  = Math.max(0, dist - 42);
    const ratio     = dist > 0 ? stopDist / dist : 0;
    const movX = dx * ratio;
    const movY = dy * ratio;

    // Pega o scale atual do slot
    const scale = parseFloat(attackerSlot.style.getPropertyValue('--slot-scale') || '1');

    // Eleva z-index
    attackerSlot.style.zIndex = '200';

    attackerSlot.classList.remove('jrpg-returning');
    attackerSlot.classList.add('jrpg-advancing');

    // .slot recebe apenas translate (sem scale) para não criar stacking context.
    // Scale fica no .char-avatar para preservar a camada de ícones atrás.
    void attackerSlot.offsetWidth;

    attackerSlot.style.transform =
      `translate(calc(-50% + ${movX}px), calc(-50% + ${movY}px))`;
    const advAvatar = attackerSlot.querySelector('.char-avatar');
    if(advAvatar) advAvatar.style.transform = `scale(${scale * 1.08})`;

    // Trail de partículas ao longo do movimento
    if (_vfxEnabled) {
      const r0 = attackerSlot.getBoundingClientRect();
      const startX = r0.left + r0.width / 2;
      const startY = r0.top  + r0.height / 2;
      const steps = 5;
      for (var ti = 1; ti <= steps; ti++) {
        (function(i) {
          setTimeout(function() {
            var px = startX + (movX * i / steps);
            var py = startY + (movY * i / steps);
            _spawnTrailDot(px, py);
          }, duration * i / steps);
        })(ti);
      }
    }

    setTimeout(resolve, duration);
  });
}

function _spawnTrailDot(x, y) {
  var layer = document.getElementById('vfx-layer');
  if (!layer) return;
  var dot = document.createElement('div');
  var size = 6 + Math.random() * 8;
  dot.style.cssText = 'position:absolute;left:'+x+'px;top:'+y+'px;width:'+size+'px;height:'+size+'px;border-radius:50%;background:rgba(255,255,255,0.7);box-shadow:0 0 8px rgba(255,255,255,0.9);transform:translate(-50%,-50%);pointer-events:none;z-index:250;animation:trail-dot-fade 0.35s ease forwards';
  layer.appendChild(dot);
  setTimeout(function(){ dot.remove(); }, 400);
}

// Retorna o slot para a posição original
function _returnSlot(attackerSlot, duration=350) {
  return new Promise(resolve => {
    if (!attackerSlot) { resolve(); return; }

    const scale = parseFloat(attackerSlot.style.getPropertyValue('--slot-scale') || '1');

    attackerSlot.classList.remove('jrpg-advancing');
    attackerSlot.classList.add('jrpg-returning');
    void attackerSlot.offsetWidth;

    attackerSlot.style.transform = `translate(-50%, -50%)`;
    const retAvatar = attackerSlot.querySelector('.char-avatar');
    if(retAvatar) retAvatar.style.transform = `scale(${scale})`;

    setTimeout(() => {
      attackerSlot.classList.remove('jrpg-returning');
      // Restaura z-index normal (será re-setado pelo próximo positionSlotsJRPG)
      attackerSlot.style.zIndex = '';
      resolve();
    }, duration);
  });
}

// ─────────────────────────────────────────────────────────────────────
// animCounterMove — movimento de contra-ataque/ataque conjunto
// Sem flash de nome. Avança até o alvo, impacto, volta.
// Retorna Promise que resolve após toda a sequência.
// ─────────────────────────────────────────────────────────────────────
async function animCounterMove(attacker, target) {
  const atkSlot = _findSlotEl(attacker);
  const tgtSlot = _findSlotEl(target);
  if(!atkSlot || !tgtSlot) return;

  _swapSpritePose(attacker, 'atk1');
  await _moveSlotTo(atkSlot, tgtSlot, 380);
  _swapSpritePose(attacker, 'atk2');
  _spawnImpactFx(tgtSlot, null);
  animSpriteHit(target);
  await delay(400);
  _swapSpritePose(attacker, _getIdlePose(attacker));
  await _returnSlot(atkSlot, 380);
}

// ─────────────────────────────────────────────────────────────────────
// ENTRY POINT — chame esta função antes de resolver o dano
//
//   attacker   : objeto ch do atacante
//   sk         : objeto skill
//   targets    : array de objetos ch (alvos)
//   onImpact   : function(targetCh, index) → chamado ao chegar em cada alvo
//
// Retorna Promise que resolve após toda a sequência de animação
// ─────────────────────────────────────────────────────────────────────
async function playSkillAnimation(attacker, sk, targets, onImpact) {
  _skillAnimLock = true;

  try {
    // 1) Flash do nome (1000ms total)
    await _showSkillFlash(sk, attacker);

    const atkSlot = _findSlotEl(attacker);
    if (!atkSlot) {
      for (let i = 0; i < targets.length; i++) onImpact && onImpact(targets[i], i);
      return;
    }

    // Self-cast: sem movimento, só o flash e o impacto no próprio
    if (sk.target === 'self') {
      if (onImpact) onImpact(attacker, 0);
      return;
    }

    // ── SPRITE: Pose de ataque (atk1 = preparar) ──
    _swapSpritePose(attacker, 'atk1');

    // 2) Sequência de movimento por alvo
    for (let i = 0; i < targets.length; i++) {
      const tgt    = targets[i];
      const tgtSl  = _findSlotEl(tgt);

      // Avança até o alvo (500ms)
      await _moveSlotTo(atkSlot, tgtSl, 500);

      // ── SPRITE: Pose de disparo (atk2) no momento do impacto ──
      _swapSpritePose(attacker, 'atk2');

      // Impacto: efeitos visuais + executar dano
      _spawnImpactFx(tgtSl, sk ? sk.type : null);

      // ── SPRITE: Pose de hit no alvo ──
      animSpriteHit(tgt); // fire-and-forget, roda em paralelo

      if (onImpact) onImpact(tgt, i);
      await delay(700);

      // Se há mais alvos, volta para casa antes do próximo
      if (i < targets.length - 1) {
        _swapSpritePose(attacker, 'atk1'); // volta a preparar
        await _returnSlot(atkSlot, 300);
        await delay(80);
      }
    }

    // 3) Retorno — volta ao idle/passiva
    _swapSpritePose(attacker, _getIdlePose(attacker));
    await _returnSlot(atkSlot, 400);

    // 4) Delay pós-animação — espera floats sumirem
    await delay(1500);

  } finally {
    _skillAnimLock = false;
  }
}

// Fadeout do slot ao morrer — clona o slot para fora da row (imune ao render()),
// anima por 0.9s e remove. renderSlot já retorna '' para mortos — o slot original some
// no próximo render() mas o clone ainda está visível animando.
function animDeath(ch) {
  const sl = [...document.querySelectorAll('.slot')]
    .find(s => s.querySelector('[data-char-name]')?.dataset.charName === ch.name);
  if(!sl) return;

  const field = document.getElementById('battle-field') || sl.parentElement.parentElement;
  const rect  = sl.getBoundingClientRect();
  const fRect = field.getBoundingClientRect();

  // Clona o slot como ghost absoluto no field
  const ghost = sl.cloneNode(true);
  ghost.style.position  = 'absolute';
  ghost.style.left      = (rect.left - fRect.left + rect.width  / 2) + 'px';
  ghost.style.top       = (rect.top  - fRect.top  + rect.height / 2) + 'px';
  ghost.style.width     = rect.width + 'px';
  ghost.style.transform = 'translate(-50%, -50%)';
  ghost.style.pointerEvents = 'none';
  ghost.style.zIndex    = '200';
  ghost.style.margin    = '0';
  field.appendChild(ghost);

  if (!_vfxEnabled) {
    // Versão simples
    const root = ghost.querySelector('.char-root') || ghost;
    root.style.transition = 'opacity 0.9s ease, transform 0.9s ease';
    void root.offsetWidth;
    root.style.opacity   = '0';
    root.style.transform = 'scale(0.78) translateY(10px)';
    const hpRow = ghost.querySelector('.slot-hp-row');
    if(hpRow){ hpRow.style.transition = 'opacity 0.4s'; hpRow.style.opacity = '0'; }
    setTimeout(() => { ghost.remove(); render(); }, 950);
    return;
  }

  // ── VERSÃO DRAMÁTICA ──
  const root = ghost.querySelector('.char-root') || ghost;
  const hpRow = ghost.querySelector('.slot-hp-row');
  if(hpRow) hpRow.style.opacity = '0';

  // Troca para pose hit e trava
  const spriteImg = ghost.querySelector('.sprite-img');
  if (spriteImg && SPRITE_POSES[ch.id] && SPRITE_POSES[ch.id].hit) {
    spriteImg.src = 'sprites/' + ch.id + '/' + SPRITE_POSES[ch.id].hit + '.png';
  }

  // Flash branco no ghost
  const flashDiv = document.createElement('div');
  flashDiv.style.cssText = 'position:absolute;inset:0;background:white;border-radius:inherit;z-index:10;animation:ko-flash 0.3s ease forwards;pointer-events:none';
  ghost.appendChild(flashDiv);
  setTimeout(() => flashDiv.remove(), 350);

  // Queda com rotação após pequeno delay
  setTimeout(() => {
    ghost.style.animation = 'ko-fall 0.9s ease forwards';
  }, 150);

  // Flash na tela
  var fl = document.getElementById('screen-flash-overlay');
  if (fl) {
    fl.style.transition = 'none';
    fl.style.opacity = '0.25';
    setTimeout(function() {
      fl.style.transition = 'opacity 0.4s ease';
      fl.style.opacity = '0';
    }, 60);
  }

  // Partículas explodindo do centro do slot
  var cx = rect.left + rect.width / 2;
  var cy = rect.top  + rect.height / 2;
  _spawnVfxParticles(cx, cy, '#ff4040', 12);
  _spawnVfxParticles(cx, cy, '#ffdd00', 8);
  setTimeout(function() { _spawnVfxStar(cx, cy, '#ffffff', 28, 600); }, 100);
  setTimeout(function() { _spawnVfxStar(cx - 40, cy - 30, '#ff4040', 20, 500); }, 180);
  setTimeout(function() { _spawnVfxStar(cx + 40, cy - 20, '#ffdd00', 22, 550); }, 250);

  // Contador de pontos subindo (HP eliminado)
  var layer = document.getElementById('float-layer');
  if (layer) {
    setTimeout(function() {
      var pts = document.createElement('div');
      pts.style.cssText = 'position:absolute;left:'+cx+'px;top:'+(cy-20)+'px;font-family:Cinzel,serif;font-size:32px;font-weight:900;color:#ff4040;text-shadow:0 0 20px #ff4040,0 0 50px #ff4040,0 3px 8px rgba(0,0,0,1);pointer-events:none;z-index:350;animation:ko-points 1.8s ease forwards;transform:translateX(-50%);white-space:nowrap';
      pts.textContent = '💀 K.O.!';
      layer.appendChild(pts);
      setTimeout(function() { pts.remove(); }, 1900);
    }, 200);
  }

  // Remove ghost e faz render final
  setTimeout(() => { ghost.remove(); render(); }, 1100);
}

// Flash elétrico no slot da Sam indicando que a passiva causou dano
function animSamusZap(ch) {
  document.querySelectorAll('.slot').forEach(sl => {
    if(sl.querySelector('[data-char-name]')?.dataset.charName !== ch.name) return;
    sl.classList.remove('samus-zap');
    void sl.offsetWidth; // reflow para reiniciar
    sl.classList.add('samus-zap');
    setTimeout(() => sl.classList.remove('samus-zap'), 700);
  });
  // Atualiza sprite idle/passiva baseado nas cargas
  updateIdlePose(ch);
}

// Slide do interceptor para frente do alvo
function animIntercept(interceptorCh) {
  document.querySelectorAll('.slot').forEach(sl => {
    if(sl.querySelector('[data-char-name]')?.dataset.charName !== interceptorCh.name) return;
    sl.classList.remove('intercepting');
    void sl.offsetWidth;
    sl.classList.add('intercepting');
    setTimeout(() => sl.classList.remove('intercepting'), 650);
  });
}

// Brilho de 0.5s no slot — usado em contra-ataques e ataques em conjunto
// type: 'counter' (dourado), 'together' (roxo), 'clubs' (verde paus), 'patrulheiro' (branco)
function slotFlash(ch, type='counter', duration=500) {
  const colors = {
    counter:  'rgba(255,200,50,0.95)',
    together: 'rgba(128,128,255,0.95)',
    clubs:    'rgba(80,220,120,0.95)',
    patrulheiro:   'rgba(220,220,255,0.95)',
    spades:   'rgba(80,120,255,0.95)',
    hearts:   'rgba(255,60,100,0.95)',
    diamonds: 'rgba(255,180,20,0.95)',
  };
  const color = colors[type] || colors.counter;
  document.querySelectorAll('.slot').forEach(sl => {
    if(sl.querySelector('[data-char-name]')?.dataset.charName !== ch.name) return;
    sl.style.transition = 'box-shadow 300ms ease';
    sl.style.boxShadow  = `0 0 32px 12px ${color}, 0 0 60px 20px ${color}55, inset 0 0 20px ${color}33`;
    setTimeout(() => {
      sl.style.transition = 'box-shadow 600ms ease';
      sl.style.boxShadow  = '';
      setTimeout(() => { sl.style.transition = ''; }, 600);
    }, duration);
  });
}

// Brilho de vantagem de naipe — mais intenso, mais duradouro
function slotFlashSuit(ch, type) {
  slotFlash(ch, type, 2200);
}

function showAdvTag(ch, text, color='var(--gold)') {
  _spawnFloat(ch, text, color, false, false, 'tag');
}


function showSuitAdvFlash(symbol, name, sub, colorVar) {
  return new Promise(resolve => {
    const overlay = document.getElementById('suit-adv-overlay');
    const bg      = document.getElementById('suit-adv-bg');
    const symEl   = document.getElementById('suit-adv-symbol');
    const nameEl  = document.getElementById('suit-adv-name');
    const subEl   = document.getElementById('suit-adv-sub');
    if(!overlay) { resolve(); return; }

    // Set color CSS var
    overlay.style.setProperty('--suit-color', colorVar);

    symEl.textContent  = symbol;
    nameEl.textContent = name;
    subEl.textContent  = sub;

    // Reset
    symEl.style.animation  = 'none';
    nameEl.style.opacity   = '0';
    subEl.style.opacity    = '0';
    bg.style.opacity       = '0';
    overlay.style.opacity  = '0';
    overlay.classList.add('active');

    requestAnimationFrame(() => {
      // Fade in overlay
      overlay.style.transition = 'opacity 400ms ease';
      overlay.style.opacity    = '1';
      bg.style.opacity         = '1';
      // Symbol pulse
      void symEl.offsetWidth;
      symEl.style.animation = 'suit-symbol-pulse 500ms ease forwards';
      // Name slide in after 200ms
      setTimeout(() => {
        nameEl.style.transition = 'opacity 300ms ease';
        nameEl.style.animation  = 'suit-name-in 300ms ease forwards';
        nameEl.style.opacity    = '1';
        subEl.style.transition  = 'opacity 300ms ease';
        subEl.style.opacity     = '1';
      }, 200);
    });

    // Hold 2200ms → fade out 500ms → resolve (total ~3.2s)
    setTimeout(() => {
      overlay.style.transition = 'opacity 500ms ease';
      overlay.style.opacity    = '0';
      bg.style.opacity         = '0';
      setTimeout(() => {
        overlay.classList.remove('active');
        overlay.style.opacity = '';
        resolve();
      }, 500);
    }, 2200);
  });
}

function floatAccum(ch, text, color='var(--gold)') {
  _spawnFloat(ch, text, color, false, false, 'accum');
}

// Animação de passiva: carta comprada por passiva de personagem (ex: Grimbol +2 cartas)
function floatPassiveDraw(ch, n, icon='🔧') {
  const sl = [...document.querySelectorAll('.slot')]
    .find(s => s.querySelector('[data-char-name]')?.dataset.charName === ch.name);
  if(!sl) return;
  const layer = document.getElementById('float-layer');
  if(!layer) return;
  const sr = sl.getBoundingClientRect();
  const cx = sr.left + sr.width / 2;
  const cy = sr.top + sr.height * 0.2;
  const f = document.createElement('div');
  f.className = 'card-draw-anim';
  f.style.cssText = `left:${cx}px;top:${cy}px;color:var(--gold);font-size:15px;text-shadow:0 0 12px var(--gold),0 2px 6px rgba(0,0,0,0.9)`;
  f.innerHTML = `${icon} <span style="font-size:18px;color:#ffe066">+${n}</span> carta${n>1?'s':''}`;
  f.style.animation = 'card-draw-pop 1.4s ease forwards';
  layer.appendChild(f);
  setTimeout(() => f.remove(), 1400);
}

// Animação central de compra de carta — voa para baixo (P1) ou para cima (IA)
function floatCardDrawCenter(owner, label) {
  if(!_vfxEnabled) return;
  const layer = document.getElementById('float-layer');
  if(!layer) return;
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const isP1 = owner === 'p1';
  const f = document.createElement('div');
  f.className = 'card-draw-anim';
  f.style.left = cx + 'px';
  f.style.top = cy + 'px';
  f.style.fontSize = '22px';
  f.style.color = isP1 ? '#ffe066' : '#80d8ff';
  f.style.textShadow = '0 0 18px ' + (isP1 ? 'var(--gold)' : '#40aaff') + ',0 2px 8px rgba(0,0,0,0.9)';
  f.style.zIndex = '400';
  f.style.animation = 'card-draw-center-' + (isP1 ? 'p1' : 'ia') + ' 1.1s ease forwards';
  f.innerHTML = '\uD83C\uDCCF <span style="font-size:26px;font-weight:900">' + (label || '+1 carta') + '</span>';
  layer.appendChild(f);
  setTimeout(function(){ f.remove(); }, 1100);
}

// Animação de carta de efeito usada (J/Q/K/A/★)
function floatEffectCardUsed(ch, card) {
  if (!_vfxEnabled) {
    // Versão simples quando VFX desligado
    const sl = [...document.querySelectorAll('.slot')]
      .find(s => s.querySelector('[data-char-name]')?.dataset.charName === ch.name);
    if (!sl) return;
    const layer = document.getElementById('float-layer');
    if (!layer) return;
    const sr = sl.getBoundingClientRect();
    const cx = sr.left + sr.width / 2;
    const cy = sr.top + sr.height * 0.15;
    const icons = {J:'🛡 Valete!', Q:'✨ Dama!', K:'👑 Rei!', A:'🃏 Ás!', '★':'⭐ Coringa!'};
    const colors = {J:'#80ff80', Q:'#c080ff', K:'#ffd700', A:'#60c0ff', '★':'#ff80ff'};
    const f = document.createElement('div');
    f.className = 'effect-card-anim';
    f.style.cssText = `left:${cx}px;top:${cy}px;color:${colors[card.val]||'var(--gold)'};font-size:20px;text-shadow:0 0 16px ${colors[card.val]},0 2px 8px rgba(0,0,0,0.9)`;
    f.textContent = icons[card.val] || card.val;
    f.style.animation = 'effect-card-burst 1.5s ease forwards';
    layer.appendChild(f);
    setTimeout(() => f.remove(), 1500);
    return;
  }

  // Versão espetacular
  const data = {
    J:  { sym:'🛡', name:'VALETE',  desc:'ESQUIVA TOTAL',    color:'#80ff80' },
    Q:  { sym:'✨', name:'DAMA',    desc:'REMOVE TODOS OS STATUS', color:'#c080ff' },
    K:  { sym:'👑', name:'REI',     desc:'PRÓXIMA HABILIDADE AMPLIFICADA', color:'#ffd700' },
    A:  { sym:'🃏', name:'ÁS',      desc:'CARTA EXTRA (AÇÃO RÁPIDA)', color:'#60c0ff' },
    '★':{ sym:'⭐', name:'CORINGA', desc:'RODADA EXTRA!',    color:'#ff80ff' }
  };
  const d = data[card.val];
  if (!d) return;

  const ov = document.getElementById('special-card-overlay');
  const symEl  = document.getElementById('special-card-symbol');
  const nameEl = document.getElementById('special-card-name');
  const descEl = document.getElementById('special-card-desc');
  if (!ov || !symEl) return;

  ov.style.setProperty('--sc-color', d.color);
  symEl.textContent  = d.sym;
  nameEl.textContent = d.name;
  descEl.textContent = d.desc;

  // Reset animações
  symEl.style.animation  = 'none';
  nameEl.style.animation = 'none';
  descEl.style.animation = 'none';
  ov.style.opacity = '0';
  ov.style.display = 'flex';
  void ov.offsetWidth;

  ov.style.transition = 'opacity 150ms ease';
  ov.style.opacity = '1';
  symEl.style.animation  = 'sc-symbol-in 0.5s cubic-bezier(0.2,1.4,0.4,1) forwards';
  nameEl.style.animation = 'sc-text-in 0.4s ease 0.15s both';
  descEl.style.animation = 'sc-text-in 0.4s ease 0.25s both';

  // Estrelas ao redor
  var layer = document.getElementById('vfx-layer');
  var cx = window.innerWidth / 2;
  var cy = window.innerHeight / 2;
  for (var i = 0; i < 10; i++) {
    (function(i) {
      setTimeout(function() {
        _spawnVfxStar(
          cx + (Math.random() - 0.5) * 280,
          cy + (Math.random() - 0.5) * 200,
          d.color, 20 + Math.random() * 28, 700 + Math.random() * 400
        );
      }, i * 60);
    })(i);
  }

  // Partículas
  _spawnVfxParticles(cx, cy, d.color, 14);

  // Flash na tela
  var fl = document.getElementById('screen-flash-overlay');
  if (fl) {
    fl.style.background = d.color;
    fl.style.transition = 'none';
    fl.style.opacity = '0.18';
    setTimeout(function() {
      fl.style.transition = 'opacity 0.4s ease';
      fl.style.opacity = '0';
      fl.style.background = 'white';
    }, 80);
  }

  // Hold e fade out
  setTimeout(function() {
    ov.style.transition = 'opacity 0.35s ease';
    ov.style.opacity = '0';
    setTimeout(function() { ov.style.display = 'none'; }, 350);
  }, 1300);
}

// Animação de contra-ataque (Paus Furtivo, Roupa Vermelha)
function floatCounterAttack(ch, label, color) {
  const sl = [...document.querySelectorAll('.slot')]
    .find(s => s.querySelector('[data-char-name]')?.dataset.charName === ch.name);
  if(!sl) return;
  const layer = document.getElementById('float-layer');
  if(!layer) return;
  const sr = sl.getBoundingClientRect();
  const cx = sr.left + sr.width / 2;
  const cy = sr.top + sr.height * 0.1;
  const f = document.createElement('div');
  f.className = 'counter-anim';
  f.style.cssText = `left:${cx}px;top:${cy}px;color:${color};font-size:22px;text-shadow:0 0 18px ${color},0 0 32px ${color}88,0 2px 8px rgba(0,0,0,0.9)`;
  f.textContent = label;
  f.style.animation = 'counter-burst 1.6s ease forwards';
  layer.appendChild(f);
  setTimeout(() => f.remove(), 1600);
}

// Animação de ataque conjunto (Nyxar Triste, Aeryn)
function floatJointAttack(ch, label, color) {
  const sl = [...document.querySelectorAll('.slot')]
    .find(s => s.querySelector('[data-char-name]')?.dataset.charName === ch.name);
  if(!sl) return;
  const layer = document.getElementById('float-layer');
  if(!layer) return;
  const sr = sl.getBoundingClientRect();
  const cx = sr.left + sr.width / 2;
  const cy = sr.top + sr.height * 0.1;
  const f = document.createElement('div');
  f.className = 'together-anim';
  f.style.cssText = `left:${cx}px;top:${cy}px;color:${color};font-size:19px;text-shadow:0 0 16px ${color},0 2px 8px rgba(0,0,0,0.9)`;
  f.textContent = label;
  f.style.animation = 'together-slide 1.5s ease forwards';
  layer.appendChild(f);
  setTimeout(() => f.remove(), 1500);
}

// Animação de compra de carta no início do turno (para cada jogador)
function floatTurnDraw(owner) {
  const layer = document.getElementById('float-layer');
  if(!layer) return;
  // Posição fixa: esquerda para p1, direita para p2
  const isP1 = owner === 'p1';
  const x = isP1 ? window.innerWidth * 0.22 : window.innerWidth * 0.78;
  const y = window.innerHeight * 0.45;
  const f = document.createElement('div');
  f.className = 'card-draw-anim';
  f.style.cssText = `left:${x}px;top:${y}px;color:#a0d0ff;font-size:13px;text-shadow:0 0 10px #60a0ff,0 2px 6px rgba(0,0,0,0.9)`;
  f.innerHTML = isP1 ? '🂠 +1 carta' : '🂠 CPU +1';
  f.style.animation = 'card-draw-pop 1.2s ease forwards';
  layer.appendChild(f);
  setTimeout(() => f.remove(), 1200);
}


// ══ FLOAT / ANIMATE SYSTEM ══════════════════════════════════════════════════
// Duração padrão: 0.8s com fadeout suave — mesmo sistema para player e inimigos.

// Calcula font-size baseado no valor numérico:
// ≤12 → 15px (normal), 13–30 → cresce proporcional, ≥30 → 22px (máximo)
function _floatFontSize(val) {
  const v = Math.abs(Number(val)) || 0;
  if (v <= 5)  return 22;
  if (v >= 50) return 80;
  return Math.round(22 + (v - 5) / (50 - 5) * (80 - 22));
}

// Spawna float com contagem animada: 1, 2, 3... até finalVal em ~1.1s total
// prefix: '-' para dano | suffix: '' ou ' PV' ou ' 🛡'
// Ajusta G._reactDelay para pausar o avanço do turno durante a contagem.
function _spawnFloatCount(ch, finalVal, color, prefix, suffix, shake) {
  const sl = [...document.querySelectorAll('.slot')]
    .find(s => s.querySelector('[data-char-name]')?.dataset.charName === ch.name);
  if (!sl) return;

  if (shake) {
    sl.classList.remove('hit'); void sl.offsetWidth;
    sl.classList.add('hit');
    setTimeout(() => sl.classList.remove('hit'), 500);
  }

  const layer = document.getElementById('float-layer');
  if (!layer) return;

  const sr = sl.getBoundingClientRect();
  const cx = sr.left + sr.width  / 2;
  const cy = sr.top  + sr.height * 0.3;

  const existing = [...layer.querySelectorAll('.fdmg')].filter(el => {
    return Math.abs(parseFloat(el.style.left) - cx) < 50;
  }).length;
  const spawnY = Math.max(60, cy - existing * 18);

  const f = document.createElement('div');
  f.className = 'fdmg';

  const mkShadow = (fs) => `0 2px 12px rgba(0,0,0,1),0 0 ${fs > 40 ? 50 : fs > 22 ? 30 : 16}px ${color},0 0 ${fs > 40 ? 90 : fs > 22 ? 60 : 32}px ${color}88,0 0 ${fs > 40 ? 140 : fs > 22 ? 90 : 48}px ${color}44`;
  const base = `position:absolute;left:${cx}px;top:${spawnY}px;pointer-events:none;z-index:300;transition:font-size 0.08s ease`;

  const startFs = _floatFontSize(Math.min(1, finalVal));
  f.style.cssText = `${base};color:${color};font-size:${startFs}px;text-shadow:${mkShadow(startFs)}`;
  f.textContent = prefix + Math.min(1, finalVal) + suffix;
  layer.appendChild(f);

  // Duração total da contagem: 600ms — rápido o suficiente para ler
  const TOTAL_MS   = 900;
  const FADEOUT_MS = 800;
  const steps      = Math.max(1, finalVal - 1);
  const stepMs     = steps > 1 ? TOTAL_MS / steps : TOTAL_MS;

  // Pausa o avanço do turno pelo tempo da contagem + fadeout
  if (typeof G !== 'undefined') {
    const needed = TOTAL_MS + FADEOUT_MS;
    if (!G._reactDelay || G._reactDelay < needed) G._reactDelay = needed;
  }

  if (finalVal <= 1) {
    const isBig = finalVal >= 20;
    const anim = isBig ? 'fup-big' : 'fup';
    const dur  = isBig ? '2.0s' : '1.2s';
    f.style.animation = `${anim} ${dur} ease forwards`;
    setTimeout(() => f.remove(), FADEOUT_MS);
    return;
  }

  let current = 1;
  const interval = setInterval(() => {
    current++;
    const fs = _floatFontSize(current);
    f.style.fontSize = fs + 'px';
    f.style.textShadow = mkShadow(fs);
    f.textContent = prefix + current + suffix;

    if (current >= finalVal) {
      clearInterval(interval);
      const isBig = finalVal >= 20;
      const anim = isBig ? 'fup-big' : 'fup';
      const dur  = isBig ? '2.0s' : '1.2s';
      f.style.animation = `${anim} ${dur} ease forwards`;
      setTimeout(() => f.remove(), FADEOUT_MS);
    }
  }, stepMs);

  // Safety: remove o elemento se travar
  setTimeout(() => { clearInterval(interval); f.remove(); }, TOTAL_MS + FADEOUT_MS + 200);
}

function _spawnVfxStar(x, y, color, size, dur) {
  var layer = document.getElementById('vfx-layer');
  if (!layer) return;
  var el = document.createElement('div');
  var rot = Math.random() * 360;
  el.style.cssText = 'position:absolute;left:'+x+'px;top:'+y+'px;font-size:'+size+'px;color:'+color+';text-shadow:0 0 12px '+color+',0 0 24px '+color+';transform-origin:center;animation:vfx-star-spin '+dur+'ms ease forwards;pointer-events:none';
  el.textContent = ['★','✦','✧','⭐','💥','✨'][Math.floor(Math.random()*6)];
  layer.appendChild(el);
  setTimeout(function(){ el.remove(); }, dur + 100);
}

function _spawnVfxParticles(cx, cy, color, count) {
  var layer = document.getElementById('vfx-layer');
  if (!layer) return;
  for (var i = 0; i < count; i++) {
    var el = document.createElement('div');
    var angle = (i / count) * Math.PI * 2;
    var dist = 80 + Math.random() * 120;
    var px = Math.cos(angle) * dist;
    var py = Math.sin(angle) * dist;
    var size = 6 + Math.random() * 10;
    var dur = 500 + Math.random() * 400;
    el.style.cssText = 'position:absolute;left:'+cx+'px;top:'+cy+'px;width:'+size+'px;height:'+size+'px;border-radius:50%;background:'+color+';box-shadow:0 0 8px '+color+';--px:'+px+'px;--py:'+py+'px;animation:vfx-particle-out '+dur+'ms ease forwards;pointer-events:none';
    layer.appendChild(el);
    setTimeout(function(e){ return function(){ e.remove(); }; }(el), dur + 100);
  }
}

function _spawnVfxMegaPulse(cx, cy, color) {
  var layer = document.getElementById('vfx-layer');
  if (!layer) return;
  var el = document.createElement('div');
  el.style.cssText = 'position:absolute;left:'+cx+'px;top:'+cy+'px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,'+color+'cc 0%,'+color+'44 40%,transparent 70%);transform-origin:center;animation:vfx-mega-pulse 0.8s ease forwards;pointer-events:none';
  layer.appendChild(el);
  setTimeout(function(){ el.remove(); }, 900);
}

function _screenShake(dmg, slotEl) {
  if (!_vfxEnabled) return;
  var el = document.getElementById('screen-game');
  var fl = document.getElementById('screen-flash-overlay');
  if (!el) return;

  // Nível do efeito
  var lvl = dmg >= 50 ? 4 : dmg >= 40 ? 3 : dmg >= 30 ? 2 : 1;

  // Shake
  var cls = lvl >= 3 ? 'screen-shake-insane' : lvl === 2 ? 'screen-shake-heavy' : 'screen-shake-med';
  var dur = lvl >= 3 ? 750 : lvl === 2 ? 600 : 450;
  el.classList.remove('screen-shake-med','screen-shake-heavy','screen-shake-insane');
  void el.offsetWidth;
  el.classList.add(cls);
  setTimeout(function(){ el.classList.remove(cls); }, dur);
  if (lvl >= 3) {
    setTimeout(function(){
      el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
      setTimeout(function(){ el.classList.remove(cls); }, dur);
    }, dur - 100);
  }

  // Flash branco
  if (fl) {
    var opacity = lvl === 4 ? 0.55 : lvl === 3 ? 0.38 : lvl === 2 ? 0.22 : 0.12;
    fl.style.transition = 'none';
    fl.style.opacity = opacity;
    setTimeout(function(){
      fl.style.transition = 'opacity '+(lvl >= 3 ? '0.6s' : '0.35s')+' ease';
      fl.style.opacity = '0';
    }, 80);
  }

  // Centro da tela para efeitos
  var cx = window.innerWidth / 2;
  var cy = window.innerHeight / 2;

  // Cores por nível
  var colors = ['#ff4040','#ff8820','#ffdd00','#ffffff'];
  var cor = colors[lvl - 1];

  // Nível 2+: partículas
  if (lvl >= 2) {
    _spawnVfxParticles(cx, cy, cor, lvl >= 3 ? 16 : 10);
  }

  // Nível 3+: estrelas
  if (lvl >= 3) {
    var starCount = lvl >= 4 ? 12 : 7;
    for (var i = 0; i < starCount; i++) {
      (function(i){
        setTimeout(function(){
          var sx = cx + (Math.random() - 0.5) * 300;
          var sy = cy + (Math.random() - 0.5) * 300;
          var size = lvl >= 4 ? 24 + Math.random() * 28 : 16 + Math.random() * 20;
          _spawnVfxStar(sx, sy, cor, size, 600 + Math.random() * 400);
        }, i * 60);
      })(i);
    }
  }

  // Nível 4 (MEGA): pulso central + estrelas extras brancas
  if (lvl >= 4) {
    _spawnVfxMegaPulse(cx, cy, '#ffffff');
    setTimeout(function(){ _spawnVfxMegaPulse(cx, cy, cor); }, 150);
    for (var j = 0; j < 6; j++) {
      (function(j){
        setTimeout(function(){
          var sx = cx + (Math.random() - 0.5) * 200;
          var sy = cy + (Math.random() - 0.5) * 200;
          _spawnVfxStar(sx, sy, '#ffffff', 32 + Math.random() * 24, 800);
        }, j * 80);
      })(j);
    }
  }
}

function _animPassTurn(ch) {
  var layer = document.getElementById('vfx-layer');
  var sl = [...document.querySelectorAll('.slot')]
    .find(s => s.querySelector('[data-char-name]')?.dataset.charName === ch.name);
  if (!sl) return;

  var sr = sl.getBoundingClientRect();
  var cx = sr.left + sr.width / 2;
  var cy = sr.top + sr.height * 0.3;

  // Pulso dourado no slot
  sl.style.transition = 'box-shadow 0.2s ease';
  sl.style.boxShadow = '0 0 20px rgba(201,168,76,0.8), 0 0 40px rgba(201,168,76,0.4)';
  setTimeout(function() {
    sl.style.boxShadow = '';
    sl.style.transition = '';
  }, 600);

  if (!layer) return;

  // Ícones flutuando: carta + energia
  var icons = ['🃏', '✨', '💫', '⚡'];
  icons.forEach(function(icon, i) {
    setTimeout(function() {
      var el = document.createElement('div');
      var ox = (Math.random() - 0.5) * 60;
      var oy = cy - 20 - Math.random() * 30;
      el.style.cssText = 'position:absolute;left:'+(cx+ox)+'px;top:'+oy+'px;font-size:'+(18+Math.random()*14)+'px;opacity:0;pointer-events:none;z-index:300;animation:fup 1.2s ease forwards;transform:translateX(-50%)';
      el.textContent = icon;
      layer.appendChild(el);
      setTimeout(function() { el.remove(); }, 1300);
    }, i * 100);
  });

  // Texto "RECUPERANDO..." acima do personagem
  var txt = document.createElement('div');
  txt.style.cssText = 'position:absolute;left:'+cx+'px;top:'+(cy-50)+'px;font-family:Cinzel,serif;font-size:11px;letter-spacing:2px;color:var(--gold);text-shadow:0 0 10px var(--gold);pointer-events:none;z-index:300;animation:fup 1.4s ease forwards;transform:translateX(-50%);white-space:nowrap';
  txt.textContent = '↩ PASSANDO TURNO';
  layer.appendChild(txt);
  setTimeout(function() { txt.remove(); }, 1500);
}

function _animCritico(target, isSpades) {
  var color  = isSpades ? '#6080ff' : '#ff2020';
  var icon   = isSpades ? '♠' : '💥';
  var cx = window.innerWidth / 2;
  var cy = window.innerHeight / 2;

  // Flash total na tela
  var fl = document.getElementById('screen-flash-overlay');
  if (fl) {
    fl.style.background = isSpades ? '#4060cc' : 'white';
    fl.style.transition = 'none';
    fl.style.opacity = isSpades ? '0.30' : '0.45';
    setTimeout(function() {
      fl.style.transition = 'opacity 0.5s ease';
      fl.style.opacity = '0';
      fl.style.background = 'white';
    }, 80);
  }

  // Ícone gigante com número interno
  var layer = document.getElementById('float-layer');
  if (layer) {
    var wrap = document.createElement('div');
    wrap.id = '_crit_wrap_' + target.name.replace(/\s/g,'');
    wrap.style.cssText = [
      'position:absolute',
      'left:'+cx+'px',
      'top:'+(cy-10)+'px',
      'transform:translateX(-50%)',
      'pointer-events:none',
      'z-index:9998',
      'display:flex',
      'flex-direction:column',
      'align-items:center',
      'animation:ko-points 2.0s cubic-bezier(0.2,1.4,0.4,1) forwards'
    ].join(';');

    // Ícone grande
    var iconEl = document.createElement('div');
    iconEl.style.cssText = 'font-size:clamp(70px,20vw,120px);line-height:1;filter:drop-shadow(0 0 20px '+color+') drop-shadow(0 0 50px '+color+');';
    iconEl.textContent = icon;
    wrap.appendChild(iconEl);

    // Número dentro — começa em 0
    var numEl = document.createElement('div');
    numEl.id = '_crit_num_' + target.name.replace(/\s/g,'');
    numEl.style.cssText = [
      'font-family:Cinzel,serif',
      'font-size:clamp(28px,8vw,52px)',
      'font-weight:900',
      'color:'+color,
      'text-shadow:0 0 20px '+color+',0 0 50px '+color+',0 3px 10px rgba(0,0,0,1)',
      'letter-spacing:3px',
      'margin-top:-10px'
    ].join(';');
    numEl.textContent = '0';
    wrap.appendChild(numEl);

    layer.appendChild(wrap);
    setTimeout(function() { wrap.remove(); }, 2200);
  }

  // Shake
  _screenShake(isSpades ? 32 : 38);

  // Estrelas
  for (var i = 0; i < 10; i++) {
    (function(i) {
      setTimeout(function() {
        _spawnVfxStar(
          cx + (Math.random() - 0.5) * 260,
          cy + (Math.random() - 0.5) * 200,
          i % 2 === 0 ? color : '#ffffff',
          18 + Math.random() * 24, 500 + Math.random() * 400
        );
      }, i * 50);
    })(i);
  }
  _spawnVfxParticles(cx, cy, color, 16);
}

function floatDmg(ch, dmg, tipo) {
  var cor = '#ff4040';
  if (tipo === 'Fogo')                              cor = '#ff6020';
  else if (tipo === 'Frio')                         cor = '#80e8ff';
  else if (tipo === 'Eletrico' || tipo === 'Elétrico') cor = '#60c8ff';
  else if (tipo === 'Energia' || tipo === 'Magico' || tipo === 'Mágico') cor = '#c060ff';
  else if (tipo === 'Cortante' || tipo === 'Perfurante') cor = '#ffcc00';
  else if (tipo === 'Quimico' || tipo === 'Químico') cor = '#80ff80';

  // Crítico ou Espadas: preenche o número dentro do ícone gigante
  var isCritAnim = ch._nextDmgIsCritico || ch._nextDmgIsSpades;
  if (isCritAnim) {
    var numId = '_crit_num_' + ch.name.replace(/\s/g,'');
    var numEl = document.getElementById(numId);
    if (numEl) {
      // Contagem animada dentro do ícone
      var current = 0;
      var steps = Math.max(1, dmg);
      var stepMs = Math.min(900 / steps, 60);
      var interval = setInterval(function() {
        current = Math.min(current + 1, dmg);
        numEl.textContent = current;
        if (current >= dmg) clearInterval(interval);
      }, stepMs);
    }
    ch._nextDmgIsCritico = false;
    ch._nextDmgIsSpades  = false;
    // Ainda faz o float normal mas menor e sem emoji
    _spawnFloatCount(ch, dmg, cor, '-', '', true);
  } else {
    _spawnFloatCount(ch, dmg, cor, '-', '', true);
  }

  _animHpBar(ch);
  if (!_skillAnimLock) animSpriteHit(ch);
  if (dmg >= 20) _screenShake(dmg);
}

function floatHeal(ch, val) {
  _spawnFloatCount(ch, val, '#33dd66', '+', ' PV', false);
  _animHpBar(ch);
}

function floatArmor(ch, val, lose=false) {
  if (!lose) {
    _spawnFloatCount(ch, val, '#55bbff', '+', ' 🛡', false);
    _animHpBar(ch);
  } else {
    _spawnFloatCount(ch, val, '#e08020', '-🛡', '', false);
    _animHpBar(ch);
  }
}

function floatStatus(ch, text, color='#e0c060') {
  _spawnFloat(ch, text, color, false, false);
}

// Float do nome do personagem ativo — aparece e vai em direção ao slot
function floatActorName(ch) {
  const sl = [...document.querySelectorAll('.slot')]
    .find(s => s.querySelector('[data-char-name]')?.dataset.charName === ch.name);
  if (!sl) return;

  const layer = document.getElementById('float-layer');
  if (!layer) return;

  const sr = sl.getBoundingClientRect();
  const cx = sr.left + sr.width / 2;
  const cy = sr.top + sr.height * 0.2;

  const f = document.createElement('div');
  f.className = 'fdmg';
  f.style.cssText = `position:absolute;left:${cx}px;top:${cy - 40}px;pointer-events:none;z-index:310;` +
    `color:#C9A84C;font-size:14px;font-weight:900;font-family:'Cinzel',serif;letter-spacing:2px;` +
    `text-shadow:0 2px 8px rgba(0,0,0,1),0 0 20px #C9A84C,0 0 40px #C9A84C55;` +
    `animation:fup 1.4s ease forwards;white-space:nowrap;transform:translateX(-50%)`;
  f.textContent = '⚔ ' + ch.name.toUpperCase();
  layer.appendChild(f);
  setTimeout(() => f.remove(), 3000);
}

function floatIndicator(ch, text, color, shake=false) {
  _spawnFloat(ch, text, color, shake, false);
}

// Spawna texto flutuante no slot do personagem.
// Appendado ao #float-layer (position:absolute) — imune a render() e overflow:hidden.
// type: 'dmg' (padrão) | 'tag' (badge colorido) | 'accum' (texto dourado maior)
function _spawnFloat(ch, text, color, shake, big, type='dmg', fontSize=null) {
  const sl = [...document.querySelectorAll('.slot')]
    .find(s => s.querySelector('[data-char-name]')?.dataset.charName === ch.name);
  if (!sl) return;

  if (shake) {
    sl.classList.remove('hit'); void sl.offsetWidth;
    sl.classList.add('hit');
    setTimeout(() => sl.classList.remove('hit'), 700);
  }

  const layer = document.getElementById('float-layer');
  if (!layer) return;

  // Coordenadas do viewport (compatível com position:absolute)
  const sr = sl.getBoundingClientRect();
  const cx = sr.left + sr.width  / 2;   // centro horizontal do slot
  const cy = sr.top  + sr.height * 0.3; // 30% do topo = região do avatar

  // Empilha floats existentes para não sobrepor
  const existing = [...layer.querySelectorAll('.fdmg')].filter(el => {
    return Math.abs(parseFloat(el.style.left) - cx) < 50;
  }).length;

  const spawnY = Math.max(60, cy - existing * 22);

  const f = document.createElement('div');
  f.className = 'fdmg';

  const shadow = `0 2px 8px rgba(0,0,0,1),0 0 16px ${color},0 0 32px ${color}55`;
  const anim   = big ? 'fup-big' : 'fup';

  const base = `position:absolute;left:${cx}px;top:${spawnY}px;pointer-events:none;z-index:300`;

  if (type === 'tag') {
    f.style.cssText = `${base};background:${color};color:#000;font-size:11px;padding:3px 8px;border-radius:10px;font-weight:900;letter-spacing:0.5px;box-shadow:0 2px 8px rgba(0,0,0,0.9),0 0 12px ${color}88;animation:fup 1.2s ease forwards`;
  } else if (type === 'accum') {
    f.style.cssText = `${base};color:${color};font-size:16px;font-weight:900;text-shadow:0 2px 8px rgba(0,0,0,1),0 0 16px ${color};animation:fup 1.2s ease forwards`;
  } else {
    const fs = fontSize != null ? fontSize : (big ? 22 : 15);
    f.style.cssText = `${base};color:${color};font-size:${fs}px;text-shadow:${shadow};animation:${anim} 0.9s ease forwards`;
  }

  f.textContent = text;
  layer.appendChild(f);
  setTimeout(() => f.remove(), 3000);
}

// Executa fn(target) para cada alvo em sequência, com intervalo de 550ms entre cada um.
// Retorna Promise que resolve quando todos foram executados.
function floatSeq(targets, fn, delay=550) {
  return targets.reduce((p, t, i) => {
    return p.then(() => new Promise(resolve => {
      setTimeout(() => { fn(t); resolve(); }, i === 0 ? 0 : delay);
    }));
  }, Promise.resolve());
}

// Anima a barra de HP e o overlay de escudo via rAF
// Funciona mesmo com innerHTML: lê o valor atual do DOM e anima até o novo
function _animHpBar(ch) {
  const sl = [...document.querySelectorAll('.slot')]
    .find(s => s.querySelector('[data-char-name]')?.dataset.charName === ch.name);
  if (!sl) return;

  const fill = sl.querySelector('.hp-fill');
  const hpCur = sl.querySelector('.hp-cur');
  if (!fill) return;

  // ── HP bar ────────────────────────────────────────────────
  const targetPct = Math.max(0, ch.hp / ch.maxHp) * 100;
  const startPct  = parseFloat(fill.style.width) || targetPct;
  const targetCol = hpColor(ch.hp / ch.maxHp);
  const t0 = performance.now();
  const dur = 380;

  function stepHp(now) {
    const t = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - t, 3);
    fill.style.width  = (startPct + (targetPct - startPct) * e) + '%';
    fill.style.background = targetCol;
    if (t < 1) requestAnimationFrame(stepHp);
    else fill.style.width = targetPct + '%';
  }
  requestAnimationFrame(stepHp);

  // Atualiza número de HP no slot
  const hpNum = sl.querySelector('.hp-num');
  if (hpNum && hpNum !== fill) { hpNum.textContent = ch.hp; hpNum.style.color = targetCol; }
  if (hpCur) { hpCur.textContent = ch.hp; hpCur.style.color = targetCol; }

  // ── Shield overlay ────────────────────────────────────────
  const shieldSt = ch.statuses.find(s => s.id === 'shield');
  const targetSh  = shieldSt && shieldSt.val > 0
    ? Math.min(100, shieldSt.val / ch.maxHp * 100) : 0;

  let shLayer = sl.querySelector('.hp-shield-layer');

  if (targetSh > 0 && !shLayer) {
    // Cria o overlay se não existir
    shLayer = document.createElement('div');
    shLayer.className = 'hp-shield-layer';
    shLayer.style.width = '0%';
    sl.querySelector('.hp-bar').appendChild(shLayer);
  }

  if (shLayer) {
    const startSh = parseFloat(shLayer.style.width) || 0;
    const t1 = performance.now();

    function stepSh(now) {
      const t = Math.min(1, (now - t1) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      shLayer.style.width = (startSh + (targetSh - startSh) * e) + '%';
      if (t < 1) requestAnimationFrame(stepSh);
      else {
        shLayer.style.width = targetSh + '%';
        if (targetSh === 0) shLayer.remove();
      }
    }
    requestAnimationFrame(stepSh);
  }
}

// ===================== SELECT SCREEN =====================
function renderSelectP1() {
